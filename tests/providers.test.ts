import { afterEach, describe, expect, it, vi } from 'vitest'
import demo from '../public/data/market-demo.json'
import { demoMarket, lookup } from '../src/providers'
const signal = new AbortController().signal
function respond(
  body: unknown,
  status = 200,
  headers?: Record<string, string>,
) {
  const f = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(body), { status, headers }))
  vi.stubGlobal('fetch', f)
  return f
}
afterEach(() => vi.unstubAllGlobals())
describe('provider boundaries', () => {
  it('loads explicitly labeled local FM records', async () => {
    respond(demo)
    expect((await demoMarket(signal)).listings.length).toBe(
      demo.listings.length,
    )
  })
  it('handles empty authorized shapes without creating listings', async () => {
    respond({ ...demo, listings: [] })
    expect((await demoMarket(signal)).listings).toEqual([])
  })
  it.each(['TM', 'NPC', 'Map'])(
    'rejects %s listings in the FM contract',
    async (venue) => {
      respond({ ...demo, listings: [{ ...demo.listings[0], venue }] })
      await expect(demoMarket(signal)).rejects.toThrow()
    },
  )
  it('rejects a relabeled fixture or invalid data', async () => {
    respond({ ...demo, kind: 'verified' })
    await expect(demoMarket(signal)).rejects.toThrow()
    respond({ ...demo, listings: [null] })
    await expect(demoMarket(signal)).rejects.toThrow()
  })
  it('keeps dot segments from resolving to a different API endpoint', async () => {
    const fetcher = respond({})
    await expect(lookup('..', signal)).rejects.toMatchObject({
      reason: 'missing',
    })
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('keeps fetch time and provider observation time separate', async () => {
    const f = respond({
      data: {
        name: 'UnitTest',
        level: 12,
        job: null,
        last_checked: '2020-01-02T00:00:00Z',
        overall_rank: 0,
        profile_url: '/user/UnitTest',
      },
    })
    const r = await lookup('A/B', signal)
    expect(String(f.mock.calls[0][0])).toContain('/characters/A%2FB?fields=')
    expect(r).toMatchObject({
      job: null,
      rank: 0,
      url: 'https://classicrank.com/user/UnitTest',
      observedAt: '2020-01-02T00:00:00Z',
    })
    expect(Date.parse(r.fetchedAt)).toBeGreaterThan(Date.parse(r.observedAt!))
  })
  it('restricts externally supplied profile links to the provider origin', async () => {
    respond({
      data: {
        name: 'UnitTest',
        job: null,
        level: 1,
        profile_url: 'https://example.org/',
      },
    })
    expect((await lookup('UnitTest', signal)).url).toBe(
      'https://classicrank.com/',
    )
  })
  it('preserves missing, rate limit, malformed and outage states', async () => {
    respond({}, 404)
    await expect(lookup('X', signal)).rejects.toMatchObject({
      reason: 'missing',
    })
    respond({}, 429, { 'Retry-After': '17' })
    await expect(lookup('X', signal)).rejects.toMatchObject({
      reason: 'limited',
      retryAfter: 17,
    })
    respond({ data: {} })
    await expect(lookup('X', signal)).rejects.toMatchObject({
      reason: 'unavailable',
    })
    respond({}, 503)
    await expect(lookup('X', signal)).rejects.toMatchObject({
      reason: 'unavailable',
    })
  })
})
