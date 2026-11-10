import { describe, expect, it } from 'vitest'
import { resolveAsset, type AssetKind } from '../src/assets'

describe('artwork permissions', () => {
  it.each(['village', 'adventurer', 'glove', 'potion', 'scroll', 'stars'])(
    'returns reviewed local artwork only in the illustration namespace: %s',
    (id) => {
      expect(resolveAsset('illustration', id)).toMatchObject({
        status: 'approved', provenance: 'original', src: expect.stringMatching(/^\/art\//),
      })
      expect(resolveAsset('item', id).status).toBe('unavailable')
    },
  )

  it.each<[AssetKind, number]>([
    ['item', 1082000], ['monster', 9], ['npc', 313], ['map', 10001000],
    ['skill', 4001003], ['pet', 5000000],
  ])('withholds technically available game artwork for %s %i', (kind, id) => {
    const result = resolveAsset(kind, id)
    expect(result).toMatchObject({ status: 'unavailable', reason: 'rights-unconfirmed' })
    expect(result).not.toHaveProperty('src')
  })

  it.each(['https://example.org/art.png', '../art/glove.png', '__proto__', 'constructor', '', -1])(
    'rejects unknown illustration references: %s',
    (id) => {
      expect(resolveAsset('illustration', id)).toEqual({
        status: 'unavailable', reason: 'unknown-id', sourceUrl: null,
      })
    },
  )
})
