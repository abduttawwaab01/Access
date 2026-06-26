"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button-enhanced"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts"
import {
  Users, GraduationCap, BookOpen, TrendingUp, TrendingDown,
  DollarSign, CalendarCheck, AlertTriangle, Lightbulb, UserCheck,
  Activity, ArrowUpRight, ArrowDownRight, Target, Zap, DownloadCloud, FileText,
} from "lucide-react"
import { downloadPng, downloadPdf, downloadDoc } from "@/lib/capture"
import { toast } from "sonner"

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#ec4899"]

export default function AdminAnalyticsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("trends")
  const [timeRange, setTimeRange] = useState("all")

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

  const totalStudents = students.length
  const totalTeachers = staff.filter((s) => s.role === "teacher").length
  const totalClasses = classes.length

  const subjectAvgScores = subjects.map((sub) => {
    const subResults = results.filter((r) => r.subjectId === sub.id)
    const avg = subResults.length > 0 ? subResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / subResults.length : 0
    return { name: sub.name, average: Math.round(avg * 10) / 10, count: subResults.length }
  }).filter((s) => s.count > 0)

  const termScoreData = [...new Set(results.map((r) => r.term))].map((term) => {
    const termResults = results.filter((r) => r.term === term)
    const avg = termResults.length > 0 ? termResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / termResults.length : 0
    const passRate = termResults.length > 0 ? termResults.filter((r) => (r.score / r.total) * 100 >= 50).length / termResults.length * 100 : 0
    return { term, avgScore: Math.round(avg * 10) / 10, passRate: Math.round(passRate) }
  })

  const passRate = results.length > 0 ? results.filter((r) => (r.score / r.total) * 100 >= 50).length / results.length * 100 : 0
  const attendanceSummary = {
    present: attendance.filter((a) => a.status === "present").length,
    absent: attendance.filter((a) => a.status === "absent").length,
    late: attendance.filter((a) => a.status === "late").length,
  }
  const attendanceRate = attendance.length > 0 ? attendanceSummary.present / attendance.length * 100 : 0

  const feeSummary = fees.reduce((acc, f) => ({
    total: acc.total + f.amount,
    paid: acc.paid + f.paid,
    outstanding: acc.outstanding + (f.amount - f.paid),
  }), { total: 0, paid: 0, outstanding: 0 })
  const feeCollectionRate = feeSummary.total > 0 ? feeSummary.paid / feeSummary.total * 100 : 0

  const sortedAttendance = [...attendance].sort((a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime())
  const midAtt = Math.floor(sortedAttendance.length / 2)
  const attFirstHalf = sortedAttendance.slice(0, midAtt)
  const attSecondHalf = sortedAttendance.slice(midAtt)
  const attFirstRate = attFirstHalf.length > 0 ? attFirstHalf.filter((a) => a.status === "present").length / attFirstHalf.length * 100 : 0
  const attSecondRate = attSecondHalf.length > 0 ? attSecondHalf.filter((a) => a.status === "present").length / attSecondHalf.length * 100 : 0
  const attendanceChange = attendance.length > 0 ? (attSecondRate - attFirstRate) : 0

  const sortedFees = [...fees].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const midFee = Math.floor(sortedFees.length / 2)
  const feeFirstHalf = sortedFees.slice(0, midFee)
  const feeSecondHalf = sortedFees.slice(midFee)
  const feeFirstTotal = feeFirstHalf.reduce((s, f) => s + f.amount, 0)
  const feeFirstPaid = feeFirstHalf.reduce((s, f) => s + f.paid, 0)
  const feeSecondTotal = feeSecondHalf.reduce((s, f) => s + f.amount, 0)
  const feeSecondPaid = feeSecondHalf.reduce((s, f) => s + f.paid, 0)
  const feeFirstRate = feeFirstTotal > 0 ? feeFirstPaid / feeFirstTotal * 100 : 0
  const feeSecondRate = feeSecondTotal > 0 ? feeSecondPaid / feeSecondTotal * 100 : 0
  const feeChange = fees.length > 0 ? (feeSecondRate - feeFirstRate) : 0

  const bestSubject = subjectAvgScores.length > 0 ? [...subjectAvgScores].sort((a, b) => b.average - a.average)[0] : null
  const worstSubject = subjectAvgScores.length > 0 ? [...subjectAvgScores].sort((a, b) => a.average - b.average)[0] : null

  const attendanceByClass = classes.map((c) => {
    const classStudents = students.filter((s) => s.classId === c.id).map((s) => s.id)
    const classAttendance = attendance.filter((a) => classStudents.includes(a.studentId))
    const present = classAttendance.filter((a) => a.status === "present").length
    const rate = classAttendance.length > 0 ? Math.round(present / classAttendance.length * 100) : 0
    return { name: `${c.name}${c.arm ? ` ${c.arm}` : ""}`, rate, total: classAttendance.length }
  }).filter((c) => c.total > 0)

  const performanceDistribution = [
    { range: "90-100%", count: results.filter((r) => { const p = (r.score / r.total) * 100; return p >= 90 }).length, fill: "#22c55e" },
    { range: "80-89%", count: results.filter((r) => { const p = (r.score / r.total) * 100; return p >= 80 && p < 90 }).length, fill: "#84cc16" },
    { range: "70-79%", count: results.filter((r) => { const p = (r.score / r.total) * 100; return p >= 70 && p < 80 }).length, fill: "#f59e0b" },
    { range: "60-69%", count: results.filter((r) => { const p = (r.score / r.total) * 100; return p >= 60 && p < 70 }).length, fill: "#f97316" },
    { range: "50-59%", count: results.filter((r) => { const p = (r.score / r.total) * 100; return p >= 50 && p < 60 }).length, fill: "#ef4444" },
    { range: "Below 50%", count: results.filter((r) => { const p = (r.score / r.total) * 100; return p < 50 }).length, fill: "#dc2626" },
  ]

  const radarData = subjectAvgScores.slice(0, 6).map((s) => ({ subject: s.name.substring(0, 6), score: s.average, fullMark: 100 }))

  const insights: string[] = []
  if (passRate < 60) insights.push("Overall pass rate is below 60%. Consider remedial programs for struggling students.")
  else if (passRate >= 80) insights.push("Strong overall performance. Students are exceeding academic benchmarks.")
  else insights.push("Moderate pass rate. Targeted intervention in weaker subjects could improve outcomes.")

  if (bestSubject) insights.push(`Top performing subject: ${bestSubject.name} (${bestSubject.average}% avg).`)
  if (worstSubject) insights.push(`Lowest performing subject: ${worstSubject.name} (${worstSubject.average}% avg). Consider reviewing teaching methods.`)

  if (attendanceRate < 75) insights.push("Attendance rate is below 75%. Investigate causes of absenteeism.")
  else if (attendanceRate >= 90) insights.push("Excellent attendance rate. Student engagement is high.")

  if (feeCollectionRate < 70) insights.push(`Fee collection at ${Math.round(feeCollectionRate)}%. Consider payment plan reminders.`)

  const studentTeacherRatio = totalTeachers > 0 ? (totalStudents / totalTeachers).toFixed(1) : "N/A"
  if (Number(studentTeacherRatio) > 30) insights.push(`Student-teacher ratio is ${studentTeacherRatio}:1. Consider hiring more staff.`)

  const [exporting, setExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const handleExportPNG = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { await downloadPng(reportRef.current, "School_Analytics.png", { scale: 2, backgroundColor: "#ffffff" }); toast.success("Exported as PNG") }
    catch { toast.error("Export failed") }; setExporting(false)
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { await downloadPdf(reportRef.current, "School_Analytics.pdf", { scale: 2, backgroundColor: "#ffffff" }); toast.success("Exported as PDF") }
    catch { toast.error("Export failed") }; setExporting(false)
  }

  const handleExportDOC = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { downloadDoc(reportRef.current, "School_Analytics.doc", "School Analytics"); toast.success("Exported as DOC") }
    catch { toast.error("Export failed") }; setExporting(false)
  }

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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">School Analytics</h2>
          <p className="text-sm text-muted-foreground">Performance trends, insights, and forecasting</p>
        </div>
        <div className="flex items-center gap-2">
          {["all", "term", "month"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap min-w-[100px] ${
                timeRange === range
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {range === "all" ? "All Time" : range === "term" ? "This Term" : "This Month"}
            </button>
          ))}
          <div className="w-px h-8 bg-border mx-1" />
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PNG</Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PDF</Button>
          <Button variant="outline" size="sm" onClick={handleExportDOC} disabled={exporting}><FileText className="h-4 w-4 mr-1" />DOC</Button>
        </div>
      </motion.div>

      <div ref={reportRef}>
      {/* Trend Summary Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Performance Trend", value: `${Math.round(passRate)}%`, change: termScoreData.length >= 2 ? `${termScoreData[termScoreData.length - 1].avgScore > termScoreData[termScoreData.length - 2].avgScore ? "+" : ""}${termScoreData[termScoreData.length - 1].avgScore - termScoreData[termScoreData.length - 2].avgScore}%` : "—", icon: TrendingUp, color: passRate >= 70 ? "from-green-500 to-green-600" : "from-amber-500 to-amber-600", trend: passRate >= 70 ? "up" : "down" },
          { label: "Attendance Trend", value: `${Math.round(attendanceRate)}%`, change: `${attendanceChange >= 0 ? "+" : ""}${attendanceChange.toFixed(1)}%`, icon: CalendarCheck, color: attendanceRate >= 80 ? "from-emerald-500 to-emerald-600" : "from-red-500 to-red-600", trend: attendanceChange >= 0 ? "up" : "down" },
          { label: "Fee Collection", value: `${Math.round(feeCollectionRate)}%`, change: `${feeChange >= 0 ? "+" : ""}${feeChange.toFixed(1)}%`, icon: DollarSign, color: "from-violet-500 to-violet-600", trend: feeChange >= 0 ? "up" : "down" },
          { label: "Student:Teacher", value: `${studentTeacherRatio}:1`, change: "—", icon: UserCheck, color: "from-blue-500 to-blue-600", trend: Number(studentTeacherRatio) < 25 ? "up" : "down" },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="glass-card border-0 overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-[10px] font-medium ${stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="trends" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all data-[state=active]:animated-gradient data-[state=active]:text-white">Trends</TabsTrigger>
          <TabsTrigger value="comparison" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all data-[state=active]:animated-gradient data-[state=active]:text-white">Comparison</TabsTrigger>
          <TabsTrigger value="distribution" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all data-[state=active]:animated-gradient data-[state=active]:text-white">Distribution</TabsTrigger>
          <TabsTrigger value="insights" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all data-[state=active]:animated-gradient data-[state=active]:text-white">AI Insights</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "trends" && (
      <div className="space-y-6">
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
                        <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradPass" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="term" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} width={25} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="avgScore" name="Avg Score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gradScore)" />
                      <Area type="monotone" dataKey="passRate" name="Pass Rate" stroke="#22c55e" strokeWidth={2} fill="url(#gradPass)" />
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
                  <h3 className="text-sm md:text-base font-semibold">Attendance Trend</h3>
                  <Badge variant="outline" className="text-[9px]">{attendance.length} records</Badge>
                </div>
                <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Present, absent, and late patterns</p>
                <div className="h-56 md:h-72 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <BarChart data={attendanceByClass} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={40} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} width={25} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Rate"]} />
                      <Bar dataKey="rate" name="Attendance Rate" radius={[6, 6, 0, 0]} maxBarSize={28}>
                        {attendanceByClass.map((entry, i) => (
                          <Cell key={i} fill={entry.rate >= 80 ? "#22c55e" : entry.rate >= 60 ? "#f59e0b" : "#ef4444"} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      )}

      {activeTab === "comparison" && (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-4 md:p-5">
                <h3 className="text-sm md:text-base font-semibold mb-1">Subject Comparison</h3>
                <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Average scores by subject</p>
                <div className="h-56 md:h-72 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
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
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-4 md:p-5">
                <h3 className="text-sm md:text-base font-semibold mb-1">Performance Radar</h3>
                <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Multi-dimensional subject analysis</p>
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
              <h3 className="text-sm md:text-base font-semibold mb-3">Subject Performance Breakdown</h3>
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
      </div>
      )}

      {activeTab === "distribution" && (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-4 md:p-5">
                <h3 className="text-sm md:text-base font-semibold mb-1">Score Distribution</h3>
                <p className="text-[11px] md:text-xs text-muted-foreground mb-3">How students are distributed across score ranges</p>
                <div className="h-56 md:h-72 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <BarChart data={performanceDistribution} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <XAxis dataKey="range" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={25} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                      <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]} maxBarSize={36}>
                        {performanceDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.8} />)}
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
                <h3 className="text-sm md:text-base font-semibold mb-1">Gender Distribution</h3>
                <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Male vs Female student ratio</p>
                <div className="h-56 md:h-72 min-h-[180px] relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Male", value: students.filter((s) => s.gender === "Male").length || 0 },
                          { name: "Female", value: students.filter((s) => s.gender === "Female").length || 0 },
                        ]}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value"
                      >
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
                  <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" /><span className="text-[11px] md:text-xs">Male ({students.filter((s) => s.gender === "Male").length})</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-pink-500 shrink-0" /><span className="text-[11px] md:text-xs">Female ({students.filter((s) => s.gender === "Female").length})</span></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      )}

      {activeTab === "insights" && (
      <div className="space-y-6">
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
                <h4 className="text-xs md:text-sm font-semibold flex items-center gap-2"><Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500 shrink-0" /> Recommendations</h4>
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
      </div>
      )}
    </div>
    </div>
  )
}
