"use client"

import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, ClipboardCheck, Users, CalendarDays, Eye, BookOpen, Star } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"

import { EmptyState } from "@/components/admin/EmptyState"
import { generateAssignmentDescription } from "@/lib/content-generator"
import { cn } from "@/lib/utils"

export default function AssignmentsPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [items, setItems] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [tab, setTab] = useState("all")
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ title: "", subject: "", subjectId: "", classId: "", dueDate: "", type: "homework", description: "" })
  const [myClassIds, setMyClassIds] = useState<string[]>([])
  const [myStaffId, setMyStaffId] = useState("")
  const [mySubjectIds, setMySubjectIds] = useState<string[]>([])

  // Submissions grading state
  const [submissionsDialog, setSubmissionsDialog] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [gradeDialog, setGradeDialog] = useState<any>(null)
  const [gradeScore, setGradeScore] = useState("")
  const [gradeFeedback, setGradeFeedback] = useState("")
  const [grading, setGrading] = useState(false)
  const [students, setStudents] = useState<any[]>([])

  const fetchData = async () => {
    const [asgnsRes, classesRes, subjectsRes, studentsRes] = await Promise.all([
      fetch("/api/assignments?teacherId=" + myStaffId),
      fetch("/api/classes"),
      fetch("/api/subjects"),
      fetch("/api/students"),
    ])
    const allAssignments = await asgnsRes.json()
    const allClasses = await classesRes.json()
    const allSubjects = await subjectsRes.json()
    const allStudents = await studentsRes.json()
    setStudents(Array.isArray(allStudents) ? allStudents : [])
    setSubjects(allSubjects.filter((s: any) => mySubjectIds.includes(s.id)))
    setItems(allAssignments.filter((a: any) => myClassIds.includes(a.classId)))
    setClasses(allClasses.filter((c: any) => myClassIds.includes(c.id)))
    if (form.classId === "" && myClassIds.length > 0) setForm((p) => ({ ...p, classId: myClassIds[0] }))
    setLoading(false)
  }

  useEffect(() => {
    if (!userId) return
    fetch("/api/staff?userId=" + userId)
      .then((r) => r.json())
      .then((staffData) => {
        const staffId = staffData?.id || ""
        setMyStaffId(staffId)
        return fetch("/api/teacher-assignments?teacherId=" + staffId).then((r) => r.json())
      })
      .then((tas) => {
        const { classIds: myClassIds = [], subjectIds: mySubjectIds = [] } = tas || {}
        setMyClassIds(myClassIds)
        setMySubjectIds(mySubjectIds)
      })
      .catch(() => setLoading(false))
  }, [userId])

  useEffect(() => { fetchData().catch(() => setLoading(false)) }, [myClassIds])

  const update = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }))

  const handleGenerateDescription = () => {
    if (!form.subject || !form.classId || !form.title) { toast.error("Set subject, class, and title first"); return }
    setGeneratingDesc(true)
    try {
      const className = classes.find((c: any) => c.id === form.classId)?.name || ""
      const desc = generateAssignmentDescription(form.subject, className, form.title, form.type)
      update("description", desc)
      toast.success("Description generated")
    } catch { toast.error("Failed to generate description") }
    setGeneratingDesc(false)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ title: "", subject: "", subjectId: "", classId: "", dueDate: "", type: "homework", description: "" })
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    const subj = subjects.find((s: any) => s.name === item.subject)
    setForm({ title: item.title, subject: item.subject, subjectId: subj?.id || "", classId: item.classId, dueDate: item.dueDate ? item.dueDate.split("T")[0] : "", type: item.type, description: item.description || "" })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/assignments/${editing.id}` : "/api/assignments"
    const method = editing ? "PUT" : "POST"
    const payload = { ...form, createdBy: userId }
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    if (res.ok) { toast.success(editing ? "Assignment updated" : "Assignment created"); setSheetOpen(false); fetchData() }
    else toast.error("Failed to save")
  }

  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const handleDelete = (item: any) => setConfirmDelete(item)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/assignments/${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Deleted"); fetchData() }
    setConfirmDelete(null)
  }

  const viewSubmissions = async (item: any) => {
    setSubmissionsDialog(item)
    setLoadingSubs(true)
    const res = await fetch(`/api/submissions?assignmentId=${item.id}`)
    const data = await res.json()
    setSubmissions(Array.isArray(data) ? data : (data.data || []))
    setLoadingSubs(false)
  }

  const openGrade = (sub: any) => {
    setGradeDialog(sub)
    setGradeScore(sub.score?.toString() || "")
    setGradeFeedback(sub.feedback || "")
  }

  const handleGrade = async () => {
    if (!gradeDialog) return
    const score = parseFloat(gradeScore)
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100")
      return
    }
    setGrading(true)
    const res = await fetch(`/api/submissions/${gradeDialog.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, feedback: gradeFeedback, status: "graded" }),
    })
    if (res.ok) {
      toast.success("Submission graded")
      setSubmissions((prev) => prev.map((s) => s.id === gradeDialog.id ? { ...s, score, feedback: gradeFeedback, status: "graded" } : s))
      setGradeDialog(null)
      fetchData()
    } else {
      toast.error("Failed to grade")
    }
    setGrading(false)
  }

  const getStudentName = (id: string) => {
    const s = students.find((st: any) => st.id === id)
    return s ? `${s.firstName} ${s.lastName}` : id
  }

  const formatDate = (d: string | Date) => {
    if (!d) return ""
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  const filtered = items.filter((a) => tab === "all" || a.status === tab)

  const getClassName = (id: string) => classes.find((c) => c.id === id)

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Assignments" description={`${items.length} total`} actionLabel="New Assignment" onAction={openCreate} />
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Assignment" description={`Permanently delete ${confirmDelete?.title}? This cannot be undone.`} />
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="all" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">All</TabsTrigger>
          <TabsTrigger value="active" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">Active</TabsTrigger>
          <TabsTrigger value="closed" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No assignments" description="Create your first assignment" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
              {filtered.map((item, i) => {
              const pct = item.total > 0 ? Math.round((item.submissions / item.total) * 100) : 0
              const due = item.dueDate ? new Date(item.dueDate) : null
              const overdue = due && due < new Date() && item.status !== "closed"
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <ClipboardCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                              <span>{item.subject}</span>
                              <span>{getClassName(item.classId)?.name}{getClassName(item.classId)?.arm ? ` ${getClassName(item.classId).arm}` : ""}</span>
                              <span className="capitalize">{item.type}</span>
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Due {formatDate(item.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={cn(item.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                            {overdue ? "Overdue" : item.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)} title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => viewSubmissions(item)} title="View Submissions">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(item)} title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Submissions</span>
                            <span>{item.submissions || 0}/{item.total || 0}</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
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

      {/* Submissions Dialog */}
      <Dialog open={!!submissionsDialog} onOpenChange={(o) => { if (!o) setSubmissionsDialog(null) }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submissions: {submissionsDialog?.title}</DialogTitle>
          </DialogHeader>
          {loadingSubs ? (
            <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <Card key={sub.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{getStudentName(sub.studentId)}</p>
                        <p className="text-xs text-muted-foreground">Submitted {formatDate(sub.createdAt)}</p>
                        {sub.content && (
                          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-3">{typeof sub.content === "string" ? sub.content : JSON.stringify(sub.content)}</p>
                        )}
                        {sub.fileUrl && (
                          <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 inline-block">View attachment</a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {sub.status === "graded" ? (
                          <Badge className="bg-green-500/15 text-green-600">{sub.score}%</Badge>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8" onClick={() => openGrade(sub)}>
                            <Star className="h-3.5 w-3.5 mr-1" /> Grade
                          </Button>
                        )}
                      </div>
                    </div>
                    {sub.status === "graded" && sub.feedback && (
                      <div className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                        <span className="font-medium">Feedback:</span> {sub.feedback}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={!!gradeDialog} onOpenChange={(o) => { if (!o) setGradeDialog(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grade: {getStudentName(gradeDialog?.studentId)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {gradeDialog?.content && (
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs font-medium mb-1">Student's Work:</p>
                <p className="text-sm whitespace-pre-wrap">{typeof gradeDialog.content === "string" ? gradeDialog.content : JSON.stringify(gradeDialog.content)}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Score (0-100)</Label>
              <Input type="number" min="0" max="100" value={gradeScore} onChange={(e) => setGradeScore(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} rows={4} placeholder="Provide feedback to the student..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose>
              <Button variant="outline" disabled={grading}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleGrade} disabled={grading} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
              {grading ? "Saving..." : <><Star className="h-4 w-4 mr-1" /> Save Grade</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Assignment" : "New Assignment"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Algebra Homework Set 1" className="h-12" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={form.subjectId} onValueChange={(v) => { if (v) { const subj = subjects.find((s: any) => s.id === v); update("subjectId", v); if (subj) update("subject", subj.name) } }}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => v && update("classId", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => v && update("type", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homework">Homework</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="classwork">Classwork</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} className="h-12" required />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Description</Label>
              <Button type="button" variant="ghost" size="sm" className="text-xs text-primary" onClick={handleGenerateDescription} disabled={generatingDesc}>
                <ClipboardCheck className="h-3 w-3 mr-1" />{generatingDesc ? "Generating..." : "Generate"}
              </Button>
            </div>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="resize-none" placeholder="Describe the assignment..." />
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Assignment" : "Create Assignment"}
          </Button>
        </form>
      </FormSheet>

    </div>
  )
}
