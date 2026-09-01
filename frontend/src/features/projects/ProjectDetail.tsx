import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function ProjectDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [milestone, setMilestone] = useState({ title:"", due_date:"" })
  const { data: project, isLoading } = useQuery({ queryKey:["project", id], queryFn: async () => (await api.get(`/projects/${id}/`)).data })
  const { data: tasks } = useQuery({ queryKey:["tasks", id], queryFn: async () => (await api.get(`/tasks/?project=${id}`)).data })
  const addMilestone = useMutation({
    mutationFn: async (payload:any) => (await api.post(`/projects/${id}/milestones/`, payload)).data,
    onSuccess: () => { qc.invalidateQueries({queryKey:["project", id]}); setMilestone({title:"", due_date:""}) }
  })
  if (isLoading) return <div className="p-6">Loading...</div>
  if (!project) return <div className="p-6">Not found</div>
  const taskList = tasks?.results ?? tasks ?? []
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400">{project.description}</p>
          <div className="mt-2 flex gap-2 text-xs"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{project.status}</span><span className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">${project.budget}</span></div>
        </div>
        <Link to={`/projects/${id}/board`} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm h-fit">Open Board</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-2">Milestones</h3>
          <div className="flex gap-2 mb-3">
            <input placeholder="Title" value={milestone.title} onChange={e=>setMilestone({...milestone, title:e.target.value})} className="border border-border rounded px-2 py-1 text-sm flex-1 bg-background dark:bg-slate-800 text-foreground" />
            <input type="date" value={milestone.due_date} onChange={e=>setMilestone({...milestone, due_date:e.target.value})} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
            <Button onClick={()=>addMilestone.mutate({title: milestone.title, due_date: milestone.due_date || null})} disabled={!milestone.title}>Add</Button>
          </div>
          <ul className="divide-y divide-border">
            {(project.milestones ?? []).map((m:any)=><li key={m.id} className="py-2 flex justify-between text-sm border-border"><span>{m.title}</span><span className="text-muted-foreground dark:text-slate-400">{m.due_date || ""} {m.completed ? "✓" : ""}</span></li>)}
            {(!project.milestones || project.milestones.length===0) && <li className="text-sm text-muted-foreground dark:text-slate-400 py-2">No milestones</li>}
          </ul>
        </div>

        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-2">Tasks ({taskList.length})</h3>
          <ul className="divide-y divide-border max-h-64 overflow-auto">
            {taskList.map((t:any)=><li key={t.id} className="py-2 text-sm flex justify-between"><span>{t.title} <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded ml-1">{t.status}</span></span><span className="text-xs text-muted-foreground dark:text-slate-400">{t.priority}</span></li>)}
            {taskList.length===0 && <li className="text-sm text-muted-foreground dark:text-slate-400 py-2">No tasks yet</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
