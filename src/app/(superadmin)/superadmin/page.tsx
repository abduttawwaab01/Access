"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Users, GraduationCap, BookOpen, FileText, Calendar, Power, Clock, Key, CheckCircle, XCircle } from "lucide-react"

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expirationDate, setExpirationDate] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")

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

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-red-500" />
          <span className="font-semibold">Super Admin Panel</span>
        </div>
        <button onClick={() => { localStorage.removeItem("sa_token"); router.push("/superadmin/login") }} className="text-sm text-zinc-500 hover:text-red-400">Logout</button>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 p-6">
        {message && <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">{message}</div>}

        {/* Status */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">School Status</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
              <div className="flex items-center gap-3">
                <Power className={`h-5 w-5 ${settings.loginEnabled ? "text-green-400" : "text-red-400"}`} />
                <div>
                  <p className="text-sm font-medium">Login</p>
                  <p className="text-xs text-zinc-500">{settings.loginEnabled ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
              <button onClick={() => api("toggleLogin")} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${settings.loginEnabled ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" : "bg-green-600/20 text-green-400 hover:bg-green-600/30"}`}>
                {settings.loginEnabled ? "Disable" : "Enable"}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium">Expiration</p>
                  <p className="text-xs text-zinc-500">{settings.expirationDate ? new Date(settings.expirationDate).toLocaleDateString() : "No expiration"}</p>
                </div>
              </div>
            </div>
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
              <div className="flex items-center gap-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-zinc-500">{s.label}</span>
              </div>
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

        {/* Pending Applications */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Pending Admissions</h2>
          {applications.length === 0 ? (
            <p className="text-sm text-zinc-500">No pending applications</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
                  <div>
                    <p className="text-sm font-medium">{app.firstName} {app.lastName}</p>
                    <p className="text-xs text-zinc-500">{app.email} — {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => api("acceptApplication", { id: app.id })} className="flex items-center gap-1 rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30"><CheckCircle className="h-3 w-3" /> Accept</button>
                    <button onClick={() => api("rejectApplication", { id: app.id })} className="flex items-center gap-1 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30"><XCircle className="h-3 w-3" /> Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
