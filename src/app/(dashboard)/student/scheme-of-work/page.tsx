"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronDown, ChevronUp, FileText } from "lucide-react"
import { useSession } from "next-auth/react"
import { EmptyState } from "@/components/admin/EmptyState"

export default function StudentSchemeOfWorkPage() {
  const { data: session } = useSession()
  const [subjects, setSubjects] = useState<any[]>([])
  const [schemes, setSchemes] = useState<any[]>([])
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const userId = (session?.user as any)?.id
    if (!userId) { setLoading(false); return }
    const load = async () => {
      try {
        const data = await fetch(`/api/students?userId=${userId}`).then((r) => r.json())
        const s = Array.isArray(data) ? data[0] : data
        setStudent(s)
        if (s?.classId) {
          const [schemesData, subjectsData] = await Promise.all([
            fetch(`/api/scheme-of-work?classId=${s.classId}`).then((r) => r.json()),
            fetch(`/api/subjects?classId=${s.classId}`).then((r) => r.json()),
          ])
          setSchemes(schemesData)
          setSubjects(subjectsData)
        }
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [session])

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || id

  if (loading) return <div className="p-4 md:p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Scheme of Work</h2>
        <p className="text-sm text-muted-foreground">Curriculum overview for your class</p>
      </motion.div>

      {schemes.length === 0 ? (
        <EmptyState title="No schemes yet" description="No scheme of work has been published for your class" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {schemes.filter((s) => s.status === "published").map((scheme, i) => (
              <motion.div key={scheme.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`glass-card border-0 overflow-hidden ${expanded === scheme.id ? "ring-1 ring-primary/20" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{scheme.title || getSubjectName(scheme.subjectId)}</p>
                          <p className="text-xs text-muted-foreground">{getSubjectName(scheme.subjectId)} &bull; {scheme.term || ""} {scheme.session ? `- ${scheme.session}` : ""} &bull; {scheme.weeks?.length || 0} weeks</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        {expanded === scheme.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expanded === scheme.id && (
                      <div className="mt-4 pt-3 border-t border-border/50 space-y-3">
                        {scheme.weeks?.length > 0 ? (
                          scheme.weeks.map((week: any, wi: number) => (
                            <div key={wi} className="p-3 rounded-xl bg-muted/30">
                              <div className="flex items-start gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                                  {week.week || week.weekNumber || wi + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{week.topic || `Week ${wi + 1}`}</p>
                                  {week.objectives && <p className="text-xs text-muted-foreground mt-1">{week.objectives}</p>}
                                  {week.content && <p className="text-xs text-muted-foreground mt-0.5">{week.content}</p>}
                                  {week.resources && <p className="text-xs text-muted-foreground mt-0.5 italic">Resources: {week.resources}</p>}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground py-2">Week details not available</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
