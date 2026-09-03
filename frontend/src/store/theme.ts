import { create } from "zustand"

export type Theme = "light" | "dark"
export type PresetId = "default" | "trello" | "ocean" | "forest" | "sunset" | "midnight" | "custom"

export interface ThemeColors {
  background: string
  foreground: string
  border: string
  primary: string
  primaryForeground: string
  secondary: string
  accent: string
  muted: string
  destructive: string
  ring: string
  card: string
  cardForeground: string
}

export const presets: Record<PresetId, { name: string; light: ThemeColors; dark: ThemeColors; description: string }> = {
  default: {
    name: "Default",
    description: "ProjectFlow classic",
    light: { background: "248 100% 98%", foreground: "224 76% 25%", border: "214 100% 93%", primary: "221 83% 40%", primaryForeground: "0 0% 100%", secondary: "217 91% 60%", accent: "32 95% 44%", muted: "220 33% 94%", destructive: "0 84% 51%", ring: "221 83% 40%", card: "0 0% 100%", cardForeground: "224 76% 25%" },
    dark: { background: "224 71% 4%", foreground: "210 20% 98%", border: "215 28% 17%", primary: "217 91% 60%", primaryForeground: "224 76% 25%", secondary: "217 91% 60%", accent: "32 95% 44%", muted: "215 28% 17%", destructive: "0 62% 30%", ring: "217 91% 60%", card: "215 28% 17%", cardForeground: "210 20% 98%" },
  },
  trello: {
    name: "Trello Dark",
    description: "#1F1F21 board #0079BF",
    light: { background: "0 0% 98%", foreground: "0 0% 9%", border: "0 0% 89%", primary: "212 100% 45%", primaryForeground: "0 0% 100%", secondary: "212 100% 45%", accent: "35 92% 95%", muted: "0 0% 96%", destructive: "0 84% 60%", ring: "212 100% 45%", card: "0 0% 100%", cardForeground: "0 0% 9%" },
    dark: { background: "0 0% 12%", foreground: "0 0% 98%", border: "0 0% 20%", primary: "212 100% 60%", primaryForeground: "0 0% 12%", secondary: "212 100% 60%", accent: "35 92% 65%", muted: "0 0% 17%", destructive: "0 72% 51%", ring: "212 100% 60%", card: "0 0% 15%", cardForeground: "0 0% 95%" },
  },
  ocean: {
    name: "Ocean",
    description: "Teal & coral",
    light: { background: "180 52% 96%", foreground: "180 84% 12%", border: "173 58% 80%", primary: "173 80% 32%", primaryForeground: "0 0% 100%", secondary: "180 77% 36%", accent: "14 100% 60%", muted: "180 31% 90%", destructive: "0 84% 51%", ring: "173 80% 32%", card: "0 0% 100%", cardForeground: "180 84% 12%" },
    dark: { background: "180 84% 5%", foreground: "180 20% 98%", border: "180 25% 18%", primary: "173 70% 50%", primaryForeground: "180 84% 5%", secondary: "180 70% 50%", accent: "14 90% 65%", muted: "180 25% 15%", destructive: "0 62% 40%", ring: "173 70% 50%", card: "180 25% 12%", cardForeground: "180 20% 98%" },
  },
  forest: {
    name: "Forest",
    description: "Green & earth",
    light: { background: "120 20% 97%", foreground: "120 30% 15%", border: "120 20% 85%", primary: "142 76% 36%", primaryForeground: "0 0% 100%", secondary: "142 70% 29%", accent: "38 92% 50%", muted: "120 15% 92%", destructive: "0 84% 51%", ring: "142 76% 36%", card: "0 0% 100%", cardForeground: "120 30% 15%" },
    dark: { background: "120 20% 4%", foreground: "120 20% 98%", border: "120 15% 18%", primary: "142 65% 45%", primaryForeground: "120 20% 4%", secondary: "142 60% 40%", accent: "38 85% 55%", muted: "120 15% 15%", destructive: "0 62% 35%", ring: "142 65% 45%", card: "120 15% 12%", cardForeground: "120 20% 98%" },
  },
  sunset: {
    name: "Sunset",
    description: "Purple & orange",
    light: { background: "30 100% 97%", foreground: "340 30% 15%", border: "30 30% 85%", primary: "340 82% 52%", primaryForeground: "0 0% 100%", secondary: "25 95% 53%", accent: "38 92% 50%", muted: "30 20% 92%", destructive: "0 84% 51%", ring: "340 82% 52%", card: "0 0% 100%", cardForeground: "340 30% 15%" },
    dark: { background: "340 20% 6%", foreground: "30 20% 98%", border: "340 15% 18%", primary: "340 75% 60%", primaryForeground: "340 20% 6%", secondary: "25 90% 60%", accent: "38 90% 55%", muted: "340 15% 15%", destructive: "0 62% 40%", ring: "340 75% 60%", card: "340 15% 12%", cardForeground: "30 20% 98%" },
  },
  midnight: {
    name: "Midnight",
    description: "Slate & amber",
    light: { background: "0 0% 100%", foreground: "222 47% 11%", border: "214 32% 91%", primary: "222 47% 11%", primaryForeground: "0 0% 100%", secondary: "215 16% 47%", accent: "38 92% 50%", muted: "213 27% 84%", destructive: "0 84% 51%", ring: "222 47% 11%", card: "0 0% 100%", cardForeground: "222 47% 11%" },
    dark: { background: "222 47% 6%", foreground: "210 40% 98%", border: "217 33% 17%", primary: "210 40% 98%", primaryForeground: "222 47% 6%", secondary: "215 20% 65%", accent: "38 90% 55%", muted: "217 33% 17%", destructive: "0 62% 30%", ring: "212 95% 68%", card: "222 47% 8%", cardForeground: "210 40% 98%" },
  },
  custom: {
    name: "Custom",
    description: "Your colors",
    light: { background: "0 0% 100%", foreground: "0 0% 9%", border: "0 0% 89%", primary: "221 83% 53%", primaryForeground: "0 0% 100%", secondary: "0 0% 96%", accent: "0 0% 96%", muted: "0 0% 96%", destructive: "0 84% 60%", ring: "221 83% 53%", card: "0 0% 100%", cardForeground: "0 0% 9%" },
    dark: { background: "0 0% 4%", foreground: "0 0% 93%", border: "0 0% 15%", primary: "221 83% 53%", primaryForeground: "0 0% 100%", secondary: "0 0% 15%", accent: "0 0% 15%", muted: "0 0% 15%", destructive: "0 63% 31%", ring: "221 83% 53%", card: "0 0% 9%", cardForeground: "0 0% 93%" },
  },
}

const COLOR_KEYS: (keyof ThemeColors)[] = ["background","foreground","border","primary","primaryForeground","secondary","accent","muted","destructive","ring","card","cardForeground"]

function hslToHex(hsl: string): string {
  const [h,s,l] = hsl.split(" ").map((v,i)=> i===0 ? parseInt(v) : parseInt(v)/100)
  const a = s * Math.min(l, 1-l); const f = (n:number) => { const k=(n+h/30)%12; const c=l-a*Math.max(Math.min(k-3,9-k,1),-1); return Math.round(255*c).toString(16).padStart(2,"0") }; return `#${f(0)}${f(8)}${f(4)}`
}
function hexToHsl(hex: string): string {
  hex=hex.replace("#",""); if(hex.length===3) hex=hex.split("").map(c=>c+c).join(""); const r=parseInt(hex.slice(0,2),16)/255, g=parseInt(hex.slice(2,4),16)/255, b=parseInt(hex.slice(4,6),16)/255; const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2; let h=0,s=0; if(max!==min){ const d=max-min; s=l>0.5 ? d/(2-max-min) : d/(max+min); switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;} h*=60 } return `${Math.round(h)} ${Math.round(s*100)}% ${Math.round(l*100)}%`
}

interface ThemeState {
  theme: Theme
  preset: PresetId
  customLight: ThemeColors
  customDark: ThemeColors
  toggle: () => void
  set: (t: Theme) => void
  setPreset: (p: PresetId) => void
  setColor: (key: keyof ThemeColors, hex: string) => void
  resetCustom: () => void
}

function applyColors(theme: Theme, preset: PresetId, customLight: ThemeColors, customDark: ThemeColors) {
  const colors = preset === "custom" ? (theme === "dark" ? customDark : customLight) : (theme === "dark" ? presets[preset].dark : presets[preset].light)
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  const map: Record<keyof ThemeColors, string> = { background:"--background", foreground:"--foreground", border:"--border", primary:"--primary", primaryForeground:"--primary-foreground", secondary:"--secondary", accent:"--accent", muted:"--muted", destructive:"--destructive", ring:"--ring", card:"--card", cardForeground:"--card-foreground" }
  COLOR_KEYS.forEach(k => root.style.setProperty(map[k], colors[k]))
  root.style.setProperty("color-scheme", theme)
}

function load(): {theme:Theme, preset:PresetId, customLight:ThemeColors, customDark:ThemeColors} {
  try {
    const t = localStorage.getItem("theme") as Theme | null
    const p = localStorage.getItem("preset") as PresetId | null
    const cl = localStorage.getItem("customLight")
    const cd = localStorage.getItem("customDark")
    return {
      theme: t==="dark"||t==="light" ? t : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark":"light"),
      preset: p && presets[p] ? p : "default",
      customLight: cl ? JSON.parse(cl) : presets.custom.light,
      customDark: cd ? JSON.parse(cd) : presets.custom.dark,
    }
  } catch { return {theme:"light", preset:"default", customLight:presets.custom.light, customDark:presets.custom.dark} }
}
const init = load()

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: init.theme,
  preset: init.preset,
  customLight: init.customLight,
  customDark: init.customDark,
  toggle: () => {
    const next = get().theme==="dark"?"light":"dark"
    applyColors(next, get().preset, get().customLight, get().customDark)
    try{localStorage.setItem("theme", next)}catch{}
    set({theme: next})
  },
  set: (t) => {
    applyColors(t, get().preset, get().customLight, get().customDark)
    try{localStorage.setItem("theme", t)}catch{}
    set({theme: t})
  },
  setPreset: (p) => {
    const {theme, customLight, customDark} = get()
    applyColors(theme, p, customLight, customDark)
    try{localStorage.setItem("preset", p)}catch{}
    set({preset: p})
  },
  setColor: (key, hex) => {
    const {theme, preset, customLight, customDark} = get()
    const hsl = hexToHsl(hex)
    if (theme==="dark") {
      const nd = {...customDark, [key]: hsl}
      try{localStorage.setItem("customDark", JSON.stringify(nd))}catch{}
      set({customDark: nd})
      if (preset==="custom") applyColors(theme, "custom", customLight, nd)
      else { // switch to custom on edit
        try{localStorage.setItem("preset", "custom")}catch{}
        set({preset:"custom", customDark: nd})
        applyColors(theme, "custom", customLight, nd)
      }
    } else {
      const nl = {...customLight, [key]: hsl}
      try{localStorage.setItem("customLight", JSON.stringify(nl))}catch{}
      set({customLight: nl})
      if (preset==="custom") applyColors(theme, "custom", nl, customDark)
      else {
        try{localStorage.setItem("preset", "custom")}catch{}
        set({preset:"custom", customLight: nl})
        applyColors(theme, "custom", nl, customDark)
      }
    }
  },
  resetCustom: () => {
    try{localStorage.removeItem("customLight");localStorage.removeItem("customDark")}catch{}
    set({customLight:presets.custom.light, customDark:presets.custom.dark})
    const {theme, preset} = get()
    if (preset==="custom") applyColors(theme, preset, presets.custom.light, presets.custom.dark)
  }
}))

// init apply
try{ applyColors(init.theme, init.preset, init.customLight, init.customDark) }catch{}

// system sync if no manual theme/preset
try{
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e=>{
    if(!localStorage.getItem("theme") && !localStorage.getItem("preset")){
      const next = e.matches?"dark":"light"
      applyColors(next, useThemeStore.getState().preset, useThemeStore.getState().customLight, useThemeStore.getState().customDark)
      useThemeStore.setState({theme: next})
    }
  })
}catch{}

// helpers for UI
export const colorLabels: Record<keyof ThemeColors, string> = {
  background:"Background", foreground:"Foreground", border:"Border", primary:"Primary", primaryForeground:"Primary FG", secondary:"Secondary", accent:"Accent", muted:"Muted", destructive:"Destructive", ring:"Ring", card:"Card", cardForeground:"Card FG"
}
export function getCurrentColors(): ThemeColors {
  const s = useThemeStore.getState()
  const preset = s.preset
  return preset==="custom" ? (s.theme==="dark"? s.customDark : s.customLight) : (s.theme==="dark"? presets[preset].dark : presets[preset].light)
}
export { hslToHex, hexToHsl, COLOR_KEYS }
