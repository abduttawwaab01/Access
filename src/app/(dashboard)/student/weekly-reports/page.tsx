"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { FileText, Star, Download, DownloadCloud, Send, Calendar, ChevronDown, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { captureElement } from "@/lib/capture"
import WeeklyReportCard from "@/components/WeeklyReportCard"

export default function StudentWeeklyReportsPage() {
  const { data: session } = useSession()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)
  const [terms, setTerms] = useState<any[]>([])
  const [selectedTerm, setSelectedTerm] = useState("")

  const [previewReport, setPreviewReport] = useState<any>(null)
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const userId = (session?.user as any)?.id

  useEffect(() => {
    if (!userId) return
    fetch("/api/students?userId=" + userId)
      .then((r) => r.json())
      .then((data) => {
        const id = Array.isArray(data) ? data[0]?.id : data?.id
        if (id) setStudentId(id)
      })
  }, [userId])

  useEffect(() => {
    fetch("/api/terms").then((r) => r.json()).then((t) => {
      setTerms(t)
      const current = t.find((t: any) => t.isCurrent)
      if (current) setSelectedTerm(current.name)
    })
  }, [])

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    const params = new URLSearchParams({ studentId })
    if (selectedTerm) params.set("term", selectedTerm)
    fetch(`/api/weekly-reports?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setReports(data.filter((r: any) => r.status === "published"))
        setLoading(false)
      })
  }, [studentId, selectedTerm])

  const weeks = [...new Set(reports.map((r) => r.week))].sort((a, b) => b - a)
  const getReportsForWeek = (week: number) => reports.filter((r) => r.week === week)

  const buildReportData = (report: any) => ({
    schoolName: report.schoolName || "Access School",
    studentName: report.studentName,
    studentId: report.studentId || "",
    className: report.className,
    term: report.term,
    session: report.session,
    week: report.week,
    subjectPerformances: report.subjectPerformances || [],
    behavior: {
      punctuality: report.punctuality ?? 0,
      attentiveness: report.attentiveness ?? 0,
      conduct: report.conduct ?? 0,
      homeworkCompletion: report.homeworkCompletion ?? 0,
      teamwork: report.teamwork ?? 0,
      behaviorNotes: report.behaviorNotes || "",
    },
    attendance: {
      present: report.attendancePresent || 0,
      absent: report.attendanceAbsent || 0,
      late: report.attendanceLate || 0,
      total: report.attendanceTotal || 0,
    },
    teacherComment: report.teacherComment || "",
    teacherName: report.teacherName,
    overallRating: report.overallRating ?? 0,
    generatedAt: report.updatedAt || report.createdAt,
  })

  const handleExportPDF = async (report: any) => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const { jsPDF } = await import("jspdf")
      const canvas = await captureElement(reportRef.current, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] })
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save(`Weekly_Report_Week${report.week}.pdf`)
      toast.success("PDF downloaded")
    } catch (err) {
      console.error("PDF export error:", err)
      toast.error("Failed to export PDF")
    }
    setExporting(false)
  }

  const handleExportPNG = async (report: any) => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const canvas = await captureElement(reportRef.current, { scale: 2 })
      const link = document.createElement("a")
      link.download = `Weekly_Report_Week${report.week}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("PNG downloaded")
    } catch (err) {
      console.error("PNG export error:", err)
      toast.error("Failed to export PNG")
    }
    setExporting(false)
  }

  const handleShareWhatsApp = (report: any) => {
    const subjText = report.subjectPerformances?.map((s: any) => `- ${s.subject}: ${s.score}%`).join("\n") || ""
    const text = `*Weekly Report - Week ${report.week}*\nOverall: ${report.overallRating}/5\n\n${subjText}\n\nAttendance: ${report.attendancePresent || 0}/${report.attendanceTotal || 0} days present`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Weekly Reports</h2>
        <p className="text-sm text-muted-foreground">Your comprehensive weekly performance reports</p>
      </motion.div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={selectedTerm} onValueChange={(v) => { if (v) setSelectedTerm(v) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent>
            {terms.map((t: any) => (
              <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {reports.length} report{reports.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : weeks.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No Reports Yet</h3>
          <p className="text-sm text-muted-foreground">Weekly reports for {selectedTerm || "this term"} have not been published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => {
            const weekReports = getReportsForWeek(week)
            const latest = weekReports[0]
            const isExpanded = expandedWeek === week
            return (
              <motion.div
                key={week}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-card border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedWeek(isExpanded ? null : week)}
                  className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Week {week}</p>
                      <p className="text-[11px] text-muted-foreground">{latest?.className} — {latest?.term}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= (latest?.overallRating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 md:px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                    {weekReports.map((report) => (
                      <div key={report.id} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1 font-medium">Subject Performance</p>
                            {report.subjectPerformances?.map((sp: any) => (
                              <div key={sp.subjectId} className="flex justify-between py-0.5">
                                <span>{sp.subject}</span>
                                <span className={sp.score >= 70 ? "text-green-600 font-medium" : sp.score >= 50 ? "text-amber-600 font-medium" : "text-red-600 font-medium"}>
                                  {sp.score}%
                                </span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1 font-medium">Behavioral Assessment</p>
                            <div className="space-y-0.5">
                              {[
                                { label: "Punctuality", val: report.punctuality },
                                { label: "Attentiveness", val: report.attentiveness },
                                { label: "Conduct", val: report.conduct },
                                { label: "Homework", val: report.homeworkCompletion },
                                { label: "Teamwork", val: report.teamwork },
                              ].map(({ label, val }) => (
                                <div key={label} className="flex justify-between">
                                  <span>{label}</span>
                                  <span className="font-medium">{val}/5</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <Badge variant="outline" className="text-[10px]">
                            Attendance: {report.attendancePresent || 0}/{report.attendanceTotal || 0}
                          </Badge>
                          <span className="text-muted-foreground">By: {report.teacherName || "Teacher"}</span>
                        </div>

                        {report.teacherComment && (
                          <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-2">
                            &ldquo;{report.teacherComment}&rdquo;
                          </p>
                        )}

                        <div className="flex gap-1.5 flex-wrap">
                          <Button variant="outline" size="sm" onClick={() => handleExportPDF(report)} disabled={exporting}>
                            <DownloadCloud className="h-3.5 w-3.5 mr-1" /> PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleExportPNG(report)} disabled={exporting}>
                            <Download className="h-3.5 w-3.5 mr-1" /> PNG
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleShareWhatsApp(report)}>
                            <Send className="h-3.5 w-3.5 mr-1" /> Share
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {previewReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewReport(null)}>
          <div className="overflow-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div id="weekly-report-preview">
              <WeeklyReportCard data={buildReportData(previewReport)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
