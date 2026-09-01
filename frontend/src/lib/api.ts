import axios from "axios"
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
})
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    // 401 -> try refresh, else redirect with expired flag
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
          // expired session -> login with message
          if (location.pathname !== "/login") location.href = "/login?expired=1"
          return Promise.reject(error)
        }
      } else {
        // no refresh token -> session expired
        localStorage.clear()
        if (location.pathname !== "/login" && location.pathname !== "/register") {
          location.href = "/login?expired=1"
        }
      }
    }
    return Promise.reject(error)
  }
)
