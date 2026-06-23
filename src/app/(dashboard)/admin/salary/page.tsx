"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Wallet, Users, DollarSign, CheckCircle2, Clock, CalendarDays, Banknote, Plus, Edit3, Building } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"

export default function AdminSalaryPage() {
  const [activeTab, setActiveTab] = useState("structures")
  const [staff, setStaff] = useState<any[]>([])
  const [salaryStructures, setSalaryStructures] = useState<any[]>([])
  const [salaryRecords, setSalaryRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStaff, setEditingStaff] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ amount: "" })

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const currentMonth = months[new Date().getMonth()]
  const currentYear = String(new Date().getFullYear())

  useEffect(() => {
    Promise.all([
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/salary-structures").then((r) => r.json()),
      fetch("/api/salary").then((r) => r.json()),
    ]).then(([st, ss, sr]) => { setStaff(st); setSalaryStructures(ss); setSalaryRecords(sr); setLoading(false) })
  }, [])

  const getSalaryStructure = (staffId: string) => salaryStructures.find((s) => s.staffId === staffId)

  const getTotalPaid = () => salaryRecords.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0)
  const getPendingSalary = () => salaryRecords.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0)

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

  const markPaid = async (id: string) => {
    const res = await fetch("/api/salary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "markPaid", id, paidAt: new Date().toISOString(), confirmedBy: "admin" }) })
    if (res.ok) {
      setSalaryRecords(salaryRecords.map((r) => r.id === id ? { ...r, status: "paid", paidAt: new Date().toISOString(), confirmedAt: new Date().toISOString() } : r))
      toast.success("Salary marked as paid")
    }
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-48"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Salary Management</h2>
        <p className="text-sm text-muted-foreground">Staff salary structures, payroll, and payment confirmation</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Staff", value: staff.length, icon: Users, color: "bg-blue-500/15 text-blue-600" },
          { label: "Total Paid", value: `₦${(getTotalPaid() ?? 0).toLocaleString()}`, icon: DollarSign, color: "bg-green-500/15 text-green-600" },
          { label: "Pending", value: `₦${(getPendingSalary() ?? 0).toLocaleString()}`, icon: Clock, color: "bg-amber-500/15 text-amber-600" },
          { label: "Month", value: currentMonth, icon: CalendarDays, color: "bg-purple-500/15 text-purple-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 glass-card"><CardContent className="p-4"><div className="flex items-center gap-3 mb-1"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}><stat.icon className="h-4 w-4" /></div><span className="text-xs text-muted-foreground">{stat.label}</span></div><p className="text-lg font-bold">{stat.value}</p></CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="structures" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Users className="h-4 w-4 mr-1" /> Salary Structures</TabsTrigger>
          <TabsTrigger value="payroll" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Wallet className="h-4 w-4 mr-1" /> Payroll</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "structures" && (
      <div className="mt-4">
        <Card className="border-0 glass-card">
          <CardContent className="p-4 space-y-3">
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
                          <p className="text-xs text-muted-foreground truncate">{s.role} • {s.department}</p>
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
      </div>
      )}

      {activeTab === "payroll" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold">{currentMonth} {currentYear} Payroll</h3>
          <Button onClick={initializeMonthlyPayroll}><Plus className="h-4 w-4 mr-1" /> Initialize Payroll</Button>
        </div>
        <Card className="border-0 glass-card">
          <CardContent className="p-4">
            {salaryRecords.filter((r) => r.month === currentMonth && r.year === currentYear).length === 0 ? (
              <EmptyState title="No payroll records" description="Click 'Initialize Payroll' to generate salary records for this month" />
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
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => markPaid(rec.id)}><CheckCircle2 className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Mark Paid</span></Button>
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
    </div>
  )
}
