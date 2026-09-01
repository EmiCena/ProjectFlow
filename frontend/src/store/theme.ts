import { create } from "zustand"

type Theme = "light" | "dark"

interface ThemeState {
  theme: Theme
  toggle: () => void
  set: (t: Theme) => void
}

function getInitial(): Theme {
  try {
    const saved = localStorage.getItem("theme") as Theme | null
    if (saved === "light" || saved === "dark") return saved
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
  } catch {}
  return "light"
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  try { localStorage.setItem("theme", theme) } catch {}
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitial(),
  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark"
    apply(next)
    set({ theme: next })
  },
  set: (t) => {
    apply(t)
    set({ theme: t })
  },
}))

// apply on load
try { apply(getInitial()) } catch {}

// sync with system if user hasn't manually chosen
try {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      const next = e.matches ? "dark" : "light"
      apply(next)
      useThemeStore.setState({ theme: next })
    }
  })
} catch {}
