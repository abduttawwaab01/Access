"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { cn } from "@/lib/utils"
import { useParentChildren } from "@/hooks/useParentChildren"
import { DownloadCloud, FileText, FileSpreadsheet } from "lucide-react"
import { downloadPng, downloadPdf, downloadDoc, downloadCsv } from "@/lib/capture"
import { toast } from "sonner"

export default function ParentResultsPage() {
  const { children, activeChildId, setActiveChildId, loading: childrenLoading } = useParentChildren()
  const [results, setResults] = useState<any[]>([])
  const [examSessions, setExamSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [activeView, setActiveView] = useState<"academic" | "exams">("academic")
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeChildId) return
    setLoading(true)
    Promise.all([
      fetch(`/api/results?studentId=${activeChildId}`).then((r) => r.json()),
      fetch(`/api/exam-sessions`).then((r) => r.json()),
    ]).then(([res, sessions]) => {
      setResults(res)
      setExamSessions(sessions.filter((s: any) => s.studentId === activeChildId))
      setLoading(false)
    })
  }, [activeChildId])

  const terms = [...new Set(results.map((r) => r.term))]
  const [activeTerm, setActiveTerm] = useState(terms[0] || "")
  const termResults = results.filter((r) => r.term === activeTerm)
  const avgScore = termResults.length > 0 ? Math.round(termResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / termResults.length) : 0

  const barData = termResults.map((r) => ({ subject: r.subject, score: r.total > 0 ? Math.round((r.score / r.total) * 100) : 0, fullMark: 100 }))
  const radarData = termResults.map((r) => ({ subject: r.subject, value: r.total > 0 ? Math.round((r.score / r.total) * 100) : 0 }))

  const prevTerm = terms[terms.indexOf(activeTerm) - 1]
  const prevResults = prevTerm ? results.filter((r) => r.term === prevTerm) : []
  const comparisonData = barData.map((b) => {
    const prev = prevResults.find((p) => p.subject === b.subject)
    return { ...b, previous: prev?.score || 0 }
  })

  const completedExams = examSessions.filter((s: any) => s.status === "completed")

  const handleExport = async (type: "png" | "pdf" | "doc") => {
    if (!dashboardRef.current) return; setExporting(true)
    try {
      if (type === "png") await downloadPng(dashboardRef.current, "Child_Results.png", { scale: 2, backgroundColor: "#ffffff" })
      else if (type === "pdf") await downloadPdf(dashboardRef.current, "Child_Results.pdf", { scale: 2, backgroundColor: "#ffffff" })
      else await downloadDoc(dashboardRef.current, "Child_Results.doc", "Child Results")
      toast.success(`Exported as ${type.toUpperCase()}`)
    } catch { toast.error("Export failed") }
    setExporting(false)
  }

  const handleExportCSV = () => {
    const data = termResults.map((r) => ({ Subject: r.subject, "CA Score": r.caScore ?? "", "Exam Score": r.examScore ?? "", Total: r.score, Grade: r.grade }))
    downloadCsv(data, `Child_Results_${activeTerm}.csv`)
  }

  if (childrenLoading) {
    return <div className="p-4 md:p-6 space-y-5">{[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}</div>
  }

  if (!activeChildId) return null

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Results & Performance</h2>
          <p className="text-sm text-muted-foreground">Track academic progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}><FileSpreadsheet className="h-4 w-4 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("png")} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PNG</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PDF</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("doc")} disabled={exporting}><FileText className="h-4 w-4 mr-1" />DOC</Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
        {children.map((c) => (
          <button key={c.id} onClick={() => setActiveChildId(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all snap-start ${activeChildId === c.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
          >{c.name.split(" ")[0]}</button>
        ))}
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button onClick={() => setActiveView("academic")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeView === "academic" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Academic Results</button>
        <button onClick={() => setActiveView("exams")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeView === "exams" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Exam Sessions ({completedExams.length})</button>
      </div>

      {activeView === "academic" && (
        <div ref={dashboardRef} className="space-y-5 bg-white rounded-2xl p-6 border">
          {!loading && terms.length > 0 && (
            <Tabs value={activeTerm} onValueChange={setActiveTerm}>
              <TabsList className="flex flex-wrap w-full gap-1.5">
                {terms.map((t) => <TabsTrigger key={t} value={t} className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">{t}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          )}

          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : termResults.length === 0 ? (
            <Card className="border border-border/50"><CardContent className="p-8 text-center text-muted-foreground">No results available for this term</CardContent></Card>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border border-border/50"><CardContent className="p-4 md:p-6 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Average Score</p>
                  <p className={cn("text-5xl font-bold mt-1", avgScore >= 80 ? "text-green-600" : avgScore >= 60 ? "text-amber-600" : "text-red-600")}>{avgScore}%</p>
                  {prevTerm && prevResults.length > 0 && (() => {
                    const prevAvg = Math.round(prevResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / prevResults.length)
                    const diff = avgScore - prevAvg
                    return <p className="text-xs text-muted-foreground mt-1"><span className={diff >= 0 ? "text-green-600" : "text-red-600"}>{diff >= 0 ? "\u2191" : "\u2193"} {Math.abs(diff)}% from {prevTerm}</span></p>
                  })()}
                </CardContent></Card>
              </motion.div>

              <Card className="border border-border/50"><CardContent className="p-4">
                <p className="text-sm font-semibold mb-3">Subject Scores</p>
                <div className="overflow-x-auto"><div className="h-48 md:h-56 min-h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <XAxis dataKey="subject" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="score" name={activeTerm} radius={[6, 6, 0, 0]} barSize={20} fill="#6366f1" />
                      {prevTerm && <Bar dataKey="previous" name={prevTerm} radius={[6, 6, 0, 0]} barSize={20} fill="#94a3b8" opacity={0.5} />}
                    </BarChart>
                  </ResponsiveContainer>
                </div></div>
              </CardContent></Card>

              <Card className="border border-border/50"><CardContent className="p-4">
                <p className="text-sm font-semibold mb-3">Performance Profile</p>
                <div className="h-48 md:h-64 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(0,0,0,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent></Card>

              <div className="space-y-2">
                {termResults.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border border-border/50"><CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{r.subject}</p>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-bold", r.score >= 80 ? "text-green-600" : r.score >= 60 ? "text-amber-600" : "text-red-600")}>{r.score}/{r.total}</span>
                          <Badge className={cn("text-[10px]", r.grade === "A" ? "bg-green-500/10 text-green-600" : r.grade === "B" ? "bg-blue-500/10 text-blue-600" : r.grade === "C" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600")}>{r.grade}</Badge>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", r.score >= 80 ? "bg-green-500" : r.score >= 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${(r.score / r.total) * 100}%` }} />
                      </div>
                    </CardContent></Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeView === "exams" && (
        <div className="space-y-3">
          {completedExams.length === 0 ? (
            <Card className="border border-border/50"><CardContent className="p-8 text-center text-muted-foreground">No completed exam sessions</CardContent></Card>
          ) : (
            completedExams.map((s: any, i: number) => {
              const pct = s.maxScore > 0 ? Math.round((s.totalScore / s.maxScore) * 100) : 0
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="border border-border/50"><CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Exam Session</p>
                        <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{s.totalScore}/{s.maxScore} ({pct}%)</p>
                        <Badge className={pct >= 75 ? "bg-green-500/15 text-green-600" : pct >= 50 ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600"}>{pct >= 75 ? "A" : pct >= 65 ? "B" : pct >= 55 ? "C" : pct >= 45 ? "D" : "F"}</Badge>
                      </div>
                    </div>
                  </CardContent></Card>
                </motion.div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
