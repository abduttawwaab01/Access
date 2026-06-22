"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { Send, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react"

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-500 bg-amber-500/10", label: "Pending" },
  in_progress: { icon: AlertCircle, color: "text-blue-500 bg-blue-500/10", label: "In Progress" },
  resolved: { icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10", label: "Resolved" },
}

export default function AdminFeedbackPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("medium")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => { fetch("/api/feedback").then(r => r.json()).then(setTickets) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, message, priority, from: "admin@skoolar.org" }) })
    setLoading(false)
    setSent(true)
    setSubject("")
    setMessage("")
    const res = await fetch("/api/feedback")
    setTickets(await res.json())
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      <PageHeader title="Feedback & Support" description="Report issues or request features to the Portal Administrator" />

      <div className="glass-card max-w-xl rounded-xl p-6">
        <h3 className="mb-4 font-semibold">Submit a Ticket</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Brief description of the issue" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} placeholder="Describe the issue in detail..." className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={loading} className="animated-gradient flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50">
            <Send className="h-4 w-4" /> {loading ? "Sending..." : sent ? "Sent!" : "Submit Ticket"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="mb-4 font-semibold">My Tickets</h3>
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tickets submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const cfg = statusConfig[t.status] || statusConfig.pending
              const Icon = cfg.icon
              return (
                <div key={t.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{t.subject}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{t.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground/60">{new Date(t.createdAt).toLocaleString()}</p>
                      {t.resolution && <p className="mt-2 text-sm text-emerald-600">Resolution: {t.resolution}</p>}
                    </div>
                    <span className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${cfg.color}`}>
                      <Icon className="h-3 w-3" /> {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
