"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Building, Wallet, CheckCircle2, Clock, AlertTriangle, Copy, ExternalLink, Send, Banknote, CalendarDays } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import { useParentChildren } from "@/hooks/useParentChildren"

export default function ParentFeesPage() {
  const { children, loading: childrenLoading } = useParentChildren()
  const [activeTab, setActiveTab] = useState("overview")
  const [payments, setPayments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [feeStructures, setFeeStructures] = useState<any[]>([])
  const [bankDetails, setBankDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const linkedStudentIds = useMemo(() => children.map((c) => c.id), [children])

  useEffect(() => {
    if (childrenLoading || linkedStudentIds.length === 0) return
    setLoading(true)
    const childIds = linkedStudentIds.join(",")
    Promise.all([
      fetch(`/api/payments?studentIds=${childIds}`).then((r) => r.json()),
      fetch(`/api/students?classIds=${children.map((c) => c.classId).filter(Boolean).join(",")}`).then((r) => r.json()),
      fetch("/api/fee-structures").then((r) => r.json()),
      fetch("/api/school/bank").then((r) => r.json()),
    ]).then(([p, s, fs, b]) => { setPayments(p); setStudents(s); setFeeStructures(fs); setBankDetails(b); setLoading(false) })
      .catch(() => setLoading(false))
  }, [linkedStudentIds, childrenLoading])

  const myPayments = payments.filter((p) => linkedStudentIds.includes(p.studentId))
  const dueStructures = feeStructures.filter((fs) => {
    const classStudents = students.filter((s) => s.classId === fs.classId && linkedStudentIds.includes(s.id))
    return classStudents.length > 0
  })

  const totalDue = dueStructures.reduce((s, f) => s + f.amount, 0)
  const totalPaid = myPayments.filter((p) => p.status === "confirmed").reduce((s, p) => s + p.amount, 0)
  const pendingPayments = myPayments.filter((p) => p.status === "pending").length

  const getStudentName = (id: string) => { const s = students.find((s) => s.id === id); return s ? `${s.firstName} ${s.lastName}` : id }

  const [selectedChild, setSelectedChild] = useState("")
  const [payForm, setPayForm] = useState({ amount: "", method: "bank transfer", paidAt: new Date().toISOString().split("T")[0], reference: "" })
  const [submitting, setSubmitting] = useState(false)

  const submitPayment = async () => {
    if (!selectedChild || !payForm.amount) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedChild,
          amount: Number(payForm.amount),
          method: payForm.method,
          paidAt: payForm.paidAt ? new Date(payForm.paidAt).toISOString() : undefined,
          reference: payForm.reference || undefined,
          status: "pending",
        }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to submit") }
      toast.success("Payment submitted for admin confirmation")
      setPayForm({ amount: "", method: "bank transfer", paidAt: new Date().toISOString().split("T")[0], reference: "" })
      setSelectedChild("")
      const childIds = linkedStudentIds.join(",")
      const p = await fetch(`/api/payments?studentIds=${childIds}`).then((r) => r.json())
      setPayments(p)
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment")
    } finally { setSubmitting(false) }
  }

  const pct = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0

  if (loading || childrenLoading) return <div className="p-4 md:p-6 space-y-4">{["h-32", "h-48", "h-32"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Fees & Payments</h2>
        <p className="text-sm text-muted-foreground">View fees, make payments, and track confirmation</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-5 text-white">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div><p className="text-sm opacity-80">Total Paid</p><p className="text-3xl font-bold">₦{totalPaid.toLocaleString()}</p></div>
              <div className="text-right"><p className="text-sm opacity-80">Total Due</p><p className="text-3xl font-bold">₦{totalDue.toLocaleString()}</p></div>
            </div>
            <Progress value={pct} className="h-2 mt-4 bg-white/20 [&>div]:bg-white" />
            <p className="text-xs mt-1 text-right opacity-80">{pct}% paid</p>
          </div>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="overview" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Wallet className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="pay" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Send className="h-4 w-4 mr-1" /> Make Payment</TabsTrigger>
          <TabsTrigger value="history" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Clock className="h-4 w-4 mr-1" /> History</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "overview" && (
      <div className="mt-4">
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
                  <div className="flex justify-between gap-2 mb-1"><span className="text-sm font-medium truncate">{fs.type}</span><span className="text-sm font-mono font-bold shrink-0">₦{fs.amount}</span></div>
                  <div className="flex justify-between gap-2 text-xs text-muted-foreground"><span className="truncate">{fs.term} &bull; Due: {fs.dueDate}</span><span className="text-green-600 shrink-0">₦{paid} paid</span></div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent></Card>
      </div>
      )}

      {activeTab === "pay" && (
        <div className="mt-4">
          <Card className="border-0 glass-card"><CardContent className="p-4 space-y-5">
            <h3 className="font-semibold">Submit Payment Details</h3>
            <p className="text-xs text-muted-foreground">Submit payment details for admin confirmation. Transfer to the school bank account below.</p>

            {bankDetails?.bankName && (
              <div className="rounded-xl bg-primary/5 p-4 space-y-1.5 border border-primary/10">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bank Details</p>
                <p className="text-sm font-semibold">{bankDetails.bankName}</p>
                <p className="text-sm">{bankDetails.accountName} — <span className="font-mono font-bold">{bankDetails.accountNumber}</span></p>
                {bankDetails.swiftCode && <p className="text-xs text-muted-foreground">Swift: {bankDetails.swiftCode} {bankDetails.branch ? `| Branch: ${bankDetails.branch}` : ""}</p>}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Child</label>
                <select className="w-full rounded-xl border bg-background px-3 py-2 text-sm" value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
                  <option value="">Select child</option>
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.className || c.classId}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Amount (₦)</label>
                <Input type="number" min={1} placeholder="50000" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Payment Method</label>
                  <select className="w-full rounded-xl border bg-background px-3 py-2 text-sm" value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
                    <option value="bank transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="pos">POS</option>
                    <option value="check">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Payment Date</label>
                  <Input type="date" value={payForm.paidAt} onChange={(e) => setPayForm({ ...payForm, paidAt: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Transaction Reference / Receipt No.</label>
                <Input placeholder="e.g. Txn123456" value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} />
              </div>
              <Button className="w-full" disabled={submitting || !selectedChild || !payForm.amount} onClick={submitPayment}>
                {submitting ? "Submitting..." : "Submit Payment for Confirmation"}
              </Button>
            </div>
          </CardContent></Card>
        </div>
      )}

      {activeTab === "history" && (
      <div className="mt-4">
        <Card className="border-0 glass-card"><CardContent className="p-4">
          {myPayments.length === 0 ? <EmptyState title="No payments" description="Payment history will appear here" /> : (
            <div className="space-y-2">
              {myPayments.slice().reverse().map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div><p className="text-sm font-medium">{getStudentName(p.studentId)}</p><p className="text-xs text-muted-foreground">{p.reference} &bull; ₦{p.amount} &bull; {p.method}</p></div>
                  <Badge className={p.status === "confirmed" ? "bg-green-500/15 text-green-600" : p.status === "pending" ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600"}>{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </div>
      )}
    </div>
  )
}
