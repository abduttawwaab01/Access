"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { Download, Printer, Share2, Send, Award, TrendingUp, CalendarCheck, User, FileText, DownloadCloud } from "lucide-react"
import { toast } from "sonner"

export default function StudentReportCardPage() {
  const [results, setResults] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const reportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const studentId = "1"
  const studentName = "Alice Johnson"

  useEffect(() => {
    Promise.all([
      fetch(`/api/results?studentId=${studentId}`),
      fetch("/api/students"),
    ]).then(async ([r, s]) => {
      setResults(await r.json())
      setStudents(await s.json())
      setLoading(false)
    })
  }, [])

  const student = students.find((s: any) => s.id === studentId)
  const className = student ? `${student.firstName} ${student.lastName}` : studentName

  const terms = [...new Set(results.map((r) => r.term))]
  const currentTerm = terms[terms.length - 1] || "First Term"
  const termResults = results.filter((r) => r.term === currentTerm)

  const totalScore = termResults.reduce((s, r) => s + r.score, 0)
  const totalMax = termResults.reduce((s, r) => s + r.total, 0)
  const average = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

  const getGrade = (pct: number) => {
    if (pct >= 75) return { grade: "A", remark: "Excellent" }
    if (pct >= 65) return { grade: "B", remark: "Very Good" }
    if (pct >= 55) return { grade: "C", remark: "Good" }
    if (pct >= 45) return { grade: "D", remark: "Fair" }
    if (pct >= 40) return { grade: "E", remark: "Pass" }
    return { grade: "F", remark: "Fail" }
  }

  const radarData = termResults.map((r) => {
    const pct = Math.round((r.score / r.total) * 100)
    return { subject: r.subject, score: pct, fullMark: 100 }
  })

  const domains = [
    { name: "Critical Thinking", score: 82, max: 100 },
    { name: "Communication", score: 75, max: 100 },
    { name: "Collaboration", score: 88, max: 100 },
    { name: "Creativity", score: 70, max: 100 },
    { name: "Problem Solving", score: 78, max: 100 },
    { name: "Leadership", score: 72, max: 100 },
  ]

  const attendance = { present: 38, absent: 2, late: 5, total: 45 }

  const letterGrade = getGrade(average)

  const handlePrint = () => {
    window.print()
  }

  const handleExportPNG = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
      const link = document.createElement("a")
      link.download = `Report_Card_${studentName.replace(" ", "_")}_${currentTerm.replace(" ", "_")}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("Report card downloaded as PNG")
    } catch {
      toast.error("Failed to export")
    }
    setExporting(false)
  }

  const handleShareWhatsApp = () => {
    const text = `*${studentName}'s Report Card - ${currentTerm}*\nAverage: ${average}%\nGrade: ${letterGrade.grade} (${letterGrade.remark})\n\nSubjects:\n${termResults.map((r) => `- ${r.subject}: ${r.score}/${r.total} (${r.grade})`).join("\n")}\n\nView full report on Access School Portal.`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handleShareEmail = () => {
    const subject = `${studentName}'s Report Card - ${currentTerm}`
    const body = `Dear Parent,\n\nPlease find below ${studentName}'s report card for ${currentTerm}.\n\nAverage Score: ${average}%\nGrade: ${letterGrade.grade} (${letterGrade.remark})\n\nSubject Breakdown:\n${termResults.map((r) => `- ${r.subject}: ${r.score}/${r.total} (${r.grade})`).join("\n")}\n\nPlease log in to the parent portal for more details.\n\nBest regards,\nAccess School`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank")
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-48", "h-32", "h-64", "h-48"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  if (termResults.length === 0) return (
    <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h3 className="font-semibold text-lg">No Report Card Available</h3>
      <p className="text-sm text-muted-foreground">Results for {currentTerm} are not yet published.</p>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold">Report Card</h2>
          <p className="text-sm text-muted-foreground">{currentTerm} - Academic Session 2024/2025</p>
        </motion.div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print</Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={exporting}>
            <DownloadCloud className="h-4 w-4 mr-1" /> {exporting ? "Exporting..." : "PNG"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareWhatsApp}><Send className="h-4 w-4 mr-1" /> WhatsApp</Button>
          <Button variant="outline" size="sm" onClick={handleShareEmail}><Share2 className="h-4 w-4 mr-1" /> Email</Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        <div ref={reportRef} className="bg-white rounded-2xl shadow-xl overflow-hidden border">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-6 text-white text-center">
            <h1 className="text-2xl font-bold tracking-tight">ACCESS SCHOOL</h1>
            <p className="text-sm opacity-80 mt-1">Student Report Card</p>
            <div className="mt-4 flex items-center justify-center gap-8 text-sm">
              <div className="text-center">
                <p className="opacity-70 text-xs">Student</p>
                <p className="font-semibold">{studentName}</p>
              </div>
              <div className="text-center">
                <p className="opacity-70 text-xs">Class</p>
                <p className="font-semibold">Grade 10A</p>
              </div>
              <div className="text-center">
                <p className="opacity-70 text-xs">Term</p>
                <p className="font-semibold">{currentTerm}</p>
              </div>
              <div className="text-center">
                <p className="opacity-70 text-xs">Session</p>
                <p className="font-semibold">2024/2025</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Overall Score */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
                  <div>
                    <p className="text-3xl font-bold">{average}%</p>
                    <p className="text-[10px] opacity-80">Average</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  <div>
                    <p className="text-3xl font-bold">{letterGrade.grade}</p>
                    <p className="text-[10px] opacity-80">Grade</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-green-600">Position: 1st</p>
                <p className="text-xs text-muted-foreground mt-1">Out of {students.length || 30} students</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Award className="h-3 w-3" /> {letterGrade.remark}
                </div>
              </div>
            </div>

            <Separator />

            {/* Subject Scores */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Subject Performance</h3>
              <div className="space-y-3">
                {termResults.map((r) => {
                  const pct = Math.round((r.score / r.total) * 100)
                  const g = getGrade(pct)
                  const color = pct >= 75 ? "bg-green-500" : pct >= 55 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
                  return (
                    <div key={r.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{r.subject}</span>
                          <Badge className={`text-[10px] px-1.5 py-0 ${g.grade === "A" ? "bg-green-500/15 text-green-600" : g.grade === "B" ? "bg-blue-500/15 text-blue-600" : g.grade === "C" ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600"}`}>{g.grade}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono">{r.score}/{r.total}</span>
                          <span className="text-xs text-muted-foreground w-16 text-right">{g.remark}</span>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress value={pct} className="h-2.5" />
                        <div className={`absolute top-0 left-0 h-2.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%`, opacity: 0.3 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Radar + Domains */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Subject Radar</h3>
                <div className="h-56">
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
                <h3 className="font-semibold mb-3">Competency Domains</h3>
                <div className="space-y-3">
                  {domains.map((d) => (
                    <div key={d.name}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span>{d.name}</span>
                        <span className="font-mono">{d.score}/{d.max}</span>
                      </div>
                      <Progress value={(d.score / d.max) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Attendance Summary */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><CalendarCheck className="h-4 w-4" /> Attendance Summary</h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="rounded-xl bg-green-50 p-3"><p className="text-lg font-bold text-green-600">{attendance.present}</p><p className="text-[10px] text-muted-foreground">Present</p></div>
                <div className="rounded-xl bg-red-50 p-3"><p className="text-lg font-bold text-red-600">{attendance.absent}</p><p className="text-[10px] text-muted-foreground">Absent</p></div>
                <div className="rounded-xl bg-amber-50 p-3"><p className="text-lg font-bold text-amber-600">{attendance.late}</p><p className="text-[10px] text-muted-foreground">Late</p></div>
                <div className="rounded-xl bg-blue-50 p-3"><p className="text-lg font-bold text-blue-600">{Math.round(attendance.present / attendance.total * 100)}%</p><p className="text-[10px] text-muted-foreground">Rate</p></div>
              </div>
            </div>

            <Separator />

            {/* Comments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Teacher's Comment</p>
                <p className="text-sm italic">{studentName} has shown good progress this term. Consistent effort in Mathematics and English is commendable. Needs to improve in Biology. Keep up the good work!</p>
                <p className="text-xs text-muted-foreground mt-2">— Mrs. Grace Hopper</p>
              </div>
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Principal's Comment</p>
                <p className="text-sm italic">A well-rounded student with great potential. Encouraged to participate more in extracurricular activities.</p>
                <p className="text-xs text-muted-foreground mt-2">— Principal</p>
              </div>
            </div>

            {/* Next Term Info */}
            <div className="rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 p-4 text-center text-sm text-muted-foreground">
              Next Term Begins: <strong>January 6, 2025</strong> | Report Generated: <strong>{new Date().toLocaleDateString()}</strong>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
