import { useThemeStore, presets, colorLabels, hslToHex, getCurrentColors, COLOR_KEYS, PresetId } from "@/store/theme"

export default function ThemeSettings() {
  const { theme, preset, setPreset, setColor, resetCustom, toggle, customLight, customDark } = useThemeStore()
  // subscribe to custom colors so picker reacts when preset is already custom
  void customLight; void customDark
  const colors = getCurrentColors()

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Theme</h1>
        <button onClick={toggle} className="px-3 py-1.5 rounded border bg-card text-sm">
          {theme==="dark" ? "☀️ Light" : "🌙 Dark"} ({theme})
        </button>
      </div>

      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border space-y-3">
        <h3 className="font-semibold">Presets</h3>
        <p className="text-xs text-muted-foreground">Choose a predetermined theme - you can still tweak each part with the color picker below</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {(Object.keys(presets) as PresetId[]).map(id=>(
            <button key={id} onClick={()=>setPreset(id)} className={`p-3 rounded-lg border text-left ${preset===id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
              <div className="flex gap-1 mb-2">
                <span className="w-4 h-4 rounded-full border" style={{background:`hsl(${presets[id][theme].primary})`}} />
                <span className="w-4 h-4 rounded-full border" style={{background:`hsl(${presets[id][theme].background})`}} />
                <span className="w-4 h-4 rounded-full border" style={{background:`hsl(${presets[id][theme].card})`}} />
              </div>
              <div className="text-xs font-medium">{presets[id].name}</div>
              <div className="text-[11px] text-muted-foreground line-clamp-1">{presets[id].description}</div>
              {preset===id && <div className="text-[11px] text-primary mt-1">✓ Active</div>}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Customize each part ({theme} mode)</h3>
          {preset==="custom" && <button onClick={resetCustom} className="text-xs border px-2 py-1 rounded hover:bg-muted">Reset custom</button>}
        </div>
        <p className="text-xs text-muted-foreground">Pick a color for each UI part - changes apply instantly and are saved. Editing switches to <b>Custom</b> preset.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLOR_KEYS.map(key=>(
            <label key={key} className="flex items-center gap-3 border rounded p-2 hover:bg-muted/50">
              <input type="color" value={hslToHex(colors[key])} onChange={e=>setColor(key, e.target.value)} className="w-10 h-10 rounded border-0 p-0 cursor-pointer shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{colorLabels[key]}</div>
                <div className="text-[11px] text-muted-foreground font-mono truncate">{hslToHex(colors[key])} · {colors[key]}</div>
              </div>
              <span className="w-6 h-6 rounded border shrink-0" style={{background:`hsl(${colors[key]})`}} />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border">
        <h3 className="font-semibold mb-2">Preview</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-background border rounded p-3">Background<div className="h-2 bg-primary rounded mt-1" /></div>
          <div className="bg-card border rounded p-3">Card<div className="h-2 bg-muted rounded mt-1" /></div>
          <div className="bg-primary text-primary-foreground rounded p-3">Primary button</div>
        </div>
      </div>
    </div>
  )
}
