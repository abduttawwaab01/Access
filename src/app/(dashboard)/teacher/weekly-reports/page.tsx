"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CheckCircle2, Clock, Search, Star } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const WEEKS = Array.from({ length: 13 }, (_, i) => i + 1)

const RATING_OPTIONS = [1, 2, 3, 4, 5]
const RATING_LABELS: Record<number, string> = { 1: "Poor", 2: "Below Avg", 3: "Average", 4: "Good", 5: "Excellent" }

export default function TeacherWeeklyReportsPage() {
  const { data: session } = useSession()
  const teacherId = (session?.user as any)?.id || ""
  const teacherName = (session?.user as any)?.name || ""

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [myClassIds, setMyClassIds] = useState<string[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [terms, setTerms] = useState<any[]>([])
  const [currentTerm, setCurrentTerm] = useState<any>(null)

  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedTerm, setSelectedTerm] = useState("")

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [existingReport, setExistingReport] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

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

  useEffect(() => {
    Promise.all([
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/teacher-assignments").then((r) => r.json()),
      fetch("/api/terms").then((r) => r.json()),
    ]).then(([cls, staffList, assignments, termList]) => {
      setClasses(cls)
      setTerms(termList)
      const current = termList.find((t: any) => t.isCurrent)
      if (current) {
        setCurrentTerm(current)
        setSelectedTerm(current.name)
      }
      const ta = assignments.find((a: any) => a.teacherId === teacherId)
      if (ta) {
        setMyClassIds(ta.classIds || [])
        if (ta.classIds?.length > 0) setSelectedClassId(ta.classIds[0])
      }
      setLoading(false)
    })
  }, [teacherId])

  useEffect(() => {
    if (!selectedClassId) return
    Promise.all([
      fetch(`/api/students?classId=${selectedClassId}`).then((r) => r.json()),
      fetch(`/api/subjects?classId=${selectedClassId}`).then((r) => r.json()),
      fetch(`/api/weekly-reports?classId=${selectedClassId}&week=${selectedWeek}&term=${selectedTerm}`).then((r) => r.json()),
    ]).then(([studs, subs, reps]) => {
      setStudents(studs)
      setSubjects(subs)
      setReports(reps)
    })
  }, [selectedClassId, selectedWeek, selectedTerm])

  const myClasses = classes.filter((c) => myClassIds.includes(c.id))

  const getReportForStudent = (studentId: string) => reports.find((r) => r.studentId === studentId)

  const getAttendanceForWeek = async (studentId: string) => {
    const weekDays = selectedWeek * 5
    const res = await fetch(`/api/attendance-records?studentId=${studentId}&summary=true`)
    const summary = await res.json()
    const total = Math.min(summary.total || 0, 5)
    return {
      present: Math.min(summary.present || 0, total),
      absent: Math.min(summary.absent || 0, total),
      late: Math.min(summary.late || 0, total),
      total,
    }
  }

  const openForm = async (student: any) => {
    setEditingStudent(student)
    const existing = getReportForStudent(student.id)
    setExistingReport(existing)

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
      const attendance = await getAttendanceForWeek(student.id)
      const subjectPerformances = subjects.map((sub) => ({
        subject: sub.name,
        subjectId: sub.id,
        score: 0,
        assignmentsCompleted: 0,
        assignmentsTotal: 0,
        participation: 3,
        notes: "",
      }))
      setForm({
        subjectPerformances,
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
        classId: selectedClassId,
        className: classes.find((c) => c.id === selectedClassId)?.name || "",
        week: selectedWeek,
        term: selectedTerm,
        session: "2024/2025",
        createdBy: teacherId,
        teacherName,
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
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = saved
          return updated
        }
        return [...prev, saved]
      })
      setExistingReport(saved)
      toast.success(publish ? "Report published!" : "Report saved as draft")
      setSheetOpen(false)
    } catch {
      toast.error("Failed to save report")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
      </div>
    )
  }

  const filteredStudents = students.filter(
    (s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Weekly Reports"
        description="Create and manage weekly student performance reports"
      />

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Select value={selectedClassId} onValueChange={(v) => { if (v) setSelectedClassId(v) }}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {myClasses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(selectedWeek)} onValueChange={(v) => setSelectedWeek(Number(v))}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Week" />
          </SelectTrigger>
          <SelectContent>
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

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState title="No students found" description={selectedClassId ? "No students match your search." : "Select a class to begin."} />
      ) : (
        <div className="space-y-2">
          {filteredStudents.map((student) => {
            const report = getReportForStudent(student.id)
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-card border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs">
                      {student.firstName?.[0]}{student.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{student.firstName} {student.lastName}</p>
                    <p className="text-[11px] text-muted-foreground">{student.studentId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {report ? (
                    <Badge className={report.status === "published" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>
                      {report.status === "published" ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Published</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> Draft</>
                      )}
                    </Badge>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => openForm(student)}>
                    {report ? "Edit" : "Create"}
                  </Button>
                </div>
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
                  {classes.find((c) => c.id === selectedClassId)?.name} — Week {selectedWeek}
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
                        <input
                          type="number" min={0} max={100}
                          className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs"
                          value={sp.score}
                          onChange={(e) => updateSubject(i, "score", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Assignments Done</Label>
                        <input
                          type="number" min={0}
                          className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs"
                          value={sp.assignmentsCompleted}
                          onChange={(e) => updateSubject(i, "assignmentsCompleted", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Total Assignments</Label>
                        <input
                          type="number" min={0}
                          className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs"
                          value={sp.assignmentsTotal}
                          onChange={(e) => updateSubject(i, "assignmentsTotal", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Participation (1-5)</Label>
                        <select
                          className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs"
                          value={sp.participation}
                          onChange={(e) => updateSubject(i, "participation", Number(e.target.value))}
                        >
                          {RATING_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r} — {RATING_LABELS[r]}</option>
                          ))}
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
              {([
                { key: "punctuality", label: "Punctuality" },
                { key: "attentiveness", label: "Attentiveness" },
                { key: "conduct", label: "Conduct" },
                { key: "homeworkCompletion", label: "Homework Completion" },
                { key: "teamwork", label: "Teamwork" },
              ] as const).map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{label}</span>
                    <span className="font-medium">{RATING_LABELS[(form as any)[key]] || "Average"}</span>
                  </div>
                  <div className="flex gap-1">
                    {RATING_OPTIONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => updateForm(key, r)}
                        className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                          (form as any)[key] >= r
                            ? "bg-primary text-white shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Label className="text-xs">Behavior Notes</Label>
              <Textarea
                className="mt-1 text-sm"
                rows={2}
                placeholder="Optional notes about student behavior this week..."
                value={form.behaviorNotes}
                onChange={(e) => updateForm("behaviorNotes", e.target.value)}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Overall Rating</h4>
            <div className="flex gap-2">
              {RATING_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => updateForm("overallRating", r)}
                  className={`h-10 w-10 rounded-xl text-lg transition-all ${
                    form.overallRating >= r
                      ? "bg-amber-500/20 text-amber-600 border-2 border-amber-400"
                      : "bg-muted text-muted-foreground border-2 border-transparent hover:bg-muted/80"
                  }`}
                >
                  <Star className={`h-5 w-5 mx-auto ${form.overallRating >= r ? "fill-amber-400" : ""}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Teacher&apos;s Comment</Label>
            <Textarea
              className="mt-1 text-sm"
              rows={3}
              placeholder="Write a comprehensive comment about the student's performance this week..."
              value={form.teacherComment}
              onChange={(e) => updateForm("teacherComment", e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => handleSubmit(false)} disabled={saving}>
              <Clock className="h-4 w-4 mr-1" />
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button className="flex-1" onClick={() => handleSubmit(true)} disabled={saving}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {saving ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </FormSheet>
    </div>
  )
}
