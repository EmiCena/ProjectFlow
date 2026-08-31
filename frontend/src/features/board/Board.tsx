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
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick} className="bg-white p-3 rounded shadow-sm border text-sm cursor-grab hover:shadow">
      <div className="font-medium">{task.title}</div>
      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</div>
      <div className="flex gap-1 mt-2">
        <span className={`text-xs px-1.5 py-0.5 rounded ${task.priority==='urgent'?'bg-red-100 text-red-700': task.priority==='high'?'bg-orange-100':''} bg-slate-100`}>{task.priority}</span>
        {task.assignee && <span className="text-xs bg-indigo-50 px-1 rounded">#{task.assignee}</span>}
      </div>
    </div>
  )
}
function Column({ id, label, tasks, onAdd, onTaskClick }:any) {
  const { setNodeRef } = useDroppable({ id })
  const sortableIds = tasks.map((t:any)=>t.id)
  return (
    <div ref={setNodeRef} className="bg-slate-100 rounded-lg p-3 min-h-[400px] flex flex-col">
      <h3 className="font-semibold text-sm mb-2 flex justify-between">{label}<span className="bg-white px-1.5 rounded text-xs">{tasks.length}</span></h3>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1">
          {tasks.map((t:any)=><TaskCard key={t.id} task={t} onClick={()=>onTaskClick(t)} />)}
        </div>
      </SortableContext>
      <button onClick={onAdd} className="mt-2 text-xs border border-dashed rounded py-1 bg-white hover:bg-slate-50">+ Add</button>
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
        <span className="text-sm text-slate-500">{tasks.length} tasks</span>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {COLS.map(col=>
            <Column key={col.id} id={col.id} label={col.label} tasks={grouped[col.id]||[]} onAdd={()=>handleAdd(col.id)} onTaskClick={setSelected} />
          )}
        </div>
      </DndContext>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-md space-y-3" onClick={e=>e.stopPropagation()}>
            <h3 className="font-semibold">{selected.title}</h3>
            <p className="text-sm text-slate-600">{selected.description || "No description"}</p>
            <div className="text-xs flex gap-2"><span className="bg-slate-100 px-2 py-1 rounded">{selected.status}</span><span className="bg-slate-100 px-2 py-1 rounded">{selected.priority}</span></div>
            <div className="border-t pt-2">
              <h4 className="text-sm font-semibold">Comments</h4>
              <div className="space-y-1 max-h-32 overflow-auto">
                {(selected.comments ?? []).map((c:any)=><div key={c.id} className="text-sm bg-slate-50 p-2 rounded"><b>{c.author_username || c.author}</b>: {c.body}</div>)}
              </div>
              <div className="flex gap-2 mt-2">
                <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add comment" className="flex-1 border rounded px-2 py-1 text-sm" />
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
