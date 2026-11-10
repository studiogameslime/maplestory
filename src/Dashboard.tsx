import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  ArrowUpRight,
  ChartNoAxesCombined,
  ChevronRight,
  CircleDollarSign,
  Crosshair,
  Database,
  Gem,
  ScrollText,
  Swords,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { dailyMedians, valuation, type Listing } from './domain'
import { useApp } from './state'
import { DemoBadge, Go, Heading, ItemIcon, MarketBoundary } from './ui'

function Trend({ listings }: { listings: Listing[] }) {
  const { t, lang, num } = useApp()
  const [id, setId] = useState(listings[0].id)
  const [days, setDays] = useState(7)
  const item = listings.find((i) => i.id === id) ?? listings[0]
  const points = dailyMedians(item, days)
  const [first, last] = [points[0], points.at(-1)]
  const max = Math.max(...points.map((p) => p.value)) * 1.035
  const min = Math.min(...points.map((p) => p.value)) * 0.96
  const coords = points.map((p, i) => [
    4 + (i * 247) / Math.max(1, points.length - 1),
    94 - ((p.value - min) / (max - min || 1)) * 86,
  ])
  const path = coords
    .map(([x, y], i) => (i ? 'L' : 'M') + x + ',' + y)
    .join(' ')
  const change =
    first && last && first.value > 0
      ? 100 * (last.value / first.value - 1)
      : null
  return (
    <section className="panel trend-panel">
      <div className="panel-head">
        <h2>
          <ChartNoAxesCombined className="accent" />{' '}
          {t('Price trend', 'מגמת מחירים')}
        </h2>
        <select
          className="tiny-select"
          value={days}
          onChange={(e) => setDays(+e.target.value)}
          aria-label={t('Chart period', 'תקופת הגרף')}
        >
          <option value="7">{t('7 days', '7 ימים')}</option>
          <option value="14">{t('14 days', '14 ימים')}</option>
        </select>
      </div>
      <div className="trend-body">
        <label>
          <span className="sr-only">{t('Trend item', 'פריט לגרף')}</span>
          <select
            className="item-select"
            value={item.id}
            onChange={(e) => setId(e.target.value)}
          >
            {listings.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name[lang]}
              </option>
            ))}
          </select>
        </label>
        {last && (
          <div className="trend-number">
            <b>{num(last.value)}</b>
            <small>{t('mesos', 'מסוס')}</small>
            {change !== null && (
              <span className={change >= 0 ? 'positive' : 'negative'} dir="ltr">
                {change >= 0 ? '↗ +' : '↘ '}
                {num(change)}%
              </span>
            )}
          </div>
        )}
        {points.length > 0 ? (
          <>
            <div className="chart" dir="ltr">
              <svg
                viewBox="0 0 256 104"
                preserveAspectRatio="none"
                role="img"
                aria-label={t(
                  'Daily median demo sale prices',
                  'מחירי מכירה יומיים חציוניים בהדגמה',
                )}
              >
                <defs>
                  <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#eea26c" stopOpacity=".26" />
                    <stop offset="1" stopColor="#eea26c" stopOpacity=".01" />
                  </linearGradient>
                </defs>
                {[15, 50, 85].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="256"
                    y1={y}
                    y2={y}
                    stroke="#34333a"
                    strokeDasharray="3 4"
                  />
                ))}
                <path d={path + ' L251,104 L4,104 Z'} fill="url(#area)" />
                <path
                  d={path}
                  fill="none"
                  stroke="#f0a36a"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
                {coords.map(([x, y], i) => (
                  <circle key={x} cx={x} cy={y} r="2.5" fill="#ffc28d">
                    <title>
                      {points[i].date + ' · ' + num(points[i].value)}
                    </title>
                  </circle>
                ))}
              </svg>
            </div>
            <div className="chart-labels" dir="ltr">
              {[first, last].map(
                (p, i) =>
                  p && (
                    <span key={i}>
                      {new Date(p.date).toLocaleDateString(
                        lang === 'he' ? 'he-IL' : 'en-US',
                        { month: 'short', day: 'numeric', timeZone: 'UTC' },
                      )}
                    </span>
                  ),
              )}
            </div>
          </>
        ) : (
          <p>{t('No comparable sales', 'אין מכירות להשוואה')}</p>
        )}
      </div>
      <footer className="panel-foot">
        <Database size={13} />
        {t('Demo snapshot · daily median', 'תמונת מצב לדוגמה · חציון יומי')}
      </footer>
    </section>
  )
}

export default function Dashboard() {
  const { t, lang, num, profile, snapshot } = useApp()
  const items = snapshot?.listings ?? []
  const tools = [
    {
      to: '/drops',
      title: t('Drop Atlas', 'אטלס השלל'),
      sub: t('Find monster drops', 'חיפוש שלל מפלצות'),
      icon: Gem,
      color: 'violet',
    },
    {
      to: '/quests',
      title: t('Quest Journal', 'יומן משימות'),
      sub: t('Explore quest rewards', 'איתור תגמולים'),
      icon: ScrollText,
      color: 'gold',
    },
    {
      to: '/hunt',
      title: t('Hunt Planner', 'תכנון ציד'),
      sub: t('Estimate training profit', 'אומדן רווחי אימון'),
      icon: Crosshair,
      color: 'mint',
    },
    {
      to: '/calculators',
      title: t('Calculators', 'מחשבונים'),
      sub: t('Check odds and costs', 'חישוב סיכויים ועלויות'),
      icon: CircleDollarSign,
      color: 'blue',
    },
  ]
  return (
    <>
      <Heading
        title={t('Dashboard', 'לוח בקרה')}
        sub={t(
          'Your character, market watch, and field tools.',
          'הדמות, מעקב השוק וכלי השטח שלך.',
        )}
      >
        <DemoBadge />
      </Heading>
      <section className="hero">
        <div className="hero-img" />
        <div className="hero-content">
          <div className="eyebrow">
            <span className="hero-rule" />
            {t('Character overview', 'סקירת דמות')}
          </div>
          <h2 dir="auto">{profile.name}</h2>
          <div className="hero-meta">
            <span className="level">
              {t('Lv.', 'רמה')} {profile.level}
            </span>
            <span>
              <Swords size={15} />
              {profile.job === 'Assassin'
                ? t('Assassin', 'מתנקש')
                : profile.job}
            </span>
          </div>
          <Link className="hero-button" to="/character">
            {t('View character', 'הצגת הדמות')} <ArrowRight size={15} />
          </Link>
        </div>
        <span className="hero-source">
          <span className="dot" />
          {t('Manual profile', 'פרופיל ידני')}
        </span>
      </section>
      <MarketBoundary>
        <div className="dash-grid">
          <section className="panel deals-panel">
            <div className="panel-head">
              <h2>
                <Crosshair className="accent" />
                {t('Market watch', 'מעקב שוק')}
              </h2>
              <Go to="/market">{t('Open market', 'פתיחת השוק')}</Go>
            </div>
            <div className="table-scroll">
              <table className="watch-table">
                <thead>
                  <tr>
                    <th>{t('Item', 'פריט')}</th>
                    <th>{t('Ask · mesos', 'מחיר · מסוס')}</th>
                    <th>{t('Est. margin', 'מרווח משוער')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(0, 3).map((i) => {
                    const m = valuation(i).margin
                    return (
                      <tr key={i.id}>
                        <td>
                          <Link className="item-link" to={'/market/' + i.id}>
                            <ItemIcon art={i.art} />
                            <span>
                              <strong>{i.name[lang]}</strong>
                              <small>{i.category[lang]}</small>
                            </span>
                          </Link>
                        </td>
                        <td className="price">{num(i.ask)}</td>
                        <td>
                          <span
                            className={
                              m !== null && m < 0 ? 'negative' : 'positive'
                            }
                            dir="ltr"
                          >
                            {m === null
                              ? '—'
                              : (m > 0 ? '+' : '') +
                                num(Math.round(m * 1000) / 10) +
                                '%'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <footer className="panel-foot">
              <Database size={13} />
              {t('Demo listings · Free Market', 'הצעות לדוגמה · השוק החופשי')}
            </footer>
          </section>
          <Trend listings={items} />
        </div>
      </MarketBoundary>
      <section className="quick">
        <div className="section-title">
          <BookOpen size={18} />
          <h2>{t('Game database', 'מאגר המשחק')}</h2>
          <span />
          <Go to="/database">{t('Search records', 'חיפוש רשומות')}</Go>
        </div>
      </section>
      <section className="quick">
        <div className="section-title">
          <h2>{t('Quick access', 'גישה מהירה')}</h2>
          <span />
        </div>
        <div className="quick-grid">
          {tools.map(({ to, title, sub, icon: Icon, color }) => (
            <Link to={to} key={to} className="quick-card">
              <span className={'tool-icon ' + color}>
                <Icon size={21} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{sub}</small>
              </span>
              <ChevronRight className="q-arrow" size={15} />
            </Link>
          ))}
        </div>
      </section>
      <Link className="dashboard-note" to="/market?mode=verified">
        <span className="status-dot" />
        {t(
          'Verified Free Market feed unavailable',
          'הזנת נתוני שוק מאומתים אינה זמינה',
        )}
        <ArrowUpRight size={13} />
      </Link>
    </>
  )
}
