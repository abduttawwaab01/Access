"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, CalendarCheck, BookOpen, ChevronRight, Users } from "lucide-react"
import { getInitials, cn } from "@/lib/utils"
import Link from "next/link"
import { useParentChildren } from "@/hooks/useParentChildren"

export default function ParentChildrenPage() {
  const { children, loading: childrenLoading } = useParentChildren()
  const [resultsMap, setResultsMap] = useState<Record<string, any[]>>({})
  const [loadingResults, setLoadingResults] = useState(false)

  useEffect(() => {
    if (children.length === 0) return
    setLoadingResults(true)
    Promise.all(
      children.map((child) =>
        fetch(`/api/results?studentId=${child.id}`)
          .then((r) => r.json())
          .then((data) => ({ id: child.id, data }))
      )
    ).then((all) => {
      const map: Record<string, any[]> = {}
      all.forEach(({ id, data }) => { map[id] = data })
      setResultsMap(map)
      setLoadingResults(false)
    })
  }, [children])

  const getAverageScore = (childId: string): number | null => {
    const results = resultsMap[childId]
    if (!results || results.length === 0) return null
    return Math.round(results.reduce((s: number, r: any) => s + r.score, 0) / results.length)
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground"
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-danger"
  }

  const getScoreBadge = (score: number | null) => {
    if (score === null) return "bg-muted text-muted-foreground"
    if (score >= 80) return "bg-success/10 text-success"
    if (score >= 60) return "bg-warning/10 text-warning"
    return "bg-danger/10 text-danger"
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 15 } },
  }

  if (childrenLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Children</h2>
        <p className="text-sm text-muted-foreground">View profiles and performance for all your children</p>
      </motion.div>

      {children.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium">No children linked</p>
              <p className="text-xs text-muted-foreground">No student profiles are linked to your account yet.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => {
            const avgScore = getAverageScore(child.id)
            return (
              <motion.div key={child.id} variants={itemVariants}>
                <Card className="glass-card border-0 overflow-hidden group transition-all duration-200 hover:shadow-[0_0_25px_-5px_hsl(var(--primary)/0.15)]">
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 pb-3">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                      >
                        <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {getInitials(child.name)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold truncate">{child.name}</p>
                        <p className="text-sm text-muted-foreground">{child.className}</p>
                        {child.relationship && (
                          <Badge variant="outline" className="mt-1 text-[10px] bg-primary/5 border-primary/10">
                            {child.relationship}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 md:p-5 space-y-4">
                    {loadingResults ? (
                      <div className="h-12 rounded-lg bg-muted animate-pulse" />
                    ) : (
                      <div className="rounded-xl bg-muted/30 p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Average Score</p>
                        {avgScore !== null ? (
                          <>
                            <p className={cn("text-3xl font-bold mt-0.5", getScoreColor(avgScore))}>
                              {avgScore}%
                            </p>
                            <Badge className={cn("mt-1 text-[10px]", getScoreBadge(avgScore))}>
                              {avgScore >= 80 ? "Excellent" : avgScore >= 60 ? "Good" : "Needs Improvement"}
                            </Badge>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">No results yet</p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Results", icon: BarChart3, href: `/parent/results`, color: "from-blue-600 to-blue-500" },
                        { label: "Attendance", icon: CalendarCheck, href: `/parent/attendance`, color: "from-emerald-600 to-emerald-500" },
                        { label: "Timetable", icon: BookOpen, href: `/parent/timetable`, color: "from-violet-600 to-violet-500" },
                      ].map((link) => {
                        const Icon = link.icon
                        return (
                          <Link key={link.label} href={link.href}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-auto flex-col gap-1 py-2 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
                            >
                              <div className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm",
                                link.color,
                              )}>
                                <Icon className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="text-[10px] font-medium">{link.label}</span>
                            </Button>
                          </Link>
                        )
                      })}
                    </div>

                    <Link href={`/parent/results`} className="block">
                      <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-xs text-muted-foreground hover:bg-muted/30 transition-colors">
                        <span>View full profile</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
