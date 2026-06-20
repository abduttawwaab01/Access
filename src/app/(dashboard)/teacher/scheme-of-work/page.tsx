"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, BookOpen, ChevronDown, ChevronUp, Layers, X, GripVertical } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"
import { cn } from "@/lib/utils"

const teacherId = "1"
const teacherName = "Grace Hopper"

interface WeekEntry {
  id: string
  week: number
  topic: string
  objectives: string
  content: string
  resources: string
}

interface Scheme {
  id: string
  title: string
  subject: string
  subjectId: string
  classId: string
  term: string
  session: string
  status: string
  weeks: WeekEntry[]
  createdBy: string
  createdAt: string
}

export default function SchemeOfWorkPage() {
  const [items, setItems] = useState<Scheme[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Scheme | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    subjectId: "",
    subject: "",
    classId: "",
    term: "",
    session: "",
  })
  const [weeks, setWeeks] = useState<WeekEntry[]>([
    { id: crypto.randomUUID(), week: 1, topic: "", objectives: "", content: "", resources: "" },
  ])

  const fetchData = async () => {
    const [schemesRes, classesRes] = await Promise.all([
      fetch(`/api/scheme-of-work?teacherId=${teacherId}`),
      fetch("/api/classes"),
    ])
    setItems(await schemesRes.json())
    setClasses(await classesRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const updateForm = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }))

  const updateWeek = (id: string, field: string, value: string) =>
    setWeeks((prev) => prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)))

  const addWeek = () =>
    setWeeks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), week: prev.length + 1, topic: "", objectives: "", content: "", resources: "" },
    ])

  const removeWeek = (id: string) =>
    setWeeks((prev) => {
      const filtered = prev.filter((w) => w.id !== id)
      return filtered.map((w, i) => ({ ...w, week: i + 1 }))
    })

  const openCreate = () => {
    setEditing(null)
    setForm({ title: "", subjectId: "", subject: "", classId: "", term: "", session: "" })
    setWeeks([{ id: crypto.randomUUID(), week: 1, topic: "", objectives: "", content: "", resources: "" }])
    setSheetOpen(true)
  }

  const openEdit = (item: Scheme) => {
    setEditing(item)
    setForm({
      title: item.title,
      subjectId: item.subjectId,
      subject: item.subject,
      classId: item.classId,
      term: item.term,
      session: item.session,
    })
    setWeeks(item.weeks.length > 0 ? item.weeks : [{ id: crypto.randomUUID(), week: 1, topic: "", objectives: "", content: "", resources: "" }])
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = editing
      ? { action: "update", id: editing.id, ...form, weeks, createdBy: teacherId }
      : { ...form, weeks, createdBy: teacherId, status: "draft" }
    const url = editing ? "/api/scheme-of-work" : "/api/scheme-of-work"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      toast.success(editing ? "Scheme updated" : "Scheme created")
      setSheetOpen(false)
      fetchData()
    } else toast.error("Failed to save")
  }

  const handleDelete = async (item: Scheme) => {
    const res = await fetch(`/api/scheme-of-work?id=${item.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Deleted"); fetchData() }
  }

  const toggleExpand = (id: string) => setExpanded((prev) => (prev === id ? null : id))

  const getClassName = (id: string) => classes.find((c) => c.id === id)

  const statusVariant = (status: string) => {
    switch (status) {
      case "draft": return "bg-amber-500/15 text-amber-600"
      case "pending": return "bg-blue-500/15 text-blue-600"
      case "published": return "bg-emerald-500/15 text-emerald-600"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Scheme of Work" description={`${items.length} schemes`} actionLabel="New Scheme" onAction={openCreate} />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No schemes of work" description="Create your first scheme of work" />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={cn("glass-card border-0 overflow-hidden transition-all duration-300", expanded === item.id && "ring-1 ring-primary/20")}>
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{item.title}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                              <span>{item.subject}</span>
                              <span>{getClassName(item.classId)?.name}{getClassName(item.classId)?.arm ? ` ${getClassName(item.classId).arm}` : ""}</span>
                              <span>{item.term}</span>
                              <span>{item.session}</span>
                              <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{item.weeks?.length || 0} weeks</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={statusVariant(item.status)}>{item.status}</Badge>
                          {item.status === "draft" && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(item)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpand(item.id)}>
                            {expanded === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {expanded === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-border/40 overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            {item.weeks && item.weeks.length > 0 ? (
                              item.weeks.map((w: WeekEntry, wi: number) => (
                                <div key={w.id} className="rounded-xl bg-muted/30 p-3 text-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{w.week}</span>
                                    <span className="font-medium text-sm">{w.topic || `Week ${w.week}`}</span>
                                  </div>
                                  {w.objectives && <p className="text-xs text-muted-foreground mb-1"><span className="font-medium text-foreground/80">Objectives:</span> {w.objectives}</p>}
                                  {w.content && <p className="text-xs text-muted-foreground mb-1"><span className="font-medium text-foreground/80">Content:</span> {w.content}</p>}
                                  {w.resources && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Resources:</span> {w.resources}</p>}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground text-center py-4">No weeks added yet</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Scheme of Work" : "New Scheme of Work"}>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[70dvh] pb-8">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="e.g. SS1 Mathematics Scheme" className="h-12" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => updateForm("subject", e.target.value)} placeholder="e.g. Mathematics" className="h-12" required />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => v && updateForm("classId", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Term</Label>
              <Select value={form.term} onValueChange={(v) => v && updateForm("term", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Session</Label>
              <Select value={form.session} onValueChange={(v) => v && updateForm("session", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select session" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                  <SelectItem value="2026/2027">2026/2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Weeks</Label>
              <Button type="button" variant="outline" size="sm" onClick={addWeek}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Week
              </Button>
            </div>
            <AnimatePresence>
              {weeks.map((w, wi) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-border/40 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                      <span className="text-sm font-medium">Week {w.week}</span>
                    </div>
                    {weeks.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-danger" onClick={() => removeWeek(w.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={w.topic}
                    onChange={(e) => updateWeek(w.id, "topic", e.target.value)}
                    placeholder="Topic"
                    className="h-10 text-sm"
                  />
                  <Textarea
                    value={w.objectives}
                    onChange={(e) => updateWeek(w.id, "objectives", e.target.value)}
                    placeholder="Objectives"
                    rows={2}
                    className="resize-none text-sm"
                  />
                  <Textarea
                    value={w.content}
                    onChange={(e) => updateWeek(w.id, "content", e.target.value)}
                    placeholder="Content"
                    rows={3}
                    className="resize-none text-sm"
                  />
                  <Input
                    value={w.resources}
                    onChange={(e) => updateWeek(w.id, "resources", e.target.value)}
                    placeholder="Resources (comma separated)"
                    className="h-10 text-sm"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Scheme" : "Create Scheme"}
          </Button>
        </form>
      </FormSheet>
    </div>
  )
}
