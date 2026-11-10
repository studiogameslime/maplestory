import { readFileSync, writeFileSync } from 'node:fs'
import { inspect } from './quality.ts'
import type { Atlas } from '../src/atlas/model.ts'
const data: Atlas = JSON.parse(readFileSync('public/data/atlas.json', 'utf8'))
const reference = Math.max(...data.entities.map((e) => Date.parse(e.fetched)))
const q = inspect(data, Date.now())
if (q.errors.length)
  throw Error(
    q.errors.length + ' validation errors: ' + q.errors.slice(0, 12).join('\n'),
  )
const count = data.entities.length,
  items = data.entities.filter((e) => e.kind === 'item')
const pct = (a: number, b: number) =>
  a + ' / ' + b + ' (' + ((100 * a) / b).toFixed(2) + '%)'
const coverage = (ids: Set<string>) =>
  pct(ids.size, count) +
  ' | ' +
  pct(items.filter((i) => ids.has(i.id)).length, items.length)
const doc = [
  '# Database coverage',
  '',
  'Snapshot retrieved through ' +
    new Date(reference).toISOString() +
    '. All percentages below use the complete committed normalized graph. The second column includes both endpoints of a qualifying claim. The third column limits the denominator to all imported items. Demo fixtures are excluded.',
  '',
  '| Kind | Records |',
  '| --- | ---: |',
  ...Object.entries(q.counts)
    .sort()
    .map(([k, v]) => '| ' + k + ' | ' + v + ' |'),
  '',
  'Total: ' +
    count +
    ' entities and ' +
    data.edges.length +
    ' relationship claims.',
  '',
  '| Coverage | All entities | All items |',
  '| --- | ---: | ---: |',
  ...Object.entries({
    'Approved original game image': new Set(
      data.entities.filter((e) => !q.missingImages.has(e.id)).map((e) => e.id),
    ),
    'Drop relationship': q.withDrops,
    'Numerical drop rate': q.withRates,
    'NPC sale price': q.withPrices,
    'Quest relationship': q.withQuests,
    'Authorized market history': new Set<string>(),
  }).map(([k, ids]) => '| ' + k + ' | ' + coverage(ids) + ' |'),
  '',
  '## Quality checks',
  '',
  'Blocking integrity errors: 0. Records without approved game imagery: ' +
    q.missingImages.size +
    '. Quests with no imported prerequisite, material or kill requirement: ' +
    q.missingRequirements.size +
    '. These gaps remain unknown. The report counts known requirements and does not certify that a quest has every requirement.',
  '',
  'Staleness uses a 90-day review threshold on source update timestamps. Re-run npm run data:check for the current count. Source-file modification dates measure snapshot age where individual observation dates are unavailable.',
  '',
  'Run npm run data:report after import to regenerate this document.',
  '',
].join('\n')
if (process.argv.includes('--write'))
  writeFileSync('docs/DATA_COVERAGE.md', doc)
else if (
  readFileSync('docs/DATA_COVERAGE.md', 'utf8').replaceAll('\r\n', '\n') !== doc
)
  throw Error('Coverage report outdated; run npm run data:report')
console.log(
  count +
    ' entities; ' +
    data.edges.length +
    ' edges; ' +
    q.stale.size +
    ' source claims older than 90 days.',
)
