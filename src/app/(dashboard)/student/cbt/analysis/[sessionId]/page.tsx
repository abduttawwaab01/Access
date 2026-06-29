"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts"
import { ArrowLeft, Clock, Award, Brain, AlertTriangle, Lightbulb, Target, CheckCircle2, XCircle, FileText, DownloadCloud, FileSpreadsheet } from "lucide-react"
import { downloadPng, downloadPdf, downloadCsv, downloadDoc } from "@/lib/capture"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

const getGrade = (pct: number) => {
  if (pct >= 75) return { grade: "A", color: "text-green-500" }
  if (pct >= 65) return { grade: "B", color: "text-blue-500" }
  if (pct >= 55) return { grade: "C", color: "text-amber-500" }
  if (pct >= 45) return { grade: "D", color: "text-orange-500" }
  return { grade: "F", color: "text-red-500" }
}

const questionTypes: Record<string, string> = { mcq: "Multiple Choice", true_false: "True/False", theory: "Theory", coding: "Coding" }

export default function ExamAnalysisPage() {
  const { sessionId } = useParams()
  const router = useRouter()
  const { data: authData } = useSession()
  const userId = (authData?.user as any)?.id || ""
  const [session, setSession] = useState<any>(null)
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const [sRes, qRes, subRes, studRes] = await Promise.all([
        fetch(`/api/exam-sessions/${sessionId}`),
        fetch("/api/questions"),
        fetch("/api/subjects"),
        fetch(`/api/students?userId=${userId}`),
      ])
      const s = await sRes.json()
      const student = await studRes.json()
      const q = await qRes.json()
      const sub = await subRes.json()

      if (!s || s.studentId !== student?.id) {
        setUnauthorized(true)
        setLoading(false)
        return
      }

      setSession(s)
      setQuestions(q)
      setSubjects(sub)

      if (s?.examId) {
        const eRes = await fetch(`/api/exams/${s.examId}`)
        setExam(await eRes.json())
      }
      setLoading(false)
    }
    load()
  }, [sessionId, userId])

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-32", "h-48", "h-48 md:h-56 min-h-[160px]"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  if (unauthorized) return (
    <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-3">
      <AlertTriangle className="h-12 w-12 text-destructive/50" />
      <h3 className="font-semibold">Access Denied</h3>
      <p className="text-sm text-muted-foreground">You do not have permission to view this exam analysis.</p>
      <Button variant="outline" onClick={() => router.push("/student/cbt")}><ArrowLeft className="h-4 w-4 mr-1" /> Back to Exams</Button>
    </div>
  )

  if (!session || !exam) return (
    <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-3">
      <FileText className="h-12 w-12 text-muted-foreground/30" />
      <h3 className="font-semibold">Session not found</h3>
      <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
    </div>
  )

  const pct = session.maxScore > 0 ? Math.round(((session.score ?? session.totalScore) / session.maxScore) * 100) : 0
  const grade = getGrade(pct)

  const subjectName = (exam.subjectIds || [exam.subjectId]).filter(Boolean).map((sid: string) => subjects.find((s: any) => s.id === sid)?.name || "Unknown").join(", ") || "Unknown"

  const enrichedAnswers = (session.answers || []).map((a: any) => {
    const q = questions.find((q) => q.id === a.questionId)
    const maxPts = exam.questions?.find((eq: any) => eq.questionId === a.questionId)?.points || (q ? q.points : 0)
    const isCorrect = a.score === maxPts
    const isPartial = a.score > 0 && a.score < maxPts
    return { ...a, question: q, maxPoints: maxPts, isCorrect, isPartial }
  })

  const correct = enrichedAnswers.filter((a: any) => a.isCorrect).length
  const partial = enrichedAnswers.filter((a: any) => a.isPartial).length
  const wrong = enrichedAnswers.filter((a: any) => a.score === 0).length

  const typeBreakdown = enrichedAnswers.reduce((acc: any, a: any) => {
    const type = a.question?.type || "unknown"
    if (!acc[type]) acc[type] = { correct: 0, wrong: 0, total: 0, score: 0, max: 0 }
    acc[type].total++
    acc[type].score += a.score
    acc[type].max += a.maxPoints
    if (a.isCorrect) acc[type].correct++
    else if (a.score === 0) acc[type].wrong++
    return acc
  }, {})

  const radarData = Object.values(typeBreakdown).length > 1
    ? Object.entries(typeBreakdown).map(([type, data]: [string, any]) => ({
        subject: questionTypes[type] || type,
        score: Math.round((data.score / data.max) * 100),
      }))
    : enrichedAnswers.map((a: any) => ({
        subject: a.question?.text?.substring(0, 20) || "Q",
        score: a.maxPoints > 0 ? Math.round((a.score / a.maxPoints) * 100) : 0,
      }))

  const pieData = [
    { name: "Correct", value: correct, color: "#22c55e" },
    { name: "Partial", value: partial, color: "#f59e0b" },
    { name: "Wrong", value: wrong, color: "#ef4444" },
  ].filter((d) => d.value > 0)

  const timeTaken = session.startTime && session.endTime
    ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
    : null

  const fileName = `${exam?.title?.replace(/\s+/g, "_") || "Exam"}_Analysis`

  const handleExportPNG = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { await downloadPng(reportRef.current, `${fileName}.png`, { scale: 2, backgroundColor: "#ffffff" }); toast.success("Exported as PNG") }
    catch { toast.error("Export failed") }; setExporting(false)
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { await downloadPdf(reportRef.current, `${fileName}.pdf`, { scale: 2, backgroundColor: "#ffffff" }); toast.success("Exported as PDF") }
    catch { toast.error("Export failed") }; setExporting(false)
  }

  const handleExportDOC = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { downloadDoc(reportRef.current, `${fileName}.doc`, "Exam Analysis"); toast.success("Exported as DOC") }
    catch { toast.error("Export failed") }; setExporting(false)
  }

  const handleExportCSV = () => {
    const data = enrichedAnswers.map((a: any, i: number) => ({
      "#": i + 1, "Question": a.question?.text || "", "Type": questionTypes[a.question?.type] || a.question?.type || "",
      "Your Answer": a.answer || "", "Correct Answer": a.question?.correctAnswer || "",
      "Max Points": a.maxPoints, "Score": a.score, "Result": a.isCorrect ? "Correct" : a.isPartial ? "Partial" : "Wrong",
    }))
    downloadCsv(data, `${fileName}.csv`)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-bold">Exam Analysis</h2>
            <p className="text-xs text-muted-foreground">{exam.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}><FileSpreadsheet className="h-4 w-4 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PNG</Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PDF</Button>
          <Button variant="outline" size="sm" onClick={handleExportDOC} disabled={exporting}><FileText className="h-4 w-4 mr-1" />DOC</Button>
        </div>
      </div>

      <motion.div ref={reportRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl overflow-hidden border">
        {/* Hero Score */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-6 text-white">
          <div className="text-center">
            <p className="text-sm opacity-80 uppercase tracking-wider">{subjectName} - {exam.title}</p>
            <div className="mt-4 flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-3xl font-bold">{(session.score ?? session.totalScore)}/{session.maxScore}</p>
                <p className="text-xs opacity-80 mt-1">Total Score</p>
              </div>
              <div className="text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/10">
                  <div>
                    <p className="text-2xl font-bold">{pct}%</p>
                    <p className="text-[10px] opacity-80">Score</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className={`text-4xl font-bold ${grade.color.replace("text-", "text-white")}`}>{grade.grade}</p>
                <p className="text-xs opacity-80 mt-1">Grade</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-center gap-6 text-xs">
              {timeTaken && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeTaken} min</span>}
              <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {exam.questions?.length || 0} questions</span>
              {session.tabSwitches > 0 && <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {session.tabSwitches} tab switch(es)</span>}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Question Breakdown */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Target className="h-4 w-4" /> Question-by-Question Breakdown</h3>
            <div className="space-y-3">
              {enrichedAnswers.map((a: any, i: number) => {
                const q = a.question
                const qPct = a.maxPoints > 0 ? Math.round((a.score / a.maxPoints) * 100) : 0
                const color = qPct >= 100 ? "bg-green-500" : qPct > 0 ? "bg-amber-500" : "bg-red-500"
                return (
                  <Card key={a.questionId} className="border border-border/50 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground font-mono">Q{i + 1}</span>
                            <Badge variant="outline" className="text-[10px]">{q ? questionTypes[q.type] || q.type : "Unknown"}</Badge>
                            <span className="text-[10px] text-muted-foreground">{a.maxPoints} pts</span>
                          </div>
                          <p className="text-sm leading-snug">{q?.text || "Question text unavailable"}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <div className="flex items-center gap-1 justify-end">
                            {a.isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : a.score > 0 ? <Lightbulb className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                            <span className="font-mono text-sm font-bold">{a.score}/{a.maxPoints}</span>
                          </div>
                          <Progress value={qPct} className="h-1.5 mt-1 w-16 ml-auto" />
                        </div>
                      </div>
                      {q?.correctAnswer && q.type !== "theory" && q.type !== "coding" && (
                        <div className="flex items-center gap-2 text-xs mt-2">
                          <span className="text-muted-foreground">Correct answer:</span>
                          <span className="font-mono text-green-600">{q.correctAnswer}</span>
                          {a.answer && a.answer !== q.correctAnswer && (
                            <span className="text-muted-foreground">Your answer: <span className="font-mono text-red-500">{a.answer}</span></span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Brain className="h-4 w-4" /> Performance Radar</h3>
              <div className="h-48 md:h-56 min-h-[160px]">
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
            {/* Pie */}
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
                  <div key={d.name} className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Type Breakdown */}
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
                          <p className="text-xs text-muted-foreground">{questionTypes[type] || type}</p>
                          <p className="text-lg font-bold mt-1">{tpct}%</p>
                          <p className="text-[10px] text-muted-foreground">{data.score}/{data.max} pts</p>
                          <div className="flex justify-center gap-2 mt-1 text-[10px]">
                            <span className="text-green-600">{data.correct} correct</span>
                            <span className="text-red-500">{data.wrong} wrong</span>
                          </div>
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
                          <Progress value={tpct} className="h-1.5 mt-2" />
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div></>
            )
          })()}

          <Separator />

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardContent className="p-4">
                <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Strengths</h4>
                <ul className="mt-2 space-y-1">
                  {enrichedAnswers.filter((a: any) => a.isCorrect).slice(0, 3).map((a: any) => (
                    <li key={a.questionId} className="text-xs">+ {a.question?.text?.substring(0, 40)}...</li>
                  ))}
                  {enrichedAnswers.filter((a: any) => a.isCorrect).length === 0 && <li className="text-xs text-muted-foreground">No correct answers</li>}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardContent className="p-4">
                <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Areas to Improve</h4>
                <ul className="mt-2 space-y-1">
                  {enrichedAnswers.filter((a: any) => !a.isCorrect).slice(0, 3).map((a: any) => (
                    <li key={a.questionId} className="text-xs">- {a.question?.text?.substring(0, 40)}...</li>
                  ))}
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

          {/* Feedback */}
          {session.feedback && (
            <>
              <Separator />
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Teacher's Feedback</p>
                <p className="text-sm italic">{session.feedback}</p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
