"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { FileText, CheckCircle2, Clock, Download, Printer, Search, Eye, Star, Send, DownloadCloud, ChevronDown, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import WeeklyReportCard from "@/components/WeeklyReportCard"

const WEEKS = Array.from({ length: 13 }, (_, i) => i + 1)
const RATING_OPTIONS = [1, 2, 3, 4, 5]
const RATING_LABELS: Record<number, string> = { 1: "Poor", 2: "Below Avg", 3: "Average", 4: "Good", 5: "Excellent" }

export default function AdminWeeklyReportsPage() {
  const { data: session } = useSession()
  const adminId = (session?.user as any)?.id || ""
  const adminName = (session?.user as any)?.name || ""

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [terms, setTerms] = useState<any[]>([])

  const [selectedClassId, setSelectedClassId] = useState("all")
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(undefined)
  const [selectedTerm, setSelectedTerm] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [expandedReport, setExpandedReport] = useState<string | null>(null)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [existingReport, setExistingReport] = useState<any>(null)
  const [form, setForm] = useState({
    subjectPerformances: [] as any[],
    punctuality: 3,
    attentiveness: 3,
    conduct: 3,
    homeworkCompletion: 3,
    teamwork: 3,
    behaviorNotes: "",
    teacherComment: "",
    overallRating: 3,
    status: "draft",
  })

  const reportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [previewReport, setPreviewReport] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/terms").then((r) => r.json()),
    ]).then(([cls, staffList, termList]) => {
      setClasses(cls)
      setTeachers(staffList.filter((s: any) => s.role === "teacher"))
      setTerms(termList)
      const current = termList.find((t: any) => t.isCurrent)
      if (current) setSelectedTerm(current.name)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedClassId && selectedClassId !== "all") params.set("classId", selectedClassId)
    if (selectedWeek) params.set("week", String(selectedWeek))
    if (selectedTerm) params.set("term", selectedTerm)
    if (selectedTeacher && selectedTeacher !== "all") params.set("createdBy", selectedTeacher)

    fetch(`/api/weekly-reports?${params.toString()}`)
      .then((r) => r.json())
      .then(setReports)
  }, [selectedClassId, selectedWeek, selectedTerm, selectedTeacher])

  useEffect(() => {
    if (!selectedClassId || selectedClassId === "all") return
    Promise.all([
      fetch(`/api/students?classId=${selectedClassId}`).then((r) => r.json()),
      fetch(`/api/subjects?classId=${selectedClassId}`).then((r) => r.json()),
    ]).then(([studs, subs]) => {
      setStudents(studs)
      setSubjects(subs)
    })
  }, [selectedClassId])

  const myClasses = selectedClassId === "all" ? classes : classes.filter((c) => c.id === selectedClassId)

  const uniqueTeachers = [...new Set(reports.map((r) => r.createdBy))]
  const staffMap = Object.fromEntries(teachers.map((t) => [t.id, t]))

  const stats = {
    total: reports.length,
    published: reports.filter((r) => r.status === "published").length,
    draft: reports.filter((r) => r.status === "draft").length,
  }

  const openForm = async (student: any, existing?: any) => {
    setEditingStudent(student)
    setExistingReport(existing || null)

    if (existing) {
      setForm({
        subjectPerformances: existing.subjectPerformances || [],
        punctuality: existing.punctuality || 3,
        attentiveness: existing.attentiveness || 3,
        conduct: existing.conduct || 3,
        homeworkCompletion: existing.homeworkCompletion || 3,
        teamwork: existing.teamwork || 3,
        behaviorNotes: existing.behaviorNotes || "",
        teacherComment: existing.teacherComment || "",
        overallRating: existing.overallRating || 3,
        status: existing.status || "draft",
      })
    } else {
      setForm({
        subjectPerformances: subjects.map((sub) => ({
          subject: sub.name,
          subjectId: sub.id,
          score: 0,
          assignmentsCompleted: 0,
          assignmentsTotal: 0,
          participation: 3,
          notes: "",
        })),
        punctuality: 3,
        attentiveness: 3,
        conduct: 3,
        homeworkCompletion: 3,
        teamwork: 3,
        behaviorNotes: "",
        teacherComment: "",
        overallRating: 3,
        status: "draft",
      })
    }
    setSheetOpen(true)
  }

  const updateSubject = (index: number, field: string, value: any) => {
    setForm((prev) => {
      const perf = [...prev.subjectPerformances]
      perf[index] = { ...perf[index], [field]: value }
      return { ...prev, subjectPerformances: perf }
    })
  }

  const updateForm = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (publish: boolean) => {
    if (!editingStudent) return
    setSaving(true)
    try {
      const payload = {
        studentId: editingStudent.id,
        studentName: `${editingStudent.firstName} ${editingStudent.lastName}`,
        classId: selectedClassId === "all" ? editingStudent.classId : selectedClassId,
        className: classes.find((c) => c.id === (selectedClassId === "all" ? editingStudent.classId : selectedClassId))?.name || "",
        week: selectedWeek || 1,
        term: selectedTerm,
        session: "2024/2025",
        createdBy: adminId,
        teacherName: adminName,
        ...form,
        status: publish ? "published" : "draft",
      }

      let res
      if (existingReport) {
        res = await fetch(`/api/weekly-reports/${existingReport.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch("/api/weekly-reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) throw new Error("Failed to save")
      const saved = await res.json()
      setReports((prev) => {
        const idx = prev.findIndex((r) => r.id === saved.id)
        if (idx >= 0) { const u = [...prev]; u[idx] = saved; return u }
        return [...prev, saved]
      })
      toast.success(publish ? "Report published!" : "Report saved as draft")
      setSheetOpen(false)
    } catch {
      toast.error("Failed to save report")
    }
    setSaving(false)
  }

  const handleExportPDF = async (report: any) => {
    setExporting(true)
    setPreviewReport(report)
    await new Promise((r) => setTimeout(r, 300))
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default
      const el = document.getElementById("weekly-report-preview")
      if (!el) return
      const canvas = await html2canvas(el, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = 210
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Weekly_Report_${report.studentName.replace(/\s+/g, "_")}_Week${report.week}.pdf`)
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to export PDF")
    }
    setPreviewReport(null)
    setExporting(false)
  }

  const handleExportPNG = async (report: any) => {
    setExporting(true)
    setPreviewReport(report)
    await new Promise((r) => setTimeout(r, 300))
    try {
      const html2canvas = (await import("html2canvas")).default
      const el = document.getElementById("weekly-report-preview")
      if (!el) return
      const canvas = await html2canvas(el, { scale: 2, useCORS: true })
      const link = document.createElement("a")
      link.download = `Weekly_Report_${report.studentName.replace(/\s+/g, "_")}_Week${report.week}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("PNG downloaded")
    } catch {
      toast.error("Failed to export PNG")
    }
    setPreviewReport(null)
    setExporting(false)
  }

  const handleShareWhatsApp = (report: any) => {
    const subjText = report.subjectPerformances?.map((s: any) => `- ${s.subject}: ${s.score}%`).join("\n") || ""
    const text = `*${report.studentName}'s Weekly Report - Week ${report.week}*\nOverall: ${report.overallRating}/5\n\n${subjText}\n\nAttendance: ${report.attendancePresent || 0}/${report.attendanceTotal || 0} days present\n\nView full report on Access School Portal.`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const buildReportData = (report: any) => ({
    schoolName: "Access School",
    studentName: report.studentName,
    studentId: report.studentId || "",
    className: report.className,
    term: report.term,
    session: report.session,
    week: report.week,
    subjectPerformances: report.subjectPerformances || [],
    behavior: {
      punctuality: report.punctuality || 3,
      attentiveness: report.attentiveness || 3,
      conduct: report.conduct || 3,
      homeworkCompletion: report.homeworkCompletion || 3,
      teamwork: report.teamwork || 3,
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
    overallRating: report.overallRating || 3,
    generatedAt: report.updatedAt || report.createdAt,
  })

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        {["h-24", "h-32", "h-48"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader         title="Weekly Reports" description="View and manage all weekly reports across classes" />

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 glass-card">
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Total Reports</p>
          </CardContent>
        </Card>
        <Card className="border-0 glass-card">
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-green-600">{stats.published}</p>
            <p className="text-[11px] text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card className="border-0 glass-card">
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-amber-600">{stats.draft}</p>
            <p className="text-[11px] text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Select value={selectedClassId} onValueChange={(v) => { if (v) setSelectedClassId(v) }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedWeek ? String(selectedWeek) : "all"} onValueChange={(v) => setSelectedWeek(v === "all" ? undefined : Number(v))}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Weeks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Weeks</SelectItem>
            {WEEKS.map((w) => (
              <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTerm} onValueChange={(v) => { if (v) setSelectedTerm(v) }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Term" />
          </SelectTrigger>
          <SelectContent>
            {terms.map((t: any) => (
              <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTeacher} onValueChange={(v) => { if (v) setSelectedTeacher(v) }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Teachers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teachers</SelectItem>
            {teachers.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reports.length === 0 ? (
        <EmptyState title="No reports found" description="Try adjusting your filters or create a new report from the teacher portal." />
      ) : (
        <div className="space-y-2">
          {reports.map((report) => {
            const isExpanded = expandedReport === report.id
            const teacher = staffMap[report.createdBy]
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-card border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                  className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs">
                        {report.studentName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{report.studentName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {report.className} — Week {report.week} — {report.term}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={report.status === "published" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>
                      {report.status === "published" ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Published</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> Draft</>
                      )}
                    </Badge>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= (report.overallRating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-3 border-t border-border/50 pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">Subject Performance</p>
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
                        <p className="text-muted-foreground mb-1">Behavior</p>
                        <div className="space-y-0.5">
                          <span>Punctuality: {report.punctuality}/5</span><br />
                          <span>Attentiveness: {report.attentiveness}/5</span><br />
                          <span>Conduct: {report.conduct}/5</span><br />
                          <span>Homework: {report.homeworkCompletion}/5</span><br />
                          <span>Teamwork: {report.teamwork}/5</span>
                        </div>
                        <p className="text-muted-foreground mt-2">Attendance: {report.attendancePresent || 0}/{report.attendanceTotal || 0} present</p>
                        <p className="text-muted-foreground mt-1">By: {teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown"}</p>
                      </div>
                    </div>

                    {report.teacherComment && (
                      <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-2">
                        &ldquo;{report.teacherComment}&rdquo;
                      </p>
                    )}

                    <div className="flex gap-1.5 flex-wrap pt-1">
                      <Button variant="outline" size="sm" onClick={() => openForm({ id: report.studentId, firstName: report.studentName?.split(" ")[0] || "", lastName: report.studentName?.split(" ").slice(1).join(" ") || "", classId: report.classId }, report)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
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
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={existingReport ? "Edit Weekly Report" : "New Weekly Report"}>
        <div className="space-y-5">
          {editingStudent && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{editingStudent.firstName?.[0]}{editingStudent.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{editingStudent.firstName} {editingStudent.lastName}</p>
                <p className="text-xs text-muted-foreground">
                  {classes.find((c) => c.id === (selectedClassId === "all" ? editingStudent.classId : selectedClassId))?.name} — Week {selectedWeek || 1}
                </p>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold mb-3">Subject Performance</h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {form.subjectPerformances.map((sp: any, i: number) => (
                <Card key={sp.subjectId} className="border-0 glass-card">
                  <CardContent className="p-3 space-y-2">
                    <p className="text-xs font-medium">{sp.subject}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <Label className="text-[10px]">Score (0-100)</Label>
                        <input type="number" min={0} max={100} className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs" value={sp.score} onChange={(e) => updateSubject(i, "score", Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Assignments Done</Label>
                        <input type="number" min={0} className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs" value={sp.assignmentsCompleted} onChange={(e) => updateSubject(i, "assignmentsCompleted", Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Total Assignments</Label>
                        <input type="number" min={0} className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs" value={sp.assignmentsTotal} onChange={(e) => updateSubject(i, "assignmentsTotal", Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Participation (1-5)</Label>
                        <select className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs" value={sp.participation} onChange={(e) => updateSubject(i, "participation", Number(e.target.value))}>
                          {RATING_OPTIONS.map((r) => (<option key={r} value={r}>{r} — {RATING_LABELS[r]}</option>))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Behavioral Assessment</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "punctuality", label: "Punctuality" },
                { key: "attentiveness", label: "Attentiveness" },
                { key: "conduct", label: "Conduct" },
                { key: "homeworkCompletion", label: "Homework Completion" },
                { key: "teamwork", label: "Teamwork" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{label}</span>
                    <span className="font-medium">{RATING_LABELS[(form as any)[key]] || "Average"}</span>
                  </div>
                  <div className="flex gap-1">
                    {RATING_OPTIONS.map((r) => (
                      <button key={r} type="button" onClick={() => updateForm(key, r)}
                        className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${(form as any)[key] >= r ? "bg-primary text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Label className="text-xs">Behavior Notes</Label>
              <Textarea className="mt-1 text-sm" rows={2} placeholder="Optional notes..." value={form.behaviorNotes} onChange={(e) => updateForm("behaviorNotes", e.target.value)} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Overall Rating</h4>
            <div className="flex gap-2">
              {RATING_OPTIONS.map((r) => (
                <button key={r} type="button" onClick={() => updateForm("overallRating", r)}
                  className={`h-10 w-10 rounded-xl text-lg transition-all ${form.overallRating >= r ? "bg-amber-500/20 text-amber-600 border-2 border-amber-400" : "bg-muted text-muted-foreground border-2 border-transparent hover:bg-muted/80"}`}>
                  <Star className={`h-5 w-5 mx-auto ${form.overallRating >= r ? "fill-amber-400" : ""}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Teacher&apos;s Comment</Label>
            <Textarea className="mt-1 text-sm" rows={3} placeholder="Write a comprehensive comment..." value={form.teacherComment} onChange={(e) => updateForm("teacherComment", e.target.value)} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>Cancel</Button>
            <Button variant="secondary" className="flex-1" onClick={() => handleSubmit(false)} disabled={saving}>
              <Clock className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button className="flex-1" onClick={() => handleSubmit(true)} disabled={saving}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> {saving ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </FormSheet>

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
