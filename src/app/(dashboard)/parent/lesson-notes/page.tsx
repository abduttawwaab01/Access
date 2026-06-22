"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { FileText, ChevronDown, ChevronUp, BookOpen, CheckCircle2, XCircle, RotateCcw, Trophy, ArrowRight, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useParentChildren } from "@/hooks/useParentChildren"

export default function ParentLessonNotesPage() {
  const { children, activeChild, activeChildId, setActiveChildId, loading: childrenLoading } = useParentChildren()
  const [classes, setClasses] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string>("")

  const [quizState, setQuizState] = useState<{ lessonNoteId: string; lessonTitle: string; subject: string; questions: any[] } | null>(null)
  const [quizStep, setQuizStep] = useState<"start" | "in-progress" | "results">("start")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [quizResult, setQuizResult] = useState<any>(null)
  const [existingResult, setExistingResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (children.length > 0 && !selectedClassId) {
      fetch("/api/classes").then((r) => r.json()).then((cls) => {
        setClasses(cls)
        const child = children.find((c) => c.id === activeChildId) || children[0]
        if (child?.classId) {
          setSelectedClassId(child.classId)
        }
      })
    }
  }, [children, activeChildId])

  useEffect(() => {
    if (selectedClassId) {
      setLoading(true)
      fetch(`/api/lesson-notes?classId=${selectedClassId}`)
        .then((r) => r.json())
        .then((data) => {
          setNotes(data.filter((n: any) => n.status === "published"))
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [selectedClassId])

  const handleChildChange = (childId: string) => {
    setActiveChildId(childId)
    const child = children.find((c) => c.id === childId)
    if (child?.classId) {
      setSelectedClassId(child.classId)
    }
    setExpandedId(null)
    setQuizState(null)
    setQuizStep("start")
    setCurrentQuestion(0)
    setAnswers({})
    setQuizResult(null)
    setExistingResult(null)
  }

  const getClassName = (id: string) => classes.find((c) => c.id === id)
  const sortedNotes = [...notes].sort((a, b) => (a.week || 0) - (b.week || 0))

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
    setQuizState(null)
    setQuizStep("start")
    setCurrentQuestion(0)
    setAnswers({})
    setQuizResult(null)
    setExistingResult(null)
  }

  const handleStartQuiz = async (note: any) => {
    setQuizState({
      lessonNoteId: note.id,
      lessonTitle: note.title,
      subject: note.subject,
      questions: note.quiz || [],
    })
    setQuizStep("start")
    setCurrentQuestion(0)
    setAnswers({})
    setQuizResult(null)

    const res = await fetch(`/api/lesson-quiz-results?studentId=${activeChildId}&lessonNoteId=${note.id}`)
    if (res.ok) {
      const data = await res.json()
      setExistingResult(data || null)
    }
  }

  const beginQuiz = () => {
    setQuizStep("in-progress")
    setCurrentQuestion(0)
  }

  const selectAnswer = (qIdx: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: answer }))
  }

  const nextQuestion = () => {
    if (quizState && currentQuestion < quizState.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const submitQuiz = async () => {
    if (!quizState || !quizState.questions.length) return
    setSubmitting(true)
    let correct = 0
    const detailedAnswers = quizState.questions.map((q, i) => {
      const userAnswer = answers[i] || ""
      const isCorrect = userAnswer.toLowerCase() === (q.correctAnswer || "").toLowerCase()
      if (isCorrect) correct++
      return { questionIndex: i, question: q.text, userAnswer, correctAnswer: q.correctAnswer, isCorrect }
    })
    const score = quizState.questions.length > 0 ? Math.round((correct / quizState.questions.length) * 100) : 0
    const payload = {
      studentId: activeChildId,
      lessonNoteId: quizState.lessonNoteId,
      subject: quizState.subject,
      totalQuestions: quizState.questions.length,
      correctAnswers: correct,
      score,
      answers: detailedAnswers,
    }
    const res = await fetch("/api/lesson-quiz-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setQuizResult({ ...payload, id: (await res.json()).id })
      setQuizStep("results")
      toast.success("Quiz submitted!")
    } else {
      toast.error("Failed to submit quiz")
    }
    setSubmitting(false)
  }

  const retakeQuiz = () => {
    setExistingResult(null)
    setQuizStep("start")
    setCurrentQuestion(0)
    setAnswers({})
    setQuizResult(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 15 } },
  }

  const renderQuizUI = (note: any) => {
    const questions = quizState?.questions || []
    if (!questions.length) return null

    if (quizStep === "start") {
      return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold">Quiz: {quizState?.lessonTitle}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{questions.length} question{questions.length > 1 ? "s" : ""}</p>
            {existingResult && (
              <div className="flex items-center gap-2 text-sm mb-3">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Previous score: <strong>{existingResult.score}%</strong> ({existingResult.correctAnswers}/{existingResult.totalQuestions})</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="animated-gradient border-0 text-white shadow-lg shadow-primary/25" onClick={beginQuiz}>
                {existingResult ? "Retake Quiz" : "Take Quiz"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
              {existingResult && (
                <Button size="sm" variant="outline" onClick={() => { setQuizStep("results"); setQuizResult(existingResult) }}>
                  View Previous
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )
    }

    if (quizStep === "in-progress") {
      const q = questions[currentQuestion]
      if (!q) return null
      const isLast = currentQuestion === questions.length - 1
      const hasAnswer = answers[currentQuestion] !== undefined

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
          <Card className="glass-card border-0 border-t-2 border-t-primary/30">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Q {currentQuestion + 1}/{questions.length}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
              </div>
              <p className="text-sm font-medium">{q.text}</p>
              <div className="space-y-2">
                {(q.type === "mcq" && q.options?.length
                  ? q.options
                  : q.type === "true_false"
                    ? ["True", "False"]
                    : []
                ).map((opt: string) => {
                  const val = typeof opt === "string" ? opt : opt
                  return (
                    <label key={val} className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                      answers[currentQuestion] === val
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}>
                      <input
                        type="radio"
                        name={`q-${currentQuestion}`}
                        value={val}
                        checked={answers[currentQuestion] === val}
                        onChange={() => selectAnswer(currentQuestion, val)}
                        className="accent-primary"
                      />
                      <span className="text-sm">{val}</span>
                    </label>
                  )
                })}
              </div>
              <div className="flex justify-end">
                {isLast ? (
                  <Button
                    size="sm"
                    disabled={!hasAnswer || submitting}
                    onClick={submitQuiz}
                    className="animated-gradient border-0 text-white shadow-lg shadow-primary/25"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                ) : (
                  <Button size="sm" disabled={!hasAnswer} onClick={nextQuestion}>
                    Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    if (quizStep === "results") {
      const data = quizResult || existingResult
      if (!data) return null
      const pct = data.score || Math.round((data.correctAnswers / data.totalQuestions) * 100)
      const isPass = pct >= 50

      return (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mt-4">
          <Card className={cn("glass-card border-0", isPass ? "border-t-2 border-t-emerald-500" : "border-t-2 border-t-red-500")}>
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <div className={cn("inline-flex h-14 w-14 items-center justify-center rounded-full mb-2", isPass ? "bg-emerald-500/10" : "bg-red-500/10")}>
                  {isPass ? <Trophy className="h-7 w-7 text-emerald-500" /> : <XCircle className="h-7 w-7 text-red-500" />}
                </div>
                <p className="text-2xl font-bold">{data.correctAnswers}/{data.totalQuestions}</p>
                <p className="text-lg font-semibold">{pct}%</p>
                <Badge className={isPass ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-600"}>
                  {isPass ? "Passed" : "Failed"}
                </Badge>
              </div>
              <div className="space-y-2">
                {(data.answers || []).map((a: any, i: number) => (
                  <div key={i} className={cn(
                    "flex items-start gap-2 rounded-xl p-3 text-sm",
                    a.isCorrect ? "bg-emerald-500/5" : "bg-red-500/5"
                  )}>
                    {a.isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                    <div>
                      <p className="font-medium">{a.question}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Your answer: {a.userAnswer || "(none)"}
                        {!a.isCorrect && <span className="text-emerald-600"> (Correct: {a.correctAnswer})</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" onClick={retakeQuiz} className="w-full animated-gradient border-0 text-white shadow-lg shadow-primary/25">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retake Quiz
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    return null
  }

  if (childrenLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Lesson Notes</h2>
        <p className="text-sm text-muted-foreground">Browse published lesson notes for your children</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => handleChildChange(c.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all snap-start",
                activeChildId === c.id
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-muted text-muted-foreground hover:bg-primary/10"
              )}
            >{c.name.split(" ")[0]}</button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={selectedClassId} onValueChange={(v) => v && setSelectedClassId(v)}>
            <SelectTrigger className="h-10 flex-1">
              <SelectValue placeholder="Select a class..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : sortedNotes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium">No lesson notes available</p>
              <p className="text-xs text-muted-foreground">There are no published lesson notes for this class yet.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
          <AnimatePresence>
            {sortedNotes.map((note) => {
              const hasQuiz = note.quiz && note.quiz.length > 0
              const isExpanded = expandedId === note.id
              return (
                <motion.div key={note.id} variants={itemVariants} layout>
                  <Card
                    className={cn(
                      "glass-card border-0 cursor-pointer transition-all",
                      isExpanded && "ring-1 ring-primary/20"
                    )}
                    onClick={() => toggleExpand(note.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{note.title}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                              <span>{note.subject}</span>
                              <span>Week {note.week}</span>
                              <span>{getClassName(note.classId)?.name}{getClassName(note.classId)?.arm ? ` ${getClassName(note.classId).arm}` : ""}</span>
                              <span>{note.term}</span>
                            </div>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              by {note.creatorName || "Unknown"}
                            </p>
                            {hasQuiz && (
                              <Badge variant="outline" className="mt-1.5 text-[10px] text-primary bg-primary/5">
                                {note.quiz.length} question{note.quiz.length > 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 ml-2">
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t mt-3" onClick={(e) => e.stopPropagation()}>
                              <div className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
                                {note.content}
                              </div>
                              {note.resources && (
                                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">Resources</p>
                                  <p className="text-xs text-muted-foreground/70">{note.resources}</p>
                                </div>
                              )}
                              {hasQuiz && (
                                <div className="mt-3">
                                  <Button
                                    size="sm"
                                    className="animated-gradient border-0 text-white shadow-lg shadow-primary/25"
                                    onClick={() => handleStartQuiz(note)}
                                  >
                                    <HelpCircle className="h-3.5 w-3.5 mr-1" />
                                    {existingResult?.lessonNoteId === note.id ? "View Quiz" : "Take Quiz"}
                                  </Button>
                                </div>
                              )}
                              {quizState?.lessonNoteId === note.id && renderQuizUI(note)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
