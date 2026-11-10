import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import { useApp } from '../state'
import { Empty, Heading, SearchBox } from '../ui'
import {
  indexAtlas,
  dropModel,
  wilson95,
  type Atlas,
  type Edge,
  type Entity,
} from './model'
import { AssetImage } from '../AssetImage'
import './atlas.css'

const kinds: Record<string, string> = {
  item: 'פריט',
  monster: 'מפלצת',
  map: 'מפה',
  quest: 'משימה',
  npc: 'דמות עולם',
  shop: 'חנות',
  class: 'מקצוע',
  skill: 'מיומנות',
  profession: 'מלאכה',
  recipe: 'מתכון',
  system: 'מערכת',
  patch: 'עדכון',
  build: 'גרסה',
  currency: 'מטבע',
}
const relationships: Record<string, [string, string, string, string]> = {
  connects_to: ['Connects to', 'Accessible from', 'מחובר אל', 'גישה מאת'],
  starts_in: [
    'Starts on map',
    'Quests starting here',
    'מפת התחלה',
    'משימות שמתחילות כאן',
  ],
  visits: ['Visits map', 'Visited in quest', 'ביקור במפה', 'ביקור במשימה'],
  speaks_to: ['Speak to', 'Appears in quest', 'שיחה עם', 'מופיע במשימה'],
  involves_monster: [
    'Encountered monster',
    'Appears in quest',
    'מפלצת במשימה',
    'מופיע במשימה',
  ],
  teaches: ['Class skills', 'Class', 'מיומנויות מקצוע', 'מקצוע'],
  documents: ['Game build', 'Patch notes', 'גרסה', 'עדכון'],
  drops: ['Drops', 'Dropped by', 'שלל', 'נופל מ־'],
  spawns_in: ['Found on map', 'Monsters here', 'מפות הופעה', 'מפלצות במפה'],
  located_in: ['Located on map', 'NPCs here', 'מיקום', 'דמויות במפה'],
  starts_at: [
    'Starts with',
    'Starts quests',
    'התחלה אצל',
    'משימות שמתחילות כאן',
  ],
  ends_at: [
    'Ends with',
    'Completes quests',
    'סיום אצל',
    'משימות שמסתיימות כאן',
  ],
  requires_item: [
    'Required material',
    'Required by quest',
    'חומר נדרש',
    'נדרש למשימה',
  ],
  requires_kill: [
    'Required monster',
    'Hunted for quest',
    'מפלצת נדרשת',
    'ניצודה למשימה',
  ],
  prerequisite: ['Prerequisite', 'Unlocks', 'תנאי מקדים', 'פותח'],
  rewards: ['Reward', 'Rewarded by', 'תגמול', 'מוענק על ידי'],
  sells: ['Sells', 'Sold at', 'למכירה', 'נמכר אצל'],
  shopkeeper: ['Shopkeeper', 'Operates shop', 'מוכר', 'מפעיל חנות'],
  shop_location: ['Shop location', 'Shops here', 'מיקום חנות', 'חנויות במפה'],
  next_quest: ['Next quest', 'Previous quest', 'המשימה הבאה', 'המשימה הקודמת'],
  upgrades: ['Upgrades', 'Upgraded by', 'משדרג', 'ניתן לשדרג באמצעות'],
  equippable_by: [
    'Equippable by',
    'Compatible equipment',
    'מתאים עבור',
    'ציוד תואם',
  ],
  produces: ['Produces', 'Crafted by', 'מייצר', 'מיוצר במתכון'],
  material: ['Uses material', 'Used in recipe', 'חומר למתכון', 'משמש במתכון'],
  portal: ['Portal to', 'Portal from', 'מעבר אל', 'מעבר מאת'],
}
type Index = ReturnType<typeof indexAtlas>
function Credit() {
  const { t } = useApp()
  return (
    <footer className="atlas-credit">
      {t(
        'Adapted and indexed from Classic Maple Wiki and MapleClassic Wiki contributors.',
        'עיבוד ומפתוח מנתוני תורמי Classic Maple Wiki ו־MapleClassic Wiki.',
      )}{' '}
      <a href="https://classicmaple.wiki/credits/">Credits</a> ·{' '}
      <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
        CC BY-NC-SA 4.0
      </a>
    </footer>
  )
}
function Calculator({ edge }: { edge: Edge }) {
  const { t, num } = useApp()
  const [values, setValues] = useState(['100', '200', '0', '1'])
  const labels = [
    t('Kills', 'הריגות'),
    t('Kills per hour', 'הריגות לשעה'),
    t('Net mesos per item', 'מסוס נקי לפריט'),
    t('Material units needed', 'יחידות חומר דרושות'),
  ]
  const [n, speed, value, units] = values.map(Number)
  const result = values.every((s) => s.trim())
    ? dropModel(edge.rate ?? null, n, speed, value, units)
    : null
  return (
    <details>
      <summary>{t('Model this drop', 'חישוב לפי נפילה זו')}</summary>
      <p>
        {t(
          'Assumes independent kills, one unit per success and the reported sample rate. Values are expectations.',
          'החישוב מניח הריגות בלתי תלויות ויחידה אחת לכל הצלחה לפי שיעור המדגם.',
        )}
      </p>
      <div className="model-grid">
        {labels.map((l, i) => (
          <label key={i}>
            {l}
            <input
              type="number"
              min="0"
              value={values[i]}
              onChange={(e) =>
                setValues(values.map((s, j) => (i === j ? e.target.value : s)))
              }
            />
          </label>
        ))}
      </div>
      {result ? (
        <dl className="details">
          {[
            [
              t('Expected kills per drop', 'הריגות צפויות לנפילה'),
              num(result.killsPerDrop),
            ],
            [
              t('Chance of at least one', 'סיכוי לנפילה אחת לפחות'),
              num(100 * result.chance) + '%',
            ],
            [
              t('Expected mesos / kill', 'מסוס צפוי להריגה'),
              num(result.valuePerKill),
            ],
            [
              t('Expected drop mesos / hour', 'מסוס משלל לשעה'),
              num(result.mesosPerHour),
            ],
            [
              t('Expected farming hours', 'שעות איסוף צפויות'),
              result.hours === null ? '—' : num(result.hours),
            ],
          ].map(([a, b]) => (
            <div key={a}>
              <dt>{a}</dt>
              <dd>{b}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p>{t('Estimate unavailable', 'האומדן אינו זמין')}</p>
      )}
    </details>
  )
}
function ItemSources({ row, index }: { row: Entity; index: Index }) {
  const { t } = useApp()
  const edges = index.neighbors.get(row.id) ?? []
  const paths = edges
    .filter(
      (e) => e.to === row.id && (e.type === 'drops' || e.type === 'sells'),
    )
    .flatMap((e) =>
      (index.neighbors.get(e.from) ?? [])
        .filter(
          (next) =>
            next.from === e.from &&
            (e.type === 'drops'
              ? next.type === 'spawns_in'
              : next.type === 'shopkeeper'),
        )
        .map((next) => ({ first: e, next })),
    )
  const distinct = new Map(
    paths.map((p) => [
      [p.first.from, p.next.to, p.first.version, p.next.version].join('|'),
      p,
    ]),
  )
  return (
    <section className="panel padded">
      <h2>{t('Sources and locations', 'מקורות ומיקומים')}</h2>
      {distinct.size === 0 ? (
        <p>
          {t(
            'No linked hunting ground or shopkeeper known.',
            'לא ידועים אזורי ציד או מוכרים מקושרים.',
          )}
        </p>
      ) : (
        [...distinct].map(([key, { first, next }]) => (
          <div key={key} className="atlas-path">
            <Link to={'/database/' + encodeURIComponent(first.from)}>
              {index.entities.get(first.from)?.name}
            </Link>
            <ChevronRight size={14} />
            <Link to={'/database/' + encodeURIComponent(next.to)}>
              {index.entities.get(next.to)?.name}
            </Link>
            <small>
              <a href={first.source}>{first.version}</a> ·{' '}
              <a href={next.source}>{next.version}</a>
            </small>
          </div>
        ))
      )}
    </section>
  )
}
function Details({ row, index }: { row: Entity; index: Index }) {
  const { t, lang, num } = useApp()
  const edges = index.neighbors.get(row.id) ?? []
  const unknown = t('Unknown', 'לא ידוע')
  const groups = new Map<string, Edge[]>()
  for (const e of edges) {
    const key = e.type + ' ' + (e.from === row.id ? 'out' : 'in')
    const bucket = groups.get(key) ?? []
    bucket.push(e)
    groups.set(key, bucket)
  }
  return (
    <>
      <Heading
        title={row.name}
        sub={
          t('Game database', 'מאגר המשחק') +
          ' / ' +
          t(row.kind, kinds[row.kind] ?? row.kind)
        }
      />
      <article className="panel padded">
        <div className="atlas-identity">
          {['item', 'monster', 'npc', 'map', 'skill', 'pet'].includes(
            row.kind,
          ) && (
            <AssetImage
              kind={
                row.kind as 'item' | 'monster' | 'npc' | 'map' | 'skill' | 'pet'
              }
              id={row.gameId ?? row.id}
              label={row.name}
            />
          )}
          <div>
            <b>{row.category ?? t(row.kind, kinds[row.kind] ?? row.kind)}</b>
            <p>
              {t('Game ID', 'מזהה משחק')} · {row.gameId ?? unknown}
            </p>
            <span className="level">{row.status}</span>
          </div>
        </div>
        <p>
          {row.description ??
            t('Description unavailable in this source.', 'אין תיאור במקור זה.')}
        </p>
        <dl className="details">
          {(row.facts ?? []).map((fact, i) => (
            <div key={'fact' + i}>
              <dt>{fact.name}</dt>
              <dd>
                {String(fact.value)} · {fact.version} ·{' '}
                <a href={fact.source}>{t('Evidence', 'מקור')}</a>
              </dd>
            </div>
          ))}
          {Object.entries(row.properties ?? {}).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{String(v)}</dd>
            </div>
          ))}
        </dl>
        <p>
          {row.version} · {t('Updated', 'עודכן')} {row.updated} ·{' '}
          {t('Retrieved', 'התקבל')} {row.fetched}
        </p>
        <a href={row.source} target="_blank" rel="noreferrer">
          {t('Record source', 'מקור הרשומה')} ↗
        </a>
        {row.upstream && (
          <>
            {' '}
            · <a href={row.upstream}>{t('Upstream dataset', 'מאגר המקור')}</a>
          </>
        )}
      </article>
      {row.kind === 'item' && <ItemSources row={row} index={index} />}
      {Array.from(groups, ([key, list]) => {
        const outward = key.endsWith(' out')
        const name = relationships[list[0].type]
        const title =
          name?.[(lang === 'he' ? 2 : 0) + (outward ? 0 : 1)] ?? list[0].type
        return (
          <section className="panel padded" key={key}>
            <h2>
              {title} <small>{list.length}</small>
            </h2>
            {list.map((e, i) => {
              const dest = index.entities.get(outward ? e.to : e.from)!
              return (
                <div className="atlas-rel" key={i}>
                  <Link to={'/database/' + encodeURIComponent(dest.id)}>
                    {dest.name} <ChevronRight size={14} />
                  </Link>
                  <small>
                    {e.minQuantity != null &&
                    e.maxQuantity != null &&
                    e.minQuantity !== e.maxQuantity
                      ? e.minQuantity + '–' + e.maxQuantity + ' · '
                      : ''}
                    {e.quantity != null ? '× ' + num(e.quantity) + ' · ' : ''}
                    {e.type === 'drops'
                      ? t('Drop rate', 'שיעור נפילה') +
                        ' ' +
                        (e.rate == null ? unknown : num(e.rate) + '%') +
                        ' · '
                      : ''}
                    {e.type === 'sells'
                      ? t('NPC unit price', 'מחיר ליחידה') +
                        ' ' +
                        (e.price == null ? unknown : num(e.price)) +
                        ' · '
                      : ''}
                    {e.status} · {e.version} · {e.updated.slice(0, 10)} ·{' '}
                    <a href={e.source}>{t('Evidence', 'מקור')}</a>
                  </small>
                  {e.sampleKills != null && e.sampleDrops != null && (
                    <p>
                      {t('Observed drops / kills', 'נפילות / הריגות במדגם')} ·{' '}
                      {e.sampleDrops} / {e.sampleKills}
                      {e.sampleDrops <= e.sampleKills && (
                        <>
                          {' '}
                          ·{' '}
                          {t(
                            'Wilson 95% interval (binary trials)',
                            'רווח וילסון 95% (ניסויים בינאריים)',
                          )}{' '}
                          {wilson95(e.sampleDrops, e.sampleKills)
                            ?.map((x) => num(x * 100) + '%')
                            .join(' – ')}
                        </>
                      )}
                    </p>
                  )}
                  {e.rate != null &&
                    e.type === 'drops' &&
                    e.rateEvidence === 'community-measured' &&
                    dest.kind !== 'currency' &&
                    row.kind !== 'currency' &&
                    (e.maxQuantity ?? 1) === 1 && <Calculator edge={e} />}
                </div>
              )
            })}
          </section>
        )
      })}
      <section className="panel padded">
        <h2>{t('Data availability', 'זמינות מידע')}</h2>
        {row.kind === 'item' && (
          <dl className="details">
            {[
              [t('Drop sources', 'מקורות שלל'), 'drops'],
              [t('Quest requirements', 'דרישות משימה'), 'requires_item'],
              [t('Quest rewards', 'תגמולי משימה'), 'rewards'],
              [t('NPC shops', 'חנויות'), 'sells'],
              [t('Crafting materials', 'חומרי יצירה'), 'material'],
              [t('Equipment compatibility', 'תאימות ציוד'), 'equippable_by'],
              [t('Upgrade uses', 'שימושי שדרוג'), 'upgrades'],
            ]
              .filter(([, type]) => !edges.some((e) => e.type === type))
              .map(([name]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{unknown}</dd>
                </div>
              ))}
            <div>
              <dt>{t('Market history', 'היסטוריית השוק')}</dt>
              <dd>{t('Not available', 'לא זמין')}</dd>
            </div>
          </dl>
        )}
        <p>
          {row.kind === 'item'
            ? t(
                'Missing drops, required quantities, rewards, prices, recipes and upgrade links are unknown. No verified market history is available.',
                'שלל, כמויות, תגמולים, מחירים, מתכונים ושדרוגים שלא הוצגו אינם ידועים. אין היסטוריית שוק מאומתת.',
              )
            : t(
                'Unlisted relationships have no evidence in this snapshot.',
                'קשרים שלא הוצגו אינם מתועדים בתמונת המצב.',
              )}
        </p>
      </section>
      <Credit />
    </>
  )
}
export default function Explorer() {
  const { t, lang } = useApp()
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? '',
    kind = params.get('kind') ?? ''
  const [data, setData] = useState<Atlas | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, retry] = useState(0)
  const [limit, setLimit] = useState(60)
  useEffect(() => {
    const abort = new AbortController()
    setFailed(false)
    fetch('/data/atlas.json', { signal: abort.signal })
      .then(async (r) => {
        if (!r.ok) throw Error()
        const body = await r.json()
        if (!Array.isArray(body.entities) || !Array.isArray(body.edges))
          throw Error()
        if (!abort.signal.aborted) setData(body)
      })
      .catch(() => {
        if (!abort.signal.aborted) setFailed(true)
      })
    return () => abort.abort()
  }, [attempt])
  const index = useMemo(() => (data ? indexAtlas(data) : null), [data])
  const results = useMemo(() => index?.search(q, kind) ?? [], [index, q, kind])
  function update(key: string, v: string) {
    const p = new URLSearchParams(params)
    if (v) p.set(key, v)
    else p.delete(key)
    setParams(p, { replace: true })
    setLimit(60)
  }
  if (failed)
    return (
      <Empty title={t('Database unavailable', 'המאגר אינו זמין')}>
        <button onClick={() => retry(attempt + 1)}>
          {t('Retry', 'ניסיון חוזר')}
        </button>
      </Empty>
    )
  if (!index || !data)
    return <Empty title={t('Loading database…', 'טוען מאגר…')} />
  if (id) {
    const row = index.entities.get(id)
    return (
      <>
        <Link className="back" to="/database">
          ← {t('Game database', 'מאגר המשחק')}
        </Link>
        {row ? (
          <Details key={id} row={row} index={index} />
        ) : (
          <Empty title={t('Record not found', 'הרשומה לא נמצאה')} />
        )}
      </>
    )
  }
  return (
    <>
      <Heading
        title={t('Game database', 'מאגר המשחק')}
        sub={t(
          'Explore documented drops, quests, shops and maps by name or ID.',
          'חיפוש שלל, משימות, חנויות ומפות לפי שם או מזהה.',
        )}
      />
      <section className="panel padded">
        <div className="filter-grid">
          <SearchBox
            label={t('Search every entity', 'חיפוש בכל המאגר')}
            value={q}
            change={(v) => update('q', v)}
          />
          <label>
            {t('Record type', 'סוג רשומה')}
            <select
              value={kind}
              onChange={(e) => update('kind', e.target.value)}
            >
              <option value="">{t('All records', 'כל הרשומות')}</option>
              {[...new Set(data.entities.map((e) => e.kind))]
                .sort()
                .map((k) => (
                  <option key={k} value={k}>
                    {lang === 'he' ? (kinds[k] ?? k) : k}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <p className="atlas-guide">
          <Link to="/database/item:green-mushroom-cap">
            {t('Trace a quest material', 'מעקב אחר חומר למשימה')} →
          </Link>{' '}
          ·{' '}
          <Link to="/database/item:red-potion">
            {t('Compare potion sources', 'השוואת מקורות שיקוי')} →
          </Link>{' '}
          ·{' '}
          <Link to="/database/recipe:92030000-5">
            {t('Inspect a crafting recipe', 'בדיקת מתכון יצירה')} →
          </Link>
        </p>
        <p role="status">
          {results.length} {t('matching records', 'רשומות מתאימות')}
        </p>
        <div className="atlas-list">
          {results.slice(0, limit).map((row) => (
            <Link key={row.id} to={'/database/' + encodeURIComponent(row.id)}>
              <BookOpen size={16} />
              <span>
                {row.name}
                <small>
                  {t(row.kind, kinds[row.kind] ?? row.kind)} · {row.version}
                </small>
              </span>
              <ChevronRight size={14} />
            </Link>
          ))}
        </div>
        {results.length > limit && (
          <button onClick={() => setLimit(limit + 60)}>
            {t('Show more', 'הצגת עוד')}
          </button>
        )}
      </section>
      <Credit />
    </>
  )
}
