"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, GraduationCap, Brain, ChevronDown, ChevronUp, ArrowUpDown, BookOpen, AlertTriangle, TrendingUp, X, Target } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DeepAnalysisPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const toggleSort = () => setSortAsc((p) => !p)

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then((data) => {
      setClasses(data)
      if (data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id)
      } else {
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      setLoading(true)
      setExpandedStudent(null)
      setSelectedStudentId("")
      fetch(`/api/analytics/deep-analysis?classId=${selectedClassId}`)
        .then((r) => r.json())
        .then((data) => {
          setAnalysis(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [selectedClassId])

  const students = analysis?.gapAnalysis || []
  const sortedStudents = [...students].sort((a, b) =>
    sortAsc ? a.masteryRate - b.masteryRate : b.masteryRate - a.masteryRate
  )

  const selectedStudent = sortedStudents.find((s: any) => s.studentId === selectedStudentId)
  const filteredStudents = selectedStudent ? [selectedStudent] : sortedStudents

  const masteryColor = (rate: number) => {
    if (rate >= 80) return "bg-emerald-500"
    if (rate >= 50) return "bg-amber-500"
    return "bg-red-500"
  }

  const masteryTextColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-600"
    if (rate >= 50) return "text-amber-600"
    return "text-red-600"
  }

  const masteryBadge = (rate: number) => {
    if (rate >= 80) return { label: "High", class: "bg-emerald-500/15 text-emerald-600" }
    if (rate >= 50) return { label: "Medium", class: "bg-amber-500/15 text-amber-600" }
    return { label: "Low", class: "bg-red-500/15 text-red-600" }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 15 } },
  }

  const overviewCards = analysis ? [
    {
      label: "Total Students",
      value: analysis.studentCount || 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      sub: "In this class",
    },
    {
      label: "Quiz Attempts",
      value: analysis.attemptedCount || 0,
      icon: GraduationCap,
      color: "from-emerald-500 to-emerald-600",
      sub: `${analysis.studentCount ? Math.round((analysis.attemptedCount / analysis.studentCount) * 100) : 0}% participation`,
    },
    {
      label: "Class Mastery Rate",
      value: `${analysis.classMastery || 0}%`,
      icon: Brain,
      color: "from-purple-500 to-purple-600",
      sub: `${analysis.totalCorrect || 0}/${analysis.totalQuestions || 0} correct`,
    },
    {
      label: "Mastery Level",
      value: analysis.classMasteryLevel || "N/A",
      icon: Target,
      color: "from-amber-500 to-amber-600",
      sub: analysis.classMastery >= 80 ? "Excellent" : analysis.classMastery >= 50 ? "Moderate" : "Needs improvement",
    },
  ] : []

  const renderSubjectBars = (breakdown: Record<string, { total: number; correct: number }>) => {
    const entries = Object.entries(breakdown).sort(([, a], [, b]) => {
      const rateA = a.total > 0 ? (a.correct / a.total) * 100 : 0
      const rateB = b.total > 0 ? (b.correct / b.total) * 100 : 0
      return rateA - rateB
    })
    return entries.map(([sub, data]) => {
      const rate = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
      return (
        <div key={sub} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{sub}</span>
            <span className={cn("font-bold", masteryTextColor(rate))}>{rate}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", masteryColor(rate))}
              style={{ width: `${rate}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">{data.correct}/{data.total} correct</p>
        </div>
      )
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Deep Analysis</h2>
        <p className="text-sm text-muted-foreground">Student gap and mastery analysis by class</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
        <Select value={selectedClassId} onValueChange={(v) => v && setSelectedClassId(v)}>
          <SelectTrigger className="h-10 w-full md:w-64">
            <SelectValue placeholder="Select a class..." />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
          </div>
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
        </div>
      ) : !analysis ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-8 text-center">
              <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium">No data available</p>
              <p className="text-xs text-muted-foreground">Select a class with quiz data to view analysis.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {overviewCards.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card className="glass-card border-0 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
                      </div>
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", stat.color)}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold">Student Gap Analysis</h3>
                    <p className="text-xs text-muted-foreground">Sorted by mastery rate (weakest first)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedStudentId} onValueChange={(v) => v && setSelectedStudentId(v)}>
                      <SelectTrigger className="h-8 w-full sm:w-56 text-xs">
                        <SelectValue placeholder="All students" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedStudents.map((s: any) => (
                          <SelectItem key={s.studentId} value={s.studentId} className="text-xs">
                            {s.studentName || "Unknown"} — {s.masteryRate}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedStudentId && (
                      <button onClick={() => setSelectedStudentId("")} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={toggleSort}>
                      <ArrowUpDown className="h-3 w-3 mr-1" />
                      {sortAsc ? "Lowest" : "Highest"}
                    </Button>
                  </div>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="text-center py-6">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No students found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {filteredStudents.map((student: any, i: number) => {
                        const isExpanded = expandedStudent === student.studentId
                        const mastery = masteryBadge(student.masteryRate)
                        return (
                          <motion.div
                            key={student.studentId}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            layout
                          >
                            <Card
                              className={cn(
                                "glass-card border-0 cursor-pointer transition-all",
                                isExpanded && "ring-1 ring-primary/20"
                              )}
                              onClick={() => setExpandedStudent(isExpanded ? null : student.studentId)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                                    student.masteryRate >= 80 ? "bg-emerald-500" : student.masteryRate >= 50 ? "bg-amber-500" : "bg-red-500"
                                  )}>
                                    {student.studentName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-semibold truncate">{student.studentName || "Unknown"}</span>
                                      <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className={cn("text-xs font-bold", masteryTextColor(student.masteryRate))}>
                                          {student.masteryRate}%
                                        </span>
                                        <Badge className={mastery.class}>{mastery.label}</Badge>
                                      </div>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                      <div
                                        className={cn("h-full rounded-full transition-all", masteryColor(student.masteryRate))}
                                        style={{ width: `${student.masteryRate}%` }}
                                      />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground mt-1.5">
                                      <span>{student.totalQuestions || 0} total questions</span>
                                      <span>{student.correctAnswers || 0} correct</span>
                                      {student.weakSubjects?.length > 0 && (
                                        <span className="text-red-500">Weak: {student.weakSubjects.slice(0, 2).join(", ")}{student.weakSubjects.length > 2 ? "..." : ""}</span>
                                      )}
                                      {student.strongSubjects?.length > 0 && (
                                        <span className="text-emerald-500">Strong: {student.strongSubjects.slice(0, 2).join(", ")}{student.strongSubjects.length > 2 ? "..." : ""}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="shrink-0 ml-2">
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="pt-4 border-t mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2">
                                          <Brain className="h-4 w-4 text-primary" />
                                          <span className="text-sm font-semibold">Subject Breakdown</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          {renderSubjectBars(student.subjectBreakdown || {})}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {student.weakSubjects?.length > 0 && (
                                            <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1.5">
                                              <AlertTriangle className="h-3 w-3 text-red-500" />
                                              <span className="text-[11px] text-red-600 font-medium">Weak: {student.weakSubjects.join(", ")}</span>
                                            </div>
                                          )}
                                          {student.strongSubjects?.length > 0 && (
                                            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5">
                                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                                              <span className="text-[11px] text-emerald-600 font-medium">Strong: {student.strongSubjects.join(", ")}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  )
}
