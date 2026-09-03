import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App"
import "./index.css"
import "./lib/i18n"
import "./store/theme"
import { Toaster } from "sonner"

// Global handler for the rogue startTime error (vendor scheduler) to avoid blank screen
window.addEventListener("error", (e) => {
  if (String(e.message).includes("startTime") && String(e.filename).includes("2:")) {
    console.warn("[Suppressed startTime error]", e.message)
    e.preventDefault()
  }
})
window.addEventListener("unhandledrejection", (e) => {
  if (String(e.reason?.message || e.reason).includes("startTime")) {
    console.warn("[Suppressed promise startTime]", e.reason)
    e.preventDefault()
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
