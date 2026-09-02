import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function InvoiceDetail() {
  const { id } = useParams()
  const qc = useQueryClient()

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => (await api.get(`/invoices/${id}/`)).data,
  })

  const updateStatus = useMutation({
    mutationFn: async (status: string) => (await api.patch(`/invoices/${id}/`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoice", id] }),
  })

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
  if (isError || !invoice) return <div className="p-6 text-sm">Invoice not found <Link to="/invoices" className="text-indigo-600 underline ml-2">Back</Link></div>

  const items = invoice.items ?? []
  const subtotal = Number(invoice.subtotal || 0)
  const taxRate = Number(invoice.tax_rate || 0)
  const total = Number(invoice.total || 0)
  const taxAmount = total - subtotal

  const apiBase = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000/api"

  return (
    <div className="p-6 space-y-6">
      <Link to="/invoices" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">← Back to invoices</Link>

      <div className="bg-card dark:bg-slate-900 p-6 rounded-lg shadow border border-border">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Invoice {invoice.number}</h1>
            <p className="text-sm text-muted-foreground dark:text-slate-400">Created {new Date(invoice.created_at).toLocaleDateString()} {invoice.due_date && `· Due ${invoice.due_date}`}</p>
            <p className="text-sm mt-1">Client: <span className="font-medium">{invoice.client}</span> {invoice.project && <span>· Project #{invoice.project}</span>}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className="px-3 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 capitalize">{invoice.status}</span>
            <div className="flex gap-2">
              <select value={invoice.status} onChange={e => updateStatus.mutate(e.target.value)} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800">
                <option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option>
              </select>
              <a href={`${apiBase}/invoices/${invoice.id}/pdf/`} target="_blank" rel="noreferrer" className="border border-border px-3 py-1.5 rounded text-sm bg-background dark:bg-slate-800 hover:bg-muted">PDF</a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded border border-border text-sm"><p className="text-xs text-muted-foreground">Subtotal</p><p className="text-lg font-semibold">${subtotal.toFixed(2)}</p></div>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded border border-border text-sm"><p className="text-xs text-muted-foreground">Tax ({taxRate}%)</p><p className="text-lg font-semibold">${taxAmount.toFixed(2)}</p></div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded border border-border text-sm"><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">${total.toFixed(2)}</p></div>
        </div>

        {invoice.notes && <p className="mt-4 text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded border border-border">{invoice.notes}</p>}
      </div>

      <div className="bg-card dark:bg-slate-900 rounded-lg shadow border border-border overflow-hidden">
        <div className="p-4 border-b border-border"><h3 className="font-semibold">Items ({items.length})</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-left"><tr><th className="p-3">Description</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Rate</th><th className="p-3 text-right">Amount</th></tr></thead>
          <tbody>
            {items.map((it: any) => (
              <tr key={it.id} className="border-t border-border">
                <td className="p-3">{it.description}</td>
                <td className="p-3 text-right">{Number(it.quantity)}</td>
                <td className="p-3 text-right">${Number(it.rate).toFixed(2)}</td>
                <td className="p-3 text-right font-medium">${Number(it.amount).toFixed(2)}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No items</td></tr>}
          </tbody>
          {items.length > 0 && (
            <tfoot className="bg-slate-50 dark:bg-slate-800 font-medium border-t border-border">
              <tr><td colSpan={3} className="p-3 text-right">Subtotal</td><td className="p-3 text-right">${subtotal.toFixed(2)}</td></tr>
              <tr><td colSpan={3} className="p-3 text-right">Tax {taxRate}%</td><td className="p-3 text-right">${taxAmount.toFixed(2)}</td></tr>
              <tr><td colSpan={3} className="p-3 text-right">Total</td><td className="p-3 text-right">${total.toFixed(2)}</td></tr>
            </tfoot>
          )}
        </table>
      </div>

      {invoice.payments && invoice.payments.length > 0 && (
        <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-2">Payments</h3>
          <ul className="divide-y divide-border">
            {invoice.payments.map((p: any) => (
              <li key={p.id} className="py-2 flex justify-between text-sm"><span>${Number(p.amount).toFixed(2)} · {p.method}</span><span className="text-muted-foreground text-xs">{new Date(p.paid_at).toLocaleString()}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
