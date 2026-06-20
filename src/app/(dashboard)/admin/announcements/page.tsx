"use client"

import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Megaphone, Plus, Bell, AlertTriangle, Info, Trash2, Filter, Send, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

type Audience = "all" | "teachers" | "parents" | "students"
type Priority = "high" | "normal" | "low"

const audienceLabels: Record<Audience, string> = { all: "Everyone", teachers: "Teachers Only", parents: "Parents Only", students: "Students Only" }
const priorityConfig: Record<Priority, { icon: any; color: string; label: string }> = {
  high: { icon: AlertTriangle, color: "text-danger bg-danger/10 border-danger/20", label: "High" },
  normal: { icon: Bell, color: "text-primary bg-primary/10 border-primary/20", label: "Normal" },
  low: { icon: Info, color: "text-muted-foreground bg-muted border-border/50", label: "Low" },
}

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterAudience, setFilterAudience] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  const [form, setForm] = useState({ title: "", content: "", audience: "all" as Audience, priority: "normal" as Priority })

  const load = () => {
    setLoading(true)
    fetch("/api/announcements").then((r) => r.json()).then((data) => {
      setItems(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("Title and content are required"); return }
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, author: "Administrator", createdAt: new Date().toISOString() }),
    })
    if (res.ok) {
      toast.success("Announcement created")
      setShowForm(false)
      setForm({ title: "", content: "", audience: "all", priority: "normal" })
      load()
    } else { toast.error("Failed to create") }
  }

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const remove = (id: string) => setConfirmDelete(id)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/announcements/${confirmDelete}`, { method: "DELETE" })
    if (res.ok) { toast.success("Deleted"); load() }
    else { toast.error("Failed to delete") }
    setConfirmDelete(null)
  }

  const filtered = items.filter((a) => {
    if (filterAudience !== "all" && a.audience !== filterAudience) return false
    if (filterPriority !== "all" && a.priority !== filterPriority) return false
    return true
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Announcement" description="Permanently delete this announcement? This cannot be undone." />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Announcements</h2>
          <p className="text-sm text-muted-foreground">Send announcements to staff, parents, or students</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4 mr-1" /> New Announcement
        </Button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-0 glass-card border-t-2 border-t-primary/30">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Create Announcement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium mb-1 block">Title</label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Target Audience</label>
                    <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v as Audience })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="teachers">Teachers Only</SelectItem>
                        <SelectItem value="parents">Parents Only</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium mb-1 block">Message</label>
                    <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your announcement..." rows={4} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Priority</label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High - Urgent</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button onClick={create} className="animated-gradient border-0 text-white"><Send className="h-4 w-4 mr-1" /> Send Announcement</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterAudience} onValueChange={(v) => { if (v) setFilterAudience(v) }}>
          <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="All Audiences" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Audiences</SelectItem>
            <SelectItem value="all">Everyone</SelectItem>
            <SelectItem value="teachers">Teachers</SelectItem>
            <SelectItem value="parents">Parents</SelectItem>
            <SelectItem value="students">Students</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(v) => { if (v) setFilterPriority(v) }}>
          <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="All Priorities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} announcement{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card border-0"><CardContent className="p-8 text-center text-muted-foreground">No announcements match your filters</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const cfg = priorityConfig[item.priority as Priority] || priorityConfig.normal
            const Icon = cfg.icon
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card border-0 group">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", cfg.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>{item.author || "Administrator"}</span>
                              <span>·</span>
                              <Badge variant="outline" className="text-[10px]">{audienceLabels[item.audience as Audience] || item.audience}</Badge>
                              <span>·</span>
                              <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge variant="outline" className={cn("text-[10px]", item.priority === "high" ? "border-danger/30 text-danger" : "")}>
                              {item.priority}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove(item.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-danger" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{item.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
