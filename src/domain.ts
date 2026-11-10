export type Language = 'en' | 'he'
export type Bilingual = Record<Language, string>
export interface Listing {
  id: string
  name: Bilingual
  art: string
  category: Bilingual
  ask: number
  stats: Bilingual
  slots: number | null
  channel: number
  room: number
  seller: string
  venue: 'FM'
  observedAt: string
  sales: { date: string; price: number }[]
}
export interface Snapshot {
  kind: 'demo'
  observedAt: string
  listings: Listing[]
}
export interface Profile {
  name: string
  job: string
  level: number
  updated: string
}
export interface Position {
  id: string
  name: string
  qty: number
  cost: number
  value: number
  sold: boolean
}
export const assumedFee = 0.03
export function percentile(numbers: number[], quantile: number) {
  if (!numbers.length) return null
  const sorted = [...numbers].sort((a, b) => a - b)
  const index = (sorted.length - 1) * quantile
  return (
    sorted[Math.floor(index)] +
    (sorted[Math.ceil(index)] - sorted[Math.floor(index)]) * (index % 1)
  )
}
export function recentSales(item: Listing, days = 7) {
  const end = Date.parse(item.observedAt.slice(0, 10))
  return item.sales.filter(
    (sale) =>
      Date.parse(sale.date) <= end &&
      Date.parse(sale.date) > end - days * 86400000,
  )
}
export function valuation(item: Listing) {
  const sales = recentSales(item).map((s) => s.price)
  const median = percentile(sales, 0.5)
  const profit =
    median === null ? null : Math.round(median * (1 - assumedFee) - item.ask)
  return {
    median,
    profit,
    margin: profit === null || item.ask <= 0 ? null : profit / item.ask,
    volume: sales.length,
    low: percentile(sales, 0.25),
    high: percentile(sales, 0.75),
    confidence:
      sales.length >= 20 ? 'high' : sales.length >= 10 ? 'medium' : 'low',
  }
}
export function dailyMedians(item: Listing, days: number) {
  const byDay = new Map<string, number[]>()
  for (const sale of recentSales(item, days)) {
    const group = byDay.get(sale.date) ?? []
    group.push(sale.price)
    byDay.set(sale.date, group)
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, prices]) => ({ date, value: percentile(prices, 0.5)! }))
}
export function huntEstimate(
  kills: number,
  xp: number,
  mesos: number,
  chance: number,
  value: number,
  potions: number,
) {
  return {
    xp: kills * xp,
    mesos: kills * (mesos + (chance / 100) * value) - potions,
  }
}
export function scrollEstimate(
  chance: number,
  attempts: number,
  gain: number,
  cost: number,
) {
  const p = chance / 100
  return {
    atLeastOne: 1 - Math.pow(1 - p, attempts),
    expectedNet: attempts * (p * gain - cost),
  }
}
export function potionEfficiency(price: number, restored: number) {
  return restored > 0 ? price / restored : null
}
export function positionProfit(p: Position) {
  return p.qty * (p.value - p.cost)
}
export function stale(timestamp: string, now = Date.now(), maxAgeHours = 24) {
  const age = now - Date.parse(timestamp)
  return !Number.isFinite(age) || age > maxAgeHours * 3600000
}
