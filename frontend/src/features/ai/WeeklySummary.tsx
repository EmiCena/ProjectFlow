import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function WeeklySummary() {
  const [projectId, setProjectId] = useState("")
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string>("")
  const fetchSummary = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const { data } = await api.get(`/ai/summary/${projectId}/`)
      setSummary(data.summary)
    } catch(e:any){ setSummary(e.response?.data?.detail || e.message) }
    setLoading(false)
  }
  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Weekly Summary</h1>
      <div className="bg-white p-4 rounded-lg shadow flex gap-2">
        <input value={projectId} onChange={e=>setProjectId(e.target.value)} placeholder="Project ID" className="border rounded px-2 py-1 text-sm" />
        <Button onClick={fetchSummary} disabled={loading || !projectId}>{loading ? "..." : "Generate"}</Button>
      </div>
      {summary && <div className="bg-white p-4 rounded-lg shadow whitespace-pre-wrap text-sm">{summary}</div>}
    </div>
  )
}
