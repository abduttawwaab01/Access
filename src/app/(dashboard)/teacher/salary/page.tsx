"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Wallet, CheckCircle2, Clock, DollarSign, CalendarDays, Download, Printer, X, Eye } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import { downloadPng, downloadPdf } from "@/lib/capture"
import { PayslipTemplate } from "@/components/documents/PayslipTemplate"

export default function TeacherSalaryPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [teacherId, setTeacherId] = useState("")
  const [salaryStructures, setSalaryStructures] = useState<any[]>([])
  const [salaryRecords, setSalaryRecords] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      fetch("/api/staff?userId=" + userId).then((r) => r.json()),
      fetch("/api/salary-structures").then((r) => r.json()),
      fetch("/api/salary").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()).catch(() => ({})),
    ]).then(([staffData, ss, sr, st, sch]) => {
      setTeacherId(staffData?.id || "")
      setSalaryStructures(ss); setSalaryRecords(sr); setStaff(st); setSchool(sch)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [userId])

  const myStructure = salaryStructures.find((s) => s.staffId === teacherId)
  const myRecords = salaryRecords.filter((r) => r.staffId === teacherId)
  const latestRecord = myRecords[myRecords.length - 1]
  const totalEarned = myRecords.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0)
  const staffMember = staff.find((s) => s.id === teacherId)
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null)
  const payslipRef = useRef<HTMLDivElement>(null)

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
                <div className="flex items-center gap-3">
                  <p className="font-mono font-bold">₦{rec.amount}</p>
                  <Badge className={rec.status === "paid" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>{rec.status}</Badge>
                  {rec.status === "paid" && (
                    <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => setSelectedPayslip(rec)}>
                      <Download className="h-3.5 w-3.5 mr-1" />Payslip
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>
      <AnimatePresence>
        {selectedPayslip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto" onClick={() => setSelectedPayslip(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-background rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background">
                <h3 className="font-semibold">Payslip — {selectedPayslip.month} {selectedPayslip.year}</h3>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={async () => {
                    if (!payslipRef.current) return
                    await downloadPng(payslipRef.current, `payslip-${selectedPayslip.month}-${selectedPayslip.year}`)
                  }}><Download className="h-3.5 w-3.5 mr-1" />PNG</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={async () => {
                    if (!payslipRef.current) return
                    await downloadPdf(payslipRef.current, `payslip-${selectedPayslip.month}-${selectedPayslip.year}`)
                  }}><Download className="h-3.5 w-3.5 mr-1" />PDF</Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedPayslip(null)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="p-4" ref={payslipRef}>
                <PayslipTemplate data={{
                  staffName: staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : "Staff",
                  staffId: staffMember?.staffId || staffMember?.id || teacherId,
                  staffRole: staffMember?.user?.role || "Staff",
                  month: selectedPayslip.month,
                  year: selectedPayslip.year,
                  amount: selectedPayslip.amount,
                  paidAt: selectedPayslip.paidAt || undefined,
                  schoolName: school?.name || "School Name",
                  schoolAddress: school?.address || "",
                  schoolLogo: school?.logo || "",
                }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
