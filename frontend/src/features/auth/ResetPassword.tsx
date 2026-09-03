import { useState, useEffect } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function ResetPassword() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const tokenFromUrl = params.get("token") || ""
  const [token, setToken] = useState(tokenFromUrl)
  const [pwd, setPwd] = useState("")
  const [pwd2, setPwd2] = useState("")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ if(tokenFromUrl) setToken(tokenFromUrl) }, [tokenFromUrl])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(""); setErr("")
    if (pwd.length < 8) { setErr("Mínimo 8 caracteres"); return }
    if (pwd !== pwd2) { setErr("Las contraseñas no coinciden"); return }
    if (!token.trim()) { setErr("Token requerido"); return }
    setLoading(true)
    try {
      const { data } = await api.post("/auth/reset-password/", { token: token.trim(), new_password: pwd })
      setMsg(data.detail)
      setTimeout(()=> nav("/login"), 1500)
    } catch (e:any) {
      setErr(e.response?.data?.detail || e.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-slate-900 p-4">
      <form onSubmit={submit} className="bg-card dark:bg-slate-900 p-8 rounded-lg shadow border border-border w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Restablecer contraseña</h1>
        <p className="text-sm text-muted-foreground">Pega el token de tu email o abre el enlace directo. Expira en 1h.</p>
        {msg && <div className="bg-green-50 text-green-700 p-2 rounded text-sm border border-green-200">{msg} - redirigiendo a login...</div>}
        {err && <div className="bg-red-50 text-red-600 p-2 rounded text-sm border border-red-200">{err}</div>}
        <input className="w-full border border-border rounded px-3 py-2 bg-background font-mono text-xs" placeholder="Token" value={token} onChange={e=>setToken(e.target.value)} />
        <input className="w-full border border-border rounded px-3 py-2 bg-background" placeholder="Nueva contraseña (min 8)" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} />
        <input className="w-full border border-border rounded px-3 py-2 bg-background" placeholder="Confirmar contraseña" type="password" value={pwd2} onChange={e=>setPwd2(e.target.value)} />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Guardando..." : "Restablecer"}</Button>
        <p className="text-xs text-center text-muted-foreground"><Link to="/forgot-password" className="text-primary hover:underline">Solicitar nuevo enlace</Link> · <Link to="/login" className="text-primary hover:underline">Login</Link></p>
      </form>
    </div>
  )
}
