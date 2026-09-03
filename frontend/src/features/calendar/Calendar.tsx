import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function Calendar() {
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()
  const { data } = useQuery({ queryKey: ["calendar-events"], queryFn: async () => (await api.get("/calendar/events/")).data })
  const events = Array.isArray(data) ? data : []
  const [form, setForm] = useState({ title: "", start_time: "", end_time: "" })
  const [refreshToken, setRefreshToken] = useState("")
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (params.get("connected") === "1") {
      setConnected(true)
      toast.success("¡Google Calendar conectado automáticamente!")
      setParams({}, { replace: true })
      qc.invalidateQueries({ queryKey: ["calendar-events"] })
    }
  }, [params])

  const auth = async () => {
    try {
      const { data } = await api.get("/calendar/auth/")
      if (data.url) window.location.href = data.url
      else toast.error("No se pudo obtener URL de auth")
    } catch (e:any) { toast.error(e.response?.data?.detail || e.message) }
  }
  const connect = async () => {
    if (!refreshToken.trim()) { toast.error("Pega el refresh_token"); return }
    try {
      await api.post("/calendar/connect/", { refresh_token: refreshToken.trim() })
      toast.success("Cuenta conectada")
      setRefreshToken("")
      setConnected(true)
      qc.invalidateQueries({ queryKey: ["calendar-events"] })
    } catch (e:any) { toast.error(e.response?.data?.detail || e.message) }
  }
  const create = useMutation({
    mutationFn: async () => (await api.post("/calendar/events/create/", form)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["calendar-events"] }); setForm({ title: "", start_time: "", end_time: "" }) }
  })

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Google Calendar</h1>
      {connected && <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 p-3 rounded">✅ Conectado a Google Calendar</div>}
      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border space-y-3">
        <p className="text-sm text-muted-foreground">Conecta tu Google Calendar con un clic. Serás redirigido a Google y volverás automáticamente.</p>
        <Button onClick={auth} className="w-full sm:w-auto">🔗 Conectar con Google Calendar</Button>
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">¿No funciona el auto? Conectar manual</summary>
          <div className="flex gap-2 mt-2">
            <input placeholder="Pega refresh_token" value={refreshToken} onChange={e=>setRefreshToken(e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm bg-background" />
            <Button variant="outline" onClick={connect} disabled={!refreshToken.trim()}>Conectar manual</Button>
          </div>
        </details>
      </div>
      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border space-y-2">
        <h3 className="font-semibold">Crear evento</h3>
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="border rounded px-2 py-1 text-sm w-full bg-background" />
        <div className="flex gap-2">
          <input type="datetime-local" value={form.start_time} onChange={e=>setForm({...form, start_time:e.target.value})} className="border rounded px-2 py-1 text-sm flex-1 bg-background" />
          <input type="datetime-local" value={form.end_time} onChange={e=>setForm({...form, end_time:e.target.value})} className="border rounded px-2 py-1 text-sm flex-1 bg-background" />
        </div>
        <Button onClick={()=>create.mutate()} disabled={!form.title || !form.start_time || !form.end_time}>Create Event</Button>
      </div>
      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border">
        <h3 className="font-semibold mb-2">Eventos ({events.length})</h3>
        <ul className="divide-y divide-border">
          {events.map((e:any,i:number)=><li key={i} className="py-2 text-sm flex justify-between"><span>{e.title}</span><span className="text-xs text-muted-foreground">{e.start_time?.slice(0,16)} → {e.end_time?.slice(0,16)}</span></li>)}
          {events.length===0 && <li className="py-2 text-sm text-muted-foreground">No events yet</li>}
        </ul>
      </div>
    </div>
  )
}
