import { createHash } from 'node:crypto'
import { gunzipSync, gzipSync } from 'node:zlib'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { applySupplement } from './supplement.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const cacheDir = join(root, 'data')
const archive = join(cacheDir, 'classicmaple-exports.json.gz')
const target = join(root, 'public/data/atlas.json')
const kinds = {
  items: 'item', monsters: 'monster', maps: 'map', npcs: 'npc', quests: 'quest',
  shops: 'shop', classes: 'class', professions: 'profession', systems: 'system',
  patches: 'patch', builds: 'build',
}
const credit = {
  license: 'CC BY-NC-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  attribution: 'Adapted from Classic Maple Wiki contributors and MapleClassic Wiki contributors',
  sources: ['https://classicmaple.wiki/credits/', 'https://mapleclassic.wiki/wiki/MapleWiki:About#Reusing_the_wiki'],
  changes: 'Normalized factual fields, linked records, omitted images, and added selected wiki revision evidence.',
}

function hash(text) {
  return createHash('sha256').update(text).digest('hex')
}

async function downloadExports() {
  const datasets = {}
  for (const key of Object.keys(kinds)) {
    const url = 'https://classicmaple.wiki/data/' + key + '.json'
    const response = await fetch(url, {
      signal: AbortSignal.timeout(25000),
      headers: { 'User-Agent': 'MapleCompanion/1.0 (+https://github.com/studiogameslime/maplestory)' },
    })
    if (!response.ok) throw new Error(url + ' returned HTTP ' + response.status)
    const body = await response.text()
    const modified = response.headers.get('last-modified')
    datasets[key] = {
      url, fetched: new Date().toISOString(), updated: modified ? new Date(modified).toISOString() : 'unknown',
      sha256: hash(body), body,
    }
  }
  return datasets
}

function normalize(exports) {
  const entities = [], edges = []
  const edgeIndex = new Set()
  const rows = {}
  function evidence(key, row) {
    const file = exports[key]
    return {
      source: row.source_page || row.verified?.source || row.source || file.url,
      upstream: file.url, version: row.verified?.build || row.build || 'unknown',
      updated: row.verified?.date || file.updated,
      fetched: file.fetched, status: row.verified?.status || 'published-reference',
    }
  }
  function addEntity(kind, id, row, fields, ev) {
    const properties = {}
    for (const key of fields) {
      const value = row[key]
      if (value === undefined || value === null || value === '') continue
      if (Array.isArray(value)) {
        if (value.length) properties[key] = value.join(' · ')
      } else if (['number', 'string'].includes(typeof value)) properties[key] = value
      else if (typeof value === 'boolean') properties[key] = String(value)
    }
    for (const [key, value] of Object.entries(row.stats || {})) {
      if (typeof value === 'number' || typeof value === 'string') properties[key] = value
    }
    entities.push({
      id: kind + ':' + id, kind, name: row.name,
      category: row.category || (kind === 'map' ? row.kind : undefined),
      description: row.notes || row.summary || row.differs_from_original,
      properties, ...ev,
    })
  }
  for (const [file, kind] of Object.entries(kinds)) {
    const input = exports[file]
    if (!input || hash(input.body) !== input.sha256) throw new Error('Invalid source digest for ' + file)
    rows[file] = JSON.parse(input.body)
    if (!Array.isArray(rows[file]) || !rows[file].length) throw new Error('Missing source records for ' + file)
    for (const row of rows[file]) {
      if (!row.id || !row.name) throw new Error('Unnamed source entity in ' + file)
      const ev = evidence(file, row)
      if (kind === 'build') ev.version = row.id
      addEntity(kind, row.id, row, ['level', 'hp', 'exp', 'boss', 'weak_to', 'strong_to', 'immune_to',
        'required_level', 'recommended_level', 'region', 'town', 'start_mode', 'date'], ev)
      for (const skill of row.skills || []) {
        addEntity('skill', row.id + '/' + skill.id, skill, ['job', 'branches'], evidence(file, skill))
      }
    }
  }
  // The export uses the reserved drop target "meso" without an item record.
  // Keep the currency addressable without inventing an equipment/item ID.
  if (rows.monsters.some(row => row.drops.some(drop => drop.item === 'meso'))) {
    const source = exports.monsters
    entities.push({ id: 'currency:meso', kind: 'currency', name: 'Meso', source: source.url,
      version: 'unknown', updated: source.updated, fetched: source.fetched, status: 'published-reference' })
  }
  const known = new Set(entities.map(entity => entity.id))
  function addEdge(from, to, type, provenance, extra = {}) {
    if (!known.has(from) || !known.has(to)) throw new Error('Broken source reference ' + [from, type, to].join(' '))
    const key = JSON.stringify([from, to, type, extra, provenance.source])
    if (edgeIndex.has(key)) return
    edgeIndex.add(key)
    edges.push({ from, to, type, ...provenance, ...extra })
  }
  for (const row of rows.monsters) {
    const from = 'monster:' + row.id, ev = evidence('monsters', row)
    if (row.location) addEdge(from, 'map:' + row.location, 'spawns_in', ev)
    for (const drop of row.drops) {
      const sampled = Number.isInteger(drop.sample_kills) && drop.sample_kills > 0 && Number.isInteger(drop.sample_drops)
      const rateEvidence = sampled ? 'community-measured' : 'presence-only'
      addEdge(from, drop.item === 'meso' ? 'currency:meso' : 'item:' + drop.item, 'drops', {
        ...ev, status: rateEvidence, version: drop.build || ev.version, source: drop.source || ev.source,
        updated: drop.observed_on || ev.updated,
      }, {
        rateEvidence, rate: drop.rate_percent, sampleKills: drop.sample_kills, sampleDrops: drop.sample_drops,
        observed: drop.observed_on, minQuantity: drop.quantity?.[0], maxQuantity: drop.quantity?.[1],
        quantity: drop.quantity && drop.quantity[0] === drop.quantity[1] ? drop.quantity[0] : undefined,
      })
    }
  }
  for (const row of rows.maps) {
    const map = 'map:' + row.id, ev = evidence('maps', row)
    for (const mob of row.monsters || []) addEdge('monster:' + mob, map, 'spawns_in', ev)
    for (const exit of row.exits || []) addEdge(map, 'map:' + exit.to, 'connects_to', ev, { route: exit.kind, direction: exit.direction })
  }
  for (const row of rows.npcs) {
    if (row.map) addEdge('npc:' + row.id, 'map:' + row.map, 'located_in', evidence('npcs', row))
  }
  for (const row of rows.shops) {
    const from = 'shop:' + row.id, ev = evidence('shops', row)
    if (row.map) addEdge(from, 'map:' + row.map, 'shop_location', ev)
    if (row.npc) addEdge(from, 'npc:' + row.npc, 'shopkeeper', ev)
    for (const item of row.items) addEdge(from, 'item:' + item, 'sells', ev)
  }
  for (const row of rows.quests) {
    const from = 'quest:' + row.id, ev = evidence('quests', row)
    if (row.giver) addEdge(from, 'npc:' + row.giver, 'starts_at', ev)
    if (row.turn_in) addEdge(from, 'npc:' + row.turn_in, 'ends_at', ev)
    if (row.start_map) addEdge(from, 'map:' + row.start_map, 'starts_in', ev)
    if (row.next) addEdge(from, 'quest:' + row.next, 'next_quest', ev)
    for (const pre of row.prerequisites) addEdge(from, 'quest:' + pre, 'prerequisite', ev)
    for (const step of row.steps) {
      if (step.monster) addEdge(from, 'monster:' + step.monster, 'involves_monster', ev)
      if (step.map) addEdge(from, 'map:' + step.map, 'visits', ev)
      if (step.npc) addEdge(from, 'npc:' + step.npc, 'speaks_to', ev)
    }
  }
  for (const row of rows.classes) {
    for (const skill of row.skills) addEdge('class:' + row.id, 'skill:' + row.id + '/' + skill.id, 'teaches', evidence('classes', skill))
  }
  for (const row of rows.patches) {
    if (row.build) addEdge('patch:' + row.id, 'build:' + row.build, 'documents', evidence('patches', row))
  }
  return { game: 'MapleStory Classic World', ...credit, entities, edges }
}

async function writeAtomic(file, contents) {
  const path = file + '.' + process.pid + '.tmp'
  await writeFile(path, contents)
  await rename(path, file)
}

const refresh = process.argv.includes('--refresh')
await mkdir(cacheDir, { recursive: true })
await mkdir(join(root, 'public/data'), { recursive: true })
const inputs = refresh ? await downloadExports() : JSON.parse(gunzipSync(await readFile(archive)).toString('utf8'))
const graph = normalize(inputs)
await applySupplement(graph, { cacheDir, offline: !refresh })
const ids = new Set(graph.entities.map(row => row.id))
if (ids.size !== graph.entities.length) throw new Error('Duplicate entity ID')
for (const edge of graph.edges) {
  if (!ids.has(edge.from) || !ids.has(edge.to)) throw new Error('Dangling edge ' + JSON.stringify(edge))
}
if (refresh) await writeAtomic(archive, gzipSync(JSON.stringify(inputs), { level: 9 }))
await writeAtomic(target, JSON.stringify(graph) + '\n')
process.stdout.write(`Atlas contains ${graph.entities.length} entities and ${graph.edges.length} relationships.\n`)
