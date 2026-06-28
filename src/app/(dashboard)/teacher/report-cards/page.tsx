"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Download, Printer, Send, FileText, DownloadCloud, User, Award } from "lucide-react"
import { ReportCard } from "@/components/ReportCard"
import { currentSession } from "@/lib/utils"
import { downloadPng, downloadPdf, openPrintWindow, elementToPngBlob } from "@/lib/capture"
import { STANDARD_DOMAINS, computePosition, DEFAULT_GRADE_BOUNDARIES, type GradeBoundary } from "@/lib/report-card-constants"
import { useSession } from "next-auth/react"

export default function TeacherReportCardsPage() {
  const { data: authData } = useSession()
  const userId = (authData?.user as any)?.id || ""
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [gradeBoundaries, setGradeBoundaries] = useState<GradeBoundary[]>(DEFAULT_GRADE_BOUNDARIES)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedTermName, setSelectedTermName] = useState("")
  const [terms, setTerms] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])

  const [domainScores, setDomainScores] = useState<Record<string, number>>({})
  const [teacherComment, setTeacherComment] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [savingEntry, setSavingEntry] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
        if (!userId) return
    let resolvedStaffId = ""
    fetch("/api/staff?userId=" + userId)
      .then((r) => r.json())
      .then((staffData) => {
        resolvedStaffId = staffData?.id || ""
        return fetch("/api/teacher-assignments?teacherId=" + resolvedStaffId).then((r) => r.json())
      })
      .then((assignments) => {
        const assigns = Array.isArray(assignments) ? assignments : []
        const myAssignment = assigns.find((a: any) => a.teacherId === resolvedStaffId)
        const assignedClassIds: string[] = myAssignment?.classIds || []

        return Promise.all([
          Promise.resolve(assignedClassIds.length > 0 ? assignedClassIds : []),
          assignedClassIds.length > 0
            ? fetch("/api/classes").then((r) => r.json()).then((all) => all.filter((c: any) => assignedClassIds.includes(c.id)))
            : Promise.resolve([]),
          assignedClassIds.length > 0
            ? fetch("/api/students").then((r) => r.json()).then((all) => all.filter((s: any) => assignedClassIds.includes(s.classId)))
            : Promise.resolve([]),
          fetch("/api/school").then((r) => r.json()),
          assignedClassIds.length > 0
            ? fetch("/api/results?teacherId=" + resolvedStaffId).then((r) => r.json())
            : Promise.resolve([]),
          assignedClassIds.length > 0
            ? fetch("/api/attendance-logs?teacherId=" + resolvedStaffId).then((r) => r.json())
            : Promise.resolve([]),
          fetch("/api/terms").then((r) => r.json()),
          fetch("/api/sessions").then((r) => r.json()),
          fetch("/api/grading-config").then((r) => r.json()),
        ])
      })
      .then(([assignedClassIds, cls, stu, sch, res, att, trms, sess, gc]) => {
        const allClasses = Array.isArray(cls) ? cls : []
        const allStudents = Array.isArray(stu) ? stu : []
        const allTerms = Array.isArray(trms) ? trms : []
        const allSessions = Array.isArray(sess) ? sess : []

        setClasses(allClasses)
        setStudents(allStudents)
        setTerms(allTerms)
        setSessions(allSessions)
        setResults(Array.isArray(res) ? res : [])
        setSchool(sch)
        setAttendance(Array.isArray(att) ? att : [])
        if (gc?.gradeBoundaries) setGradeBoundaries(gc.gradeBoundaries)

        const currentSess = allSessions.find((s: any) => s.isCurrent)
        const currentTerm = allTerms.find((t: any) => t.isCurrent)
        setSelectedTermName(currentTerm?.name || (allTerms.length > 0 ? allTerms[0].name : ""))
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [userId])

  const student = students.find((s: any) => s.id === selectedStudentId)
  const studentResults = results.filter((r) => r.studentId === selectedStudentId && r.classId === student?.classId)
  const termNames = [...new Set(studentResults.map((r) => r.term))] as string[]
  const currentTerm = selectedTermName || termNames[termNames.length - 1] || ""
  const termResults = studentResults.filter((r) => r.term === currentTerm)
  const session = termResults[0]?.session || sessions.find((s: any) => s.isCurrent)?.name || currentSession()

  const studentClass = classes.find((c) => c.id === student?.classId)
  const studentAttendance = attendance.filter((a) => a.userId === selectedStudentId)
  const allLogs = studentAttendance.filter((l) => l.userType === "student" || !l.userType)

  useEffect(() => {
    if (!selectedStudentId || !student?.classId) return
    const res = results.filter((r) => r.studentId === selectedStudentId && r.classId === student?.classId)
    const tList = [...new Set(res.map((r) => r.term))] as string[]
    const ct = selectedTermName || tList[tList.length - 1] || ""
    if (!ct) return
    const sess = res.find((r) => r.term === ct)?.session || currentSession()
    fetch(`/api/report-card-entries?studentId=${selectedStudentId}&term=${ct}&session=${sess}&classId=${student.classId}`)
      .then((r) => r.json())
      .then((data) => {
        const entry = data?.entry
        setDomainScores(entry?.domains ? (entry.domains as Record<string, number>) : {})
        setTeacherComment(entry?.teacherComment || "")
        setTeacherName(entry?.teacherName || "")
      })
      .catch(() => {})
  }, [selectedStudentId, selectedTermName])

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
          domains: domainScores,
        }),
      })
      if (!res.ok) throw new Error("Save failed")
      toast.success("Domains and comment saved")
    } catch {
      toast.error("Failed to save")
    }
    setSavingEntry(false)
  }

  const setDomain = (name: string, value: number) => {
    setDomainScores((prev) => ({ ...prev, [name]: value }))
  }

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
    teacherComment: teacherComment || "",
    teacherName: teacherName || "",
    principalComment: "",
    nextTerm: "",
    position: position ? `${position}${position === 1 ? "st" : position === 2 ? "nd" : position === 3 ? "rd" : "th"}` : "â€”",
    totalStudents: students.filter((s: any) => s.classId === student?.classId).length || 0,
    generatedAt: new Date().toISOString(),
  } : null

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      await downloadPdf(reportRef.current, `Report_Card_${reportData?.studentName?.replace(/\s+/g, "_")}_${currentTerm.replace(/\s+/g, "_")}.pdf`, { scale: 2 })
      toast.success("Report card downloaded as PDF")
    } catch {
      toast.error("Failed to export PDF")
    }
    setExporting(false)
  }

  const handleExportPNG = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      await downloadPng(reportRef.current, `Report_Card_${reportData?.studentName?.replace(/\s+/g, "_")}_${currentTerm.replace(/\s+/g, "_")}.png`, { scale: 2 })
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

  const handleShareWhatsApp = () => {
    if (!reportData) return
    const avg = reportData.subjects.length > 0
      ? Math.round(reportData.subjects.reduce((s, r) => s + (r.score / r.total) * 100, 0) / reportData.subjects.length)
      : 0
    const text = `*${reportData.studentName}'s Report Card - ${currentTerm}*\nAverage: ${avg}%\n\n${reportData.subjects.map((r) => `- ${r.subject}: ${r.score}/${r.total} (${r.grade})`).join("\n")}\n\nView full report on Access School Portal.`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1, 2].map((i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">Report Cards</h2>
          <p className="text-sm text-muted-foreground">Generate report cards for your students</p>
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
              <select value={selectedStudentId} onChange={(e) => { setSelectedStudentId(e.target.value); setSelectedTermName("") }} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
                <option value="">Choose a student...</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId || s.id})</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Term</label>
              <select value={selectedTermName} onChange={(e) => setSelectedTermName(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
                {terms.map((t: any) => (
                  <option key={t.id} value={t.name}>{t.name}{t.isCurrent ? " (Current)" : ""}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStudentId && studentClass && (
        <Card className="glass-card border-0">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Domains & Comment â€” {currentTerm}</h3>
              <Button size="sm" onClick={handleSaveEntry} disabled={savingEntry}>
                {savingEntry ? "Saving..." : "Save"}
              </Button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {STANDARD_DOMAINS.map((d) => (
                <div key={d.name} className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground block">{d.name}</label>
                  <input type="number" min={0} max={d.max} value={domainScores[d.name] ?? ""} onChange={(e) => setDomain(d.name, Math.min(Math.max(Number(e.target.value) || 0, 0), d.max))} className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs text-center" placeholder={`0-${d.max}`} />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground block">Your Name (Teacher)</label>
              <input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="w-full rounded border border-input bg-background px-2.5 py-1.5 text-sm" placeholder="e.g. Mr. John Doe" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground block">Teacher Comment</label>
              <textarea value={teacherComment} onChange={(e) => setTeacherComment(e.target.value)} rows={3} className="w-full rounded border border-input bg-background px-2.5 py-1.5 text-sm resize-none" placeholder="Write your comment about this student's performance this term..." />
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedStudentId && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Award className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">Select a Student</h3>
          <p className="text-sm text-muted-foreground">Choose a student to generate their report card</p>
        </div>
      )}

      {selectedStudentId && termResults.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">No Results Found</h3>
          <p className="text-sm text-muted-foreground">No scores available for {currentTerm || "the selected term"}. Enter results first via the Results page.</p>
        </div>
      )}

      {selectedStudentId && termResults.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="overflow-x-auto overflow-y-auto flex justify-center rounded-xl" style={{ maxHeight: "min(75dvh, 600px)" }}>
          <ReportCard ref={reportRef} data={reportData!} gradeBoundaries={gradeBoundaries} />
        </motion.div>
      )}
    </div>
  )
}

