import { describe, expect, it } from 'vitest'
import {
  dailyMedians,
  huntEstimate,
  percentile,
  positionProfit,
  potionEfficiency,
  recentSales,
  scrollEstimate,
  stale,
  valuation,
  type Listing,
} from '../src/domain'
import demo from '../public/data/market-demo.json'

const item: Listing = {
  ...demo.listings[0],
  venue: 'FM',
  ask: 100,
  sales: [
    { date: '2026-11-03', price: 9999 },
    { date: '2026-11-04', price: 100 },
    { date: '2026-11-09', price: 120 },
    { date: '2026-11-10', price: 150 },
    { date: '2026-11-10', price: 130 },
    { date: '2026-11-11', price: 9999 },
  ],
}
describe('Free Market comparables', () => {
  it('interpolates sorted quartiles without mutating the observations', () => {
    const prices = [200, 50, 100, 150]
    expect(percentile(prices, 0.25)).toBe(87.5)
    expect(percentile(prices, 0.5)).toBe(125)
    expect(prices).toEqual([200, 50, 100, 150])
  })
  it('uses the observation date and the seven inclusive daily buckets', () => {
    expect(recentSales(item)).toHaveLength(4)
    expect(dailyMedians(item, 7)).toEqual([
      { date: '2026-11-04', value: 100 },
      { date: '2026-11-09', value: 120 },
      { date: '2026-11-10', value: 140 },
    ])
  })
  it('subtracts the modeled resale fee and purchase cost', () => {
    expect(valuation(item)).toMatchObject({
      median: 125,
      profit: 21,
      margin: 0.21,
      volume: 4,
      confidence: 'low',
    })
  })
  it('preserves a loss and handles a zero price basis', () => {
    expect(valuation({ ...item, ask: 150 }).profit).toBe(-29)
    expect(valuation({ ...item, ask: 0 }).margin).toBeNull()
  })
  it('treats missing sales as unknown rather than zero', () => {
    expect(valuation({ ...item, sales: [] })).toMatchObject({
      low: null,
      median: null,
      high: null,
      profit: null,
      margin: null,
      volume: 0,
    })
  })
  it('uses sample count for confidence', () => {
    const example = { date: '2026-11-10', price: 100 }
    expect(
      valuation({ ...item, sales: Array(10).fill(example) }).confidence,
    ).toBe('medium')
    expect(
      valuation({ ...item, sales: Array(20).fill(example) }).confidence,
    ).toBe('high')
  })
})
describe('planning arithmetic', () => {
  it('includes drop expectations and hourly potion spend', () => {
    expect(huntEstimate(200, 75, 50, 1, 2000, 4500)).toEqual({
      xp: 15000,
      mesos: 9500,
    })
    expect(huntEstimate(0, 75, 50, 0, 0, 400)).toEqual({ xp: 0, mesos: -400 })
  })
  it('uses independent attempts and pays for every scroll', () => {
    const result = scrollEstimate(60, 5, 50000, 20000)
    expect(result.atLeastOne).toBeCloseTo(0.98976)
    expect(result.expectedNet).toBe(50000)
  })
  it('handles zero attempts and deterministic probabilities', () => {
    expect(scrollEstimate(100, 0, 100, 10)).toEqual({
      atLeastOne: 0,
      expectedNet: 0,
    })
    expect(scrollEstimate(0, 2, 100, 10)).toEqual({
      atLeastOne: 0,
      expectedNet: -20,
    })
    expect(scrollEstimate(100, 2, 100, 10)).toEqual({
      atLeastOne: 1,
      expectedNet: 180,
    })
  })
  it('computes costs per restored point and rejects a zero divisor', () => {
    expect(potionEfficiency(300, 150)).toBe(2)
    expect(potionEfficiency(300, 0)).toBeNull()
  })
  it('tracks net unit profit multiplied by quantity', () => {
    expect(
      positionProfit({
        id: 'a',
        name: 'sample',
        cost: 130,
        value: 100,
        qty: 5,
        sold: true,
      }),
    ).toBe(-150)
  })
  it('ages observations independently of retrieval', () => {
    const now = Date.parse('2026-11-10T10:00:00Z')
    expect(stale('2026-11-09T10:00:00Z', now)).toBe(false)
    expect(stale('2026-11-09T09:59:59Z', now)).toBe(true)
    expect(stale('unknown', now)).toBe(true)
  })
})
