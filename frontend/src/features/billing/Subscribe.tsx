import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function Subscribe() {
  const [loading, setLoading] = useState(false)
  const subscribe = async () => {
    setLoading(true)
    try {
      const { data } = await api.post("/invoices/stripe/checkout/", {
        success_url: window.location.origin + "/dashboard",
        cancel_url: window.location.origin + "/invoices"
      })
      if (data.url) window.location.href = data.url
    } catch(e:any){ alert(e.response?.data?.detail || e.message) }
    setLoading(false)
  }
  return (
    <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border">
      <h3 className="font-semibold">ProjectFlow Pro - $19.99/mo</h3>
      <p className="text-sm text-muted-foreground">Unlimited projects, clients, AI planning</p>
      <Button onClick={subscribe} disabled={loading} className="mt-2">{loading ? "..." : "Subscribe with Stripe"}</Button>
    </div>
  )
}
