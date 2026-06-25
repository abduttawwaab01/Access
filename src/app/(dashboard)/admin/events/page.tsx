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
import { CalendarCheck, Plus, Trash2, Filter, CalendarDays, Clock, GraduationCap, Users, School, Palette } from "lucide-react"

const eventTypes = [
  { value: "exam", label: "Exam", icon: GraduationCap, color: "text-red-600 bg-red-500/10" },
  { value: "holiday", label: "Holiday", icon: CalendarDays, color: "text-emerald-600 bg-emerald-500/10" },
  { value: "meeting", label: "Meeting", icon: Users, color: "text-blue-600 bg-blue-500/10" },
  { value: "sports", label: "Sports", icon: Clock, color: "text-amber-600 bg-amber-500/10" },
  { value: "cultural", label: "Cultural", icon: Palette, color: "text-violet-600 bg-violet-500/10" },
  { value: "other", label: "Other", icon: School, color: "text-muted-foreground bg-muted" },
]

const typeConfig = Object.fromEntries(eventTypes.map((t) => [t.value, t]))

export default function AdminEventsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState("all")

  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", endDate: "", endTime: "", type: "exam", audience: "all" })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ title: "", description: "", date: "", time: "", endDate: "", endTime: "", type: "exam", audience: "all" })
    setEditingId(null)
    setShowForm(false)
  }

  const openEdit = (item: any) => {
    setForm({
      title: item.title || "",
      description: item.description || "",
      date: item.date || "",
      time: item.time || "",
      endDate: item.endDate || "",
      endTime: item.endTime || "",
      type: item.type || "exam",
      audience: item.audience || "all",
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim() || !form.date) { toast.error("Title and date are required"); return }
    const url = editingId ? `/api/events/${editingId}` : "/api/events"
    const method = editingId ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, description: form.description, date: form.date, time: form.time, type: form.type, audience: form.audience }),
    })
    if (res.ok) {
      toast.success(editingId ? "Event updated" : "Event created")
      resetForm()
      load()
    } else { toast.error("Failed to save") }
  }

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/events/${confirmDelete}`, { method: "DELETE" })
    if (res.ok) { toast.success("Event deleted"); load() }
    else { toast.error("Failed to delete") }
    setConfirmDelete(null)
  }

  const filtered = filterType === "all" ? items : items.filter((e) => e.type === filterType)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Event" description="Permanently delete this event? This cannot be undone." />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">School Events</h2>
          <p className="text-sm text-muted-foreground">Manage exams, holidays, meetings and other school events</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true) }} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4 mr-1" /> New Event
        </Button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-0 glass-card border-t-2 border-t-primary/30">
              <CardContent className="p-4 md:p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-primary" /> {editingId ? "Edit Event" : "Create Event"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium mb-1 block">Event Title</label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. PTA Meeting" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Date *</label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Time</label>
                    <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">End Date</label>
                    <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">End Time</label>
                    <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Event Type</label>
                    <Select value={form.type} onValueChange={(v) => { if (v) setForm({ ...form, type: v }) }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Audience</label>
                    <Select value={form.audience} onValueChange={(v) => { if (v) setForm({ ...form, audience: v }) }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="teachers">Teachers Only</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="parents">Parents Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium mb-1 block">Description (optional)</label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Event details..." rows={3} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={save} className="animated-gradient border-0 text-white">{editingId ? "Update Event" : "Create Event"}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={filterType} onValueChange={(v) => { if (v) setFilterType(v) }}>
          <SelectTrigger className="w-full sm:w-36 h-9 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {eventTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground sm:ml-auto">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card border-0"><CardContent className="p-8 text-center text-muted-foreground">No events yet. Create one to get started.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const cfg = typeConfig[item.type] || typeConfig.other
            const Icon = cfg.icon
            const eventDate = new Date(item.date + (item.time ? `T${item.time}` : ""))
            const isPast = eventDate < new Date(new Date().toDateString())
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={`glass-card border-0 group ${isPast ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl ${cfg.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              {item.time && <><span>·</span><span>{new Date(`2000-01-01T${item.time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span></>}
                              <span>·</span>
                              <Badge variant="outline" className="text-[10px]">{cfg.label}</Badge>
                              <Badge variant="outline" className="text-[10px]">{item.audience === "all" ? "Everyone" : item.audience}</Badge>
                              {isPast && <Badge variant="outline" className="text-[10px] text-muted-foreground">Past</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-primary"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirmDelete(item.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-danger" />
                            </Button>
                          </div>
                        </div>
                        {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
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
