export interface Evidence {
  source: string
  version: string
  updated: string
  fetched: string
  status: string
  upstream?: string
}
export interface Fact extends Evidence {
  name: string
  value: string | number
}
export interface Entity extends Evidence {
  facts?: Fact[]
  id: string
  kind: string
  name: string
  gameId?: string
  description?: string
  category?: string
  properties?: Record<string, string | number>
}
export interface Edge extends Evidence {
  from: string
  to: string
  type: string
  quantity?: number
  price?: number
  rate?: number
  sampleKills?: number
  sampleDrops?: number
  rateEvidence?:
    | 'official'
    | 'community-measured'
    | 'historical'
    | 'unverified-estimate'
    | 'presence-only'
  minQuantity?: number
  maxQuantity?: number
}
export interface Atlas {
  entities: Entity[]
  edges: Edge[]
}
const normalize = (s: string) => s.normalize('NFKC').toLowerCase().trim()
export function indexAtlas(data: Atlas) {
  const entities = new Map(data.entities.map((row) => [row.id, row]))
  const neighbors = new Map<string, Edge[]>()
  for (const edge of data.edges) {
    for (const id of new Set([edge.from, edge.to])) {
      const group = neighbors.get(id) ?? []
      group.push(edge)
      neighbors.set(id, group)
    }
  }
  const names = data.entities
    .map((row) => ({
      row,
      text: normalize(
        [
          row.name,
          row.id,
          row.gameId,
          row.category,
          row.kind,
          ...(row.facts ?? [])
            .filter((f) => f.name.toLowerCase().includes('game id'))
            .map((f) => String(f.value)),
        ].join(' '),
      ),
    }))
    .sort((a, b) => a.row.name.localeCompare(b.row.name))
  return {
    entities,
    neighbors,
    search: (query: string, kind: string) => {
      const terms = normalize(query).split(/\s+/)
      return names
        .filter(
          ({ row, text }) =>
            (!kind || row.kind === kind) &&
            terms.every((word) => text.includes(word)),
        )
        .map((hit) => hit.row)
    },
  }
}
export function dropModel(
  chancePercent: number | null,
  kills: number,
  killsPerHour: number,
  unitValue: number,
  units: number,
) {
  if (
    chancePercent === null ||
    !Number.isFinite(chancePercent) ||
    chancePercent <= 0 ||
    chancePercent > 100 ||
    ![kills, killsPerHour, unitValue, units].every(
      (n) => Number.isFinite(n) && n >= 0,
    ) ||
    !Number.isInteger(kills) ||
    !Number.isInteger(units)
  )
    return null
  const p = chancePercent / 100
  return {
    killsPerDrop: 1 / p,
    chance: kills === 0 ? 0 : -Math.expm1(kills * Math.log1p(-p)),
    valuePerKill: p * unitValue,
    mesosPerHour: p * unitValue * killsPerHour,
    hours: killsPerHour > 0 ? units / (p * killsPerHour) : null,
  }
}
export function wilson95(successes: number, trials: number) {
  if (
    !Number.isInteger(trials) ||
    !Number.isInteger(successes) ||
    trials <= 0 ||
    successes < 0 ||
    successes > trials
  )
    return null
  const z = 1.95996398454,
    p = successes / trials,
    denom = 1 + (z * z) / trials
  const mid = (p + (z * z) / (2 * trials)) / denom,
    half =
      (z *
        Math.sqrt((p * (1 - p)) / trials + (z * z) / (4 * trials * trials))) /
      denom
  return [Math.max(0, mid - half), Math.min(1, mid + half)]
}
