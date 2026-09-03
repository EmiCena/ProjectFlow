import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function ChatWithDocs() {
  const [q, setQ] = useState("")
  const [ans, setAns] = useState("")
  const [loading, setLoading] = useState(false)
  const ask = async () => {
    if (!q.trim()) return
    setLoading(true)
    setAns("")
    try {
      const { data } = await api.post("/ai/plan/", { brief: `Chat with docs: ${q}` })
      setAns(`Respuesta (demo - RAG mock, basado en ${data.title}): ${data.tasks?.[0]?.description || "No se encontraron docs, respuesta simulada."}`)
    } catch(e:any){ setAns(e.response?.data?.detail || e.message) }
    setLoading(false)
  }
  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">AI Chat with Documents</h1>
      <p className="text-sm text-muted-foreground">Pregunta sobre tus documentos (R2). <span className="text-amber-600">Demo: usa /ai/plan como mock RAG</span> — RAG real próximamente.</p>
      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter" && ask()} placeholder="e.g. What are the payment terms?" className="flex-1 border rounded px-2 py-2 text-sm bg-background" />
        <Button onClick={ask} disabled={loading || !q.trim()}>{loading ? "..." : "Ask"}</Button>
      </div>
      {ans && <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border whitespace-pre-wrap text-sm">{ans}</div>}
    </div>
  )
}
