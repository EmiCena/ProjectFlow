import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function Projects() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [form, setForm] = useState({ title:"", description:"", client:"", budget:0, status:"planning" })
  const { data: clients } = useQuery({ queryKey:["clients-all"], queryFn: async () => (await api.get("/clients/")).data })
  const { data, isLoading } = useQuery({ queryKey:["projects"], queryFn: async () => (await api.get("/projects/")).data })
  const create = useMutation({
    mutationFn: async (payload:any) => (await api.post("/projects/", payload)).data,
    onSuccess: () => { qc.invalidateQueries({queryKey:["projects"]}); setForm({title:"",description:"",client:"",budget:0,status:"planning"}) }
  })
  const list = data?.results ?? data ?? []
  const clientList = clients?.results ?? clients ?? []
  const handleExport = async () => {
    const res = await api.get("/projects/export/", { responseType: "blob" })
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }))
    const a = document.createElement("a"); a.href = url
    a.download = res.headers["content-disposition"]?.match(/filename="?([^"]+)"?/)?.[1] || "projects.csv"
    document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url)
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('nav.projects')}</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>{t('common.export')}</Button>
      </div>
      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border space-y-3">
        <h3 className="font-semibold">New Project</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input placeholder="Title *" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
          <select value={form.client} onChange={e=>setForm({...form, client:e.target.value})} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground">
            <option value="">No client</option>
            {clientList.map((c:any)=><option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
          <input type="number" placeholder="Budget" value={form.budget} onChange={e=>setForm({...form, budget:Number(e.target.value)})} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
        </div>
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="border border-border rounded px-2 py-1 text-sm w-full bg-background dark:bg-slate-800 text-foreground" rows={2} />
        <div className="flex gap-2">
          <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground">
            <option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </select>
          <Button onClick={()=>create.mutate({ ...form, client: form.client ? Number(form.client) : null })} disabled={!form.title}>{t('common.create')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? <div className="text-muted-foreground dark:text-slate-400">{t('common.loading')}</div> : list.map((p:any)=>
          <div key={p.id} className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border hover:shadow-md transition">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-muted-foreground dark:text-slate-400 line-clamp-2">{p.description || "No description"}</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{p.status}</span>
              <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">${p.budget}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Link to={`/projects/${p.id}`} className="text-indigo-600 dark:text-indigo-400 text-sm">View</Link>
              <Link to={`/projects/${p.id}/board`} className="text-slate-600 dark:text-slate-400 text-sm">Board</Link>
            </div>
            {p.milestones?.length>0 && <div className="mt-2 text-xs text-muted-foreground dark:text-slate-400">{p.milestones.length} milestones</div>}
          </div>
        )}
        {!isLoading && list.length===0 && <div className="text-muted-foreground dark:text-slate-400">No projects</div>}
      </div>
    </div>
  )
}
