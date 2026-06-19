"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts"
import { TrendingUp, Users, BookOpen, ClipboardCheck, Award, CalendarCheck, Lightbulb } from "lucide-react"

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]
const DONUT = ["#22c55e", "#ef4444", "#f59e0b"]

export default function TeacherAnalyticsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [lessonNotes, setLessonNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [stu, cls, sub, res, att, asn, les] = await Promise.all([
        fetch("/api/students"), fetch("/api/classes"), fetch("/api/subjects"),
        fetch("/api/results"), fetch("/api/attendance-records"),
        fetch("/api/assignments"), fetch("/api/lesson-notes"),
      ])
      setStudents(await stu.json()); setClasses(await cls.json()); setSubjects(await sub.json())
      setResults(await res.json()); setAttendance(await att.json()); setAssignments(await asn.json()); setLessonNotes(await les.json())
      setLoading(false)
    }
    fetchAll()
  }, [])

  const totalStudents = students.length
  const totalClasses = classes.length
  const totalSubjects = subjects.length
  const publishedNotes = lessonNotes.filter((n) => n.status === "published").length
  const activeAssignments = assignments.filter((a) => a.status === "active").length
  const totalSubmissions = assignments.reduce((s, a) => s + (a.submissions || 0), 0)
  const totalExpected = assignments.reduce((s, a) => s + (a.total || 0), 0)

  const subjectAvgScores = subjects.map((sub) => {
    const subResults = results.filter((r) => r.subject === sub.name)
    const avg = subResults.length > 0 ? subResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / subResults.length : 0
    return { name: sub.name, average: Math.round(avg * 10) / 10, count: subResults.length }
  }).filter((s) => s.count > 0)

  const studentsPerClass = classes.map((c) => ({
    name: `${c.name}${c.arm ? ` ${c.arm}` : ""}`,
    count: students.filter((s) => s.classId === c.id).length,
  }))

  const attendanceSummary = {
    present: attendance.filter((a) => a.status === "present").length,
    absent: attendance.filter((a) => a.status === "absent").length,
    late: attendance.filter((a) => a.status === "late").length,
  }

  const termScoreData = [...new Set(results.map((r) => r.term))].map((term) => {
    const termResults = results.filter((r) => r.term === term)
    const avg = termResults.length > 0 ? termResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / termResults.length : 0
    return { term, avgScore: Math.round(avg * 10) / 10 }
  })

  const submissionRate = totalExpected > 0 ? Math.round(totalSubmissions / totalExpected * 100) : 0
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / results.length) : 0

  if (loading) return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      <div className="h-72 rounded-xl bg-muted animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="h-64 rounded-xl bg-muted animate-pulse" /><div className="h-64 rounded-xl bg-muted animate-pulse" /></div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Analytics</h2>
        <p className="text-sm text-muted-foreground">Class performance, submissions, and teaching metrics</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "My Students", value: totalStudents, icon: Users, color: "from-blue-500 to-blue-600" },
          { label: "Classes", value: totalClasses, icon: BookOpen, color: "from-emerald-500 to-emerald-600" },
          { label: "Subjects", value: totalSubjects, icon: Award, color: "from-purple-500 to-purple-600" },
          { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp, color: avgScore >= 70 ? "from-green-500 to-green-600" : "from-amber-500 to-amber-600" },
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-1">Subject Performance</h3>
              <p className="text-xs text-muted-foreground mb-4">Average scores across subjects</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectAvgScores} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} formatter={(v: any) => [`${v}%`, "Avg"]} />
                    <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={36}>
                      {subjectAvgScores.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-1">Term Score Trend</h3>
              <p className="text-xs text-muted-foreground mb-4">Performance trajectory</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={termScoreData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="term" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 6, fill: "hsl(var(--primary))" }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-1">Class Enrollment</h3>
              <p className="text-xs text-muted-foreground mb-4">Students per class</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentsPerClass} margin={{ top: 5, right: 5, bottom: 20, left: 0 }} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="count" radius={[0, 5, 5, 0]} maxBarSize={20}>
                      {studentsPerClass.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-1">Attendance Breakdown</h3>
              <p className="text-xs text-muted-foreground mb-4">Present / Absent / Late</p>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      { name: "Present", value: attendanceSummary.present },
                      { name: "Absent", value: attendanceSummary.absent },
                      { name: "Late", value: attendanceSummary.late },
                    ]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {[0, 1, 2].map((i) => <Cell key={i} fill={DONUT[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-1 text-center text-xs">
                <div><div className="h-2 w-2 rounded-full bg-green-500 mx-auto mb-1" /><span className="text-muted-foreground">Present</span><p className="font-bold">{attendanceSummary.present}</p></div>
                <div><div className="h-2 w-2 rounded-full bg-red-500 mx-auto mb-1" /><span className="text-muted-foreground">Absent</span><p className="font-bold">{attendanceSummary.absent}</p></div>
                <div><div className="h-2 w-2 rounded-full bg-amber-500 mx-auto mb-1" /><span className="text-muted-foreground">Late</span><p className="font-bold">{attendanceSummary.late}</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-1">Assignment Progress</h3>
              <p className="text-xs text-muted-foreground mb-4">Submissions tracking</p>
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <div className="relative mb-3">
                  <svg className="h-28 w-28 -rotate-90">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 48}`} strokeDashoffset={`${2 * Math.PI * 48 * (1 - submissionRate / 100)}`}
                      strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div><p className="text-2xl font-bold">{submissionRate}%</p><p className="text-[10px] text-muted-foreground">Submitted</p></div>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span><strong className="text-foreground">{totalSubmissions}</strong> Submitted</span>
                  <span><strong className="text-foreground">{totalExpected - totalSubmissions}</strong> Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="glass-card border-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Teaching Insights</h3>
                <p className="text-xs text-muted-foreground">Quick summary of your teaching metrics</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-3 text-center">
                <ClipboardCheck className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{publishedNotes}</p>
                <p className="text-[10px] text-muted-foreground">Published Notes</p>
              </div>
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3 text-center">
                <BookOpen className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{activeAssignments}</p>
                <p className="text-[10px] text-muted-foreground">Active Assignments</p>
              </div>
              <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-3 text-center">
                <Award className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{avgScore}%</p>
                <p className="text-[10px] text-muted-foreground">Class Avg Score</p>
              </div>
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 text-center">
                <CalendarCheck className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{totalStudents}</p>
                <p className="text-[10px] text-muted-foreground">Students</p>
              </div>
            </div>
            {subjectAvgScores.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Subject Performance Breakdown</p>
                {subjectAvgScores.map((sub, i) => (
                  <div key={sub.name} className="flex items-center gap-3">
                    <span className="text-xs w-20 truncate">{sub.name}</span>
                    <Progress value={sub.average} className="flex-1 h-2" />
                    <span className="text-xs font-mono w-10 text-right">{sub.average}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
