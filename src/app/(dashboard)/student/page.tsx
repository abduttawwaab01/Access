"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { BookOpen, CalendarCheck, TrendingUp, Award, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { DashboardAnnouncements } from "@/components/DashboardAnnouncements"

const gradientMap: Record<string, string> = {
  "Avg Score": "from-blue-600 via-blue-500 to-cyan-400",
  "Attendance": "from-emerald-600 via-emerald-500 to-teal-400",
  "Subjects": "from-violet-600 via-violet-500 to-purple-400",
  "Exams Done": "from-amber-600 via-amber-500 to-orange-400",
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [results, setResults] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const student = students.find((s: any) => s.id === userId)
  const studentName = student ? `${student.firstName} ${student.lastName}` : "Student"

  useEffect(() => {
    const fetchAll = async () => {
      const [r, a, e, sRes] = await Promise.all([
        fetch(`/api/results?studentId=${userId}`),
        fetch(`/api/attendance-records`),
        fetch(`/api/exam-sessions`),
        fetch("/api/students"),
      ])
      setResults(await r.json())
      const attData = await a.json()
      setAttendance(attData.filter((x: any) => x.studentId === userId))
      setExams(await e.json())
      setStudents(await sRes.json())
      setLoading(false)
    }
    if (userId) fetchAll()
  }, [userId])

  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / results.length) : 0
  const present = attendance.filter((a) => a.status === "present").length
  const total = attendance.length || 1
  const attPct = Math.round(present / total * 100)
  const myExams = exams.filter((e) => e.studentId === userId || e.studentName === studentName)
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

  if (loading || !userId) return (
    <div className="floating-orbs p-4 md:p-6 space-y-4">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-52 animate-pulse rounded-xl bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="h-52 animate-pulse rounded-xl bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  )

  return (
    <div className="floating-orbs p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-2xl font-bold text-transparent">
          Welcome, {studentName}
        </h2>
        <p className="text-sm text-muted-foreground">{student?.className || ""}</p>
      </motion.div>

      <DashboardAnnouncements role="student" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp },
          { label: "Attendance", value: `${attPct}%`, icon: CalendarCheck },
          { label: "Subjects", value: results.length ? [...new Set(results.map((r) => r.subject))].length : 0, icon: BookOpen },
          { label: "Exams Done", value: completedExams, icon: Award },
        ].map((stat) => {
          const Icon = stat.icon
          const gradient = gradientMap[stat.label] || "from-primary via-purple-500 to-secondary"
          return (
            <motion.div key={stat.label} variants={cardVariants} whileHover={{ scale: 1.03, y: -3 }} className="group relative">
              <Card className="glass-card relative overflow-hidden border-0 transition-all duration-300 group-hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.25)]">
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] md:text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xl md:text-2xl font-bold tracking-tight">{stat.value}</p>
                    </div>
                    <div className={cn(
                      "flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                      gradient,
                    )}>
                      <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden">
            <CardContent className="p-4 md:p-5">
              <h3 className="font-semibold mb-1">My Performance</h3>
              <p className="text-xs text-muted-foreground mb-4">Average score by term</p>
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                className="h-48 min-h-[180px] min-w-0 origin-bottom"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <XAxis dataKey="term" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,27,75,0.95))",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                        color: "#fff",
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}
                    />
                    <Bar
                      dataKey="score"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={50}
                      fill="url(#chartGradient)"
                      fillOpacity={0.9}
                    />
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden">
            <CardContent className="p-4 md:p-5">
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label: "View Results", href: "/student/results", color: "from-blue-600 to-blue-500" },
                  { label: "Check Attendance", href: "/student/attendance", color: "from-emerald-600 to-emerald-500" },
                  { label: "My Timetable", href: "/student/timetable", color: "from-violet-600 to-violet-500" },
                  { label: "Take Exam", href: "/student/cbt", color: "from-amber-600 to-amber-500" },
                  { label: "Report Card", href: "/student/report-card", color: "from-rose-600 to-rose-500" },
                ].map((link) => (
                  <Link key={link.label} href={link.href}>
                    <motion.div
                      whileHover={{ x: 4, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex items-center justify-between rounded-xl border border-border/50 p-2.5 md:p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        <div className={cn(
                          "flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                          link.color,
                        )}>
                          <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                        </div>
                        <span className="text-xs md:text-sm font-medium truncate">{link.label}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-muted-foreground/60 transition-colors duration-200 group-hover:text-primary group-hover:translate-x-0.5" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden">
            <CardContent className="p-4 md:p-5">
              <h3 className="font-semibold mb-3">Subject Breakdown</h3>
              <div className="space-y-3">
                {[...new Set(results.filter((r) => r.term === "First Term").map((r) => r.subject))].map((subject, i) => {
                  const r = results.find((x) => x.subject === subject && x.term === "First Term")
                  if (!r) return null
                  const pct = Math.round((r.score / r.total) * 100)
                  return (
                    <motion.div
                      key={subject}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.04, duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{subject}</span>
                        <span className="text-sm font-bold">{r.score}/{r.total} ({pct}%)</span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5 + i * 0.04, duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500 to-secondary"
                        />
                      </div>
                    </motion.div>
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
