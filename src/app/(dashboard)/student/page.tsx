"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { BookOpen, CalendarCheck, TrendingUp, Award, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  const [results, setResults] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const studentId = "1"
  const studentName = "Alice Johnson"
  const className = "Grade 10A"

  useEffect(() => {
    const fetchAll = async () => {
      const [r, a, e] = await Promise.all([
        fetch(`/api/results?studentId=${studentId}`),
        fetch(`/api/attendance-records`),
        fetch(`/api/exam-sessions`),
      ])
      setResults(await r.json())
      const attData = await a.json()
      setAttendance(attData.filter((x: any) => x.studentId === studentId))
      setExams(await e.json())
      setLoading(false)
    }
    fetchAll()
  }, [])

  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / results.length) : 0
  const present = attendance.filter((a) => a.status === "present").length
  const total = attendance.length || 1
  const attPct = Math.round(present / total * 100)
  const myExams = exams.filter((e) => e.studentId === studentId || e.studentName === studentName)
  const completedExams = myExams.filter((e) => e.status === "completed").length

  const subjectScores = results.filter((r) => r.session === "2024/2025").reduce<Record<string, number[]>>((acc, r) => {
    if (!acc[r.term]) acc[r.term] = []
    acc[r.term].push(r.score)
    return acc
  }, {})

  const chartData = Object.entries(subjectScores).map(([term, scores]) => ({
    term: term === "First Term" ? "1st Term" : "2nd Term",
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }))

  if (loading) return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      <div className="h-64 rounded-xl bg-muted animate-pulse" />
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Welcome, {studentName}</h2>
        <p className="text-sm text-muted-foreground">{className}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp, color: "from-blue-500 to-blue-600" },
          { label: "Attendance", value: `${attPct}%`, icon: CalendarCheck, color: "from-emerald-500 to-emerald-600" },
          { label: "Subjects", value: results.length ? [...new Set(results.map((r) => r.subject))].length : 0, icon: BookOpen, color: "from-purple-500 to-purple-600" },
          { label: "Exams Done", value: completedExams, icon: Award, color: "from-amber-500 to-amber-600" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-1">My Performance</h3>
              <p className="text-xs text-muted-foreground mb-4">Average score by term</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <XAxis dataKey="term" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={50} fill="hsl(var(--primary))" fillOpacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label: "View Results", href: "/student/results", color: "from-blue-500 to-blue-600" },
                  { label: "Check Attendance", href: "/student/attendance", color: "from-emerald-500 to-emerald-600" },
                  { label: "My Timetable", href: "/student/timetable", color: "from-purple-500 to-purple-600" },
                  { label: "Take Exam", href: "/student/cbt", color: "from-amber-500 to-amber-600" },
                  { label: "Report Card", href: "/student/report-card", color: "from-rose-500 to-rose-600" },
                ].map((link) => (
                  <Link key={link.label} href={link.href}>
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 hover:bg-muted/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${link.color}`}>
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{link.label}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Subject Breakdown</h3>
              <div className="space-y-3">
                {[...new Set(results.filter((r) => r.term === "First Term").map((r) => r.subject))].map((subject) => {
                  const r = results.find((x) => x.subject === subject && x.term === "First Term")
                  if (!r) return null
                  const pct = Math.round((r.score / r.total) * 100)
                  return (
                    <div key={subject}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{subject}</span>
                        <span className="text-sm font-bold">{r.score}/{r.total} ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
