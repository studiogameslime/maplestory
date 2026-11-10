import {
  LayoutDashboard,
  Store,
  Gem,
  ScrollText,
  Crosshair,
  UserRound,
  BriefcaseBusiness,
  Calculator,
} from 'lucide-react'
export const routes = [
  { path: '/', en: 'Dashboard', he: 'לוח בקרה', icon: LayoutDashboard },
  { path: '/market', en: 'Market Sniper', he: 'סורק השוק', icon: Store },
  { path: '/drops', en: 'Drop Atlas', he: 'אטלס השלל', icon: Gem },
  { path: '/quests', en: 'Quest Journal', he: 'יומן משימות', icon: ScrollText },
  { path: '/hunt', en: 'Hunt Planner', he: 'תכנון ציד', icon: Crosshair },
  { path: '/character', en: 'Character', he: 'דמות', icon: UserRound },
  {
    path: '/portfolio',
    en: 'Portfolio',
    he: 'תיק השקעות',
    icon: BriefcaseBusiness,
  },
  { path: '/calculators', en: 'Calculators', he: 'מחשבונים', icon: Calculator },
] as const
