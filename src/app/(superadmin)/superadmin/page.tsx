"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Users, GraduationCap, BookOpen, FileText, Calendar, Power, Clock, Key, CheckCircle, XCircle, Megaphone, MessageSquare, RefreshCw, Plus, Trash2, ExternalLink } from "lucide-react"

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expirationDate, setExpirationDate] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [annTitle, setAnnTitle] = useState("")
  const [annContent, setAnnContent] = useState("")
  const [annDisplay, setAnnDisplay] = useState("banner")
  const [annTarget, setAnnTarget] = useState("all")
  const [feedbackRes, setFeedbackRes] = useState("")
  const [renewDate, setRenewDate] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("sa_token")
    if (!token) { router.push("/superadmin/login"); return }
    fetch("/api/superadmin?action=dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); if (d.settings?.expirationDate) setExpirationDate(d.settings.expirationDate.split("T")[0]) })
  }, [router])

  const api = async (action: string, extra: any = {}) => {
    const token = localStorage.getItem("sa_token")
    const res = await fetch("/api/superadmin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, token, ...extra }) })
    const d = await res.json()
    if (d.success) { setData((prev: any) => ({ ...prev, ...d.data })); setMessage(d.message || "Done!") } else { setMessage(d.error || "Failed") }
    setTimeout(() => setMessage(""), 3000)
  }

  if (loading) return <div className="flex min-h-dvh items-center justify-center bg-zinc-950"><div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-red-600" /></div>

  const stats = data?.stats || {}
  const settings = data?.settings || {}
  const applications = data?.pendingApplications || []
  const announcements = data?.announcements || []
  const feedbackTickets = data?.feedbackTickets || []
  const allFeedback = data?.allFeedback || []

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-red-500" />
          <span className="font-semibold">Super Admin Panel</span>
        </div>
        <button onClick={() => { localStorage.removeItem("sa_token"); router.push("/superadmin/login") }} className="text-sm text-zinc-500 hover:text-red-400">Logout</button>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 p-6">
        {message && <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">{message}</div>}

        {/* Status */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">School Status</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
              <div className="flex items-center gap-3">
                <Power className={`h-5 w-5 ${settings.loginEnabled ? "text-green-400" : "text-red-400"}`} />
                <div><p className="text-sm font-medium">Login</p><p className="text-xs text-zinc-500">{settings.loginEnabled ? "Enabled" : "Disabled"}</p></div>
              </div>
              <button onClick={() => api("toggleLogin")} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${settings.loginEnabled ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" : "bg-green-600/20 text-green-400 hover:bg-green-600/30"}`}>
                {settings.loginEnabled ? "Disable" : "Enable"}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div><p className="text-sm font-medium">Expiration</p><p className="text-xs text-zinc-500">{settings.expirationDate ? new Date(settings.expirationDate).toLocaleDateString() : "No expiration"}</p></div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-emerald-400" />
                <div><p className="text-sm font-medium">Renew School</p><p className="text-xs text-zinc-500">Set new expiry date</p></div>
              </div>
            </div>
          </div>
          {/* Renew inline */}
          <div className="mt-4 flex gap-2">
            <input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} className="flex-1 rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2 text-sm outline-none focus:border-emerald-500 max-w-xs" />
            <button onClick={() => api("renewSchool", { newExpirationDate: renewDate })} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500">Renew & Enable Login</button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Users, label: "Students", value: stats.students || 0, color: "text-blue-400" },
            { icon: GraduationCap, label: "Staff", value: stats.staff || 0, color: "text-emerald-400" },
            { icon: BookOpen, label: "Classes", value: stats.classes || 0, color: "text-violet-400" },
            { icon: FileText, label: "Pending Apps", value: stats.pendingApplications || 0, color: "text-orange-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center gap-2"><s.icon className={`h-4 w-4 ${s.color}`} /><span className="text-xs text-zinc-500">{s.label}</span></div>
              <p className="mt-2 text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </section>

        {/* Controls */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Controls</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400">Set School Expiration Date</label>
              <div className="flex gap-2">
                <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="flex-1 rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2 text-sm outline-none focus:border-red-500" />
                <button onClick={() => api("setExpiration", { expirationDate })} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700">Set</button>
              </div>
              <button onClick={() => api("clearExpiration")} className="text-xs text-zinc-500 hover:text-red-400">Clear expiration</button>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400">Change School Admin Password</label>
              <div className="flex gap-2">
                <input type="text" placeholder="New admin password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1 rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2 text-sm outline-none focus:border-red-500" />
                <button onClick={() => api("changeAdminPassword", { newPassword })} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700">Update</button>
              </div>
            </div>
          </div>
        </section>

        {/* Announcements */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Megaphone className="h-5 w-5 text-orange-400" /> Announcements</h2>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <input placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2 text-sm outline-none focus:border-orange-500" />
            <input placeholder="Content" value={annContent} onChange={(e) => setAnnContent(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2 text-sm outline-none focus:border-orange-500" />
            <select value={annDisplay} onChange={(e) => setAnnDisplay(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2 text-sm outline-none focus:border-orange-500">
              <option value="banner">Banner</option><option value="ticker">Ticker</option><option value="overlay">Overlay</option>
            </select>
            <button onClick={() => { api("createAnnouncement", { title: annTitle, content: annContent, displayType: annDisplay, targetAudience: annTarget }); setAnnTitle(""); setAnnContent("") }} className="flex items-center justify-center gap-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium hover:bg-orange-500"><Plus className="h-4 w-4" /> Create</button>
          </div>
          {announcements.length === 0 ? <p className="text-sm text-zinc-500">No announcements</p> : (
            <div className="space-y-2">
              {announcements.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.title} <span className="text-xs text-zinc-500">({a.displayType})</span></p>
                    <p className="text-xs text-zinc-500">{a.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => api("toggleAnnouncement", { id: a.id })} className={`rounded px-2 py-1 text-xs ${a.active ? "bg-green-600/20 text-green-400" : "bg-zinc-600/20 text-zinc-400"}`}>{a.active ? "Active" : "Inactive"}</button>
                    <button onClick={() => api("deleteAnnouncement", { id: a.id })} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Feedback */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-blue-400" /> Feedback Tickets</h2>
          {feedbackTickets.length === 0 ? <p className="text-sm text-zinc-500">No pending tickets</p> : (
            <div className="space-y-3">
              {feedbackTickets.map((t: any) => (
                <div key={t.id} className="rounded-lg bg-zinc-800/50 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{t.subject}</p>
                      <p className="text-xs text-zinc-500">{t.from} — {new Date(t.createdAt).toLocaleString()} <span className="text-orange-400">({t.priority})</span></p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${t.status === "pending" ? "bg-amber-600/20 text-amber-400" : "bg-blue-600/20 text-blue-400"}`}>{t.status}</span>
                  </div>
                  <p className="mb-3 text-xs text-zinc-400">{t.message}</p>
                  <div className="flex gap-2">
                    <input placeholder="Resolution notes..." value={feedbackRes} onChange={(e) => setFeedbackRes(e.target.value)} className="flex-1 rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-1.5 text-xs outline-none focus:border-blue-500" />
                    <button onClick={() => { api("resolveFeedback", { id: t.id, resolution: feedbackRes }); setFeedbackRes("") }} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium hover:bg-blue-500">Resolve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Applications */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Pending Admissions</h2>
          {applications.length === 0 ? <p className="text-sm text-zinc-500">No pending applications</p> : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
                  <div><p className="text-sm font-medium">{app.firstName} {app.lastName}</p><p className="text-xs text-zinc-500">{app.email} — {new Date(app.appliedAt).toLocaleDateString()}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => api("acceptApplication", { id: app.id })} className="flex items-center gap-1 rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30"><CheckCircle className="h-3 w-3" /> Accept</button>
                    <button onClick={() => api("rejectApplication", { id: app.id })} className="flex items-center gap-1 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30"><XCircle className="h-3 w-3" /> Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* WhatsApp Config Info */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-500">
          <ExternalLink className="mx-auto mb-2 h-5 w-5 text-emerald-400" />
          <p>Expired schools see your WhatsApp contact for renewal.</p>
          <p className="text-xs text-zinc-600">Update the WhatsApp number in the ExpirationOverlay component.</p>
        </section>
      </main>
    </div>
  )
}
