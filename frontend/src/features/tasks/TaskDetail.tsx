import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function TaskDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [comment, setComment] = useState("")
  const [hours, setHours] = useState("")
  const [note, setNote] = useState("")

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => (await api.get(`/tasks/${id}/`)).data,
  })

  const addComment = useMutation({
    mutationFn: async (body: string) => (await api.post(`/tasks/${id}/comments/`, { body })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["task", id] }); setComment("") },
  })

  const logTime = useMutation({
    mutationFn: async ({ hours, description }: any) => (await api.post(`/tasks/${id}/time_entries/`, { hours, description })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["task", id] }); setHours(""); setNote("") },
  })

  const move = useMutation({
    mutationFn: async (status: string) => (await api.patch(`/tasks/${id}/move/`, { status, position: 0 })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task", id] }),
  })

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
  if (isError || !task) return <div className="p-6 text-sm">Task not found <Link to="/projects" className="text-indigo-600 underline ml-2">Back</Link></div>

  const comments = task.comments ?? []
  const timeEntries = task.time_entries ?? []
  const pct = task.estimated_hours > 0 ? Math.min(100, Math.round((Number(task.actual_hours) / Number(task.estimated_hours)) * 100)) : 0

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Link to={`/projects/${task.project}/board`} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">← Back to board</Link>

      <div className="bg-card dark:bg-slate-900 p-6 rounded-lg shadow border border-border">
        <div className="flex justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1 whitespace-pre-wrap">{task.description || "No description"}</p>
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <select value={task.status} onChange={e => move.mutate(e.target.value)} className="border border-border rounded px-2 py-1 bg-background dark:bg-slate-800">
                <option value="backlog">Backlog</option><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="review">Review</option><option value="done">Done</option>
              </select>
              <span className={`px-2 py-1 rounded ${task.priority === "urgent" ? "bg-red-100 text-red-700 dark:bg-red-900/30" : task.priority === "high" ? "bg-orange-100 dark:bg-orange-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>{task.priority}</span>
              {task.due_date && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Due {task.due_date}</span>}
              {task.assignee && <span className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">Assignee #{task.assignee}</span>}
            </div>
          </div>
          <Link to={`/projects/${task.project}`} className="text-xs border border-border px-3 py-1.5 rounded h-fit bg-background dark:bg-slate-800">Project #{task.project}</Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-border text-center"><p className="text-xs text-muted-foreground">Estimated</p><p className="font-bold">{Number(task.estimated_hours)}h</p></div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-border text-center"><p className="text-xs text-muted-foreground">Actual</p><p className="font-bold">{Number(task.actual_hours)}h</p></div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-border text-center"><p className="text-xs text-muted-foreground">Progress</p><p className="font-bold">{pct}%</p></div>
        </div>
        {task.estimated_hours > 0 && (
          <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded"><div className={`h-2 rounded ${pct > 100 ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-3">Time Entries ({timeEntries.length})</h3>
          <div className="flex gap-2 mb-3">
            <input type="number" step="0.5" min="0.1" max="24" value={hours} onChange={e => setHours(e.target.value)} placeholder="Hours" className="w-20 border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800" />
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note" className="flex-1 border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800" />
            <Button size="sm" onClick={() => { const h = Number(hours); if (h > 0 && h <= 24) logTime.mutate({ hours: h, description: note }) }} disabled={!hours || Number(hours) <= 0}>Log</Button>
          </div>
          <ul className="divide-y divide-border max-h-64 overflow-auto">
            {timeEntries.map((te: any) => (
              <li key={te.id} className="py-2 text-sm flex justify-between"><span>{te.username || `User #${te.user}`}: {te.hours}h — {te.description || "no note"}</span><span className="text-xs text-muted-foreground">{te.date}</span></li>
            ))}
            {timeEntries.length === 0 && <li className="text-sm text-muted-foreground py-2">No time logged</li>}
          </ul>
        </div>

        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-3">Comments ({comments.length})</h3>
          <div className="space-y-2 max-h-64 overflow-auto mb-3">
            {comments.map((c: any) => (
              <div key={c.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-border">
                <div className="flex justify-between text-xs text-muted-foreground"><span className="font-medium text-foreground">{c.author_username || `User #${c.author}`}</span><span>{new Date(c.created_at).toLocaleString()}</span></div>
                <p className="text-sm mt-1 whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet</p>}
          </div>
          <div className="flex gap-2">
            <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." className="flex-1 border border-border rounded px-3 py-2 text-sm bg-background dark:bg-slate-800" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (comment.trim()) addComment.mutate(comment.trim()) } }} />
            <Button onClick={() => { if (comment.trim()) addComment.mutate(comment.trim()) }} disabled={!comment.trim()} loading={addComment.isPending}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
