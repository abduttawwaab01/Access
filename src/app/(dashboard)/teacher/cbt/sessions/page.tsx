"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, User, AlertTriangle, CheckCircle, Eye, FileSpreadsheet } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { downloadCsv } from "@/lib/capture"
import { EmptyState } from "@/components/admin/EmptyState"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

export default function TeacherSessionsPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [sessions, setSessions] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterExam, setFilterExam] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()

  const fetchData = async () => {
    // Resolve teacherId first, then fetch scoped data
    let teacherId = ""
    try {
      const staffRes = await fetch("/api/staff?userId=" + userId)
      const staffData = await staffRes.json()
      teacherId = staffData?.id || ""
    } catch {}

    const [sRes, eRes] = await Promise.all([
      fetch("/api/exam-sessions?teacherId=" + teacherId),
      fetch("/api/exams?teacherId=" + teacherId),
    ])
    setSessions(await sRes.json())
    setExams(await eRes.json())
    setLoading(false)
  }

  useEffect(() => { if (userId) fetchData() }, [userId])

  const getExamTitle = (id: string) => exams.find((e) => e.id === id)?.title || "Unknown"

  const filtered = sessions.filter((s) => {
    if (filterExam !== "all" && s.examId !== filterExam) return false
    if (filterStatus !== "all" && s.status !== filterStatus) return false
    return true
  })

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Exam Sessions" description="Monitor student exam attempts" />
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={filterExam} onValueChange={(v) => { if (v) setFilterExam(v) }}>
          <SelectTrigger className="h-10 w-[180px]"><SelectValue placeholder="All exams" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            {exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
          </SelectContent>
        </Select>
          <Select value={filterStatus} onValueChange={(v) => { if (v) setFilterStatus(v) }}>
            <SelectTrigger className="h-10 w-[140px]"><SelectValue placeholder="All status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-10" onClick={() => {
            const data = filtered.map((s: any) => ({
              "Student Name": s.studentName || "Unknown",
              Exam: getExamTitle(s.examId),
              Status: s.status,
              Score: s.status === "completed" ? `${s.totalScore ?? "-"} / ${s.maxScore}` : "-",
              "Tab Switches": s.tabSwitches ?? 0,
              Flagged: s.flagged ? "Yes" : "No",
            }))
            downloadCsv(data, `Exam_Sessions_${new Date().toISOString().split("T")[0]}.csv`)
            toast.success("Sessions exported as CSV")
          }}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No sessions" description="Sessions appear when students take exams" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={item.status === "completed" ? "bg-green-500/15 text-green-600" : item.status === "active" ? "bg-blue-500/15 text-blue-600" : "bg-amber-500/15 text-amber-600"}>{item.status}</Badge>
                          {item.flagged && <Badge variant="outline" className="text-danger border-danger/30"><AlertTriangle className="h-3 w-3 mr-1" />Flagged</Badge>}
                        </div>
                        <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium text-sm">{item.studentName}</span></div>
                        <p className="text-xs text-muted-foreground">{getExamTitle(item.examId)}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.startTime ? new Date(item.startTime).toLocaleDateString() : "N/A"}</span>
                          {item.status === "completed" && <span>{item.totalScore ?? "-"} / {item.maxScore}</span>}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => router.push(`/teacher/cbt/sessions/${item.id}`)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}