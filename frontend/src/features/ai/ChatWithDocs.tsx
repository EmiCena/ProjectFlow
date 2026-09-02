import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function ChatWithDocs() {
  const [q, setQ] = useState("")
  const [ans, setAns] = useState("")
  const [loading, setLoading] = useState(false)
  const ask = async () => {
    setLoading(true)
    try {
      // Uses same OpenRouter backend with RAG on documents (mock for now)
      const { data } = await api.post("/ai/plan/", { brief: `Chat with docs: ${q}` })
      setAns(`Answer (from ${data.title}): ${data.tasks?.[0]?.description || "No docs found, but here's a mock answer."}`)
    } catch(e:any){ setAns(e.response?.data?.detail || e.message) }
    setLoading(false)
  }
  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">AI Chat with Documents</h1>
      <p className="text-sm text-muted-foreground">Ask questions about your uploaded project documents (R2). Uses OpenRouter RAG (mock).</p>
      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. What are the payment terms?" className="flex-1 border rounded px-2 py-2 text-sm bg-background" />
        <Button onClick={ask} disabled={loading || !q}>{loading ? "..." : "Ask"}</Button>
      </div>
      {ans && <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border whitespace-pre-wrap text-sm">{ans}</div>}
    </div>
  )
}
