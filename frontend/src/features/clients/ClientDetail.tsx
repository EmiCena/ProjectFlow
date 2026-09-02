import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export default function ClientDetail() {
  const { id } = useParams()

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => (await api.get(`/clients/${id}/`)).data,
  })

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await api.get("/projects/")).data,
    enabled: !!client,
  })

  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await api.get("/invoices/")).data,
    enabled: !!client,
  })

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
  if (isError || !client) return <div className="p-6 text-sm">Client not found <Link to="/clients" className="text-indigo-600 underline ml-2">Back</Link></div>

  const allProjects = projectsData?.results ?? projectsData ?? []
  const clientProjects = allProjects.filter((p: any) => String(p.client) === String(id) || p.client === client.id)
  const activeProjects = clientProjects.filter((p: any) => p.status === "active" || p.status === "planning")

  const allInvoices = invoicesData?.results ?? invoicesData ?? []
  const clientInvoices = allInvoices.filter((inv: any) => String(inv.client) === String(id) || inv.client === client.id)
  const revenue = clientInvoices
    .filter((inv: any) => inv.status === "paid")
    .reduce((s: number, inv: any) => s + Number(inv.total || 0), 0)
  const outstanding = clientInvoices
    .filter((inv: any) => inv.status !== "paid" && inv.status !== "cancelled")
    .reduce((s: number, inv: any) => s + Number(inv.total || 0), 0)

  return (
    <div className="p-6 space-y-6">
      <Link to="/clients" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">← Back to clients</Link>

      <div className="bg-card dark:bg-slate-900 p-6 rounded-lg shadow border border-border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{client.company_name}</h1>
            <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">{client.contact_person} {client.email && `· ${client.email}`} {client.phone && `· ${client.phone}`}</p>
            {client.website && <a href={client.website} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">{client.website}</a>}
            {client.address && <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2 whitespace-pre-wrap">{client.address}</p>}
            {client.notes && <p className="text-sm mt-2 bg-slate-50 dark:bg-slate-800 p-3 rounded border border-border">{client.notes}</p>}
          </div>
          <span className={`px-3 py-1 rounded text-xs font-medium capitalize ${client.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : client.status === "completed" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>{client.status}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded border border-border"><p className="text-xs text-muted-foreground">Active Projects</p><p className="text-2xl font-bold">{activeProjects.length}</p></div>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded border border-border"><p className="text-xs text-muted-foreground">Total Revenue (paid)</p><p className="text-2xl font-bold">${revenue.toFixed(2)}</p></div>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded border border-border"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-2xl font-bold">${outstanding.toFixed(2)}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-3">Active Projects ({activeProjects.length})</h3>
          <ul className="divide-y divide-border">
            {activeProjects.map((p: any) => (
              <li key={p.id} className="py-3 flex justify-between items-center">
                <div>
                  <Link to={`/projects/${p.id}`} className="text-sm font-medium hover:underline text-indigo-600 dark:text-indigo-400">{p.title}</Link>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">{p.status} · ${p.budget}</p>
                </div>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{p.progress ?? 0}%</span>
              </li>
            ))}
            {activeProjects.length === 0 && <li className="text-sm text-muted-foreground py-2">No active projects</li>}
          </ul>
          {clientProjects.length > activeProjects.length && (
            <details className="mt-3">
              <summary className="text-xs cursor-pointer text-muted-foreground">Show all {clientProjects.length} projects</summary>
              <ul className="mt-2 divide-y divide-border">
                {clientProjects.filter((p:any)=>!activeProjects.includes(p)).map((p:any)=>(
                  <li key={p.id} className="py-2 flex justify-between text-sm"><Link to={`/projects/${p.id}`} className="hover:underline text-indigo-600 dark:text-indigo-400">{p.title}</Link><span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{p.status}</span></li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-3">Invoices ({clientInvoices.length})</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800"><tr><th className="p-2 text-left">Number</th><th className="p-2">Total</th><th className="p-2">Status</th><th className="p-2">Due</th></tr></thead>
              <tbody>
                {clientInvoices.map((inv: any) => (
                  <tr key={inv.id} className="border-t border-border hover:bg-muted dark:hover:bg-slate-800">
                    <td className="p-2"><Link to={`/invoices/${inv.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{inv.number}</Link></td>
                    <td className="p-2 text-center">${Number(inv.total).toFixed(2)}</td>
                    <td className="p-2 text-center"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{inv.status}</span></td>
                    <td className="p-2 text-center text-xs text-muted-foreground">{inv.due_date || "-"}</td>
                  </tr>
                ))}
                {clientInvoices.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No invoices</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
