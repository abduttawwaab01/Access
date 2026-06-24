"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2, HelpCircle, Code, AlignLeft, CheckCircle, Shuffle, Filter, Search, X } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import { ExamDownload } from "@/components/ExamDownload"
import Link from "next/link"
import { useParams } from "next/navigation"

const typeIcons: Record<string, any> = { mcq: HelpCircle, true_false: CheckCircle, theory: AlignLeft, coding: Code }
const PAGE_SIZE = 20

export default function ExamDetailPage() {
  const params = useParams()
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedQ, setSelectedQ] = useState("")
  const [customPoints, setCustomPoints] = useState(5)

  const [autoOpen, setAutoOpen] = useState(false)
  const [autoCount, setAutoCount] = useState(5)
  const [autoDifficulty, setAutoDifficulty] = useState("all")
  const [autoTopic, setAutoTopic] = useState("all")
  const [autopopulating, setAutopopulating] = useState(false)

  const [browseOpen, setBrowseOpen] = useState(false)
  const [bankQuestions, setBankQuestions] = useState<any[]>([])
  const [bankTopics, setBankTopics] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [browseDifficulty, setBrowseDifficulty] = useState("all")
  const [browseType, setBrowseType] = useState("all")
  const [browseTopic, setBrowseTopic] = useState("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bankPoints, setBankPoints] = useState<Record<string, number>>({})
  const [browsePage, setBrowsePage] = useState(1)

  const fetchData = async () => {
    const [examRes, allQRes, sRes] = await Promise.all([
      fetch(`/api/exams/${params.id}`),
      fetch("/api/questions"),
      fetch("/api/subjects"),
    ])
    const examData = await examRes.json()
    setExam(examData)
    const allQ = await allQRes.json()
    setAllQuestions(allQ)
    setSubjects(await sRes.json())
    if (examData.questions) {
      const qIds = examData.questions.map((q: any) => q.questionId)
      setQuestions(allQ.filter((q: any) => qIds.includes(q.id)))
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [params.id])

  const addQuestion = async () => {
    if (!selectedQ) return
    const currentQs = exam.questions || []
    if (currentQs.find((q: any) => q.questionId === selectedQ)) {
      toast.error("Question already in exam")
      return
    }
    const newQs = [...currentQs, { questionId: selectedQ, points: customPoints }]
    const res = await fetch(`/api/exams/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questions: newQs }) })
    if (res.ok) {
      toast.success("Question added")
      setAddOpen(false)
      setSelectedQ("")
      fetchData()
    }
  }

  const removeQuestion = async (questionId: string) => {
    const newQs = (exam.questions || []).filter((q: any) => q.questionId !== questionId)
    const res = await fetch(`/api/exams/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questions: newQs }) })
    if (res.ok) {
      toast.success("Question removed")
      fetchData()
    }
  }

  const loadBankQuestions = async () => {
    try {
      const res = await fetch(`/api/question-bank?classId=${exam.classId}&subjectId=${exam.subjectId}&approved=true`)
      const data = await res.json()
      const existingIds = new Set((exam.questions || []).map((q: any) => q.questionId))
      const filtered = data.filter((q: any) => !existingIds.has(q.id))
      setBankQuestions(filtered)
      const topics = [...new Set(filtered.map((q: any) => q.topic).filter(Boolean))] as string[]
      setBankTopics(topics)
    } catch {
      toast.error("Failed to load question bank")
    }
  }

  const openBrowse = async () => {
    await loadBankQuestions()
    setSelectedIds(new Set())
    setBankPoints({})
    setBrowsePage(1)
    setSearchQuery("")
    setBrowseDifficulty("all")
    setBrowseType("all")
    setBrowseTopic("all")
    setBrowseOpen(true)
  }

  const openAuto = async () => {
    await loadBankQuestions()
    setAutoCount(5)
    setAutoDifficulty("all")
    setAutoTopic("all")
    setAutoOpen(true)
  }

  const handleAutoPopulate = async () => {
    setAutopopulating(true)
    let pool = bankQuestions
    if (autoDifficulty !== "all") pool = pool.filter((q: any) => q.difficulty === autoDifficulty)
    if (autoTopic !== "all") pool = pool.filter((q: any) => q.topic === autoTopic)
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(autoCount, pool.length))
    if (selected.length === 0) { toast.error("No matching questions available"); setAutopopulating(false); return }
    const newQs = selected.map((q: any) => ({ questionId: q.id, points: q.points }))
    const currentQs = exam.questions || []
    const res = await fetch(`/api/exams/${params.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: [...currentQs, ...newQs] }),
    })
    if (res.ok) { toast.success(`${selected.length} questions added`); setAutoOpen(false); fetchData() }
    setAutopopulating(false)
  }

  const toggleSingle = (id: string) => {
    const newSet = new Set(selectedIds)
    const newPoints = { ...bankPoints }
    if (newSet.has(id)) { newSet.delete(id) }
    else {
      newSet.add(id)
      if (!(id in newPoints)) {
        const q = bankQuestions.find((q: any) => q.id === id)
        if (q) newPoints[id] = q.points
      }
    }
    setSelectedIds(newSet)
    setBankPoints(newPoints)
  }

  const toggleSelectAll = () => {
    const visible = filteredBank
    const allSelected = visible.every((q: any) => selectedIds.has(q.id))
    const newSet = new Set(selectedIds)
    const newPoints = { ...bankPoints }
    if (allSelected) {
      visible.forEach((q: any) => newSet.delete(q.id))
    } else {
      visible.forEach((q: any) => {
        newSet.add(q.id)
        if (!(q.id in newPoints)) newPoints[q.id] = q.points
      })
    }
    setSelectedIds(newSet)
    setBankPoints(newPoints)
  }

  const addSelectedFromBrowse = async () => {
    const newQs = [...selectedIds].map((id) => ({ questionId: id, points: bankPoints[id] || 5 }))
    const currentQs = exam.questions || []
    const res = await fetch(`/api/exams/${params.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: [...currentQs, ...newQs] }),
    })
    if (res.ok) { toast.success(`${newQs.length} questions added`); setBrowseOpen(false); fetchData() }
  }

  const autoMatchCount = bankQuestions.filter((q: any) => {
    if (autoDifficulty !== "all" && q.difficulty !== autoDifficulty) return false
    if (autoTopic !== "all" && q.topic !== autoTopic) return false
    return true
  }).length

  const filteredBank = useMemo(() => {
    let result = bankQuestions
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((item: any) => item.text.toLowerCase().includes(q))
    }
    if (browseType !== "all") result = result.filter((item: any) => item.type === browseType)
    if (browseDifficulty !== "all") result = result.filter((item: any) => item.difficulty === browseDifficulty)
    if (browseTopic !== "all") result = result.filter((item: any) => item.topic === browseTopic)
    return result
  }, [bankQuestions, searchQuery, browseType, browseDifficulty, browseTopic])

  const totalPages = Math.max(1, Math.ceil(filteredBank.length / PAGE_SIZE))
  const paginated = filteredBank.slice((browsePage - 1) * PAGE_SIZE, browsePage * PAGE_SIZE)

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "Unknown"

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-12", "h-32", "h-20", "h-20"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>
  if (!exam) return <div className="p-4 md:p-6"><EmptyState title="Exam not found" description="This exam may have been deleted" /></div>

  const availableQuestions = allQuestions.filter((q: any) => q.subjectId === exam.subjectId && q.approved && !(exam.questions || []).find((eq: any) => eq.questionId === q.id))

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link href="/admin/cbt/exams" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Exams
        </Link>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{exam.title}</h2>
                  <Badge className={exam.status === "published" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>{exam.status}</Badge>
                  <Badge variant="outline" className={exam.type === "entrance" ? "bg-red-500/15 text-red-600" : "bg-blue-500/15 text-blue-600"}>{exam.type === "entrance" ? "Entrance" : "Regular"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{exam.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{getSubjectName(exam.subjectId)}</span>
                  <span className={exam.type === "entrance" ? "text-red-600" : "text-blue-600"}>Type: {exam.type === "entrance" ? "Entrance Exam" : "Regular Exam"}</span>
                  <span>{exam.duration} min</span>
                  <span>{(exam.questions || []).length} questions</span>
                  <span>{(exam.questions || []).reduce((s: number, q: any) => s + (q.points || 0), 0)} pts</span>
                </div>
                <ExamDownload exam={exam} questions={(exam.questions || []).map((eq: any) => { const q = allQuestions.find((aq: any) => aq.id === eq.questionId); return q ? { ...q, points: eq.points } : null }).filter(Boolean)} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h3 className="font-semibold text-lg">Questions</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={openAuto} disabled={!exam.classId || !exam.subjectId}>
            <Shuffle className="h-4 w-4 mr-1" /> Auto-populate
          </Button>
          <Button size="sm" variant="outline" onClick={openBrowse} disabled={!exam.classId || !exam.subjectId}>
            <Filter className="h-4 w-4 mr-1" /> Browse Bank
          </Button>
          <Button size="sm" onClick={() => setAddOpen(!addOpen)} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {addOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4">
          <Card className="glass-card border-0">
            <CardContent className="p-4 space-y-3">
              <Label>Select Question</Label>
              <div className="flex gap-2">
                <Select value={selectedQ} onValueChange={(v) => { if (v) setSelectedQ(v) }}>
                  <SelectTrigger className="flex-1 h-10"><SelectValue placeholder="Choose a question..." /></SelectTrigger>
                  <SelectContent>
                    {availableQuestions.map((q: any) => (
                      <SelectItem key={q.id} value={q.id}>{q.text.substring(0, 60)}{q.text.length > 60 ? "..." : ""} ({q.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} value={customPoints} onChange={(e) => setCustomPoints(parseInt(e.target.value) || 5)} className="h-10 w-20" placeholder="Pts" />
                <Button size="sm" onClick={addQuestion} className="h-10"><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {questions.length === 0 ? (
        <EmptyState title="No questions yet" description="Add questions from the question bank to build this exam" />
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => {
            const Icon = typeIcons[q.type] || HelpCircle
            const points = (exam.questions || []).find((eq: any) => eq.questionId === q.id)?.points || q.points
            return (
              <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground shrink-0 w-5">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{q.text}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{(q.type || "mcq") === "true_false" ? "T/F" : (q.type || "mcq").toUpperCase()}</Badge>
                            <span className="text-xs text-muted-foreground">{points} pts</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-danger shrink-0" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <Dialog open={autoOpen} onOpenChange={(open) => { if (!open) setAutoOpen(false) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Auto-populate from Question Bank</DialogTitle>
            <DialogDescription>Randomly add approved questions matching your exam's class and subject.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Number of questions to add</Label>
              <Input type="number" min={1} max={50} value={autoCount} onChange={(e) => setAutoCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={autoDifficulty} onValueChange={(v) => { if (v) setAutoDifficulty(v) }}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Topic</Label>
                <Select value={autoTopic} onValueChange={(v) => { if (v) setAutoTopic(v) }}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {bankTopics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{autoMatchCount} question{autoMatchCount !== 1 ? "s" : ""} match your filters</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoOpen(false)}>Cancel</Button>
            <Button onClick={handleAutoPopulate} disabled={autopopulating || autoMatchCount === 0} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
              {autopopulating ? "Adding..." : `Add ${Math.min(autoCount, autoMatchCount)} Question${Math.min(autoCount, autoMatchCount) !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={browseOpen} onOpenChange={(open) => { if (!open) setBrowseOpen(false) }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Questions from Bank</DialogTitle>
            <DialogDescription>Search and select questions to add to this exam.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search questions..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setBrowsePage(1) }} className="pl-8" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="w-32">
              <Select value={browseType} onValueChange={(v) => { if (v) { setBrowseType(v); setBrowsePage(1) } }}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="true_false">T/F</SelectItem>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Select value={browseDifficulty} onValueChange={(v) => { if (v) { setBrowseDifficulty(v); setBrowsePage(1) } }}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-36">
              <Select value={browseTopic} onValueChange={(v) => { if (v) { setBrowseTopic(v); setBrowsePage(1) } }}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Topic" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {bankTopics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground ml-auto">{filteredBank.length} question{filteredBank.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="flex-1 overflow-auto min-h-0 border rounded-lg">
            {paginated.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No questions match your filters</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-xs">
                  <tr className="border-b">
                    <th className="w-10 p-2 text-left">
                      <Checkbox
                        checked={paginated.length > 0 && paginated.every((q: any) => selectedIds.has(q.id))}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="w-8 p-2 text-xs font-medium text-muted-foreground">#</th>
                    <th className="p-2 text-xs font-medium text-muted-foreground">Question</th>
                    <th className="w-16 p-2 text-xs font-medium text-muted-foreground">Type</th>
                    <th className="w-20 p-2 text-xs font-medium text-muted-foreground">Difficulty</th>
                    <th className="w-20 p-2 text-xs font-medium text-muted-foreground">Points</th>
                    <th className="w-24 p-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Topic</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((q: any, i: number) => {
                    const idx = (browsePage - 1) * PAGE_SIZE + i + 1
                    return (
                      <tr key={q.id} className={`border-b last:border-0 transition-colors ${selectedIds.has(q.id) ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                        <td className="p-2">
                          <Checkbox
                            checked={selectedIds.has(q.id)}
                            onCheckedChange={() => toggleSingle(q.id)}
                          />
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">{idx}</td>
                        <td className="p-2">
                          <span className="line-clamp-1 text-xs">{q.text}</span>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {q.type === "true_false" ? "T/F" : q.type?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            q.difficulty === "easy" ? "bg-green-500/10 text-green-600" :
                            q.difficulty === "hard" ? "bg-red-500/10 text-red-600" :
                            "bg-orange-500/10 text-orange-600"
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min={1}
                            value={bankPoints[q.id] ?? q.points}
                            onChange={(e) => setBankPoints((prev) => ({ ...prev, [q.id]: parseInt(e.target.value) || 1 }))}
                            className="h-7 w-16 text-xs"
                            onClick={() => { if (!selectedIds.has(q.id)) toggleSingle(q.id) }}
                          />
                        </td>
                        <td className="p-2 text-xs text-muted-foreground hidden sm:table-cell truncate max-w-24">{q.topic || "—"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">Page {browsePage} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={browsePage <= 1} onClick={() => setBrowsePage((p) => Math.max(1, p - 1))}>Prev</Button>
                <Button variant="outline" size="sm" disabled={browsePage >= totalPages} onClick={() => setBrowsePage((p) => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
          )}

          <DialogFooter showCloseButton>
            <Button onClick={addSelectedFromBrowse} disabled={selectedIds.size === 0} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
              Add Selected ({selectedIds.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
