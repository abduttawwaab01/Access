"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Building, Wallet, CheckCircle2, Clock, AlertTriangle, Landmark, Copy, ExternalLink } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"

export default function ParentFeesPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [payments, setPayments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [feeStructures, setFeeStructures] = useState<any[]>([])
  const [bankDetails, setBankDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refInput, setRefInput] = useState("")
  const [amountInput, setAmountInput] = useState("")
  const [methodInput, setMethodInput] = useState("bank_transfer")

  const parentId = "p1"
  const linkedStudentIds = ["1", "2"]

  useEffect(() => {
    Promise.all([
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/fee-structures").then((r) => r.json()),
      fetch("/api/school/bank").then((r) => r.json()),
    ]).then(([p, s, fs, b]) => { setPayments(p); setStudents(s); setFeeStructures(fs); setBankDetails(b); setLoading(false) })
  }, [])

  const myPayments = payments.filter((p) => linkedStudentIds.includes(p.studentId))
  const dueStructures = feeStructures.filter((fs) => {
    const classStudents = students.filter((s) => s.classId === fs.classId && linkedStudentIds.includes(s.id))
    return classStudents.length > 0
  })

  const totalDue = dueStructures.reduce((s, f) => s + f.amount, 0)
  const totalPaid = myPayments.filter((p) => p.status === "confirmed").reduce((s, p) => s + p.amount, 0)
  const pendingPayments = myPayments.filter((p) => p.status === "pending").length

  const recordPayment = async () => {
    if (!refInput.trim() || !amountInput.trim()) { toast.error("Fill all fields"); return }
    const firstStudent = linkedStudentIds[0]
    const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: firstStudent, amount: Number(amountInput), method: methodInput, reference: refInput.trim() }) })
    if (res.ok) {
      const p = await res.json()
      setPayments([...payments, p])
      setRefInput(""); setAmountInput("")
      toast.success("Payment recorded. Awaiting admin confirmation.")
    }
  }

  const getStudentName = (id: string) => { const s = students.find((s) => s.id === id); return s ? `${s.firstName} ${s.lastName}` : id }

  const pct = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-32", "h-48", "h-32"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Fees & Payments</h2>
        <p className="text-sm text-muted-foreground">View fees, make payments, and track confirmation</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-5 text-white">
            <div className="flex items-center justify-between">
              <div><p className="text-sm opacity-80">Total Paid</p><p className="text-3xl font-bold">₦{totalPaid.toLocaleString()}</p></div>
              <div className="text-right"><p className="text-sm opacity-80">Total Due</p><p className="text-3xl font-bold">₦{totalDue.toLocaleString()}</p></div>
            </div>
            <Progress value={pct} className="h-2 mt-4 bg-white/20 [&>div]:bg-white" />
            <p className="text-xs mt-1 text-right opacity-80">{pct}% paid</p>
          </div>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview"><Wallet className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="pay"><Landmark className="h-4 w-4 mr-1" /> Make Payment</TabsTrigger>
          <TabsTrigger value="history"><Clock className="h-4 w-4 mr-1" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="border-0 glass-card"><CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Fee Breakdown</h3>
            {dueStructures.length === 0 ? <EmptyState title="No fees" description="No fee structures for your children's classes" /> : (
              <div className="space-y-3">
                {dueStructures.map((fs) => {
                  const paid = myPayments.filter((p) => {
                    const student = students.find((s) => s.id === p.studentId && s.classId === fs.classId)
                    return student && (p.feeStructureId === fs.id || p.status === "confirmed")
                  }).reduce((s, p) => s + p.amount, 0)
                  return (
                    <div key={fs.id} className="p-3 rounded-xl bg-muted/30">
                      <div className="flex justify-between mb-1"><span className="text-sm font-medium">{fs.type}</span><span className="text-sm font-mono font-bold">₦{fs.amount}</span></div>
                      <div className="flex justify-between text-xs text-muted-foreground"><span>{fs.term} • Due: {fs.dueDate}</span><span className="text-green-600">₦{paid} paid</span></div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="pay" className="mt-4 space-y-4">
          <Card className="border-0 glass-card"><CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">School Bank Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Bank", value: bankDetails?.bankName },
                { label: "Account Name", value: bankDetails?.accountName },
                { label: "Account Number", value: bankDetails?.accountNumber },
                { label: "Swift Code", value: bankDetails?.swiftCode },
              ].map((d) => (
                <div key={d.label} className="rounded-xl bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">{d.label}</p>
                  <p className="text-sm font-mono font-bold mt-0.5 flex items-center gap-1">
                    {d.value}
                    <button onClick={() => { navigator.clipboard.writeText(d.value || ""); toast.success("Copied!") }}><Copy className="h-3 w-3 text-muted-foreground" /></button>
                  </p>
                </div>
              ))}
            </div>
          </CardContent></Card>

          <Card className="border-0 glass-card"><CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">Record Payment</h3>
            <p className="text-xs text-muted-foreground">After making a bank transfer, enter the details below</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs">Amount (₦)</label><Input type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} placeholder="2500" /></div>
              <div><label className="text-xs">Method</label><select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={methodInput} onChange={(e) => setMethodInput(e.target.value)}><option value="bank_transfer">Bank Transfer</option><option value="cash">Cash Deposit</option><option value="pos">POS</option><option value="ussd">USSD</option></select></div>
            </div>
            <div><label className="text-xs">Transaction Reference</label><Input value={refInput} onChange={(e) => setRefInput(e.target.value)} placeholder="Enter reference number from bank" /></div>
            <Button onClick={recordPayment} className="w-full animated-gradient border-0 text-white">Submit for Confirmation</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="border-0 glass-card"><CardContent className="p-4">
            {myPayments.length === 0 ? <EmptyState title="No payments" description="Payment history will appear here" /> : (
              <div className="space-y-2">
                {myPayments.slice().reverse().map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div><p className="text-sm font-medium">{getStudentName(p.studentId)}</p><p className="text-xs text-muted-foreground">{p.reference} • ₦{p.amount} • {p.method}</p></div>
                    <Badge className={p.status === "confirmed" ? "bg-green-500/15 text-green-600" : p.status === "pending" ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600"}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
