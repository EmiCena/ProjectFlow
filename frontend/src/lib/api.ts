import axios from "axios"
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
})
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
import { toast } from "sonner"

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    // 429 throttled
    if (status === 429) {
      const retryAfter = error.response.headers?.['retry-after'] || error.response.data?.retry_after || 60
      const detail = error.response.data?.detail || "Too many requests"
      toast.error(`${detail} - retry in ${retryAfter}s`, { duration: 4000 })
      // emit for UI countdown
      window.dispatchEvent(new CustomEvent('rate-limited', { detail: { retryAfter: Number(retryAfter), path: original?.url } }))
    }
    // 401 -> try refresh, else clear and let Protected redirect (no hard reload to avoid scheduler startTime crash)
    if (status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem("refresh")
      if (refresh) {
        try {
          const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, { refresh })
          localStorage.setItem("access", data.access)
          if (data.refresh) localStorage.setItem("refresh", data.refresh)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.clear()
          window.dispatchEvent(new CustomEvent('auth-expired'))
          return Promise.reject(error)
        }
      } else {
        localStorage.clear()
        window.dispatchEvent(new CustomEvent('auth-expired'))
      }
    }
    return Promise.reject(error)
  }
)
