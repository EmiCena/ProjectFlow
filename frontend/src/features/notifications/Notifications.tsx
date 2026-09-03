import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Link } from "react-router-dom"

function timeAgo(iso: string) {
  try {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  } catch { return iso }
}

function eventColor(event: string) {
  if (event.includes("task")) return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
  if (event.includes("invoice")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
  if (event.includes("project")) return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200"
  if (event.includes("client")) return "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 border-sky-200"
  if (event.includes("time")) return "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200"
  return "bg-slate-100 dark:bg-slate-800 border-border"
}
function statusColor(s: string) {
  const m: Record<string,string> = {
    backlog: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200",
    todo: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200",
    in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200",
    review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200",
    done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200",
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200",
    sent: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200",
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200",
  }
  return m[s] || "bg-muted text-muted-foreground border-border"
}
function eventIcon(event: string) {
  if (event === "task_created") return "➕"
  if (event === "task_status_changed") return "🔄"
  if (event === "time_logged") return "⏱️"
  if (event.includes("invoice")) return event.includes("paid") ? "✅" : "💰"
  if (event.includes("project")) return "📁"
  return "🔔"
}
function prettyEvent(event: string) {
  return event.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

export default function Notifications() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["activity"],
    queryFn: async () => (await api.get("/activity/")).data,
    retry: false,
  })

  const list = Array.isArray(data) ? data : data?.results ?? []

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400">Activity feed from Mongo · {list.length} events</p>
        </div>
        <button onClick={() => refetch()} className="border border-border px-3 py-1.5 rounded text-sm bg-card dark:bg-slate-900 hover:bg-muted">
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isLoading ? (
        <div className="bg-card dark:bg-slate-900 p-8 rounded-lg shadow border border-border text-center text-sm text-muted-foreground">Loading activity...</div>
      ) : isError ? (
        <div className="bg-card dark:bg-slate-900 p-8 rounded-lg shadow border border-border text-center text-sm text-red-600">Failed to load activity <button onClick={() => refetch()} className="underline ml-2">Retry</button></div>
      ) : list.length === 0 ? (
        <div className="bg-card dark:bg-slate-900 p-8 rounded-lg shadow border border-border text-center">
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">Actions like moving tasks or logging time will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((a: any) => {
            const md = a.metadata || {}
            return (
            <div key={a._id ?? a.id ?? `${a.event}-${a.created_at}`} className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border flex gap-3 hover:shadow-md transition-shadow">
              <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm border ${eventColor(a.event)}`}>{eventIcon(a.event)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${eventColor(a.event)}`}>{prettyEvent(a.event)}</span>
                  {a.entity && <span className="text-xs text-muted-foreground">· {a.entity} #{a.entity_id}</span>}
                  <span className="text-xs text-muted-foreground ml-auto">{timeAgo(a.created_at)}</span>
                </div>

                {/* Visual metadata */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {a.event === "task_status_changed" && md.old_status && md.new_status ? (
                    <>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor(md.old_status)}`}>{md.old_status}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor(md.new_status)}`}>{md.new_status}</span>
                    </>
                  ) : a.event === "task_created" ? (
                    <>
                      {md.title && <span className="px-2 py-1 rounded-full text-xs bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">📝 {md.title}</span>}
                      {md.project_id && <span className="px-2 py-1 rounded-full text-xs bg-muted border border-border">📁 Project #{md.project_id}</span>}
                    </>
                  ) : a.event === "time_logged" ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">⏱️ +{md.hours}h</span>
                  ) : a.event.includes("invoice") ? (
                    <>
                      {md.old_status && md.new_status ? (
                        <>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor(md.old_status)}`}>{md.old_status}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor(md.new_status)}`}>{md.new_status}</span>
                        </>
                      ) : md.total ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 text-emerald-700 dark:text-emerald-300">💰 ${md.total}</span>
                      ) : null}
                      {md.title && <span className="text-xs text-muted-foreground">Invoice #{a.entity_id}</span>}
                    </>
                  ) : Object.keys(md).length > 0 ? (
                    Object.entries(md).map(([k,v]) => (
                      <span key={k} className="px-2 py-1 rounded-full text-xs bg-muted border border-border"><span className="text-muted-foreground">{k}:</span> <b>{String(v)}</b></span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin detalles</span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2">
                  {a.user_id && <span className="text-xs text-muted-foreground">by user #{a.user_id}</span>}
                  {a.entity === "task" && a.entity_id && <Link to={`/tasks/${a.entity_id}`} className="text-xs text-primary hover:underline font-medium">View task →</Link>}
                  {a.entity === "invoice" && a.entity_id && <Link to={`/invoices/${a.entity_id}`} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">View invoice →</Link>}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  )
}
