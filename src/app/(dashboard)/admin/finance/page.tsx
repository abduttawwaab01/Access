"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"
import { Wallet, TrendingUp, Users, AlertTriangle, Download, Plus, Banknote, CheckCircle2, XCircle, Clock, Eye, Edit3, Building, Landmark, Percent, Pencil, Trash2, X, DollarSign, CalendarDays, Printer, Share2, Mail, Phone, Image, FileText } from "lucide-react"
import { cn, currentSession } from "@/lib/utils"
import { toast } from "sonner"
import { EmptyState } from "@/components/admin/EmptyState"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ReceiptTemplate } from "@/components/documents/ReceiptTemplate"
import { downloadPng, downloadPdf } from "@/lib/capture"

const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6"]
const DEFAULT_FEE_TYPES = ["Tuition", "Transport", "Hostel", "Lab Fee", "Sports", "ICT", "Library", "Development Levy"]
const TERMS = ["First Term", "Second Term", "Third Term"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [fees, setFees] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [feeStructures, setFeeStructures] = useState<any[]>([])
  const FEE_TYPES = [...new Set([...DEFAULT_FEE_TYPES, ...feeStructures.map((fs) => fs.type).filter(Boolean)])]
  const [bankDetails, setBankDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const feeFormRef = useRef<HTMLDivElement>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  const [showBankForm, setShowBankForm] = useState(false)
  const [showFeeForm, setShowFeeForm] = useState(false)
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null)
  const [confirmDeleteFee, setConfirmDeleteFee] = useState<string | null>(null)
  const [savingFee, setSavingFee] = useState(false)
  const [bankForm, setBankForm] = useState({ bankName: "", accountName: "", accountNumber: "", swiftCode: "", branch: "" })
  const [feeForm, setFeeForm] = useState({ classId: "", type: "Tuition", amount: "", term: "First Term", dueDate: "", session: currentSession() })
  const [sessions, setSessions] = useState<any[]>([])

  const [staff, setStaff] = useState<any[]>([])
  const [salaryStructures, setSalaryStructures] = useState<any[]>([])
  const [salaryRecords, setSalaryRecords] = useState<any[]>([])
  const [editingStaff, setEditingStaff] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ amount: "" })

  const [school, setSchool] = useState<any>(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("")
  const [generatingReceipt, setGeneratingReceipt] = useState(false)

  const currentMonth = MONTHS[new Date().getMonth()]
  const currentYear = String(new Date().getFullYear())

  useEffect(() => {
    Promise.all([
      fetch("/api/fees").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/fee-structures").then((r) => r.json()),
      fetch("/api/school/bank").then((r) => r.json()),
      fetch("/api/sessions").then((r) => r.json()).catch(() => []),
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/salary-structures").then((r) => r.json()),
      fetch("/api/salary").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()).catch(() => ({ name: "School", address: "", phone: "", email: "", logo: "" })),
    ]).then(([f, s, c, p, fs, b, sess, st, ss, sr, sch]) => {
      setFees(f); setStudents(s); setClasses(c); setPayments(p); setFeeStructures(fs); setBankDetails(b); setSessions(sess)
      setBankForm({ bankName: b?.bankName || "", accountName: b?.accountName || "", accountNumber: b?.accountNumber || "", swiftCode: b?.swiftCode || "", branch: b?.branch || "" })
      setStaff(st); setSalaryStructures(ss); setSalaryRecords(sr); setSchool(sch)
      setLoading(false)
    })
  }, [])

  const totalCollected = payments.filter((p) => p.status === "confirmed").reduce((s, p) => s + p.amount, 0)
  const totalExpected = feeStructures.reduce((s, f) => s + f.amount, 0)
  const outstanding = totalExpected - totalCollected
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0
  const pendingCount = payments.filter((p) => p.status === "pending").length

  const totalSalaryPaid = () => salaryRecords.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0)
  const totalSalaryPending = () => salaryRecords.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0)

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

  useEffect(() => {
    if (showFeeForm) feeFormRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [showFeeForm])

  const saveBankDetails = async () => {
    await fetch("/api/school/bank", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bankForm) })
    setBankDetails({ ...bankDetails, ...bankForm })
    setShowBankForm(false)
    toast.success("Bank details updated")
  }

  const resetFeeForm = () => {
    setFeeForm({ classId: "", type: "Tuition", amount: "", term: "First Term", dueDate: "", session: currentSession() })
    setEditingFeeId(null)
    setShowFeeForm(false)
  }

  const openEditFee = (fs: any) => {
    setFeeForm({ classId: fs.classId, type: fs.type || "Tuition", amount: String(fs.amount), term: fs.term || "First Term", dueDate: fs.dueDate || "", session: fs.session || currentSession() })
    setEditingFeeId(fs.id)
    setShowFeeForm(true)
  }

  const saveFeeStructure = async () => {
    if (!feeForm.classId || !feeForm.amount) { toast.error("Fill all fields"); return }
    setSavingFee(true)
    const body = { ...feeForm, amount: Number(feeForm.amount) }
    try {
      if (editingFeeId) {
        const res = await fetch("/api/fee-structures", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingFeeId, ...body }) })
        if (!res.ok) { const err = await res.json().catch(() => ({ error: "Unknown error" })); toast.error(err.error || "Failed to update"); return }
        toast.success("Fee structure updated")
      } else {
        const res = await fetch("/api/fee-structures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        if (!res.ok) { const err = await res.json().catch(() => ({ error: "Unknown error" })); toast.error(err.error || "Failed to create"); return }
        toast.success("Fee structure added")
      }
      const refreshed = await fetch("/api/fee-structures").then((r) => r.json())
      setFeeStructures(refreshed)
      resetFeeForm()
    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setSavingFee(false)
    }
  }

  const deleteFeeStructure = async () => {
    if (!confirmDeleteFee) return
    const res = await fetch(`/api/fee-structures?id=${confirmDeleteFee}`, { method: "DELETE" })
    if (!res.ok) { toast.error("Failed to delete"); setConfirmDeleteFee(null); return }
    setFeeStructures(feeStructures.filter((f) => f.id !== confirmDeleteFee))
    toast.success("Fee structure deleted")
    setConfirmDeleteFee(null)
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

  const getSalaryStructure = (staffId: string) => salaryStructures.find((s) => s.staffId === staffId)

  const startEdit = (staffId: string) => {
    const struct = getSalaryStructure(staffId)
    setEditingStaff(staffId)
    setEditForm({ amount: String(struct?.amount || 1500) })
  }

  const saveSalaryStructure = async (staffId: string) => {
    const res = await fetch("/api/salary-structures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update", staffId, amount: Number(editForm.amount) }) })
    if (res.ok) {
      setSalaryStructures(salaryStructures.map((s) => s.staffId === staffId ? { ...s, amount: Number(editForm.amount) } : s))
      setEditingStaff(null)
      toast.success("Salary structure updated")
    }
  }

  const initializeMonthlyPayroll = async () => {
    const existing = salaryRecords.filter((r) => r.month === currentMonth && r.year === currentYear)
    if (existing.length > 0) { toast.error("Payroll already exists for this month"); return }
    for (const s of staff) {
      const struct = getSalaryStructure(s.id)
      if (struct) {
        await fetch("/api/salary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ staffId: s.id, amount: struct.amount, month: currentMonth, year: currentYear }) })
      }
    }
    const res = await fetch("/api/salary")
    setSalaryRecords(await res.json())
    toast.success(`Payroll initialized for ${currentMonth} ${currentYear}`)
  }

  const markSalaryPaid = async (id: string) => {
    const res = await fetch("/api/salary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "markPaid", id, paidAt: new Date().toISOString(), confirmedBy: "admin" }) })
    if (res.ok) {
      setSalaryRecords(salaryRecords.map((r) => r.id === id ? { ...r, status: "paid", paidAt: new Date().toISOString(), confirmedAt: new Date().toISOString() } : r))
      toast.success("Salary marked as paid")
    }
  }

  const getStudentName = (id: string) => { const s = students.find((s) => s.id === id); return s ? `${s.firstName} ${s.lastName}` : id }
  const getClassName = (id: string) => { const c = classes.find((c) => c.id === id); return c ? `${c.name} ${c.arm}` : id }

  const refreshPayments = async () => {
    const res = await fetch("/api/payments").then((r) => r.json())
    setPayments(res)
  }

  const handleDownloadPng = async () => {
    if (!receiptRef.current) return
    try {
      await downloadPng(receiptRef.current, `receipt-${selectedPaymentId}.png`)
      toast.success("Receipt downloaded as PNG")
    } catch { toast.error("Failed to download PNG") }
  }

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return
    try {
      await downloadPdf(receiptRef.current, `receipt-${selectedPaymentId}.pdf`)
      toast.success("Receipt downloaded as PDF")
    } catch { toast.error("Failed to download PDF") }
  }

  const handleShareWhatsApp = () => {
    if (!selectedPaymentId) return
    const p = payments.find((p) => p.id === selectedPaymentId)
    if (!p) return
    const s = students.find((st) => st.id === p.studentId)
    const name = s ? `${s.firstName} ${s.lastName}` : p.studentId
    const msg = encodeURIComponent(`Fee Payment Receipt\nStudent: ${name}\nAmount: ₦${(p.amount ?? 0).toLocaleString()}\nReference: ${p.reference}\nDate: ${new Date(p.paidAt || p.createdAt).toLocaleDateString()}`)
    window.open(`https://wa.me/?text=${msg}`, "_blank")
  }

  const handleShareEmail = () => {
    if (!selectedPaymentId) return
    const p = payments.find((p) => p.id === selectedPaymentId)
    if (!p) return
    const s = students.find((st) => st.id === p.studentId)
    const name = s ? `${s.firstName} ${s.lastName}` : p.studentId
    const subject = encodeURIComponent(`Fee Payment Receipt - ${name}`)
    const body = encodeURIComponent(`Dear Parent,\n\nPlease find below the fee payment receipt:\n\nStudent: ${name}\nAmount: ₦${(p.amount ?? 0).toLocaleString()}\nReference: ${p.reference}\nDate: ${new Date(p.paidAt || p.createdAt).toLocaleDateString()}\n\nThank you.`)
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
  }

  const selectedPayment = payments.find((p) => p.id === selectedPaymentId)
  const selectedStudent = selectedPayment ? students.find((s) => s.id === selectedPayment.studentId) : null
  const selectedClass = selectedStudent ? classes.find((c) => c.id === selectedStudent.classId) : null

  const receiptData = selectedPayment && selectedStudent && school ? {
    studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
    studentId: selectedStudent.studentId || selectedStudent.id,
    studentClass: selectedClass ? `${selectedClass.name} ${selectedClass.arm}` : "—",
    amount: totalExpected,
    paid: selectedPayment.amount,
    balance: Math.max(totalExpected - selectedPayment.amount, 0),
    term: selectedPayment.term || "First Term",
    session: selectedPayment.session || currentSession(),
    method: selectedPayment.method || "transfer",
    createdAt: selectedPayment.paidAt || selectedPayment.createdAt,
    reference: selectedPayment.reference,
    schoolName: school.name || "School Name",
    schoolMotto: school.motto || "",
    schoolAddress: school.address || "",
    schoolPhone: school.phone || "",
    schoolEmail: school.email || "",
    schoolLogo: school.logo || "",
  } : null

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-32", "h-48"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ConfirmDialog
        open={!!confirmDeleteFee}
        onOpenChange={(o) => !o && setConfirmDeleteFee(null)}
        onConfirm={deleteFeeStructure}
        title="Delete Fee Structure"
        description="Permanently delete this fee structure? This cannot be undone."
      />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Finance</h2>
        <p className="text-sm text-muted-foreground">Fees, salary, bank details, and receipts</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Collected", value: `₦${(totalCollected ?? 0).toLocaleString()}`, icon: Wallet, color: "bg-green-500/15 text-green-600" },
          { label: "Outstanding", value: `₦${(Math.max(outstanding, 0) ?? 0).toLocaleString()}`, icon: TrendingUp, color: "bg-blue-500/15 text-blue-600" },
          { label: "Pending Fees", value: pendingCount, icon: Clock, color: "bg-amber-500/15 text-amber-600" },
          { label: "Rate", value: `${collectionRate}%`, icon: Percent, color: "bg-purple-500/15 text-purple-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 glass-card"><CardContent className="p-4"><div className="flex items-center gap-3 mb-1"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}><stat.icon className="h-4 w-4" /></div><span className="text-xs text-muted-foreground">{stat.label}</span></div><p className="text-lg font-bold">{stat.value}</p></CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="overview" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><TrendingUp className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="fee-structures" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Landmark className="h-4 w-4 mr-1" /> Fee Structures</TabsTrigger>
          <TabsTrigger value="payments" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><CheckCircle2 className="h-4 w-4 mr-1" /> Payments {pendingCount > 0 && <Badge className="ml-1 bg-red-500 text-white text-[10px] px-1 py-0">{pendingCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="salary" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><DollarSign className="h-4 w-4 mr-1" /> Salary Structures</TabsTrigger>
          <TabsTrigger value="bank" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Building className="h-4 w-4 mr-1" /> Bank Details</TabsTrigger>
          <TabsTrigger value="receipts" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><FileText className="h-4 w-4 mr-1" /> Receipts</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 glass-card"><CardContent className="p-4">
            <h3 className="font-semibold mb-3">Fee Collection Rate</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shrink-0"><div><p className="text-xl font-bold">{collectionRate}%</p></div></div>
              <div className="space-y-2 w-full sm:flex-1"><Progress value={collectionRate} className="h-3" /><div className="flex justify-between text-xs text-muted-foreground"><span>₦{(totalCollected / 1e6).toFixed(1)}M collected</span><span>₦{(outstanding / 1e6).toFixed(1)}M outstanding</span></div></div>
            </div>
            <div className="h-48 min-h-[180px] min-w-0"><ResponsiveContainer width="100%" height="100%" minHeight={200}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          </CardContent></Card>
          <Card className="border-0 glass-card"><CardContent className="p-4">
            <h3 className="font-semibold mb-3">Per Class Breakdown</h3>
            <div className="h-48 md:h-56 min-h-[180px] min-w-0"><ResponsiveContainer width="100%" height="100%" minHeight={200}><BarChart data={barData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="expected" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Expected" /><Bar dataKey="paid" fill="#22c55e" radius={[4, 4, 0, 0]} name="Paid" /></BarChart></ResponsiveContainer></div>
          </CardContent></Card>
        </div>
        <Card className="border-0 glass-card"><CardContent className="p-4">
          <h3 className="font-semibold mb-3">Salary Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Staff Count", value: staff.length, icon: Users, color: "bg-blue-500/15 text-blue-600" },
              { label: "Salary Paid", value: `₦${(totalSalaryPaid() ?? 0).toLocaleString()}`, icon: DollarSign, color: "bg-green-500/15 text-green-600" },
              { label: "Salary Pending", value: `₦${(totalSalaryPending() ?? 0).toLocaleString()}`, icon: Clock, color: "bg-amber-500/15 text-amber-600" },
              { label: "Month", value: currentMonth, icon: CalendarDays, color: "bg-purple-500/15 text-purple-600" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-muted/30 p-3"><div className="flex items-center gap-2 mb-1"><div className={`flex h-6 w-6 items-center justify-center rounded-md ${stat.color}`}><stat.icon className="h-3 w-3" /></div><span className="text-xs text-muted-foreground">{stat.label}</span></div><p className="text-base font-bold">{stat.value}</p></div>
            ))}
          </div>
        </CardContent></Card>
      </div>
      )}

      {/* FEE STRUCTURES TAB */}
      {activeTab === "fee-structures" && (
      <div className="mt-4">
        <Card className="border-0 glass-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold">Fee Structures</h3>
              <Button size="sm" onClick={() => { resetFeeForm(); setShowFeeForm(true) }}><Plus className="h-4 w-4 mr-1" /> Add Fee</Button>
            </div>
            <AnimatePresence>
            {showFeeForm && (
              <motion.div ref={feeFormRef} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/30">
                  <div><label className="text-xs">Class</label><select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={feeForm.classId} onChange={(e) => setFeeForm({ ...feeForm, classId: e.target.value })}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.arm}</option>)}</select></div>
                  <div><label className="text-xs">Fee Type</label>
                    <div className="relative">
                      <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm appearance-none" value={FEE_TYPES.includes(feeForm.type) ? feeForm.type : "other"} onChange={(e) => { if (e.target.value === "other") setFeeForm({ ...feeForm, type: "" }); else setFeeForm({ ...feeForm, type: e.target.value }) }}>
                        {FEE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        <option value="other">Other...</option>
                      </select>
                      {!FEE_TYPES.includes(feeForm.type) && feeForm.type && (
                        <Input value={feeForm.type} onChange={(e) => setFeeForm({ ...feeForm, type: e.target.value })} placeholder="Custom fee type" className="mt-1" />
                      )}
                    </div>
                  </div>
                  <div><label className="text-xs">Amount (₦)</label><Input type="number" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} /></div>
                  <div><label className="text-xs">Term</label><select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={feeForm.term} onChange={(e) => setFeeForm({ ...feeForm, term: e.target.value })}>{TERMS.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label className="text-xs">Due Date</label><Input type="date" value={feeForm.dueDate} onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })} /></div>
                  <div><label className="text-xs">Session</label>
                    <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={feeForm.session} onChange={(e) => setFeeForm({ ...feeForm, session: e.target.value })}>
                      <option value="">Select session</option>
                      {sessions.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button size="sm" onClick={saveFeeStructure} disabled={savingFee}>{savingFee ? "Saving..." : editingFeeId ? "Update" : "Save"}</Button>
                    <Button size="sm" variant="outline" onClick={resetFeeForm}>Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
            {feeStructures.length === 0 ? <EmptyState title="No fee structures" description="Add fees for each class and term" /> : (
              <div className="space-y-2">
                {feeStructures.map((fs) => (
                  <div key={fs.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 group">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0"><Wallet className="h-4 w-4 text-primary" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{fs.type || "Fee"} - {getClassName(fs.classId)}</p>
                        <p className="text-xs text-muted-foreground">{fs.term || "—"} {fs.dueDate ? <>• Due: {fs.dueDate}</> : null} {fs.session ? <>• {fs.session}</> : null}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <p className="text-sm font-mono font-bold mr-1">₦{(fs.amount ?? 0).toLocaleString()}</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditFee(fs)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirmDeleteFee(fs.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === "payments" && (
      <div className="mt-4">
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
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2"><p className="text-sm font-medium">{getStudentName(p.studentId)}</p><Badge className="bg-amber-500/15 text-amber-600 shrink-0">Pending</Badge></div>
                          <p className="text-xs text-muted-foreground mt-1 break-words">Ref: {p.reference} • {p.method} • {new Date(p.paidAt).toLocaleString()}</p>
                          <p className="text-lg font-bold mt-1 font-mono">₦{(p.amount ?? 0).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-initial" onClick={() => confirmPayment(p.id)}><CheckCircle2 className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Confirm</span></Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200 flex-1 sm:flex-initial" onClick={() => rejectPayment(p.id)}><XCircle className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Reject</span></Button>
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
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 gap-2">
                      <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{student ? `${student.firstName} ${student.lastName}` : p.studentId}</p><p className="text-xs text-muted-foreground truncate">{p.reference} • {p.method}</p></div>
                      <div className="text-right shrink-0"><p className="text-sm font-mono font-bold">₦{(p.amount ?? 0).toLocaleString()}</p><Badge className={cn(p.status === "confirmed" ? "bg-green-500/15 text-green-600" : p.status === "pending" ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600")}>{p.status}</Badge></div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* SALARY TAB */}
      {activeTab === "salary" && (
      <div className="mt-4 space-y-4">
        <Card className="border-0 glass-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">Staff Salary Structures</h3>
            {staff.map((s) => {
              const struct = getSalaryStructure(s.id)
              const isEditing = editingStaff === s.id
              return (
                <Card key={s.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0"><AvatarFallback>{s.firstName[0]}{s.lastName[0]}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{s.firstName} {s.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.user?.role || "Staff"} • {s.department}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(s.id)} className="shrink-0"><Edit3 className="h-4 w-4" /></Button>
                    </div>
                    {isEditing ? (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div><label className="text-xs text-muted-foreground">Salary Amount (₦)</label><Input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></div>
                        </div>
                        <Button size="sm" onClick={() => saveSalaryStructure(s.id)}>Save</Button>
                      </div>
                    ) : struct ? (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="rounded-lg bg-muted/30 p-2"><span className="text-muted-foreground">Amount</span><p className="font-bold">₦{struct.amount}</p></div>
                      </div>
                    ) : (
                      <div className="mt-3"><Button size="sm" variant="outline" onClick={() => startEdit(s.id)}>Set Salary</Button></div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border-0 glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h3 className="font-semibold">{currentMonth} {currentYear} Payroll</h3>
              <Button onClick={initializeMonthlyPayroll}><Plus className="h-4 w-4 mr-1" /> Init Payroll</Button>
            </div>
            {salaryRecords.filter((r) => r.month === currentMonth && r.year === currentYear).length === 0 ? (
              <EmptyState title="No payroll records" description="Click 'Init Payroll' to generate records" />
            ) : (
              <div className="space-y-2">
                {salaryRecords.filter((r) => r.month === currentMonth && r.year === currentYear).map((rec) => {
                  const s = staff.find((st) => st.id === rec.staffId)
                  return (
                    <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 flex-wrap gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="text-xs">{s ? `${s.firstName[0]}${s.lastName[0]}` : "?"}</AvatarFallback></Avatar>
                        <div className="min-w-0"><p className="text-sm font-medium truncate">{s ? `${s.firstName} ${s.lastName}` : rec.staffId}</p></div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="font-mono font-bold">₦{(rec.amount ?? 0).toLocaleString()}</p>
                        {rec.status === "paid" ? (
                          <Badge className="bg-green-500/15 text-green-600 shrink-0"><CheckCircle2 className="h-3 w-3 mr-1" /> Paid</Badge>
                        ) : (
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => markSalaryPaid(rec.id)}><CheckCircle2 className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Mark Paid</span></Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 glass-card">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Payment History</h4>
            {salaryRecords.filter((r) => r.status === "paid").length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No completed payments</p>
            ) : (
              <div className="space-y-2">
                {salaryRecords.filter((r) => r.status === "paid").slice().reverse().map((rec) => {
                  const s = staff.find((st) => st.id === rec.staffId)
                  return (
                    <div key={rec.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-xs">
                      <span>{s ? `${s.firstName} ${s.lastName}` : rec.staffId} - {rec.month} {rec.year}</span>
                      <span className="font-mono font-bold">₦{rec.amount} <Badge className="bg-green-500/15 text-green-600 text-[10px]">Paid</Badge></span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* BANK DETAILS TAB */}
      {activeTab === "bank" && (
      <div className="mt-4">
        <Card className="border-0 glass-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold">School Bank Details</h3>
              <Button variant="outline" size="sm" onClick={() => setShowBankForm(!showBankForm)}><Edit3 className="h-4 w-4 mr-1" /> Edit</Button>
            </div>
            {showBankForm ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground">Bank Name</label><Input value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Account Name</label><Input value={bankForm.accountName} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Account Number</label><Input value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Swift Code</label><Input value={bankForm.swiftCode} onChange={(e) => setBankForm({ ...bankForm, swiftCode: e.target.value })} /></div>
                  <div className="sm:col-span-2"><label className="text-xs text-muted-foreground">Branch</label><Input value={bankForm.branch} onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} /></div>
                </div>
                <Button size="sm" onClick={saveBankDetails}>Save Bank Details</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[{ label: "Bank Name", value: bankDetails?.bankName }, { label: "Account Name", value: bankDetails?.accountName }, { label: "Account Number", value: bankDetails?.accountNumber }, { label: "Swift Code", value: bankDetails?.swiftCode }].map((d) => (
                  <div key={d.label} className="rounded-xl bg-muted/30 p-3 min-w-0"><p className="text-[10px] text-muted-foreground">{d.label}</p><p className="text-sm font-mono font-bold mt-0.5 truncate">{d.value}</p></div>
                ))}
              </div>
            )}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3 text-xs">
              <strong>Instructions:</strong> Parents will see these bank details on their portal. They make transfers and enter the reference number. Admin confirms receipt here.
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* RECEIPTS TAB */}
      {activeTab === "receipts" && (
      <div className="mt-4 space-y-4">
        <Card className="border-0 glass-card">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Generate Receipt</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Select Confirmed Payment</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={selectedPaymentId}
                onChange={(e) => setSelectedPaymentId(e.target.value)}
              >
                <option value="">Choose a payment...</option>
                {payments.filter((p) => p.status === "confirmed").map((p) => {
                  const student = students.find((s) => s.id === p.studentId)
                  return (
                    <option key={p.id} value={p.id}>
                      {student ? `${student.firstName} ${student.lastName}` : p.studentId} - ₦{(p.amount ?? 0).toLocaleString()} - {p.reference}
                    </option>
                  )
                })}
              </select>
            </div>

            {selectedPaymentId && receiptData ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={handleDownloadPng}><Image className="h-4 w-4 mr-1" /> Download PNG</Button>
                  <Button size="sm" onClick={handleDownloadPdf}><FileText className="h-4 w-4 mr-1" /> Download PDF</Button>
                  <Button size="sm" variant="outline" onClick={handleShareWhatsApp}><Share2 className="h-4 w-4 mr-1" /> WhatsApp</Button>
                  <Button size="sm" variant="outline" onClick={handleShareEmail}><Mail className="h-4 w-4 mr-1" /> Email</Button>
                </div>
                <div className="border rounded-xl overflow-auto max-h-[600px] p-4 bg-white">
                  <div ref={receiptRef}>
                    <ReceiptTemplate data={receiptData} />
                  </div>
                </div>
              </div>
            ) : selectedPaymentId ? (
              <EmptyState title="Receipt data unavailable" description="Could not generate receipt for this payment" />
            ) : null}
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )
}
