"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { Wallet, CheckCircle2, Clock, DollarSign, CalendarDays } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"

export default function TeacherSalaryPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [teacherId, setTeacherId] = useState("")
  const [salaryStructures, setSalaryStructures] = useState<any[]>([])
  const [salaryRecords, setSalaryRecords] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      fetch("/api/staff?userId=" + userId).then((r) => r.json()),
      fetch("/api/salary-structures").then((r) => r.json()),
      fetch("/api/salary").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
    ]).then(([staffData, ss, sr, st]) => {
      setTeacherId(staffData?.id || "")
      setSalaryStructures(ss); setSalaryRecords(sr); setStaff(st)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [userId])

  const myStructure = salaryStructures.find((s) => s.staffId === teacherId)
  const myRecords = salaryRecords.filter((r) => r.staffId === teacherId)
  const latestRecord = myRecords[myRecords.length - 1]
  const totalEarned = myRecords.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0)
  const staffMember = staff.find((s) => s.id === teacherId)

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Salary</h2>
        <p className="text-sm text-muted-foreground">Salary structure and payment history</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Base Salary", value: myStructure ? `₦${myStructure.amount}` : "Not set", icon: DollarSign, color: "bg-blue-500/15 text-blue-600" },
          { label: "Total Earned", value: `₦${totalEarned}`, icon: Wallet, color: "bg-green-500/15 text-green-600" },
          { label: "Last Payment", value: latestRecord?.status === "paid" ? latestRecord.month : "None", icon: CalendarDays, color: "bg-purple-500/15 text-purple-600" },
          { label: "Status", value: latestRecord?.status === "paid" ? "Current" : "Pending", icon: latestRecord?.status === "paid" ? CheckCircle2 : Clock, color: latestRecord?.status === "paid" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 glass-card"><CardContent className="p-4"><div className="flex items-center gap-3 mb-1"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}><stat.icon className="h-4 w-4" /></div><span className="text-xs text-muted-foreground">{stat.label}</span></div><p className="text-lg font-bold">{stat.value}</p></CardContent></Card>
        ))}
      </div>

      {myStructure && (
        <Card className="border-0 glass-card"><CardContent className="p-4">
          <h3 className="font-semibold mb-3">Salary Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Monthly Amount</p><p className="text-sm font-bold mt-0.5">₦{myStructure.amount}</p></div>
            <div className="rounded-xl bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Staff ID</p><p className="text-sm font-bold mt-0.5">{myStructure.staffId}</p></div>
          </div>
        </CardContent></Card>
      )}

      <Card className="border-0 glass-card"><CardContent className="p-4">
        <h3 className="font-semibold mb-3">Payment History</h3>
        {myRecords.length === 0 ? <EmptyState title="No records" description="Salary records will appear when payroll is processed" /> : (
          <div className="space-y-2">
            {myRecords.slice().reverse().map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div><p className="text-sm font-medium">{rec.month} {rec.year}</p></div>
                <div className="text-right"><p className="font-mono font-bold">₦{rec.amount}</p><Badge className={rec.status === "paid" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>{rec.status}</Badge></div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>
    </div>
  )
}
