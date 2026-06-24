"use client"

import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Play, Clock, FileText, Eye, Shield } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"

import { EmptyState } from "@/components/admin/EmptyState"
import Link from "next/link"

export default function TeacherExamsPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [items, setItems] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ title: "", description: "", duration: 30, shuffleQuestions: false, showResults: true, subjectId: "", classId: "", type: "regular", requireFullscreen: true, tabSwitchLimit: 3, allowCopyPaste: false, maxAttempts: 0 })
  const [myClassIds, setMyClassIds] = useState<string[]>([])
  const [mySubjectIds, setMySubjectIds] = useState<string[]>([])

  const fetchData = async () => {
    const [eRes, sRes, cRes] = await Promise.all([
      fetch("/api/exams?type=regular"),
      fetch("/api/subjects"),
      fetch("/api/classes"),
    ])
    const allExams = await eRes.json()
    const allSubjects = await sRes.json()
    const allClasses = await cRes.json()
    setItems(myClassIds.length > 0 ? allExams.filter((e: any) => myClassIds.includes(e.classId) && (mySubjectIds.length === 0 || mySubjectIds.includes(e.subjectId))) : allExams)
    setSubjects(mySubjectIds.length > 0 ? allSubjects.filter((s: any) => mySubjectIds.includes(s.id)) : allSubjects)
    setClasses(myClassIds.length > 0 ? allClasses.filter((c: any) => myClassIds.includes(c.id)) : allClasses)
    setLoading(false)
  }

  useEffect(() => {
    if (!userId) return
    fetch("/api/staff?userId=" + userId)
      .then((r) => r.json())
      .then((staffData) => {
        const staffId = staffData?.id || ""
        return fetch("/api/teacher-assignments?teacherId=" + staffId).then((r) => r.json())
      })
      .then((tas) => {
        const ta = Array.isArray(tas) ? tas[0] : null
        setMyClassIds(ta?.classIds || [])
        setMySubjectIds(ta?.subjectIds || [])
      })
      .catch(() => setLoading(false))
  }, [userId])

  useEffect(() => { fetchData().catch(() => setLoading(false)) }, [myClassIds, mySubjectIds])

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", duration: 30, shuffleQuestions: false, showResults: true, subjectId: "", classId: "", type: "regular", requireFullscreen: true, tabSwitchLimit: 3, allowCopyPaste: false, maxAttempts: 0 }); setSheetOpen(true) }
  const openEdit = (item: any) => { setEditing(item); setForm({ title: item.title, description: item.description || "", duration: item.duration, shuffleQuestions: item.shuffleQuestions, showResults: item.showResults, subjectId: item.subjectId || "", classId: item.classId || "", type: item.type || "regular", requireFullscreen: item.requireFullscreen ?? true, tabSwitchLimit: item.tabSwitchLimit ?? 3, allowCopyPaste: item.allowCopyPaste ?? false, maxAttempts: item.maxAttempts ?? 0 }); setSheetOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/exams/${editing.id}` : "/api/exams"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(editing ? "Exam updated" : "Exam created"); setSheetOpen(false); fetchData() }
    else toast.error("Failed to save")
  }

  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const handleDelete = (item: any) => setConfirmDelete(item)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/exams/${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Exam deleted"); fetchData() }
    setConfirmDelete(null)
  }

  const handlePublish = async (exam: any) => {
    await fetch(`/api/exams/${exam.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: exam.status === "published" ? "draft" : "published" }) })
    toast.success(exam.status === "published" ? "Unpublished" : "Published"); fetchData()
  }

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "Unknown"
  const getClassName = (id: string) => classes.find((c) => c.id === id)

  const filtered = items.filter((e) => {
    if (filterSubject !== "all" && e.subjectId !== filterSubject) return false
    if (filterStatus !== "all" && e.status !== filterStatus) return false
    if (filterType !== "all" && e.type !== filterType) return false
    return true
  })

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Exam Builder" description="Create and manage exam templates" actionLabel="New Exam" onAction={openCreate} />
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Exam" description={`Permanently delete ${confirmDelete?.title}?`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={filterSubject} onValueChange={(v) => { if (v) setFilterSubject(v) }}>
          <SelectTrigger className="h-10 w-full sm:w-[160px]"><SelectValue placeholder="All subjects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => { if (v) setFilterStatus(v) }}>
          <SelectTrigger className="h-10 w-full sm:w-[130px]"><SelectValue placeholder="All status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => { if (v) setFilterType(v) }}>
          <SelectTrigger className="h-10 w-full sm:w-[130px]"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="entrance">Entrance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No exams found" description="Create your first exam template" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const qCount = item.questions?.length || 0
              const tPts = item.questions?.reduce((s: number, q: any) => s + (q.points || 0), 0) || 0
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={item.status === "published" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>{item.status}</Badge>
                            <Badge variant="outline">{getSubjectName(item.subjectId)}</Badge>
                          </div>
                          <Link href={`/teacher/cbt/exams/${item.id}`} className="hover:underline"><h3 className="font-semibold">{item.title}</h3></Link>
                          {item.description && <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>}
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.duration} min</span>
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{qCount} questions</span>
                            <span>{tPts} pts</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePublish(item)}><Play className="h-3.5 w-3.5" /></Button>
                          <Link href={`/teacher/cbt/exams/${item.id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button></Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Exam" : "New Exam"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Exam Title</Label>
            <Input id="title" placeholder="e.g. Mathematics Mid-Term" value={form.title} onChange={(e) => update("title", e.target.value)} className="h-12" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={form.description} onChange={(e) => update("description", e.target.value)} className="min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={form.subjectId} onValueChange={(v) => update("subjectId", v)}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => update("classId", v)}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exam Type</Label>
              <Select value={form.type} onValueChange={(v) => update("type", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Exam</SelectItem>
                  <SelectItem value="entrance">Entrance Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" type="number" min={1} max={480} value={form.duration} onChange={(e) => update("duration", parseInt(e.target.value) || 30)} className="h-12" />
          </div>
          <div className="flex items-center justify-between"><Label>Shuffle Questions</Label><Switch checked={form.shuffleQuestions} onCheckedChange={(v) => update("shuffleQuestions", v)} /></div>
          <div className="flex items-center justify-between"><Label>Show Results</Label><Switch checked={form.showResults} onCheckedChange={(v) => update("showResults", v)} /></div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Security Settings</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Fullscreen</Label>
                  <p className="text-xs text-muted-foreground">Locks student into fullscreen during exam</p>
                </div>
                <Switch checked={form.requireFullscreen} onCheckedChange={(v) => update("requireFullscreen", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Copy & Paste</Label>
                  <p className="text-xs text-muted-foreground">Permit copy/paste operations during exam</p>
                </div>
                <Switch checked={form.allowCopyPaste} onCheckedChange={(v) => update("allowCopyPaste", v)} />
              </div>
              <div className="space-y-2">
                <Label>Tab Switch Limit</Label>
                <p className="text-xs text-muted-foreground">Auto-submit after this many tab switches (0 = unlimited)</p>
                <Input type="number" min={0} max={20} value={form.tabSwitchLimit} onChange={(e) => update("tabSwitchLimit", parseInt(e.target.value) || 0)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Max Attempts Per Student</Label>
                <p className="text-xs text-muted-foreground">0 = unlimited attempts</p>
                <Input type="number" min={0} max={99} value={form.maxAttempts} onChange={(e) => update("maxAttempts", parseInt(e.target.value) || 0)} className="h-12" />
              </div>
            </div>
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">{editing ? "Update" : "Create"}</Button>
        </form>
      </FormSheet>
    </div>
  )
}
