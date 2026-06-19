"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Clock, FileText, Play } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ExamTakeLanding() {
  const [exams, setExams] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [studentName, setStudentName] = useState("")
  const [selectedExam, setSelectedExam] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const [eRes, sRes] = await Promise.all([fetch("/api/exams"), fetch("/api/subjects")])
      const allExams = await eRes.json()
      setExams(allExams.filter((e: any) => e.status === "published"))
      setSubjects(await sRes.json())
      setLoading(false)
    }
    fetchData()
  }, [])

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "Unknown"

  const startExam = async () => {
    if (!studentName.trim()) { toast.error("Please enter your name"); return }
    if (!selectedExam) { toast.error("Please select an exam"); return }
    setStarting(true)
    try {
      const res = await fetch("/api/exam-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam,
          studentName: studentName.trim(),
          startTime: new Date().toISOString(),
          status: "active",
          answers: [],
        }),
      })
      const session = await res.json()
      router.push(`/exam-take/${session.id}`)
    } catch {
      toast.error("Failed to start exam")
      setStarting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/30 flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Exam Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your name and select an exam to begin</p>
        </div>

        <Card className="glass-card border-0">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <Input
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Exam</label>
              {loading ? (
                <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
              ) : exams.length === 0 ? (
                <p className="text-sm text-muted-foreground">No exams available right now.</p>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {exams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => setSelectedExam(exam.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedExam === exam.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium text-sm">{exam.title}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{getSubjectName(exam.subjectId)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.duration} min</span>
                        <span>{(exam.questions || []).length} questions</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              size="lg"
              className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25"
              onClick={startExam}
              disabled={!studentName.trim() || !selectedExam || starting}
            >
              {starting ? "Starting..." : <><Play className="h-4 w-4 mr-2" /> Start Exam</>}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
