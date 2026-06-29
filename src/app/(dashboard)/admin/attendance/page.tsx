"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { QrCode, Camera, CheckCircle2, Clock, AlertTriangle, User, Search, Scan, History, Shield, RefreshCw, Download } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { SchoolQRCodeDownload } from "@/components/SchoolQRCode"

export default function AdminAttendancePage() {
  const [activeTab, setActiveTab] = useState("scanner")
  const [logs, setLogs] = useState<any[]>([])
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scanned, setScanned] = useState<string | null>(null)
  const [scannedType, setScannedType] = useState<"student" | "staff" | null>(null)
  const [scanning, setScanning] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [logFilter, setLogFilter] = useState<"all" | "student" | "staff">("all")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [todayStats, setTodayStats] = useState({ studentPresent: 0, studentLate: 0, studentTotal: 0, staffPresent: 0, staffLate: 0, staffTotal: 0 })

  useEffect(() => {
    Promise.all([
      fetch("/api/attendance-logs").then((r) => r.json()),
      fetch("/api/attendance-qr").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
    ]).then(([l, q, s, st]) => {
      setLogs(l)
      setQrCodes(q)
      setStudents(s)
      setStaff(st)
      updateStats(l)
      setLoading(false)
    })
  }, [])

  const updateStats = (logs: any[]) => {
    const today = new Date().toISOString().split("T")[0]
    const todayLogs = logs.filter((l) => l.date === today)
    const studentLogs = todayLogs.filter((l) => l.userType === "student")
    const staffLogs = todayLogs.filter((l) => l.userType === "staff")
    setTodayStats({
      studentPresent: studentLogs.filter((l) => l.status === "present").length,
      studentLate: studentLogs.filter((l) => l.status === "late").length,
      studentTotal: studentLogs.length,
      staffPresent: staffLogs.filter((l) => l.status === "present").length,
      staffLate: staffLogs.filter((l) => l.status === "late").length,
      staffTotal: staffLogs.length,
    })
  }

  const findUser = (code: string) => {
    try {
      const parsed = JSON.parse(code)
      if (parsed.type === "student" && parsed.id) {
        const student = students.find((s) => s.id === parsed.id)
        if (student) return { type: "student", id: student.id, name: `${student.firstName} ${student.lastName}`, user: student }
      }
      if (parsed.type === "school_attendance") return { type: "staff", id: null, name: "Staff Entry" }
      if (parsed.type === "staff") {
        const staffMember = staff.find((s) => s.id === parsed.id || s.staffId === parsed.code)
        if (staffMember) return { type: "staff", id: staffMember.id, name: `${staffMember.firstName} ${staffMember.lastName}` }
      }
    } catch {}
    const qr = qrCodes.find((q) => (q.data || q.code) === code)
    if (qr) {
      if (qr.type === "school_attendance" || qr.type === "school_entry") return { type: "staff", id: null, name: "Staff Entry" }
      const student = students.find((s) => `STU-${s.firstName.toUpperCase()}-${s.id.padStart(3, "0")}` === code)
      if (student) return { type: "student", id: student.id, name: `${student.firstName} ${student.lastName}`, user: student }
    }
    return null
  }

  const markStaffAttendance = async (staffId: string) => {
    const now = new Date()
    const date = now.toISOString().split("T")[0]
    const time = now.toTimeString().split(" ")[0].substring(0, 5)
    const hour = now.getHours()
    const status = hour >= 8 ? "late" : "present"
    const existing = logs.find((l) => l.userId === staffId && l.date === date)
    if (existing) { toast.error("Staff already marked today"); return }
    const res = await fetch("/api/attendance-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: staffId, userType: "staff", date, time, status, method: "qr" }),
    })
    if (res.ok) {
      const newLog = await res.json()
      const updated = [...logs, newLog]
      setLogs(updated)
      updateStats(updated)
      toast.success(`Staff marked as ${status}`)
      setScanned(null)
      setScannedType(null)
    }
  }

  const markAttendance = async (userId: string, userType: string) => {
    const now = new Date()
    const date = now.toISOString().split("T")[0]
    const time = now.toTimeString().split(" ")[0].substring(0, 5)
    const hour = now.getHours()
    const lateThreshold = userType === "staff" ? 8 : 9
    const status = hour >= lateThreshold ? "late" : "present"

    const existing = logs.find((l) => l.userId === userId && l.date === date)
    if (existing) {
      toast.error(`${userType === "student" ? "Student" : "Staff"} already marked today`)
      return
    }

    const res = await fetch("/api/attendance-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userType, date, time, status, method: scanned ? "qr" : "manual" }),
    })
    if (res.ok) {
      const newLog = await res.json()
      const updated = [...logs, newLog]
      setLogs(updated)
      updateStats(updated)
      toast.success(`${userType === "student" ? "Student" : "Staff"} marked as ${status}`)
      setScanned(null)
      setScannedType(null)
    }
  }

  const startScanner = async () => {
    setScanned(null)
    setScannedType(null)
    setScanning(true)
    try {
      const Html5Qrcode = (await import("html5-qrcode")).Html5Qrcode
      const scanner = new Html5Qrcode("qr-reader")
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          scanner.stop()
          setScanning(false)
          setScanned(decodedText)
          const user = findUser(decodedText)
          if (user) {
            setScannedType(user.type as "student" | "staff")
            if (user.type === "staff") {
              if (user.id) {
                markStaffAttendance(user.id)
              } else {
                toast.success("School attendance QR — open camera for staff self-check-in")
              }
            } else if (user.id) {
              markAttendance(user.id, "student")
            } else {
              toast.error("Unknown QR code")
            }
          } else {
            setScannedType(null)
            toast.error("Unknown QR code")
          }
        },
        () => {}
      )
    } catch (err: any) {
      console.error(err)
      if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
        toast.error("Camera permission denied. Please allow camera access in your browser settings (use HTTPS or localhost).")
      } else {
        toast.error("Camera access denied or unavailable")
      }
      setScanning(false)
    }
  }

  const stopScanner = () => {
    setScanning(false)
  }

  const handleManualCheckIn = () => {
    if (!manualCode.trim()) { toast.error("Enter a student/staff code"); return }
    const user = findUser(manualCode.trim())
    if (user && user.id) {
      const typeLabel = user.type === "student" ? "Student" : "Staff"
      toast.success(`${typeLabel} found: ${user.name}`)
      markAttendance(user.id, user.type)
    } else if (user?.type === "staff") {
      toast.success("Staff entry logged")
    } else {
      toast.error("No user found with that code")
    }
    setManualCode("")
  }

  const getUserName = (userId: string, userType: string) => {
    if (userType === "student") {
      const s = students.find((s) => s.id === userId || s.userId === userId)
      return s ? `${s.firstName} ${s.lastName}` : userId
    }
    const s = staff.find((s) => s.id === userId || s.userId === userId)
    return s ? `${s.firstName} ${s.lastName}` : userId
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-64"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Smart Attendance</h2>
        <p className="text-sm text-muted-foreground">QR scanning, face recognition, and manual check-in</p>
      </motion.div>

      {/* Today's Stats */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 glass-card border-l-4 border-l-blue-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-blue-500" />
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Students</p>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-lg font-bold text-green-600">{todayStats.studentPresent}</p>
                <p className="text-[10px] text-muted-foreground">Present</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{todayStats.studentLate}</p>
                <p className="text-[10px] text-muted-foreground">Late</p>
              </div>
              <div>
                <p className="text-lg font-bold">{todayStats.studentTotal}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 glass-card border-l-4 border-l-purple-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-purple-500" />
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Staff</p>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-lg font-bold text-green-600">{todayStats.staffPresent}</p>
                <p className="text-[10px] text-muted-foreground">Present</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{todayStats.staffLate}</p>
                <p className="text-[10px] text-muted-foreground">Late</p>
              </div>
              <div>
                <p className="text-lg font-bold">{todayStats.staffTotal}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/15 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold">{todayStats.studentPresent + todayStats.staffPresent}</p>
              <p className="text-xs text-muted-foreground">Total Present</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold">{todayStats.studentTotal + todayStats.staffTotal}</p>
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="scanner" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><QrCode className="h-4 w-4 mr-1" /> QR Scanner</TabsTrigger>
          <TabsTrigger value="manual" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><User className="h-4 w-4 mr-1" /> Manual</TabsTrigger>
          <TabsTrigger value="logs" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><History className="h-4 w-4 mr-1" /> Today's Logs</TabsTrigger>
          <TabsTrigger value="codes" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Shield className="h-4 w-4 mr-1" /> QR Codes</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "scanner" && (
      <div className="mt-4">
        <Card className="border-0 glass-card">
          <CardContent className="p-4 space-y-4">
            {!scanning && !scanned && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Camera className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Scan a <span className="text-blue-600 font-medium">Student</span> or <span className="text-purple-600 font-medium">Staff</span> ID card QR code</p>
                <Button onClick={startScanner} className="animated-gradient border-0 text-white">
                  <Scan className="h-4 w-4 mr-2" /> Start Scanner
                </Button>
              </div>
            )}

            {scanning && (
              <div>
                <div id="qr-reader" className="w-full max-w-sm mx-auto rounded-xl overflow-hidden" />
                <div className="text-center mt-4">
                  <Button variant="outline" onClick={() => { setScanning(false); setScannedType(null) }}>Stop Scanner</Button>
                </div>
              </div>
            )}

            {scanned && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="font-semibold">QR Code Scanned</p>
                {scannedType && (
                  <Badge variant="outline" className={`mt-2 ${
                    scannedType === "student"
                      ? "border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-950/30"
                      : "border-purple-300 text-purple-600 bg-purple-50 dark:bg-purple-950/30"
                  }`}>
                    {scannedType === "student" ? "Student ID Card" : "Staff ID Card"}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mt-2 font-mono break-all">{scanned}</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" onClick={() => { setScanned(null); setScannedType(null) }}>Scan Again</Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Face Recognition Placeholder */}
        <Card className="border-0 glass-card mt-4">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Face Recognition</p>
                <p className="text-xs text-muted-foreground">AI-powered identity verification</p>
              </div>
            </div>
            <Badge className="bg-amber-500/15 text-amber-600">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
      )}

      {activeTab === "manual" && (
      <div className="mt-4">
        <Card className="border-0 glass-card">
          <CardContent className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">Enter a <span className="text-blue-600 font-medium">Student</span> or <span className="text-purple-600 font-medium">Staff</span> ID code to mark attendance</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Enter QR code (e.g. STU-ALICE-001)" value={manualCode} onChange={(e) => setManualCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleManualCheckIn()} />
              <Button onClick={handleManualCheckIn} className="shrink-0"><Search className="h-4 w-4 mr-1" /> Find</Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Quick codes:</p>
              {qrCodes.map((qr) => (
                <Button key={qr.id} variant="outline" size="sm" className="mr-2 mb-1" onClick={() => { setManualCode(qr.code) }}>
                  {qr.code}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {activeTab === "logs" && (
      <div className="mt-4">
        <Card className="border-0 glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {(["all", "student", "staff"] as const).map((f) => (
                <button key={f} onClick={() => setLogFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    logFilter === f
                      ? f === "student" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : f === "staff" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                        : "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f === "all" ? "All" : f === "student" ? "Students" : "Staff"}
                </button>
              ))}
            </div>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No attendance logs yet</div>
            ) : (
              <div className="space-y-2">
                {logs.slice().reverse().filter((l) => logFilter === "all" || l.userType === logFilter).map((log) => {
                  const isStudent = log.userType === "student"
                  return (
                    <div key={log.id} className={`flex items-center justify-between p-3 rounded-xl ${isStudent ? "bg-blue-50/50 dark:bg-blue-950/10" : "bg-purple-50/50 dark:bg-purple-950/10"}`}>
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-8 w-8 ${isStudent ? "ring-1 ring-blue-200" : "ring-1 ring-purple-200"}`}>
                          <AvatarFallback className={`text-xs ${isStudent ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                            {getUserName(log.userId, log.userType).split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{getUserName(log.userId, log.userType)}</p>
                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${
                              isStudent
                                ? "border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-950/30"
                                : "border-purple-200 text-purple-600 bg-purple-50 dark:bg-purple-950/30"
                            }`}>
                              {isStudent ? "Student" : "Staff"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{log.date} at {log.time} via {log.method}</p>
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

      {activeTab === "codes" && (
      <div className="mt-4 space-y-4">
        <SchoolQRCodeDownload />
        <Card className="border-0 glass-card">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><QrCode className="h-4 w-4" /> Attendance QR Codes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qrCodes.map((qr) => (
                <Card key={qr.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-primary/10">
                        <QrCode className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{qr.type.replace("_", " ")} QR</p>
                        <p className="text-xs text-muted-foreground font-mono">{qr.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center p-4 bg-white rounded-xl">
                      <QRCodeSVG value={qr.code} size={120} level="M" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {qrCodes.length === 0 && (
                <div className="col-span-full text-center py-8 text-sm text-muted-foreground">No QR codes generated yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )
}
