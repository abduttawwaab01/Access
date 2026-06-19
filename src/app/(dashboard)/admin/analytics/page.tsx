"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts"
import { Users, GraduationCap, BookOpen, TrendingUp, DollarSign, CalendarCheck, AlertTriangle, Lightbulb, UserCheck, Activity } from "lucide-react"

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#ec4899"]
const DONUT_COLORS = ["#22c55e", "#ef4444", "#f59e0b"]

export default function AdminAnalyticsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchAll = async () => {
      const [stuRes, stfRes, clsRes, subRes, resRes, attRes, feeRes] = await Promise.all([
        fetch("/api/students"), fetch("/api/staff"), fetch("/api/classes"),
        fetch("/api/subjects"), fetch("/api/results"), fetch("/api/attendance-records"), fetch("/api/fees"),
      ])
      setStudents(await stuRes.json()); setStaff(await stfRes.json())
      setClasses(await clsRes.json()); setSubjects(await subRes.json())
      setResults(await resRes.json()); setAttendance(await attRes.json()); setFees(await feeRes.json())
      setLoading(false)
    }
    fetchAll()
  }, [])

  // Derived data
  const totalStudents = students.length
  const totalTeachers = staff.filter((s) => s.role === "teacher").length
  const totalClasses = classes.length
  const totalSubjects = subjects.length
  const maleCount = students.filter((s) => s.gender === "Male").length
  const femaleCount = students.filter((s) => s.gender === "Female").length

  const studentsPerClass = classes.map((c) => ({
    name: `${c.name}${c.arm ? ` ${c.arm}` : ""}`,
    count: students.filter((s) => s.classId === c.id).length,
  }))

  const subjectAvgScores = subjects.map((sub) => {
    const subResults = results.filter((r) => r.subject === sub.name)
    const avg = subResults.length > 0 ? subResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / subResults.length : 0
    return { name: sub.name, average: Math.round(avg * 10) / 10, count: subResults.length }
  }).filter((s) => s.count > 0)

  const attendanceSummary = {
    present: attendance.filter((a) => a.status === "present").length,
    absent: attendance.filter((a) => a.status === "absent").length,
    late: attendance.filter((a) => a.status === "late").length,
  }
  const attendanceData = [
    { name: "Present", value: attendanceSummary.present },
    { name: "Absent", value: attendanceSummary.absent },
    { name: "Late", value: attendanceSummary.late },
  ]

  const feeSummary = fees.reduce((acc, f) => ({ total: acc.total + f.amount, paid: acc.paid + f.paid, outstanding: acc.outstanding + (f.amount - f.paid) }), { total: 0, paid: 0, outstanding: 0 })

  const termScoreData = [...new Set(results.map((r) => r.term))].map((term) => {
    const termResults = results.filter((r) => r.term === term)
    const avg = termResults.length > 0 ? termResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / termResults.length : 0
    return { term, avgScore: Math.round(avg * 10) / 10 }
  })

  const recentExamScores: { name: string; score: number }[] = []
  if (results.length > 0) {
    const studentIds = [...new Set(results.map((r) => r.studentId))]
    studentIds.forEach((sid) => {
      const studentResults = results.filter((r) => r.studentId === sid)
      if (studentResults.length > 0) {
        recentExamScores.push({
          name: students.find((s) => s.id === sid)?.firstName || "Unknown",
          score: Math.round(studentResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / studentResults.length * 10) / 10,
        })
      }
    })
  }

  // AI Insights
  const insights: string[] = []
  const passRate = results.length > 0 ? results.filter((r) => (r.score / r.total) * 100 >= 50).length / results.length * 100 : 0
  if (passRate < 60) insights.push("Overall pass rate is below 60%. Consider remedial programs for struggling students.")
  else if (passRate >= 80) insights.push("Strong overall performance. Students are exceeding academic benchmarks.")
  else insights.push("Moderate pass rate. Targeted intervention in weaker subjects could improve outcomes.")

  const bestSubject = subjectAvgScores.length > 0 ? [...subjectAvgScores].sort((a, b) => b.average - a.average)[0] : null
  const worstSubject = subjectAvgScores.length > 0 ? [...subjectAvgScores].sort((a, b) => a.average - b.average)[0] : null
  if (bestSubject) insights.push(`Top performing subject: ${bestSubject.name} (${bestSubject.average}% avg).`)
  if (worstSubject) insights.push(`Lowest performing subject: ${worstSubject.name} (${worstSubject.average}% avg). Consider reviewing teaching methods.`)

  const attendanceRate = attendance.length > 0 ? attendanceSummary.present / attendance.length * 100 : 0
  if (attendanceRate < 75) insights.push("Attendance rate is below 75%. Investigate causes of absenteeism.")
  else if (attendanceRate >= 90) insights.push("Excellent attendance rate. Student engagement is high.")

  const feeCollectionRate = feeSummary.total > 0 ? feeSummary.paid / feeSummary.total * 100 : 0
  if (feeCollectionRate < 70) insights.push(`Fee collection at ${Math.round(feeCollectionRate)}%. Consider payment plan reminders.`)
  else if (feeCollectionRate >= 90) insights.push("Fee collection rate is strong. Financial health is stable.")

  const studentTeacherRatio = totalTeachers > 0 ? (totalStudents / totalTeachers).toFixed(1) : "N/A"
  if (Number(studentTeacherRatio) > 30) insights.push(`Student-teacher ratio is ${studentTeacherRatio}:1. Consider hiring more staff.`)
  else if (Number(studentTeacherRatio) < 15) insights.push(`Student-teacher ratio is ${studentTeacherRatio}:1. Class sizes are well-managed.`)

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">Comprehensive school performance metrics and insights</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-card border-0 p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:animated-gradient data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="academics" className="rounded-lg data-[state=active]:animated-gradient data-[state=active]:text-white">Academics</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-lg data-[state=active]:animated-gradient data-[state=active]:text-white">Attendance</TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg data-[state=active]:animated-gradient data-[state=active]:text-white">AI Insights</TabsTrigger>
        </TabsList>

        {/* ============ OVERVIEW TAB ============ */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Students", value: totalStudents, icon: Users, color: "from-blue-500 to-blue-600", change: "+12%" },
              { label: "Teachers", value: totalTeachers, icon: GraduationCap, color: "from-emerald-500 to-emerald-600", change: "+2" },
              { label: "Active Classes", value: totalClasses, icon: BookOpen, color: "from-purple-500 to-purple-600", change: "—" },
              { label: "Subjects", value: totalSubjects, icon: Activity, color: "from-amber-500 to-amber-600", change: "—" },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card className="glass-card border-0 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{stat.change} this term</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
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
                  <h3 className="font-semibold mb-1">Enrollment by Class</h3>
                  <p className="text-xs text-muted-foreground mb-4">Student distribution across classes</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentsPerClass} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                          {studentsPerClass.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-1">Gender Distribution</h3>
                  <p className="text-xs text-muted-foreground mb-4">Male vs Female student ratio</p>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{ name: "Male", value: maleCount }, { name: "Female", value: femaleCount }]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                          <Cell fill="#3b82f6" />
                          <Cell fill="#ec4899" />
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold">{totalStudents}</span>
                      <span className="text-[10px] text-muted-foreground">Total</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-500" /><span className="text-xs">Male ({maleCount})</span></div>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-pink-500" /><span className="text-xs">Female ({femaleCount})</span></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-1">Student Performance Overview</h3>
                <p className="text-xs text-muted-foreground mb-4">Average score by student</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recentExamScores} margin={{ top: 5, right: 5, bottom: 20, left: 0 }} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} formatter={(v: any) => [`${v}%`, "Avg Score"]} />
                      <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={30}>
                        {recentExamScores.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ============ ACADEMICS TAB ============ */}
        <TabsContent value="academics" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-1">Subject Performance</h3>
                  <p className="text-xs text-muted-foreground mb-4">Average score by subject</p>
                  <div className="h-72">
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-1">Term Score Trends</h3>
                  <p className="text-xs text-muted-foreground mb-4">Average performance across terms</p>
                  <div className="h-72">
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Subject Detail Breakdown</h3>
                <div className="space-y-4">
                  {subjectAvgScores.map((sub, i) => (
                    <div key={sub.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm font-medium">{sub.name}</span>
                        </div>
                        <span className="text-sm font-bold">{sub.average}%</span>
                      </div>
                      <Progress value={sub.average} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ============ ATTENDANCE TAB ============ */}
        <TabsContent value="attendance" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-1">Attendance Overview</h3>
                  <p className="text-xs text-muted-foreground mb-4">Present vs Absent vs Late</p>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value">
                          {attendanceData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { label: "Present", value: attendanceSummary.present, color: "bg-green-500" },
                      { label: "Absent", value: attendanceSummary.absent, color: "bg-red-500" },
                      { label: "Late", value: attendanceSummary.late, color: "bg-amber-500" },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                        <p className="text-lg font-bold mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-1">Fee Collection</h3>
                  <p className="text-xs text-muted-foreground mb-4">Financial overview</p>
                  <div className="h-64 flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <ResponsiveContainer width={200} height={200}>
                        <PieChart>
                          <Pie data={[
                            { name: "Paid", value: feeSummary.paid },
                            { name: "Outstanding", value: feeSummary.outstanding },
                          ]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                            <Cell fill="#22c55e" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-bold">{feeSummary.total > 0 ? Math.round(feeSummary.paid / feeSummary.total * 100) : 0}%</span>
                        <span className="text-[10px] text-muted-foreground">Collected</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-sm font-bold">${feeSummary.total.toLocaleString()}</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Paid</p><p className="text-sm font-bold text-green-600">${feeSummary.paid.toLocaleString()}</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Due</p><p className="text-sm font-bold text-red-600">${feeSummary.outstanding.toLocaleString()}</p></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* ============ AI INSIGHTS TAB ============ */}
        <TabsContent value="insights" className="space-y-6 mt-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass-card border-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">AI-Generated Insights</h3>
                    <p className="text-xs text-muted-foreground">Data-driven recommendations for school improvement</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Summary cards */}
                  <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-semibold">Performance</span>
                    </div>
                    <p className="text-2xl font-bold">{Math.round(passRate)}%</p>
                    <p className="text-xs text-muted-foreground">Overall pass rate</p>
                    <Progress value={passRate} className="h-1.5 mt-2" />
                  </div>
                  <div className="rounded-xl bg-green-500/5 border border-green-500/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarCheck className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-semibold">Attendance</span>
                    </div>
                    <p className="text-2xl font-bold">{Math.round(attendanceRate)}%</p>
                    <p className="text-xs text-muted-foreground">Attendance rate</p>
                    <Progress value={attendanceRate} className="h-1.5 mt-2" />
                  </div>
                  <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-semibold">Fee Collection</span>
                    </div>
                    <p className="text-2xl font-bold">{Math.round(feeCollectionRate)}%</p>
                    <p className="text-xs text-muted-foreground">Collection rate</p>
                    <Progress value={feeCollectionRate} className="h-1.5 mt-2" />
                  </div>
                  <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold">Student:Teacher</span>
                    </div>
                    <p className="text-2xl font-bold">{studentTeacherRatio}:1</p>
                    <p className="text-xs text-muted-foreground">Student-teacher ratio</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Recommendations</h4>
                  {insights.map((insight, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 rounded-xl bg-muted/50 p-3"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-muted-foreground">{insight}</p>
                    </motion.div>
                  ))}
                </div>

                {insights.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Not enough data to generate insights. Add more students, results, and records.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
