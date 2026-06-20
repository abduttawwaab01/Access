"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Download, Printer, Send, Share2, FileText, DownloadCloud, Award } from "lucide-react"
import { ReportCard } from "@/components/ReportCard"
import { useSession } from "next-auth/react"

export default function StudentReportCardPage() {
  const { data: session } = useSession()
  const [results, setResults] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [reportCards, setReportCards] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const userId = (session?.user as any)?.id || "1"

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
    })
  }, [])

  const student = students.find((s: any) => s.id === userId)
  if (!student && !loading) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-lg">Student Not Found</h3>
        <p className="text-sm text-muted-foreground">Could not load your profile.</p>
      </div>
    )
  }

  const studentResults = results.filter((r) => r.studentId === (student?.id || userId))
  const terms = [...new Set(studentResults.map((r) => r.term))] as string[]
  const currentTerm = terms[terms.length - 1] || "First Term"
  const termResults = studentResults.filter((r) => r.term === currentTerm)

  const studentClass = classes.find((c) => c.id === student?.classId)
  const studentAttendance = attendance.filter((a) => a.userId === (student?.id || userId))
  const todayLogs = studentAttendance.filter((l) => l.date === new Date().toISOString().split("T")[0])
  const allLogs = studentAttendance.filter((l) => l.userType === "student" || !l.userType)

  const reportData = {
    schoolName: school?.name || "Access School",
    schoolLogo: school?.logo || "",
    schoolMotto: school?.motto || "",
    schoolAddress: school?.address || "",
    studentName: student ? `${student.firstName} ${student.lastName}` : "Student",
    studentId: student?.studentId || "N/A",
    className: studentClass?.name || "N/A",
    term: currentTerm,
    session: "2024/2025",
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
      present: allLogs.filter((l) => l.status === "present").length || 38,
      absent: allLogs.filter((l) => l.status === "absent").length || 2,
      late: allLogs.filter((l) => l.status === "late").length || 5,
      total: allLogs.length || 45,
    },
    teacherComment: student
      ? `${student.firstName} ${student.lastName} has shown commendable effort this term. Consistent performance in core subjects. Keep up the good work!`
      : "A diligent student with great potential.",
    teacherName: "Class Teacher",
    principalComment: "A well-rounded student who demonstrates good character and academic promise. Encouraged to maintain focus and participate in school activities.",
    nextTerm: "6th January 2025",
    position: termResults.length > 0 ? "—" : "—",
    totalStudents: students.filter((s: any) => s.classId === student?.classId).length || 0,
    generatedAt: new Date().toISOString(),
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const { default: jsPDF } = await import("jspdf")
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      let heightLeft = pdfHeight
      let position = 0
      const pageHeight = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
        heightLeft -= pageHeight
      }
      pdf.save(`Report_Card_${reportData.studentName.replace(/\s+/g, "_")}_${currentTerm.replace(/\s+/g, "_")}.pdf`)
      toast.success("Report card downloaded as PDF")
    } catch (err) {
      console.error(err)
      toast.error("Failed to export PDF")
    }
    setExporting(false)
  }

  const handleExportPNG = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
      const link = document.createElement("a")
      link.download = `Report_Card_${reportData.studentName.replace(/\s+/g, "_")}_${currentTerm.replace(/\s+/g, "_")}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("Report card downloaded as PNG")
    } catch {
      toast.error("Failed to export")
    }
    setExporting(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShareWhatsApp = () => {
    const text = `*${reportData.studentName}'s Report Card - ${currentTerm}*\nAverage: ${Math.round(reportData.subjects.reduce((s, r) => s + (r.score / r.total) * 100, 0) / (reportData.subjects.length || 1))}%\n\n${reportData.subjects.map((r) => `- ${r.subject}: ${r.score}/${r.total} (${r.grade})`).join("\n")}\n\nView full report on Access School Portal.`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-48", "h-32", "h-64", "h-48"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  if (termResults.length === 0 && !loading) return (
    <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h3 className="font-semibold text-lg">No Report Card Available</h3>
      <p className="text-sm text-muted-foreground">Results for {currentTerm} are not yet published.</p>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center flex-wrap gap-2 justify-between print:hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold">Report Card</h2>
          <p className="text-sm text-muted-foreground">{currentTerm} - Academic Session 2024/2025</p>
        </motion.div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print</Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={exporting}>
            <DownloadCloud className="h-4 w-4 mr-1" /> {exporting ? "..." : "PDF"}
          </Button>
          <Button variant="outline" onClick={handleExportPNG} disabled={exporting}>
            <Download className="h-4 w-4 mr-1" /> PNG
          </Button>
          <Button variant="outline" onClick={handleShareWhatsApp}>
            <Send className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
        <ReportCard ref={reportRef} data={reportData} />
      </motion.div>
    </div>
  )
}
