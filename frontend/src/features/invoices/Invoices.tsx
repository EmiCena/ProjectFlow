import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function Invoices() {
  const qc = useQueryClient()
  const { data: clients } = useQuery({ queryKey:["clients-all"], queryFn: async () => (await api.get("/clients/")).data })
  const { data, isLoading } = useQuery({ queryKey:["invoices"], queryFn: async () => (await api.get("/invoices/")).data })
  const [form, setForm] = useState({ client:"", number:"INV-001", tax_rate:21, due_date:"", items:[{description:"Design work", quantity:1, rate:500, amount:500}] })

  const create = useMutation({
    mutationFn: async () => {
      const itemsTotal = form.items.reduce((s:any,i:any)=>s+Number(i.amount),0)
      const total = itemsTotal * (1 + Number(form.tax_rate)/100)
      const payload = { client: Number(form.client), number: form.number, tax_rate: form.tax_rate, subtotal: itemsTotal, total, due_date: form.due_date || null, items: form.items }
      return (await api.post("/invoices/", payload)).data
    },
    onSuccess: () => qc.invalidateQueries({queryKey:["invoices"]})
  })
  const updateStatus = useMutation({
    mutationFn: async ({id, status}:any) => (await api.patch(`/invoices/${id}/`, {status})).data,
    onSuccess: () => qc.invalidateQueries({queryKey:["invoices"]})
  })
  const list = data?.results ?? data ?? []
  const clientList = clients?.results ?? clients ?? []
  const handleExport = async () => {
    const res = await api.get("/invoices/export/", { responseType: "blob" })
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }))
    const a = document.createElement("a"); a.href = url
    a.download = res.headers["content-disposition"]?.match(/filename="?([^"]+)"?/)?.[1] || "invoices.csv"
    document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url)
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>Export CSV</Button>
      </div>

      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border space-y-3">
        <h3 className="font-semibold">New Invoice</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select value={form.client} onChange={e=>setForm({...form, client:e.target.value})} className="border rounded px-2 py-1 text-sm bg-background">
            <option value="">Select client</option>
            {clientList.map((c:any)=><option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
          <input value={form.number} onChange={e=>setForm({...form, number:e.target.value})} placeholder="Number" className="border rounded px-2 py-1 text-sm bg-background" />
          <input type="number" value={form.tax_rate} onChange={e=>setForm({...form, tax_rate:Number(e.target.value)})} placeholder="Tax %" className="border rounded px-2 py-1 text-sm bg-background" />
          <input type="date" value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})} className="border rounded px-2 py-1 text-sm bg-background" />
        </div>
        <div className="text-sm">
          {form.items.map((it,i)=>(
            <div key={i} className="flex gap-2 mb-1">
              <input value={it.description} onChange={e=>{ const n=[...form.items]; n[i].description=e.target.value; setForm({...form, items:n})}} placeholder="Description" className="flex-1 border rounded px-2 py-1 text-sm bg-background" />
              <input type="number" value={it.quantity} onChange={e=>{ const n=[...form.items]; n[i].quantity=Number(e.target.value); n[i].amount=n[i].quantity*n[i].rate; setForm({...form, items:n})}} className="w-20 border rounded px-1 text-sm bg-background" />
              <input type="number" value={it.rate} onChange={e=>{ const n=[...form.items]; n[i].rate=Number(e.target.value); n[i].amount=n[i].quantity*n[i].rate; setForm({...form, items:n})}} className="w-24 border rounded px-1 text-sm bg-background" />
              <span className="w-20 text-sm py-1">${it.amount}</span>
            </div>
          ))}
          <button onClick={()=>setForm({...form, items:[...form.items, {description:"", quantity:1, rate:100, amount:100}]})} className="text-xs border px-2 py-1 rounded bg-background">+ Item</button>
        </div>
        <Button onClick={()=>create.mutate()} disabled={!form.client || !form.number}>Create</Button>
      </div>

      <div className="bg-card dark:bg-slate-900 rounded-lg shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800"><tr><th className="p-3 text-left">Number</th><th className="p-3">Client</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr> : list.map((inv:any)=>
              <tr key={inv.id} className="border-t border-border">
                <td className="p-3 font-medium">{inv.number}</td>
                <td className="p-3">{inv.client}</td>
                <td className="p-3">${inv.total}</td>
                <td className="p-3"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">{inv.status}</span></td>
                <td className="p-3 flex gap-1">
                  <select value={inv.status} onChange={e=>updateStatus.mutate({id:inv.id, status:e.target.value})} className="border rounded px-1 py-1 text-xs bg-background">
                    <option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option>
                  </select>
                  <a href={`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/invoices/${inv.id}/pdf/`} target="_blank" className="border px-2 py-1 rounded text-xs bg-background">PDF</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
