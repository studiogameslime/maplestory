import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, SlidersHorizontal, Store } from 'lucide-react'
import { analyzeDemo } from './market-analysis'
import { type Listing, stale, valuation, assumedFee } from './domain'
import { useApp } from './state'
import { demoUrl } from './providers'
import {
  DemoBadge,
  Empty,
  Heading,
  ItemIcon,
  MarketBoundary,
  Provenance,
  SearchBox,
  SourceStatus,
} from './ui'

function ListingCard({
  item,
  detail = false,
}: {
  item: Listing
  detail?: boolean
}) {
  const { lang, num, t, date } = useApp()
  const v = valuation(item)
  const analysis = analyzeDemo(item, Date.now(), assumedFee)
  const fields = [
    [t('Asking price', 'מחיר מבוקש'), num(item.ask)],
    [
      t('Median sold · 7d', 'חציון מכירה · 7 ימים'),
      v.median === null ? '—' : num(v.median),
    ],
    [
      t('Est. net profit', 'רווח נקי משוער'),
      v.profit === null ? '—' : (v.profit > 0 ? '+' : '') + num(v.profit),
    ],
    [
      t('Est. margin', 'מרווח משוער'),
      v.margin === null ? '—' : num(v.margin * 100) + '%',
    ],
  ]
  const confidence = {
    high: t('High', 'גבוה'),
    medium: t('Medium', 'בינוני'),
    low: t('Low', 'נמוך'),
  }[v.confidence]
  return (
    <article className="panel listing">
      <div className="listing-head">
        <ItemIcon art={item.art} />
        <div>
          <small>{item.category[lang]}</small>
          <h2>{item.name[lang]}</h2>
        </div>
        <DemoBadge />
      </div>
      <p className="spec">
        {item.stats[lang]} ·{' '}
        {item.slots === null
          ? t('Slots N/A', 'ללא חריצים')
          : t('Slots left', 'חריצים פנויים') + ' ' + item.slots}
      </p>
      <dl className="metrics">
        {fields.map(([k, value]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd dir="auto">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="card-meta">
        <span>
          <Store size={14} />
          {t('Channel', 'ערוץ')} {item.channel} · FM {item.room}
        </span>
        <span>
          {num(v.volume)} {t('sales / 7d', 'מכירות בשבוע')}
        </span>
      </div>
      {detail ? (
        <>
          <dl className="details">
            <div>
              <dt>{t('Estimated gross profit', 'רווח גולמי משוער')}</dt>
              <dd>{analysis.gross === null ? '—' : num(analysis.gross)}</dd>
            </div>
            <div>
              <dt>
                {t(
                  'Price volatility · relative standard deviation',
                  'תנודתיות מחיר · סטיית תקן יחסית',
                )}
              </dt>
              <dd>
                {analysis.volatility === null
                  ? '—'
                  : num(analysis.volatility * 100) + '%'}
              </dd>
            </div>
            <div>
              <dt>
                {t(
                  'Weekly liquidity score / 100',
                  'ציון נזילות שבועי מתוך 100',
                )}
              </dt>
              <dd>{analysis.liquidity}</dd>
            </div>
            <div>
              <dt>{t('Evidence score / 100', 'ציון ראיות מתוך 100')}</dt>
              <dd>{analysis.confidence}</dd>
            </div>
            <div>
              <dt>{t('Seller', 'מוכר')}</dt>
              <dd>{item.seller}</dd>
            </div>
            <div>
              <dt>{t('Middle 50% of sales', '50% האמצעיים של המכירות')}</dt>
              <dd>
                {v.low === null || v.high === null
                  ? '—'
                  : num(v.low) + ' – ' + num(v.high)}
              </dd>
            </div>
            <div>
              <dt>{t('Sample confidence', 'ביטחון לפי גודל המדגם')}</dt>
              <dd>{confidence}</dd>
            </div>
            <div>
              <dt>{t('Liquidity risk', 'סיכון נזילות')}</dt>
              <dd>
                {v.volume >= 20
                  ? t('Lower', 'נמוך יחסית')
                  : v.volume >= 10
                    ? t('Moderate', 'בינוני')
                    : t('Elevated', 'גבוה')}
              </dd>
            </div>
            <div>
              <dt>{t('Observed in scenario', 'זמן תצפית בתרחיש')}</dt>
              <dd>{date(item.observedAt, true)}</dd>
            </div>
          </dl>
          <p className="muted">
            {t(
              'Comparable sales use the same item, stats, slots and unit basis. Net profit assumes resale at the seven-day median and a 3% selling fee. The fee is a scenario assumption.',
              'ההשוואה כוללת אותו פריט, נתונים, חריצים ויחידת מכירה. הרווח מניח מכירה בחציון השבועי ועמלה משוערת של 3%.',
            )}
          </p>
          <Provenance url={demoUrl}>
            {t('Authored demo fixture', 'תרחיש הדגמה מקומי')} ·{' '}
            {stale(item.observedAt)
              ? t('Historical sample', 'דוגמה היסטורית')
              : t('Fixed snapshot', 'תמונת מצב קבועה')}
          </Provenance>
        </>
      ) : (
        <Link to={'/market/' + item.id} className="listing-more">
          {t('Compare sold prices', 'השוואת מחירי מכירה')}
          <ChevronRight size={15} />
        </Link>
      )}
    </article>
  )
}

export default function Market() {
  const { t, lang, snapshot, budget, setBudget } = useApp()
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [volume, setVolume] = useState('0')
  const [confidence, setConfidence] = useState('all')
  const verified = params.get('mode') === 'verified'
  const items = snapshot?.listings ?? []
  const selected = items.find((i) => i.id === id)
  const rows = items.filter((i) => {
    const v = valuation(i)
    return (
      (!budget || i.ask <= Number(budget)) &&
      v.volume >= +volume &&
      (confidence === 'all' || v.confidence === confidence) &&
      [i.name.en, i.name.he, i.category[lang]]
        .join(' ')
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    )
  })
  return (
    <>
      <Heading
        title={t('Market Sniper', 'סורק השוק')}
        sub={t(
          'Compare Free Market asks with recent comparable sales.',
          'השוואת הצעות בשוק החופשי למכירות דומות אחרונות.',
        )}
      >
        {!verified && <DemoBadge />}
      </Heading>
      {id ? (
        <>
          <Link className="back" to="/market">
            <ArrowLeft size={16} />
            {t('All listings', 'כל ההצעות')}
          </Link>
          <MarketBoundary>
            {selected ? (
              <ListingCard item={selected} detail />
            ) : (
              <Empty title={t('Listing not found', 'ההצעה לא נמצאה')} />
            )}
          </MarketBoundary>
        </>
      ) : (
        <>
          <div className="tabs" aria-label={t('Listing source', 'מקור ההצעות')}>
            <button aria-pressed={!verified} onClick={() => setParams({})}>
              {t('Demo listings', 'הצעות לדוגמה')}
            </button>
            <button
              aria-pressed={verified}
              onClick={() => setParams({ mode: 'verified' })}
            >
              {t('Verified listings', 'הצעות מאומתות')}
            </button>
          </div>
          {verified ? (
            <section className="panel">
              <Empty
                title={t(
                  'No verified Free Market feed',
                  'אין מקור מאומת לשוק החופשי',
                )}
              >
                {t(
                  'A free feed with permission to reuse listings and completed sales is still required.',
                  'דרוש מקור חינמי המתיר שימוש בהצעות ובמכירות שהושלמו.',
                )}
              </Empty>
              <SourceStatus group="market" />
            </section>
          ) : (
            <>
              <div className="panel filter-panel">
                <h2>
                  <SlidersHorizontal size={18} />
                  {t('Listing filters', 'סינון הצעות')}
                </h2>
                <div className="filter-grid">
                  <SearchBox
                    value={search}
                    change={setSearch}
                    label={t('Search items', 'חיפוש פריטים')}
                  />
                  <label>
                    {t('Max budget · mesos', 'תקציב מרבי · מסוס')}
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budget}
                      placeholder={t('Any budget', 'כל תקציב')}
                      onChange={(e) => {
                        if (/^\d{0,14}$/.test(e.target.value))
                          setBudget(e.target.value)
                      }}
                    />
                  </label>
                  <label>
                    {t('Weekly sales', 'מכירות בשבוע')}
                    <select
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                    >
                      <option value="0">{t('Any volume', 'כל נפח')}</option>
                      <option value="10">10+</option>
                      <option value="20">20+</option>
                    </select>
                  </label>
                  <label>
                    {t('Sample confidence', 'ביטחון במדגם')}
                    <select
                      value={confidence}
                      onChange={(e) => setConfidence(e.target.value)}
                    >
                      <option value="all">
                        {t('Any confidence', 'כל הרמות')}
                      </option>
                      <option value="high">
                        {t('High · 20+ sales', 'גבוה · 20+ מכירות')}
                      </option>
                      <option value="medium">
                        {t('Medium · 10–19', 'בינוני · 10–19')}
                      </option>
                      <option value="low">
                        {t('Low · under 10', 'נמוך · פחות מ־10')}
                      </option>
                    </select>
                  </label>
                </div>
              </div>
              <MarketBoundary>
                {rows.length ? (
                  <div className="cards">
                    {rows.map((i) => (
                      <ListingCard item={i} key={i.id} />
                    ))}
                  </div>
                ) : (
                  <Empty title={t('No listings match', 'אין הצעות מתאימות')}>
                    <button
                      onClick={() => {
                        setBudget('')
                        setVolume('0')
                        setConfidence('all')
                        setSearch('')
                      }}
                    >
                      {t('Clear filters', 'ניקוי מסננים')}
                    </button>
                  </Empty>
                )}
              </MarketBoundary>
            </>
          )}
        </>
      )}
    </>
  )
}
