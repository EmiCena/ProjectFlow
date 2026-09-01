import { useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { DndContext, closestCenter, DragEndEvent, useDroppable, useDraggable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const COLS = [
  { id:"backlog", label:"Backlog" },
  { id:"todo", label:"To Do" },
  { id:"in_progress", label:"In Progress" },
  { id:"review", label:"Review" },
  { id:"done", label:"Done" },
]

function TaskCard({ task, onClick }:any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const pct = task.estimated_hours > 0 ? Math.min(100, Math.round((Number(task.actual_hours)/Number(task.estimated_hours))*100)) : 0
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick} className="bg-card dark:bg-slate-900 p-3 rounded shadow-sm border border-border text-sm cursor-grab hover:shadow">
      <div className="font-medium">{task.title}</div>
      <div className="text-xs text-muted-foreground dark:text-slate-400 mt-1 line-clamp-2">{task.description}</div>
      <div className="flex gap-1 mt-2 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded ${task.priority==='urgent'?'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300': task.priority==='high'?'bg-orange-100 dark:bg-orange-900/30':''} bg-slate-100 dark:bg-slate-800`}>{task.priority}</span>
        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{Number(task.estimated_hours)}h est</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${Number(task.actual_hours)>Number(task.estimated_hours)?'bg-red-100 text-red-700 dark:bg-red-900/30': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'}`}>{Number(task.actual_hours)}h act</span>
        {task.assignee && <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">#{task.assignee}</span>}
      </div>
      {task.estimated_hours>0 && <div className="mt-2 h-1 bg-slate-100 dark:bg-slate-800 rounded"><div className={`h-1 rounded ${pct>100?'bg-red-500': pct>80?'bg-amber-500':'bg-emerald-500'}`} style={{width:`${Math.min(100,pct)}%`}} /></div>}
    </div>
  )
}
function Column({ id, label, tasks, onAdd, onTaskClick }:any) {
  const { setNodeRef } = useDroppable({ id })
  const sortableIds = tasks.map((t:any)=>t.id)
  const est = tasks.reduce((s:any,t:any)=>s+Number(t.estimated_hours||0),0)
  const act = tasks.reduce((s:any,t:any)=>s+Number(t.actual_hours||0),0)
  return (
    <div ref={setNodeRef} className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 min-h-[400px] flex flex-col">
      <h3 className="font-semibold text-sm mb-2 flex justify-between">{label}<span className="bg-card dark:bg-slate-900 px-1.5 rounded text-xs border border-border">{tasks.length} · {est}h/{act}h</span></h3>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1">
          {tasks.map((t:any)=><TaskCard key={t.id} task={t} onClick={()=>onTaskClick(t)} />)}
        </div>
      </SortableContext>
      <button onClick={onAdd} className="mt-2 text-xs border border-border border-dashed rounded py-1 bg-card dark:bg-slate-900 hover:bg-muted dark:hover:bg-slate-800 text-foreground">+ Add</button>
    </div>
  )
}

function TimeLogForm({ taskId, logTime, onLogged }: any) {
  const [hours, setHours] = useState("")
  const [desc, setDesc] = useState("")
  return (
    <div className="flex gap-2 mt-2">
      <input type="number" step="0.5" min="0.1" max="24" value={hours} onChange={e=>setHours(e.target.value)} placeholder="Hours" className="w-20 border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
      <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Note" className="flex-1 border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
      <Button size="sm" onClick={() => { const h=Number(hours); if(h>0){ logTime.mutate({taskId, hours:h, description:desc}); setHours(""); setDesc(""); onLogged() }}}>Log</Button>
    </div>
  )
}

export default function Board() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [newTitle, setNewTitle] = useState("")
  const [activeCol, setActiveCol] = useState("todo")
  const [selected, setSelected] = useState<any>(null)
  const [comment, setComment] = useState("")

  const { data: tasksData } = useQuery({ queryKey:["tasks", id], queryFn: async () => (await api.get(`/tasks/?project=${id}`)).data })
  const tasks = useMemo(()=> tasksData?.results ?? tasksData ?? [], [tasksData])

  const create = useMutation({
    mutationFn: async (payload:any) => (await api.post("/tasks/", payload)).data,
    onSuccess: () => qc.invalidateQueries({queryKey:["tasks", id]})
  })
  const move = useMutation({
    mutationFn: async ({taskId, status, position}:any) => (await api.patch(`/tasks/${taskId}/move/`, {status, position})).data,
    onSuccess: () => qc.invalidateQueries({queryKey:["tasks", id]})
  })
  const addComment = useMutation({
    mutationFn: async ({taskId, body}:any) => (await api.post(`/tasks/${taskId}/comments/`, {body})).data,
    onSuccess: () => qc.invalidateQueries({queryKey:["tasks", id]})
  })
  const logTime = useMutation({
    mutationFn: async ({taskId, hours, description}:any) => (await api.post(`/tasks/${taskId}/time_entries/`, {hours, description})).data,
    onSuccess: () => qc.invalidateQueries({queryKey:["tasks", id]})
  })

  const grouped = useMemo(()=>{
    const g:any = {}; COLS.forEach(c=>g[c.id]=[]); tasks.forEach((t:any)=> (g[t.status] ??= []).push(t)); return g
  }, [tasks])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const activeTask = tasks.find((t:any)=> String(t.id)===String(active.id))
    if (!activeTask) return
    // over.id can be column id or task id
    let newStatus = null
    if (COLS.some(c=>c.id===String(over.id))) newStatus = String(over.id)
    else {
      const overTask = tasks.find((t:any)=> String(t.id)===String(over.id))
      if (overTask) newStatus = overTask.status
    }
    if (newStatus && newStatus!==activeTask.status) {
      move.mutate({ taskId: activeTask.id, status: newStatus, position: 0 })
    }
  }

  const handleAdd = (col:string) => {
    const title = prompt(`New task title for ${col}?`)
    if (!title) return
    create.mutate({ project: Number(id), title, status: col, priority:"medium", estimated_hours: 8 })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Board — Project {id}</h1>
        <span className="text-sm text-muted-foreground dark:text-slate-400">{tasks.length} tasks</span>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {COLS.map(col=>
            <Column key={col.id} id={col.id} label={col.label} tasks={grouped[col.id]||[]} onAdd={()=>handleAdd(col.id)} onTaskClick={setSelected} />
          )}
        </div>
      </DndContext>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={()=>setSelected(null)}>
          <div className="bg-card dark:bg-slate-900 rounded-lg p-4 w-full max-w-md space-y-3 max-h-[90vh] overflow-auto border border-border" onClick={e=>e.stopPropagation()}>
            <h3 className="font-semibold">{selected.title}</h3>
            <p className="text-sm text-muted-foreground dark:text-slate-400">{selected.description || "No description"}</p>
            <div className="text-xs flex gap-2 flex-wrap">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{selected.status}</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{selected.priority}</span>
              <span className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">Est {Number(selected.estimated_hours)}h</span>
              <span className="bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Act {Number(selected.actual_hours)}h</span>
            </div>
            <div className="border-t border-border pt-2">
              <h4 className="text-sm font-semibold">Log Time</h4>
              <TimeLogForm taskId={selected.id} onLogged={() => {}} logTime={logTime} />
              {(selected.time_entries?.length > 0) && (
                <div className="mt-2 space-y-1">
                  {selected.time_entries.map((te:any)=><div key={te.id} className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded flex justify-between"><span>{te.username}: {te.hours}h — {te.description || "no note"}</span><span className="text-muted-foreground dark:text-slate-400">{te.date}</span></div>)}
                </div>
              )}
            </div>
            <div className="border-t border-border pt-2">
              <h4 className="text-sm font-semibold">Comments</h4>
              <div className="space-y-1 max-h-32 overflow-auto">
                {(selected.comments ?? []).map((c:any)=><div key={c.id} className="text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded"><b>{c.author_username || c.author}</b>: {c.body}</div>)}
              </div>
              <div className="flex gap-2 mt-2">
                <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add comment" className="flex-1 border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
                <Button onClick={()=>{ if(comment.trim()){ addComment.mutate({taskId:selected.id, body:comment}); setComment("") }}}>Send</Button>
              </div>
            </div>
            <Button variant="outline" onClick={()=>setSelected(null)} className="w-full">Close</Button>
          </div>
        </div>
      )}
    </div>
  )
}
