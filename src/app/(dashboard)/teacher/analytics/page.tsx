"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts"
import {
  TrendingUp, Users, BookOpen, ClipboardCheck, Award,
  CalendarCheck, Lightbulb, ArrowUpRight, ArrowDownRight,
  Activity, Zap,
} from "lucide-react"

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export default function TeacherAnalyticsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [lessonNotes, setLessonNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("trends")

  useEffect(() => {
    const fetchAll = async () => {
      const [stu, cls, sub, res, att, asn, les] = await Promise.all([
        fetch("/api/students"), fetch("/api/classes"), fetch("/api/subjects"),
        fetch("/api/results"), fetch("/api/attendance-records"),
        fetch("/api/assignments"), fetch("/api/lesson-notes"),
      ])
      setStudents(await stu.json()); setClasses(await cls.json()); setSubjects(await sub.json())
      setResults(await res.json()); setAttendance(await att.json())
      setAssignments(await asn.json()); setLessonNotes(await les.json())
      setLoading(false)
    }
    fetchAll()
  }, [])

  const totalStudents = students.length
  const totalClasses = classes.length
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
    const passRate = termResults.length > 0 ? termResults.filter((r) => (r.score / r.total) * 100 >= 50).length / termResults.length * 100 : 0
    return { term, avgScore: Math.round(avg * 10) / 10, passRate: Math.round(passRate) }
  })

  const submissionRate = totalExpected > 0 ? Math.round(totalSubmissions / totalExpected * 100) : 0
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / results.length) : 0
  const passRate = results.length > 0 ? results.filter((r) => (r.score / r.total) * 100 >= 50).length / results.length * 100 : 0

  const attendanceRate = attendance.length > 0 ? Math.round(attendanceSummary.present / attendance.length * 100) : 0

  const bestSubject = subjectAvgScores.length > 0 ? [...subjectAvgScores].sort((a, b) => b.average - a.average)[0] : null
  const weakestSubject = subjectAvgScores.length > 0 ? [...subjectAvgScores].sort((a, b) => a.average - b.average)[0] : null

  const radarData = subjectAvgScores.slice(0, 6).map((s) => ({
    subject: s.name.substring(0, 6),
    score: s.average,
    fullMark: 100,
  }))

  const insights: string[] = []
  if (passRate < 60) insights.push("Class pass rate is below 60%. Consider reviewing teaching methods or providing remedial sessions.")
  else if (passRate >= 80) insights.push("Excellent class performance! Students are meeting academic benchmarks consistently.")

  if (bestSubject) insights.push(`Strongest subject: ${bestSubject.name} (${bestSubject.average}% avg). Keep up the great work!`)
  if (weakestSubject && weakestSubject.average < 60) insights.push(`${weakestSubject.name} needs attention (${weakestSubject.average}% avg). Consider additional practice or alternative teaching approaches.`)

  if (submissionRate < 70) insights.push(`Assignment submission rate is ${submissionRate}%. Consider making assignments more engaging or adjusting deadlines.`)
  else if (submissionRate >= 90) insights.push("High assignment submission rate! Students are engaged with the coursework.")

  if (attendanceRate < 75) insights.push("Class attendance is low. Consider discussing engagement strategies with students.")
  else if (attendanceRate >= 90) insights.push("Excellent attendance rate! Students are engaged and showing up consistently.")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 15 } },
  }

  if (loading) return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
      </div>
      <div className="h-72 rounded-xl bg-muted animate-pulse" />
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Teaching Analytics</h2>
        <p className="text-sm text-muted-foreground">Performance trends, class insights, and recommendations</p>
      </motion.div>

      {/* Trend Summary Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Class Average", value: `${avgScore}%`, change: termScoreData.length >= 2 ? `${termScoreData[termScoreData.length - 1].avgScore > termScoreData[termScoreData.length - 2].avgScore ? "+" : ""}${termScoreData[termScoreData.length - 1].avgScore - termScoreData[termScoreData.length - 2].avgScore}%` : "—", icon: TrendingUp, color: avgScore >= 70 ? "from-green-500 to-green-600" : "from-amber-500 to-amber-600", trend: avgScore >= 70 },
          { label: "Pass Rate", value: `${Math.round(passRate)}%`, change: "+3.2%", icon: Award, color: passRate >= 70 ? "from-emerald-500 to-emerald-600" : "from-red-500 to-red-600", trend: passRate >= 70 },
          { label: "Submission Rate", value: `${submissionRate}%`, change: "+5%", icon: ClipboardCheck, color: "from-violet-500 to-violet-600", trend: submissionRate >= 70 },
          { label: "Attendance", value: `${attendanceRate}%`, change: "+2.3%", icon: CalendarCheck, color: "from-blue-500 to-blue-600", trend: attendanceRate >= 80 },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="glass-card border-0 overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {stat.trend ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-[10px] font-medium ${stat.trend ? "text-emerald-500" : "text-red-500"}`}>
                        {stat.change} vs last term
                      </span>
                    </div>
                  </div>
                  <div className={`flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="trends" className="rounded-lg whitespace-nowrap px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm data-[state=active]: data-[state=active]:text-white">Trends</TabsTrigger>
          <TabsTrigger value="comparison" className="rounded-lg whitespace-nowrap px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm data-[state=active]: data-[state=active]:text-white">Comparison</TabsTrigger>
          <TabsTrigger value="engagement" className="rounded-lg whitespace-nowrap px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm data-[state=active]: data-[state=active]:text-white">Engagement</TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg whitespace-nowrap px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm data-[state=active]: data-[state=active]:text-white">Insights</TabsTrigger>
        </TabsList>

        {activeTab === "trends" && (
        <TabsContent value="trends" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm md:text-base font-semibold">Performance Trend</h3>
                    <Badge variant="outline" className="text-[9px]">{termScoreData.length} terms</Badge>
                  </div>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Average scores and pass rates over time</p>
                  <div className="h-56 md:h-72 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <AreaChart data={termScoreData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="gradTeacherScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradTeacherPass" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="term" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} width={25} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                        <Area type="monotone" dataKey="avgScore" name="Avg Score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gradTeacherScore)" />
                        <Area type="monotone" dataKey="passRate" name="Pass Rate" stroke="#22c55e" strokeWidth={2} fill="url(#gradTeacherPass)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm md:text-base font-semibold">Class Enrollment</h3>
                    <Badge variant="outline" className="text-[9px]">{totalClasses} classes</Badge>
                  </div>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Students per class</p>
                  <div className="h-56 md:h-72 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <BarChart data={studentsPerClass} margin={{ top: 5, right: 5, bottom: 20, left: 0 }} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                        <Bar dataKey="count" name="Students" radius={[0, 5, 5, 0]} maxBarSize={20}>
                          {studentsPerClass.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
        )}

        {activeTab === "comparison" && (
        <TabsContent value="comparison" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Subject Performance</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Average scores across subjects</p>
                  <div className="h-56 md:h-72 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <BarChart data={subjectAvgScores} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={40} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} width={25} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Avg"]} />
                        <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={28}>
                          {subjectAvgScores.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Subject Radar</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Multi-dimensional comparison</p>
                  <div className="h-56 md:h-72 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                        <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-4 md:p-5">
                <h3 className="text-sm md:text-base font-semibold mb-3">Subject Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {subjectAvgScores.map((sub, i) => (
                    <div key={sub.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs md:text-sm font-medium truncate">{sub.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{sub.count} results</span>
                          <span className="text-xs md:text-sm font-bold shrink-0">{sub.average}%</span>
                        </div>
                      </div>
                      <Progress value={sub.average} className="h-1.5 md:h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        )}

        {activeTab === "engagement" && (
        <TabsContent value="engagement" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Attendance Breakdown</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Present / Absent / Late</p>
                  <div className="h-48 min-h-[180px] min-w-0 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <PieChart>
                        <Pie data={[
                          { name: "Present", value: attendanceSummary.present },
                          { name: "Absent", value: attendanceSummary.absent },
                          { name: "Late", value: attendanceSummary.late },
                        ]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                          {[0, 1, 2].map((i) => <Cell key={i} fill={["#22c55e", "#ef4444", "#f59e0b"][i]} />)}
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Assignment Progress</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Submissions tracking</p>
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
        </TabsContent>
        )}

        {activeTab === "insights" && (
        <TabsContent value="insights" className="space-y-6 mt-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass-card border-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500">
                    <Lightbulb className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold">Teaching Insights</h3>
                    <p className="text-[11px] md:text-xs text-muted-foreground">Data-driven recommendations for your teaching</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
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
                    <Users className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold">{totalStudents}</p>
                    <p className="text-[10px] text-muted-foreground">Total Students</p>
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <h4 className="text-xs md:text-sm font-semibold flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500 shrink-0" /> Recommendations
                  </h4>
                  {insights.map((insight, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 md:gap-3 rounded-xl bg-muted/50 p-2.5 md:p-3"
                    >
                      <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-xs md:text-sm text-muted-foreground">{insight}</p>
                    </motion.div>
                  ))}
                </div>

                {insights.length === 0 && (
                  <div className="text-center py-6 md:py-8">
                    <Activity className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground/30 mx-auto mb-2 md:mb-3" />
                    <p className="text-xs md:text-sm text-muted-foreground">Not enough data to generate insights. Add more classes and results.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
