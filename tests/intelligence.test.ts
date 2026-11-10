import { expect, it } from 'vitest'
import { dropModel, wilson95, indexAtlas, type Atlas } from '../src/atlas/model'
import {
  analyzeQuote,
  verifiedMarket,
  type Quote,
} from '../src/market-analysis'
import { inspect } from '../scripts/quality'
const evidence = {
  source: 'https://example.org/record',
  status: 'unverified',
  updated: '2026-11-01',
  fetched: '2026-11-10',
  version: 'unknown',
}
const graph: Atlas = {
  entities: ['monster', 'item', 'map'].map((kind) => ({
    ...evidence,
    id: kind + ':a',
    name: 'A ' + kind,
    kind,
  })),
  edges: [
    { ...evidence, from: 'monster:a', to: 'item:a', type: 'drops' },
    { ...evidence, from: 'monster:a', to: 'map:a', type: 'spawns_in' },
  ],
}
it('indexes both ends of relationships and searches all kinds', () => {
  const index = indexAtlas(graph)
  expect(index.neighbors.get('item:a')?.[0].from).toBe('monster:a')
  expect(index.neighbors.get('monster:a')).toHaveLength(2)
  expect(index.search('A', '')).toHaveLength(3)
  expect(index.search('a', 'map')).toHaveLength(1)
})
it('detects invalid claims and tracks unknown coverage', () => {
  const q = inspect(graph, Date.now())
  expect(q.errors).toEqual([])
  expect(q.withRates.size).toBe(0)
  const invalid = structuredClone(graph)
  invalid.entities.push({ ...invalid.entities[0], version: 'GMS83' })
  invalid.edges.push(
    { ...graph.edges[1], to: 'item:a' },
    { ...graph.edges[0], from: 'missing' },
    { ...graph.edges[0], price: -2 },
  )
  expect(inspect(invalid, Date.now()).errors.join(' ')).toMatch(
    /duplicate.*Unsupported.*Invalid spawn.*Broken reference.*Invalid price/s,
  )
})
it('computes independent kill expectations only for known positive rates', () => {
  expect(dropModel(null, 10, 100, 20, 5)).toBeNull()
  expect(dropModel(10, 2, 100, 20, 5)).toMatchObject({
    killsPerDrop: 10,
    valuePerKill: 2,
    mesosPerHour: 200,
    hours: 0.5,
  })
  expect(dropModel(10, 2, 100, 20, 5)?.chance).toBeCloseTo(0.19)
  expect(dropModel(100, 0, 0, 1, 1)?.chance).toBe(0)
  expect(wilson95(17, 37)?.[0]).toBeCloseTo(0.31, 2)
  expect(wilson95(40, 37)).toBeNull()
})
it('isolates exact variants, world, basis, time and provenance before pricing', () => {
  const q: Quote = {
    variant: {
      world: 'test',
      version: 'v1',
      itemId: 'glove',
      stats: 'DEX+1',
      slots: 2,
      unit: 'each',
    },
    at: '2026-11-10T10:00:00Z',
    price: 100,
    venue: 'FM',
    kind: 'demo',
    channel: 1,
    room: 2,
    seller: 'sample',
  }
  const sale = { ...q, price: 150 }
  const result = analyzeQuote(
    q,
    [
      sale,
      { ...sale, price: 250 },
      { ...sale, kind: 'observed' },
      { ...sale, variant: { ...q.variant, slots: 1 } },
      { ...sale, at: '2026-11-11' },
    ],
    Date.parse(q.at),
    0.03,
  )
  expect(result).toMatchObject({
    volume: 2,
    gross: 100,
    net: 94,
    median: 200,
    volatility: 0.25,
  })
  expect(result.confidence).toBeGreaterThan(0)
  expect(
    analyzeQuote(q, [sale], Date.parse(q.at) + 86400000, 0).confidence,
  ).toBe(0)
})
it('returns a disabled live provider without making a request', async () =>
  expect(await verifiedMarket.read(new AbortController().signal)).toMatchObject(
    { status: 'disabled' },
  ))
