import type { ReactNode } from 'react'
import {
  ArrowUpRight,
  Database,
  Inbox,
  LoaderCircle,
  Search,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from './state'
import { disabledSources } from './providers'
import { AssetImage } from './AssetImage'

export function DemoBadge() {
  const { t } = useApp()
  return (
    <span className="badge demo">
      <span className="dot" />
      {t('Demo data', 'נתוני הדגמה')}
    </span>
  )
}
export function Heading({
  title,
  sub,
  children,
}: {
  title: string
  sub: string
  children?: ReactNode
}) {
  return (
    <header className="heading">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {children}
    </header>
  )
}
export function Go({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="go" to={to}>
      {children}
      <ArrowUpRight size={15} />
    </Link>
  )
}
export function Empty({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="empty" role="status">
      <Inbox size={26} />
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}
export function MarketBoundary({ children }: { children: ReactNode }) {
  const { marketState, t, retry, snapshot } = useApp()
  if (marketState === 'loading')
    return (
      <div className="empty" role="status">
        <LoaderCircle className="spin" />
        {t('Loading the sample snapshot…', 'טוען את תמונת המצב לדוגמה…')}
      </div>
    )
  if (marketState === 'error')
    return (
      <div className="empty" role="alert">
        <TriangleAlert />
        {t('The demo snapshot could not be read.', 'טעינת נתוני ההדגמה נכשלה.')}
        <button onClick={retry}>{t('Try again', 'ניסיון חוזר')}</button>
      </div>
    )
  if (!snapshot?.listings.length)
    return (
      <Empty
        title={t('No listings in this snapshot', 'אין הצעות בתמונת המצב הזו')}
      />
    )
  return <>{children}</>
}
export function Provenance({
  children,
  url,
}: {
  children: ReactNode
  url?: string
}) {
  const { t } = useApp()
  return (
    <div className="provenance">
      <Database size={14} />
      <span>{children}</span>
      {url && (
        <a href={url} target="_blank" rel="noreferrer">
          {t('Source', 'מקור')} ↗
        </a>
      )}
    </div>
  )
}
export function SourceStatus({
  group,
}: {
  group: keyof typeof disabledSources
}) {
  const { t, lang } = useApp()
  return (
    <details className="sources">
      <summary>{t('External data sources', 'מקורות נתונים חיצוניים')}</summary>
      {disabledSources[group].map((source) => (
        <Provenance key={source.name} url={source.url}>
          <b>{source.name}</b> · {source.reason[lang]}
        </Provenance>
      ))}
    </details>
  )
}
export function SearchBox({
  value,
  change,
  label,
}: {
  value: string
  change: (v: string) => void
  label: string
}) {
  return (
    <label className="search">
      <Search size={17} />
      <input
        type="search"
        value={value}
        onChange={(e) => change(e.target.value)}
        placeholder={label}
        aria-label={label}
      />
    </label>
  )
}
export function ItemIcon({ art }: { art: string }) {
  return (
    <span className={'item-icon ' + art}>
      <AssetImage kind="illustration" id={art} label="" />
    </span>
  )
}
