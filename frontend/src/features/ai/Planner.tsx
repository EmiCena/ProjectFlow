import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

export default function Planner() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [brief, setBrief] = useState("We need an ecommerce website where customers can browse products, create accounts, purchase using Stripe, and track their orders.")
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const generate = async () => {
    setLoading(true)
    try {
      const { data } = await api.post("/ai/plan/", { brief })
      setPlan(data)
    } catch(e:any){ alert(e.response?.data?.detail || e.message) }
    setLoading(false)
  }
  const confirm = async () => {
    if (!plan) return
    setCreating(true)
    try {
      const { data } = await api.post("/ai/plan/confirm/", { title: plan.title, description: brief, milestones: plan.milestones, tasks: plan.tasks, budget: 0 })
      setResult(data)
      qc.invalidateQueries({queryKey:["projects"]})
      qc.invalidateQueries({queryKey:["tasks"]})
    } catch(e:any){ alert(JSON.stringify(e.response?.data)) }
    setCreating(false)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">{t('ai.planner')}</h1>
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <textarea value={brief} onChange={e=>setBrief(e.target.value)} rows={4} placeholder={t('ai.briefPlaceholder')} className="w-full border rounded p-2 text-sm" />
        <Button onClick={generate} disabled={loading || brief.length<20}>{loading ? "Generating..." : t('ai.generate')}</Button>
      </div>

      {plan && (
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <h3 className="font-semibold text-lg">{plan.title}</h3>
          <p className="text-sm text-slate-500">Estimated {plan.estimated_duration_days} days</p>
          <h4 className="font-semibold text-sm mt-2">Milestones</h4>
          <ul className="list-disc pl-5 text-sm">
            {plan.milestones?.map((m:any,i:number)=><li key={i}>{m.title} (+{m.due_offset_days}d)</li>)}
          </ul>
          <h4 className="font-semibold text-sm mt-2">Tasks ({plan.tasks?.length})</h4>
          <ul className="divide-y">
            {plan.tasks?.map((task:any,i:number)=>
              <li key={i} className="py-2 text-sm flex justify-between"><span><b>{task.title}</b> <span className="text-slate-500">— {task.description}</span></span><span className="text-xs bg-slate-100 px-2 py-1 rounded h-fit">{task.priority} · {task.estimated_hours}h</span></li>
            )}
          </ul>
          <Button onClick={confirm} disabled={creating} className="w-full">{creating ? "Creating..." : t('ai.createProject')}</Button>
          {result && <div className="bg-green-50 text-green-700 p-2 rounded text-sm">Created project {result.project_id} with {result.created_tasks} tasks — <a href={`/projects/${result.project_id}/board`} className="underline">Open board</a></div>}
        </div>
      )}
    </div>
  )
}
