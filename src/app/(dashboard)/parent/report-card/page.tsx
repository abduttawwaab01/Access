"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Download, Printer, Send, FileText, DownloadCloud } from "lucide-react"
import { ReportCard } from "@/components/ReportCard"
import { currentSession } from "@/lib/utils"
import { useParentChildren } from "@/hooks/useParentChildren"
import { downloadPng, downloadPdf, openPrintWindow } from "@/lib/capture"

export default function ParentReportCardPage() {
  const { children, activeChild, activeChildId, setActiveChildId, loading: childrenLoading } = useParentChildren()
  const [results, setResults] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeChildId) return
    setLoading(true)
    Promise.all([
      fetch(`/api/results?studentId=${activeChildId}`).then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()),
      fetch("/api/attendance-logs").then((r) => r.json()),
    ]).then(([res, cls, sch, att]) => {
      setResults(Array.isArray(res) ? res : [])
      setClasses(Array.isArray(cls) ? cls : [])
      setSchool(sch)
      setAttendance(Array.isArray(att) ? att : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [activeChildId])

  if (childrenLoading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-96"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  if (!activeChild) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-lg">No Child Selected</h3>
        <p className="text-sm text-muted-foreground">Select a child to view their report card.</p>
      </div>
    )
  }

  const studentResults = results.filter((r: any) => r.studentId === activeChildId)
  const terms = [...new Set(studentResults.map((r: any) => r.term))] as string[]
  const currentTerm = terms[terms.length - 1] || "First Term"
  const termResults = studentResults.filter((r: any) => r.term === currentTerm)

  const studentClass = classes.find((c) => c.id === activeChild.classId)
  const childAttendance = attendance.filter((a: any) => a.userId === activeChildId)

  const reportData = {
    schoolName: school?.name || "Access School",
    schoolLogo: school?.logo || "",
    schoolMotto: school?.motto || "",
    schoolAddress: school?.address || "",
    schoolPhone: school?.phone || "",
    schoolEmail: school?.email || "",
    studentName: `${activeChild.firstName} ${activeChild.lastName}`,
    studentId: activeChild.studentId || "N/A",
    studentPhoto: activeChild.passportPhoto || "",
    studentGender: activeChild.gender || "",
    studentDOB: activeChild.dateOfBirth || "",
    className: studentClass?.name || "N/A",
    classSection: studentClass?.section || "",
    term: currentTerm,
    session: currentSession(),
    subjects: termResults.map((r: any) => ({
      subject: r.subject,
      score: r.score,
      total: r.total,
      grade: r.grade || "F",
      remark: r.remark || "Needs Improvement",
    })),
    domains: (studentClass?.section === "Early Years" || studentClass?.section === "Primary"
      ? [
          { name: "Punctuality", score: 8, max: 10 },
          { name: "Neatness", score: 7, max: 10 },
          { name: "Attentiveness", score: 9, max: 10 },
          { name: "Honesty", score: 8, max: 10 },
          { name: "Leadership", score: 7, max: 10 },
          { name: "Participation", score: 8, max: 10 },
        ]
      : [
          { name: "Critical Thinking", score: 82, max: 100 },
          { name: "Communication", score: 75, max: 100 },
          { name: "Collaboration", score: 88, max: 100 },
          { name: "Creativity", score: 70, max: 100 },
          { name: "Problem Solving", score: 78, max: 100 },
          { name: "Leadership", score: 72, max: 100 },
        ]
    ),
    attendance: {
      present: childAttendance.filter((l: any) => l.status === "present").length || 38,
      absent: childAttendance.filter((l: any) => l.status === "absent").length || 2,
      late: childAttendance.filter((l: any) => l.status === "late").length || 5,
      total: childAttendance.length || 45,
    },
    teacherComment: `${activeChild.firstName} ${activeChild.lastName} has shown good progress this term. Consistent effort in core subjects is commendable.`,
    teacherName: "Class Teacher",
    principalComment: "A student with great potential. Encouraged to participate more in extracurricular activities.",
    nextTerm: "6th January 2025",
    position: "—",
    totalStudents: 0,
    generatedAt: new Date().toISOString(),
  }

  const totalAverage = reportData.subjects.length > 0
    ? Math.round(reportData.subjects.reduce((s, r) => s + (r.score / r.total) * 100, 0) / reportData.subjects.length)
    : 0

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      await downloadPdf(
        reportRef.current,
        `Report_Card_${reportData.studentName.replace(/\s+/g, "_")}_${currentTerm.replace(/\s+/g, "_")}.pdf`,
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
        `Report_Card_${reportData.studentName.replace(/\s+/g, "_")}_${currentTerm.replace(/\s+/g, "_")}.png`,
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
    openPrintWindow(reportRef.current, `Report Card - ${reportData.studentName}`)
  }

  const handleShareWhatsApp = () => {
    const text = `*${reportData.studentName}'s Report Card - ${currentTerm}*\nAverage: ${totalAverage}%\n\n${reportData.subjects.map((r) => `- ${r.subject}: ${r.score}/${r.total} (${r.grade})`).join("\n")}\n\nView full report on Access School Portal.`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-48", "h-48 md:h-64 min-h-[180px]"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center flex-wrap gap-2 justify-between print:hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold">Report Card</h2>
          <p className="text-sm text-muted-foreground">{currentTerm} - Academic Session {currentSession()}</p>
        </motion.div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-3.5 w-3.5 mr-1" /> Print</Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting}>
            <DownloadCloud className="h-3.5 w-3.5 mr-1" /> {exporting ? "..." : "PDF"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={exporting}>
            <Download className="h-3.5 w-3.5 mr-1" /> PNG
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
            <Send className="h-3.5 w-3.5 mr-1" /> Share
          </Button>
        </div>
      </div>

      {children.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none print:hidden">
          {children.map((child: any) => (
            <button
              key={child.id}
              onClick={() => setActiveChildId(child.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all shrink-0 snap-start ${
                activeChildId === child.id
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">{child.firstName[0]}{child.lastName[0]}</AvatarFallback>
              </Avatar>
              {child.firstName} {child.lastName}
            </button>
          ))}
        </motion.div>
      )}

      {termResults.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No Report Card Available</h3>
          <p className="text-sm text-muted-foreground">Results for {currentTerm} are not yet published for this student.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
          <ReportCard ref={reportRef} data={reportData} />
        </motion.div>
      )}
    </div>
  )
}
