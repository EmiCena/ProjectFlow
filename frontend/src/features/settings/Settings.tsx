import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function Settings() {
  const qc = useQueryClient()
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "" })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [wsForm, setWsForm] = useState({ name: "", slug: "" })

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/auth/me/")).data,
  })

  const workspaceId = me?.active_workspace

  const { data: workspacesData } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => (await api.get("/workspaces/")).data,
  })

  const wsList = workspacesData?.results ?? workspacesData ?? []
  const activeWs = Array.isArray(wsList) ? wsList.find((w: any) => w.id === workspaceId) : workspacesData

  useEffect(() => {
    if (me) setProfile({ first_name: me.first_name ?? "", last_name: me.last_name ?? "", email: me.email ?? "" })
  }, [me])

  useEffect(() => {
    if (activeWs) setWsForm({ name: activeWs.name ?? "", slug: activeWs.slug ?? "" })
  }, [activeWs])

  const updateProfile = useMutation({
    mutationFn: async () => {
      const form = new FormData()
      form.append("first_name", profile.first_name)
      form.append("last_name", profile.last_name)
      if (avatarFile) form.append("avatar", avatarFile)
      // PATCH /auth/me/ expects multipart for avatar
      const { data } = await api.patch("/auth/me/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] })
      setAvatarFile(null)
    },
  })

  const updateWorkspace = useMutation({
    mutationFn: async () => (await api.patch(`/workspaces/${workspaceId}/`, wsForm)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaces"] }),
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setAvatarFile(f)
    if (f) setAvatarPreview(URL.createObjectURL(f))
    else setAvatarPreview(null)
  }

  const avatarSrc = avatarPreview || me?.avatar || null
  const apiBase = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000"
  const resolvedAvatar = avatarSrc
    ? avatarSrc.startsWith("http") || avatarSrc.startsWith("blob:")
      ? avatarSrc
      : `${apiBase}${avatarSrc.startsWith("/") ? "" : "/"}${avatarSrc}`
    : null

  if (meLoading) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-slate-900 p-6 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-4">Profile</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border border-border overflow-hidden flex items-center justify-center">
              {resolvedAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolvedAvatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-muted-foreground">{(me?.username?.[0] ?? "?").toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{me?.username}</p>
              <p className="text-xs text-muted-foreground">{me?.email}</p>
              <label className="mt-2 inline-block text-xs border border-border px-3 py-1.5 rounded bg-background dark:bg-slate-800 cursor-pointer hover:bg-muted">
                {avatarFile ? `Selected: ${avatarFile.name}` : "Upload avatar"}
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">First name</label>
              <input value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:bg-slate-800 mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Last name</label>
              <input value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })} className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:bg-slate-800 mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email (read-only)</label>
              <input value={profile.email} disabled className="w-full border border-border rounded px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-muted-foreground mt-1" />
            </div>
            <Button onClick={() => updateProfile.mutate()} loading={updateProfile.isPending} className="w-full">Save profile</Button>
            {updateProfile.isSuccess && <p className="text-xs text-green-600">Profile updated</p>}
            {updateProfile.isError && <p className="text-xs text-red-600">Failed to update profile</p>}
          </div>
        </div>

        <div className="bg-card dark:bg-slate-900 p-6 rounded-lg shadow border border-border">
          <h3 className="font-semibold mb-4">Workspace settings</h3>
          {!workspaceId ? (
            <p className="text-sm text-muted-foreground">No active workspace</p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Workspace name</label>
                <input value={wsForm.name} onChange={e => setWsForm({ ...wsForm, name: e.target.value })} placeholder="My Workspace" className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:bg-slate-800 mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Slug</label>
                <input value={wsForm.slug} onChange={e => setWsForm({ ...wsForm, slug: e.target.value })} placeholder="my-workspace" className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:bg-slate-800 mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Unique identifier for URLs</p>
              </div>
              <div className="text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded border border-border">
                <p>Owner ID: {activeWs?.owner ?? "—"}</p>
                <p>Created: {activeWs?.created_at ? new Date(activeWs.created_at).toLocaleDateString() : "—"}</p>
                <p>ID: {workspaceId}</p>
              </div>
              <Button onClick={() => updateWorkspace.mutate()} loading={updateWorkspace.isPending} disabled={!wsForm.name}>Save workspace</Button>
              {updateWorkspace.isSuccess && <p className="text-xs text-green-600">Workspace updated</p>}
              {updateWorkspace.isError && <p className="text-xs text-red-600">Failed to update workspace</p>}
            </div>
          )}

          {wsList.length > 1 && (
            <div className="mt-6 border-t border-border pt-4">
              <h4 className="text-sm font-semibold mb-2">Switch workspace</h4>
              <div className="space-y-1">
                {wsList.map((w: any) => (
                  <div key={w.id} className={`p-2 rounded flex justify-between items-center border ${w.id === workspaceId ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200" : "bg-slate-50 dark:bg-slate-800 border-border"}`}>
                    <span className="text-sm font-medium">{w.name}</span>
                    {w.id !== workspaceId && (
                      <Button size="sm" variant="outline" onClick={async () => {
                        await api.post("/workspaces/switch/", { workspace_id: w.id })
                        qc.invalidateQueries({ queryKey: ["me"] })
                        location.reload()
                      }}>Switch</Button>
                    )}
                    {w.id === workspaceId && <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Active</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
