import type { Listing, Snapshot, Bilingual } from './domain'
export const demoUrl = '/data/market-demo.json'
interface DisabledSource {
  name: string
  url: string
  status: 'disabled'
  reason: Bilingual
}
export const disabledSources: Record<
  'market' | 'drops' | 'quests',
  DisabledSource[]
> = {
  market: [
    {
      name: 'mesos.watch',
      url: 'https://mesos.watch/api',
      status: 'disabled',
      reason: {
        en: 'The listings API requires a paid plan.',
        he: 'הגישה לממשק ההצעות דורשת מנוי בתשלום.',
      },
    },
    {
      name: 'Cozy Market',
      url: 'https://cozy.markets/',
      status: 'disabled',
      reason: {
        en: 'A free API and permission to reuse listings have not been established.',
        he: 'טרם אומתו ממשק חינמי והרשאה לשימוש חוזר בהצעות.',
      },
    },
  ],
  drops: [
    {
      name: 'MaplelandHub',
      url: 'https://maplelandhub.com/terms',
      status: 'disabled',
      reason: {
        en: 'No licensed export feed was identified. Published reference rates may describe older versions.',
        he: 'לא אותר מקור מורשה לייצוא. שיעורי הייחוס עשויים לתאר גרסאות ישנות.',
      },
    },
  ],
  quests: [
    {
      name: 'MapleClassic Wiki',
      url: 'https://mapleclassic.wiki/wiki/MapleWiki:About',
      status: 'disabled',
      reason: {
        en: 'A reference import requires per-page attribution and share-alike license tracking.',
        he: 'ייבוא מחייב ייחוס לכל דף ומעקב אחר רישיון שיתוף זהה.',
      },
    },
  ],
}
const pair = (value: unknown): value is Bilingual =>
  !!value &&
  typeof value === 'object' &&
  'en' in value &&
  typeof value.en === 'string' &&
  'he' in value &&
  typeof value.he === 'string'
function listing(value: unknown): value is Listing {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<Listing>
  return (
    typeof row.id === 'string' &&
    pair(row.name) &&
    pair(row.category) &&
    pair(row.stats) &&
    row.venue === 'FM' &&
    typeof row.ask === 'number' &&
    row.ask > 0 &&
    typeof row.seller === 'string' &&
    typeof row.channel === 'number' &&
    typeof row.room === 'number' &&
    (row.slots === null || typeof row.slots === 'number') &&
    ['glove', 'stars', 'scroll', 'potion'].includes(row.art ?? '') &&
    Number.isFinite(Date.parse(row.observedAt ?? '')) &&
    Array.isArray(row.sales) &&
    row.sales.every(
      (s) =>
        s &&
        Number.isFinite(s.price) &&
        s.price >= 0 &&
        Number.isFinite(Date.parse(s.date)),
    )
  )
}
export async function demoMarket(signal: AbortSignal): Promise<Snapshot> {
  const response = await fetch(demoUrl, { signal })
  if (!response.ok) throw new Error('snapshot')
  const data = await response.json()
  if (
    data?.kind !== 'demo' ||
    !Number.isFinite(Date.parse(data.observedAt)) ||
    !Array.isArray(data.listings) ||
    !data.listings.every(listing)
  )
    throw new Error('snapshot')
  return data
}
export interface Ranking {
  name: string
  level: number
  job: string | null
  observedAt: string | null
  fetchedAt: string
  url: string
  rank: number | null
}
export class LookupError extends Error {
  constructor(
    public reason: 'missing' | 'limited' | 'unavailable',
    public retryAfter = 0,
  ) {
    super(reason)
  }
}
export async function lookup(
  name: string,
  signal: AbortSignal,
): Promise<Ranking> {
  if (['', '.', '..'].includes(name.trim())) throw new LookupError('missing')
  const url = new URL(
    '/api/v1/characters/' + encodeURIComponent(name.trim()),
    'https://classicrank.com',
  )
  url.searchParams.set(
    'fields',
    'name,level,job,last_checked,profile_url,overall_rank',
  )
  const response = await fetch(url, {
    signal,
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  })
  if (response.status === 404) throw new LookupError('missing')
  if (response.status === 429) {
    const header = response.headers.get('Retry-After')
    const delay =
      header && /^\d+$/.test(header)
        ? Number(header)
        : Math.ceil((Date.parse(header ?? '') - Date.now()) / 1000)
    throw new LookupError(
      'limited',
      Number.isFinite(delay) && delay >= 0 ? Math.max(1, delay) : 60,
    )
  }
  if (!response.ok) throw new LookupError('unavailable')
  const data = (await response.json())?.data
  if (
    !data ||
    typeof data.name !== 'string' ||
    !Number.isInteger(data.level) ||
    (data.job != null && typeof data.job !== 'string')
  )
    throw new LookupError('unavailable')
  let profile = 'https://classicrank.com/'
  if (typeof data.profile_url === 'string') {
    const candidate = new URL(data.profile_url, profile)
    if (candidate.origin === 'https://classicrank.com') profile = candidate.href
  }
  return {
    name: data.name,
    level: data.level,
    job: data.job ?? null,
    rank: Number.isInteger(data.overall_rank) ? data.overall_rank : null,
    observedAt:
      data.last_checked && Number.isFinite(Date.parse(data.last_checked))
        ? data.last_checked
        : null,
    fetchedAt: new Date().toISOString(),
    url: profile,
  }
}
