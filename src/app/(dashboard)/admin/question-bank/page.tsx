"use client"

import { useState, useEffect, useRef } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Pencil, Trash2, Filter, CheckCircle, XCircle, HelpCircle, Code, AlignLeft, CheckSquare, X, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"

const typeIcons: Record<string, any> = { mcq: HelpCircle, true_false: CheckCircle, theory: AlignLeft, coding: Code }
const typeColors: Record<string, string> = {
  mcq: "bg-blue-500/10 text-blue-500",
  true_false: "bg-green-500/10 text-green-500",
  theory: "bg-amber-500/10 text-amber-500",
  coding: "bg-purple-500/10 text-purple-500",
}
const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-600",
  medium: "bg-orange-500/10 text-orange-600",
  hard: "bg-red-500/10 text-red-600",
}

const defaultForm = {
  type: "mcq" as string,
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
  const [items, setItems] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [allTopics, setAllTopics] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const [filterClass, setFilterClass] = useState("all")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterTopic, setFilterTopic] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 50
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const debouncedSearchRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedSearch = (value: string) => {
    if (debouncedSearchRef.current) clearTimeout(debouncedSearchRef.current)
    debouncedSearchRef.current = setTimeout(() => {
      setSearchQuery(value)
      setPage(1)
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) clearTimeout(debouncedSearchRef.current)
    }
  }, [])

  const fetchAll = async () => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("pageSize", String(pageSize))
    if (filterClass !== "all") params.set("classId", filterClass)
    if (filterSubject !== "all") params.set("subjectId", filterSubject)
    if (filterTopic !== "all") params.set("topic", filterTopic)
    if (filterDifficulty !== "all") params.set("difficulty", filterDifficulty)
    if (filterStatus === "approved") params.set("approved", "true")
    if (filterStatus === "pending") params.set("approved", "false")

    const [qRes, cRes, sRes, tRes, stRes] = await Promise.all([
      fetch(`/api/question-bank?${params}`),
      fetch("/api/classes"),
      fetch("/api/subjects"),
      fetch("/api/topics"),
      fetch("/api/staff"),
    ])
    const qData = await qRes.json()
    setItems(qData.data || [])
    setTotal(qData.total || 0)
    setTotalPages(qData.totalPages || 0)
    setClasses(await cRes.json())
    setSubjects(await sRes.json())
    setAllTopics(await tRes.json())
    setStaff(await stRes.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [page, filterClass, filterSubject, filterTopic, filterDifficulty, filterStatus, searchQuery])

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

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
    setSubmitting(true)
    let body: any = { ...form }
    if (form.type === "true_false") {
      body.options = ["True", "False"]
    }
    if (form.type === "theory" || form.type === "coding") {
      body = { ...form, options: undefined }
    }

    if (editing) {
      const res = await fetch("/api/question-bank", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", questionId: editing.id, data: body }),
      })
      if (res.ok) {
        toast.success("Question updated")
        setSheetOpen(false)
        fetchAll()
      } else {
        toast.error("Failed to update question")
      }
    } else {
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success("Question created")
        setSheetOpen(false)
        fetchAll()
      } else {
        toast.error("Failed to create question")
      }
    }
    setSubmitting(false)
  }

  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const handleDelete = (item: any) => setConfirmDelete(item)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/question-bank?id=${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Question deleted"); fetchAll() }
    setConfirmDelete(null)
  }

  const handleApprove = async (id: string) => {
    const res = await fetch("/api/question-bank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", questionId: id, approvedBy: "4" }),
    })
    if (res.ok) {
      toast.success("Question approved")
      fetchAll()
    }
  }

  const handleReject = async (id: string) => {
    const res = await fetch("/api/question-bank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", questionId: id }),
    })
    if (res.ok) {
      toast.success("Question rejected")
      fetchAll()
    }
  }

  const handleBulkApprove = async () => {
    if (selected.size === 0) return
    setBulkLoading(true)
    const res = await fetch("/api/question-bank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approveAll", ids: Array.from(selected), approvedBy: "4" }),
    })
    if (res.ok) {
      toast.success(`${selected.size} questions approved`)
      setSelected(new Set())
      fetchAll()
    } else {
      toast.error("Failed to approve selected")
    }
    setBulkLoading(false)
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((q) => q.id)))
    }
  }

  const updateOption = (idx: number, value: string) => {
    const opts = [...form.options]
    opts[idx] = value
    update("options", opts)
  }

  const getStaffName = (id: string) => {
    const s = staff.find((st) => st.id === id)
    return s ? `${s.firstName} ${s.lastName}` : "Unknown"
  }

  const totalCount = total
  const allSelected = items.length > 0 && selected.size === items.length

  const filterBarTopics = filterSubject === "all"
    ? allTopics
    : allTopics.filter((t) => t.subjectId === filterSubject)

  const formTopics = form.subjectId
    ? allTopics.filter((t) => t.subjectId === form.subjectId)
    : allTopics

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Question Bank" description="Manage and approve questions for exams" actionLabel="Add Question" onAction={openCreate} />
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Question" description={`Permanently delete this question? This cannot be undone.`} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {[
          { label: "Total Questions", value: totalCount, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass-card border-0">
              <CardContent className="p-3 md:p-4 text-center">
                <p className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] md:text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="glass-card border-0 mb-4">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Select value={filterClass} onValueChange={(v) => { if (v) { setFilterClass(v); setPage(1) } }}>
                <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterSubject} onValueChange={(v) => { if (v) { setFilterSubject(v); setFilterTopic("all"); setPage(1) } }}>
                <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterTopic} onValueChange={(v) => { if (v) { setFilterTopic(v); setPage(1) } }}>
                <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Topic" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {filterBarTopics.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={(v) => { if (v) { setFilterDifficulty(v); setPage(1) } }}>
                <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(v) => { if (v) { setFilterStatus(v); setPage(1) } }}>
                <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </CardContent>
      </Card>

      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3"
        >
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          <Button size="sm" className="sm:ml-auto h-8 animated-gradient border-0 text-white shadow-lg shadow-primary/25" onClick={handleBulkApprove} disabled={bulkLoading}>
            {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
            Approve Selected
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(new Set())}>
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No questions found" description={filterClass !== "all" || filterSubject !== "all" ? "Try different filters" : "Add your first question to the bank"} />
      ) : (
        <div className="space-y-2">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 text-xs font-medium text-muted-foreground">
            <div className="w-10 shrink-0">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="accent-primary" />
            </div>
            <div className="w-[30%] shrink-0">Question</div>
            <div className="w-[10%] shrink-0">Type</div>
            <div className="w-[10%] shrink-0">Subject</div>
            <div className="w-[10%] shrink-0">Difficulty</div>
            <div className="w-[8%] shrink-0 text-center">Points</div>
            <div className="w-[8%] shrink-0 text-center">Status</div>
            <div className="w-[14%] shrink-0">Created By</div>
            <div className="w-[10%] shrink-0 text-right">Actions</div>
          </div>
          <AnimatePresence>
            {items.map((item: any, i: number) => {
              const Icon = typeIcons[item.type] || HelpCircle
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className={`glass-card border-0 ${selected.has(item.id) ? "ring-1 ring-primary" : ""}`}>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={selected.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="accent-primary"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex md:hidden items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline" className={`${typeColors[item.type]} text-[10px] px-2 py-0.5 border-0`}>
                              <Icon className="h-3 w-3 mr-1" />
                              {item.type === "true_false" ? "T/F" : (item.type || "mcq").toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                              {item.subjectName}
                            </Badge>
                            <Badge variant="outline" className={`${difficultyColors[item.difficulty]} text-[10px] px-2 py-0.5 border-0 capitalize`}>
                              {item.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.points} pts</span>
                          </div>
                          <p className="text-sm font-medium leading-snug line-clamp-2">{item.text}</p>
                          <div className="hidden md:flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {item.className && <span>{item.className}</span>}
                            {item.topic && <><span>&middot;</span><span>{item.topic}</span></>}
                          </div>
                          <div className="flex items-center gap-2 mt-2 md:hidden">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0 ${item.approved ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"} border-0`}>
                              {item.approved ? "Approved" : "Pending"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{getStaffName(item.createdBy)}</span>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 shrink-0 w-[60%] justify-end">
                          <div className="w-[10%] text-center">
                            <Badge variant="outline" className={`${typeColors[item.type]} text-[10px] px-2 py-0.5 border-0`}>
                              <Icon className="h-3 w-3 mr-1" />
                              {item.type === "true_false" ? "T/F" : (item.type || "mcq").toUpperCase()}
                            </Badge>
                          </div>
                          <div className="w-[10%] text-xs text-muted-foreground">{item.subjectName}</div>
                          <div className="w-[10%]">
                            <Badge variant="outline" className={`${difficultyColors[item.difficulty]} text-[10px] px-2 py-0.5 border-0 capitalize`}>
                              {item.difficulty}
                            </Badge>
                          </div>
                          <div className="w-[8%] text-center text-xs font-medium">{item.points}</div>
                          <div className="w-[8%] flex justify-center">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border-0 ${item.approved ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"}`}>
                              {item.approved ? "Approved" : "Pending"}
                            </Badge>
                          </div>
                          <div className="w-[14%] text-xs text-muted-foreground truncate">{getStaffName(item.createdBy)}</div>
                          <div className="w-[10%] flex items-center justify-end gap-0.5">
                            {!item.approved && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleApprove(item.id)} title="Approve">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleReject(item.id)} title="Reject">
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(item)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex md:hidden items-center gap-1 shrink-0">
                          {!item.approved && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleApprove(item.id)}>
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {!item.approved && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleReject(item.id)}>
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(item)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Page {page} of {totalPages} ({total} total)
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Question" : "New Question"}>
        <form onSubmit={handleSubmit} className="space-y-4 pb-8">
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
          {(form.type === "mcq" || form.type === "true_false") && (
            <div className="space-y-2">
              <Label>Options</Label>
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
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(v) => update("difficulty", v)}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="classId">Class</Label>
              <Select value={form.classId} onValueChange={(v) => update("classId", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjectId">Subject</Label>
              <Select value={form.subjectId} onValueChange={(v) => { update("subjectId", v); update("topic", "") }}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select value={form.topic} onValueChange={(v) => update("topic", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {formTopics.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input id="points" type="number" min={1} max={100} value={form.points} onChange={(e) => update("points", parseInt(e.target.value) || 5)} className="h-12" />
            </div>
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {editing ? "Update Question" : "Create Question"}
          </Button>
        </form>
      </FormSheet>
    </div>
  )
}
