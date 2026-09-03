import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App"
import "./index.css"
import "./lib/i18n"
import "./store/theme"
import { Toaster } from "sonner"

// Global handler for the rogue startTime/reportAllChanges vendor error
const _origOnError = window.onerror
window.onerror = function(msg, src, line, col, err) {
  if (String(msg).includes("startTime") || String(msg).includes("reportAllChanges")) {
    console.warn("[Suppressed] window.onerror startTime", msg)
    return true
  }
  if (_origOnError) return _origOnError.apply(this, arguments as any)
  return false
}
window.addEventListener("error", (e) => {
  const m = String((e as any).message || e.error?.message || "")
  if (m.includes("startTime") || m.includes("reportAllChanges") || String(e.filename).includes("VM")) {
    console.warn("[Suppressed] error startTime/VM", m, (e as any).filename)
    e.preventDefault()
    e.stopPropagation()
    return
  }
})
window.addEventListener("unhandledrejection", (e) => {
  const m = String(e.reason?.message || e.reason || "")
  if (m.includes("startTime") || m.includes("reportAllChanges")) {
    console.warn("[Suppressed] unhandled startTime", m)
    e.preventDefault()
  }
})
window.addEventListener("auth-expired", () => {
  if (location.pathname !== "/login" && location.pathname !== "/register" && location.pathname !== "/verify-email" && location.pathname !== "/forgot-password" && location.pathname !== "/reset-password" && location.pathname !== "/forgot-username") {
    location.href = "/login?expired=1"
  }
})

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <App />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
