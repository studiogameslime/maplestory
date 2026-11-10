import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, Search, Pencil, Radar } from 'lucide-react'
import { lookup, LookupError, type Ranking } from './providers'
import { stale } from './domain'
import { useApp } from './state'
import { Heading, Provenance } from './ui'

let retryAt = 0
export default function Character() {
  const { profile, setProfile, t, date } = useApp()
  const [name, setName] = useState(profile.name)
  const [job, setJob] = useState(profile.job)
  const [level, setLevel] = useState(String(profile.level))
  const [saved, setSaved] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'ready' | 'missing' | 'limited' | 'unavailable'
  >('idle')
  const [result, setResult] = useState<Ranking | null>(null)
  const [wait, setWait] = useState(
    Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)),
  )
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => {
    if (!wait) return
    const timer = window.setTimeout(
      () => setWait(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000))),
      1000,
    )
    return () => clearTimeout(timer)
  }, [wait])
  function save(e: FormEvent) {
    e.preventDefault()
    if (
      !name.trim() ||
      !job.trim() ||
      !Number.isInteger(+level) ||
      +level < 1 ||
      +level > 200
    )
      return
    setProfile({
      name: name.trim(),
      job: job.trim(),
      level: +level,
      updated: new Date().toISOString(),
    })
    setSaved(true)
  }
  async function search(e: FormEvent) {
    e.preventDefault()
    if (!query.trim() || wait || status === 'loading') return
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    setStatus('loading')
    setResult(null)
    const timeout = setTimeout(() => request.abort('timeout'), 12000)
    try {
      const ranking = await lookup(query, request.signal)
      if (!request.signal.aborted) {
        setResult(ranking)
        setStatus('ready')
      }
    } catch (err) {
      if (request.signal.aborted && request.signal.reason !== 'timeout') return
      const reason = err instanceof LookupError ? err.reason : 'unavailable'
      if (reason === 'limited' && err instanceof LookupError) {
        retryAt = Date.now() + err.retryAfter * 1000
        setWait(err.retryAfter)
      }
      setStatus(reason)
    } finally {
      clearTimeout(timeout)
    }
  }
  return (
    <>
      <Heading
        title={t('Character', 'דמות')}
        sub={t(
          'Manage your local profile or look up a public ranking.',
          'ניהול פרופיל מקומי וחיפוש בדירוג הציבורי.',
        )}
      />
      <div className="two-col">
        <section className="panel padded">
          <h2>
            <Pencil className="accent" />
            {t('Manual profile', 'פרופיל ידני')}
          </h2>
          <div className="profile-banner">
            <img src="/art/adventurer.png" alt="" />
            <div>
              <h3 dir="auto">{profile.name}</h3>
              <small>
                {t('Level', 'רמה')} {profile.level} ·{' '}
                {profile.job === 'Assassin'
                  ? t('Assassin', 'מתנקש')
                  : profile.job}
              </small>
            </div>
          </div>
          <form
            onSubmit={save}
            onChange={() => setSaved(false)}
            className="form-stack"
          >
            <label>
              {t('Character name', 'שם הדמות')}
              <input
                required
                maxLength={32}
                pattern=".*\S.*"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              {t('Class', 'מקצוע')}
              <input
                required
                maxLength={40}
                pattern=".*\S.*"
                value={job}
                onChange={(e) => setJob(e.target.value)}
              />
            </label>
            <label>
              {t('Level', 'רמה')}
              <input
                required
                type="number"
                min="1"
                max="200"
                step="1"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />
            </label>
            <button className="primary">
              {t('Save profile', 'שמירת פרופיל')}
            </button>
            {saved && (
              <span className="success" role="status">
                <Check size={16} />
                {t('Profile saved', 'הפרופיל נשמר')}
              </span>
            )}
          </form>
          <Provenance>
            {t('User supplied', 'נתוני משתמש')} · {date(profile.updated)}
          </Provenance>
        </section>
        <section className="panel padded">
          <h2>
            <Radar className="accent" />
            {t('Public lookup', 'חיפוש ציבורי')}
          </h2>
          <p>
            {t(
              'Search for an exact character name in the Windia rankings. Results describe a public character.',
              'חיפוש שם דמות מדויק בדירוג של וינדיה. התוצאה מציגה דמות ציבורית.',
            )}
          </p>
          <form className="form-stack" onSubmit={search}>
            <label>
              {t('Exact character name', 'שם דמות מדויק')}
              <input
                required
                maxLength={40}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              disabled={!query.trim() || status === 'loading' || wait > 0}
            >
              <Search size={16} />
              {wait
                ? t('Retry in', 'ניסיון חוזר בעוד') +
                  ' ' +
                  wait +
                  t('s', ' שנ׳')
                : t('Search ClassicRank', 'חיפוש ב־ClassicRank')}
            </button>
          </form>
          <div role="status" className="lookup-state">
            {status === 'loading' &&
              t('Fetching public profile…', 'טוען פרופיל ציבורי…')}
            {status === 'missing' &&
              t(
                'No public record found for that name.',
                'לא נמצאה רשומה ציבורית בשם זה.',
              )}
            {status === 'limited' &&
              t(
                'The provider rate limit was reached. Please retry after the cooldown.',
                'הגעתם למגבלת הבקשות. אפשר לנסות שוב בתום ההמתנה.',
              )}
            {status === 'unavailable' &&
              t(
                'Lookup unavailable. Check your connection or try again later.',
                'החיפוש אינו זמין. בדקו את החיבור או נסו שוב מאוחר יותר.',
              )}
          </div>
          {result && (
            <div className="lookup-result">
              <h3 dir="auto">{result.name}</h3>
              <p>
                {t('Level', 'רמה')} {result.level} ·{' '}
                {result.job ?? t('Unknown class', 'מקצוע לא ידוע')}
              </p>
              <dl className="details">
                <div>
                  <dt>{t('Provider rank', 'מיקום בדירוג המקור')}</dt>
                  <dd>{result.rank ?? '—'}</dd>
                </div>
                <div>
                  <dt>{t('Observed', 'נצפה')}</dt>
                  <dd>
                    {result.observedAt
                      ? date(result.observedAt, true)
                      : t('Unknown', 'לא ידוע')}
                  </dd>
                </div>
                <div>
                  <dt>{t('Fetched', 'התקבל')}</dt>
                  <dd>{date(result.fetchedAt, true)}</dd>
                </div>
              </dl>
              {result.observedAt && stale(result.observedAt) && (
                <p className="warning">
                  {t(
                    'Stale observation · over 24 hours old',
                    'תצפית ישנה · מעל 24 שעות',
                  )}
                </p>
              )}
              <a href={result.url} target="_blank" rel="noreferrer">
                {t('Public source profile', 'פרופיל המקור הציבורי')} ↗
              </a>
            </div>
          )}
          <Provenance url="https://classicrank.com">
            {t(
              'Rankings provided by ClassicRank',
              'נתוני דירוג מאת ClassicRank',
            )}
          </Provenance>
        </section>
      </div>
    </>
  )
}
