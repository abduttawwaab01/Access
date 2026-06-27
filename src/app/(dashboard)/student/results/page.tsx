"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"
import { Award, TrendingUp, DownloadCloud, FileText, FileSpreadsheet } from "lucide-react"
import { useSession } from "next-auth/react"
import { downloadPng, downloadPdf, downloadDoc, downloadCsv } from "@/lib/capture"
import { toast } from "sonner"

export default function StudentResultsPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [results, setResults] = useState<any[]>([])
  const [examSessions, setExamSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTerm, setActiveTerm] = useState("First Term")
  const [exporting, setExporting] = useState(false)
  const [activeView, setActiveView] = useState<"academic" | "exams">("academic")
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return
    const fetchData = async () => {
      const studRes = await fetch(`/api/students?userId=${userId}`)
      if (!studRes.ok) { setLoading(false); return }
      const student = await studRes.json()
      const sid = student?.id || ""
      if (!sid) { setLoading(false); return }
      const [res, sessions] = await Promise.all([
        fetch(`/api/results?studentId=${sid}`).then((r) => r.json()),
        fetch(`/api/exam-sessions`).then((r) => r.json()),
      ])
      setResults(res)
      const mySessions = sessions.filter((s: any) => s.studentId === sid)
      setExamSessions(mySessions)
      setLoading(false)
    }
    fetchData()
  }, [userId])

  const terms = [...new Set(results.map((r) => r.term))]
  const termResults = results.filter((r) => r.term === activeTerm)
  const avgScore = termResults.length > 0 ? Math.round(termResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / termResults.length) : 0

  const radarData = [...new Set(results.map((r) => r.subject))].map((subject) => {
    const subResults = results.filter((r) => r.subject === subject)
    const avg = subResults.length > 0 ? Math.round(subResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / subResults.length) : 0
    return { subject, score: avg }
  })

  const termCompareData = terms.map((term) => {
    const r = results.filter((x) => x.term === term)
    const avg = r.length > 0 ? Math.round(r.reduce((s, x) => s + (x.score / x.total) * 100, 0) / r.length) : 0
    return { term: term === "First Term" ? "1st" : term === "Second Term" ? "2nd" : "3rd", avg }
  })

  const completedExams = examSessions.filter((s) => s.status === "completed")

  const handleExport = async (type: "png" | "pdf" | "doc") => {
    if (!dashboardRef.current) return
    setExporting(true)
    try {
      if (type === "png") await downloadPng(dashboardRef.current, "My_Results.png", { scale: 2, backgroundColor: "#ffffff" })
      else if (type === "pdf") await downloadPdf(dashboardRef.current, "My_Results.pdf", { scale: 2, backgroundColor: "#ffffff" })
      else await downloadDoc(dashboardRef.current, "My_Results.doc", "My Results")
      toast.success(`Exported as ${type.toUpperCase()}`)
    } catch { toast.error("Export failed") }
    setExporting(false)
  }

  const handleExportCSV = () => {
    const data = termResults.map((r) => ({ Subject: r.subject, "CA Score": r.caScore ?? "", "Exam Score": r.examScore ?? "", Total: r.score, Grade: r.grade }))
    downloadCsv(data, `My_Results_${activeTerm}.csv`)
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold">My Results</h2>
          <p className="text-sm text-muted-foreground">Academic performance across all subjects</p>
        </motion.div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}><FileSpreadsheet className="h-4 w-4 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("png")} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PNG</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PDF</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("doc")} disabled={exporting}><FileText className="h-4 w-4 mr-1" />DOC</Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button onClick={() => setActiveView("academic")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeView === "academic" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Academic Results</button>
        <button onClick={() => setActiveView("exams")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeView === "exams" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Exam Sessions ({completedExams.length})</button>
      </div>

      {activeView === "academic" && (
        <div ref={dashboardRef} className="space-y-6 bg-white rounded-2xl p-6 border">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
            <Card className="border border-border/50"><CardContent className="p-4 text-center">
              <Award className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-xl md:text-2xl font-bold">{avgScore}%</p>
              <p className="text-xs text-muted-foreground">Current Avg</p>
            </CardContent></Card>
            <Card className="border border-border/50"><CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
              <p className="text-xl md:text-2xl font-bold">{termResults.filter((r) => r.score >= r.total * 0.5).length}/{termResults.length}</p>
              <p className="text-xs text-muted-foreground">Passed Subjects</p>
            </CardContent></Card>
          </motion.div>

          {termCompareData.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border border-border/50">
                <CardContent className="p-4 md:p-5">
                  <h3 className="font-semibold mb-3">Term Comparison</h3>
                  <div className="h-48 min-h-[180px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={termCompareData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                        <XAxis dataKey="term" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                        <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={40} fill="hsl(var(--primary))" fillOpacity={0.8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {radarData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border border-border/50">
                <CardContent className="p-4 md:p-5">
                  <h3 className="font-semibold mb-3">Subject Radar</h3>
                  <div className="h-48 md:h-64 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {terms.length > 0 && (
            <Tabs value={activeTerm} onValueChange={setActiveTerm}>
              <TabsList className="flex flex-wrap w-full gap-1.5">
                {terms.map((t) => <TabsTrigger key={t} value={t} className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg data-[state=active]:animated-gradient data-[state=active]:text-white">{t}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          )}

          <div className="space-y-2">
            {termResults.map((r, i) => {
              const pct = Math.round((r.score / r.total) * 100)
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{r.subject}</span>
                          <Badge variant="outline" className={`text-[10px] ${r.grade === "A" ? "bg-green-500/10 text-green-600" : r.grade === "B" ? "bg-blue-500/10 text-blue-600" : r.grade === "C" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>{r.grade}</Badge>
                        </div>
                        <span className="text-sm font-bold">{r.score}/{r.total}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
            {termResults.length === 0 && <p className="text-center text-muted-foreground py-8">No results for this term</p>}
          </div>
        </div>
      )}

      {activeView === "exams" && (
        <div className="space-y-3">
          {completedExams.length === 0 ? (
            <Card className="border border-border/50"><CardContent className="p-8 text-center text-muted-foreground">No completed exam sessions</CardContent></Card>
          ) : (
            completedExams.map((s, i) => {
              const pct = s.maxScore > 0 ? Math.round(((s.score || s.totalScore || 0) / s.maxScore) * 100) : 0
              const displayScore = s.score ?? s.totalScore ?? 0
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="border border-border/50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = `/student/cbt/analysis/${s.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{s.examId ? `Exam Session` : "Entrance Exam"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{displayScore}/{s.maxScore} ({pct}%)</p>
                          <Badge className={pct >= 75 ? "bg-green-500/15 text-green-600" : pct >= 50 ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600"}>{pct >= 75 ? "A" : pct >= 65 ? "B" : pct >= 55 ? "C" : pct >= 45 ? "D" : "F"}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
