"use client"

import { useState, useEffect, useRef } from "react"
import { downloadPng, downloadPdf, downloadDoc, openPrintWindow } from "@/lib/capture"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CheckCircle, XCircle, Plus, Eye, Edit, Trash2, BookOpen, ChevronDown, ChevronUp, Download, Printer, FileText, DownloadCloud } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"

interface Week {
  weekNumber: number
  topic: string
  objectives: string
  content: string
  resources: string
}

interface Scheme {
  id: string
  title: string
  subjectId: string
  subjectName: string
  classId: string
  className: string
  term: string
  session: string
  status: "draft" | "pending" | "published"
  weeks: Week[]
  createdBy: string
  creatorName: string
  approvedBy?: string
  approverName?: string
  createdAt: string
}

const statusColor: Record<string, "secondary" | "default" | "outline"> = {
  draft: "secondary",
  pending: "default",
  published: "outline",
}

const terms = ["First Term", "Second Term", "Third Term"]

export default function SchemeOfWorkPage() {
  const [items, setItems] = useState<Scheme[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Scheme | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const teacherId = "1"

  const [filterClass, setFilterClass] = useState("all")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showEditWarning, setShowEditWarning] = useState(false)

  const [form, setForm] = useState({
    title: "",
    subjectId: "",
    classId: "",
    term: "",
    session: "",
  })
  const [weeks, setWeeks] = useState<Week[]>([])

  const fetchData = async () => {
    setLoading(true)
    const [schemesRes, classesRes, subjectsRes, sessionsRes] = await Promise.all([
      fetch("/api/scheme-of-work"),
      fetch("/api/classes"),
      fetch("/api/subjects"),
      fetch("/api/sessions"),
    ])
    setItems(await schemesRes.json())
    setClasses(await classesRes.json())
    setSubjects(await subjectsRes.json())
    setSessions(await sessionsRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const openCreate = () => {
    setEditing(null)
    setForm({ title: "", subjectId: "", classId: "", term: "", session: "" })
    setWeeks([{ weekNumber: 1, topic: "", objectives: "", content: "", resources: "" }])
    setSheetOpen(true)
  }

  const openEdit = (item: Scheme) => {
    setEditing(item)
    setForm({
      title: item.title,
      subjectId: item.subjectId,
      classId: item.classId,
      term: item.term,
      session: item.session,
    })
    setWeeks(item.weeks?.length > 0 ? item.weeks : [{ weekNumber: 1, topic: "", objectives: "", content: "", resources: "" }])
    setSheetOpen(true)
  }

  const addWeek = () => {
    setWeeks((prev) => [...prev, { weekNumber: prev.length + 1, topic: "", objectives: "", content: "", resources: "" }])
  }

  const removeWeek = (index: number) => {
    setWeeks((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      return updated.map((w, i) => ({ ...w, weekNumber: i + 1 }))
    })
  }

  const updateWeek = (index: number, field: keyof Week, value: string) => {
    setWeeks((prev) => prev.map((w, i) => (i === index ? { ...w, [field]: value } : w)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, weeks }
    const url = editing ? "/api/scheme-of-work" : "/api/scheme-of-work"
    const method = editing ? "PUT" : "POST"
    const body = editing ? { action: "update", id: editing.id, data: payload } : payload

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success(editing ? "Scheme updated" : "Scheme created")
      setSheetOpen(false)
      fetchData()
    } else {
      toast.error("Failed to save scheme")
    }
  }

  const handleApprove = async (item: Scheme) => {
    const res = await fetch("/api/scheme-of-work", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", id: item.id }),
    })
    if (res.ok) {
      toast.success("Scheme approved")
      fetchData()
    } else {
      toast.error("Failed to approve")
    }
  }

  const handleReject = async (item: Scheme) => {
    const res = await fetch("/api/scheme-of-work", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", id: item.id }),
    })
    if (res.ok) {
      toast.success("Scheme rejected")
      fetchData()
    } else {
      toast.error("Failed to reject")
    }
  }

  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const handleDelete = (item: Scheme) => setConfirmDelete(item)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/scheme-of-work?id=${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Scheme deleted"); fetchData() }
    else { toast.error("Failed to delete") }
    setConfirmDelete(null)
  }

  const filtered = items.filter((item) => {
    if (filterClass !== "all" && item.classId !== filterClass) return false
    if (filterSubject !== "all" && item.subjectId !== filterSubject) return false
    if (filterStatus !== "all" && item.status !== filterStatus) return false
    return true
  })

  const reportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const handleExportPng = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { await downloadPng(reportRef.current, "Scheme_of_Work.png", { scale: 2, backgroundColor: "#ffffff" }); toast.success("Exported as PNG") }
    catch { toast.error("Export failed") }; setExporting(false)
  }

  const handleExportPdf = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { await downloadPdf(reportRef.current, "Scheme_of_Work.pdf", { scale: 2, backgroundColor: "#ffffff" }); toast.success("Exported as PDF") }
    catch { toast.error("Export failed") }; setExporting(false)
  }

  const handleExportDoc = () => {
    if (!reportRef.current) return
    try { downloadDoc(reportRef.current, "Scheme_of_Work.doc", "Scheme of Work"); toast.success("Exported as DOC") }
    catch { toast.error("Export failed") }
  }

  const handlePrint = () => {
    if (!reportRef.current) return
    openPrintWindow(reportRef.current, "Scheme of Work")
  }

  const statusBadge = (status: string) => {
    const label = status.charAt(0).toUpperCase() + status.slice(1)
    return <Badge variant={statusColor[status] || "outline"}>{label}</Badge>
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Scheme of Work" description="Create and manage termly teaching schemes" actionLabel="New Scheme" onAction={openCreate} />
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Scheme" description={`Permanently delete ${confirmDelete?.title}? This cannot be undone.`} />
      <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-2">
        <Select value={filterClass} onValueChange={(v) => v && setFilterClass(v)}>
          <SelectTrigger className="h-9 w-full sm:w-40"><SelectValue placeholder="All Classes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSubject} onValueChange={(v) => v && setFilterSubject(v)}>
          <SelectTrigger className="h-9 w-full sm:w-44"><SelectValue placeholder="All Subjects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          {["all", "draft", "pending", "published"].map((s) => (
            <Button
              key={s}
              variant={filterStatus === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(s)}
              className="shrink-0 rounded-full capitalize"
            >
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No schemes found" description="Create a new scheme of work to get started" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card border-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 cursor-pointer" onClick={() => toggleExpand(item.id)}>
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{item.title}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                              <span>{item.className}</span>
                              <span className="text-primary/70">{item.subjectName}</span>
                              <span>{item.term}</span>
                              <span>{item.session}</span>
                              {statusBadge(item.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                          {item.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" className="text-green-600" onClick={() => handleApprove(item)} title="Approve">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleReject(item)} title="Reject">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {item.status === "draft" && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-danger" onClick={() => handleDelete(item)} title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {item.status === "published" && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-blue-600" 
                              onClick={() => { openEdit(item); setShowEditWarning(true); }}
                              title="Edit (will reset to draft)"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-muted-foreground">
                            {expandedId === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span>By: {item.creatorName}</span>
                        {item.approverName && <span>Approved: {item.approverName}</span>}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border/40">
                            <div ref={reportRef} className="px-4 py-3 space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold">{item.title} — Full Scheme</h3>
                                <div className="flex gap-1">
                                  <Button variant="outline" size="icon-sm" onClick={handleExportPng} disabled={exporting} title="Export PNG">
                                    <Download className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="outline" size="icon-sm" onClick={handleExportPdf} disabled={exporting} title="Export PDF">
                                    <FileText className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="outline" size="icon-sm" onClick={handleExportDoc} title="Export DOC">
                                    <DownloadCloud className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="outline" size="icon-sm" onClick={handlePrint} title="Print">
                                    <Printer className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            {item.weeks?.length > 0 ? item.weeks.map((week) => (
                              <Card key={week.weekNumber} className="border border-border/40 bg-muted/30">
                                <CardHeader className="p-3 pb-1">
                                  <CardTitle className="text-sm font-semibold">Week {week.weekNumber}: {week.topic}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-1 text-xs space-y-1">
                                  {week.objectives && <p><span className="font-medium text-foreground">Objectives:</span> {week.objectives}</p>}
                                  {week.content && <p><span className="font-medium text-foreground">Content:</span> {week.content}</p>}
                                  {week.resources && <p><span className="font-medium text-foreground">Resources:</span> {week.resources}</p>}
                                </CardContent>
                              </Card>
                            )                            ) : (
                              <p className="text-xs text-muted-foreground py-2">No week details available</p>
                            )}
                          </div>
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
        <form onSubmit={handleSubmit} className="space-y-4 pb-8">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. SS1 Mathematics First Term Scheme" value={form.title} onChange={(e) => update("title", e.target.value)} className="h-12" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="classId">Class</Label>
              <Select value={form.classId} onValueChange={(v) => update("classId", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjectId">Subject</Label>
              <Select value={form.subjectId} onValueChange={(v) => update("subjectId", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Select value={form.term} onValueChange={(v) => update("term", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  {terms.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
              <Select value={form.session} onValueChange={(v) => { if (v) update("session", v) }}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select session" /></SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Weeks</Label>
              <Button type="button" variant="outline" size="sm" onClick={addWeek} className="shrink-0">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Week
              </Button>
            </div>

            {weeks.map((week, index) => (
              <Card key={index} className="border border-border/40">
                <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Week {week.weekNumber}</CardTitle>
                  {weeks.length > 1 && (
                    <Button type="button" variant="ghost" size="icon-sm" className="h-7 w-7 text-danger" onClick={() => removeWeek(index)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-3 pt-1 space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Topic</Label>
                    <Input placeholder="Topic for the week" value={week.topic} onChange={(e) => updateWeek(index, "topic", e.target.value)} className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Objectives</Label>
                    <Textarea placeholder="Learning objectives" value={week.objectives} onChange={(e) => updateWeek(index, "objectives", e.target.value)} rows={2} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Content</Label>
                    <Textarea placeholder="Lesson content / activities" value={week.content} onChange={(e) => updateWeek(index, "content", e.target.value)} rows={2} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Resources</Label>
                    <Input placeholder="e.g. Textbook, worksheets" value={week.resources} onChange={(e) => updateWeek(index, "resources", e.target.value)} className="h-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Scheme" : "Create Scheme"}
          </Button>
        </form>
      </FormSheet>

      {showEditWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-2">Warning</h3>
            <p className="text-gray-600 mb-4">
              Editing a published scheme will reset its status to "draft" and require re-approval.
              Are you sure you want to continue?
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowEditWarning(false)} variant="destructive">
                Yes, Edit
              </Button>
              <Button onClick={() => { setShowEditWarning(false); setEditing(null); setSheetOpen(false); }} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
