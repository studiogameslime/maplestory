import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import {
  ChevronRight,
  ChevronsUpDown,
  Globe2,
  Menu,
  PanelLeft,
  X,
} from 'lucide-react'
import './style.css'
import { AppProvider, useApp } from './state'
import { routes } from './navigation'
import Dashboard from './Dashboard'
import Market from './Market'
import Character from './Character'
import { Field } from './Field'
import { Hunt, Portfolio, Calculators } from './Economy'
import { Empty } from './ui'

function Sidebar({ close }: { close?: () => void }) {
  const { t, lang, profile } = useApp()
  return (
    <div className="rail">
      <div className="brand-row">
        <Link to="/" onClick={close} className="brand">
          <img src="/maple.svg" alt="" />
          <span>
            Maple<span className="brand-tail">Companion</span>
            <small>CLASSIC WORLD</small>
          </span>
        </Link>
        {close && (
          <button
            onClick={close}
            aria-label={t('Close navigation', 'סגירת ניווט')}
          >
            <X size={17} />
          </button>
        )}
      </div>
      <nav aria-label={t('Main navigation', 'ניווט ראשי')}>
        {[
          { title: t('Explore', 'גלו'), items: routes.slice(0, 5) },
          { title: t('Workspace', 'סביבת עבודה'), items: routes.slice(5) },
        ].map(({ title, items }) => (
          <div className="nav-group" key={title}>
            <h2>{title}</h2>
            {items.map(({ path, icon: Icon, ...name }) => (
              <NavLink key={path} to={path} end={path === '/'} onClick={close}>
                <Icon size={18} />
                {name[lang]}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <Link to="/character" className="rail-profile" onClick={close}>
        <span className="avatar">
          <img src="/art/adventurer.png" alt="" />
        </span>
        <span>
          <b dir="auto">{profile.name}</b>
          <small>
            {t('Lv.', 'רמה')} {profile.level} ·{' '}
            {profile.job === 'Assassin' ? t('Assassin', 'מתנקש') : profile.job}
          </small>
        </span>
        <ChevronsUpDown size={15} />
      </Link>
    </div>
  )
}
function App() {
  const { t, lang, setLang } = useApp()
  const { pathname } = useLocation()
  const current = routes.find((r) =>
    r.path === '/'
      ? pathname === '/'
      : pathname === r.path || pathname.startsWith(r.path + '/'),
  )
  const title = current?.[lang] ?? t('Page not found', 'הדף לא נמצא')
  const drawer = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    document.title = title + ' · MapleCompanion'
  }, [title])
  useEffect(() => {
    window.scrollTo(0, 0)
    drawer.current?.close()
  }, [pathname])
  return (
    <>
      <a href="#content" className="skip">
        {t('Skip to content', 'דילוג לתוכן')}
      </a>
      <aside className="desktop-rail">
        <Sidebar />
      </aside>
      <dialog
        ref={drawer}
        className="drawer"
        aria-label={t('Navigation', 'ניווט')}
        onClick={(e) => {
          if (e.target === drawer.current) drawer.current.close()
        }}
      >
        <Sidebar close={() => drawer.current?.close()} />
      </dialog>
      <div className="work-area">
        <header className="topbar">
          <div className="crumb">
            <PanelLeft size={16} className="desk-only" />
            <button
              className="menu-button"
              aria-label={t('Open navigation', 'פתיחת ניווט')}
              onClick={() => drawer.current?.showModal()}
            >
              <Menu size={20} />
            </button>
            <span className="crumb-root">{t('Workspace', 'סביבת עבודה')}</span>
            <ChevronRight size={13} />
            <strong>{title}</strong>
          </div>
          <div className="top-actions">
            <span className="world">
              <i />
              Classic World
            </span>
            <div className="language">
              <Globe2 size={15} />
              <button
                lang="en"
                aria-label="English"
                aria-pressed={lang === 'en'}
                onClick={() => setLang('en')}
              >
                EN
              </button>
              <span>/</span>
              <button
                lang="he"
                aria-label="עברית"
                aria-pressed={lang === 'he'}
                onClick={() => setLang('he')}
              >
                עברית
              </button>
            </div>
          </div>
        </header>
        <main id="content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market" element={<Market />} />
            <Route path="/market/:id" element={<Market />} />
            <Route path="/drops" element={<Field key="drops" type="drops" />} />
            <Route
              path="/quests"
              element={<Field key="quests" type="quests" />}
            />
            <Route path="/hunt" element={<Hunt />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/character" element={<Character />} />
            <Route
              path="*"
              element={
                <Empty title={title}>
                  <Link to="/">
                    {t('Back to dashboard', 'חזרה ללוח הבקרה')}
                  </Link>
                </Empty>
              }
            />
          </Routes>
        </main>
      </div>
    </>
  )
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
