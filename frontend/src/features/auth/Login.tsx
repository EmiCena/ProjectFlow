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
  const [needVerify, setNeedVerify] = useState<string | null>(null)
  const [resendEmail, setResendEmail] = useState("")
  const [resending, setResending] = useState(false)
  const expired = params.get("expired") === "1"
  useEffect(() => { if (expired) setErr(t('auth.sessionExpired') || "Sesión expirada, inicia sesión de nuevo.") }, [expired])
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(""); setNeedVerify(null)
    try {
      const { data } = await api.post("/auth/login/", form)
      localStorage.setItem("access", data.access)
      localStorage.setItem("refresh", data.refresh)
      nav("/dashboard")
    } catch (e:any) {
      const data = e.response?.data
      if (data?.code === "email_not_verified") {
        setNeedVerify(data.email || form.username)
        setResendEmail(data.email || "")
        setErr(data.detail || "Email no verificado")
      } else {
        setErr(data?.detail || "Login failed")
      }
    }
  }
  const handleResend = async () => {
    if (!resendEmail.trim()) return
    setResending(true)
    try {
      const { data } = await api.post("/auth/resend-verification/", { email: resendEmail.trim() })
      setErr(data.detail)
      setNeedVerify(null)
    } catch (e:any) { setErr(e.response?.data?.detail || e.message) }
    setResending(false)
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-slate-900">
      <form onSubmit={submit} className="bg-card dark:bg-slate-900 p-8 rounded-lg shadow border border-border w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">ProjectFlow</h1>
        <p className="text-sm text-muted-foreground dark:text-slate-400">{t('auth.login')}</p>
        {err && <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-2 rounded text-sm border border-amber-200">{err}</div>}
        {needVerify && (
          <div className="bg-card border border-border p-3 rounded space-y-2">
            <p className="text-xs text-muted-foreground">Tu email no está verificado. Reenvía el enlace:</p>
            <div className="flex gap-2">
              <input value={resendEmail} onChange={e=>setResendEmail(e.target.value)} placeholder="email" className="flex-1 border rounded px-2 py-1.5 text-sm bg-background" />
              <Button type="button" variant="outline" onClick={handleResend} disabled={resending}>{resending ? "..." : "Reenviar"}</Button>
            </div>
            <Link to={`/verify-email`} className="text-xs text-primary underline">Ir a verificar con token →</Link>
          </div>
        )}
        <input className="w-full border border-border rounded px-3 py-2 bg-background dark:bg-slate-800 text-foreground" placeholder={t('auth.username')} value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
        <input type="password" className="w-full border border-border rounded px-3 py-2 bg-background dark:bg-slate-800 text-foreground" placeholder={t('auth.password')} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <Button type="submit" className="w-full">{t('auth.login')}</Button>
        <p className="text-sm text-center text-muted-foreground dark:text-slate-400">{t('auth.noAccount')} <Link to="/register" className="text-indigo-600 dark:text-indigo-400">Register</Link> · <Link to="/verify-email" className="text-indigo-600 dark:text-indigo-400">Verificar email</Link></p>
      </form>
    </div>
  )
}
