import { percentile, type Listing } from './domain'
export interface Variant {
  itemId: string
  version: string
  world: string
  unit: string
  stats: string
  slots: number | null
}
export interface Sale {
  variant: Variant
  price: number
  at: string
  venue: 'FM'
  kind: 'demo' | 'observed'
}
export interface Quote extends Sale {
  channel: number
  room: number
  seller: string
}
export interface MarketFeed {
  source: string
  read(
    signal: AbortSignal,
  ): Promise<
    | { status: 'disabled'; reason: string }
    | { status: 'ready'; fetchedAt: string; quotes: Quote[]; sales: Sale[] }
  >
}
export const verifiedMarket: MarketFeed = {
  source: 'https://mesos.watch/api',
  async read() {
    return {
      status: 'disabled',
      reason: 'No authorized free listings and sales feed.',
    }
  },
}
function comparable(a: Variant, b: Variant) {
  return (
    a.itemId === b.itemId &&
    a.version === b.version &&
    a.world === b.world &&
    a.unit === b.unit &&
    a.stats === b.stats &&
    a.slots === b.slots
  )
}
export function analyzeQuote(
  quote: Quote,
  sales: Sale[],
  asOf: number,
  fee: number,
) {
  const end = Date.parse(quote.at.slice(0, 10)),
    day = 86400000
  const prices = sales
    .filter(
      (s) =>
        s.kind === quote.kind &&
        s.venue === 'FM' &&
        comparable(s.variant, quote.variant) &&
        Number.isFinite(s.price) &&
        s.price >= 0 &&
        Date.parse(s.at) <= Date.parse(quote.at) &&
        Date.parse(s.at) >= end - 6 * day,
    )
    .map((s) => s.price)
  const median = percentile(prices, 0.5),
    mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const volatility =
    mean > 0
      ? Math.sqrt(
          prices.reduce((s, v) => s + (v - mean) ** 2, 0) / prices.length,
        ) / mean
      : null
  const ageHours = Math.max(0, (asOf - Date.parse(quote.at)) / 3600000)
  const liquidity = Math.round(100 * Math.min(1, prices.length / 28))
  const confidence = Math.round(
    (liquidity * Math.max(0, 1 - ageHours / 24)) / (1 + (volatility ?? 1)),
  )
  return {
    median,
    volume: prices.length,
    gross: median === null ? null : median - quote.price,
    net: median === null ? null : Math.round(median * (1 - fee) - quote.price),
    volatility,
    ageHours,
    liquidity,
    confidence,
  }
}
export function analyzeDemo(item: Listing, asOf: number, fee: number) {
  const variant = {
    itemId: item.id,
    world: 'demo',
    version: 'scenario-v1',
    unit: item.id === 'throwing-stars' ? 'set' : 'unit',
    stats: item.stats.en,
    slots: item.slots,
  }
  const shared = { variant, venue: 'FM' as const, kind: 'demo' as const }
  return analyzeQuote(
    {
      ...shared,
      price: item.ask,
      at: item.observedAt,
      room: item.room,
      seller: item.seller,
      channel: item.channel,
    },
    item.sales.map((s) => ({ ...shared, price: s.price, at: s.date })),
    asOf,
    fee,
  )
}
