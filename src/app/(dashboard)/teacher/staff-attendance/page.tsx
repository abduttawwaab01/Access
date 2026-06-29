"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle2, QrCode, Loader2 } from "lucide-react"
import { QRScanner } from "@/components/QRScanner"
import { useSession } from "next-auth/react"
import { playSuccess, playFailure } from "@/lib/sounds"

export default function StaffAttendanceCheckInPage() {
  const { data: session } = useSession()
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<string | null>(null)
  const [checkInStatus, setCheckInStatus] = useState<"present" | "late" | null>(null)
  const [staffId, setStaffId] = useState<string | null>(null)
  const [staffName, setStaffName] = useState<string>("Staff")
  const [staffRole, setStaffRole] = useState<string>("")
  const [loadingStaff, setLoadingStaff] = useState(true)

  const authUserId = (session?.user as any)?.id

  useEffect(() => {
    if (!authUserId) { setLoadingStaff(false); return }
    fetch("/api/staff?userId=" + authUserId)
      .then((r) => r.json())
      .then((staffData) => {
        if (staffData?.id) {
          setStaffId(staffData.id)
          setStaffName(`${staffData.firstName} ${staffData.lastName}`)
          setStaffRole(staffData.user?.role || "Staff")
        }
        setLoadingStaff(false)
      })
      .catch(() => setLoadingStaff(false))
  }, [authUserId])

  const handleQRScan = async (decodedText: string) => {
    if (!staffId) {
      playFailure()
      toast.error("Staff record not found. Please contact admin.")
      return
    }

    try {
      const data = JSON.parse(decodedText)
      if (data.type !== "school_attendance") {
        playFailure()
        toast.error("Not a valid school attendance QR code")
        return
      }
    } catch {
      playFailure()
      toast.error("Invalid QR code format")
      return
    }

    const now = new Date()
    const date = now.toISOString().split("T")[0]
    const time = now.toTimeString().split(" ")[0].substring(0, 5)
    const hour = now.getHours()
    const status = hour >= 8 ? "late" : "present"

    const res = await fetch("/api/attendance-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: staffId,
        userType: "staff",
        date,
        time,
        status,
        method: "qr",
      }),
    })

    if (res.ok) {
      setCheckedIn(true)
      setCheckInTime(time)
      setCheckInStatus(status)
      playSuccess()
      toast.success(`Checked in as ${status} at ${time}`)
    } else {
      const data = await res.json()
      if (data.error === "Already marked") {
        playFailure()
        toast.error("You have already checked in today")
      } else {
        playFailure()
        toast.error("Failed to check in")
      }
    }
  }

  const userName = staffName

  if (loadingStaff) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[70dvh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading staff profile...</p>
        </div>
      </div>
    )
  }

  if (checkedIn) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[70dvh]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-0 glass-card max-w-md mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <Badge variant="outline" className="text-xs border-purple-300 text-purple-600 bg-purple-50 dark:bg-purple-950/30 mb-1">Staff Check-In</Badge>
              <h2 className="text-2xl font-bold">Checked In!</h2>
              <p className="text-muted-foreground">
                {userName} <span className="text-xs text-muted-foreground/60">({staffRole})</span>, you are marked as{" "}
                <Badge className={checkInStatus === "present" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>
                  {checkInStatus}
                </Badge>{" "}
                at {checkInTime}
              </p>
              <p className="text-xs text-muted-foreground">See you tomorrow!</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Staff Attendance</h2>
        <p className="text-sm text-muted-foreground">Scan the school QR code to check in</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QRScanner
          onScan={handleQRScan}
          title="Scan School QR Code"
          description="Position the school attendance QR code within the camera frame to check in"
        />

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 glass-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">How it works</h3>
                  <p className="text-sm text-muted-foreground">Quick and easy check-in process</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</div>
                  <div>
                    <p className="text-sm font-medium">Open Camera</p>
                    <p className="text-xs text-muted-foreground">Tap &quot;Start Camera&quot; to enable your device camera</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</div>
                  <div>
                    <p className="text-sm font-medium">Scan QR Code</p>
                    <p className="text-xs text-muted-foreground">Point your camera at the school attendance QR code displayed at the entrance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</div>
                  <div>
                    <p className="text-sm font-medium">Auto Check-In</p>
                    <p className="text-xs text-muted-foreground">Your attendance is recorded automatically. You are marked late after 8:00 AM.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
