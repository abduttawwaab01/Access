"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { CheckCircle, XCircle, Clock, Search } from "lucide-react"

const tabs = ["All", "Pending", "Accepted", "Rejected"]

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("Pending")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch("/api/admissions").then(r => r.json()).then(d => { setApplications(d); setLoading(false) }) }, [])

  const handleAction = async (id: string, action: "acceptApplication" | "rejectApplication") => {
    await fetch("/api/superadmin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, id, token: "superadmin-authenticated" }) })
    const res = await fetch("/api/admissions")
    setApplications(await res.json())
  }

  const filtered = applications.filter((a) => {
    const matchTab = activeTab === "All" || a.status === activeTab.toLowerCase()
    const matchSearch = !search || `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Admissions Management" description="Review and process admission applications" />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search applicants..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary" />
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">No applications found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="glass-card flex items-center justify-between rounded-xl p-5">
              <div className="space-y-1">
                <p className="font-semibold">{app.firstName} {app.lastName}</p>
                <p className="text-sm text-muted-foreground">{app.email}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Class: {app.classApplyingFor}{app.department ? ` (${app.department})` : ""}</span>
                    <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                    {app.entranceExamScore != null && <span>Exam: {app.entranceExamScore}/100</span>}
                  </div>
              </div>
              <div className="flex items-center gap-2">
                {app.status === "pending" && (
                  <>
                    <button onClick={() => handleAction(app.id, "acceptApplication")} className="flex items-center gap-1 rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-600/30"><CheckCircle className="h-3 w-3" /> Accept</button>
                    <button onClick={() => handleAction(app.id, "rejectApplication")} className="flex items-center gap-1 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-600/30"><XCircle className="h-3 w-3" /> Reject</button>
                  </>
                )}
                {app.status === "accepted" && <span className="flex items-center gap-1 rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-600"><CheckCircle className="h-3 w-3" /> Accepted</span>}
                {app.status === "rejected" && <span className="flex items-center gap-1 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-600"><XCircle className="h-3 w-3" /> Rejected</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
