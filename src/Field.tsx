import { useState } from 'react'
import { Bookmark, Check, MapPin, ScrollText } from 'lucide-react'
import { drops, quests } from './catalog'
import { useApp } from './state'
import {
  DemoBadge,
  Empty,
  Heading,
  ItemIcon,
  Provenance,
  SearchBox,
  SourceStatus,
} from './ui'
const source =
  'https://github.com/studiogameslime/maplestory/blob/main/src/catalog.ts'
export function Field({ type }: { type: 'drops' | 'quests' }) {
  const { t, lang, num, tracked, setTracked } = useApp()
  const [query, setQuery] = useState('')
  const [max, setMax] = useState('')
  const [saved, setSaved] = useState(false)
  const [sort, setSort] = useState('level')
  const isDrop = type === 'drops'
  const matches = (names: string[], level: number) =>
    (!max || level <= +max) &&
    names.join(' ').toLowerCase().includes(query.trim().toLowerCase())
  const monsters = drops.filter((r) =>
    matches(
      [
        ...Object.values(r.monster),
        ...Object.values(r.item),
        ...Object.values(r.map),
      ],
      r.level,
    ),
  )
  const tasks = quests
    .filter(
      (q) =>
        matches(
          [...Object.values(q.title), ...Object.values(q.reward)],
          q.level,
        ) &&
        (!saved || tracked.includes(q.id)),
    )
    .sort((a, b) =>
      sort === 'level' ? a.level - b.level : b.qty * b.unit - a.qty * a.unit,
    )
  return (
    <>
      <Heading
        title={
          isDrop
            ? t('Drop Atlas', 'אטלס השלל')
            : t('Quest Journal', 'יומן משימות')
        }
        sub={
          isDrop
            ? t(
                'Look up a monster, item, or hunting ground.',
                'חיפוש לפי מפלצת, פריט או אזור ציד.',
              )
            : t(
                'Find rewards and keep a list of quests to revisit.',
                'מציאת תגמולים ושמירת משימות למעקב.',
              )
        }
      >
        <DemoBadge />
      </Heading>
      <div className="panel filter-panel">
        <div className="filter-grid">
          <SearchBox
            value={query}
            change={setQuery}
            label={
              isDrop
                ? t('Search monster, item, or map', 'חיפוש מפלצת, פריט או מפה')
                : t('Search quest or reward', 'חיפוש משימה או תגמול')
            }
          />
          <label>
            {t('Maximum level', 'רמה מרבית')}
            <input
              inputMode="numeric"
              placeholder={t('All levels', 'כל הרמות')}
              value={max}
              onChange={(e) => {
                if (/^\d{0,3}$/.test(e.target.value)) setMax(e.target.value)
              }}
            />
          </label>
          {!isDrop && (
            <>
              <label>
                {t('Sort by', 'מיון לפי')}
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="level">
                    {t('Minimum level', 'רמת מינימום')}
                  </option>
                  <option value="value">
                    {t('Reward value', 'שווי תגמול')}
                  </option>
                </select>
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={saved}
                  onChange={(e) => setSaved(e.target.checked)}
                />
                {t('Tracked only', 'במעקב בלבד')}
              </label>
            </>
          )}
        </div>
      </div>
      <div className="cards">
        {isDrop
          ? monsters.map((r) => (
              <article className="panel entry" key={r.id}>
                <div className="listing-head">
                  <ItemIcon art={r.art} />
                  <div>
                    <small>
                      {t('Level', 'רמה')} {r.level}
                    </small>
                    <h2>{r.monster[lang]}</h2>
                  </div>
                </div>
                <p className="with-icon">
                  <MapPin size={15} />
                  {r.map[lang]}
                </p>
                <dl className="details">
                  <div>
                    <dt>{t('Item drop', 'פריט שלל')}</dt>
                    <dd>{r.item[lang]}</dd>
                  </div>
                  <div>
                    <dt>{t('Scenario drop chance', 'סיכוי נפילה בתרחיש')}</dt>
                    <dd>
                      {r.chance === null
                        ? t('Unknown', 'לא ידוע')
                        : num(r.chance) + '%'}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('Evidence', 'בסיס הנתונים')}</dt>
                    <dd>{t('Unverified example', 'דוגמה לא מאומתת')}</dd>
                  </div>
                </dl>
              </article>
            ))
          : tasks.map((q) => (
              <article className="panel entry" key={q.id}>
                <div className="listing-head">
                  <span className="tool-icon gold">
                    <ScrollText />
                  </span>
                  <div>
                    <small>
                      {t('Level', 'רמה')} {q.level}+
                    </small>
                    <h2>{q.title[lang]}</h2>
                  </div>
                </div>
                <p>{q.prereq[lang]}</p>
                <dl className="details">
                  <div>
                    <dt>{t('Reward', 'תגמול')}</dt>
                    <dd>{q.reward[lang]}</dd>
                  </div>
                  <div>
                    <dt>EXP</dt>
                    <dd>{num(q.xp)}</dd>
                  </div>
                  <div>
                    <dt>{t('Estimated value', 'שווי משוער')}</dt>
                    <dd>
                      {num(q.qty * q.unit)} {t('mesos', 'מסוס')}
                    </dd>
                  </div>
                </dl>
                <button
                  aria-pressed={tracked.includes(q.id)}
                  onClick={() =>
                    setTracked((prev) =>
                      prev.includes(q.id)
                        ? prev.filter((id) => id !== q.id)
                        : [...prev, q.id],
                    )
                  }
                >
                  {tracked.includes(q.id) ? (
                    <Check size={15} />
                  ) : (
                    <Bookmark size={15} />
                  )}{' '}
                  {tracked.includes(q.id)
                    ? t('Tracked', 'במעקב')
                    : t('Track quest', 'מעקב אחר משימה')}
                </button>
              </article>
            ))}
      </div>
      {!(isDrop ? monsters : tasks).length && (
        <Empty title={t('No matches', 'אין תוצאות')} />
      )}
      <Provenance url={source}>
        {isDrop
          ? t(
              'Original scenarios. Rates and locations are illustrative.',
              'תרחישים מקוריים. השיעורים והמיקומים להמחשה.',
            )
          : t(
              'Original scenarios. Estimated value uses quantity × sample unit price.',
              'תרחישים מקוריים. השווי מחושב לפי כמות כפול מחיר יחידה לדוגמה.',
            )}
      </Provenance>
      <SourceStatus group={type} />
    </>
  )
}
