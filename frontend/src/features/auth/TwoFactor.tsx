import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function TwoFactor() {
  const [qr, setQr] = useState("")
  const [token, setToken] = useState("")
  const [msg, setMsg] = useState("")
  const setup = async () => {
    const { data } = await api.post("/auth/2fa/setup/")
    setQr(data.qr)
  }
  const verify = async () => {
    try {
      await api.post("/auth/2fa/verify/", { token })
      setMsg("Verified!")
    } catch(e:any){ setMsg(e.response?.data?.detail || "Invalid") }
  }
  return (
    <div className="p-6 space-y-4 max-w-md">
      <h1 className="text-2xl font-bold">Two-Factor Auth</h1>
      <Button onClick={setup}>Generate QR</Button>
      {qr && <img src={qr} alt="QR" className="border p-2 bg-white rounded" />}
      <div className="flex gap-2">
        <input value={token} onChange={e=>setToken(e.target.value)} placeholder="123456" className="border rounded px-2 py-1 flex-1 bg-background" />
        <Button onClick={verify}>Verify</Button>
      </div>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  )
}
