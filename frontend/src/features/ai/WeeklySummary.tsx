import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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
      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border flex gap-2">
        <input value={projectId} onChange={e=>setProjectId(e.target.value)} placeholder="Project ID" className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
        <Button onClick={fetchSummary} disabled={loading || !projectId}>{loading ? "..." : "Generate"}</Button>
      </div>
      {summary && (
        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-lg prose-h3:text-base prose-table:border prose-th:bg-slate-50 dark:prose-th:bg-slate-800 prose-th:px-3 prose-th:py-1 prose-td:px-3 prose-td:py-1 prose-td:border prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-li:marker:text-slate-400 dark:prose-li:marker:text-slate-500">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
