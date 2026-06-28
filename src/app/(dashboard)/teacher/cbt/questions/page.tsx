"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, HelpCircle, Code, AlignLeft, CheckCircle } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"
import { useSession } from "next-auth/react"

const typeIcons: Record<string, any> = { mcq: HelpCircle, true_false: CheckCircle, theory: AlignLeft, coding: Code }
const typeColors: Record<string, string> = { mcq: "bg-blue-500/10 text-blue-500", true_false: "bg-green-500/10 text-green-500", theory: "bg-amber-500/10 text-amber-500", coding: "bg-purple-500/10 text-purple-500" }

export default function TeacherQuestionsPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [teacherId, setTeacherId] = useState("")
  const [myClassIds, setMyClassIds] = useState<string[]>([])
  const [mySubjectIds, setMySubjectIds] = useState<string[]>([])
  const [items, setItems] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterSubject, setFilterSubject] = useState("all")
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ type: "mcq", text: "", options: ["", "", "", ""], correctAnswer: "", points: 5, subjectId: "", classId: "" })

  // Resolve teacher identity and assigned classes/subjects
  useEffect(() => {
    if (!userId) return
    fetch("/api/staff?userId=" + userId)
      .then((r) => r.json())
      .then((staffData) => {
        const staffId = staffData?.id || ""
        setTeacherId(staffId)
        return fetch("/api/teacher-assignments?teacherId=" + staffId).then((r) => r.json())
      })
      .then((tas) => {
        const ta = Array.isArray(tas) ? tas[0] : null
        setMyClassIds(ta?.classIds || [])
        setMySubjectIds(ta?.subjectIds || [])
      })
      .catch(() => {})
  }, [userId])

  const fetchData = async () => {
    const [qRes, sRes, cRes] = await Promise.all([
      fetch("/api/questions?teacherId=" + teacherId),
      fetch("/api/subjects"),
      fetch("/api/classes"),
    ])
    setItems(await qRes.json())
    const allSubjects = await sRes.json()
    const allClasses = await cRes.json()
    // Restrict subject/class selectors to teacher's assigned ones
    setSubjects(mySubjectIds.length > 0 ? allSubjects.filter((s: any) => mySubjectIds.includes(s.id)) : allSubjects)
    setClasses(myClassIds.length > 0 ? allClasses.filter((c: any) => myClassIds.includes(c.id)) : allClasses)
    setLoading(false)
  }

  useEffect(() => {
    if (!teacherId) return
    fetchData()
  }, [teacherId, myClassIds, mySubjectIds])

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const openCreate = () => {
    setEditing(null)
    setForm({ type: "mcq", text: "", options: ["", "", "", ""], correctAnswer: "", points: 5, subjectId: "", classId: "" })
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      type: item.type, text: item.text, options: item.options || ["", "", "", ""],
      correctAnswer: item.correctAnswer || "", points: item.points,
      subjectId: item.subjectId || "", classId: item.classId || "",
    })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let body: any = { ...form, createdBy: teacherId }
    if (form.type === "true_false") body.options = ["True", "False"]
    if (form.type === "theory" || form.type === "coding") body = { type: form.type, text: form.text, points: form.points, subjectId: form.subjectId, classId: form.classId, createdBy: teacherId }
    const url = editing ? `/api/questions/${editing.id}` : "/api/questions"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) { toast.success(editing ? "Question updated" : "Question created"); setSheetOpen(false); fetchData() }
    else toast.error("Failed to save")
  }

  const handleDelete = async (item: any) => {
    const res = await fetch(`/api/questions/${item.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Question deleted"); fetchData() }
  }

  const updateOption = (idx: number, value: string) => {
    const opts = [...form.options]; opts[idx] = value; update("options", opts)
  }

  const filtered = items.filter((q) => {
    if (filterType !== "all" && q.type !== filterType) return false
    if (filterSubject !== "all" && q.subjectId !== filterSubject) return false
    if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "Unknown"

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Question Bank" description="Create and manage exam questions" actionLabel="Add Question" onAction={openCreate} />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 max-w-xs" />
        <Select value={filterType} onValueChange={(v) => { if (v) setFilterType(v) }}>
          <SelectTrigger className="h-10 w-full sm:w-[140px]"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="mcq">Multiple Choice</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
            <SelectItem value="theory">Theory</SelectItem>
            <SelectItem value="coding">Coding</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSubject} onValueChange={(v) => { if (v) setFilterSubject(v) }}>
          <SelectTrigger className="h-10 w-full sm:w-[160px]"><SelectValue placeholder="All subjects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No questions found" description={search || filterType !== "all" ? "Try different filters" : "Add your first question to the bank"} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const Icon = typeIcons[item.type] || HelpCircle
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`${typeColors[item.type]} text-[10px] px-2 py-0.5 border-0`}>
                              <Icon className="h-3 w-3 mr-1" />{(item.type || "mcq") === "true_false" ? "T/F" : (item.type || "mcq").toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">{getSubjectName(item.subjectId)}</Badge>
                            <span className="text-xs text-muted-foreground">{item.points} pts</span>
                          </div>
                          <p className="text-sm font-medium leading-snug line-clamp-2">{item.text}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
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

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Question" : "New Question"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={form.type} onValueChange={(v) => update("type", v)}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True / False</SelectItem>
                <SelectItem value="theory">Theory</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="text">Question Text</Label>
            <Textarea id="text" placeholder="Enter the question..." value={form.text} onChange={(e) => update("text", e.target.value)} className="min-h-[80px]" required />
          </div>
          {form.type !== "theory" && form.type !== "coding" && (
            <div className="space-y-2">
              <Label>Options</Label>
              {(form.type === "true_false" ? ["True", "False"] : [0, 1, 2, 3]).map((o, i) => {
                const val = form.type === "true_false" ? o : form.options[i]
                return (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correctAnswer" value={val} checked={form.correctAnswer === val} onChange={(e) => update("correctAnswer", e.target.value)} className="accent-primary" />
                    {form.type === "true_false" ? <span className="text-sm">{o}</span> : <Input value={form.options[i]} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} className="h-10 flex-1" />}
                  </div>
                )
              })}
            </div>
          )}
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="points">Points</Label>
            <Input id="points" type="number" min={1} max={100} value={form.points} onChange={(e) => update("points", parseInt(e.target.value) || 5)} className="h-12" />
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Question" : "Create Question"}
          </Button>
        </form>
      </FormSheet>

    </div>
  )
}