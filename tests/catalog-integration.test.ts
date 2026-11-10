import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { indexAtlas, type Atlas } from '../src/atlas/model'
const atlas: Atlas = JSON.parse(readFileSync('public/data/atlas.json', 'utf8'))
const index = indexAtlas(atlas)
it('ships the five required real catalogs with traceable records', () => {
  for (const [kind, min] of Object.entries({
    item: 20,
    monster: 10,
    quest: 10,
    map: 10,
    npc: 5,
  }))
    expect(index.search('', kind).length).toBeGreaterThanOrEqual(min)
  expect(
    index
      .search('4000013', 'item')
      .some((e) => e.name === 'Green Mushroom Cap'),
  ).toBe(true)
})
it('connects a measured drop to a spawn, material quest, NPC and reward', () => {
  const cap = index.neighbors.get('item:green-mushroom-cap')!
  const drops = cap.find(
    (e) => e.type === 'drops' && e.from === 'monster:green-mushroom',
  )!
  expect(drops.rateEvidence).toBe('community-measured')
  expect(
    index.neighbors.get(drops.from)?.some((e) => e.type === 'spawns_in'),
  ).toBe(true)
  const quest = cap.find(
    (e) =>
      e.from === 'quest:how-to-enjoy-mushrooms' && e.type === 'requires_item',
  )!
  expect(quest.quantity).toBe(15)
  const steps = index.neighbors.get(quest.from)!
  expect(steps).toContainEqual(
    expect.objectContaining({
      type: 'rewards',
      to: 'item:bronze-ore',
      quantity: 5,
    }),
  )
  expect(steps).toContainEqual(
    expect.objectContaining({ type: 'starts_at', to: 'npc:shane' }),
  )
})
it('preserves versioned shop prices and recipes with material quantities', () => {
  expect(index.neighbors.get('item:red-potion')).toContainEqual(
    expect.objectContaining({
      type: 'sells',
      price: 50,
      version: 'Classic World 0.9.0',
    }),
  )
  expect(index.neighbors.get('recipe:92030000-5')).toContainEqual(
    expect.objectContaining({ type: 'material', quantity: 10 }),
  )
})
