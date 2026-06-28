"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Save, Loader2, User, BookOpen, DownloadCloud, FileSpreadsheet, BarChart3 } from "lucide-react"
import { downloadCsv, downloadPng, downloadPdf } from "@/lib/capture"
import { currentSession } from "@/lib/utils"

const tabs = ["Score Entry", "Dashboard"]

const gradeColors: Record<string, string> = { A: "#22c55e", B: "#3b82f6", C: "#f59e0b", D: "#f97316", E: "#ef4444", F: "#dc2626" }

export default function TeacherResultsPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [myStaffId, setMyStaffId] = useState("")
  const [activeTab, setActiveTab] = useState("Score Entry")
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [gradingConfig, setGradingConfig] = useState<any>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [selectedSession, setSelectedSession] = useState(currentSession())
  const [scores, setScores] = useState<Record<string, { caScore: string; examScore: string }>>({})
  const [terms, setTerms] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [exporting, setExporting] = useState(false)
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return
    fetch("/api/staff?userId=" + userId)
      .then((r) => r.json())
      .then((staffData) => {
        const staffId = staffData?.id || ""
        setMyStaffId(staffId)
        return Promise.all([
          fetch("/api/teacher-assignments?teacherId=" + staffId).then((r) => r.json()),
          fetch("/api/classes").then((r) => r.json()),
          fetch("/api/subjects").then((r) => r.json()),
          fetch("/api/students").then((r) => r.json()),
          fetch("/api/terms").then((r) => r.json()),
          fetch("/api/grading-config").then((r) => r.json()),
          fetch("/api/sessions").then((r) => r.json()),
          staffId,
        ])
      })
      .then(([assignments, cls, sub, stu, trm, gc, sessData, staffId]) => {
        const assigns = Array.isArray(assignments) ? assignments : []
        const myAssignment = assigns.find((a: any) => a.teacherId === staffId)
        setAssignment(myAssignment)
        const allClasses = Array.isArray(cls) ? cls : []
        const allSubjects = Array.isArray(sub) ? sub : []
        const allStudents = Array.isArray(stu) ? stu : []
      if (myAssignment) {
        setClasses(allClasses.filter((c: any) => myAssignment.classIds?.includes(c.id)))
        setSubjects(allSubjects.filter((s: any) => myAssignment.subjectIds?.includes(s.id)))
        setStudents(allStudents.filter((s: any) => myAssignment.classIds?.includes(s.classId)))
      } else {
        setClasses(allClasses); setSubjects(allSubjects); setStudents(allStudents)
      }
      setTerms(Array.isArray(trm) ? trm : [])
      setSessions(Array.isArray(sessData) ? sessData : [])
      setGradingConfig(gc)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId || !selectedTerm) return
    setScores({})
    const params = new URLSearchParams({ classId: selectedClassId, subjectId: selectedSubjectId, term: selectedTerm })
    if (selectedSession) params.set("session", selectedSession)
    if (myStaffId) params.set("teacherId", myStaffId)
    fetch(`/api/results?${params}`).then((r) => r.json()).then((data) => {
      setResults(Array.isArray(data) ? data : [])
      const initial: Record<string, { caScore: string; examScore: string }> = {}
      ;(Array.isArray(data) ? data : []).forEach((r: any) => { initial[r.studentId] = { caScore: r.caScore?.toString() ?? "", examScore: r.examScore?.toString() ?? "" } })
      setScores(initial)
    }).catch(() => {})
  }, [selectedClassId, selectedSubjectId, selectedTerm, selectedSession, myStaffId])

  const classSubjects = subjects.filter((s) => s.classId === selectedClassId)
  const classStudents = students.filter((s) => s.classId === selectedClassId).sort((a, b) => a.firstName?.localeCompare(b.firstName))
  const caMax = gradingConfig?.caMax ?? 40
  const examMax = gradingConfig?.examMax ?? 60

  const handleScoreChange = (studentId: string, field: "caScore" | "examScore", value: string) => {
    const num = value === "" ? "" : Math.min(Math.max(Number(value) || 0, 0), field === "caScore" ? caMax : examMax)
    setScores((prev) => ({ ...prev, [studentId]: { ...prev[studentId] || { caScore: "", examScore: "" }, [field]: num === "" ? "" : String(num) } }))
  }

  const existingResult = (studentId: string) => results.find((r) => r.studentId === studentId)

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const updates = classStudents.map((s) => {
        const sc = scores[s.id]
        const existing = existingResult(s.id)
        return {
          id: existing?.id || undefined,
          studentId: s.id,
          subjectId: selectedSubjectId,
          classId: selectedClassId,
          subject: subjects.find((sub) => sub.id === selectedSubjectId)?.name || "",
          caScore: Number(sc?.caScore) || 0,
          examScore: Number(sc?.examScore) || 0,
          term: selectedTerm,
          session: selectedSession || currentSession(),
          createdBy: myStaffId,
        }
      })
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error")
        throw new Error(errText)
      }
      const saved = await res.json()
      toast.success(`Saved ${saved.length} results`)
      const params = new URLSearchParams({ classId: selectedClassId, subjectId: selectedSubjectId, term: selectedTerm })
      if (selectedSession) params.set("session", selectedSession)
      if (myStaffId) params.set("teacherId", myStaffId)
      const fresh = await fetch(`/api/results?${params}`); const freshData = await fresh.json()
      setResults(Array.isArray(freshData) ? freshData : [])
    } catch (err) { toast.error("Failed to save results") }
    setSaving(false)
  }

  const getTotal = (sId: string) => { const sc = scores[sId]; return (Number(sc?.caScore) || 0) + (Number(sc?.examScore) || 0) }

  const getGrade = (total: number) => {
    const boundaries = [...(gradingConfig?.gradeBoundaries || [])].sort((a, b) => b.min - a.min)
    const pct = total / (caMax + examMax) * 100
    for (const b of boundaries) { if (pct >= b.min) return b.grade }
    return "F"
  }

  // Dashboard calculations
  const scoredStudents = results.filter((r) => r.studentId && classStudents.some((s) => s.id === r.studentId))
  const avgScore = scoredStudents.length > 0 ? Math.round(scoredStudents.reduce((s, r) => s + (r.total || 0), 0) / scoredStudents.length) : 0
  const passMark = (caMax + examMax) * 0.5
  const passedCount = scoredStudents.filter((r) => (r.total || 0) >= passMark).length
  const passRate = scoredStudents.length > 0 ? Math.round((passedCount / scoredStudents.length) * 100) : 0
  const gradeDist = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
  const sortedBoundaries = [...(gradingConfig?.gradeBoundaries || [])].sort((a, b) => b.min - a.min)
  const getGradeFromTotal = (total: number) => {
    const pct = total / (caMax + examMax) * 100
    for (const b of sortedBoundaries) { if (pct >= b.min) return b.grade }
    return "F"
  }
  scoredStudents.forEach((r) => { const g = getGradeFromTotal(r.total || 0); if (gradeDist[g as keyof typeof gradeDist] !== undefined) gradeDist[g as keyof typeof gradeDist]++ })
  const gradeChartData = Object.entries(gradeDist).map(([grade, count]) => ({ grade, count, fill: gradeColors[grade] || "#888" }))
  const studentChartData = scoredStudents.map((r) => { const s = students.find((st) => st.id === r.studentId); return { name: s ? `${s.firstName} ${s.lastName}` : r.studentId, score: r.total || 0 } }).sort((a, b) => b.score - a.score)

  const handleExportCSV = () => {
    const data = classStudents.map((s) => {
      const r = scoredStudents.find((res) => res.studentId === s.id)
      return { "Student Name": `${s.firstName} ${s.lastName}`, "Student ID": s.studentId || s.id, "CA Score": r?.caScore ?? "", "Exam Score": r?.examScore ?? "", "Total": r?.total ?? "", "Grade": r?.grade ?? "" }
    })
    downloadCsv(data, `Results_${subjects.find((s) => s.id === selectedSubjectId)?.name || "results"}_${selectedTerm}.csv`)
  }

  const handleExportDashboardPNG = async () => {
    if (!dashboardRef.current) return; setExporting(true)
    try { await downloadPng(dashboardRef.current, `Results_Dashboard_${selectedTerm}.png`, { scale: 2, backgroundColor: "#ffffff" }); toast.success("Dashboard exported as PNG") } catch { toast.error("Export failed") }
    setExporting(false)
  }

  const handleExportDashboardPDF = async () => {
    if (!dashboardRef.current) return; setExporting(true)
    try { await downloadPdf(dashboardRef.current, `Results_Dashboard_${selectedTerm}.pdf`, { scale: 2, backgroundColor: "#ffffff" }); toast.success("Dashboard exported as PDF") } catch { toast.error("Export failed") }
    setExporting(false)
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div><h2 className="text-xl md:text-2xl font-bold">Results</h2><p className="text-sm text-muted-foreground">Manage and analyze your students&apos; scores</p></div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t === "Dashboard" ? <><BarChart3 className="h-3.5 w-3.5 inline mr-1" />{t}</> : t}</button>
        ))}
      </div>

      {activeTab === "Score Entry" && (
        <>
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Class</Label>
                  <select value={selectedClassId} onChange={(e) => { setSelectedClassId(e.target.value); setSelectedSubjectId(""); setResults([]); setScores({}) }} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11">
                    <option value="">Select class...</option>
                    {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Subject</Label>
                  <select value={selectedSubjectId} onChange={(e) => { setSelectedSubjectId(e.target.value) }} disabled={!selectedClassId} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11">
                    <option value="">Select subject...</option>
                    {classSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Term</Label>
                  <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11">
                    <option value="">Select term...</option>
                    {terms.map((t: any) => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Session</Label>
                  <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11">
                    <option value="">Select session...</option>
                    {sessions.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedClassId && selectedSubjectId && selectedTerm && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground"><BookOpen className="h-4 w-4 inline mr-1" />{classStudents.length} students · CA out of {caMax} · Exam out of {examMax}</p>
                <Button onClick={handleSaveAll} disabled={saving} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}Save All
                </Button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border/50">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50">
                    <th className="text-left px-3 py-2.5 font-semibold text-xs">#</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-xs">Student</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-xs">CA Score ({caMax})</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-xs">Exam Score ({examMax})</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-xs">Total ({caMax + examMax})</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-xs">Grade</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-xs">Status</th>
                  </tr></thead>
                  <tbody>
                    {classStudents.map((s, i) => {
                      const total = getTotal(s.id); const grade = getGrade(total); const existing = existingResult(s.id)
                      return (
                        <tr key={s.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                          <td className="px-3 py-2"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-3.5 w-3.5 text-primary" /></div><span className="font-medium">{s.firstName} {s.lastName}</span></div></td>
                          <td className="px-3 py-2"><Input type="number" min={0} max={caMax} value={scores[s.id]?.caScore ?? ""} onChange={(e) => handleScoreChange(s.id, "caScore", e.target.value)} className="h-9 w-20 mx-auto text-center" placeholder="0" /></td>
                          <td className="px-3 py-2"><Input type="number" min={0} max={examMax} value={scores[s.id]?.examScore ?? ""} onChange={(e) => handleScoreChange(s.id, "examScore", e.target.value)} className="h-9 w-20 mx-auto text-center" placeholder="0" /></td>
                          <td className="px-3 py-2 text-center font-mono font-bold">{total > 0 ? total : "-"}</td>
                          <td className="px-3 py-2 text-center">{total > 0 ? <Badge className={grade === "A" ? "bg-green-500/15 text-green-600" : grade === "B" ? "bg-blue-500/15 text-blue-600" : grade === "C" ? "bg-amber-500/15 text-amber-600" : grade === "D" ? "bg-orange-500/15 text-orange-600" : "bg-red-500/15 text-red-600"}>{grade}</Badge> : "-"}</td>
                          <td className="px-3 py-2 text-center">{existing ? <Badge variant="outline" className="text-[10px] border-green-300 text-green-600">Saved</Badge> : <Badge variant="outline" className="text-[10px] text-muted-foreground">New</Badge>}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "Dashboard" && (
        <div ref={dashboardRef} className="space-y-6 bg-white rounded-2xl p-6 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select value={selectedClassId} onChange={(e) => { setSelectedClassId(e.target.value); setSelectedSubjectId("") }} className="rounded-lg border border-input bg-background px-3 py-2 text-sm h-10">
                <option value="">All classes</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} disabled={!selectedClassId} className="rounded-lg border border-input bg-background px-3 py-2 text-sm h-10">
                <option value="">All subjects</option>
                {classSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm h-10">
                <option value="">All terms</option>
                {terms.map((t: any) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}><FileSpreadsheet className="h-4 w-4 mr-1" />CSV</Button>
              <Button variant="outline" size="sm" onClick={handleExportDashboardPNG} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PNG</Button>
              <Button variant="outline" size="sm" onClick={handleExportDashboardPDF} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PDF</Button>
            </div>
          </div>

          {selectedClassId && selectedSubjectId && selectedTerm && scoredStudents.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{classStudents.length}</p><p className="text-xs text-muted-foreground">Total Students</p></CardContent></Card>
                <Card className="border border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{avgScore}<span className="text-sm text-muted-foreground">/{caMax + examMax}</span></p><p className="text-xs text-muted-foreground">Average Score</p></CardContent></Card>
                <Card className="border border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{passRate}%</p><p className="text-xs text-muted-foreground">Pass Rate</p></CardContent></Card>
                <Card className="border border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{scoredStudents.length}</p><p className="text-xs text-muted-foreground">Scored</p></CardContent></Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-border/50">
                  <CardHeader><CardTitle className="text-sm font-semibold">Grade Distribution</CardTitle></CardHeader>
                  <CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeChartData}><XAxis dataKey="grade" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" name="Students">{gradeChartData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}</Bar></BarChart>
                  </ResponsiveContainer></div></CardContent>
                </Card>
                <Card className="border border-border/50">
                  <CardHeader><CardTitle className="text-sm font-semibold">Score Distribution</CardTitle></CardHeader>
                  <CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentChartData.slice(0, 20)} layout="vertical">
                      <XAxis type="number" domain={[0, caMax + examMax]} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer></div></CardContent>
                </Card>
              </div>

              <Card className="border border-border/50">
                <CardHeader><CardTitle className="text-sm font-semibold">Student Scores</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-muted/50">
                        <th className="text-left px-3 py-2 font-semibold text-xs">#</th>
                        <th className="text-left px-3 py-2 font-semibold text-xs">Student</th>
                        <th className="text-center px-3 py-2 font-semibold text-xs">CA</th>
                        <th className="text-center px-3 py-2 font-semibold text-xs">Exam</th>
                        <th className="text-center px-3 py-2 font-semibold text-xs">Total</th>
                        <th className="text-center px-3 py-2 font-semibold text-xs">Grade</th>
                      </tr></thead>
                      <tbody>
                        {studentChartData.map((item, i) => {
                          const r = scoredStudents.find((res) => { const s = students.find((st) => st.id === res.studentId); return s ? `${s.firstName} ${s.lastName}` === item.name : false })
                          return (
                            <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                              <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                              <td className="px-3 py-2 font-medium">{item.name}</td>
                              <td className="px-3 py-2 text-center">{r?.caScore ?? "-"}</td>
                              <td className="px-3 py-2 text-center">{r?.examScore ?? "-"}</td>
                              <td className="px-3 py-2 text-center font-mono font-bold">{item.score}</td>
                              <td className="px-3 py-2 text-center">{item.score > 0 && <Badge className={r?.grade === "A" ? "bg-green-500/15 text-green-600" : r?.grade === "B" ? "bg-blue-500/15 text-blue-600" : r?.grade === "C" ? "bg-amber-500/15 text-amber-600" : r?.grade === "D" ? "bg-orange-500/15 text-orange-600" : "bg-red-500/15 text-red-600"}>{r?.grade || "F"}</Badge>}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">
              {selectedClassId && selectedSubjectId && selectedTerm ? "No results found" : "Select class, subject, and term"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}