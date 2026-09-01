import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function Clients() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [form, setForm] = useState({ company_name:"", contact_person:"", email:"", phone:"", status:"lead" })
  const [editing, setEditing] = useState<number|null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["clients", search, status],
    queryFn: async () => {
      const params:any = {}
      if (search) params.search = search
      if (status) params.status = status
      const { data } = await api.get("/clients/", { params })
      return data
    }
  })

  const create = useMutation({
    mutationFn: async (payload:any) => (await api.post("/clients/", payload)).data,
    onSuccess: () => { qc.invalidateQueries({queryKey:["clients"]}); setForm({company_name:"",contact_person:"",email:"",phone:"",status:"lead"}) }
  })
  const update = useMutation({
    mutationFn: async ({id, data}:any) => (await api.patch(`/clients/${id}/`, data)).data,
    onSuccess: () => { qc.invalidateQueries({queryKey:["clients"]}); setEditing(null) }
  })
  const remove = useMutation({
    mutationFn: async (id:number) => await api.delete(`/clients/${id}/`),
    onSuccess: () => qc.invalidateQueries({queryKey:["clients"]})
  })

  const list = data?.results ?? data ?? []
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('nav.clients')}</h1>
        <div className="flex gap-2">
          <input placeholder={t('common.search')} value={search} onChange={e=>setSearch(e.target.value)} className="border border-border rounded px-3 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
          <select value={status} onChange={e=>setStatus(e.target.value)} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground">
            <option value="">All</option>
            <option value="lead">Lead</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
        <h3 className="font-semibold mb-2">{editing ? "Edit Client" : "New Client"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input placeholder="Company *" value={form.company_name} onChange={e=>setForm({...form, company_name:e.target.value})} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
          <input placeholder="Contact" value={form.contact_person} onChange={e=>setForm({...form, contact_person:e.target.value})} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
          <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
          <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground" />
          <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="border border-border rounded px-2 py-1 text-sm bg-background dark:bg-slate-800 text-foreground">
            <option value="lead">Lead</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="completed">Completed</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={()=> editing ? update.mutate({id:editing, data:form}) : create.mutate(form)} disabled={!form.company_name}>{editing ? "Update" : t('common.create')}</Button>
          {editing && <Button variant="outline" onClick={()=>{setEditing(null); setForm({company_name:"",contact_person:"",email:"",phone:"",status:"lead"})}}>{t('common.cancel')}</Button>}
        </div>
      </div>

      <div className="bg-card dark:bg-slate-900 rounded-lg shadow border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-left">
            <tr><th className="p-3">Company</th><th className="p-3">Contact</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="p-6 text-center text-muted-foreground dark:text-slate-400">{t('common.loading')}</td></tr> : list.map((c:any)=>
              <tr key={c.id} className="border-t border-border hover:bg-muted dark:hover:bg-slate-800">
                <td className="p-3 font-medium">{c.company_name}<div className="text-xs text-muted-foreground dark:text-slate-400">{c.email}</div></td>
                <td className="p-3">{c.contact_person}<div className="text-xs text-muted-foreground dark:text-slate-400">{c.phone}</div></td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${c.status==='active'?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300':'bg-slate-100 dark:bg-slate-800'}`}>{c.status}</span></td>
                <td className="p-3 flex gap-1">
                  <button onClick={()=>{setEditing(c.id); setForm({company_name:c.company_name, contact_person:c.contact_person, email:c.email, phone:c.phone, status:c.status})}} className="text-indigo-600 dark:text-indigo-400 text-xs border border-border px-2 py-1 rounded bg-background dark:bg-slate-800">Edit</button>
                  <button onClick={()=>remove.mutate(c.id)} className="text-red-600 dark:text-red-400 text-xs border border-border px-2 py-1 rounded bg-background dark:bg-slate-800">Delete</button>
                </td>
              </tr>
            )}
            {!isLoading && list.length===0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground dark:text-slate-400">No clients</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
