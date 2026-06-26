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
import { toast } from "sonner"
import { Pencil, FileText, Search, X, CheckCircle, XCircle, ChevronDown, ChevronRight, HelpCircle, ScanLine, Sparkles, Eye, EyeOff, Clock, Plus, Trash2, BookOpen } from "lucide-react"
import ImageToText from "@/components/ImageToText"
import { LessonNoteViewer } from "@/components/LessonNoteViewer"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { currentSession } from "@/lib/utils"
import { generateLessonNoteWithQuestions } from "@/lib/content-generator"
import { EmptyState } from "@/components/admin/EmptyState"

export default function AdminLessonNotes() {
  const [notes, setNotes] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [ocrOpen, setOcrOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(true)
  const [form, setForm] = useState({ title: "", subject: "", classId: "", week: "", term: "", session: "", content: "", resources: "", status: "draft", createdBy: "" })
  const [quiz, setQuiz] = useState<any[]>([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerNote, setViewerNote] = useState<any>(null)
  const [school, setSchool] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/lesson-notes").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()),
      fetch("/api/sessions").then((r) => r.json()),
      fetch("/api/subjects").then((r) => r.json()),
    ]).then(([d, c, s, sch, sess, sub]) => { setNotes(Array.isArray(d) ? d : []); setClasses(c); setStaff(s); setSchool(sch); setSessions(Array.isArray(sess) ? sess : []); setSubjects(Array.isArray(sub) ? sub : []); setLoading(false) })
  }, [])

  const update = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }))

  const addQuestion = () => {
    setQuiz([...quiz, { id: Math.random().toString(36).substring(2, 11), questionText: "", type: "MCQ", options: ["", "", "", ""], correctAnswer: "", points: 1 }])
  }
  const removeQuestion = (id: string) => setQuiz(quiz.filter((q) => q.id !== id))
  const updateQuestion = (id: string, field: string, value: any) => {
    setQuiz(quiz.map((q) => {
      if (q.id !== id) return q
      if (field === "type") {
        const options = value === "True-False" ? ["True", "False"] : ["", "", "", ""]
        return { ...q, type: value, options, correctAnswer: "" }
      }
      return { ...q, [field]: value }
    }))
  }
  const updateOption = (id: string, index: number, value: string) => {
    setQuiz(quiz.map((q) => q.id === id ? { ...q, options: q.options.map((o: string, i: number) => i === index ? value : o) } : q))
  }

  const approve = async (id: string) => {
    const res = await fetch("/api/lesson-notes", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", id, approvedBy: "4" }),
    })
    if (res.ok) { setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, status: "published" } : n))); toast.success("Approved") }
  }

  const reject = async (id: string) => {
    const res = await fetch("/api/lesson-notes", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", id }),
    })
    if (res.ok) { setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, status: "rejected" } : n))); toast.success("Rejected") }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ title: "", subject: "", classId: "", week: "", term: "First Term", session: currentSession(), content: "", resources: "", status: "draft", createdBy: "" })
    setQuiz([])
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      title: item.title,
      subject: item.subject,
      classId: item.classId,
      week: String(item.week),
      term: item.term,
      session: item.session || "",
      content: item.content,
      resources: item.resources || "",
      status: item.status,
      createdBy: item.createdBy || "",
    })
    setQuiz(item.quiz || [])
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, week: Number(form.week), quiz }
    if (editing) {
      const res = await fetch("/api/lesson-notes", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: editing.id, data: payload }),
      })
      if (res.ok) {
        toast.success("Lesson note updated")
        setSheetOpen(false)
        const r = await fetch("/api/lesson-notes")
        setNotes(await r.json())
      } else toast.error("Failed to update")
    } else {
      const res = await fetch("/api/lesson-notes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success("Lesson note created")
        setSheetOpen(false)
        const r = await fetch("/api/lesson-notes")
        setNotes(await r.json())
      } else toast.error("Failed to create")
    }
  }

  const handleAIGenerate = async () => {
    const missing: string[] = []
    if (!form.title) missing.push("topic/title")
    if (!form.subject) missing.push("subject")
    if (!form.classId) missing.push("class")
    if (missing.length > 0) {
      update("content", `⚠️ **Please set the following fields before generating:** ${missing.join(", ")}.\n\nFill in the above fields and click Generate again.`)
      return
    }
    setGenerating(true)
    try {
      const className = classes.find((c: any) => c.id === form.classId)?.name || ""
      const { content, questions, source } = await generateLessonNoteWithQuestions(form.subject, form.title, className, form.term, form.week)
      update("content", content)
      if (questions.length > 0) {
        setQuiz(questions.map((q: any) => ({
          id: Math.random().toString(36).substring(2, 11),
          questionText: q.questionText,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
        })))
      }
      toast.success(source === "wikipedia" ? "Lesson note generated from Wikipedia" : "Lesson note generated (template)")
    } catch {
      toast.error("Failed to generate lesson note")
    }
    setGenerating(false)
  }

  const getStaffName = (id: string) => {
    const s = staff.find((st: any) => st.id === id)
    return s ? `${s.firstName} ${s.lastName}` : id
  }

  const getClassName = (id: string) => classes.find((c) => c.id === id)

  const filtered = notes.filter((n) => {
    if (tab !== "all") {
      const statusMap: Record<string, string> = { pending: "draft", approved: "published", rejected: "rejected" }
      if (n.status !== (statusMap[tab] || tab)) return false
    }
    if (search && !n.title?.toLowerCase().includes(search.toLowerCase()) && !n.subject?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Lesson Notes" description={`${notes.length} notes from teachers`} />
      <ConfirmDialog open={false} onOpenChange={() => {}} onConfirm={() => {}} title="" description="" />

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 pl-9" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-muted-foreground" /></button>}
        </div>
        <Button onClick={openCreate} className="h-10 shrink-0 animated-gradient border-0 text-white shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4 mr-1" /> New Note
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="all" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">All</TabsTrigger>
          <TabsTrigger value="pending" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">Pending</TabsTrigger>
          <TabsTrigger value="approved" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">Approved</TabsTrigger>
          <TabsTrigger value="rejected" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No lesson notes" description={search ? "Try a different search" : "Teachers haven't submitted any notes yet"} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">{item.title}</p>
                            <Badge className={item.status === "published" ? "bg-green-500/15 text-green-600" : item.status === "rejected" ? "bg-red-500/15 text-red-600" : "bg-amber-500/15 text-amber-600"}>
                              {item.status === "published" ? <><Eye className="h-3 w-3 mr-1" /> Approved</> : item.status === "rejected" ? <><XCircle className="h-3 w-3 mr-1" /> Rejected</> : <><Clock className="h-3 w-3 mr-1" /> Pending</>}
                            </Badge>
                            {item.quiz && item.quiz.length > 0 && <Badge variant="outline" className="text-[10px]"><HelpCircle className="h-3 w-3 mr-1" /> Quiz: {item.quiz.length}Q</Badge>}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                            <span>{item.subject}</span>
                            <span>Week {item.week}</span>
                            <span>{getClassName(item.classId)?.name}{getClassName(item.classId)?.arm ? ` ${getClassName(item.classId).arm}` : ""}</span>
                            <span>{item.term}</span>
                            {item.session && <span>{item.session}</span>}
                            <span>by {item.creatorName || getStaffName(item.createdBy)}</span>
                            <span>{item.createdAt?.split("T")[0]}</span>
                          </div>
                          {item.content && (
                            <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="mt-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-1">
                              {expanded === item.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              {expanded === item.id ? "Hide content" : "View content"}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => { setViewerNote(item); setViewerOpen(true) }} title="View / Teach">
                          <BookOpen className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)} title="Edit note">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {item.status !== "published" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => approve(item.id)} title="Approve">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {item.status !== "rejected" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => reject(item.id)} title="Reject">
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {expanded === item.id && (
                      <div className="mt-3 pt-3 border-t space-y-3">
                        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.content }} />
                        {item.resources && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Resources:</span> {item.resources}
                          </div>
                        )}
                        {item.quiz && item.quiz.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2">Quiz Questions ({item.quiz.length}):</p>
                            <div className="space-y-2">
                              {item.quiz.map((q: any, qi: number) => (
                                <div key={qi} className="text-xs p-2.5 rounded-lg bg-muted/40">
                                  <p className="font-medium">Q{qi + 1}: {q.questionText}</p>
                                  {q.type === "MCQ" && q.options && <p className="text-muted-foreground mt-0.5">Options: {q.options.join(", ")}</p>}
                                  <p className="text-muted-foreground mt-0.5">Answer: {q.correctAnswer} ({q.points}pt)</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {viewerNote && (
        <LessonNoteViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          data={{
            schoolName: school?.name || "Access School",
            schoolLogo: school?.logo || "",
            schoolMotto: school?.motto || "",
            schoolAddress: school?.address || "",
            schoolPhone: school?.phone || "",
            schoolEmail: school?.email || "",
            title: viewerNote.title,
            subject: viewerNote.subject,
            className: getClassName(viewerNote.classId)?.name + (getClassName(viewerNote.classId)?.arm ? ` ${getClassName(viewerNote.classId).arm}` : "") || "",
            week: viewerNote.week,
            term: viewerNote.term,
            session: viewerNote.session || "",
            teacherName: viewerNote.creatorName || getStaffName(viewerNote.createdBy),
            content: viewerNote.content || "",
            resources: viewerNote.resources || "",
            quiz: viewerNote.quiz || [],
            createdAt: viewerNote.createdAt,
          }}
        />
      )}

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Lesson Note" : "New Lesson Note"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} className="h-12" required />
          </div>
          {!editing && (
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={form.createdBy} onValueChange={(v) => v && update("createdBy", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {staff.filter((s: any) => s.role === "teacher").map((t: any) => <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={form.subject} onValueChange={(v) => v && update("subject", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Week</Label>
              <Input type="number" value={form.week} onChange={(e) => update("week", e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <Select value={form.term} onValueChange={(v) => v && update("term", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Session</Label>
            <Select value={form.session} onValueChange={(v) => v && update("session", v)}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Select session" /></SelectTrigger>
              <SelectContent>
                {sessions.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Label>Content</Label>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setOcrOpen(!ocrOpen)}>
                  <ScanLine className="h-3 w-3 mr-1" /><span>Extract Image</span>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-xs text-primary" onClick={handleAIGenerate} disabled={generating}>
                  <Sparkles className={`h-3 w-3 mr-1 ${generating ? "animate-spin" : ""}`} /><span>{generating ? "Generating..." : "Generate"}</span>
                </Button>
              </div>
            </div>
            {ocrOpen && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">Picture to Text</span>
                  <button onClick={() => setOcrOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <ImageToText multiple onUseText={(text) => { update("content", text); setOcrOpen(false) }} />
              </div>
            )}
            <Textarea value={form.content} onChange={(e) => update("content", e.target.value)} rows={8} className="resize-none" placeholder="Write your lesson content here..." />
          </div>
          <div className="space-y-2">
            <Label>Resources</Label>
            <Input value={form.resources} onChange={(e) => update("resources", e.target.value)} placeholder="e.g. Textbook Ch. 3, Worksheet 1" className="h-12" />
          </div>
          <div className="space-y-2 border rounded-lg p-3">
            <button type="button" onClick={() => setQuizOpen(!quizOpen)} className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                {quizOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <Label className="cursor-pointer">Quiz Questions</Label>
                {quiz.length > 0 && <Badge variant="secondary" className="text-xs">{quiz.length} Q</Badge>}
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); addQuestion() }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </button>
            {quizOpen && (
              <div className="space-y-3 pt-1">
                {quiz.map((q, qi) => (
                  <div key={q.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Q{qi + 1}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Input value={q.questionText} onChange={(e) => updateQuestion(q.id, "questionText", e.target.value)} placeholder="Question text" className="h-10" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Select value={q.type} onValueChange={(v) => updateQuestion(q.id, "type", v)}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MCQ">MCQ</SelectItem>
                            <SelectItem value="True-False">True/False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Points</Label>
                        <Input type="number" value={q.points} onChange={(e) => updateQuestion(q.id, "points", Number(e.target.value))} className="h-10" min={1} />
                      </div>
                    </div>
                    {q.type === "MCQ" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Options</Label>
                        {q.options.map((opt: string, oi: number) => (
                          <div key={oi} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-4">{String.fromCharCode(65 + oi)}.</span>
                            <Input value={opt} onChange={(e) => updateOption(q.id, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} className="h-9 text-sm" />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">Correct Answer</Label>
                      {q.type === "MCQ" ? (
                        <Select value={q.correctAnswer} onValueChange={(v) => updateQuestion(q.id, "correctAnswer", v)}>
                          <SelectTrigger className="h-10"><SelectValue placeholder="Select answer" /></SelectTrigger>
                          <SelectContent>
                            {q.options.map((_: string, oi: number) => (
                              <SelectItem key={oi} value={String.fromCharCode(65 + oi)}>{String.fromCharCode(65 + oi)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select value={q.correctAnswer} onValueChange={(v) => updateQuestion(q.id, "correctAnswer", v)}>
                          <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="True">True</SelectItem>
                            <SelectItem value="False">False</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))}
                {quiz.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No questions</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="radio" name="status" checked={form.status === "draft"} onChange={() => update("status", "draft")} className="accent-primary" />
              <span className="text-sm">Draft</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="status" checked={form.status === "published"} onChange={() => update("status", "published")} className="accent-primary" />
              <span className="text-sm">Published</span>
            </label>
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Lesson Note" : "Create Lesson Note"}
          </Button>
        </form>
      </FormSheet>
    </div>
  )
}
