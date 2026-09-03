import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get("token") || ""
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle")
  const [msg, setMsg] = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [resending, setResending] = useState(false)

  const verify = async (t: string) => {
    if (!t) { setStatus("error"); setMsg("Token faltante. Revisa el enlace de tu email."); return }
    setStatus("loading")
    try {
      const { data } = await api.post("/auth/verify-email/", { token: t })
      setStatus("success")
      setMsg(data.detail || "Email verificado correctamente.")
    } catch (e:any) {
      setStatus("error")
      setMsg(e.response?.data?.detail || e.message || "Error al verificar")
    }
  }

  useEffect(() => {
    if (token) verify(token)
  }, [token])

  const handleManualVerify = () => {
    if (token) verify(token)
  }

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resendEmail.trim()) return
    setResending(true)
    try {
      const { data } = await api.post("/auth/resend-verification/", { email: resendEmail.trim() })
      setMsg(data.detail)
      setStatus("success")
    } catch (e:any) {
      setMsg(e.response?.data?.detail || e.message)
      setStatus("error")
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-slate-900 p-4">
      <div className="bg-card dark:bg-slate-900 p-8 rounded-lg shadow border border-border w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Verificar email</h1>
        <p className="text-sm text-muted-foreground">Confirma tu email para activar tu cuenta.</p>

        {token ? (
          <div className="space-y-3">
            <p className="text-xs font-mono bg-muted p-2 rounded break-all">{token.slice(0,60)}...</p>
            <Button onClick={handleManualVerify} disabled={status==="loading"} className="w-full">
              {status==="loading" ? "Verificando..." : "Verificar ahora"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-amber-600">No se encontró token en la URL. Pega el enlace completo que recibiste.</p>
        )}

        {msg && (
          <div className={`p-3 rounded text-sm border ${status==="success" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300" : status==="error" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-300" : "bg-muted"}`}>
            {msg}
          </div>
        )}

        {status==="success" && (
          <Link to="/login" className="block text-center text-sm text-primary hover:underline">Ir a Login →</Link>
        )}

        <div className="pt-4 border-t border-border space-y-2">
          <h3 className="font-semibold text-sm">¿No recibiste el email?</h3>
          <form onSubmit={handleResend} className="flex gap-2">
            <input placeholder="tu@email.com" value={resendEmail} onChange={e=>setResendEmail(e.target.value)} className="flex-1 border border-border rounded px-3 py-2 text-sm bg-background" />
            <Button type="submit" variant="outline" disabled={resending || !resendEmail.trim()}>{resending ? "..." : "Reenviar"}</Button>
          </form>
          <Link to="/login" className="text-xs text-muted-foreground hover:underline">Volver a Login</Link>
        </div>
      </div>
    </div>
  )
}
