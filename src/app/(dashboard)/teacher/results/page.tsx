"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Save, Loader2, User, BookOpen } from "lucide-react"

export default function TeacherResultsPage() {
  const { data: session } = useSession()
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
  const [selectedExamId, setSelectedExamId] = useState("")
  const [scores, setScores] = useState<Record<string, { caScore: string; examScore: string }>>({})
  const [terms, setTerms] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])

  const teacherId = (session?.user as any)?.id

  useEffect(() => {
    if (!teacherId) return
    Promise.all([
      fetch("/api/teacher-assignments").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/subjects").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/terms").then((r) => r.json()),
      fetch("/api/grading-config").then((r) => r.json()),
      fetch("/api/exams?type=regular").then((r) => r.json()),
    ]).then(([assignments, cls, sub, stu, trm, gc, examsData]) => {
      const assigns = Array.isArray(assignments) ? assignments : []
      const myAssignment = assigns.find((a: any) => a.teacherId === teacherId)
      setAssignment(myAssignment)

      const allClasses = Array.isArray(cls) ? cls : []
      const allSubjects = Array.isArray(sub) ? sub : []
      const allStudents = Array.isArray(stu) ? stu : []
      const allExams = Array.isArray(examsData) ? examsData : []

      if (myAssignment) {
        setClasses(allClasses.filter((c: any) => myAssignment.classIds?.includes(c.id)))
        setSubjects(allSubjects.filter((s: any) => myAssignment.subjectIds?.includes(s.id)))
        setStudents(allStudents.filter((s: any) => myAssignment.classIds?.includes(s.classId)))
        setExams(allExams.filter((e: any) => myAssignment.classIds?.includes(e.classId) && myAssignment.subjectIds?.includes(e.subjectId)))
      } else {
        setClasses(allClasses)
        setSubjects(allSubjects)
        setStudents(allStudents)
        setExams(allExams)
      }
      setTerms(Array.isArray(trm) ? trm : [])
      setGradingConfig(gc)
      setLoading(false)
    })
  }, [teacherId])

  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId || !selectedTerm) return
    setScores({})
    const url = `/api/results?classId=${selectedClassId}&subjectId=${selectedSubjectId}&term=${selectedTerm}${selectedExamId ? `&examId=${selectedExamId}` : ""}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setResults(Array.isArray(data) ? data : [])
        const initial: Record<string, { caScore: string; examScore: string }> = {}
        ;(Array.isArray(data) ? data : []).forEach((r: any) => {
          initial[r.studentId] = {
            caScore: r.caScore?.toString() ?? "",
            examScore: r.examScore?.toString() ?? "",
          }
        })
        setScores(initial)
      })
  }, [selectedClassId, selectedSubjectId, selectedTerm, selectedExamId])

  const classSubjects = subjects.filter((s) => s.classId === selectedClassId)
  const classStudents = students.filter((s) => s.classId === selectedClassId).sort((a, b) => a.firstName?.localeCompare(b.firstName))
  const caMax = gradingConfig?.caMax ?? 40
  const examMax = gradingConfig?.examMax ?? 60

  const handleScoreChange = (studentId: string, field: "caScore" | "examScore", value: string) => {
    const num = value === "" ? "" : Math.min(Math.max(Number(value) || 0, 0), field === "caScore" ? caMax : examMax)
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId] || { caScore: "", examScore: "" }, [field]: num === "" ? "" : String(num) },
    }))
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
          examId: selectedExamId,
          subject: subjects.find((sub) => sub.id === selectedSubjectId)?.name || "",
          caScore: Number(sc?.caScore) || 0,
          examScore: Number(sc?.examScore) || 0,
          term: selectedTerm,
          session: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
        }
      })

      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error("Save failed")
      const saved = await res.json()
      toast.success(`Saved ${saved.length} results`)

      const url = `/api/results?classId=${selectedClassId}&subjectId=${selectedSubjectId}&term=${selectedTerm}${selectedExamId ? `&examId=${selectedExamId}` : ""}`
      const fresh = await fetch(url)
      const freshData = await fresh.json()
      setResults(Array.isArray(freshData) ? freshData : [])
    } catch (err) {
      toast.error("Failed to save results")
      console.error(err)
    }
    setSaving(false)
  }

  const getTotal = (sId: string) => {
    const sc = scores[sId]
    const ca = Number(sc?.caScore) || 0
    const exam = Number(sc?.examScore) || 0
    return ca + exam
  }

  const getGrade = (total: number) => {
    const boundaries = gradingConfig?.gradeBoundaries || []
    const pct = total / (caMax + examMax) * 100
    for (const b of boundaries) {
      if (pct >= b.min) return b.grade
    }
    return "F"
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1,2,3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Score Entry</h2>
        <p className="text-sm text-muted-foreground">Enter CA and Exam scores for your students</p>
      </div>

      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Class</Label>
              <select
                value={selectedClassId}
                onChange={(e) => { setSelectedClassId(e.target.value); setSelectedSubjectId(""); setSelectedExamId(""); setResults([]); setScores({}) }}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11"
              >
                <option value="">Select class...</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Subject</Label>
              <select
                value={selectedSubjectId}
                onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedExamId("") }}
                disabled={!selectedClassId}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11"
              >
                <option value="">Select subject...</option>
                {classSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Exam</Label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                disabled={!selectedSubjectId}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11"
              >
                <option value="">Select exam...</option>
                {exams.filter((e: any) => e.subjectId === selectedSubjectId && e.status === "published").map((e: any) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Term</Label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11"
              >
                <option value="">Select term...</option>
                {terms.map((t: any) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClassId && selectedSubjectId && selectedTerm && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 inline mr-1" />
              {classStudents.length} students · CA out of {caMax} · Exam out of {examMax}
            </p>
            <Button onClick={handleSaveAll} disabled={saving} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save All
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-3 py-2.5 font-semibold text-xs">#</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-xs">Student</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-xs">CA Score ({caMax})</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-xs">Exam Score ({examMax})</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-xs">Total ({caMax + examMax})</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-xs">Grade</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, i) => {
                  const total = getTotal(s.id)
                  const grade = getGrade(total)
                  const existing = existingResult(s.id)
                  return (
                    <tr key={s.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="font-medium">{s.firstName} {s.lastName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          max={caMax}
                          value={scores[s.id]?.caScore ?? ""}
                          onChange={(e) => handleScoreChange(s.id, "caScore", e.target.value)}
                          className="h-9 w-20 mx-auto text-center"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          max={examMax}
                          value={scores[s.id]?.examScore ?? ""}
                          onChange={(e) => handleScoreChange(s.id, "examScore", e.target.value)}
                          className="h-9 w-20 mx-auto text-center"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2 text-center font-mono font-bold">{total > 0 ? total : "-"}</td>
                      <td className="px-3 py-2 text-center">
                        {total > 0 ? (
                          <Badge className={
                            grade === "A" ? "bg-green-500/15 text-green-600" :
                            grade === "B" ? "bg-blue-500/15 text-blue-600" :
                            grade === "C" ? "bg-amber-500/15 text-amber-600" :
                            grade === "D" ? "bg-orange-500/15 text-orange-600" :
                            "bg-red-500/15 text-red-600"
                          }>{grade}</Badge>
                        ) : "-"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {existing ? (
                          <Badge variant="outline" className="text-[10px] border-green-300 text-green-600">Saved</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">New</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
