import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function Team() {
  const qc = useQueryClient()
  const [invite, setInvite] = useState({ user: "", role: "member" })

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/auth/me/")).data,
  })

  const workspaceId = me?.active_workspace

  const { data: members, isLoading, isError } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => (await api.get(`/workspaces/${workspaceId}/members/`)).data,
    enabled: !!workspaceId,
  })

  const { data: workspaces } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => (await api.get("/workspaces/")).data,
  })

  const wsList = workspaces?.results ?? workspaces ?? []
  const activeWs = wsList.find((w: any) => w.id === workspaceId) ?? (workspaces && !Array.isArray(workspaces) ? workspaces : null)

  const inviteMember = useMutation({
    mutationFn: async () => {
      return (await api.post(`/workspaces/${workspaceId}/members/`, { user: Number(invite.user), role: invite.role, workspace: workspaceId })).data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", workspaceId] })
      setInvite({ user: "", role: "member" })
    },
  })

  const list = Array.isArray(members) ? members : members?.results ?? []

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            Workspace: {activeWs?.name ?? workspaceId ?? "—"} {activeWs?.slug && <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded ml-2">{activeWs.slug}</span>}
          </p>
        </div>
        <span className="text-sm text-muted-foreground">{list.length} members</span>
      </div>

      <div className="bg-card dark:bg-slate-900 p-4 rounded-lg shadow border border-border">
        <h3 className="font-semibold mb-3">Invite member</h3>
        <p className="text-xs text-muted-foreground mb-2">Invite by user ID (requires existing user). Role: owner / member / client.</p>
        <div className="flex gap-2">
          <input value={invite.user} onChange={e => setInvite({ ...invite, user: e.target.value })} placeholder="User ID" type="number" className="w-32 border border-border rounded px-3 py-2 text-sm bg-background dark:bg-slate-800" />
          <select value={invite.role} onChange={e => setInvite({ ...invite, role: e.target.value })} className="border border-border rounded px-3 py-2 text-sm bg-background dark:bg-slate-800">
            <option value="member">Member</option><option value="owner">Owner</option><option value="client">Client</option>
          </select>
          <Button onClick={() => inviteMember.mutate()} disabled={!invite.user || !workspaceId} loading={inviteMember.isPending}>Invite</Button>
        </div>
        {inviteMember.isError && <p className="text-xs text-red-600 mt-2">Failed to invite — check user ID exists.</p>}
        {inviteMember.isSuccess && <p className="text-xs text-green-600 mt-2">Member invited.</p>}
      </div>

      <div className="bg-card dark:bg-slate-900 rounded-lg shadow border border-border overflow-hidden">
        <div className="p-4 border-b border-border"><h3 className="font-semibold">Workspace members</h3></div>
        {isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
        ) : isError ? (
          <div className="p-6 text-center text-sm text-red-600">Failed to load members</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-left"><tr><th className="p-3">User</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th></tr></thead>
            <tbody>
              {list.map((m: any) => (
                <tr key={m.id} className="border-t border-border hover:bg-muted dark:hover:bg-slate-800">
                  <td className="p-3"><span className="font-medium">{m.username ?? `User #${m.user}`}</span><span className="text-xs text-muted-foreground ml-2">#{m.user}</span></td>
                  <td className="p-3 text-muted-foreground">{m.email ?? "-"}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs capitalize ${m.role === "owner" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : m.role === "client" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>{m.role}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No members</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
