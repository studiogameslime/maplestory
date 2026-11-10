import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Language, Position, Profile, Snapshot } from './domain'
import { demoMarket } from './providers'

function useSaved<T>(
  key: string,
  initial: T,
  validate: (v: unknown) => v is T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem('maple.v1.' + key) ?? 'null',
      )
      return validate(saved) ? saved : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('maple.v1.' + key, JSON.stringify(value))
    } catch {
      /* Keep session usable if storage is full or private. */
    }
  }, [key, value])
  return [value, setValue] as const
}
const isProfile = (v: unknown): v is Profile => {
  const p = v as Profile | null
  return (
    !!p &&
    typeof p.name === 'string' &&
    typeof p.job === 'string' &&
    Number.isInteger(p.level) &&
    p.level > 0 &&
    p.level <= 200 &&
    Number.isFinite(Date.parse(p.updated))
  )
}
const isPositions = (v: unknown): v is Position[] =>
  Array.isArray(v) &&
  v.every(
    (p) =>
      p &&
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      typeof p.sold === 'boolean' &&
      Number.isInteger(p.qty) &&
      p.qty > 0 &&
      [p.cost, p.value].every((n) => Number.isFinite(n) && n >= 0),
  )
function useAppState() {
  const [lang, setLang] = useSaved<Language>(
    'language',
    'en',
    (v): v is Language => v === 'en' || v === 'he',
  )
  const [profile, setProfile] = useSaved<Profile>(
    'profile',
    { name: 'TeamderApp', job: 'Assassin', level: 35, updated: '2026-11-10' },
    isProfile,
  )
  const [budget, setBudget] = useSaved<string>(
    'budget',
    '',
    (v): v is string => typeof v === 'string' && /^\d{0,14}$/.test(v),
  )
  const [tracked, setTracked] = useSaved<string[]>(
    'quests',
    [],
    (v): v is string[] =>
      Array.isArray(v) && v.every((id) => typeof id === 'string'),
  )
  const [positions, setPositions] = useSaved<Position[]>(
    'inventory',
    [],
    isPositions,
  )
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [marketState, setMarketState] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setMarketState('loading')
    demoMarket(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setSnapshot(data)
          setMarketState('ready')
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setMarketState('error')
      })
    return () => controller.abort()
  }, [version])
  const t = useCallback(
    (en: string, he: string) => (lang === 'he' ? he : en),
    [lang],
  )
  const locale = lang === 'he' ? 'he-IL' : 'en-US'
  const num = (n: number, compact = false) =>
    new Intl.NumberFormat(locale, {
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 1 : 2,
    }).format(n)
  const date = (iso: string, time = false) =>
    new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(time
        ? ({
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          } as const)
        : {}),
      timeZone: 'UTC',
    }).format(new Date(iso))
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
  }, [lang])
  return {
    lang,
    setLang,
    t,
    num,
    date,
    profile,
    setProfile,
    budget,
    setBudget,
    tracked,
    setTracked,
    positions,
    setPositions,
    snapshot,
    marketState,
    retry: () => setVersion((v) => v + 1),
  }
}
const State = createContext<ReturnType<typeof useAppState> | null>(null)
export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppState()
  return <State.Provider value={value}>{children}</State.Provider>
}
export function useApp() {
  const state = useContext(State)
  if (!state) throw new Error('AppProvider missing')
  return state
}
