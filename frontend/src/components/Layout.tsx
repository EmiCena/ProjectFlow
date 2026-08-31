import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
export default function Layout() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const logout = () => { localStorage.clear(); nav("/login") }
  const linkBase = "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 min-h-[44px]"
  const active = "bg-primary text-white shadow-sm"
  const idle = "text-slate-300 hover:bg-white/10 hover:text-white"
  return (
    <div className="min-h-screen flex bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-foreground px-3 py-2 rounded shadow z-50">Skip to main</a>
      <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col border-r border-slate-800 sticky top-0 h-dvh overflow-auto" aria-label="Primary navigation">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white text-sm font-mono">PF</span>
            ProjectFlow
          </h1>
          <p className="text-xs text-slate-400 mt-1">Agency OS — {i18n.language.toUpperCase()}</p>
        </div>
        <nav className="space-y-1 flex-1" role="navigation" aria-label="Main">
          <NavLink to="/dashboard" className={({isActive})=> `${linkBase} ${isActive?active:idle}`} aria-current="page">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/clients" className={({isActive})=> `${linkBase} ${isActive?active:idle}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            {t('nav.clients')}
          </NavLink>
          <NavLink to="/projects" className={({isActive})=> `${linkBase} ${isActive?active:idle}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            {t('nav.projects')}
          </NavLink>
          <NavLink to="/invoices" className={({isActive})=> `${linkBase} ${isActive?active:idle}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            {t('nav.invoices')}
          </NavLink>
          <div className="pt-3 mt-3 border-t border-white/10">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">AI</p>
            <NavLink to="/ai/planner" className={({isActive})=> `${linkBase} ${isActive?active:idle}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>
              AI Planner
            </NavLink>
            <NavLink to="/ai/summary" className={({isActive})=> `${linkBase} ${isActive?active:idle}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Weekly Summary
            </NavLink>
          </div>
        </nav>
        <div className="space-y-2 pt-4 border-t border-white/10">
          <label htmlFor="lang" className="sr-only">Language</label>
          <select id="lang" value={i18n.language} onChange={e=>i18n.changeLanguage(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-md px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white/20">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
          <button onClick={logout} className="w-full text-left px-3 py-2.5 hover:bg-white/10 rounded-md text-sm min-h-[44px] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" aria-label="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {t('nav.logout')}
          </button>
        </div>
      </aside>
      <main id="main" className="flex-1 bg-background overflow-auto min-h-dvh focus:outline-none" tabIndex={-1}><Outlet /></main>
    </div>
  )
}
