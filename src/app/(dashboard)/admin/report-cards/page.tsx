"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"
import { Download, Printer, Send, FileText, DownloadCloud, Search, ChevronDown, User } from "lucide-react"
import { ReportCard } from "@/components/ReportCard"
import { currentSession } from "@/lib/utils"
import { downloadPng, downloadPdf, openPrintWindow, elementToPngBlob } from "@/lib/capture"
import { STANDARD_DOMAINS, computePosition } from "@/lib/report-card-constants"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"

export default function AdminReportCardsPage() {
  const [results, setResults] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [reportCards, setReportCards] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [bulkExportingZip, setBulkExportingZip] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [chartReady, setChartReady] = useState(false)
  const [entryData, setEntryData] = useState<any>(null)
  const [domainScores, setDomainScores] = useState<Record<string, number>>({})
  const [teacherComment, setTeacherComment] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [principalComment, setPrincipalComment] = useState("")
  const [nextTerm, setNextTerm] = useState("")
  const [savingEntry, setSavingEntry] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Defer chart rendering until container has dimensions
    const timer = setTimeout(() => setChartReady(true), 100)
    return () => clearTimeout(timer)
  }, [selectedStudentId, selectedTerm])

  useEffect(() => {
    Promise.all([
      fetch("/api/results").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()),
      fetch("/api/report-cards").then((r) => r.json()),
      fetch("/api/attendance-logs").then((r) => r.json()),
    ]).then(([res, stu, cls, sch, rc, att]) => {
      setResults(Array.isArray(res) ? res : [])
      setStudents(Array.isArray(stu) ? stu : [])
      setClasses(Array.isArray(cls) ? cls : [])
      setSchool(sch)
      setReportCards(Array.isArray(rc) ? rc : [])
      setAttendance(Array.isArray(att) ? att : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedStudentId) return
    const s = students.find((st) => st.id === selectedStudentId)
    const studResults = results.filter((r) => r.studentId === selectedStudentId)
    const termsList = [...new Set(studResults.map((r) => r.term))] as string[]
    const ct = selectedTerm || termsList[termsList.length - 1] || ""
    if (!ct || !s?.classId) return
    const sess = studResults.find((r) => r.term === ct)?.session || currentSession()
    setEntryData(null)
    fetch(`/api/report-card-entries?studentId=${selectedStudentId}&term=${ct}&session=${sess}&classId=${s.classId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.entry) {
          setEntryData(data.entry)
          setDomainScores((data.entry.domains as Record<string, number>) || {})
          setTeacherComment(data.entry.teacherComment || "")
          setTeacherName(data.entry.teacherName || "")
          setPrincipalComment(data.entry.principalComment || "")
          setNextTerm(data.entry.nextTerm || "")
        } else {
          setEntryData(null)
          setDomainScores({})
          setTeacherComment("")
          setTeacherName("")
          setPrincipalComment("")
          setNextTerm("")
        }
      })
      .catch(() => {})
  }, [selectedStudentId, selectedTerm, students, results])

  const student = students.find((s: any) => s.id === selectedStudentId)
  const studentResults = results.filter((r) => r.studentId === selectedStudentId)
  const terms = [...new Set(studentResults.map((r) => r.term))] as string[]
  const currentTerm = selectedTerm || terms[terms.length - 1] || ""
  const termResults = studentResults.filter((r) => r.term === currentTerm)

  const studentClass = classes.find((c) => c.id === student?.classId)
  const studentAttendance = attendance.filter((a) => a.userId === selectedStudentId)
  const allLogs = studentAttendance.filter((l) => l.userType === "student" || !l.userType)

  const termAverages = terms.map((term) => {
    const tResults = studentResults.filter((r) => r.term === term)
    const avg = tResults.length > 0 ? Math.round(tResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / tResults.length) : 0
    return { term, average: avg }
  })

  const subjectData = termResults.reduce((acc: any, r) => {
    if (!acc[r.subject]) acc[r.subject] = { subject: r.subject, totalScore: 0, totalMax: 0, count: 0 }
    acc[r.subject].totalScore += r.score || r.caScore + r.examScore || 0
    acc[r.subject].totalMax += r.totalMax || r.total || 100
    acc[r.subject].count++
    return acc
  }, {})
  const subjectChart = Object.values(subjectData).map((s: any) => ({
    subject: s.subject,
    average: Math.round((s.totalScore / s.totalMax) * 100),
  }))

  const session = termResults[0]?.session || currentSession()
  const position = student && termResults.length > 0
    ? computePosition(results, selectedStudentId, student.classId, currentTerm, session)
    : null

  const reportData = student ? {
    schoolName: school?.name || "Access School",
    schoolLogo: school?.logo || "",
    schoolMotto: school?.motto || "",
    schoolAddress: school?.address || "",
    schoolPhone: school?.phone || "",
    schoolEmail: school?.email || "",
    studentName: `${student.firstName} ${student.lastName}`,
    studentId: student?.studentId || "N/A",
    studentPhoto: student?.passportPhoto || "",
    studentGender: student?.gender || "",
    studentDOB: student?.dateOfBirth || "",
    className: studentClass?.name || "N/A",
    classSection: studentClass?.section || "",
    term: currentTerm,
    session,
    subjects: termResults.map((r: any) => ({
      subject: r.subject,
      score: r.score ?? 0,
      total: r.totalMax || r.total || 100,
      grade: r.grade || "F",
      remark: r.remark || "Needs Improvement",
      caScore: r.caScore,
      examScore: r.examScore,
      caTotal: r.caTotal,
      examTotal: r.examTotal,
    })),
    domains: STANDARD_DOMAINS.map((d) => ({
      name: d.name,
      score: domainScores[d.name] ? Math.min(domainScores[d.name], d.max) : 0,
      max: d.max,
    })),
    attendance: {
      present: allLogs.filter((l) => l.status === "present").length,
      absent: allLogs.filter((l) => l.status === "absent").length,
      late: allLogs.filter((l) => l.status === "late").length,
      total: allLogs.length,
    },
    teacherComment: teacherComment || `${student.firstName} ${student.lastName} has shown commendable effort this term.`,
    teacherName: teacherName || "",
    principalComment: principalComment || "",
    nextTerm: nextTerm || "",
    position: position ? `${position}${position === 1 ? "st" : position === 2 ? "nd" : position === 3 ? "rd" : "th"}` : "—",
    totalStudents: students.filter((s: any) => s.classId === student?.classId).length || 0,
    generatedAt: new Date().toISOString(),
  } : null

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      await downloadPdf(
        reportRef.current,
        `Report_Card_${reportData?.studentName?.replace(/\s+/g, "_")}_${currentTerm.replace(/\s+/g, "_")}.pdf`,
        { scale: 2 }
      )
      toast.success("Report card downloaded as PDF")
    } catch (err) {
      console.error("PDF export error:", err)
      toast.error("Failed to export PDF")
    }
    setExporting(false)
  }

  const handleExportPNG = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      await downloadPng(
        reportRef.current,
        `Report_Card_${reportData?.studentName?.replace(/\s+/g, "_")}_${currentTerm.replace(/\s+/g, "_")}.png`,
        { scale: 2 }
      )
      toast.success("Report card downloaded as PNG")
    } catch {
      toast.error("Failed to export")
    }
    setExporting(false)
  }

  const handlePrint = () => {
    if (!reportRef.current) return
    openPrintWindow(reportRef.current, `Report Card - ${reportData?.studentName || ""}`)
  }

  const handleExportAllZip = async () => {
    setBulkExportingZip(true)
    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()
      const termForFilter = selectedTerm || currentTerm
      const studentsWithResults = students.filter((s) => results.some((r) => r.studentId === s.id && (!selectedTerm || r.term === selectedTerm)))
      if (studentsWithResults.length === 0) { toast.error("No students with results to export"); setBulkExportingZip(false); return }

      for (let i = 0; i < studentsWithResults.length; i++) {
        const s = studentsWithResults[i]
        toast.info(`Exporting ${i + 1}/${studentsWithResults.length}: ${s.firstName} ${s.lastName}`)
        setSelectedStudentId(s.id)
        if (!selectedTerm) {
          const sResults = results.filter((r) => r.studentId === s.id)
          const sTerms = [...new Set(sResults.map((r) => r.term))] as string[]
          setSelectedTerm(sTerms[sTerms.length - 1] || "")
        }
        await new Promise((r) => setTimeout(r, 500))

        if (reportRef.current) {
          const blob = await elementToPngBlob(reportRef.current, { scale: 2 })
          zip.file(`${s.firstName}_${s.lastName}_${termForFilter}.png`, blob)
        }
      }

      const content = await zip.generateAsync({ type: "blob" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(content)
      link.download = `Report_Cards_${termForFilter}.zip`
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success(`Exported ${studentsWithResults.length} report cards as ZIP`)
    } catch (err) { console.error(err); toast.error("ZIP export failed") }
    setBulkExportingZip(false)
  }

  const handleShareWhatsApp = () => {
    if (!reportData) return
    const avg = reportData.subjects.length > 0 ? Math.round(reportData.subjects.reduce((s, r) => s + (r.score / r.total) * 100, 0) / reportData.subjects.length) : 0
    const text = `*${reportData.studentName}'s Report Card - ${currentTerm}*\nAverage: ${avg}%\n\n${reportData.subjects.map((r) => `- ${r.subject}: ${r.score}/${r.total} (${r.grade})`).join("\n")}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handleSaveEntry = async () => {
    if (!student || !currentTerm || !studentClass) return
    setSavingEntry(true)
    try {
      const res = await fetch("/api/report-card-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          classId: student.classId,
          term: currentTerm,
          session,
          teacherComment,
          teacherName,
          principalComment,
          nextTerm,
          domains: domainScores,
        }),
      })
      if (!res.ok) throw new Error("Save failed")
      const saved = await res.json()
      setEntryData(saved)
      toast.success("Domains and comments saved")
    } catch {
      toast.error("Failed to save")
    }
    setSavingEntry(false)
  }

  const setDomain = (name: string, value: number) => {
    setDomainScores((prev) => ({ ...prev, [name]: value }))
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-96"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">Student Report Cards</h2>
          <p className="text-sm text-muted-foreground">View detailed report cards for any student</p>
        </div>
        {reportData && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print</Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting}>
              <DownloadCloud className="h-4 w-4 mr-1" /> {exporting ? "..." : "PDF"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={exporting}>
              <Download className="h-4 w-4 mr-1" /> PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
              <Send className="h-4 w-4 mr-1" /> Share
            </Button>
          </div>
        )}
      </motion.div>

      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => { setSelectedStudentId(e.target.value); setSelectedTerm("") }}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              >
                <option value="">Choose a student...</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
                ))}
              </select>
            </div>
            {terms.length > 0 && (
              <div className="w-full sm:w-48">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Term</label>
                <select
                  value={currentTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                >
                  {terms.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={handleExportAllZip} disabled={bulkExportingZip} className="shrink-0">
                <DownloadCloud className="h-4 w-4 mr-1" /> {bulkExportingZip ? "Exporting..." : "Export All as ZIP"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStudentId && studentClass && (
        <Card className="glass-card border-0">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Domains & Comments — {currentTerm}</h3>
              <Button size="sm" onClick={handleSaveEntry} disabled={savingEntry}>
                {savingEntry ? "Saving..." : "Save"}
              </Button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {STANDARD_DOMAINS.map((d) => (
                <div key={d.name} className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground block">{d.name}</label>
                  <input
                    type="number" min={0} max={d.max}
                    value={domainScores[d.name] ?? ""}
                    onChange={(e) => setDomain(d.name, Math.min(Math.max(Number(e.target.value) || 0, 0), d.max))}
                    className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs text-center"
                    placeholder={`0-${d.max}`}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground block">Teacher Name</label>
                <input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="w-full rounded border border-input bg-background px-2.5 py-1.5 text-sm" placeholder="e.g. Mr. John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground block">Next Term</label>
                <input value={nextTerm} onChange={(e) => setNextTerm(e.target.value)} className="w-full rounded border border-input bg-background px-2.5 py-1.5 text-sm" placeholder="e.g. 8th September 2025" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground block">Teacher Comment</label>
              <textarea value={teacherComment} onChange={(e) => setTeacherComment(e.target.value)} rows={2} className="w-full rounded border border-input bg-background px-2.5 py-1.5 text-sm resize-none" placeholder="Enter teacher comment..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground block">Principal Comment</label>
              <textarea value={principalComment} onChange={(e) => setPrincipalComment(e.target.value)} rows={2} className="w-full rounded border border-input bg-background px-2.5 py-1.5 text-sm resize-none" placeholder="Enter principal comment..." />
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedStudentId && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">Select a Student</h3>
          <p className="text-sm text-muted-foreground">Choose a student above to view their detailed report card</p>
        </div>
      )}

      {selectedStudentId && termResults.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">No Results Found</h3>
          <p className="text-sm text-muted-foreground">No results available for {currentTerm || "the selected term"}.</p>
        </div>
      )}

      {selectedStudentId && termResults.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">Term Performance Trend</h3>
                <div ref={chartContainerRef} className="h-48 min-h-[180px] w-full" style={{ minWidth: 0 }}>
                  {chartReady && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={termAverages}>
                        <XAxis dataKey="term" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={30} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                        <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">Subject Performance (Radar)</h3>
                <div className="h-48 min-h-[180px] w-full" style={{ minWidth: 0 }}>
                  {chartReady && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={subjectChart}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                        <Radar dataKey="average" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {termAverages.map((t) => (
              <Card key={t.term} className="glass-card border-0">
                <CardContent className="p-3 text-center">
                  <p className="text-[11px] text-muted-foreground">{t.term}</p>
                  <p className="text-lg font-bold mt-1">{t.average}%</p>
                  <Badge className={t.average >= 65 ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>
                    {t.average >= 65 ? "Good" : "Needs Improvement"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
            <ReportCard ref={reportRef} data={reportData!} />
          </motion.div>
        </div>
      )}
    </div>
  )
}
