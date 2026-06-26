"use client"

import { useState, useEffect, useMemo } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, HelpCircle, AlignLeft, CheckCircle, Search } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { generateQuestion } from "@/lib/content-generator"
import { useSession } from "next-auth/react"

const typeIcons: Record<string, any> = { mcq: HelpCircle, true_false: CheckCircle, theory: AlignLeft }
const typeColors: Record<string, string> = {
  mcq: "bg-blue-500/10 text-blue-500",
  true_false: "bg-green-500/10 text-green-500",
  theory: "bg-amber-500/10 text-amber-500",
}
const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500",
  medium: "bg-amber-500/10 text-amber-500",
  hard: "bg-red-500/10 text-red-500",
}
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  approved: "bg-emerald-500/10 text-emerald-500",
}

const difficulties = ["easy", "medium", "hard"]
const statuses = ["pending", "approved"]

interface FormState {
  type: string
  text: string
  options: string[]
  correctAnswer: string
  points: number
  classId: string
  subjectId: string
  topic: string
  difficulty: string
}

const defaultForm: FormState = {
  type: "mcq",
  text: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 5,
  classId: "",
  subjectId: "",
  topic: "",
  difficulty: "medium",
}

export default function QuestionBankPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [teacherId, setTeacherId] = useState("")
  const teacherName = (session?.user as any)?.name || ""
  const [questions, setQuestions] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [allTopics, setAllTopics] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [filterClass, setFilterClass] = useState("all")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterTopic, setFilterTopic] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const assignedClassIds = useMemo(() => [...new Set(assignments.map((a: any) => a.classId))], [assignments])
  const assignedSubjectIds = useMemo(() => [...new Set(assignments.map((a: any) => a.subjectId))], [assignments])
  const assignedClasses = useMemo(() => classes.filter((c) => assignedClassIds.includes(c.id)), [classes, assignedClassIds])
  const assignedSubjects = useMemo(() => subjects.filter((s) => assignedSubjectIds.includes(s.id)), [subjects, assignedSubjectIds])

  const fetchData = async () => {
    const [qRes, aRes, cRes, sRes, tRes] = await Promise.all([
      fetch(`/api/question-bank?teacherId=${teacherId}`),
      fetch("/api/teacher-assignments"),
      fetch("/api/classes"),
      fetch("/api/subjects"),
      fetch("/api/topics"),
    ])
    setQuestions(await qRes.json())
    setAssignments(await aRes.json())
    setClasses(await cRes.json())
    setSubjects(await sRes.json())
    setAllTopics(await tRes.json())
    setLoading(false)
  }

  useEffect(() => {
    if (!userId) return
    fetch("/api/staff?userId=" + userId)
      .then((r) => r.json())
      .then((staffData) => setTeacherId(staffData?.id || ""))
      .catch(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    if (!teacherId) return
    fetchData().catch(() => setLoading(false))
  }, [teacherId])

  const update = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }))

  const handleGenerateQuestion = () => {
    if (!form.subjectId || !form.classId) { toast.error("Set subject and class first"); return }
    setGenerating(true)
    try {
      const subjName = subjects.find((s: any) => s.id === form.subjectId)?.name || ""
      const className = classes.find((c: any) => c.id === form.classId)?.name || ""
      const q = generateQuestion(subjName, className, form.topic || subjName, form.type || "mcq")
      if (!q) { toast.error("Failed to generate question"); return }
      update("text", q.questionText)
      if (q.options) update("options", q.options)
      if (q.correctAnswer) update("correctAnswer", q.correctAnswer)
      toast.success("Question generated")
    } catch { toast.error("Failed to generate question") }
    setGenerating(false)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      type: item.type,
      text: item.text,
      options: item.options || ["", "", "", ""],
      correctAnswer: item.correctAnswer || "",
      points: item.points,
      classId: item.classId || "",
      subjectId: item.subjectId || "",
      topic: item.topic || "",
      difficulty: item.difficulty || "medium",
    })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body: any = { ...form, teacherId: teacherId, teacherName: teacherName || teacherId }
    if (form.type === "true_false") body.options = ["True", "False"]
    if (form.type === "theory") delete body.options

    const url = editing ? "/api/question-bank" : "/api/question-bank"
    const method = "POST"
    const payload = editing ? { ...body, id: editing.id, action: "update" } : body

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    if (res.ok) {
      toast.success(editing ? "Question updated" : "Question created")
      setSheetOpen(false)
      fetchData()
    } else {
      toast.error("Failed to save question")
    }
  }

  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const handleDelete = (item: any) => setConfirmDelete(item)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/question-bank?id=${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Question deleted"); fetchData() }
    else { toast.error("Failed to delete question") }
    setConfirmDelete(null)
  }

  const updateOption = (idx: number, value: string) => {
    const opts = [...form.options]
    opts[idx] = value
    update("options", opts)
  }

  const filtered = questions.filter((q) => {
    if (filterClass !== "all" && q.classId !== filterClass) return false
    if (filterSubject !== "all" && q.subjectId !== filterSubject) return false
    if (filterTopic && !q.topic?.toLowerCase().includes(filterTopic.toLowerCase())) return false
    if (filterDifficulty !== "all" && q.difficulty !== filterDifficulty) return false
    if (filterStatus === "approved" && !q.approved) return false
    if (filterStatus === "pending" && q.approved) return false
    return true
  })

  const canEdit = (q: any) => q.teacherId === teacherId && q.status !== "approved"

  const getClassName = (id: string) => classes.find((c) => c.id === id)
  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || id

  const filterBar = (
    <div className="mb-4 flex flex-wrap gap-2">
      <div className="relative flex-1 min-w-0 sm:min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search topic..."
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
          className="h-10 pl-9"
        />
      </div>
      <Select value={filterClass} onValueChange={(v) => { if (v) setFilterClass(v) }}>
        <SelectTrigger className="h-10 w-full sm:w-[150px]"><SelectValue placeholder="All classes" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Classes</SelectItem>
          {assignedClasses.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filterSubject} onValueChange={(v) => { if (v) setFilterSubject(v) }}>
        <SelectTrigger className="h-10 w-full sm:w-[150px]"><SelectValue placeholder="All subjects" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subjects</SelectItem>
          {assignedSubjects.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filterDifficulty} onValueChange={(v) => { if (v) setFilterDifficulty(v) }}>
        <SelectTrigger className="h-10 w-full sm:w-[130px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {difficulties.map((d) => (
            <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filterStatus} onValueChange={(v) => { if (v) setFilterStatus(v) }}>
        <SelectTrigger className="h-10 w-full sm:w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="Question Bank"
        description={`${questions.length} questions`}
        actionLabel="Add Question"
        onAction={openCreate}
      />
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Question" description={`Permanently delete this question? This cannot be undone.`} />
      {filterBar}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No questions found"
          description={filterClass !== "all" || filterSubject !== "all" || filterTopic ? "Try different filters" : "Add your first question to the bank"}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const Icon = typeIcons[item.type] || HelpCircle
              const isOwner = item.teacherId === teacherId
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <Badge variant="outline" className={`${typeColors[item.type]} text-[10px] px-2 py-0.5 border-0`}>
                              <Icon className="h-3 w-3 mr-1" />
                              {(item.type || "mcq") === "true_false" ? "T/F" : (item.type || "mcq").toUpperCase()}
                            </Badge>
                            {item.topic && (
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-0 bg-muted/50">
                                {item.topic}
                              </Badge>
                            )}
                            <Badge variant="outline" className={`${difficultyColors[item.difficulty] || ""} text-[10px] px-2 py-0.5 border-0 capitalize`}>
                              {item.difficulty || "medium"}
                            </Badge>
                            <Badge variant="outline" className={`${statusColors[item.status] || ""} text-[10px] px-2 py-0.5 border-0 capitalize`}>
                              {item.status || "pending"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.points} pts</span>
                          </div>
                          <p className="text-sm font-medium leading-snug line-clamp-2">{item.text}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                            <span>{item.subjectName || getSubjectName(item.subjectId)}</span>
                            <span>{item.className || getClassName(item.classId)?.name}{item.className ? "" : getClassName(item.classId)?.arm ? ` ${getClassName(item.classId).arm}` : ""}</span>
                            {!isOwner && item.teacherName && (
                              <span>by {item.teacherName}</span>
                            )}
                          </div>
                        </div>
                        {canEdit(item) && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Sheet */}
      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Question" : "New Question"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={form.type} onValueChange={(v) => { if (v) update("type", v) }}>
                <SelectTrigger className="h-12 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True / False</SelectItem>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="text">Question Text</Label>
                <Button type="button" variant="ghost" size="sm" className="text-xs text-primary" onClick={handleGenerateQuestion} disabled={generating}>
                  <HelpCircle className="h-3 w-3 mr-1" />{generating ? "Generating..." : "Generate"}
                </Button>
              </div>
              <Textarea
                id="text"
                placeholder="Enter the question..."
                value={form.text}
                onChange={(e) => update("text", e.target.value)}
                className="min-h-[80px]"
                required
              />
            </div>

            {form.type !== "theory" && form.type !== "coding" && (
              <div className="space-y-2">
                <Label>Options {form.type === "mcq" && <span className="text-muted-foreground font-normal">(select the correct answer)</span>}</Label>
                {(form.type === "true_false" ? ["True", "False"] : [0, 1, 2, 3]).map((o, i) => {
                  const val = form.type === "true_false" ? o : form.options[i]
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={val}
                        checked={form.correctAnswer === val}
                        onChange={(e) => update("correctAnswer", e.target.value)}
                        className="accent-primary shrink-0"
                      />
                      {form.type === "true_false" ? (
                        <span className="text-sm">{o}</span>
                      ) : (
                        <Input
                          value={form.options[i]}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="h-10 flex-1"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {(form.type === "theory" || form.type === "coding") && (
              <div className="space-y-2">
                <Label htmlFor="expectedAnswer">Expected Answer (for grading reference)</Label>
                <Textarea id="expectedAnswer" placeholder="Enter the expected answer..." value={form.correctAnswer || ""} onChange={(e) => update("correctAnswer", e.target.value)} className="min-h-[80px]" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={form.classId} onValueChange={(v) => { if (v) update("classId", v) }}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {assignedClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={form.subjectId} onValueChange={(v) => { if (v) update("subjectId", v) }}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {assignedSubjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select value={form.topic} onValueChange={(v) => { if (v) update("topic", v) }}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent>
                  {allTopics.map((t: any) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => { if (v) update("difficulty", v) }}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {difficulties.map((d) => (
                      <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min={1}
                max={100}
                value={form.points}
                onChange={(e) => update("points", parseInt(e.target.value) || 5)}
                className="h-12"
              />
            </div>

            <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
              {editing ? "Update Question" : "Create Question"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
