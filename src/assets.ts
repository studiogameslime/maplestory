export type AssetKind =
  | 'item'
  | 'monster'
  | 'npc'
  | 'skill'
  | 'map'
  | 'pet'
  | 'illustration'

type ApprovedAsset = {
  status: 'approved'
  src: string
  provenance: 'original' | 'licensed'
  sourceUrl: string
  attribution: string
}

export type AssetResolution =
  | ApprovedAsset
  | {
      status: 'unavailable'
      reason: 'rights-unconfirmed' | 'unknown-id'
      sourceUrl: string | null
    }

const policy = 'https://m-page.nexon.com/term/716'
const projectArt = 'https://github.com/studiogameslime/maplestory/blob/main/public/art/'

// Only reviewed entries can emit an image URL. A source-provided URL or a
// matching filename is insufficient evidence of a license.
const approved = new Map<string, ApprovedAsset>(
  ['village.webp', 'adventurer.png', 'glove.png', 'potion.png', 'scroll.png', 'stars.png'].map(
    (file) => [
      'illustration/' + file.split('.')[0],
      {
        status: 'approved',
        src: '/art/' + file,
        provenance: 'original',
        sourceUrl: projectArt + file,
        attribution: 'MapleCompanion',
      },
    ],
  ),
)

export function resolveAsset(kind: AssetKind, id: number | string): AssetResolution {
  const asset = approved.get(kind + '/' + id)
  if (asset) return asset
  if (kind !== 'illustration' && /^\d+$/.test(String(id)) && Number.isSafeInteger(Number(id))) {
    return { status: 'unavailable', reason: 'rights-unconfirmed', sourceUrl: policy }
  }
  return { status: 'unavailable', reason: 'unknown-id', sourceUrl: null }
}
