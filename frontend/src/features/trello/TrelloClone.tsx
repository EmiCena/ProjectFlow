export default function TrelloClone() {
  return (
    <div className="w-[1357px] h-[636px] bg-[#1F1F21] font-['Inter','Segoe_UI',system-ui,sans-serif] text-white overflow-hidden relative flex flex-col select-none">
      {/* Top Bar 51px */}
      <header className="h-[51px] bg-[#1F1F21] border-b border-[#2a2d30] flex items-center gap-3 px-3 shrink-0">
        {/* Left: 3x3 + Trello logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded text-white/80">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="0" width="3" height="3" rx="0.5"/><rect x="6" y="0" width="3" height="3" rx="0.5"/><rect x="12" y="0" width="3" height="3" rx="0.5"/><rect x="0" y="6" width="3" height="3" rx="0.5"/><rect x="6" y="6" width="3" height="3" rx="0.5"/><rect x="12" y="6" width="3" height="3" rx="0.5"/><rect x="0" y="12" width="3" height="3" rx="0.5"/><rect x="6" y="12" width="3" height="3" rx="0.5"/><rect x="12" y="12" width="3" height="3" rx="0.5"/></svg>
          </button>
          <div className="flex items-center gap-1.5 bg-[#0c66e4]/0 px-1">
            <span className="w-[22px] h-[22px] bg-[#0c66e4] rounded-[3px] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>
            </span>
            <span className="font-bold text-[15px] tracking-tight">Trello</span>
          </div>
        </div>
        {/* Center search ~780x33 */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-[780px] h-[33px]">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input placeholder="Buscar" className="w-full h-[33px] bg-[#22272b] border border-[#3c4043] rounded-[5px] pl-8 pr-3 text-[14px] placeholder:text-white/40 focus:outline-none focus:border-[#579dff] text-white" />
          </div>
        </div>
        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] font-medium text-[14px] px-3 h-[32px] rounded-[3px] flex items-center gap-1.5">
            <span className="text-base leading-none">✦</span> Crear
          </button>
          <button className="w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center text-white/60"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
          <button className="w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center text-white/60">🔔</button>
          <button className="w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center text-white/60">ⓘ</button>
          <span className="w-8 h-8 rounded-full bg-[#e67e22] flex items-center justify-center text-xs font-bold border-2 border-[#1F1F21]">EC</span>
        </div>
      </header>

      {/* Three columns */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Col1 X=15 w=274 h=552 bg #123263 radius 17 */}
        <div className="w-[274px] h-[552px] bg-[#123263] rounded-[17px] border border-[#2a3a5a] flex flex-col shrink-0 overflow-hidden">
          <div className="h-[56px] flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-white">📥</span>
              <h2 className="font-semibold text-[14px] leading-tight">Bandeja de<br/>entrada</h2>
            </div>
            <div className="flex gap-1 text-white/50"><button className="hover:text-white p-1">≡</button><button className="hover:text-white p-1">⋯</button></div>
          </div>
          <div className="px-2 pb-2 space-y-2 flex-1 overflow-auto">
            <div className="bg-[#22272b] border border-[#3c4043] rounded-[6px] px-3 py-2 text-[13px] text-white/40">Añade una tarjeta</div>
            <div className="bg-[#22272b] border border-[#3c4043] rounded-[6px] px-3 py-2.5 text-[13px] text-white">comer pollo</div>
            <div className="bg-[#22272b] border border-[#3c4043] rounded-[6px] px-3 py-2.5">
              <div className="text-[13px] leading-5 text-white">Míralo, envíalo, guárdalo<br/>para más tarde</div>
              <div className="flex gap-3 mt-2 text-white/40 text-xs">✉️ ≡</div>
            </div>
          </div>
          <div className="p-2">
            <div className="bg-[#22272b] rounded-full px-3 py-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#579dff] to-[#e67e22] flex items-center justify-center text-[10px]">✦</span>
              <span className="bg-[#579dff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NUEVO</span>
              <span className="text-[11px] text-white/80 leading-tight">Consolida tus tareas<br/>por hacer</span>
              <span className="ml-auto text-white/40">∧</span>
            </div>
          </div>
        </div>

        {/* Col2 X=302 w=402 */}
        <div className="w-[402px] h-[552px] bg-[#1d2125] rounded-[17px] border border-[#3c4043] flex flex-col shrink-0 overflow-hidden">
          <div className="h-[44px] flex items-center gap-2 px-3 border-b border-[#3c4043]">
            <span className="text-white/80">📅</span>
            <span className="text-[14px] font-medium flex items-center gap-1">sept <span className="text-xs">▾</span></span>
            <button className="ml-2 w-6 h-6 border border-[#3c4043] rounded flex items-center justify-center text-white/60 text-xs">‹</button>
            <button className="bg-[#22272b] border border-[#3c4043] px-3 py-1 rounded text-[13px]">Hoy</button>
            <button className="w-6 h-6 border border-[#3c4043] rounded flex items-center justify-center text-white/60 text-xs">›</button>
            <div className="ml-auto flex gap-1">
              <button className="w-7 h-7 bg-[#22272b] border border-[#3c4043] rounded flex items-center justify-center text-white/60 text-xs">⚙️</button>
              <button className="w-7 h-7 bg-[#22272b] border border-[#3c4043] rounded flex items-center justify-center text-white/60">⋯</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {/* Popup 377x248 */}
            <div className="w-[377px] h-[248px] bg-[#1c3b5a] rounded-[12px] border border-[#2a4a6b] p-6 text-center flex flex-col items-center justify-center mx-auto relative">
              <button className="absolute top-3 right-3 text-white/60 hover:text-white">✕</button>
              <h3 className="font-semibold text-[16px] text-white">Conectar tu cuenta de<br/>calendario</h3>
              <p className="text-[12px] text-white/70 mt-3 leading-5 max-w-[320px]">Ve todos tus eventos. Arrastra, suelta y hazlo. Programa tus tareas pendientes en el calendario y dedica tiempo a lo que de verdad importa.</p>
              <button className="mt-4 bg-[#579dff] hover:bg-[#85b8ff] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center gap-1.5">↻ Conectar una cuenta</button>
            </div>
            <div className="mt-4 space-y-4">
              <div><h4 className="text-[13px] font-semibold">Hoy <span className="font-normal text-white/60">mié 2 de septiembre</span></h4><p className="text-[12px] text-white/40 mt-1">No hay nada planeado para hoy</p></div>
              <div><h4 className="text-[13px] font-semibold">Mañana <span className="font-normal text-white/60">jue 3 de septiembre</span></h4><p className="text-[12px] text-white/40 mt-1">No hay nada planeado</p></div>
              <div><h4 className="text-[13px] font-semibold">vie <span className="font-normal text-white/60">4 de septiembre</span></h4><p className="text-[12px] text-white/40 mt-1">No hay nada planeado</p></div>
            </div>
          </div>
        </div>

        {/* Col3 X≈715 w≈626 h≈552 header 68 bg #5A3D7C */}
        <div className="w-[626px] h-[552px] rounded-[17px] overflow-hidden flex flex-col shrink-0 border border-[#3c4043]">
          <div className="h-[68px] bg-[#5A3D7C] flex items-center gap-3 px-4">
            <h2 className="font-bold text-[15px]">Mi tablero de Trello</h2>
            <span className="text-white/60 text-xs">000▾</span>
            <div className="ml-auto flex items-center gap-2">
              <button className="text-white/60 hover:text-white p-1">≡</button>
              <button className="bg-white text-[#5A3D7C] px-3 py-1.5 rounded-[3px] text-[13px] font-medium flex items-center gap-1.5"><span>👤</span> Compartir</button>
              <button className="text-white/60 hover:text-white p-1">⋯</button>
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-b from-[#6a4a8a] via-[#7a5a9c] to-[#8b6bb0] p-3 flex gap-3 overflow-x-auto overflow-y-hidden">
            {/* List Más tarde 272x92 */}
            <div className="w-[272px] shrink-0">
              <div className="bg-[#1d2125] rounded-[8px] p-2">
                <div className="flex items-center justify-between px-1 py-1">
                  <h3 className="font-semibold text-[13px]">Más tarde</h3>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <span>0</span><span>↔</span><span>⋯</span>
                  </div>
                </div>
                <div className="mt-2 bg-[#1d2125] rounded-[6px] p-1">
                  <button className="w-full text-left text-white/60 hover:text-white hover:bg-white/10 rounded-[5px] px-2 py-1.5 text-[13px] flex items-center gap-2">
                    <span className="text-lg leading-none">+</span> Añade una tarjeta
                  </button>
                  <button className="absolute right-6 mt-1 text-white/30 hover:text-white/60">⧉</button>
                </div>
              </div>
            </div>
            <div className="w-[272px] shrink-0">
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-[8px] px-3 py-2 text-[13px] font-medium flex items-center gap-2">
                <span className="text-lg leading-none">+</span> Añade otra lista
              </button>
            </div>
          </div>
          {/* scrollbar */}
          <div className="h-[10px] bg-[#5A3D7C]/50 px-3 py-1">
            <div className="h-[6px] bg-white/30 rounded-full w-[280px] ml-2"></div>
          </div>
        </div>
      </div>

      {/* Bottom floating nav 612x47 bg #18191B radius 15 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[612px] h-[47px] bg-[#18191B] border border-[#3c4043] rounded-[15px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-between px-2">
        <div className="flex gap-1">
          <button className="bg-[#579dff] text-white px-3 py-1.5 rounded-[8px] text-[13px] font-medium flex items-center gap-1.5"><span>📥</span> Bandeja de entrada</button>
          <button className="bg-[#22272b] text-white/70 hover:bg-white/10 px-3 py-1.5 rounded-[8px] text-[13px] flex items-center gap-1.5"><span>📅</span> Planificador</button>
          <button className="bg-[#22272b] text-white/70 hover:bg-white/10 px-3 py-1.5 rounded-[8px] text-[13px] flex items-center gap-1.5"><span>▦</span> Tablero</button>
          <button className="bg-[#22272b] text-white/70 hover:bg-white/10 px-3 py-1.5 rounded-[8px] text-[13px] flex items-center gap-1.5"><span>🗂️</span> Cambiar de tablero</button>
        </div>
      </div>
    </div>
  )
}
