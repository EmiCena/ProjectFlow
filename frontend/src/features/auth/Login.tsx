import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function Login() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ username: "", password: "" })
  const [err, setErr] = useState("")
  const expired = params.get("expired") === "1"
  useEffect(() => { if (expired) setErr(t('auth.sessionExpired') || "Sesión expirada, inicia sesión de nuevo.") }, [expired])
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr("")
    try {
      const { data } = await api.post("/auth/login/", form)
      localStorage.setItem("access", data.access)
      localStorage.setItem("refresh", data.refresh)
      nav("/dashboard")
    } catch (e:any) { setErr(e.response?.data?.detail || "Login failed") }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">ProjectFlow</h1>
        <p className="text-sm text-slate-500">{t('auth.login')}</p>
        {err && <div className="bg-red-50 text-red-600 p-2 rounded text-sm">{err}</div>}
        <input className="w-full border rounded px-3 py-2" placeholder={t('auth.username')} value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder={t('auth.password')} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <Button type="submit" className="w-full">{t('auth.login')}</Button>
        <p className="text-sm text-center">{t('auth.noAccount')} <Link to="/register" className="text-indigo-600">Register</Link></p>
      </form>
    </div>
  )
}
