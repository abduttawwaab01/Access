"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { AlertTriangle, Clock, ChevronLeft, ChevronRight, Send, AlertCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useAntiCheat } from "@/hooks/useAntiCheat"
import { ExamCalculator } from "@/components/ExamCalculator"

export default function ExamTakePage() {
  const params = useParams()
  const router = useRouter()
  const [exam, setExam] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [tabWarnings, setTabWarnings] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [fullscreenWarned, setFullscreenWarned] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const enterFsRef = useRef<(() => Promise<void>) | null>(null)

  const handleTabSwitch = useCallback((count: number) => {
    setTabWarnings(count)
    if (!exam) return
    const limit = exam.tabSwitchLimit ?? 3
    if (limit === 0) return
    if (count === 1) toast.warning("Please do not switch tabs during the exam", { duration: 3000 })
    if (count >= limit) {
      toast.error("Multiple tab switches detected! Exam will be submitted.", { duration: 5000 })
      handleSubmit(true)
    }
  }, [exam])

  const handleFullscreenExit = useCallback(() => {
    if (!exam?.requireFullscreen) return
    if (!fullscreenWarned) {
      setFullscreenWarned(true)
      toast.warning("Please stay in fullscreen mode during the exam", { duration: 4000 })
    }
    enterFsRef.current?.()
  }, [exam, fullscreenWarned])

  const { enterFullscreen } = useAntiCheat({
    onTabSwitch: handleTabSwitch,
    onFullscreenExit: handleFullscreenExit,
    enabled: !submitted,
    allowCopyPaste: exam?.allowCopyPaste ?? false,
  })
  enterFsRef.current = enterFullscreen

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sRes = await fetch(`/api/exam-sessions/${params.id}`)
        const sData = await sRes.json()
        setSession(sData)
        if (sData.status === "completed") {
          setSubmitted(true)
          setResult(sData)
        }
        if (sData.examId) {
          const eRes = await fetch(`/api/exams/${sData.examId}`)
          const eData = await eRes.json()
          setExam(eData)
          setTimeLeft(eData.duration * 60)

          if (eData.questions) {
            const qRes = await fetch("/api/questions")
            const allQ = await qRes.json()
            const qIds = eData.questions.map((q: any) => q.questionId)
            let qs = allQ.filter((q: any) => qIds.includes(q.id))
            if (eData.shuffleQuestions) qs = qs.sort(() => Math.random() - 0.5)
            setQuestions(qs)
          }

          const ansMap: Record<string, string> = {}
          sData.answers?.forEach((a: any) => { ansMap[a.questionId] = a.answer })
          setAnswers(ansMap)

          if (eData.requireFullscreen !== false) enterFullscreen()
        }
      } catch {}
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  useEffect(() => {
    if (submitted || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleSubmit(false); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [submitted])

  const handleSubmit = async (flagged: boolean = false) => {
    if (submitting || submitted) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const answerArray = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || null,
    }))

    const maxScore = exam?.questions?.reduce((s: number, q: any) => s + (q.points || 0), 0) || 0
    let totalScore = 0
    const gradedAnswers = answerArray.map((a) => {
      const q = questions.find((qq) => qq.id === a.questionId)
      if (q && (q.type === "mcq" || q.type === "true_false") && q.correctAnswer) {
        const correct = a.answer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        const pts = correct ? (exam.questions.find((eq: any) => eq.questionId === q.id)?.points || q.points) : 0
        if (correct) totalScore += pts
        return { ...a, score: pts }
      }
      return { ...a, score: 0 }
    })

    try {
      await fetch(`/api/exam-sessions/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: gradedAnswers,
          totalScore,
          maxScore,
          endTime: new Date().toISOString(),
          status: "completed",
          tabSwitches: tabWarnings,
          flagged,
        }),
      })
      setSubmitted(true)
      setResult({ totalScore, maxScore, answers: gradedAnswers, flagged })
    } catch {}
    setSubmitting(false)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const currentQ = questions[currentIdx]
  const answeredCount = Object.values(answers).filter((a) => a !== null && a !== "").length

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="space-y-4 w-full max-w-lg p-4">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
      </div>
    </div>
  )

  if (submitted && result) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <Send className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">Exam Submitted</h1>
          {exam?.showResults ? (
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">{result.totalScore} / {result.maxScore}</p>
              <p className="text-lg text-muted-foreground">{result.maxScore > 0 ? Math.round(result.totalScore / result.maxScore * 100) : 0}% Score</p>
              <Progress value={result.maxScore > 0 ? (result.totalScore / result.maxScore) * 100 : 0} className="h-3" />
              {result.flagged && (
                <div className="flex items-center justify-center gap-2 text-amber-500 mt-2">
                  <AlertTriangle className="h-4 w-4" /> Flagged for review
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Your answers have been recorded. Results will be available later.</p>
          )}
          <Button variant="outline" onClick={() => router.push("/exam-take")} className="mt-4">Back to Exam Portal</Button>
        </motion.div>
      </div>
    )
  }

  if (!exam || !currentQ) return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <p className="text-muted-foreground">Exam not found or has no questions.</p>
    </div>
  )

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0">
              <h1 className="font-bold text-sm truncate">{exam.title}</h1>
              <p className="text-xs text-muted-foreground">Question {currentIdx + 1} of {questions.length}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {tabWarnings > 0 && (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                  <AlertTriangle className="h-3 w-3 mr-1" />{tabWarnings}
                </Badge>
              )}
              <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="text-sm font-mono">
                <Clock className="h-3.5 w-3.5 mr-1.5" />{formatTime(timeLeft)}
              </Badge>
            </div>
          </div>
          <Progress value={(answeredCount / questions.length) * 100} className="h-1.5" />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            {/* Question Card */}
            <div className="rounded-2xl bg-card border shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-[10px]">
                  {currentQ.type === "mcq" ? "Multiple Choice" : currentQ.type === "true_false" ? "True / False" : currentQ.type === "coding" ? "Coding" : "Theory"}
                </Badge>
                <span className="text-xs text-muted-foreground">{exam.questions.find((eq: any) => eq.questionId === currentQ.id)?.points || currentQ.points} pts</span>
              </div>
              <p className="text-base font-medium leading-relaxed">{currentQ.text}</p>
            </div>

            {/* Answer Area */}
            <div className="rounded-2xl bg-card border shadow-sm p-5">
              {currentQ.type === "mcq" && currentQ.options && (
                <div className="space-y-2">
                  {currentQ.options.map((opt: string, oi: number) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${
                        answers[currentQ.id] === opt
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-muted/30"
                      }`}
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-mono mr-3">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {currentQ.type === "true_false" && (
                <div className="grid grid-cols-2 gap-3">
                  {["True", "False"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))}
                      className={`p-4 rounded-xl border text-center font-medium transition-all ${
                        answers[currentQ.id] === opt
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-muted/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {(currentQ.type === "theory" || currentQ.type === "coding") && (
                <textarea
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                  placeholder={currentQ.type === "coding" ? "Write your code here..." : "Write your answer here..."}
                  className="w-full min-h-[200px] rounded-xl border border-input bg-background p-4 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 border-t bg-background/80 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          <div className="flex gap-1.5">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={`w-7 h-7 rounded-full text-[10px] font-medium transition-all ${
                  i === currentIdx ? "bg-primary text-primary-foreground scale-110" :
                  answers[q.id] ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIdx < questions.length - 1 ? (
            <Button size="sm" onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="animated-gradient border-0 text-white shadow-lg shadow-primary/25"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              <Send className="h-4 w-4 mr-1" /> Submit
            </Button>
          )}
        </div>
      </div>

      <ExamCalculator />
    </div>
  )
}
