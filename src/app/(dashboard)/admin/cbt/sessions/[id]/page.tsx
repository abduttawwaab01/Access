"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts"
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, User, Brain, Target, Lightbulb, Award, DownloadCloud, FileSpreadsheet, FileText } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import Link from "next/link"
import { useParams } from "next/navigation"
import { downloadPng, downloadPdf, downloadCsv, downloadDoc } from "@/lib/capture"

const typeLabels: Record<string, string> = { mcq: "Multiple Choice", true_false: "True/False", theory: "Theory", coding: "Coding" }
const tabs = ["Grading", "Analysis"]
const gradeColors: Record<string, string> = { A: "#22c55e", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" }

export default function SessionDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("Grading")
  const [session, setSession] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [exam, setExam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState("")
  const [exporting, setExporting] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  const reportRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    const sRes = await fetch(`/api/exam-sessions/${params.id}`)
    const sData = await sRes.json()
    setSession(sData)
    if (sData.examId) {
      const [eRes, qRes, subRes] = await Promise.all([
        fetch(`/api/exams/${sData.examId}`),
        fetch("/api/questions"),
        fetch("/api/subjects"),
      ])
      const eData = await eRes.json()
      const qData = await qRes.json()
      const subData = await subRes.json()
      setExam(eData)
      setSubjects(subData)
      if (eData.questions) {
        const qIds = eData.questions.map((q: any) => q.questionId)
        setQuestions(qData.filter((q: any) => qIds.includes(q.id)))
        const initScores: Record<string, number> = {}
        sData.answers?.forEach((a: any) => { initScores[a.questionId] = a.score ?? 0 })
        setScores(initScores)
      }
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [params.id])

  const getQuestionPoints = (qId: string) => exam?.questions?.find((q: any) => q.questionId === qId)?.points || 0

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
      body: JSON.stringify({ totalScore: totalPoints, maxScore: maxPoints, answers: session.answers.map((a: any) => ({ ...a, score: scores[a.questionId] ?? a.score })), status: "completed" }),
    })
    if (res.ok) {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: params.id, totalScore: totalPoints, maxScore: maxPoints, feedback, gradedAt: new Date().toISOString(), status: "graded" }),
      })
      toast.success("Grading saved")
      fetchData()
    } else toast.error("Failed to save")
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-12", "h-20", "h-32", "h-32"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>
  if (!session) return <div className="p-4 md:p-6"><EmptyState title="Session not found" /></div>

  const totalPoints = Object.values(scores).reduce((s, v) => s + (v || 0), 0)
  const maxPoints = exam?.questions?.reduce((s: number, q: any) => s + (q.points || 0), 0) || 0
  const pct = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0

  // Analysis data
  const enrichedAnswers = (session.answers || []).map((a: any) => {
    const q = questions.find((q) => q.id === a.questionId)
    const maxPts = getQuestionPoints(a.questionId)
    const scored = scores[a.questionId] ?? a.score ?? 0
    return { ...a, question: q, maxPoints: maxPts, score: scored, isCorrect: scored === maxPts && maxPts > 0, isPartial: scored > 0 && scored < maxPts }
  })

  const correct = enrichedAnswers.filter((a: any) => a.isCorrect).length
  const partial = enrichedAnswers.filter((a: any) => a.isPartial).length
  const wrong = enrichedAnswers.filter((a: any) => a.score === 0).length

  const typeBreakdown = enrichedAnswers.reduce((acc: any, a: any) => {
    const type = a.question?.type || "unknown"
    if (!acc[type]) acc[type] = { correct: 0, wrong: 0, total: 0, score: 0, max: 0 }
    acc[type].total++; acc[type].score += a.score; acc[type].max += a.maxPoints
    if (a.isCorrect) acc[type].correct++
    else if (a.score === 0) acc[type].wrong++
    return acc
  }, {})

  const radarData = Object.values(typeBreakdown).length > 1
    ? Object.entries(typeBreakdown).map(([type, data]: [string, any]) => ({ subject: typeLabels[type] || type, score: data.max > 0 ? Math.round((data.score / data.max) * 100) : 0 }))
    : enrichedAnswers.map((a: any) => ({ subject: a.question?.text?.substring(0, 20) || "Q", score: a.maxPoints > 0 ? Math.round((a.score / a.maxPoints) * 100) : 0 }))

  const pieData = [{ name: "Correct", value: correct, color: "#22c55e" }, { name: "Partial", value: partial, color: "#f59e0b" }, { name: "Wrong", value: wrong, color: "#ef4444" }].filter((d) => d.value > 0)

  const subjectName = (exam?.subjectIds || [exam?.subjectId]).filter(Boolean).map((sid: string) => subjects.find((s: any) => s.id === sid)?.name || "Unknown").join(", ") || "Unknown"
  const timeTaken = session.startTime && session.endTime ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000) : null

  const handleExportCSV = () => {
    const data = enrichedAnswers.map((a: any, i: number) => ({
      "#": i + 1,
      "Question": a.question?.text || "",
      "Type": typeLabels[a.question?.type] || a.question?.type || "",
      "Your Answer": a.answer || "",
      "Correct Answer": a.question?.correctAnswer || "",
      "Max Points": a.maxPoints,
      "Score": a.score,
      "Result": a.isCorrect ? "Correct" : a.isPartial ? "Partial" : "Wrong",
    }))
    downloadCsv(data, `Session_Analysis_${session.studentName || params.id}.csv`)
  }

  const handleExportAnalysisPNG = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { await downloadPng(reportRef.current, `Analysis_${session.studentName || "session"}.png`, { scale: 2, backgroundColor: "#ffffff" }); toast.success("Analysis exported as PNG") } catch { toast.error("Export failed") }
    setExporting(false)
  }

  const handleExportAnalysisPDF = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { await downloadPdf(reportRef.current, `Analysis_${session.studentName || "session"}.pdf`, { scale: 2, backgroundColor: "#ffffff" }); toast.success("Analysis exported as PDF") } catch { toast.error("Export failed") }
    setExporting(false)
  }

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
              <Badge className={session.status === "completed" ? "bg-green-500/15 text-green-600" : session.status === "active" ? "bg-blue-500/15 text-blue-600" : "bg-amber-500/15 text-amber-600"}>{session.status}</Badge>
              {session.flagged && <Badge variant="outline" className="text-danger border-danger/30"><AlertTriangle className="h-3 w-3 mr-1" />Flagged</Badge>}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              {exam && <span>{exam.title}</span>}
              {session.startTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(session.startTime).toLocaleString()}</span>}
              {session.tabSwitches > 0 && <span className="text-danger">{session.tabSwitches} tab switches</span>}
            </div>
            {session.status === "completed" && <div className="mt-2 text-lg font-bold">{totalPoints} / {maxPoints} ({pct}%)</div>}
          </div>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit mb-6">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {activeTab === "Grading" && (
        <>
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
                          <Input type="number" min={0} max={maxPts} value={scores[ans.questionId] ?? 0} onChange={(e) => handleScoreChange(ans.questionId, parseInt(e.target.value) || 0)} className="h-10 w-20 text-sm" />
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
        </>
      )}

      {activeTab === "Analysis" && (
        <>
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={handleExportCSV}><FileSpreadsheet className="h-4 w-4 mr-1" />CSV</Button>
            <Button variant="outline" size="sm" onClick={handleExportAnalysisPNG} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PNG</Button>
            <Button variant="outline" size="sm" onClick={handleExportAnalysisPDF} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PDF</Button>
            <Button variant="outline" size="sm" onClick={() => { if (reportRef.current) downloadDoc(reportRef.current, `Analysis_${session?.studentName || "session"}.doc`, "Exam Analysis") }} disabled={exporting}><FileText className="h-4 w-4 mr-1" />DOC</Button>
          </div>

          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl overflow-hidden border">
            <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-6 text-white">
              <div className="text-center">
                <p className="text-sm opacity-80 uppercase tracking-wider">{subjectName} - {exam?.title}</p>
                <p className="text-sm opacity-80">{session.studentName}</p>
                <div className="mt-4 flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{totalPoints}/{maxPoints}</p>
                    <p className="text-xs opacity-80 mt-1">Total Score</p>
                  </div>
                  <div className="text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/10">
                      <div><p className="text-2xl font-bold">{pct}%</p><p className="text-[10px] opacity-80">Score</p></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">{pct >= 75 ? "A" : pct >= 65 ? "B" : pct >= 55 ? "C" : pct >= 45 ? "D" : "F"}</p>
                    <p className="text-xs opacity-80 mt-1">Grade</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-center gap-6 text-xs">
                  {timeTaken && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeTaken} min</span>}
                  <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {exam?.questions?.length || 0} questions</span>
                  {session.tabSwitches > 0 && <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {session.tabSwitches} tab switch(es)</span>}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Target className="h-4 w-4" /> Question-by-Question Breakdown</h3>
                <div className="space-y-3">
                  {enrichedAnswers.map((a: any, i: number) => {
                    const q = a.question
                    const qPct = a.maxPoints > 0 ? Math.round((a.score / a.maxPoints) * 100) : 0
                    return (
                      <Card key={a.questionId} className="border border-border/50 overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground font-mono">Q{i + 1}</span>
                                <Badge variant="outline" className="text-[10px]">{q ? typeLabels[q.type] || q.type : "Unknown"}</Badge>
                                <span className="text-[10px] text-muted-foreground">{a.maxPoints} pts</span>
                              </div>
                              <p className="text-sm leading-snug">{q?.text || "Question text unavailable"}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <div className="flex items-center gap-1 justify-end">
                                {a.isCorrect ? <CheckCircle className="h-4 w-4 text-green-500" /> : a.score > 0 ? <Lightbulb className="h-4 w-4 text-amber-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                                <span className="font-mono text-sm font-bold">{a.score}/{a.maxPoints}</span>
                              </div>
                              <Progress value={qPct} className="h-1.5 mt-1 w-16 ml-auto" />
                            </div>
                          </div>
                          {q?.correctAnswer && q.type !== "theory" && q.type !== "coding" && (
                            <div className="flex items-center gap-2 text-xs mt-2">
                              <span className="text-muted-foreground">Correct answer:</span>
                              <span className="font-mono text-green-600">{q.correctAnswer}</span>
                              {a.answer && a.answer !== q.correctAnswer && <span className="text-muted-foreground">Your answer: <span className="font-mono text-red-500">{a.answer}</span></span>}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Brain className="h-4 w-4" /> Performance Radar</h3>
                  <div className="h-48 md:h-56 min-h-[160px] w-full" style={{ position: "relative", width: "100%", minHeight: "192px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#666" }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Correct / Partial / Wrong</h3>
                  <div className="h-48 md:h-56 min-h-[160px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                          {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 text-xs">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} /><span>{d.name}: {d.value}</span></div>
                    ))}
                  </div>
                </div>
              </div>

              {Object.keys(typeBreakdown).length > 1 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Performance by Question Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(typeBreakdown).map(([type, data]: [string, any]) => {
                        const tpct = data.max > 0 ? Math.round((data.score / data.max) * 100) : 0
                        return (
                          <Card key={type} className="border border-border/50">
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground">{typeLabels[type] || type}</p>
                              <p className="text-lg font-bold mt-1">{tpct}%</p>
                              <p className="text-[10px] text-muted-foreground">{data.score}/{data.max} pts</p>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Topic Breakdown */}
              {(() => {
                const topicMap: Record<string, { correct: number; total: number; score: number; max: number }> = {}
                enrichedAnswers.forEach((a: any) => {
                  const topic = a.question?.topic || "General"
                  if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0, score: 0, max: 0 }
                  topicMap[topic].total++
                  topicMap[topic].score += a.score
                  topicMap[topic].max += a.maxPoints
                  if (a.isCorrect) topicMap[topic].correct++
                })
                const topics = Object.entries(topicMap)
                if (topics.length <= 1) return null
                return (
                  <><Separator /><div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Target className="h-4 w-4" /> Topic Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {topics.map(([topic, data]) => {
                        const tpct = data.max > 0 ? Math.round((data.score / data.max) * 100) : 0
                        return (
                          <Card key={topic} className="border border-border/50">
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground font-medium truncate" title={topic}>{topic}</p>
                              <p className="text-lg font-bold mt-1">{tpct}%</p>
                              <p className="text-[10px] text-muted-foreground">{data.score}/{data.max} pts</p>
                              <div className="flex justify-center gap-2 mt-1 text-[10px]">
                                <span className="text-green-600">{data.correct}/{data.total}</span>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div></>
                )
              })()}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardContent className="p-4">
                    <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Strengths</h4>
                    <ul className="mt-2 space-y-1">
                      {enrichedAnswers.filter((a: any) => a.isCorrect).slice(0, 3).map((a: any) => <li key={a.questionId} className="text-xs">+ {a.question?.text?.substring(0, 40)}...</li>)}
                      {enrichedAnswers.filter((a: any) => a.isCorrect).length === 0 && <li className="text-xs text-muted-foreground">No correct answers</li>}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <CardContent className="p-4">
                    <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Areas to Improve</h4>
                    <ul className="mt-2 space-y-1">
                      {enrichedAnswers.filter((a: any) => !a.isCorrect).slice(0, 3).map((a: any) => <li key={a.questionId} className="text-xs">- {a.question?.text?.substring(0, 40)}...</li>)}
                      {enrichedAnswers.filter((a: any) => !a.isCorrect).length === 0 && <li className="text-xs text-muted-foreground">Perfect score!</li>}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardContent className="p-4">
                    <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1"><Award className="h-3 w-3" /> Recommendations</h4>
                    <ul className="mt-2 space-y-1">
                      {wrong > 2 && <li className="text-xs">Review incorrect answers</li>}
                      {partial > 0 && <li className="text-xs">Complete partial answers fully</li>}
                      {session.tabSwitches > 0 && <li className="text-xs">Avoid tab switching in exams</li>}
                      {pct >= 75 && <li className="text-xs">Excellent work! Try harder exams</li>}
                      {pct < 40 && <li className="text-xs">Seek help from your teacher</li>}
                      <li className="text-xs">Practice similar questions</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {session.feedback && (
                <><Separator /><div className="rounded-xl bg-muted/30 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Teacher's Feedback</p>
                  <p className="text-sm italic">{session.feedback}</p>
                </div></>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
