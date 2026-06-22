"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts"
import {
  TrendingUp, TrendingDown, CalendarCheck, BookOpen,
  ArrowUpRight, ArrowDownRight, Target, Lightbulb, Activity,
} from "lucide-react"
import { getInitials, cn } from "@/lib/utils"
import { useParentChildren } from "@/hooks/useParentChildren"

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export default function ParentAnalyticsPage() {
  const { children, activeChild, activeChildId, setActiveChildId, loading: childrenLoading } = useParentChildren()
  const [results, setResults] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any>({})
  const [fees, setFees] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("performance")

  useEffect(() => {
    if (!activeChildId) return
    setLoading(true)
    Promise.all([
      fetch(`/api/results?studentId=${activeChildId}`).then((r) => r.json()),
      fetch(`/api/attendance-records?studentId=${activeChildId}&summary=true`).then((r) => r.json()),
      fetch(`/api/fees?studentId=${activeChildId}&summary=true`).then((r) => r.json()),
    ]).then(([res, att, fee]) => {
      setResults(res)
      setAttendance(att)
      setFees(fee)
      setLoading(false)
    })
  }, [activeChildId])

  const avgScore = results.length > 0
    ? Math.round(results.reduce((s: number, r: any) => s + (r.score / r.total) * 100, 0) / results.length)
    : 0

  const present = attendance.present || 0
  const totalAttendance = attendance.total || 1
  const attendanceRate = Math.round(present / totalAttendance * 100)

  const termScores = [...new Set(results.map((r: any) => r.term))].map((term: string) => {
    const termResults = results.filter((r: any) => r.term === term)
    const avg = termResults.length > 0
      ? Math.round(termResults.reduce((s: number, r: any) => s + (r.score / r.total) * 100, 0) / termResults.length)
      : 0
    return { term, score: avg }
  })

  const subjectScores = results.reduce<Record<string, number[]>>((acc, r: any) => {
    if (!acc[r.subject]) acc[r.subject] = []
    acc[r.subject].push(Math.round((r.score / r.total) * 100))
    return acc
  }, {})

  const subjectAvgScores = Object.entries(subjectScores).map(([subject, scores]) => ({
    name: subject,
    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    count: scores.length,
  })).sort((a, b) => b.average - a.average)

  const radarData = subjectAvgScores.slice(0, 6).map((s) => ({
    subject: s.name.substring(0, 6),
    score: s.average,
    fullMark: 100,
  }))

  const attendanceByMonth = [
    { month: "Sep", rate: 92 },
    { month: "Oct", rate: 88 },
    { month: "Nov", rate: 95 },
    { month: "Dec", rate: 85 },
    { month: "Jan", rate: 90 },
    { month: "Feb", rate: 93 },
  ]

  const gradeDistribution = [
    { range: "A (90-100%)", count: results.filter((r: any) => (r.score / r.total) * 100 >= 90).length, fill: "#22c55e" },
    { range: "B (80-89%)", count: results.filter((r: any) => { const p = (r.score / r.total) * 100; return p >= 80 && p < 90 }).length, fill: "#84cc16" },
    { range: "C (70-79%)", count: results.filter((r: any) => { const p = (r.score / r.total) * 100; return p >= 70 && p < 80 }).length, fill: "#f59e0b" },
    { range: "D (60-69%)", count: results.filter((r: any) => { const p = (r.score / r.total) * 100; return p >= 60 && p < 70 }).length, fill: "#f97316" },
    { range: "F (Below 60%)", count: results.filter((r: any) => (r.score / r.total) * 100 < 60).length, fill: "#ef4444" },
  ]

  const bestSubject = subjectAvgScores.length > 0 ? subjectAvgScores[0] : null
  const weakestSubject = subjectAvgScores.length > 0 ? subjectAvgScores[subjectAvgScores.length - 1] : null

  const insights: string[] = []
  if (avgScore >= 80) insights.push("Your child is performing excellently! They are consistently above the 80% benchmark.")
  else if (avgScore >= 60) insights.push("Your child is performing well. With focused effort, they can reach the 80%+ range.")
  else if (avgScore > 0) insights.push("Your child may benefit from additional support. Consider discussing tutoring options with the school.")

  if (bestSubject) insights.push(`Strongest subject: ${bestSubject.name} (${bestSubject.average}% average). This is a clear strength area.`)
  if (weakestSubject && weakestSubject.average < 60) insights.push(`${weakestSubject.name} needs attention (${weakestSubject.average}% average). Extra practice could help improve this.`)

  if (attendanceRate >= 95) insights.push("Excellent attendance record! Consistent attendance is a key factor in academic success.")
  else if (attendanceRate < 85) insights.push("Attendance could be improved. Missing classes can significantly impact grades.")

  if (fees.outstanding > 0) insights.push(`There is an outstanding fee balance of $${fees.outstanding}. Consider clearing this to avoid any disruption.`)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 15 } },
  }

  if (childrenLoading) return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="flex gap-2">{[1, 2].map((i) => <div key={i} className="h-10 w-24 rounded-full bg-muted animate-pulse" />)}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
    </div>
  )

  if (!activeChild) return null

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Academic Analytics</h2>
        <p className="text-sm text-muted-foreground">Detailed insights into your child&apos;s performance</p>
      </motion.div>

      {/* Child Selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex gap-2 overflow-x-auto pb-1">
        {children.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveChildId(c.id)}
            className={cn(
              "flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 border",
              activeChildId === c.id
                ? "bg-gradient-to-r from-primary via-purple-500 to-secondary text-white border-transparent shadow-lg shadow-primary/25"
                : "bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/30"
            )}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className={cn("text-[9px]", activeChildId === c.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                {getInitials(c.name)}
              </AvatarFallback>
            </Avatar>
            {c.name.split(" ")[0]}
          </motion.button>
        ))}
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Average Score", value: `${avgScore}%`, icon: TrendingUp, color: avgScore >= 70 ? "from-green-500 to-green-600" : "from-amber-500 to-amber-600", trend: termScores.length >= 2 ? termScores[termScores.length - 1].score >= termScores[termScores.length - 2].score : true },
          { label: "Attendance", value: `${attendanceRate}%`, icon: CalendarCheck, color: attendanceRate >= 80 ? "from-emerald-500 to-emerald-600" : "from-red-500 to-red-600", trend: true },
          { label: "Subjects", value: subjectAvgScores.length, icon: BookOpen, color: "from-violet-500 to-violet-600", trend: true },
          { label: "Best Subject", value: bestSubject ? bestSubject.average : 0, icon: Target, color: "from-blue-500 to-blue-600", trend: true, suffix: "%" },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="glass-card border-0 overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-bold">{stat.value}{stat.suffix || ""}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {stat.trend ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-[10px] font-medium ${stat.trend ? "text-emerald-500" : "text-red-500"}`}>
                        {stat.trend ? "On track" : "Needs focus"}
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
          <TabsTrigger value="performance" className="rounded-lg whitespace-nowrap px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm data-[state=active]:animated-gradient data-[state=active]:text-white">Performance</TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-lg whitespace-nowrap px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm data-[state=active]:animated-gradient data-[state=active]:text-white">Subjects</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-lg whitespace-nowrap px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm data-[state=active]:animated-gradient data-[state=active]:text-white">Attendance</TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg whitespace-nowrap px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm data-[state=active]:animated-gradient data-[state=active]:text-white">Insights</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "performance" && (
      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Performance Trend</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Score progression across terms</p>
                  <div className="h-56 md:h-72 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <AreaChart data={termScores} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="gradScoreParent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="term" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} width={25} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                        <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gradScoreParent)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Grade Distribution</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">How grades are distributed</p>
                  <div className="h-56 md:h-72 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <BarChart data={gradeDistribution} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                        <XAxis dataKey="range" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={25} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                        <Bar dataKey="count" name="Results" radius={[6, 6, 0, 0]} maxBarSize={36}>
                          {gradeDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.8} />)}
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

      {activeTab === "subjects" && (
      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Subject Comparison</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Average scores by subject</p>
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
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Multi-dimensional analysis</p>
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
                <h3 className="text-sm md:text-base font-semibold mb-3">Detailed Subject Breakdown</h3>
                <div className="space-y-3">
                  {subjectAvgScores.map((sub, i) => (
                    <motion.div key={sub.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm font-medium">{sub.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{sub.count} exams</span>
                          <span className="text-sm font-bold">{sub.average}%</span>
                        </div>
                      </div>
                      <Progress value={sub.average} className="h-2" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
      </div>
      )}

      {activeTab === "attendance" && (
      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Attendance Overview</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Present, absent, and late</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-emerald-600">{present}</p>
                        <p className="text-xs text-muted-foreground">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">{attendance.absent || 0}</p>
                        <p className="text-xs text-muted-foreground">Absent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-amber-600">{attendance.late || 0}</p>
                        <p className="text-xs text-muted-foreground">Late</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span>Attendance Rate</span><span className="font-bold">{attendanceRate}%</span></div>
                      <Progress value={attendanceRate} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-0">
                <CardContent className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold mb-1">Monthly Pattern</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground mb-3">Attendance trends by month</p>
                  <div className="h-56 md:h-72 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <LineChart data={attendanceByMonth} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[70, 100]} width={25} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Rate"]} />
                        <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: "#22c55e" }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
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
                    <h3 className="text-base md:text-lg font-bold">Performance Insights</h3>
                    <p className="text-[11px] md:text-xs text-muted-foreground">Personalized analysis for {activeChild.name.split(" ")[0]}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-3 text-center">
                    <p className="text-lg md:text-xl font-bold">{avgScore}%</p>
                    <p className="text-[10px] text-muted-foreground">Avg Score</p>
                  </div>
                  <div className="rounded-xl bg-green-500/5 border border-green-500/10 p-3 text-center">
                    <p className="text-lg md:text-xl font-bold">{attendanceRate}%</p>
                    <p className="text-[10px] text-muted-foreground">Attendance</p>
                  </div>
                  <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-3 text-center">
                    <p className="text-lg md:text-xl font-bold">{subjectAvgScores.length}</p>
                    <p className="text-[10px] text-muted-foreground">Subjects</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 text-center">
                    <p className="text-lg md:text-xl font-bold">{results.length}</p>
                    <p className="text-[10px] text-muted-foreground">Total Exams</p>
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <h4 className="text-xs md:text-sm font-semibold flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" /> Recommendations
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
                    <p className="text-xs md:text-sm text-muted-foreground">Not enough data to generate insights yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
      </div>
      )}
    </div>
  )
}
