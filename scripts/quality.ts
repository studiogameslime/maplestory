import type { Atlas, Entity } from '../src/atlas/model.ts'
import { resolveAsset, type AssetKind } from '../src/assets.ts'
export function inspect(data: Atlas, asOf: number) {
  const errors: string[] = [],
    byId = new Map<string, Entity>(),
    claims = new Set<string>(),
    seenEdges = new Set<string>()
  const stale = new Set<string>(),
    missingRequirements = new Set<string>(),
    missingImages = new Set<string>()
  const versions = new Set([
    'unknown',
    'cot2',
    'founders-2026-10-06',
    'launch-2026-10-21',
    'Classic World 1.0.0',
    'Classic World 0.9.0',
    'Classic World pre-launch',
  ])
  function evidence(
    e: {
      version: string
      source: string
      status: string
      updated: string
      fetched: string
    },
    label: string,
  ) {
    if (
      !/^https:\/\//.test(e.source) ||
      !e.status ||
      ![e.updated, e.fetched].every((x) => Number.isFinite(Date.parse(x)))
    )
      errors.push('Missing provenance: ' + label)
    if (!versions.has(e.version))
      errors.push('Unsupported game version ' + e.version + ': ' + label)
    if (asOf - Date.parse(e.updated) > 90 * 86400000) stale.add(label)
  }
  for (const row of data.entities) {
    if (!row.name?.trim() || !row.id || byId.has(row.id))
      errors.push('Missing or duplicate identity: ' + row.id)
    byId.set(row.id, row)
    evidence(row, row.id)
    const facts = new Map<string, string | number>()
    for (const fact of row.facts ?? []) {
      evidence(fact, row.id + ' ' + fact.name)
      const key = fact.version + '|' + fact.name
      if (facts.has(key) && facts.get(key) !== fact.value)
        errors.push('Conflicting fact ' + row.id + ' ' + key)
      facts.set(key, fact.value)
    }
    if (row.gameId) {
      const key = [row.kind, row.gameId, row.version].join('|')
      if (claims.has(key)) errors.push('Conflicting game ID: ' + key)
      claims.add(key)
    }
    if (row.kind === 'quest') missingRequirements.add(row.id)
    if (
      resolveAsset(row.kind as AssetKind, row.gameId ?? row.id).status !==
      'approved'
    )
      missingImages.add(row.id)
  }
  const withDrops = new Set<string>(),
    withRates = new Set<string>(),
    withPrices = new Set<string>(),
    withQuests = new Set<string>()
  for (const e of data.edges) {
    const label = [e.from, e.type, e.to].join(' '),
      a = byId.get(e.from),
      b = byId.get(e.to)
    evidence(e, label)
    if (!a || !b) {
      errors.push('Broken reference ' + label)
      continue
    }
    const key = JSON.stringify(e)
    if (seenEdges.has(key)) errors.push('Duplicate claim ' + label)
    seenEdges.add(key)
    if (e.type === 'spawns_in' && (a.kind !== 'monster' || b.kind !== 'map'))
      errors.push('Invalid spawn ' + label)
    if (e.type === 'drops') {
      if (a.kind !== 'monster' || !['item', 'currency'].includes(b.kind))
        errors.push('Invalid drop ' + label)
      withDrops.add(a.id)
      withDrops.add(b.id)
      if (e.rate != null) {
        if (
          !Number.isFinite(e.rate) ||
          e.rate < 0 ||
          e.rate > 100 ||
          !e.rateEvidence
        )
          errors.push('Invalid drop rate ' + label)
        withRates.add(a.id)
        withRates.add(b.id)
      }
    }
    if (e.price != null) {
      if (
        e.type !== 'sells' ||
        !Number.isSafeInteger(e.price) ||
        e.price < 0 ||
        (e as { unit?: string }).unit !== 'mesos/item'
      )
        errors.push('Invalid price or unit ' + label)
      withPrices.add(a.id)
      withPrices.add(b.id)
    }
    if (a.kind === 'quest' || b.kind === 'quest') {
      withQuests.add(a.id)
      withQuests.add(b.id)
    }
    if (['requires_item', 'requires_kill', 'prerequisite'].includes(e.type))
      missingRequirements.delete(a.id)
  }
  const counts: Record<string, number> = {}
  for (const e of data.entities) counts[e.kind] = (counts[e.kind] ?? 0) + 1
  return {
    errors,
    counts,
    stale,
    missingImages,
    missingRequirements,
    withDrops,
    withRates,
    withPrices,
    withQuests,
  }
}
