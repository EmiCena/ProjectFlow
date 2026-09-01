import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
export default function Register() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [form, setForm] = useState({ username:"", email:"", password:"" })
  const [err, setErr] = useState("")
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post("/auth/register/", form)
      nav("/login")
    } catch(e:any){ setErr(JSON.stringify(e.response?.data)) }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-slate-900">
      <form onSubmit={submit} className="bg-card dark:bg-slate-900 p-8 rounded-lg shadow border border-border w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">ProjectFlow</h1>
        {err && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-2 rounded text-sm border border-red-200 dark:border-red-900/50">{err}</div>}
        <input className="w-full border border-border rounded px-3 py-2 bg-background dark:bg-slate-800 text-foreground" placeholder={t('auth.username')} value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
        <input className="w-full border border-border rounded px-3 py-2 bg-background dark:bg-slate-800 text-foreground" placeholder={t('auth.email')} value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <input type="password" className="w-full border border-border rounded px-3 py-2 bg-background dark:bg-slate-800 text-foreground" placeholder={t('auth.password')} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <Button type="submit" className="w-full">{t('auth.register')}</Button>
        <p className="text-sm text-center text-muted-foreground dark:text-slate-400">{t('auth.hasAccount')} <Link to="/login" className="text-indigo-600 dark:text-indigo-400">Login</Link></p>
      </form>
    </div>
  )
}
