import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function Documents() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ["documents"], queryFn: async () => (await api.get("/documents/")).data })
  const list = data?.results ?? data ?? []
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")

  const openDoc = async (doc:any) => {
    try {
      const res = await api.get(`/documents/${doc.id}/download/`, { responseType: "blob" })
      const ctRaw = res.headers["content-type"] as string | undefined
      const ct = ctRaw ? String(ctRaw) : "application/pdf"
      if (ct.includes("application/json")) {
        const text = await (res.data as Blob).text()
        try {
          const j = JSON.parse(text)
          if (j.url) { window.open(j.url, "_blank"); return }
        } catch {}
        // not JSON, fall through
      }
      const blob = res.data as Blob
      const url = window.URL.createObjectURL(new Blob([blob], { type: ct }))
      window.open(url, "_blank")
      setTimeout(()=>window.URL.revokeObjectURL(url), 30000)
    } catch (e) {
      console.error("openDoc failed", e)
    }
  }
  const upload = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      if (!file) throw new Error("No file")
      fd.append("file", file)
      fd.append("title", title || file.name)
      return (await api.post("/documents/", fd, { headers: { "Content-Type": "multipart/form-data" } })).data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); setFile(null); setTitle("") }
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Documents</h1>
      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border space-y-3">
        <h3 className="font-semibold">Upload to R2</h3>
        <div className="flex gap-2 flex-wrap">
          <input type="text" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="border rounded px-2 py-1 text-sm bg-background flex-1" />
          <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} className="text-sm" />
          <Button onClick={()=>upload.mutate()} disabled={!file || upload.isPending}>{upload.isPending ? "Uploading..." : "Upload"}</Button>
        </div>
        <p className="text-xs text-muted-foreground">Stored in Cloudflare R2 (S3-compatible) - {list.length} files</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((d:any)=>(
          <div key={d.id} className="bg-card dark:bg-slate-900 p-3 rounded-lg shadow border flex justify-between">
            <div><div className="font-medium text-sm">{d.title}</div><div className="text-xs text-muted-foreground">{d.username} · {(d.file_size/1024).toFixed(1)} KB</div></div>
            <button onClick={()=>openDoc(d)} className="text-indigo-600 dark:text-indigo-400 text-sm underline">Open</button>
          </div>
        ))}
        {list.length===0 && <div className="text-sm text-muted-foreground">No documents yet</div>}
      </div>
    </div>
  )
}
