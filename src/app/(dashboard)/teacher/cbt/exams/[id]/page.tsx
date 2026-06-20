"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, HelpCircle, Code, AlignLeft, CheckCircle } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import { ExamDownload } from "@/components/ExamDownload"
import Link from "next/link"
import { useParams } from "next/navigation"

const typeIcons: Record<string, any> = { mcq: HelpCircle, true_false: CheckCircle, theory: AlignLeft, coding: Code }

export default function TeacherExamDetailPage() {
  const params = useParams()
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedQ, setSelectedQ] = useState("")
  const [customPoints, setCustomPoints] = useState(5)

  const fetchData = async () => {
    const [examRes, allQRes, sRes] = await Promise.all([
      fetch(`/api/exams/${params.id}`), fetch("/api/questions"), fetch("/api/subjects"),
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
    if (currentQs.find((q: any) => q.questionId === selectedQ)) { toast.error("Already in exam"); return }
    const newQs = [...currentQs, { questionId: selectedQ, points: customPoints }]
    const res = await fetch(`/api/exams/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questions: newQs }) })
    if (res.ok) { toast.success("Question added"); setAddOpen(false); setSelectedQ(""); fetchData() }
  }

  const removeQuestion = async (questionId: string) => {
    const newQs = (exam.questions || []).filter((q: any) => q.questionId !== questionId)
    await fetch(`/api/exams/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questions: newQs }) })
    toast.success("Removed"); fetchData()
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-12", "h-32", "h-20", "h-20"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>
  if (!exam) return <div className="p-4 md:p-6"><EmptyState title="Not found" /></div>

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "Unknown"

  const availableQuestions = allQuestions.filter((q: any) => q.subjectId === exam.subjectId && q.approved && !(exam.questions || []).find((eq: any) => eq.questionId === q.id))

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link href="/teacher/cbt/exams" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{exam.title}</h2>
              <Badge className={exam.status === "published" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>{exam.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{exam.description}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span>{getSubjectName(exam.subjectId)}</span>
              <span>{exam.duration} min</span>
              <span>{(exam.questions || []).length} questions</span>
              <span>{(exam.questions || []).reduce((s: number, q: any) => s + (q.points || 0), 0)} pts</span>
            </div>
            <ExamDownload exam={exam} questions={(exam.questions || []).map((eq: any) => { const q = allQuestions.find((aq: any) => aq.id === eq.questionId); return q ? { ...q, points: eq.points } : null }).filter(Boolean)} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Questions</h3>
        <Button size="sm" onClick={() => setAddOpen(!addOpen)} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4 mr-1" /> Add Question
        </Button>
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
                <Input type="number" min={1} value={customPoints} onChange={(e) => setCustomPoints(parseInt(e.target.value) || 5)} className="h-10 w-20" />
                <Button size="sm" onClick={addQuestion} className="h-10"><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {questions.length === 0 ? (
        <EmptyState title="No questions" description="Add questions from the bank" />
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => {
            const pts = (exam.questions || []).find((eq: any) => eq.questionId === q.id)?.points || q.points
            return (
              <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{q.text}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px]">{q.type === "true_false" ? "T/F" : q.type.toUpperCase()}</Badge>
                            <span className="text-xs text-muted-foreground">{pts} pts</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => removeQuestion(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
