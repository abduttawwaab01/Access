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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, FileText, Sparkles, Search, X, Eye, EyeOff, CheckCircle2, Clock, HelpCircle, ChevronDown, ChevronRight, ScanLine } from "lucide-react"
import ImageToText from "@/components/ImageToText"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"
import { cn } from "@/lib/utils"

const teacherId = "1"
const teacherName = "Grace Hopper"

export default function LessonNotesPage() {
  const [items, setItems] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ title: "", subject: "", classId: "", week: "", term: "", session: "", content: "", resources: "", status: "draft" })
  const [quiz, setQuiz] = useState<any[]>([])
  const [quizOpen, setQuizOpen] = useState(true)
  const [ocrOpen, setOcrOpen] = useState(false)

  const fetchData = async () => {
    const [notesRes, classesRes] = await Promise.all([
      fetch(`/api/lesson-notes?teacherId=${teacherId}`),
      fetch("/api/classes"),
    ])
    setItems(await notesRes.json())
    setClasses(await classesRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

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

  const openCreate = () => {
    setEditing(null)
    setForm({ title: "", subject: "", classId: "", week: "", term: "", session: "", content: "", resources: "", status: "draft" })
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
    })
    setQuiz(item.quiz || [])
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = "/api/lesson-notes"
    const method = editing ? "PUT" : "POST"
    const payload = { ...form, week: Number(form.week), createdBy: teacherId, quiz }
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    if (res.ok) {
      toast.success(editing ? "Lesson note updated" : "Lesson note created")
      setSheetOpen(false)
      fetchData()
    } else toast.error("Failed to save")
  }

  const handleDelete = async (item: any) => {
    const res = await fetch(`/api/lesson-notes?id=${item.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Deleted"); fetchData() }
  }

  const handleAIGenerate = () => {
    const subjects = ["Mathematics", "English", "Science", "History", "Geography"]
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    update("content", `This lesson covers the fundamental concepts of ${randomSubject} for Week ${form.week || "1"}. Students will learn about key principles, engage in practical exercises, and complete assessment tasks to demonstrate their understanding.`)
    toast.success("AI-generated content added")
  }

  const filtered = items.filter((n) => {
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase())
    const matchesTab = tab === "all" || n.status === tab
    return matchesSearch && matchesTab
  })

  const getClassName = (id: string) => classes.find((c) => c.id === id)

  const statusBadge = (status: string) => {
    switch (status) {
      case "draft": return "bg-amber-500/15 text-amber-600"
      case "published": return "bg-emerald-500/15 text-emerald-600"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "draft": return <EyeOff className="h-3 w-3 mr-1" />
      case "published": return <Eye className="h-3 w-3 mr-1" />
      default: return null
    }
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Lesson Notes" description={`${items.length} total notes`} actionLabel="New Note" onAction={openCreate} />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 pl-9" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-muted-foreground" /></button>}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="published" className="flex-1">Published</TabsTrigger>
          <TabsTrigger value="draft" className="flex-1">Drafts</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No lesson notes" description={search ? "Try a different search" : "Create your first lesson note"} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{item.title}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                            <span>{item.subject}</span>
                            <span>Week {item.week}</span>
                            <span>{getClassName(item.classId)?.name}{getClassName(item.classId)?.arm ? ` ${getClassName(item.classId).arm}` : ""}</span>
                            <span>{item.term}</span>
                            {item.session && <span>{item.session}</span>}
                          </div>
                          {item.content && (
                            <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{item.content}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs mt-1.5">
                            <span className="text-muted-foreground/60">by {item.creatorName || teacherName}</span>
                            {item.approved && item.approverName && (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="h-3 w-3" /> Approved by {item.approverName}
                              </span>
                            )}
                            {item.approved === false && (
                              <span className="flex items-center gap-1 text-amber-600">
                                <Clock className="h-3 w-3" /> Pending approval
                              </span>
                            )}
                            {item.quiz && item.quiz.length > 0 && (
                              <span className="flex items-center gap-1 text-primary">
                                <HelpCircle className="h-3 w-3" /> Quiz: {item.quiz.length} question{item.quiz.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge className={statusBadge(item.status)}>
                          {statusIcon(item.status)}
                          {item.status}
                        </Badge>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Lesson Note" : "New Lesson Note"}>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[70dvh] pb-8">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Introduction to Algebra" className="h-12" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="e.g. Mathematics" className="h-12" required />
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
                <SelectItem value="2024/2025">2024/2025</SelectItem>
                <SelectItem value="2025/2026">2025/2026</SelectItem>
                <SelectItem value="2026/2027">2026/2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content</Label>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setOcrOpen(!ocrOpen)}>
                  <ScanLine className="h-3 w-3 mr-1" />
                  Extract from Image
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-xs text-primary" onClick={handleAIGenerate}>
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generate
                </Button>
              </div>
            </div>
            {ocrOpen && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">Picture to Text</span>
                  <button onClick={() => setOcrOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <ImageToText onUseText={(text) => { update("content", text); setOcrOpen(false) }} />
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
                {quiz.length > 0 && <Badge variant="secondary" className="text-xs">{quiz.length} question{quiz.length > 1 ? "s" : ""}</Badge>}
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); addQuestion() }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
              </Button>
            </button>
            {quizOpen && (
              <div className="space-y-3 pt-1">
                {quiz.map((q, qi) => (
                  <Card key={q.id} className="border p-3 space-y-2 shadow-none">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Question {qi + 1}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input value={q.questionText} onChange={(e) => updateQuestion(q.id, "questionText", e.target.value)} placeholder="Enter question text" className="h-10" />
                      <div className="grid grid-cols-2 gap-2">
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
                            <SelectTrigger className="h-10"><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                            <SelectContent>
                              {q.options.map((_: string, oi: number) => (
                                <SelectItem key={oi} value={String.fromCharCode(65 + oi)}>{String.fromCharCode(65 + oi)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Select value={q.correctAnswer} onValueChange={(v) => updateQuestion(q.id, "correctAnswer", v)}>
                            <SelectTrigger className="h-10"><SelectValue placeholder="Select answer" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="True">True</SelectItem>
                              <SelectItem value="False">False</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {quiz.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No questions added yet</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="radio" name="status" checked={form.status === "draft"} onChange={() => update("status", "draft")} className="accent-primary" />
              <span className="text-sm">Save as Draft</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="status" checked={form.status === "published"} onChange={() => update("status", "published")} className="accent-primary" />
              <span className="text-sm">Publish</span>
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
