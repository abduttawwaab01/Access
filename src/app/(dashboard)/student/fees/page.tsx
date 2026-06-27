"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Wallet, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import { useSession } from "next-auth/react"

export default function StudentFeesPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [studentId, setStudentId] = useState("")
  const [studentClassId, setStudentClassId] = useState("")
  const [payments, setPayments] = useState<any[]>([])
  const [feeStructures, setFeeStructures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const studRes = await fetch(`/api/students?userId=${userId}`)
      if (!studRes.ok) { setLoading(false); return }
      const s = await studRes.json()
      const sid = s?.id || ""
      const cid = s?.classId || ""
      if (!sid) { setLoading(false); return }
      setStudentId(sid)
      setStudentClassId(cid)
      const [p, fs] = await Promise.all([
        fetch(`/api/payments?studentId=${sid}`).then((r) => r.json()),
        fetch(`/api/fee-structures?classId=${cid}`).then((r) => r.json()),
      ])
      setPayments(p)
      setFeeStructures(fs)
      setLoading(false)
    }
    load()
  }, [userId])

  const myPayments = payments.filter((p) => p.studentId === studentId)
  const classFees = feeStructures.filter((fs) => fs.classId === studentClassId)

  const totalDue = classFees.reduce((s, f) => s + f.amount, 0)
  const totalPaid = myPayments.filter((p) => p.status === "confirmed").reduce((s, p) => s + p.amount, 0)
  const pct = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Fees</h2>
        <p className="text-sm text-muted-foreground">View your fee status and payment history</p>
      </motion.div>

      <Card className="border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div><p className="text-sm opacity-80">Total Paid</p><p className="text-3xl font-bold">₦{totalPaid.toLocaleString()}</p></div>
            <div className="text-right"><p className="text-sm opacity-80">Total Due</p><p className="text-3xl font-bold">₦{totalDue.toLocaleString()}</p></div>
          </div>
          <Progress value={pct} className="h-2 bg-white/20 [&>div]:bg-white" />
          <p className="text-xs mt-1 text-right opacity-80">{pct}% paid</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Paid", value: `₦${totalPaid}`, icon: CheckCircle2, color: "bg-green-500/15 text-green-600" },
          { label: "Outstanding", value: `₦${Math.max(totalDue - totalPaid, 0)}`, icon: AlertTriangle, color: "bg-red-500/15 text-red-600" },
          { label: "Pending Confirm", value: myPayments.filter((p) => p.status === "pending").length, icon: Clock, color: "bg-amber-500/15 text-amber-600" },
          { label: "Items", value: classFees.length, icon: Wallet, color: "bg-blue-500/15 text-blue-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 glass-card"><CardContent className="p-4"><div className="flex items-center gap-3 mb-1"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}><stat.icon className="h-4 w-4" /></div><span className="text-xs text-muted-foreground">{stat.label}</span></div><p className="text-lg font-bold">{stat.value}</p></CardContent></Card>
        ))}
      </div>

      <Card className="border-0 glass-card"><CardContent className="p-4">
        <h3 className="font-semibold mb-3">Fee Breakdown</h3>
        {classFees.length === 0 ? <EmptyState title="No fees" description="No fee structures for your class" /> : (
          <div className="space-y-3">
            {classFees.map((fs) => {
              const paid = myPayments.filter((p) => p.status === "confirmed").reduce((s, p) => s + p.amount, 0)
              const itemPct = fs.amount > 0 ? Math.round(Math.min(paid / fs.amount, 1) * 100) : 0
              return (
                <div key={fs.id} className="p-3 rounded-xl bg-muted/30">
                  <div className="flex justify-between mb-1"><span className="font-medium">{fs.type}</span><span className="font-mono font-bold">₦{fs.amount}</span></div>
                  <Progress value={itemPct} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>{fs.term} • Due: {fs.dueDate}</span><span className={paid >= fs.amount ? "text-green-600" : "text-amber-600"}>{paid >= fs.amount ? "Paid" : `₦${Math.max(fs.amount - paid, 0)} left`}</span></div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent></Card>

      <Card className="border-0 glass-card"><CardContent className="p-4">
        <h3 className="font-semibold mb-3">Payment History</h3>
        {myPayments.length === 0 ? <EmptyState title="No payments" description="No payments recorded yet" /> : (
          <div className="space-y-2">
            {myPayments.slice().reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div><p className="text-sm">{p.reference}</p><p className="text-xs text-muted-foreground">{p.method} • {new Date(p.paidAt).toLocaleDateString()}</p></div>
                <div className="text-right"><p className="font-mono font-bold">₦{p.amount}</p><Badge className={p.status === "confirmed" ? "bg-green-500/15 text-green-600" : p.status === "pending" ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600"}>{p.status}</Badge></div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>
    </div>
  )
}
