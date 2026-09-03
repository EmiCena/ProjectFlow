import { useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { DndContext, closestCenter, DragEndEvent, useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Trello palette: board #0079BF, list #EBECF0, card #FFFFFF, text #172B4D
const COLS = [
  { id:"backlog", label:"Backlog" },
  { id:"todo", label:"To Do" },
  { id:"in_progress", label:"In Progress" },
  { id:"review", label:"In Review" },
  { id:"done", label:"Done" },
]

function TrelloCard({ task, onClick }:any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.8 : 1 }
  const pct = task.estimated_hours > 0 ? Math.min(100, Math.round((Number(task.actual_hours)/Number(task.estimated_hours))*100)) : 0
  const priorityColor = task.priority==='urgent' ? 'bg-red-500' : task.priority==='high' ? 'bg-orange-500' : task.priority==='medium' ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}
      className="bg-white rounded-[3px] shadow-[0_1px_0_rgba(9,30,66,.25)] p-2 mb-2 cursor-pointer hover:bg-[#f4f5f7] transition-colors group text-[14px] leading-5 text-[#172b4d]">
      {task.priority !== 'low' && <div className={`h-2 w-10 rounded-full mb-2 ${priorityColor}`} />}
      <div className="font-normal">{task.title}</div>
      {task.description && <div className="text-xs text-[#5e6c84] mt-1 line-clamp-2">{task.description}</div>}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span className="text-[11px] bg-[#dfe1e6] text-[#172b4d] px-1.5 py-0.5 rounded-[3px]">{task.priority}</span>
        <span className="text-[11px] bg-[#dfe1e6] px-1.5 py-0.5 rounded-[3px]">{Number(task.estimated_hours)}h / {Number(task.actual_hours)}h</span>
      </div>
      {task.estimated_hours>0 && <div className="mt-2 h-1 bg-[#dfe1e6] rounded-full"><div className={`h-1 rounded-full ${pct>100?'bg-red-500': pct>80?'bg-orange-500':'bg-green-500'}`} style={{width:`${Math.min(100,pct)}%`}} /></div>}
    </div>
  )
}

function TrelloList({ id, label, tasks, onAdd, onTaskClick }:any) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const sortableIds = tasks.map((t:any)=>t.id)
  const est = tasks.reduce((s:any,t:any)=>s+Number(t.estimated_hours||0),0)
  return (
    <div ref={setNodeRef} className={`bg-[#ebecf0] rounded-[3px] w-[272px] shrink-0 flex flex-col max-h-full ${isOver ? 'bg-[#dfe1e6]' : ''}`}>
      <div className="p-2 flex justify-between items-center">
        <h3 className="font-semibold text-sm text-[#172b4d] px-2 py-1">{label}</h3>
        <span className="text-xs text-[#5e6c84] px-2">{tasks.length}</span>
      </div>
      <div className="px-2 text-[11px] text-[#5e6c84] -mt-1 mb-1">{est}h estimated</div>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-1 space-y-0 min-h-[20px]">
          {tasks.map((t:any)=><TrelloCard key={t.id} task={t} onClick={()=>onTaskClick(t)} />)}
        </div>
      </SortableContext>
      <div className="p-2">
        <button onClick={onAdd} className="w-full text-left text-sm text-[#5e6c84] hover:text-[#172b4d] hover:bg-[#dfe1e6] rounded-[3px] px-2 py-1.5 flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Add a card
        </button>
      </div>
    </div>
  )
}

function TimeLogForm({ taskId, logTime }: any) {
  const [hours, setHours] = useState("")
  const [desc, setDesc] = useState("")
  return (
    <div className="flex gap-2 mt-2">
      <input type="number" step="0.5" min="0.1" max="24" value={hours} onChange={e=>setHours(e.target.value)} placeholder="Hours" className="w-20 border border-[#dfe1e6] rounded-[3px] px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0079bf]" />
      <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Note" className="flex-1 border border-[#dfe1e6] rounded-[3px] px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0079bf]" />
      <Button size="sm" onClick={() => { const h=Number(hours); if(h>0){ logTime.mutate({taskId, hours:h, description:desc}); setHours(""); setDesc("") }}}>Log</Button>
    </div>
  )
}

export default function Board() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<any>(null)
  const [comment, setComment] = useState("")

  const { data: tasksData } = useQuery({ queryKey:["tasks", id], queryFn: async () => (await api.get(`/tasks/?project=${id}`)).data })
  const tasks = useMemo(()=> tasksData?.results ?? tasksData ?? [], [tasksData])

  const create = useMutation({ mutationFn: async (payload:any) => (await api.post("/tasks/", payload)).data, onSuccess: () => qc.invalidateQueries({queryKey:["tasks", id]}) })
  const move = useMutation({ mutationFn: async ({taskId, status, position}:any) => (await api.patch(`/tasks/${taskId}/move/`, {status, position})).data, onSuccess: () => qc.invalidateQueries({queryKey:["tasks", id]}) })
  const addComment = useMutation({ mutationFn: async ({taskId, body}:any) => (await api.post(`/tasks/${taskId}/comments/`, {body})).data, onSuccess: () => qc.invalidateQueries({queryKey:["tasks", id]}) })
  const logTime = useMutation({ mutationFn: async ({taskId, hours, description}:any) => (await api.post(`/tasks/${taskId}/time_entries/`, {hours, description})).data, onSuccess: () => qc.invalidateQueries({queryKey:["tasks", id]}) })

  const grouped = useMemo(()=>{ const g:any = {}; COLS.forEach(c=>g[c.id]=[]); tasks.forEach((t:any)=> (g[t.status] ??= []).push(t)); return g }, [tasks])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const activeTask = tasks.find((t:any)=> String(t.id)===String(active.id))
    if (!activeTask) return
    let newStatus = null
    if (COLS.some(c=>c.id===String(over.id))) newStatus = String(over.id)
    else { const overTask = tasks.find((t:any)=> String(t.id)===String(over.id)); if (overTask) newStatus = overTask.status }
    if (newStatus && newStatus!==activeTask.status) move.mutate({ taskId: activeTask.id, status: newStatus, position: 0 })
  }
  const handleAdd = (col:string) => {
    const title = prompt(`New card title for ${col}?`)
    if (!title) return
    create.mutate({ project: Number(id), title, status: col, priority:"medium", estimated_hours: 8 })
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-0px)] bg-[#0079bf] -m-6">
      {/* Trello board header */}
      <div className="bg-[#0079bf] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-[18px]">Board — Project {id}</h1>
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{tasks.length} cards</span>
          <span className="hidden md:inline text-xs bg-white/20 px-2 py-0.5 rounded">Team Workspace</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-white/20 px-2 py-1 rounded">★ Star</span>
          <span className="bg-white/20 px-2 py-1 rounded hidden md:inline">⋯ Show menu</span>
        </div>
      </div>
      {/* Board canvas - horizontal scroll like Trello */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 h-full items-start">
            {COLS.map(col=> <TrelloList key={col.id} id={col.id} label={col.label} tasks={grouped[col.id]||[]} onAdd={()=>handleAdd(col.id)} onTaskClick={setSelected} />)}
            <div className="w-[272px] shrink-0">
              <button className="w-full text-left bg-white/20 hover:bg-white/30 text-white rounded-[3px] px-3 py-2.5 text-sm font-medium">+ Add another list</button>
            </div>
          </div>
        </DndContext>
      </div>
      {/* Card modal - Trello style */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center p-4 md:p-8 z-50 overflow-auto" onClick={()=>setSelected(null)}>
          <div className="bg-[#f4f5f7] rounded-[3px] w-full max-w-[768px] my-8 overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="bg-white p-4 border-b border-[#dfe1e6]">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-[#172b4d] text-[16px]">{selected.title}</h3>
                  <p className="text-xs text-[#5e6c84] mt-1">in list <span className="underline">{selected.status}</span> · Priority <span className="font-medium">{selected.priority}</span></p>
                </div>
                <button onClick={()=>setSelected(null)} className="h-8 w-8 flex items-center justify-center hover:bg-[#091e4214] rounded-full text-[#5e6c84]">✕</button>
              </div>
              <p className="text-sm text-[#172b4d] mt-3">{selected.description || "No description"}</p>
              <div className="flex gap-2 mt-3 text-xs">
                <span className="bg-[#dfe1e6] px-2 py-1 rounded-[3px]">Est {Number(selected.estimated_hours)}h</span>
                <span className="bg-[#dfe1e6] px-2 py-1 rounded-[3px]">Act {Number(selected.actual_hours)}h</span>
              </div>
            </div>
            <div className="p-4 grid md:grid-cols-[1fr_180px] gap-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#172b4d] mb-2">Time tracking</h4>
                  <TimeLogForm taskId={selected.id} logTime={logTime} />
                  {(selected.time_entries?.length > 0) && <div className="mt-2 space-y-1">{selected.time_entries.map((te:any)=><div key={te.id} className="text-xs bg-white p-2 rounded-[3px] shadow-sm flex justify-between"><span>{te.username}: {te.hours}h — {te.description || "no note"}</span><span className="text-[#5e6c84]">{te.date}</span></div>)}</div>}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#172b4d] mb-2">Comments</h4>
                  <div className="space-y-2">
                    {(selected.comments ?? []).map((c:any)=><div key={c.id} className="bg-white p-2 rounded-[3px] shadow-sm text-sm"><b className="text-[#172b4d]">{c.author_username || c.author}</b><span className="text-[#5e6c84]"> — {c.body}</span></div>)}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Write a comment..." className="flex-1 border border-[#dfe1e6] rounded-[3px] px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0079bf]" />
                    <Button size="sm" onClick={()=>{ if(comment.trim()){ addComment.mutate({taskId:selected.id, body:comment}); setComment("") }}}>Save</Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#5e6c84] uppercase">Add to card</p>
                <button className="w-full text-left bg-[#091e420a] hover:bg-[#091e4214] text-[#172b4d] rounded-[3px] px-3 py-1.5 text-sm">Members</button>
                <button className="w-full text-left bg-[#091e420a] hover:bg-[#091e4214] text-[#172b4d] rounded-[3px] px-3 py-1.5 text-sm">Labels</button>
                <button className="w-full text-left bg-[#091e420a] hover:bg-[#091e4214] text-[#172b4d] rounded-[3px] px-3 py-1.5 text-sm">Checklist</button>
                <button className="w-full text-left bg-[#091e420a] hover:bg-[#091e4214] text-[#172b4d] rounded-[3px] px-3 py-1.5 text-sm">Attachment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
