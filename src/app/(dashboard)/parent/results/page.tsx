"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts"
import { cn } from "@/lib/utils"

const children = [
  { id: "1", name: "Alice Johnson" },
  { id: "2", name: "Bob Johnson" },
]

export default function ParentResultsPage() {
  const [childId, setChildId] = useState("1")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/results?studentId=${childId}`).then((r) => r.json()).then((data) => {
      setResults(data)
      setLoading(false)
    })
  }, [childId])

  const terms = [...new Set(results.map((r) => r.term))]
  const [activeTerm, setActiveTerm] = useState(terms[0] || "")

  const termResults = results.filter((r) => r.term === activeTerm)
  const avgScore = termResults.length > 0 ? Math.round(termResults.reduce((s, r) => s + r.score, 0) / termResults.length) : 0

  const barData = termResults.map((r) => ({ subject: r.subject, score: r.score, fullMark: 100 }))
  const radarData = termResults.map((r) => ({ subject: r.subject, value: r.score }))

  const prevTerm = terms[terms.indexOf(activeTerm) - 1]
  const prevResults = prevTerm ? results.filter((r) => r.term === prevTerm) : []
  const comparisonData = barData.map((b) => {
    const prev = prevResults.find((p) => p.subject === b.subject)
    return { ...b, previous: prev?.score || 0 }
  })

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Results & Performance</h2>
        <p className="text-sm text-muted-foreground">Track academic progress</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {children.map((c) => (
          <button key={c.id} onClick={() => setChildId(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${childId === c.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
          >{c.name.split(" ")[0]}</button>
        ))}
      </div>

      {!loading && terms.length > 0 && (
        <Tabs value={activeTerm} onValueChange={setActiveTerm}>
          <TabsList className="w-full">
            {terms.map((t) => <TabsTrigger key={t} value={t} className="flex-1 text-xs">{t}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : termResults.length === 0 ? (
        <Card className="glass-card border-0"><CardContent className="p-8 text-center text-muted-foreground">No results available for this term</CardContent></Card>
      ) : (
        <>
          {/* Average Score Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-6 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Average Score</p>
                <p className={cn("text-5xl font-bold mt-1", avgScore >= 80 ? "text-success" : avgScore >= 60 ? "text-warning" : "text-danger")}>
                  {avgScore}%
                </p>
                {prevTerm && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {prevResults.length > 0 && (() => {
                      const prevAvg = Math.round(prevResults.reduce((s, r) => s + r.score, 0) / prevResults.length)
                      const diff = avgScore - prevAvg
                      return <span className={diff >= 0 ? "text-success" : "text-danger"}>{diff >= 0 ? "↑" : "↓"} {Math.abs(diff)}% from {prevTerm}</span>
                    })()}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar Chart */}
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-3">Subject Scores</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="subject" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="score" name={activeTerm} radius={[6, 6, 0, 0]} barSize={20} fill="#6366f1" />
                    {prevTerm && <Bar dataKey="previous" name={prevTerm} radius={[6, 6, 0, 0]} barSize={20} fill="#94a3b8" opacity={0.5} />}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-3">Performance Profile</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <div className="space-y-2">
            {termResults.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{r.subject}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold", r.score >= 80 ? "text-success" : r.score >= 60 ? "text-warning" : "text-danger")}>
                          {r.score}/{r.total}
                        </span>
                        <Badge className={cn("text-[10px]", r.grade === "A" ? "bg-success/10 text-success" : r.grade === "B" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning")}>
                          {r.grade}
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", r.score >= 80 ? "bg-success" : r.score >= 60 ? "bg-warning" : "bg-danger")}
                        style={{ width: `${(r.score / r.total) * 100}%` }} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
