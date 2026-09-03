import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { api } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function Dashboard() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ["summary"],
    queryFn: async () => (await api.get("/analytics/summary/")).data
  })
  if (isLoading) return <div className="p-6">{t('common.loading')}</div>
  if (!data) return <div className="p-6">No workspace — crea uno</div>
  const COLORS = ["#4f46e5","#06b6d4","#f59e0b","#10b981","#ef4444"]
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title={t('dashboard.activeProjects')} value={data.active_projects} />
        <Card title={t('dashboard.completedProjects')} value={data.completed_projects} />
        <Card title={t('dashboard.outstanding')} value={`$${data.outstanding_total}`} />
        <Card title="Completion" value={`${data.task_completion_rate}%`} />
      </div>
      {(data.total_estimated_hours !== undefined) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Estimated Hours" value={`${data.total_estimated_hours}h`} />
          <Card title="Actual Hours" value={`${data.total_actual_hours}h`} />
          <Card title="Variance" value={`${data.hours_variance > 0 ? '+' : ''}${data.hours_variance}h`} />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-2">Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={Array.isArray(data.monthly_revenue) ? data.monthly_revenue : []}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-2">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={Array.isArray(data.status_distribution) ? data.status_distribution : []} dataKey="count" nameKey="status" outerRadius={80} label>
                {(Array.isArray(data.status_distribution) ? data.status_distribution : []).map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-2">Upcoming Deadlines</h3>
          <ul className="divide-y divide-border">
            {(Array.isArray(data.upcoming_deadlines) ? data.upcoming_deadlines : []).map((u:any)=><li key={u.id} className="py-2 flex justify-between border-border"><span>{u.title}</span><span className="text-sm text-muted-foreground dark:text-slate-400">{u.due_date} · {u.status}</span></li>)}
            {(!Array.isArray(data.upcoming_deadlines) || data.upcoming_deadlines.length===0) && <li className="py-2 text-sm text-muted-foreground dark:text-slate-400">No upcoming tasks</li>}
          </ul>
        </div>
        <ActivityFeed />
      </div>
    </div>
  )
}

function ActivityFeed() {
  const { data } = useQuery({ queryKey: ["activity-feed"], queryFn: async () => (await api.get("/activity/?page_size=10")).data })
  const items = data?.results ?? data ?? []
  const arr = Array.isArray(items) ? items : (items.results ?? [])
  return (
    <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
      <h3 className="font-semibold mb-2">Recent Activity</h3>
      <ul className="divide-y divide-border">
        {(Array.isArray(arr) ? arr : []).slice(0,8).map((a:any,i:number)=>
          <li key={i} className="py-2 text-sm flex justify-between"><span className="font-medium">{a.event}</span><span className="text-xs text-muted-foreground">{a.entity} #{a.entity_id} · {new Date(a.created_at).toLocaleDateString()}</span></li>
        )}
        {arr.length===0 && <li className="py-2 text-sm text-muted-foreground">No activity yet</li>}
      </ul>
    </div>
  )
}
function Card({ title, value }: { title:string, value:any }) {
  return <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border"><p className="text-sm text-muted-foreground dark:text-slate-400">{title}</p><p className="text-2xl font-bold mt-1">{value}</p></div>
}
