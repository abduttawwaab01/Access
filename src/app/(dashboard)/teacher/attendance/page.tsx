"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Search, CheckCircle2, Clock, AlertTriangle, User, History, Camera, QrCode, ScanLine } from "lucide-react"
import { QRScanner } from "@/components/QRScanner"
import { playSuccess, playFailure } from "@/lib/sounds"

export default function TeacherAttendancePage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [teacher, setTeacher] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("mark")
  const [students, setStudents] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!userId) return
    fetch("/api/staff?userId=" + userId)
      .then((r) => r.json())
      .then((staffData) => {
        setTeacher(staffData)
        const staffId = staffData?.id || ""
        return fetch("/api/teacher-assignments?teacherId=" + staffId).then((r) => r.json())
      })
      .then((tas) => {
        const ta = Array.isArray(tas) ? tas[0] : null
        const classIds: string[] = ta?.classIds || []
        return Promise.all([
          fetch("/api/students").then((r) => r.json()),
          fetch("/api/attendance-logs").then((r) => r.json()),
          fetch("/api/classes").then((r) => r.json()),
          classIds,
        ])
      })
      .then(([s, l, c, classIds]) => {
        setStudents(s)
        setLogs(l)
        setClasses(c)
        const defaultClass = classIds.length > 0 ? classIds[0] : (c.length > 0 ? c[0].id : "")
        setSelectedClass(defaultClass)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  const classStudents = students.filter((s) => s.classId === selectedClass || !selectedClass)
  const today = new Date().toISOString().split("T")[0]

  const isMarked = (studentId: string) => logs.some((l) => l.userId === studentId && l.date === today)

  const markStudent = async (studentId: string, status: "present" | "late", method: "manual" | "qr" = "manual") => {
    if (isMarked(studentId)) { playFailure(); toast.error("Already marked today"); return false }
    const now = new Date()
    const time = now.toTimeString().split(" ")[0].substring(0, 5)
    const res = await fetch("/api/attendance-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: studentId, userType: "student", date: today, time, status, method }),
    })
    if (res.ok) {
      const newLog = await res.json()
      setLogs([...logs, newLog])
      playSuccess()
      toast.success(`Marked as ${status}`)
      return true
    }
    if (res.status === 409) {
      playFailure()
      toast.error("Already marked today")
    }
    return false
  }

  const handleQRScan = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText)
      if (data.type === "student" && data.id) {
        const student = students.find((s) => s.id === data.id)
        if (!student) { playFailure(); toast.error("Student not found"); return }
        const hour = new Date().getHours()
        const status = hour >= 9 ? "late" : "present"
        const ok = await markStudent(data.id, status, "qr")
        if (ok) toast.success(`${student.firstName} ${student.lastName} marked ${status} via QR`)
      } else {
        playFailure()
        toast.error("Not a valid student QR code")
      }
    } catch {
      playFailure()
      toast.error("Invalid QR code format")
    }
  }

  const filtered = classStudents.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-64"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Attendance</h2>
        <p className="text-sm text-muted-foreground">Mark and view student attendance</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="mark" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><User className="h-4 w-4 mr-1" /> Mark</TabsTrigger>
          <TabsTrigger value="scan" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><ScanLine className="h-4 w-4 mr-1" /> Scan QR</TabsTrigger>
          <TabsTrigger value="today" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><History className="h-4 w-4 mr-1" /> Today</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "mark" && (
      <div className="mt-4 space-y-4">
        <div className="flex gap-2">
          <select
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search student..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No students found</div>
          ) : (
            filtered.map((student) => {
              const marked = isMarked(student.id)
              return (
                <Card key={student.id} className={`border-0 glass-card ${marked ? "opacity-60" : ""}`}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-muted-foreground">{student.classId ? classes.find((c) => c.id === student.classId)?.name || "Unassigned" : "Unassigned"}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {marked ? (
                        <Badge className="bg-green-500/15 text-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Done</Badge>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-200" onClick={() => markStudent(student.id, "present")}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Present
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-amber-600 border-amber-200" onClick={() => markStudent(student.id, "late")}>
                            <Clock className="h-3 w-3 mr-1" /> Late
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
      )}

      {activeTab === "scan" && (
      <div className="mt-4">
        <QRScanner
          onScan={handleQRScan}
          title="Scan Student ID Card"
          description="Position the student's ID card QR code within the camera frame to mark attendance"
        />
        <div className="mt-4">
          <Card className="border-0 glass-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                The QR code on the student ID card front contains attendance data. Students marked late if scanned after 9:00 AM.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {activeTab === "today" && (
      <div className="mt-4">
        <Card className="border-0 glass-card">
          <CardContent className="p-4">
            {logs.filter((l) => l.date === today).length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No attendance marked today</div>
            ) : (
              <div className="space-y-2">
                {logs.filter((l) => l.date === today).reverse().map((log) => {
                  const student = students.find((s) => s.id === log.userId)
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{student ? `${student.firstName[0]}${student.lastName[0]}` : "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student ? `${student.firstName} ${student.lastName}` : log.userId}</p>
                          <p className="text-xs text-muted-foreground">{log.time} via {log.method}</p>
                        </div>
                      </div>
                      <Badge className={log.status === "present" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>{log.status}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )
}
