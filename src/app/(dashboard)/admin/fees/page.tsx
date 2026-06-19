"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"
import { Wallet, TrendingUp, Users, AlertTriangle, Download, Plus, Banknote, CheckCircle2, XCircle, Clock, Eye, Edit3, Building, Landmark, Percent } from "lucide-react"
import { toast } from "sonner"
import { EmptyState } from "@/components/admin/EmptyState"

const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6"]

export default function AdminFeesPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [fees, setFees] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [feeStructures, setFeeStructures] = useState<any[]>([])
  const [bankDetails, setBankDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [showBankForm, setShowBankForm] = useState(false)
  const [showFeeForm, setShowFeeForm] = useState(false)
  const [bankForm, setBankForm] = useState({ bankName: "", accountName: "", accountNumber: "", swiftCode: "", branch: "" })
  const [feeForm, setFeeForm] = useState({ classId: "", type: "Tuition", amount: "", term: "First Term", dueDate: "", session: "2024/2025" })

  useEffect(() => {
    Promise.all([
      fetch("/api/fees").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/fee-structures").then((r) => r.json()),
      fetch("/api/school/bank").then((r) => r.json()),
    ]).then(([f, s, c, p, fs, b]) => {
      setFees(f); setStudents(s); setClasses(c); setPayments(p); setFeeStructures(fs); setBankDetails(b)
      setBankForm({ bankName: b.bankName, accountName: b.accountName, accountNumber: b.accountNumber, swiftCode: b.swiftCode, branch: b.branch })
      setLoading(false)
    })
  }, [])

  const totalCollected = payments.filter((p) => p.status === "confirmed").reduce((s, p) => s + p.amount, 0)
  const totalExpected = feeStructures.reduce((s, f) => s + f.amount, 0)
  const outstanding = totalExpected - totalCollected
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0
  const pendingCount = payments.filter((p) => p.status === "pending").length

  const classData = feeStructures.reduce((acc: any, fs) => {
    const c = classes.find((cl) => cl.id === fs.classId)
    const name = c ? `${c.name} ${c.arm}` : `Class ${fs.classId}`
    if (!acc[fs.classId]) acc[fs.classId] = { name, expected: 0, paid: 0 }
    acc[fs.classId].expected += fs.amount
    const paid = payments.filter((p) => {
      const student = students.find((s) => s.id === p.studentId)
      return student?.classId === fs.classId && p.status === "confirmed"
    }).reduce((s, p) => s + p.amount, 0)
    acc[fs.classId].paid = paid
    return acc
  }, {})

  const barData = Object.values(classData)
  const pieData = [{ name: "Collected", value: totalCollected, color: "#22c55e" }, { name: "Outstanding", value: Math.max(outstanding, 0), color: "#ef4444" }].filter((d) => d.value > 0)

  const saveBankDetails = async () => {
    await fetch("/api/school/bank", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bankForm) })
    setBankDetails({ ...bankDetails, ...bankForm })
    setShowBankForm(false)
    toast.success("Bank details updated")
  }

  const saveFeeStructure = async () => {
    if (!feeForm.classId || !feeForm.amount) { toast.error("Fill all fields"); return }
    const res = await fetch("/api/fee-structures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...feeForm, amount: Number(feeForm.amount) }) })
    const item = await res.json()
    setFeeStructures([...feeStructures, item])
    setShowFeeForm(false)
    setFeeForm({ classId: "", type: "Tuition", amount: "", term: "First Term", dueDate: "", session: "2024/2025" })
    toast.success("Fee structure added")
  }

  const confirmPayment = async (id: string) => {
    const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "confirm", id, confirmedBy: "admin" }) })
    if (res.ok) {
      setPayments(payments.map((p) => p.id === id ? { ...p, status: "confirmed", confirmedAt: new Date().toISOString() } : p))
      toast.success("Payment confirmed")
    }
  }

  const rejectPayment = async (id: string) => {
    const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject", id, confirmedBy: "admin" }) })
    if (res.ok) {
      setPayments(payments.map((p) => p.id === id ? { ...p, status: "rejected", confirmedAt: new Date().toISOString() } : p))
      toast.success("Payment rejected")
    }
  }

  const getStudentName = (id: string) => { const s = students.find((s) => s.id === id); return s ? `${s.firstName} ${s.lastName}` : id }
  const getClassName = (id: string) => { const c = classes.find((c) => c.id === id); return c ? `${c.name} ${c.arm}` : id }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-32", "h-48"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Fee Management</h2>
        <p className="text-sm text-muted-foreground">Bank details, fee structures, and payment confirmation</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Collected", value: `₦${totalCollected.toLocaleString()}`, icon: Wallet, color: "bg-green-500/15 text-green-600" },
          { label: "Expected", value: `₦${totalExpected.toLocaleString()}`, icon: TrendingUp, color: "bg-blue-500/15 text-blue-600" },
          { label: "Pending", value: pendingCount, icon: Clock, color: "bg-amber-500/15 text-amber-600" },
          { label: "Rate", value: `${collectionRate}%`, icon: Percent, color: "bg-purple-500/15 text-purple-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 glass-card"><CardContent className="p-4"><div className="flex items-center gap-3 mb-1"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}><stat.icon className="h-4 w-4" /></div><span className="text-xs text-muted-foreground">{stat.label}</span></div><p className="text-lg font-bold">{stat.value}</p></CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview"><TrendingUp className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="bank"><Building className="h-4 w-4 mr-1" /> Bank Details</TabsTrigger>
          <TabsTrigger value="structures"><Landmark className="h-4 w-4 mr-1" /> Fee Structures</TabsTrigger>
          <TabsTrigger value="confirmations"><CheckCircle2 className="h-4 w-4 mr-1" /> Confirm Payments {pendingCount > 0 && <Badge className="ml-1 bg-red-500 text-white text-[10px] px-1 py-0">{pendingCount}</Badge>}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-0 glass-card"><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Collection Rate</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white"><div><p className="text-xl font-bold">{collectionRate}%</p></div></div>
                <div className="space-y-2 flex-1"><Progress value={collectionRate} className="h-3" /><div className="flex justify-between text-xs text-muted-foreground"><span>₦{(totalCollected / 1e6).toFixed(1)}M collected</span><span>₦{(outstanding / 1e6).toFixed(1)}M outstanding</span></div></div>
              </div>
              <div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
            </CardContent></Card>
            <Card className="border-0 glass-card"><CardContent className="p-4">
              <h3 className="font-semibold mb-3">Per Class Breakdown</h3>
              <div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={barData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="expected" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Expected" /><Bar dataKey="paid" fill="#22c55e" radius={[4, 4, 0, 0]} name="Paid" /></BarChart></ResponsiveContainer></div>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="bank" className="mt-4">
          <Card className="border-0 glass-card">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">School Bank Details</h3>
                <Button variant="outline" size="sm" onClick={() => setShowBankForm(!showBankForm)}><Edit3 className="h-4 w-4 mr-1" /> Edit</Button>
              </div>
              {showBankForm ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-muted-foreground">Bank Name</label><Input value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} /></div>
                    <div><label className="text-xs text-muted-foreground">Account Name</label><Input value={bankForm.accountName} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} /></div>
                    <div><label className="text-xs text-muted-foreground">Account Number</label><Input value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} /></div>
                    <div><label className="text-xs text-muted-foreground">Swift Code</label><Input value={bankForm.swiftCode} onChange={(e) => setBankForm({ ...bankForm, swiftCode: e.target.value })} /></div>
                    <div><label className="text-xs text-muted-foreground">Branch</label><Input value={bankForm.branch} onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} /></div>
                  </div>
                  <Button size="sm" onClick={saveBankDetails}>Save Bank Details</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[{ label: "Bank Name", value: bankDetails?.bankName }, { label: "Account Name", value: bankDetails?.accountName }, { label: "Account Number", value: bankDetails?.accountNumber }, { label: "Swift Code", value: bankDetails?.swiftCode }].map((d) => (
                    <div key={d.label} className="rounded-xl bg-muted/30 p-3"><p className="text-[10px] text-muted-foreground">{d.label}</p><p className="text-sm font-mono font-bold mt-0.5">{d.value}</p></div>
                  ))}
                </div>
              )}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3 text-xs">
                <strong>Instructions:</strong> Parents will see these bank details on their portal. They make transfers and enter the reference number. Admin confirms receipt here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structures" className="mt-4">
          <Card className="border-0 glass-card">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Fee Structures</h3>
                <Button size="sm" onClick={() => setShowFeeForm(!showFeeForm)}><Plus className="h-4 w-4 mr-1" /> Add Fee</Button>
              </div>
              {showFeeForm && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/30">
                  <div><label className="text-xs">Class</label><select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={feeForm.classId} onChange={(e) => setFeeForm({ ...feeForm, classId: e.target.value })}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.arm}</option>)}</select></div>
                  <div><label className="text-xs">Type</label><select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={feeForm.type} onChange={(e) => setFeeForm({ ...feeForm, type: e.target.value })}>{["Tuition", "Transport", "Hostel", "Lab Fee", "Sports", "ICT", "Library", "Development Levy"].map((t) => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="text-xs">Amount (₦)</label><Input type="number" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} /></div>
                  <div><label className="text-xs">Term</label><select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={feeForm.term} onChange={(e) => setFeeForm({ ...feeForm, term: e.target.value })}>{["First Term", "Second Term", "Third Term"].map((t) => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="text-xs">Due Date</label><Input type="date" value={feeForm.dueDate} onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })} /></div>
                  <div className="flex items-end"><Button size="sm" onClick={saveFeeStructure}>Save</Button></div>
                </div>
              )}
              {feeStructures.length === 0 ? <EmptyState title="No fee structures" description="Add fees for each class and term" /> : (
                <div className="space-y-2">
                  {feeStructures.map((fs) => (
                    <div key={fs.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><Wallet className="h-4 w-4 text-primary" /></div>
                        <div><p className="text-sm font-medium">{fs.type} - {getClassName(fs.classId)}</p><p className="text-xs text-muted-foreground">{fs.term} • Due: {fs.dueDate}</p></div>
                      </div>
                      <p className="text-sm font-mono font-bold">₦{fs.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmations" className="mt-4">
          <Card className="border-0 glass-card">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Pending Payment Confirmations</h3>
              {payments.filter((p) => p.status === "pending").length === 0 ? (
                <EmptyState title="No pending payments" description="All payments have been confirmed" />
              ) : (
                <div className="space-y-3">
                  {payments.filter((p) => p.status === "pending").map((p) => (
                    <Card key={p.id} className="border-0 bg-amber-50/50 dark:bg-amber-950/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2"><p className="text-sm font-medium">{getStudentName(p.studentId)}</p><Badge className="bg-amber-500/15 text-amber-600">Pending</Badge></div>
                            <p className="text-xs text-muted-foreground mt-1">Ref: {p.reference} • {p.method} • {new Date(p.paidAt).toLocaleString()}</p>
                            <p className="text-lg font-bold mt-1 font-mono">₦{p.amount.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => confirmPayment(p.id)}><CheckCircle2 className="h-4 w-4 mr-1" /> Confirm</Button>
                            <Button size="sm" variant="outline" className="text-red-500 border-red-200" onClick={() => rejectPayment(p.id)}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <h3 className="font-semibold mt-6 mb-3">All Payments</h3>
              {payments.length === 0 ? <EmptyState title="No payments" description="Payments will appear here" /> : (
                <div className="space-y-2">
                  {payments.slice().reverse().map((p) => {
                    const student = students.find((s) => s.id === p.studentId)
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                        <div><p className="text-sm font-medium">{student ? `${student.firstName} ${student.lastName}` : p.studentId}</p><p className="text-xs text-muted-foreground">{p.reference} • {p.method}</p></div>
                        <div className="text-right"><p className="text-sm font-mono font-bold">₦{p.amount.toLocaleString()}</p><Badge className={p.status === "confirmed" ? "bg-green-500/15 text-green-600" : p.status === "pending" ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600"}>{p.status}</Badge></div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
