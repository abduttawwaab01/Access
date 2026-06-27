"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { BookOpen, Users, ChevronDown, ChevronUp, User, Mail } from "lucide-react"

export default function TeacherClassesPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const staffRes = await fetch(`/api/staff?userId=${userId}`)
      if (!staffRes.ok) { setLoading(false); return }
      const staff = await staffRes.json()
      const staffId = staff?.id || ""

      const [taRes, clsRes, stuRes] = await Promise.all([
        fetch(`/api/teacher-assignments?teacherId=${staffId}`),
        fetch("/api/classes"),
        fetch("/api/students"),
      ])

      const ta = await taRes.json()
      const allClasses = await clsRes.json()
      const allStudents = await stuRes.json()

      const assignedIds: string[] = ta?.classIds || []
      const myClasses = allClasses.filter((c: any) => assignedIds.includes(c.id))

      const classStudentMap: Record<string, any[]> = {}
      for (const cls of myClasses) {
        classStudentMap[cls.id] = allStudents.filter((s: any) => s.classId === cls.id)
      }

      setClasses(myClasses.map((c: any) => ({
        ...c,
        students: classStudentMap[c.id] || [],
      })))
      setStudents(allStudents)
      setLoading(false)
    }
    load()
  }, [userId])

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  if (loading) return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2">{[1,2].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}</div>
    </div>
  )

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Classes</h2>
        <p className="text-sm text-muted-foreground">Classes you teach and their details</p>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold">No classes assigned</h3>
          <p className="text-sm text-muted-foreground mt-1">You have not been assigned to any classes yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((cls, i) => (
            <motion.div key={cls.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-0 overflow-hidden">
                <div className="cursor-pointer" onClick={() => toggleExpand(cls.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{cls.name}{cls.arm ? ` ${cls.arm}` : ""}</p>
                          <p className="text-xs text-muted-foreground">{cls.level?.name || cls.section || "General"}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {cls.students?.length || 0} students</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-[10px]">{cls.level?.name || cls.section || "General"}</Badge>
                        {expanded === cls.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground mt-2" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground mt-2" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
                <AnimatePresence>
                  {expanded === cls.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-border/50"
                    >
                      <div className="p-3 space-y-1">
                        {cls.students?.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">No students in this class</p>
                        ) : (
                          cls.students.map((student: any) => (
                            <div key={student.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">{student.firstName?.[0]}{student.lastName?.[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{student.firstName} {student.lastName}</p>
                                <p className="text-xs text-muted-foreground truncate">{student.studentId || ""}</p>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                {student.email && (
                                  <a href={`mailto:${student.email}`} className="hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                                    <Mail className="h-3.5 w-3.5" />
                                  </a>
                                )}
                                <User className="h-3.5 w-3.5" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
