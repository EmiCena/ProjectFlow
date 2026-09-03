import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useThemeStore } from "@/store/theme"

export default function Layout() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const { theme, toggle } = useThemeStore()
  const logout = () => { localStorage.clear(); nav("/login") }

  return (
    <div className="min-h-screen bg-[#212121] text-white flex flex-col overflow-hidden">
      {/* Trello Top Bar */}
      <header className="h-11 bg-[#1d2125] border-b border-[#3c4043] flex items-center gap-2 px-2 shrink-0">
        <button className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded text-white/80" aria-label="Menu">☰</button>
        <div className="flex items-center gap-1.5 bg-[#579dff]/20 hover:bg-[#579dff]/30 px-2.5 py-1 rounded-[3px] cursor-pointer">
          <span className="w-5 h-5 bg-white rounded-[2px] flex items-center justify-center text-[#0c66e4] font-bold text-xs">T</span>
          <span className="font-bold text-sm tracking-tight">ProjectFlow</span>
          <span className="text-xs bg-white/20 px-1 rounded ml-1">Trello</span>
        </div>
        <div className="flex-1 max-w-[720px] mx-2 hidden md:flex">
          <div className="relative w-full">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60 text-sm">⌕</span>
            <input placeholder="Buscar" className="w-full bg-[#22272b] border border-[#3c4043] rounded-[5px] pl-8 pr-3 py-1.5 text-sm placeholder:text-white/60 focus:outline-none focus:border-[#579dff] focus:bg-[#22272b]" />
          </div>
        </div>
        <button className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] font-medium text-sm px-3 py-1.5 rounded-[3px] flex items-center gap-1.5">✦ Crear</button>
        <div className="ml-auto flex items-center gap-1">
          <button className="h-8 w-8 hover:bg-white/10 rounded-full flex items-center justify-center text-white/70">🔔</button>
          <button className="h-8 w-8 hover:bg-white/10 rounded-full flex items-center justify-center text-white/70">ⓘ</button>
          <button onClick={toggle} className="h-8 w-8 hover:bg-white/10 rounded-full flex items-center justify-center text-white/70" title="Toggle theme">{theme==="dark" ? "☀️" : "🌙"}</button>
          <span className="h-6 w-6 rounded-full bg-[#e67e22] flex items-center justify-center text-xs font-bold">EC</span>
          <select value={i18n.language} onChange={e=>i18n.changeLanguage(e.target.value)} className="bg-transparent text-xs text-white/60 border-0 focus:ring-0 hidden md:block">
            <option value="es" className="text-black">ES</option><option value="en" className="text-black">EN</option>
          </select>
        </div>
      </header>

      {/* 3-panel Trello layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Bandeja de entrada - like screenshot */}
        <aside className="w-[280px] bg-[#1d2125] border-r border-[#3c4043] hidden lg:flex flex-col shrink-0">
          <div className="p-3 flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2"><span className="w-6 h-6 bg-[#22272b] rounded flex items-center justify-center text-xs">📥</span> Bandeja de entrada</h2>
            <div className="flex gap-1 text-white/40"><button className="hover:text-white">≡</button><button className="hover:text-white">⋯</button></div>
          </div>
          <div className="px-3 pb-2">
            <div className="bg-[#22272b] rounded-[5px] px-3 py-2 text-sm text-white/50">Añade una tarjeta</div>
          </div>
          <div className="flex-1 overflow-auto px-2 space-y-2 pb-2">
            <nav className="space-y-0.5">
              <NavLink to="/dashboard" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-[#22272b] text-white':'text-white/70 hover:bg-white/10'}`}><span className="text-base">▦</span> {t('nav.dashboard')}</NavLink>
              <NavLink to="/clients" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-[#22272b] text-white':'text-white/70 hover:bg-white/10'}`}><span>👥</span> {t('nav.clients')}</NavLink>
              <NavLink to="/projects" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-[#22272b] text-white':'text-white/70 hover:bg-white/10'}`}><span>📄</span> {t('nav.projects')}</NavLink>
              <NavLink to="/invoices" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-[#22272b] text-white':'text-white/70 hover:bg-white/10'}`}><span>📃</span> {t('nav.invoices')}</NavLink>
              <NavLink to="/documents" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-[#22272b] text-white':'text-white/70 hover:bg-white/10'}`}>📁 Documents</NavLink>
              <NavLink to="/team" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-[#22272b] text-white':'text-white/70 hover:bg-white/10'}`}>👥 Team</NavLink>
            </nav>
            <div className="pt-3 mt-3 border-t border-white/10">
              <p className="px-2 text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1">AI</p>
              <NavLink to="/ai/planner" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-[#22272b] text-white':'text-white/70 hover:bg-white/10'}`}>✦ AI Planner</NavLink>
              <NavLink to="/ai/summary" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-[#22272b] text-white':'text-white/70 hover:bg-white/10'}`}>📊 Weekly Summary</NavLink>
              <NavLink to="/ai/chat" className={({isActive})=>`flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-sm ${isActive?'bg-[#22272b] text-white':'text-white/70 hover:bg-white/10'}`}>💬 AI Chat</NavLink>
            </div>
            <div className="space-y-2 mt-4">
              <div className="bg-[#22272b] rounded-[5px] p-2.5 border border-[#3c4043]">
                <div className="text-sm">comer pollo</div>
                <div className="text-xs text-white/50 mt-1">Míralo, envíalo, guárdalo para más tarde</div>
                <div className="flex gap-2 mt-2 text-white/40 text-xs">✉️ ≡</div>
              </div>
            </div>
          </div>
          <div className="p-2 mt-auto">
            <div className="bg-[#22272b] rounded-full px-3 py-2 flex items-center gap-2 text-xs">
              <span className="w-6 h-6 rounded-full bg-[#579dff] flex items-center justify-center text-[10px]">✦</span>
              <span className="bg-[#579dff] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">NUEVO</span>
              <span className="text-white/80">Consolida tus tareas por hacer</span>
            </div>
            <button onClick={logout} className="w-full mt-2 text-left px-2 py-2 hover:bg-white/10 rounded text-sm text-white/60 flex items-center gap-2">⎋ {t('nav.logout')}</button>
          </div>
        </aside>

        {/* Center: Planificador / Calendar */}
        <div className="w-[380px] bg-[#1d2125] border-r border-[#3c4043] hidden xl:flex flex-col shrink-0">
          <div className="h-10 flex items-center gap-2 px-3 border-b border-[#3c4043] bg-[#1d2125]">
            <span className="text-sm">📅</span>
            <select className="bg-transparent text-sm font-medium text-white focus:outline-none"><option>sept</option></select>
            <button className="ml-2 text-white/60 hover:text-white">‹</button><button className="bg-[#22272b] px-3 py-1 rounded text-sm">Hoy</button><button className="text-white/60 hover:text-white">›</button>
            <div className="ml-auto flex gap-1"><button className="h-6 w-6 bg-[#22272b] rounded flex items-center justify-center text-white/60">⚙️</button><button className="h-6 w-6 bg-[#22272b] rounded flex items-center justify-center text-white/60">⋯</button></div>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <div className="bg-[#1c3b5a] rounded-lg p-4 text-center border border-[#3c4043]">
              <h3 className="font-semibold text-white">Conectar tu cuenta de calendario</h3>
              <p className="text-xs text-white/70 mt-2">Ve todos tus eventos. Arrastra, suelta y hazlo. Programa tus tareas pendientes en el calendario y dedica tiempo a lo que de verdad importa.</p>
              <button className="mt-3 bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] text-sm font-medium px-4 py-1.5 rounded">↻ Conectar una cuenta</button>
            </div>
            <div className="mt-4 space-y-3">
              <div><h4 className="text-sm font-medium text-white">Hoy <span className="text-white/50">mié 2 de septiembre</span></h4><p className="text-xs text-white/40 mt-1">No hay nada planeado para hoy</p></div>
              <div><h4 className="text-sm font-medium text-white">Mañana <span className="text-white/50">jue 3 de septiembre</span></h4><p className="text-xs text-white/40 mt-1">No hay nada planeado</p></div>
              <div><h4 className="text-sm font-medium text-white">vie 4 de septiembre</h4><p className="text-xs text-white/40 mt-1">No hay nada planeado</p></div>
            </div>
          </div>
          <div className="p-2 flex gap-1 text-xs">
            <NavLink to="/calendar" className={({isActive})=>`px-3 py-1.5 rounded flex items-center gap-1 ${isActive?'bg-[#579dff] text-[#1d2125]':'bg-[#22272b] text-white/70'}`}>📥 Bandeja de entrada</NavLink>
            <NavLink to="/dashboard" className={({isActive})=>`px-3 py-1.5 rounded flex items-center gap-1 ${isActive?'bg-[#579dff] text-[#1d2125]':'bg-[#22272b] text-white/70'}`}>📅 Planificador</NavLink>
            <NavLink to="/projects" className={({isActive})=>`px-3 py-1.5 rounded flex items-center gap-1 ${isActive?'bg-[#579dff] text-[#1d2125]':'bg-[#22272b] text-white/70'}`}>▦ Tablero</NavLink>
          </div>
        </div>

        {/* Right: Main board - purple gradient like screenshot */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[#7a3e8b] via-[#8b5a9c] to-[#9b6bb0]">
          <div className="h-10 bg-black/20 backdrop-blur flex items-center gap-3 px-3 text-white">
            <h2 className="font-bold text-sm">Mi tablero de Trello</h2>
            <span className="text-xs opacity-70">⋮ 00▾</span>
            <div className="ml-auto flex items-center gap-2">
              <button className="p-1 hover:bg-white/10 rounded">≡</button>
              <button className="bg-white text-[#1d2125] px-3 py-1 rounded text-sm font-medium flex items-center gap-1"><span className="text-[#1d2125]">👤</span> Compartir</button>
              <button className="hover:bg-white/10 p-1 rounded">⋯</button>
            </div>
          </div>
          <main id="main" className="flex-1 overflow-auto focus:outline-none" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
