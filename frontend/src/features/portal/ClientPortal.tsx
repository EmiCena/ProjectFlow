import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"

export default function ClientPortal() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: async () => (await api.get("/auth/me/")).data })
  const { data: projectsData } = useQuery({ queryKey: ["projects-portal"], queryFn: async () => (await api.get("/projects/")).data })
  const projects = projectsData?.results ?? projectsData ?? []
  // Filter to only show active/planning for client portal (simplified)
  const visible = projects.filter((p:any) => ["active","planning","review"].includes(p.status))

  return (
    <div className="p-6 space-y-6">
      <div className="bg-card dark:bg-slate-900 p-6 rounded-lg shadow border">
        <h1 className="text-2xl font-bold">Client Portal</h1>
        <p className="text-sm text-muted-foreground">Welcome {me?.username} - view your project progress, milestones and invoices</p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Restricted view - no internal task details or team data</p>
      </div>
      <div className="grid gap-4">
        {visible.map((p:any)=>(
          <div key={p.id} className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border">
            <div className="flex justify-between">
              <h3 className="font-semibold">{p.title}</h3>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded capitalize">{p.status}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{p.description || "No description"}</p>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded h-2"><div className="bg-primary h-2 rounded" style={{width: `${p.progress || 0}%`}} /></div>
            <p className="text-xs text-muted-foreground mt-1">{p.progress || 0}% complete</p>
            <Link to={`/projects/${p.id}`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">View details →</Link>
          </div>
        ))}
        {visible.length===0 && <div className="text-sm text-muted-foreground bg-card dark:bg-slate-900 p-4 rounded border">No projects shared with you yet</div>}
      </div>
    </div>
  )
}
