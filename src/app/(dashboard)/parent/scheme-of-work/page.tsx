"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronDown, ChevronUp, Users } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import { useParentChildren } from "@/hooks/useParentChildren"

export default function ParentSchemeOfWorkPage() {
  const { children, loading: childrenLoading } = useParentChildren()
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [subjects, setSubjects] = useState<any[]>([])
  const [schemes, setSchemes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const linkedStudentIds = useMemo(() => children.map((c) => c.id), [children])

  useEffect(() => {
    if (childrenLoading) return
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id)
    }
    setLoading(false)
  }, [children, childrenLoading])

  useEffect(() => {
    if (!selectedChild) return
    const child = children.find((c) => c.id === selectedChild)
    if (!child?.classId) return
    setLoading(true)
    Promise.all([
      fetch(`/api/scheme-of-work?classId=${child.classId}`).then((r) => r.json()),
      fetch(`/api/subjects?classId=${child.classId}`).then((r) => r.json()),
    ]).then(([schemesData, subjectsData]) => {
      setSchemes(schemesData)
      setSubjects(subjectsData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [selectedChild, children])

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || id

  if (childrenLoading || loading) {
    return <div className="p-4 md:p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Scheme of Work</h2>
        <p className="text-sm text-muted-foreground">Curriculum overview for your children</p>
      </motion.div>

      {children.length === 0 ? (
        <EmptyState title="No children linked" description="Link your children to view their scheme of work" />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <Button key={c.id} size="sm" variant={selectedChild === c.id ? "default" : "outline"} onClick={() => setSelectedChild(c.id)}>
                <Users className="h-3.5 w-3.5 mr-1" />{c.firstName} {c.lastName}
              </Button>
            ))}
          </div>

          {schemes.filter((s) => s.status === "published").length === 0 ? (
            <EmptyState title="No schemes yet" description="No published scheme of work for this child's class" />
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
        </>
      )}
    </div>
  )
}
