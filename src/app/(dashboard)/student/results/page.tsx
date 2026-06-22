"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"
import { Award, TrendingUp } from "lucide-react"
import { useSession } from "next-auth/react"

export default function StudentResultsPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTerm, setActiveTerm] = useState("First Term")

  useEffect(() => {
    if (!userId) return
    fetch(`/api/results?studentId=${userId}`).then((r) => r.json()).then((d) => { setResults(d); setLoading(false) })
  }, [userId])

  const terms = [...new Set(results.map((r) => r.term))]
  const termResults = results.filter((r) => r.term === activeTerm)
  const avgScore = termResults.length > 0 ? Math.round(termResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / termResults.length) : 0

  const radarData = [...new Set(results.map((r) => r.subject))].map((subject) => {
    const subResults = results.filter((r) => r.subject === subject)
    const avg = subResults.length > 0 ? Math.round(subResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / subResults.length) : 0
    return { subject, score: avg }
  })

  const termCompareData = terms.map((term) => {
    const r = results.filter((x) => x.term === term)
    const avg = r.length > 0 ? Math.round(r.reduce((s, x) => s + (x.score / x.total) * 100, 0) / r.length) : 0
    return { term: term === "First Term" ? "1st" : term === "Second Term" ? "2nd" : "3rd", avg }
  })

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Results</h2>
        <p className="text-sm text-muted-foreground">Academic performance across all subjects</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-xl md:text-2xl font-bold">{avgScore}%</p>
            <p className="text-xs text-muted-foreground">Current Avg</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl md:text-2xl font-bold">{termResults.filter((r) => r.score >= r.total * 0.5).length}/{termResults.length}</p>
            <p className="text-xs text-muted-foreground">Passed Subjects</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card border-0">
          <CardContent className="p-4 md:p-5">
            <h3 className="font-semibold mb-3">Term Comparison</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={termCompareData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <XAxis dataKey="term" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={40} fill="hsl(var(--primary))" fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="glass-card border-0">
          <CardContent className="p-4 md:p-5">
            <h3 className="font-semibold mb-3">Subject Radar</h3>
            <div className="h-48 md:h-64 min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTerm} onValueChange={setActiveTerm}>
        <div className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-max gap-1.5">
            {terms.map((t) => <TabsTrigger key={t} value={t} className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg data-[state=active]:animated-gradient data-[state=active]:text-white">{t}</TabsTrigger>)}
          </TabsList>
        </div>
        <TabsContent value={activeTerm} className="space-y-2 mt-0">
          {termResults.map((r, i) => {
            const pct = Math.round((r.score / r.total) * 100)
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{r.subject}</span>
                        <Badge variant="outline" className={`text-[10px] ${r.grade === "A" ? "bg-green-500/10 text-green-600" : r.grade === "B" ? "bg-blue-500/10 text-blue-600" : r.grade === "C" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>{r.grade}</Badge>
                      </div>
                      <span className="text-sm font-bold">{r.score}/{r.total}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
