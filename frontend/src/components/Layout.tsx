import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useThemeStore } from "@/store/theme"

export default function Layout() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const { theme, toggle } = useThemeStore()
  const logout = () => { localStorage.clear(); nav("/login") }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Bar - theme aware */}
      <header className="h-11 bg-card border-b border-border flex items-center gap-2 px-2 shrink-0 text-card-foreground">
        <button className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded text-muted-foreground" aria-label="Menu">☰</button>
        <div className="flex items-center gap-1.5 bg-primary/15 hover:bg-primary/20 px-2.5 py-1 rounded-[3px] cursor-pointer">
          <span className="w-5 h-5 bg-primary rounded-[2px] flex items-center justify-center text-primary-foreground font-bold text-xs">T</span>
          <span className="font-bold text-sm tracking-tight">ProjectFlow</span>
          <span className="text-xs bg-primary/20 px-1 rounded ml-1">Trello</span>
        </div>
        <div className="flex-1 max-w-[720px] mx-2 hidden md:flex">
          <div className="relative w-full">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">⌕</span>
            <input placeholder="Buscar" className="w-full bg-muted border border-border rounded-[5px] pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:bg-muted" />
          </div>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-3 py-1.5 rounded-[3px] flex items-center gap-1.5">✦ Crear</button>
        <div className="ml-auto flex items-center gap-1">
          <button className="h-8 w-8 hover:bg-muted rounded-full flex items-center justify-center text-muted-foreground">🔔</button>
          <button className="h-8 w-8 hover:bg-muted rounded-full flex items-center justify-center text-muted-foreground">ⓘ</button>
          <button onClick={toggle} className="h-8 w-8 hover:bg-muted rounded-full flex items-center justify-center text-muted-foreground" title="Toggle theme">{theme==="dark" ? "☀️" : "🌙"}</button>
          <span className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">EC</span>
          <select value={i18n.language} onChange={e=>i18n.changeLanguage(e.target.value)} className="bg-transparent text-xs text-muted-foreground border-0 focus:ring-0 hidden md:block">
            <option value="es" className="text-black">ES</option><option value="en" className="text-black">EN</option>
          </select>
        </div>
      </header>

      {/* 3-panel layout - now theme aware */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Bandeja de entrada */}
        <aside className="w-[280px] bg-card border-r border-border hidden lg:flex flex-col shrink-0 text-card-foreground">
          <div className="p-3 flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2"><span className="w-6 h-6 bg-muted rounded flex items-center justify-center text-xs">📥</span> Bandeja de entrada</h2>
            <div className="flex gap-1 text-muted-foreground"><button className="hover:text-foreground">≡</button><button className="hover:text-foreground">⋯</button></div>
          </div>
          <div className="px-3 pb-2">
            <div className="bg-muted rounded-[5px] px-3 py-2 text-sm text-muted-foreground">Añade una tarjeta</div>
          </div>
          <div className="flex-1 overflow-auto px-2 space-y-2 pb-2">
            <nav className="space-y-0.5">
              <NavLink to="/dashboard" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}><span className="text-base">▦</span> {t('nav.dashboard')}</NavLink>
              <NavLink to="/clients" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}><span>👥</span> {t('nav.clients')}</NavLink>
              <NavLink to="/projects" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}><span>📄</span> {t('nav.projects')}</NavLink>
              <NavLink to="/invoices" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}><span>📃</span> {t('nav.invoices')}</NavLink>
              <NavLink to="/documents" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>📁 Documents</NavLink>
              <NavLink to="/team" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>👥 Team</NavLink>
            </nav>
            <div className="pt-3 mt-3 border-t border-border">
              <p className="px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">AI</p>
              <NavLink to="/ai/planner" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>✦ AI Planner</NavLink>
              <NavLink to="/ai/summary" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>📊 Weekly Summary</NavLink>
              <NavLink to="/ai/chat" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>💬 AI Chat</NavLink>
            </div>
            <div className="space-y-2 mt-4">
              <div className="bg-muted rounded-[5px] p-2.5 border border-border">
                <div className="text-sm text-foreground">comer pollo</div>
                <div className="text-xs text-muted-foreground mt-1">Míralo, envíalo, guárdalo para más tarde</div>
                <div className="flex gap-2 mt-2 text-muted-foreground text-xs">✉️ ≡</div>
              </div>
            </div>
          </div>
          <div className="p-2 mt-auto space-y-1">
            <NavLink to="/settings" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}><span>⚙️</span> {t('nav.settings')}</NavLink>
            <NavLink to="/settings/theme" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-xs ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>🎨 Theme</NavLink>
            <NavLink to="/notifications" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-xs ${isActive?'bg-muted text-foreground':'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>🔔 Notifications</NavLink>
            <div className="bg-muted rounded-full px-3 py-2 flex items-center gap-2 text-xs mt-2 border border-border">
              <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground">✦</span>
              <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold">NUEVO</span>
              <span className="text-muted-foreground">Consolida tus tareas por hacer</span>
            </div>
            <button onClick={logout} className="w-full text-left px-2 py-2 hover:bg-muted rounded text-sm text-muted-foreground flex items-center gap-2">⎋ {t('nav.logout')}</button>
          </div>
        </aside>

        {/* Center: Planificador / Calendar */}
        <div className="w-[380px] bg-card border-r border-border hidden xl:flex flex-col shrink-0 text-card-foreground">
          <div className="h-10 flex items-center gap-2 px-3 border-b border-border bg-card">
            <span className="text-sm">📅</span>
            <select className="bg-transparent text-sm font-medium text-foreground focus:outline-none"><option>sept</option></select>
            <button className="ml-2 text-muted-foreground hover:text-foreground">‹</button><button className="bg-muted px-3 py-1 rounded text-sm text-foreground border border-border">Hoy</button><button className="text-muted-foreground hover:text-foreground">›</button>
            <div className="ml-auto flex gap-1"><button className="h-6 w-6 bg-muted rounded flex items-center justify-center text-muted-foreground">⚙️</button><button className="h-6 w-6 bg-muted rounded flex items-center justify-center text-muted-foreground">⋯</button></div>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <div className="bg-primary/10 rounded-lg p-4 text-center border border-border">
              <h3 className="font-semibold text-foreground">Conectar tu cuenta de calendario</h3>
              <p className="text-xs text-muted-foreground mt-2">Ve todos tus eventos. Arrastra, suelta y hazlo. Programa tus tareas pendientes en el calendario y dedica tiempo a lo que de verdad importa.</p>
              <button className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-1.5 rounded">↻ Conectar una cuenta</button>
            </div>
            <div className="mt-4 space-y-3">
              <div><h4 className="text-sm font-medium text-foreground">Hoy <span className="text-muted-foreground">mié 2 de septiembre</span></h4><p className="text-xs text-muted-foreground mt-1">No hay nada planeado para hoy</p></div>
              <div><h4 className="text-sm font-medium text-foreground">Mañana <span className="text-muted-foreground">jue 3 de septiembre</span></h4><p className="text-xs text-muted-foreground mt-1">No hay nada planeado</p></div>
              <div><h4 className="text-sm font-medium text-foreground">vie 4 de septiembre</h4><p className="text-xs text-muted-foreground mt-1">No hay nada planeado</p></div>
            </div>
          </div>
          <div className="p-2 flex gap-1 text-xs">
            <NavLink to="/calendar" className={({isActive})=>`px-3 py-1.5 rounded flex items-center gap-1 ${isActive?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground hover:bg-muted/80'}`}>📥 Bandeja de entrada</NavLink>
            <NavLink to="/dashboard" className={({isActive})=>`px-3 py-1.5 rounded flex items-center gap-1 ${isActive?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground hover:bg-muted/80'}`}>📅 Planificador</NavLink>
            <NavLink to="/projects" className={({isActive})=>`px-3 py-1.5 rounded flex items-center gap-1 ${isActive?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground hover:bg-muted/80'}`}>▦ Tablero</NavLink>
          </div>
        </div>

        {/* Right: Main board - now theme aware (background) */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="h-10 bg-card/50 backdrop-blur border-b border-border flex items-center gap-3 px-3 text-foreground">
            <h2 className="font-bold text-sm">Mi tablero de Trello</h2>
            <span className="text-xs text-muted-foreground">⋮ 00▾</span>
            <div className="ml-auto flex items-center gap-2">
              <button className="p-1 hover:bg-muted rounded">≡</button>
              <button className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium flex items-center gap-1">👤 Compartir</button>
              <button className="hover:bg-muted p-1 rounded">⋯</button>
            </div>
          </div>
          <main id="main" className="flex-1 overflow-auto focus:outline-none bg-background" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
