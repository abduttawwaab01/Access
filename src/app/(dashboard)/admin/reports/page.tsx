"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from "recharts"
import { FileText, Download, Printer, TrendingUp, Award, Users, BarChart3 } from "lucide-react"
import { toast } from "sonner"

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("academic")
  const [results, setResults] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetch("/api/results").then((r) => r.json()), fetch("/api/students").then((r) => r.json())])
      .then(([r, s]) => { setResults(r); setStudents(s); setLoading(false) })
  }, [])

  const terms = [...new Set(results.map((r) => r.term))]
  const termData = terms.map((term) => {
    const tResults = results.filter((r) => r.term === term)
    const avg = tResults.length > 0 ? Math.round(tResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / tResults.length) : 0
    return { term, average: avg }
  })

  const subjectData = results.reduce((acc: any, r) => {
    if (!acc[r.subject]) acc[r.subject] = { subject: r.subject, totalScore: 0, totalMax: 0, count: 0 }
    acc[r.subject].totalScore += r.score
    acc[r.subject].totalMax += r.total
    acc[r.subject].count++
    return acc
  }, {})

  const subjectChart = Object.values(subjectData).map((s: any) => ({
    subject: s.subject,
    average: Math.round((s.totalScore / s.totalMax) * 100),
  }))

  const handleExport = () => {
    const dataStr = JSON.stringify({ generatedAt: new Date().toISOString(), results, students, termData, subjectChart }, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `school_report_${new Date().toISOString().split("T")[0]}.json`; a.click()
    URL.revokeObjectURL(url)
    toast.success("Report exported")
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-48", "h-48"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-sm text-muted-foreground">Academic and administrative reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Print</Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="academic" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Award className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" /> Academic</TabsTrigger>
          <TabsTrigger value="subject" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" /> Subject</TabsTrigger>
          <TabsTrigger value="comparison" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" /> Comparison</TabsTrigger>
          <TabsTrigger value="enrollment" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Users className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" /> Enrollment</TabsTrigger>
        </TabsList>

        {activeTab === "academic" && (
        <TabsContent value="academic" className="mt-4 space-y-4">
          <Card className="border-0 glass-card">
            <CardContent className="p-4">
              <h3 className="text-sm md:text-base font-semibold mb-3">Term Performance Trend</h3>
              <div className="h-48 md:h-56 min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <LineChart data={termData} margin={{ left: 0, right: 5 }}>
                    <XAxis dataKey="term" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={25} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="average" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {termData.map((t) => (
              <Card key={t.term} className="border-0 glass-card">
                <CardContent className="p-3 md:p-4 text-center">
                  <p className="text-[11px] md:text-sm text-muted-foreground">{t.term}</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">{t.average}%</p>
                  <Badge className={t.average >= 65 ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>
                    {t.average >= 65 ? "Good" : "Needs Improvement"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        )}

        {activeTab === "subject" && (
        <TabsContent value="subject" className="mt-4">
          <Card className="border-0 glass-card">
            <CardContent className="p-4">
              <h3 className="text-sm md:text-base font-semibold mb-3">Subject Performance</h3>
              <div className="h-48 md:h-64 min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <RadarChart data={subjectChart}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar dataKey="average" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {activeTab === "comparison" && (
        <TabsContent value="comparison" className="mt-4">
          <Card className="border-0 glass-card">
            <CardContent className="p-4">
              <h3 className="text-sm md:text-base font-semibold mb-3">Subject Average Comparison</h3>
              <div className="overflow-x-auto">
                <div className="h-48 md:h-64 min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <BarChart data={subjectChart} layout={subjectChart.length > 6 ? "vertical" : "horizontal"} margin={{ left: 0, right: 5 }}>
                    {subjectChart.length > 6 ? (
                      <>
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} width={25} />
                        <YAxis dataKey="subject" type="category" tick={{ fontSize: 9 }} width={70} />
                      </>
                    ) : (
                      <>
                        <XAxis dataKey="subject" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={25} />
                      </>
                    )}
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {activeTab === "enrollment" && (
        <TabsContent value="enrollment" className="mt-4">
          <Card className="border-0 glass-card">
            <CardContent className="p-4">
              <h3 className="text-sm md:text-base font-semibold mb-3">Student Enrollment</h3>
              <div className="flex items-center gap-3 md:gap-4 mb-4">
                <div className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
                  <p className="text-lg md:text-xl font-bold">{students.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Students</p>
                  <p className="text-[11px] md:text-xs text-muted-foreground">Across all classes</p>
                </div>
              </div>
              <div className="space-y-1.5 md:space-y-2">
                {[...new Set(students.filter((s) => s.classId).map((s) => s.classId))].map((classId) => {
                  const count = students.filter((s) => s.classId === classId).length
                  return (
                    <div key={classId} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-xs md:text-sm">Class {classId}</span>
                      <Badge className="text-[10px] md:text-xs">{count} students</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
