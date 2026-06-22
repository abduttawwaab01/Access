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
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="overview" className="rounded-lg whitespace-nowrap px-4 py-2 text-xs md:text-sm data-[state=active]:animated-gradient data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="academics" className="rounded-lg whitespace-nowrap px-4 py-2 text-xs md:text-sm data-[state=active]:animated-gradient data-[state=active]:text-white">Academics</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-lg whitespace-nowrap px-4 py-2 text-xs md:text-sm data-[state=active]:animated-gradient data-[state=active]:text-white">Attendance</TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg whitespace-nowrap px-4 py-2 text-xs md:text-sm data-[state=active]:animated-gradient data-[state=active]:text-white">AI Insights</TabsTrigger>
        </TabsList>

        {activeTab === "overview" && (
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
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">{stat.label}</p>
                        <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{stat.change} this term</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Enrollment by Class</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3 md:mb-4">Student distribution across classes</p>
                  <div className="overflow-x-auto">
                    <div className="h-48 md:h-64 min-h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={studentsPerClass} margin={{ top: 5, right: 5, bottom: 16, left: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={40} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={25} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32}>
                            {studentsPerClass.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Gender Distribution</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3 md:mb-4">Male vs Female student ratio</p>
                  <div className="h-48 md:h-64 min-h-[180px] relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{ name: "Male", value: maleCount || 1 }, { name: "Female", value: femaleCount || 1 }]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                          <Cell fill="#3b82f6" />
                          <Cell fill="#ec4899" />
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl md:text-2xl font-bold">{totalStudents}</span>
                      <span className="text-[10px] text-muted-foreground">Total</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 md:gap-6 mt-2">
                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" /><span className="text-[11px] md:text-xs">Male ({maleCount})</span></div>
                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-pink-500 shrink-0" /><span className="text-[11px] md:text-xs">Female ({femaleCount})</span></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-4 md:p-5">
                <h3 className="text-sm md:text-base font-semibold mb-1">Student Performance Overview</h3>
                <p className="text-[11px] md:text-xs text-muted-foreground mb-3 md:mb-4">Average score by student</p>
                <div className="h-48 md:h-64 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recentExamScores} margin={{ top: 5, right: 5, bottom: 5, left: 0 }} layout={recentExamScores.length > 8 ? "vertical" : "horizontal"}>
                      {recentExamScores.length > 8 ? (
                        <>
                          <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} width={30} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                        </>
                      ) : (
                        <>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} width={25} />
                        </>
                      )}
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Avg Score"]} />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={24}>
                        {recentExamScores.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        )}

        {activeTab === "academics" && (
        <TabsContent value="academics" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Subject Performance</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3 md:mb-4">Average score by subject</p>
                  <div className="overflow-x-auto">
                    <div className="h-56 md:h-72 min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectAvgScores} margin={{ top: 5, right: 5, bottom: 16, left: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={35} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} width={25} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Avg"]} />
                          <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={28}>
                            {subjectAvgScores.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Term Score Trends</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3 md:mb-4">Average performance across terms</p>
                  <div className="h-56 md:h-72 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={termScoreData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="term" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} width={25} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                        <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-4 md:p-5">
                <h3 className="text-sm md:text-base font-semibold mb-3">Subject Detail Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {subjectAvgScores.map((sub, i) => (
                    <div key={sub.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs md:text-sm font-medium truncate">{sub.name}</span>
                        </div>
                        <span className="text-xs md:text-sm font-bold shrink-0 ml-2">{sub.average}%</span>
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

        {activeTab === "attendance" && (
        <TabsContent value="attendance" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Attendance Overview</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3 md:mb-4">Present vs Absent vs Late</p>
                  <div className="h-48 md:h-64 min-h-[180px] relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                          {attendanceData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl md:text-2xl font-bold">{attendance.length}</span>
                      <span className="text-[10px] text-muted-foreground">Total</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-3 mt-2">
                    {[
                      { label: "Present", value: attendanceSummary.present, color: "bg-green-500" },
                      { label: "Absent", value: attendanceSummary.absent, color: "bg-red-500" },
                      { label: "Late", value: attendanceSummary.late, color: "bg-amber-500" },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${item.color} shrink-0`} />
                          <span className="text-[11px] md:text-xs text-muted-foreground">{item.label}</span>
                        </div>
                        <p className="text-base md:text-lg font-bold mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Fee Collection</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3 md:mb-4">Financial overview</p>
                  <div className="h-48 md:h-64 min-h-[180px] flex items-center justify-center">
                    <div className="relative flex items-center justify-center w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[
                            { name: "Paid", value: Math.max(feeSummary.paid, 1) },
                            { name: "Outstanding", value: Math.max(feeSummary.outstanding, 1) },
                          ]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                            <Cell fill="#22c55e" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl md:text-2xl font-bold">{feeSummary.total > 0 ? Math.round(feeSummary.paid / feeSummary.total * 100) : 0}%</span>
                        <span className="text-[10px] text-muted-foreground">Collected</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-3 mt-2">
                    <div className="text-center"><p className="text-[11px] md:text-xs text-muted-foreground">Total</p><p className="text-xs md:text-sm font-bold">${(feeSummary.total ?? 0).toLocaleString()}</p></div>
                    <div className="text-center"><p className="text-[11px] md:text-xs text-muted-foreground">Paid</p><p className="text-xs md:text-sm font-bold text-green-600">${(feeSummary.paid ?? 0).toLocaleString()}</p></div>
                    <div className="text-center"><p className="text-[11px] md:text-xs text-muted-foreground">Due</p><p className="text-xs md:text-sm font-bold text-red-600">${(feeSummary.outstanding ?? 0).toLocaleString()}</p></div>
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
                    <h3 className="text-base md:text-lg font-bold">AI-Generated Insights</h3>
                    <p className="text-[11px] md:text-xs text-muted-foreground">Data-driven recommendations for school improvement</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-3">
                  <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-3 md:p-4">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                      <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500 shrink-0" />
                      <span className="text-xs md:text-sm font-semibold">Performance</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold">{Math.round(passRate)}%</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Overall pass rate</p>
                    <Progress value={passRate} className="h-1 md:h-1.5 mt-1.5 md:mt-2" />
                  </div>
                  <div className="rounded-xl bg-green-500/5 border border-green-500/10 p-3 md:p-4">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                      <CalendarCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500 shrink-0" />
                      <span className="text-xs md:text-sm font-semibold">Attendance</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold">{Math.round(attendanceRate)}%</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Attendance rate</p>
                    <Progress value={attendanceRate} className="h-1 md:h-1.5 mt-1.5 md:mt-2" />
                  </div>
                  <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-3 md:p-4">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                      <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-500 shrink-0" />
                      <span className="text-xs md:text-sm font-semibold">Fee Collection</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold">{Math.round(feeCollectionRate)}%</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Collection rate</p>
                    <Progress value={feeCollectionRate} className="h-1 md:h-1.5 mt-1.5 md:mt-2" />
                  </div>
                  <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 md:p-4">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                      <UserCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500 shrink-0" />
                      <span className="text-xs md:text-sm font-semibold">Student:Teacher</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold">{studentTeacherRatio}:1</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Student-teacher ratio</p>
                  </div>
                </div>

                <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
                  <h4 className="text-xs md:text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500 shrink-0" /> Recommendations</h4>
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
                    <p className="text-xs md:text-sm text-muted-foreground">Not enough data to generate insights. Add more students, results, and records.</p>
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
