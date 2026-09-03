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
  if (event.includes("invoice")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200"
  if (event.includes("project")) return "bg-amber-50 text-amber-700 dark:bg-amber-900/20"
  if (event.includes("client")) return "bg-sky-50 text-sky-700 dark:bg-sky-900/20"
  if (event.includes("time")) return "bg-purple-50 text-purple-700 dark:bg-purple-900/20"
  return "bg-slate-100 dark:bg-slate-800"
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
          {list.map((a: any) => (
            <div key={a._id ?? a.id ?? `${a.event}-${a.created_at}`} className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border flex gap-3">
              <div className={`h-fit px-2 py-1 rounded text-xs font-medium border ${eventColor(a.event)}`}>{a.event}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{a.event}</span>
                  {a.entity && <span className="text-muted-foreground"> · {a.entity} #{a.entity_id}</span>}
                  {a.user_id && <span className="text-xs text-muted-foreground ml-2">by user #{a.user_id}</span>}
                </p>
                {a.metadata && Object.keys(a.metadata).length > 0 && (
                  <pre className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded mt-2 overflow-auto border border-border">{JSON.stringify(a.metadata, null, 2)}</pre>
                )}
                {a.entity === "task" && a.entity_id && <Link to={`/tasks/${a.entity_id}`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block">View task →</Link>}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(a.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
