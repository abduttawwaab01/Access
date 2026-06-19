"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, User } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

const typeLabels: Record<string, string> = { mcq: "Multiple Choice", true_false: "True/False", theory: "Theory", coding: "Coding" }

export default function SessionDetailPage() {
  const params = useParams()
  const [session, setSession] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [exam, setExam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState("")

  const fetchData = async () => {
    const sRes = await fetch(`/api/exam-sessions/${params.id}`)
    const sData = await sRes.json()
    setSession(sData)
    if (sData.examId) {
      const eRes = await fetch(`/api/exams/${sData.examId}`)
      const eData = await eRes.json()
      setExam(eData)
      if (eData.questions) {
        const qIds = eData.questions.map((q: any) => q.questionId)
        const qRes = await fetch("/api/questions")
        const allQ = await qRes.json()
        setQuestions(allQ.filter((q: any) => qIds.includes(q.id)))
        const initScores: Record<string, number> = {}
        sData.answers?.forEach((a: any) => { initScores[a.questionId] = a.score ?? 0 })
        setScores(initScores)
      }
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [params.id])

  const getQuestionPoints = (qId: string) => {
    const eq = exam?.questions?.find((q: any) => q.questionId === qId)
    return eq?.points || 0
  }

  const autoGrade = (q: any, answer: string) => {
    if ((q.type === "mcq" || q.type === "true_false") && q.correctAnswer) {
      return answer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ? getQuestionPoints(q.id) : 0
    }
    return undefined
  }

  const handleScoreChange = (qId: string, val: number) => {
    const maxPts = getQuestionPoints(qId)
    setScores((prev) => ({ ...prev, [qId]: Math.min(val, maxPts) }))
  }

  const handleSubmitGrade = async () => {
    const totalPoints = Object.values(scores).reduce((s, v) => s + (v || 0), 0)
    const maxPoints = exam?.questions?.reduce((s: number, q: any) => s + (q.points || 0), 0) || 0

    const res = await fetch(`/api/exam-sessions/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalScore: totalPoints,
        maxScore: maxPoints,
        answers: session.answers.map((a: any) => ({ ...a, score: scores[a.questionId] ?? a.score })),
        status: "completed",
      }),
    })
    if (res.ok) {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: params.id,
          totalScore: totalPoints,
          maxScore: maxPoints,
          feedback,
          gradedAt: new Date().toISOString(),
          status: "graded",
        }),
      })
      toast.success("Grading saved")
      fetchData()
    } else {
      toast.error("Failed to save")
    }
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-12", "h-20", "h-32", "h-32"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>
  if (!session) return <div className="p-4 md:p-6"><EmptyState title="Session not found" /></div>

  const totalPoints = Object.values(scores).reduce((s, v) => s + (v || 0), 0)
  const maxPoints = exam?.questions?.reduce((s: number, q: any) => s + (q.points || 0), 0) || 0

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link href="/admin/cbt/sessions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Sessions
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{session.studentName}</h2>
              <Badge className={
                session.status === "completed" ? "bg-green-500/15 text-green-600" :
                session.status === "active" ? "bg-blue-500/15 text-blue-600" : "bg-amber-500/15 text-amber-600"
              }>{session.status}</Badge>
              {session.flagged && <Badge variant="outline" className="text-danger border-danger/30"><AlertTriangle className="h-3 w-3 mr-1" />Flagged</Badge>}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              {exam && <span>{exam.title}</span>}
              {session.startTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(session.startTime).toLocaleString()}</span>}
              {session.tabSwitches > 0 && <span className="text-danger">{session.tabSwitches} tab switches</span>}
            </div>
            {session.status === "completed" && (
              <div className="mt-2 text-lg font-bold">{totalPoints} / {maxPoints} ({maxPoints > 0 ? Math.round(totalPoints / maxPoints * 100) : 0}%)</div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <h3 className="font-semibold">Student Answers</h3>
        {session.answers?.map((ans: any, i: number) => {
          const q = questions.find((q) => q.id === ans.questionId)
          if (!q) return null
          const autoScore = autoGrade(q, ans.answer)
          const isAutoGraded = autoScore !== undefined
          const maxPts = getQuestionPoints(q.id)
          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">Q{i + 1}</span>
                      <Badge variant="outline" className="text-[10px]">{typeLabels[q.type] || q.type}</Badge>
                      <span className="text-xs text-muted-foreground">{maxPts} pts</span>
                    </div>
                    {isAutoGraded && <Badge className="bg-green-500/10 text-green-600 border-0 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Auto-graded</Badge>}
                  </div>
                  <p className="text-sm font-medium">{q.text}</p>
                  {q.type === "mcq" && q.options && (
                    <div className="flex flex-wrap gap-1">
                      {q.options.map((o: string, oi: number) => (
                        <span key={oi} className={`text-xs px-2 py-0.5 rounded-full ${o === ans.answer ? (o === q.correctAnswer ? "bg-green-500/20 text-green-600 font-medium" : "bg-red-500/20 text-red-600 font-medium") : o === q.correctAnswer ? "bg-green-500/10 text-green-600" : "bg-muted"}`}>{o}</span>
                      ))}
                    </div>
                  )}
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Answer:</p>
                    <pre className="text-sm whitespace-pre-wrap font-sans">{ans.answer || "(No answer)"}</pre>
                  </div>
                  {isAutoGraded ? (
                    <div className="text-sm font-medium">{autoScore} / {maxPts} pts</div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Score:</Label>
                      <Input type="number" min={0} max={maxPts} value={scores[ans.questionId] ?? 0} onChange={(e) => handleScoreChange(ans.questionId, parseInt(e.target.value) || 0)} className="h-8 w-20 text-sm" />
                      <span className="text-xs text-muted-foreground">/ {maxPts}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="space-y-3 mb-6">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Provide feedback to the student..." className="min-h-[80px]" />
      </div>

      <div className="flex items-center justify-between mb-20">
        <div className="text-lg font-bold">Total: {totalPoints} / {maxPoints}</div>
        <Button onClick={handleSubmitGrade} size="lg" className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
          <CheckCircle className="h-4 w-4 mr-2" /> Save Grading
        </Button>
      </div>
    </div>
  )
}
