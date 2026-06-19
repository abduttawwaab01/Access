"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Plus, Trash2, HelpCircle, Code, AlignLeft, CheckCircle, Copy } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

const typeIcons: Record<string, any> = { mcq: HelpCircle, true_false: CheckCircle, theory: AlignLeft, coding: Code }

export default function ExamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedQ, setSelectedQ] = useState("")
  const [customPoints, setCustomPoints] = useState(5)

  const fetchData = async () => {
    const [examRes, qRes, allQRes, sRes] = await Promise.all([
      fetch(`/api/exams/${params.id}`),
      fetch("/api/questions"),
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

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "Unknown"

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-12", "h-32", "h-20", "h-20"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>
  if (!exam) return <div className="p-4 md:p-6"><EmptyState title="Exam not found" description="This exam may have been deleted" /></div>

  const availableQuestions = allQuestions.filter((q: any) => !(exam.questions || []).find((eq: any) => eq.questionId === q.id))

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link href="/admin/cbt/exams" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Exams
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{exam.title}</h2>
              <Badge className={exam.status === "published" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>{exam.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{exam.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{getSubjectName(exam.subjectId)}</span>
              <span>{exam.duration} min</span>
              <span>{(exam.questions || []).length} questions</span>
              <span>{(exam.questions || []).reduce((s: number, q: any) => s + (q.points || 0), 0)} pts</span>
            </div>
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
                <select value={selectedQ} onChange={(e) => setSelectedQ(e.target.value)} className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Choose a question...</option>
                  {availableQuestions.map((q: any) => (
                    <option key={q.id} value={q.id}>{q.text.substring(0, 60)}{q.text.length > 60 ? "..." : ""} ({q.type})</option>
                  ))}
                </select>
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
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{q.type === "true_false" ? "T/F" : q.type.toUpperCase()}</Badge>
                            <span className="text-xs text-muted-foreground">{points} pts</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger shrink-0" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
