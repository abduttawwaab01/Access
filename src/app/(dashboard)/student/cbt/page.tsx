"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Clock, FileText, Play, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function StudentCbtPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [exams, setExams] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [studentId, setStudentId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [startingId, setStartingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return
      const [studRes] = await Promise.all([fetch(`/api/students?userId=${userId}`)])
      if (!studRes.ok) { setLoading(false); return }
      const student = await studRes.json()
      const sid = student?.id || ""
      setStudentId(sid)

      const [eRes, sRes, subRes] = await Promise.all([
        fetch(`/api/exams${sid ? `?studentId=${sid}` : ""}`),
        fetch(`/api/exam-sessions${sid ? `?studentId=${sid}` : ""}`),
        fetch("/api/subjects"),
      ])
      const allExams = await eRes.json()
      setExams(allExams.filter((e: any) => e.status === "published" && e.type !== "entrance"))
      setSessions(await sRes.json())
      setSubjects(await subRes.json())
      setLoading(false)
    }
    fetchData()
  }, [userId])

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "Unknown"
  const mySessions = sessions.filter((s) => s.studentId === studentId)
  const completedIds = mySessions.filter((s) => s.status === "completed").map((s) => s.examId)

  const startExam = async (examId: string) => {
    setStartingId(examId)
    try {
      const res = await fetch("/api/exam-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          studentId,
          startTime: new Date().toISOString(),
          status: "active",
          answers: [],
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to start exam")
        setStartingId(null)
        return
      }
      const session = await res.json()
      router.push(`/exam-take/${session.id}`)
    } catch {
      toast.error("Failed to start exam")
      setStartingId(null)
    }
  }

  if (loading || !userId) return <div className="p-4 md:p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Exams</h2>
        <p className="text-sm text-muted-foreground">Available CBT exams and past attempts</p>
      </motion.div>

      {mySessions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="font-semibold mb-3">My Attempts</h3>
          <div className="space-y-2">
            {mySessions.slice(-5).reverse().map((s) => (
              <Card key={s.id} className="glass-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl ${s.status === "completed" ? "bg-green-500/10" : s.status === "active" ? "bg-blue-500/10" : "bg-amber-500/10"}`}>
                        {s.status === "completed" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Exam Session</p>
                        <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()} - {s.status}</p>
                        {s.score !== undefined && <p className="text-xs font-bold mt-0.5">Score: {s.score}/{s.maxScore}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={s.status === "completed" ? "bg-green-500/15 text-green-600" : "bg-blue-500/15 text-blue-600"}>{s.status}</Badge>
                      {s.status === "completed" && (
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/student/cbt/analysis/${s.id}`)}>
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="font-semibold mb-3">Available Exams</h3>
        {exams.length === 0 ? (
          <EmptyState title="No exams available" description="Check back later for published exams" />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {exams.map((exam, i) => {
              const done = completedIds.includes(exam.id)
              return (
                <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`glass-card border-0 ${done ? "opacity-60" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {(exam.subjectIds || [exam.subjectId]).map((sid: string) => (
                              <Badge key={sid} variant="outline">{getSubjectName(sid)}</Badge>
                            ))}
                            {done && <Badge className="bg-green-500/15 text-green-600">Completed</Badge>}
                          </div>
                          <h4 className="font-semibold">{exam.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{exam.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.duration} min</span>
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{(exam.questions || []).length} questions</span>
                          </div>
                        </div>
                        {!done && (
                          <Button className="animated-gradient border-0 text-white shrink-0 min-h-[44px]" onClick={() => startExam(exam.id)} disabled={startingId === exam.id}>
                            {startingId === exam.id ? "Starting..." : <><Play className="h-4 w-4 mr-1" /> Start</>}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
