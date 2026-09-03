import { useState } from "react"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(""); setErr("")
    setLoading(true)
    try {
      const { data } = await api.post("/auth/forgot-password/", { email: email.trim() })
      setMsg(data.detail)
    } catch (e:any) {
      setErr(e.response?.data?.detail || e.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-slate-900 p-4">
      <form onSubmit={submit} className="bg-card dark:bg-slate-900 p-8 rounded-lg shadow border border-border w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
        <p className="text-sm text-muted-foreground">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña (expira en 1h).</p>
        {msg && <div className="bg-green-50 text-green-700 p-2 rounded text-sm border border-green-200">{msg}</div>}
        {err && <div className="bg-red-50 text-red-600 p-2 rounded text-sm border border-red-200">{err}</div>}
        <input className="w-full border border-border rounded px-3 py-2 bg-background" placeholder="tu@email.com" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        <Button type="submit" className="w-full" disabled={loading || !email.trim()}>{loading ? "Enviando..." : "Enviar enlace"}</Button>
        <div className="flex justify-between text-xs text-muted-foreground">
          <Link to="/forgot-username" className="text-primary hover:underline">¿Olvidaste tu usuario?</Link>
          <Link to="/login" className="text-primary hover:underline">Volver a login</Link>
        </div>
      </form>
    </div>
  )
}
