"use client"

import { useEffect, useState, useCallback } from "react"
import ImageToText from "@/components/ImageToText"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSuperAdmin } from "../layout"
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, FileText, Calendar,
  Power, Clock, Key, CheckCircle, XCircle, RefreshCw, Plus, Trash2,
  ExternalLink, Shield, Settings, HelpCircle, ClipboardCheck, CreditCard,
  Wallet, Building2, Download, Megaphone, MessageSquare, Edit3, Eye,
  Search, Filter, AlertCircle, ToggleLeft, ToggleRight, ArrowUpDown,
  DollarSign, Printer, Ban, Mail, Phone, MapPin, Globe, Pencil,
  ChevronDown, ChevronUp, Loader2, ScanLine, ImageIcon
} from "lucide-react"

const saFetch = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  })
  return res.json()
}

const saApi = async (action: string, extra: any = {}) => {
  const token = localStorage.getItem("sa_token")
  return saFetch("/api/superadmin", {
    method: "POST",
    body: JSON.stringify({ action, token, ...extra }),
  })
}

export default function SuperAdminPage() {
  const { activeSection } = useSuperAdmin()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("sa_token")
    if (!token) { router.push("/superadmin/login") }
  }, [router])

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardSection />
      case "school-settings": return <SchoolSettingsSection />
      case "classes": return <ClassesSection />
      case "subjects": return <SubjectsSection />
      case "sessions": return <SessionsSection />
      case "terms": return <TermsSection />
      case "timetable": return <TimetableSection />
      case "staff": return <StaffSection />
      case "teachers": return <TeachersSection />
      case "students": return <StudentsSection />
      case "parents": return <ParentsSection />
      case "question-bank": return <QuestionBankSection />
      case "exams": return <ExamsSection />
      case "scheme-of-work": return <SchemeOfWorkSection />
      case "lesson-notes": return <LessonNotesSection />
      case "ocr-tool": return <OcrSection />
      case "fee-structures": return <FeeStructuresSection />
      case "payments": return <PaymentsSection />
      case "salary": return <SalarySection />
      case "admissions": return <AdmissionsSection />
      case "attendance": return <AttendanceSection />
      case "documents": return <DocumentsSection />
      case "announcements": return <AnnouncementsSection />
      case "feedback": return <FeedbackSection />
      case "bank-details": return <BankDetailsSection />
      case "data-export": return <DataExportSection />
      default: return <DashboardSection />
    }
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0f]">
      <div className="p-4 lg:p-6 lg:ml-0">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <h1 className="text-lg font-semibold text-white capitalize">
            {activeSection.replace(/([A-Z])/g, " $1").trim()}
          </h1>
          <button
            onClick={() => {
              const el = document.getElementById("superadmin-sidebar-toggle");
              if (el) el.click();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#12121a] border border-zinc-800 text-zinc-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Toast({ message, type, onClose }: { message: string; type?: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(() => { if (message) { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) } }, [message, onClose])
  if (!message) return null
  const colors = { success: "border-emerald-600/30 bg-emerald-600/10 text-emerald-400", error: "border-red-600/30 bg-red-600/10 text-red-400", info: "border-blue-600/30 bg-blue-600/10 text-blue-400" }
  const c = colors[type || "info"]
  return (
    <div className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${c}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100">&times;</button>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-4 transition-colors hover:border-zinc-700">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function Table({ headers, rows, onEdit, onDelete, loading }: {
  headers: string[]; rows: any[]; onEdit?: (row: any) => void; onDelete?: (row: any) => void; loading?: boolean
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            {headers.map((h) => <th key={h} className="px-4 py-3 font-medium text-zinc-400">{h}</th>)}
            {(onEdit || onDelete) && <th className="px-4 py-3 font-medium text-zinc-400">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={headers.length + ((onEdit || onDelete) ? 1 : 0)} className="px-4 py-12 text-center text-zinc-500">Loading...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={headers.length + ((onEdit || onDelete) ? 1 : 0)} className="px-4 py-12 text-center text-zinc-500">No records found</td></tr>
          ) : rows.map((row, i) => (
            <tr key={row.id || i} className={`border-b border-zinc-800/50 ${i % 2 === 0 ? "bg-[#12121a]" : "bg-zinc-900/20"} hover:bg-zinc-800/30`}>
              {headers.map((h) => <td key={h} className="px-4 py-3 text-zinc-300">{row[h] ?? "-"}</td>)}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {onEdit && <button onClick={() => onEdit(row)} className="rounded bg-blue-600/20 px-2 py-1 text-xs text-blue-400 hover:bg-blue-600/30"><Pencil className="h-3 w-3 inline" /> Edit</button>}
                    {onDelete && <button onClick={() => onDelete(row)} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400 hover:bg-red-600/30"><Trash2 className="h-3 w-3 inline" /> Delete</button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Input({ label, value, onChange, type = "text", placeholder, className }: {
  label?: string; value: any; onChange: (v: any) => void; type?: string; placeholder?: string; className?: string
}) {
  return (
    <div className={className}>
      {label && <label className="mb-1 block text-xs font-medium text-zinc-400">{label}</label>}
      {type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500 min-h-[80px]" />
      ) : type === "color" ? (
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 cursor-pointer" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)} placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500" />
      )}
    </div>
  )
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#12121a] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Loading() {
  return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>
}

// ========================== DASHBOARD ==========================
function DashboardSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [renewDate, setRenewDate] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const d = await saFetch("/api/superadmin?action=dashboard")
    setData(d)
    if (d.settings?.expirationDate) setExpirationDate(d.settings.expirationDate.split("T")[0])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const api = useCallback(async (action: string, extra: any = {}) => {
    const d = await saApi(action, extra)
    if (d.success) {
      setData((prev: any) => ({ ...prev, ...d.data }))
      setMessage(d.message || "Done!")
    } else { setMessage(d.error || "Failed") }
  }, [])

  if (loading) return <Loading />
  const stats = data?.stats || {}
  const settings = data?.settings || {}
  const applications = data?.pendingApplications || []

  return (
    <div className="space-y-6">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard icon={Users} label="Total Staff" value={stats.staff || 0} color="text-emerald-400" />
        <StatCard icon={GraduationCap} label="Teachers" value={stats.teachers || 0} color="text-blue-400" />
        <StatCard icon={Users} label="Students" value={stats.students || 0} color="text-violet-400" />
        <StatCard icon={BookOpen} label="Classes" value={stats.classes || 0} color="text-cyan-400" />
        <StatCard icon={BookOpen} label="Subjects" value={stats.subjects || 0} color="text-indigo-400" />
        <StatCard icon={ClipboardCheck} label="Exams" value={stats.exams || 0} color="text-orange-400" />
        <StatCard icon={HelpCircle} label="Question Bank" value={stats.questions || 0} color="text-pink-400" />
        <StatCard icon={FileText} label="Pending Apps" value={stats.pendingApplications || 0} color="text-amber-400" />
        <StatCard icon={MessageSquare} label="Feedback" value={stats.feedbackTickets || 0} color="text-rose-400" />
        <StatCard icon={CreditCard} label="Payments" value={stats.payments || 0} color="text-green-400" />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">School Status</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg bg-zinc-900/50 p-4">
            <div className="flex items-center gap-3">
              <Power className={`h-5 w-5 ${settings.loginEnabled ? "text-green-400" : "text-red-400"}`} />
              <div><p className="text-sm font-medium text-zinc-200">Login</p><p className="text-xs text-zinc-500">{settings.loginEnabled ? "Enabled" : "Disabled"}</p></div>
            </div>
            <button onClick={() => api("toggleLogin")} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${settings.loginEnabled ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" : "bg-green-600/20 text-green-400 hover:bg-green-600/30"}`}>
              {settings.loginEnabled ? "Disable" : "Enable"}
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-900/50 p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-400" />
              <div><p className="text-sm font-medium text-zinc-200">Expiration</p><p className="text-xs text-zinc-500">{settings.expirationDate ? new Date(settings.expirationDate).toLocaleDateString() : "No expiration"}</p></div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-900/50 p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-emerald-400" />
              <div><p className="text-sm font-medium text-zinc-200">Last Updated</p><p className="text-xs text-zinc-500">{settings.updatedAt ? new Date(settings.updatedAt).toLocaleDateString() : "N/A"}</p></div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 max-w-xs" />
          <button onClick={() => api("renewSchool", { newExpirationDate: renewDate })} className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-medium text-white hover:opacity-90">Renew & Enable Login</button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Controls</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400">Set School Expiration Date</label>
            <div className="flex gap-2">
              <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
              <button onClick={() => api("setExpiration", { expirationDate })} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700">Set</button>
            </div>
            <button onClick={() => api("clearExpiration")} className="text-xs text-zinc-500 hover:text-red-400">Clear expiration</button>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400">Change Super Admin Password</label>
            <div className="flex gap-2">
              <input type="text" placeholder="New admin password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
              <button onClick={() => api("changeAdminPassword", { newPassword })} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700">Update</button>
            </div>
          </div>
        </div>
      </div>

      {applications.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Pending Admissions ({applications.length})</h2>
          <div className="space-y-3">
            {applications.map((app: any) => (
              <div key={app.id} className="flex items-center justify-between rounded-lg bg-zinc-900/50 p-4">
                <div><p className="text-sm font-medium text-zinc-200">{app.firstName} {app.lastName}</p><p className="text-xs text-zinc-500">{app.email} &mdash; {new Date(app.appliedAt).toLocaleDateString()}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => api("acceptApplication", { id: app.id })} className="flex items-center gap-1 rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30"><CheckCircle className="h-3 w-3" /> Accept</button>
                  <button onClick={() => api("rejectApplication", { id: app.id })} className="flex items-center gap-1 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30"><XCircle className="h-3 w-3" /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-6 text-center text-sm text-zinc-500">
        <ExternalLink className="mx-auto mb-2 h-5 w-5 text-emerald-400" />
        <p>Expired schools see your WhatsApp contact for renewal. Update the WhatsApp number in the ExpirationOverlay component.</p>
      </div>
    </div>
  )
}

// ========================== SCHOOL SETTINGS ==========================
function SchoolSettingsSection() {
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    saFetch("/api/school").then((d) => { setForm(d); setLoading(false) })
  }, [])

  const save = async () => {
    const d = await saFetch("/api/school", { method: "PUT", body: JSON.stringify(form) })
    if (d.success) setMessage("Settings saved!")
    else setMessage("Failed to save")
  }

  const f = (key: string) => form[key] ?? ""
  const s = (key: string, v: any) => setForm((p: any) => ({ ...p, [key]: v }))

  if (loading) return <Loading />
  return (
    <div className="space-y-6 max-w-3xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">School Settings</h1>
      <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="School Name" value={f("name")} onChange={(v) => s("name", v)} />
          <Input label="Short Name" value={f("shortName")} onChange={(v) => s("shortName", v)} />
          <Input label="Motto" value={f("motto")} onChange={(v) => s("motto", v)} className="sm:col-span-2" />
          <Input label="Address" value={f("address")} onChange={(v) => s("address", v)} className="sm:col-span-2" />
          <Input label="Phone" value={f("phone")} onChange={(v) => s("phone", v)} />
          <Input label="Email" value={f("email")} onChange={(v) => s("email", v)} />
          <Input label="Logo URL / About Text" value={f("logo")} onChange={(v) => s("logo", v)} className="sm:col-span-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Primary Color" type="color" value={f("primaryColor")} onChange={(v) => s("primaryColor", v)} />
          <Input label="Secondary Color" type="color" value={f("secondaryColor")} onChange={(v) => s("secondaryColor", v)} />
          <Input label="Accent Color" type="color" value={f("accentColor")} onChange={(v) => s("accentColor", v)} />
        </div>
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-zinc-400">Login Enabled</label>
            <button onClick={() => s("loginEnabled", !form.loginEnabled)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${form.loginEnabled ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}`}>
              {form.loginEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>
          <Input label="Expiration Date" type="date" value={f("expirationDate")?.split("T")[0] || ""} onChange={(v) => s("expirationDate", v)} />
        </div>
        <button onClick={save} className="rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90">Save Settings</button>
      </div>
    </div>
  )
}

// ========================== GENERIC CRUD HELPER ==========================
function useCrud(apiPath: string) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const d = await saFetch(apiPath)
    setItems(Array.isArray(d) ? d : [])
    setLoading(false)
  }, [apiPath])

  useEffect(() => { load() }, [load])

  const create = async (data: any) => {
    const d = await saFetch(apiPath, { method: "POST", body: JSON.stringify(data) })
    if (d.error) { setMessage(d.error); return false }
    setMessage("Created successfully!")
    load()
    return true
  }

  const update = async (id: string, data: any) => {
    const d = await saFetch(`${apiPath}/${id}`, { method: "PUT", body: JSON.stringify(data) })
    if (d.error) { setMessage(d.error); return false }
    setMessage("Updated successfully!")
    load()
    return true
  }

  const remove = async (id: string) => {
    const d = await saFetch(`${apiPath}/${id}`, { method: "DELETE" })
    if (d.error) { setMessage(d.error); return }
    setMessage("Deleted successfully!")
    load()
  }

  return { items, loading, message, setMessage, load, create, update, remove }
}

// ========================== CLASSES ==========================
function ClassesSection() {
  const crud = useCrud("/api/classes")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", arm: "", section: "" })

  const openEdit = (row: any) => { setForm({ name: row.name, arm: row.arm || "", section: row.section || "" }); setEditId(row.id); setShowForm(true) }
  const handleSubmit = async () => {
    if (editId) { await crud.update(editId, form) } else { await crud.create(form) }
    setShowForm(false); setEditId(null); setForm({ name: "", arm: "", section: "" })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Toast message={crud.message} type="success" onClose={() => crud.setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Classes</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", arm: "", section: "" }) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Class</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Class" : "Create Class"}>
        <div className="space-y-4">
          <Input label="Class Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          <Input label="Arm (optional)" value={form.arm} onChange={(v) => setForm((p) => ({ ...p, arm: v }))} />
          <Input label="Section (optional)" value={form.section} onChange={(v) => setForm((p) => ({ ...p, section: v }))} />
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">{editId ? "Update" : "Create"}</button>
        </div>
      </Modal>
      <Table headers={["name", "arm", "section", "studentCount"]} rows={crud.items.map((c: any) => ({ ...c, studentCount: c.studentCount || 0 }))} onEdit={openEdit} onDelete={(r) => crud.remove(r.id)} loading={crud.loading} />
    </div>
  )
}

// ========================== SUBJECTS ==========================
function SubjectsSection() {
  const [classes, setClasses] = useState<any[]>([])
  const crud = useCrud("/api/subjects")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", code: "", classId: "" })

  useEffect(() => { saFetch("/api/classes").then(setClasses) }, [])

  const openEdit = (row: any) => { setForm({ name: row.name, code: row.code || "", classId: row.classId || "" }); setEditId(row.id); setShowForm(true) }
  const handleSubmit = async () => {
    if (editId) { await crud.update(editId, form) } else { await crud.create(form) }
    setShowForm(false); setEditId(null); setForm({ name: "", code: "", classId: "" })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Toast message={crud.message} type="success" onClose={() => crud.setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Subjects</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", code: "", classId: "" }) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Subject</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Subject" : "Create Subject"}>
        <div className="space-y-4">
          <Input label="Subject Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          <Input label="Code" value={form.code} onChange={(v) => setForm((p) => ({ ...p, code: v }))} />
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Class</label>
            <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Select Class</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">{editId ? "Update" : "Create"}</button>
        </div>
      </Modal>
      <Table headers={["name", "code", "className"]} rows={crud.items.map((s: any) => ({ ...s, className: classes.find((c: any) => c.id === s.classId)?.name || "-" }))} onEdit={openEdit} onDelete={(r) => crud.remove(r.id)} loading={crud.loading} />
    </div>
  )
}

// ========================== SESSIONS ==========================
function SessionsSection() {
  const crud = useCrud("/api/sessions")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", termCount: 3 })

  const openEdit = (row: any) => { setForm({ name: row.name, startDate: row.startDate?.split("T")[0] || "", endDate: row.endDate?.split("T")[0] || "", termCount: row.termCount || 3 }); setEditId(row.id); setShowForm(true) }
  const handleSubmit = async () => {
    const d = editId ? await crud.update(editId, form) : await crud.create(form)
    if (d) { setShowForm(false); setEditId(null); setForm({ name: "", startDate: "", endDate: "", termCount: 3 }) }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Toast message={crud.message} type="success" onClose={() => crud.setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Sessions</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", startDate: "", endDate: "", termCount: 3 }) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Session</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Session" : "Create Session"}>
        <div className="space-y-4">
          <Input label="Session Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          <Input label="Start Date" type="date" value={form.startDate} onChange={(v) => setForm((p) => ({ ...p, startDate: v }))} />
          <Input label="End Date" type="date" value={form.endDate} onChange={(v) => setForm((p) => ({ ...p, endDate: v }))} />
          <Input label="Term Count" type="number" value={form.termCount} onChange={(v) => setForm((p) => ({ ...p, termCount: v }))} />
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">{editId ? "Update" : "Create"}</button>
        </div>
      </Modal>
      <Table headers={["name", "startDate", "endDate", "termCount"]} rows={crud.items.map((s: any) => ({ ...s, startDate: s.startDate ? new Date(s.startDate).toLocaleDateString() : "-", endDate: s.endDate ? new Date(s.endDate).toLocaleDateString() : "-" }))} onEdit={openEdit} onDelete={(r) => crud.remove(r.id)} loading={crud.loading} />
    </div>
  )
}

// ========================== TERMS ==========================
function TermsSection() {
  const [sessions, setSessions] = useState<any[]>([])
  const crud = useCrud("/api/terms")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", sessionId: "" })

  useEffect(() => { saFetch("/api/sessions").then(setSessions) }, [])

  const openEdit = (row: any) => { setForm({ name: row.name, startDate: row.startDate?.split("T")[0] || "", endDate: row.endDate?.split("T")[0] || "", sessionId: row.sessionId || "" }); setEditId(row.id); setShowForm(true) }
  const handleSubmit = async () => {
    if (editId) { await crud.update(editId, form) } else { await crud.create(form) }
    setShowForm(false); setEditId(null); setForm({ name: "", startDate: "", endDate: "", sessionId: "" })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Toast message={crud.message} type="success" onClose={() => crud.setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Terms</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", startDate: "", endDate: "", sessionId: "" }) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Term</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Term" : "Create Term"}>
        <div className="space-y-4">
          <Input label="Term Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          <Input label="Start Date" type="date" value={form.startDate} onChange={(v) => setForm((p) => ({ ...p, startDate: v }))} />
          <Input label="End Date" type="date" value={form.endDate} onChange={(v) => setForm((p) => ({ ...p, endDate: v }))} />
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Session</label>
            <select value={form.sessionId} onChange={(e) => setForm((p) => ({ ...p, sessionId: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Select Session</option>
              {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">{editId ? "Update" : "Create"}</button>
        </div>
      </Modal>
      <Table headers={["name", "startDate", "endDate", "sessionName"]} rows={crud.items.map((t: any) => ({ ...t, startDate: t.startDate ? new Date(t.startDate).toLocaleDateString() : "-", endDate: t.endDate ? new Date(t.endDate).toLocaleDateString() : "-", sessionName: sessions.find((s: any) => s.id === t.sessionId)?.name || "-" }))} onEdit={openEdit} onDelete={(r) => crud.remove(r.id)} loading={crud.loading} />
    </div>
  )
}

// ========================== TIMETABLE ==========================
function TimetableSection() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ day: "Monday", startTime: "", endTime: "", subject: "", classId: "", room: "" })
  const [classes, setClasses] = useState<any[]>([])

  const load = useCallback(async () => { setLoading(true); const d = await saFetch("/api/timetable"); setItems(Array.isArray(d) ? d : []); setLoading(false) }, [])
  useEffect(() => { load(); saFetch("/api/classes").then(setClasses) }, [load])

  const handleSubmit = async () => {
    const url = "/api/timetable"
    if (editId) {
      const d = await saFetch(`${url}/${editId}`, { method: "PUT", body: JSON.stringify(form) })
      if (d.error) { setMessage(d.error); return }
    } else {
      const d = await saFetch(url, { method: "POST", body: JSON.stringify(form) })
      if (d.error) { setMessage(d.error); return }
    }
    setMessage("Saved!"); setShowForm(false); setEditId(null); setForm({ day: "Monday", startTime: "", endTime: "", subject: "", classId: "", room: "" }); load()
  }

  const remove = async (id: string) => {
    const d = await saFetch(`/api/timetable/${id}`, { method: "DELETE" })
    if (!d.error) { setMessage("Deleted!"); load() }
  }

  const openEdit = (row: any) => { setForm({ day: row.day, startTime: row.startTime, endTime: row.endTime || "", subject: row.subject, classId: row.classId || "", room: row.room || "" }); setEditId(row.id); setShowForm(true) }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Timetable</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ day: "Monday", startTime: "", endTime: "", subject: "", classId: "", room: "" }) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Entry</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Entry" : "Add Entry"}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Day</label>
            <select value={form.day} onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <Input label="Start Time" type="time" value={form.startTime} onChange={(v) => setForm((p) => ({ ...p, startTime: v }))} />
          <Input label="End Time" type="time" value={form.endTime} onChange={(v) => setForm((p) => ({ ...p, endTime: v }))} />
          <Input label="Subject" value={form.subject} onChange={(v) => setForm((p) => ({ ...p, subject: v }))} />
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Class</label>
            <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">All / General</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Room" value={form.room} onChange={(v) => setForm((p) => ({ ...p, room: v }))} />
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">{editId ? "Update" : "Create"}</button>
        </div>
      </Modal>
      <Table headers={["day", "startTime", "endTime", "subject", "className", "room"]} rows={items.map((t: any) => ({ ...t, className: classes.find((c: any) => c.id === t.classId)?.name || "All" }))} onEdit={openEdit} onDelete={(r) => remove(r.id)} loading={loading} />
    </div>
  )
}

// ========================== STAFF ==========================
function StaffSection() {
  const crud = useCrud("/api/staff")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", department: "", role: "teacher" })

  const openEdit = (row: any) => { setForm({ firstName: row.firstName, lastName: row.lastName, email: row.email, password: "", department: row.department || "", role: row.role }); setEditId(row.id); setShowForm(true) }
  const handleSubmit = async () => {
    if (editId) {
      const d: any = { firstName: form.firstName, lastName: form.lastName, email: form.email, department: form.department, role: form.role }
      if (form.password) d.password = form.password
      await crud.update(editId, d)
    } else { await crud.create(form) }
    setShowForm(false); setEditId(null); setForm({ firstName: "", lastName: "", email: "", password: "", department: "", role: "teacher" })
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={crud.message} type="success" onClose={() => crud.setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Staff</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ firstName: "", lastName: "", email: "", password: "", department: "", role: "teacher" }) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Staff</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Staff" : "Create Staff"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.firstName} onChange={(v) => setForm((p) => ({ ...p, firstName: v }))} />
            <Input label="Last Name" value={form.lastName} onChange={(v) => setForm((p) => ({ ...p, lastName: v }))} />
          </div>
          <Input label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
          <Input label={editId ? "New Password (leave blank to keep)" : "Password"} type="text" value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} />
          <Input label="Department" value={form.department} onChange={(v) => setForm((p) => ({ ...p, department: v }))} />
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Role</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">{editId ? "Update" : "Create"}</button>
        </div>
      </Modal>
      <Table headers={["staffId", "firstName", "lastName", "email", "department", "role", "status"]} rows={crud.items} onEdit={openEdit} onDelete={(r) => crud.remove(r.id)} loading={crud.loading} />
    </div>
  )
}

// ========================== TEACHERS ==========================
function TeachersSection() {
  const [staff, setStaff] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [selected, setSelected] = useState<string>("")
  const [classIds, setClassIds] = useState<string[]>([])
  const [subjectIds, setSubjectIds] = useState<string[]>([])

  useEffect(() => {
    Promise.all([
      saFetch("/api/staff"),
      saFetch("/api/classes"),
      saFetch("/api/subjects"),
      saFetch("/api/teacher-assignments"),
    ]).then(([s, c, sub, a]) => {
      setStaff(Array.isArray(s) ? s.filter((x: any) => x.role === "teacher") : [])
      setClasses(Array.isArray(c) ? c : [])
      setSubjects(Array.isArray(sub) ? sub : [])
      setAssignments(Array.isArray(a) ? a : [])
    })
  }, [])

  const selectTeacher = (id: string) => {
    setSelected(id)
    const a = assignments.find((x: any) => x.teacherId === id)
    setClassIds(a?.classIds || [])
    setSubjectIds(a?.subjectIds || [])
  }

  const save = async () => {
    if (!selected) return
    const d = await saFetch("/api/teacher-assignments", {
      method: "PUT",
      body: JSON.stringify({ teacherId: selected, classIds, subjectIds }),
    })
    if (d.error) { setMessage(d.error); return }
    setMessage("Assignments saved!")
    const a = await saFetch("/api/teacher-assignments")
    setAssignments(Array.isArray(a) ? a : [])
  }

  const toggleClass = (id: string) => setClassIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  const toggleSubject = (id: string) => setSubjectIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  return (
    <div className="space-y-6 max-w-5xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">Teachers</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Select Teacher</h2>
          {staff.length === 0 ? <p className="text-sm text-zinc-500">No teachers found</p> : (
            <div className="space-y-2">
              {staff.map((s: any) => (
                <button key={s.id} onClick={() => selectTeacher(s.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${selected === s.id ? "border-red-500/50 bg-red-600/10 text-red-400" : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700"}`}>
                  {s.firstName} {s.lastName} <span className="text-xs text-zinc-500">({s.email})</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {selected && (
          <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-6 space-y-6">
            <h2 className="text-sm font-semibold text-zinc-300">Assignments for {staff.find((s: any) => s.id === selected)?.firstName}</h2>
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Classes</p>
              <div className="flex flex-wrap gap-2">
                {classes.map((c: any) => (
                  <button key={c.id} onClick={() => toggleClass(c.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${classIds.includes(c.id) ? "border-red-500/50 bg-red-600/20 text-red-400" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {subjects.map((sub: any) => (
                  <button key={sub.id} onClick={() => toggleSubject(sub.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${subjectIds.includes(sub.id) ? "border-red-500/50 bg-red-600/20 text-red-400" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"}`}>
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={save} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">Save Assignments</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ========================== STUDENTS ==========================
function StudentsSection() {
  const [classes, setClasses] = useState<any[]>([])
  const crud = useCrud("/api/students")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", gender: "male", classId: "" })

  useEffect(() => { saFetch("/api/classes").then(setClasses) }, [])

  const openEdit = (row: any) => { setForm({ firstName: row.firstName, lastName: row.lastName, email: row.email, password: "", gender: row.gender, classId: row.classId || "" }); setEditId(row.id); setShowForm(true) }
  const handleSubmit = async () => {
    if (editId) {
      const d: any = { firstName: form.firstName, lastName: form.lastName, email: form.email, gender: form.gender, classId: form.classId }
      if (form.password) d.password = form.password
      await crud.update(editId, d)
    } else { await crud.create(form) }
    setShowForm(false); setEditId(null); setForm({ firstName: "", lastName: "", email: "", password: "", gender: "male", classId: "" })
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={crud.message} type="success" onClose={() => crud.setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Students</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ firstName: "", lastName: "", email: "", password: "", gender: "male", classId: "" }) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Student</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Student" : "Create Student"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.firstName} onChange={(v) => setForm((p) => ({ ...p, firstName: v }))} />
            <Input label="Last Name" value={form.lastName} onChange={(v) => setForm((p) => ({ ...p, lastName: v }))} />
          </div>
          <Input label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
          <Input label={editId ? "New Password" : "Password"} type="text" value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} />
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Gender</label>
            <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="male">Male</option><option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Class</label>
            <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Select Class</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">{editId ? "Update" : "Create"}</button>
        </div>
      </Modal>
      <Table headers={["studentId", "firstName", "lastName", "email", "gender", "className", "status"]} rows={crud.items.map((s: any) => ({ ...s, className: classes.find((c: any) => c.id === s.classId)?.name || "-" }))} onEdit={openEdit} onDelete={(r) => crud.remove(r.id)} loading={crud.loading} />
    </div>
  )
}

// ========================== PARENTS ==========================
function ParentsSection() {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", studentId: "" })
  const [students, setStudents] = useState<any[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const d = await saFetch("/api/parent-links")
    setLinks(Array.isArray(d) ? d : [])
    const stu = await saFetch("/api/students")
    setStudents(Array.isArray(stu) ? stu : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async () => {
    const d = await saFetch("/api/parent-links", {
      method: "POST",
      body: JSON.stringify({ ...form, parentId: "p_" + Date.now() }),
    })
    if (d.error) { setMessage(d.error); return }
    setMessage("Parent linked!")
    setShowForm(false)
    setForm({ name: "", email: "", phone: "", password: "", studentId: "" })
    load()
  }

  const remove = async (id: string) => {
    await saFetch(`/api/parent-links/${id}`, { method: "DELETE" })
    setMessage("Deleted!")
    load()
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Parents</h1>
        <button onClick={() => { setShowForm(true); setForm({ name: "", email: "", phone: "", password: "", studentId: "" }) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Link Parent</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Link Parent">
        <div className="space-y-4">
          <Input label="Parent Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          <Input label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
          <Input label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
          <Input label="Password" type="text" value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} />
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Linked Student</label>
            <select value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Select Student</option>
              {students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">Create & Link</button>
        </div>
      </Modal>
      <Table headers={["name", "email", "phone", "studentId"]} rows={links} onDelete={(r) => remove(r.id)} loading={loading} />
    </div>
  )
}

// ========================== QUESTION BANK ==========================
function QuestionBankSection() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const load = useCallback(async () => { setLoading(true); const d = await saFetch("/api/question-bank"); setItems(Array.isArray(d) ? d : []); setLoading(false) }, [])

  useEffect(() => { load() }, [load])

  const approve = async (id: string) => {
    await saFetch("/api/question-bank", { method: "PUT", body: JSON.stringify({ action: "approve", questionId: id, approvedBy: "superadmin" }) })
    setMessage("Approved!"); load()
  }

  const reject = async (id: string) => {
    await saFetch("/api/question-bank", { method: "PUT", body: JSON.stringify({ action: "reject", questionId: id }) })
    setMessage("Rejected!"); load()
  }

  const remove = async (id: string) => {
    await saFetch(`/api/question-bank?id=${id}`, { method: "DELETE" })
    setMessage("Deleted!"); load()
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">Question Bank</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-400">Question</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Type</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Class</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Subject</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Difficulty</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Points</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500">No questions</td></tr>
            ) : items.map((q: any, i: number) => (
              <tr key={q.id} className={`border-b border-zinc-800/50 ${i % 2 === 0 ? "bg-[#12121a]" : "bg-zinc-900/20"} hover:bg-zinc-800/30`}>
                <td className="max-w-[200px] truncate px-4 py-3 text-zinc-300">{q.question}</td>
                <td className="px-4 py-3 text-zinc-300">{q.type}</td>
                <td className="px-4 py-3 text-zinc-300">{q.className}</td>
                <td className="px-4 py-3 text-zinc-300">{q.subjectName}</td>
                <td className="px-4 py-3 text-zinc-300">{q.difficulty}</td>
                <td className="px-4 py-3 text-zinc-300">{q.points}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${q.approved ? "bg-emerald-600/20 text-emerald-400" : "bg-amber-600/20 text-amber-400"}`}>
                    {q.approved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {!q.approved && <button onClick={() => approve(q.id)} className="rounded bg-emerald-600/20 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-600/30"><CheckCircle className="h-3 w-3 inline" /></button>}
                    {q.approved && <button onClick={() => reject(q.id)} className="rounded bg-amber-600/20 px-2 py-1 text-xs text-amber-400 hover:bg-amber-600/30"><XCircle className="h-3 w-3 inline" /></button>}
                    <button onClick={() => remove(q.id)} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400 hover:bg-red-600/30"><Trash2 className="h-3 w-3 inline" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ========================== EXAMS ==========================
function ExamsSection() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", classId: "", subjectId: "", duration: 60 })
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])

  const load = useCallback(async () => { setLoading(true); const d = await saFetch("/api/exams"); setItems(Array.isArray(d) ? d : []); setLoading(false) }, [])
  useEffect(() => { load(); saFetch("/api/classes").then(setClasses); saFetch("/api/subjects").then(setSubjects) }, [load])

  const handleSubmit = async () => {
    if (editId) {
      await saFetch(`/api/exams/${editId}`, { method: "PUT", body: JSON.stringify(form) })
    } else {
      await saFetch("/api/exams", { method: "POST", body: JSON.stringify({ ...form, status: "draft" }) })
    }
    setMessage("Saved!"); setShowForm(false); setEditId(null); setForm({ title: "", classId: "", subjectId: "", duration: 60 }); load()
  }

  const publish = async (id: string) => {
    await saFetch(`/api/exams/${id}`, { method: "PUT", body: JSON.stringify({ status: "published" }) })
    setMessage("Published!"); load()
  }

  const unpublish = async (id: string) => {
    await saFetch(`/api/exams/${id}`, { method: "PUT", body: JSON.stringify({ status: "draft" }) })
    setMessage("Unpublished!"); load()
  }

  const remove = async (id: string) => {
    await saFetch(`/api/exams/${id}`, { method: "DELETE" })
    setMessage("Deleted!"); load()
  }

  const openEdit = (row: any) => { setForm({ title: row.title, classId: row.classId || "", subjectId: row.subjectId || "", duration: row.duration || 60 }); setEditId(row.id); setShowForm(true) }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Exams</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", classId: "", subjectId: "", duration: 60 }) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Create Exam</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Exam" : "Create Exam"}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} />
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Class</label>
            <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Select</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Subject</label>
            <select value={form.subjectId} onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Select</option>
              {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Input label="Duration (minutes)" type="number" value={form.duration} onChange={(v) => setForm((p) => ({ ...p, duration: v }))} />
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">{editId ? "Update" : "Create"}</button>
        </div>
      </Modal>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-400">Title</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Class</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Subject</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Duration</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500">No exams</td></tr>
            ) : items.map((e: any, i: number) => (
              <tr key={e.id} className={`border-b border-zinc-800/50 ${i % 2 === 0 ? "bg-[#12121a]" : "bg-zinc-900/20"} hover:bg-zinc-800/30`}>
                <td className="px-4 py-3 text-zinc-300">{e.title}</td>
                <td className="px-4 py-3 text-zinc-300">{classes.find((c: any) => c.id === e.classId)?.name || "-"}</td>
                <td className="px-4 py-3 text-zinc-300">{subjects.find((s: any) => s.id === e.subjectId)?.name || "-"}</td>
                <td className="px-4 py-3 text-zinc-300">{e.duration}m</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${e.status === "published" ? "bg-emerald-600/20 text-emerald-400" : "bg-zinc-600/20 text-zinc-400"}`}>{e.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(e)} className="rounded bg-blue-600/20 px-2 py-1 text-xs text-blue-400"><Pencil className="h-3 w-3 inline" /></button>
                    {e.status === "draft" ? (
                      <button onClick={() => publish(e.id)} className="rounded bg-emerald-600/20 px-2 py-1 text-xs text-emerald-400"><CheckCircle className="h-3 w-3 inline" /></button>
                    ) : (
                      <button onClick={() => unpublish(e.id)} className="rounded bg-amber-600/20 px-2 py-1 text-xs text-amber-400"><XCircle className="h-3 w-3 inline" /></button>
                    )}
                    <button onClick={() => remove(e.id)} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400"><Trash2 className="h-3 w-3 inline" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ========================== SCHEME OF WORK ==========================
function SchemeOfWorkSection() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const load = useCallback(async () => { setLoading(true); const d = await saFetch("/api/scheme-of-work"); setItems(Array.isArray(d) ? d : []); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const approve = async (id: string) => {
    await saFetch("/api/scheme-of-work", { method: "PUT", body: JSON.stringify({ action: "approve", id, approvedBy: "superadmin" }) })
    setMessage("Approved!"); load()
  }

  const reject = async (id: string) => {
    await saFetch("/api/scheme-of-work", { method: "PUT", body: JSON.stringify({ action: "reject", id }) })
    setMessage("Rejected!"); load()
  }

  const remove = async (id: string) => {
    await saFetch(`/api/scheme-of-work?id=${id}`, { method: "DELETE" })
    setMessage("Deleted!"); load()
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">Scheme of Work</h1>
      <Table headers={["title", "className", "subjectName", "status", "creatorName"]}
        rows={items.map((s: any) => ({ ...s, className: s.className || s.classId, status: s.status }))}
        loading={loading}
      />
      <div className="space-y-2">
        {items.map((s: any) => (
          <div key={s.id} className="flex items-start justify-between flex-wrap gap-2 rounded-lg border border-zinc-800 bg-[#12121a] p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-200 truncate">{s.title}</p>
              <p className="text-xs text-zinc-500 truncate">{s.className} | {s.subjectName} | Creator: {s.creatorName}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "published" ? "bg-emerald-600/20 text-emerald-400" : "bg-amber-600/20 text-amber-400"}`}>{s.status}</span>
              {s.status !== "published" && <button onClick={() => approve(s.id)} className="rounded bg-emerald-600/20 px-2 py-1 text-xs text-emerald-400"><CheckCircle className="h-3 w-3 inline" /> Approve</button>}
              {s.status === "published" && <button onClick={() => reject(s.id)} className="rounded bg-amber-600/20 px-2 py-1 text-xs text-amber-400"><XCircle className="h-3 w-3 inline" /> Reject</button>}
              <button onClick={() => remove(s.id)} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400"><Trash2 className="h-3 w-3 inline" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ========================== OCR TOOL ==========================
function OcrSection() {
  const [ocrText, setOcrText] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ocrText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-xl font-bold text-white">OCR Picture to Text</h1>
      <p className="text-sm text-zinc-400">Upload images to extract text using client-side OCR. No data leaves your device.</p>
      <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-6">
        <ImageToText multiple onUseText={(text) => setOcrText(text)} />
      </div>
      {ocrText && (
        <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-200">Extracted Text</h2>
            <button onClick={handleCopy} className="rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white transition-colors">
              {copied ? "Copied!" : "Copy All"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-zinc-300 bg-zinc-900 rounded-lg p-4 max-h-80 overflow-y-auto">{ocrText}</pre>
          <p className="text-xs text-zinc-500 mt-2">{ocrText.split(/\s+/).filter(Boolean).length} words &middot; {ocrText.length} characters</p>
        </div>
      )}
    </div>
  )
}

// ========================== LESSON NOTES ==========================
function LessonNotesSection() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [editNote, setEditNote] = useState<any | null>(null)
  const [ocrOpen, setOcrOpen] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [editForm, setEditForm] = useState({ title: "", subject: "", content: "", resources: "" })

  const load = useCallback(async () => { setLoading(true); const d = await saFetch("/api/lesson-notes"); setItems(Array.isArray(d) ? d : []); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const approve = async (id: string) => {
    await saFetch("/api/lesson-notes", { method: "PUT", body: JSON.stringify({ action: "approve", id, approvedBy: "superadmin" }) })
    setMessage("Approved!"); load()
  }

  const remove = async (id: string) => {
    await saFetch(`/api/lesson-notes/${id}`, { method: "DELETE" })
    setMessage("Deleted!"); load()
  }

  const openEdit = (n: any) => {
    setEditNote(n)
    setEditForm({ title: n.title || "", subject: n.subject || "", content: n.content || "", resources: n.resources || "" })
    setEditContent(n.content || "")
    setOcrOpen(false)
  }

  const saveEdit = async () => {
    if (!editNote) return
    await saFetch("/api/lesson-notes", {
      method: "PUT",
      body: JSON.stringify({ id: editNote.id, data: { ...editForm, content: editContent } }),
    })
    setMessage("Updated!"); setEditNote(null); setOcrOpen(false); load()
  }

  const getClassName = (id: string, cl: any[]) => cl.find((c) => c.id === id)?.name || id

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Lesson Notes</h1>
        <span className="text-xs text-zinc-500">{items.length} notes</span>
      </div>
      <div className="space-y-2">
        {loading ? <Loading /> : items.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-8 text-center text-sm text-zinc-500">No lesson notes</div>
        ) : items.map((n: any) => (
          <div key={n.id} className="flex items-start justify-between flex-wrap gap-2 rounded-lg border border-zinc-800 bg-[#12121a] p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-zinc-200 truncate">{n.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs ${n.status === "published" ? "bg-emerald-600/20 text-emerald-400" : n.status === "rejected" ? "bg-red-600/20 text-red-400" : "bg-amber-600/20 text-amber-400"}`}>
                  {n.status || "pending"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {n.subject && <>{n.subject} &middot; </>}
                {n.week ? `Week ${n.week} &middot; ` : ""}
                {n.classId && <>{getClassName(n.classId, items)} &middot; </>}
                {n.term && <>{n.term} &middot; </>}
                Creator: {n.creatorName || n.createdBy}
              </p>
              {n.content && (
                <p className="text-xs text-zinc-600 mt-1 line-clamp-1">{n.content.replace(/<[^>]+>/g, "").substring(0, 120)}...</p>
              )}
            </div>
            <div className="flex gap-1.5 shrink-0 items-center">
              <button onClick={() => openEdit(n)} className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"><Edit3 className="h-3 w-3 inline mr-0.5" /> Edit</button>
              {n.status !== "published" && <button onClick={() => approve(n.id)} className="rounded bg-emerald-600/20 px-2 py-1 text-xs text-emerald-400"><CheckCircle className="h-3 w-3 inline mr-0.5" /> Approve</button>}
              <button onClick={() => remove(n.id)} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400"><Trash2 className="h-3 w-3 inline" /></button>
            </div>
          </div>
        ))}
      </div>

      {editNote && (
        <Modal open={!!editNote} onClose={() => { setEditNote(null); setOcrOpen(false) }} title={`Edit: ${editNote.title}`}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Title</label>
              <input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Subject</label>
              <input value={editForm.subject} onChange={(e) => setEditForm((p) => ({ ...p, subject: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Resources</label>
              <input value={editForm.resources} onChange={(e) => setEditForm((p) => ({ ...p, resources: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-400">Content</label>
                <button onClick={() => setOcrOpen(!ocrOpen)} className="flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs text-primary transition-colors hover:bg-zinc-700">
                  <ScanLine className="h-3 w-3" /> OCR from Image
                </button>
              </div>
              {ocrOpen && (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 mb-3">
                  <ImageToText multiple onUseText={(text) => { setEditContent((prev) => prev + "\n" + text); setOcrOpen(false) }} />
                </div>
              )}
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={10} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 resize-y" />
            </div>
            <div className="flex gap-2">
              <button onClick={saveEdit} className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2 text-sm font-medium text-white">Save Changes</button>
              <button onClick={() => { setEditNote(null); setOcrOpen(false) }} className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ========================== FEE STRUCTURES ==========================
function FeeStructuresSection() {
  const [items, setItems] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ classId: "", type: "tuition", amount: 0, term: "", sessionId: "", dueDate: "" })

  const load = useCallback(async () => { setLoading(true); const d = await saFetch("/api/fee-structures"); setItems(Array.isArray(d) ? d : []); setLoading(false) }, [])
  useEffect(() => { load(); saFetch("/api/classes").then(setClasses); saFetch("/api/sessions").then(setSessions) }, [load])

  const handleSubmit = async () => {
    if (editId) {
      const d = await saFetch("/api/fee-structures", { method: "PUT", body: JSON.stringify({ id: editId, ...form }) })
      if (d.error) { setMessage(d.error); return }
    } else {
      const d = await saFetch("/api/fee-structures", { method: "POST", body: JSON.stringify(form) })
      if (d.error) { setMessage(d.error); return }
    }
    setMessage("Saved!"); setShowForm(false); setEditId(null); setForm({ classId: "", type: "tuition", amount: 0, term: "", sessionId: "", dueDate: "" }); load()
  }

  const remove = async (id: string) => {
    await saFetch(`/api/fee-structures?id=${id}`, { method: "DELETE" })
    setMessage("Deleted!"); load()
  }

  const openEdit = (row: any) => { setForm({ classId: row.classId, type: row.type, amount: row.amount, term: row.term || "", sessionId: row.sessionId || "", dueDate: row.dueDate?.split("T")[0] || "" }); setEditId(row.id); setShowForm(true) }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Fee Structures</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ classId: "", type: "tuition", amount: 0, term: "", sessionId: "", dueDate: "" }) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Fee</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Fee" : "Create Fee Structure"}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Class</label>
            <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Select Class</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Type" value={form.type} onChange={(v) => setForm((p) => ({ ...p, type: v }))} />
          <Input label="Amount" type="number" value={form.amount} onChange={(v) => setForm((p) => ({ ...p, amount: v }))} />
          <Input label="Term" value={form.term} onChange={(v) => setForm((p) => ({ ...p, term: v }))} />
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Session</label>
            <select value={form.sessionId} onChange={(e) => setForm((p) => ({ ...p, sessionId: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Select Session</option>
              {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Input label="Due Date" type="date" value={form.dueDate} onChange={(v) => setForm((p) => ({ ...p, dueDate: v }))} />
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">{editId ? "Update" : "Create"}</button>
        </div>
      </Modal>
      <Table headers={["className", "type", "amount", "term", "sessionName", "dueDate"]}
        rows={items.map((f: any) => ({ ...f, className: classes.find((c: any) => c.id === f.classId)?.name || "-", sessionName: sessions.find((s: any) => s.id === f.sessionId)?.name || "-", amount: `$${f.amount}`, dueDate: f.dueDate ? new Date(f.dueDate).toLocaleDateString() : "-" }))}
        onEdit={openEdit} onDelete={(r) => remove(r.id)} loading={loading} />
    </div>
  )
}

// ========================== PAYMENTS ==========================
function PaymentsSection() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const load = useCallback(async () => { setLoading(true); const d = await saFetch("/api/payments"); setItems(Array.isArray(d) ? d : []); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const confirm = async (id: string) => {
    await saFetch("/api/payments", { method: "POST", body: JSON.stringify({ action: "confirm", id, confirmedBy: "superadmin" }) })
    setMessage("Confirmed!"); load()
  }

  const reject = async (id: string) => {
    await saFetch("/api/payments", { method: "POST", body: JSON.stringify({ action: "reject", id, confirmedBy: "superadmin" }) })
    setMessage("Rejected!"); load()
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">Payments</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-400">Student</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Amount</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Method</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Reference</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Date</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-500">No payments</td></tr>
            ) : items.map((p: any, i: number) => (
              <tr key={p.id} className={`border-b border-zinc-800/50 ${i % 2 === 0 ? "bg-[#12121a]" : "bg-zinc-900/20"} hover:bg-zinc-800/30`}>
                <td className="px-4 py-3 text-zinc-300">{p.studentId}</td>
                <td className="px-4 py-3 text-zinc-300">${p.amount}</td>
                <td className="px-4 py-3 text-zinc-300">{p.method || "-"}</td>
                <td className="px-4 py-3 text-zinc-300">{p.reference || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    p.status === "confirmed" ? "bg-emerald-600/20 text-emerald-400" :
                    p.status === "rejected" ? "bg-red-600/20 text-red-400" : "bg-amber-600/20 text-amber-400"
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-zinc-300">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-3">
                  {p.status === "pending" && (
                    <div className="flex gap-1.5">
                      <button onClick={() => confirm(p.id)} className="rounded bg-emerald-600/20 px-2 py-1 text-xs text-emerald-400"><CheckCircle className="h-3 w-3 inline" /></button>
                      <button onClick={() => reject(p.id)} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400"><XCircle className="h-3 w-3 inline" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ========================== SALARY ==========================
function SalarySection() {
  const [items, setItems] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ staffId: "", amount: 0, month: "", year: new Date().getFullYear().toString() })

  const load = useCallback(async () => { setLoading(true); const [d, s] = await Promise.all([saFetch("/api/salary"), saFetch("/api/staff")]); setItems(Array.isArray(d) ? d : []); setStaff(Array.isArray(s) ? s : []); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const markPaid = async (id: string) => {
    await saFetch("/api/salary", { method: "POST", body: JSON.stringify({ action: "markPaid", id, confirmedBy: "superadmin" }) })
    setMessage("Marked as paid!"); load()
  }

  const handleSubmit = async () => {
    await saFetch("/api/salary", { method: "POST", body: JSON.stringify(form) })
    setMessage("Created!"); setShowForm(false); setForm({ staffId: "", amount: 0, month: "", year: new Date().getFullYear().toString() }); load()
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Salary Records</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Record</button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Salary Record">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Staff</label>
            <select value={form.staffId} onChange={(e) => setForm((p) => ({ ...p, staffId: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Select Staff</option>
              {staff.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <Input label="Amount" type="number" value={form.amount} onChange={(v) => setForm((p) => ({ ...p, amount: v }))} />
          <Input label="Month" value={form.month} onChange={(v) => setForm((p) => ({ ...p, month: v }))} placeholder="e.g. January" />
          <Input label="Year" value={form.year} onChange={(v) => setForm((p) => ({ ...p, year: v }))} />
          <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">Create</button>
        </div>
      </Modal>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-400">Staff</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Amount</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Month</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Year</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500">No records</td></tr>
            ) : items.map((r: any, i: number) => (
              <tr key={r.id} className={`border-b border-zinc-800/50 ${i % 2 === 0 ? "bg-[#12121a]" : "bg-zinc-900/20"} hover:bg-zinc-800/30`}>
                <td className="px-4 py-3 text-zinc-300">{staff.find((s: any) => s.id === r.staffId)?.firstName || r.staffId} {staff.find((s: any) => s.id === r.staffId)?.lastName || ""}</td>
                <td className="px-4 py-3 text-zinc-300">${r.amount}</td>
                <td className="px-4 py-3 text-zinc-300">{r.month}</td>
                <td className="px-4 py-3 text-zinc-300">{r.year}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "paid" ? "bg-emerald-600/20 text-emerald-400" : "bg-amber-600/20 text-amber-400"}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  {r.status !== "paid" && <button onClick={() => markPaid(r.id)} className="rounded bg-emerald-600/20 px-2 py-1 text-xs text-emerald-400"><DollarSign className="h-3 w-3 inline" /> Mark Paid</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ========================== ADMISSIONS ==========================
function AdmissionsSection() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const load = useCallback(async () => { setLoading(true); const d = await saFetch("/api/admissions"); setItems(Array.isArray(d) ? d : []); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const accept = async (id: string) => {
    const d = await saApi("acceptApplication", { id })
    if (d.success) { setMessage("Accepted!"); load() } else { setMessage(d.error) }
  }

  const reject = async (id: string) => {
    const d = await saApi("rejectApplication", { id })
    if (d.success) { setMessage("Rejected!"); load() } else { setMessage(d.error) }
  }

  const remove = async (id: string) => {
    await saFetch(`/api/admissions/${id}`, { method: "DELETE" })
    setMessage("Deleted!"); load()
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">Admissions</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-400">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Email</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Date</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-500">No applications</td></tr>
            ) : items.map((a: any, i: number) => (
              <tr key={a.id} className={`border-b border-zinc-800/50 ${i % 2 === 0 ? "bg-[#12121a]" : "bg-zinc-900/20"} hover:bg-zinc-800/30`}>
                <td className="px-4 py-3 text-zinc-300">{a.firstName} {a.lastName}</td>
                <td className="px-4 py-3 text-zinc-300">{a.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    a.status === "accepted" ? "bg-emerald-600/20 text-emerald-400" :
                    a.status === "rejected" ? "bg-red-600/20 text-red-400" : "bg-amber-600/20 text-amber-400"
                  }`}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-zinc-300">{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {a.status === "pending" && (
                      <>
                        <button onClick={() => accept(a.id)} className="rounded bg-emerald-600/20 px-2 py-1 text-xs text-emerald-400"><CheckCircle className="h-3 w-3 inline" /></button>
                        <button onClick={() => reject(a.id)} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400"><XCircle className="h-3 w-3 inline" /></button>
                      </>
                    )}
                    <button onClick={() => remove(a.id)} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400"><Trash2 className="h-3 w-3 inline" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ========================== ATTENDANCE ==========================
function AttendanceSection() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [classId, setClassId] = useState("")
  const [classes, setClasses] = useState<any[]>([])

  useEffect(() => { saFetch("/api/classes").then(setClasses) }, [])

  const search = useCallback(async () => {
    setLoading(true)
    let url = `/api/attendance-logs?date=${date}`
    const d = await saFetch(url)
    setRecords(Array.isArray(d) ? d : [])
    setLoading(false)
  }, [date])

  useEffect(() => { search() }, [search])

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">Attendance Records</h1>
      <div className="flex flex-wrap gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
        <button onClick={search} className="rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Search className="h-4 w-4 inline" /> Load</button>
      </div>
      <Table headers={["userId", "date", "status", "timestamp"]} rows={records} loading={loading} />
    </div>
  )
}

// ========================== DOCUMENTS ==========================
function DocumentsSection() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const load = useCallback(async () => { setLoading(true); const d = await saFetch("/api/documents"); setItems(Array.isArray(d) ? d : []); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const remove = async (id: string) => {
    await saFetch(`/api/documents/${id}`, { method: "DELETE" })
    setMessage("Deleted!"); load()
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">Documents</h1>
      <Table headers={["studentId", "type", "title", "reference", "generatedAt"]}
        rows={items.map((d: any) => ({ ...d, generatedAt: d.generatedAt ? new Date(d.generatedAt).toLocaleDateString() : "-" }))}
        onDelete={(r) => remove(r.id)} loading={loading} />
    </div>
  )
}

// ========================== ANNOUNCEMENTS ==========================
function AnnouncementsSection() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDisplay, setFilterDisplay] = useState<string>("all")
  const [filterAudience, setFilterAudience] = useState<string>("all")
  const [form, setForm] = useState({ title: "", content: "", displayType: "banner", targetAudience: "all", priority: "normal", startDate: "", endDate: "" })

  const audienceLabels: Record<string, string> = { all: "Everyone", admin: "Admin", teachers: "Teachers", parents: "Parents", students: "Students" }
  const displayLabels: Record<string, string> = { banner: "Banner", ticker: "Ticker", overlay: "Overlay" }
  const priorityColors: Record<string, string> = { high: "text-red-400 bg-red-600/10", normal: "text-blue-400 bg-blue-600/10", low: "text-zinc-400 bg-zinc-600/10" }

  const load = useCallback(async () => {
    setLoading(true)
    const d = await saApi("dashboard")
    setItems(d.data?.announcements || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const resetForm = () => { setForm({ title: "", content: "", displayType: "banner", targetAudience: "all", priority: "normal", startDate: "", endDate: "" }); setEditingId(null) }

  const openEdit = (a: any) => {
    setForm({ title: a.title, content: a.content, displayType: a.displayType || "banner", targetAudience: a.targetAudience || "all", priority: a.priority || "normal", startDate: a.startDate || "", endDate: a.endDate || "" })
    setEditingId(a.id)
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { setMessage("Title and content are required"); return }
    let d
    if (editingId) { d = await saApi("toggleAnnouncement", { id: editingId, ...form }) }
    else { d = await saApi("createAnnouncement", form) }
    if (d.success) { setMessage(editingId ? "Updated!" : "Created!"); load(); setShowForm(false); resetForm() }
    else { setMessage(d.error || "Failed") }
  }

  const toggle = async (id: string) => {
    await saApi("toggleAnnouncement", { id })
    load()
  }

  const remove = async (id: string) => {
    const d = await saApi("deleteAnnouncement", { id })
    if (d.success) { setMessage("Deleted!"); load() }
    else { setMessage(d.error || "Failed") }
  }

  const filtered = items.filter((a) => {
    if (filterStatus !== "all" && (filterStatus === "active" ? !a.active : a.active)) return false
    if (filterDisplay !== "all" && a.displayType !== filterDisplay) return false
    if (filterAudience !== "all" && a.targetAudience !== filterAudience) return false
    return true
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Announcements</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Create</button>
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm() }} title={editingId ? "Edit Announcement" : "Create Announcement"}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} />
          <Input label="Content" value={form.content} onChange={(v) => setForm((p) => ({ ...p, content: v }))} type="textarea" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Display Type</label>
              <select value={form.displayType} onChange={(e) => setForm((p) => ({ ...p, displayType: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500">
                <option value="banner">Banner</option><option value="ticker">Ticker</option><option value="overlay">Overlay</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Target Audience</label>
              <select value={form.targetAudience} onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500">
                <option value="all">Everyone</option><option value="admin">Admin</option><option value="teachers">Teachers</option><option value="parents">Parents</option><option value="students">Students</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Priority</label>
            <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" value={form.startDate} onChange={(v) => setForm((p) => ({ ...p, startDate: v }))} type="date" />
            <Input label="End Date" value={form.endDate} onChange={(v) => setForm((p) => ({ ...p, endDate: v }))} type="date" />
          </div>
          <button onClick={save} className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white">
            {editingId ? "Update" : "Create"}
          </button>
        </div>
      </Modal>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500"><Filter className="h-3.5 w-3.5" /> Filters:</div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-zinc-800 bg-[#12121a] px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-red-500">
          <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
        <select value={filterDisplay} onChange={(e) => setFilterDisplay(e.target.value)} className="rounded-lg border border-zinc-800 bg-[#12121a] px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-red-500">
          <option value="all">All Types</option><option value="banner">Banner</option><option value="ticker">Ticker</option><option value="overlay">Overlay</option>
        </select>
        <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)} className="rounded-lg border border-zinc-800 bg-[#12121a] px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-red-500">
          <option value="all">All Audiences</option><option value="admin">Admin</option><option value="teachers">Teachers</option><option value="parents">Parents</option><option value="students">Students</option>
        </select>
        <span className="ml-auto text-xs text-zinc-500">{filtered.length} of {items.length}</span>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-8 text-center text-sm text-zinc-500">No announcements match filters</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a: any) => (
            <div key={a.id} className="rounded-xl border border-zinc-800 bg-[#12121a] p-4 transition-colors hover:border-zinc-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-zinc-200">{a.title}</p>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${priorityColors[a.priority] || priorityColors.normal}`}>{a.priority || "normal"}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{displayLabels[a.displayType] || a.displayType}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{audienceLabels[a.targetAudience] || a.targetAudience || "Everyone"}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2">{a.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
                    <span>Created: {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "-"}</span>
                    {a.startDate && <span>Start: {new Date(a.startDate).toLocaleDateString()}</span>}
                    {a.endDate && <span>End: {new Date(a.endDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(a.id)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${a.active ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30" : "bg-zinc-600/20 text-zinc-400 hover:bg-zinc-600/30"}`}>
                    {a.active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                    {a.active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => openEdit(a)} className="rounded-lg bg-blue-600/20 px-2.5 py-1.5 text-xs text-blue-400 hover:bg-blue-600/30"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => remove(a.id)} className="rounded-lg bg-red-600/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-600/30"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ========================== FEEDBACK ==========================
function FeedbackSection() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [resolution, setResolution] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const d = await saFetch("/api/superadmin?action=feedback")
    setItems(Array.isArray(d) ? d : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const resolve = async (id: string) => {
    const d = await saApi("resolveFeedback", { id, resolution })
    if (d.success) { setMessage("Resolved!"); load(); setResolution(""); setActiveId(null) }
    else { setMessage(d.error) }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">Feedback Tickets</h1>
      {loading ? <Loading /> : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-8 text-center text-sm text-zinc-500">No feedback tickets</div>
      ) : items.map((t: any) => (
        <div key={t.id} className="rounded-xl border border-zinc-800 bg-[#12121a] p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-zinc-200">{t.subject || "No Subject"}</p>
              <p className="text-xs text-zinc-500">{t.from || "Anonymous"} &mdash; {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""} <span className="text-orange-400">({t.priority || "normal"})</span></p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${t.status === "pending" ? "bg-amber-600/20 text-amber-400" : "bg-blue-600/20 text-blue-400"}`}>{t.status}</span>
          </div>
          <p className="mb-3 text-xs text-zinc-400">{t.message}</p>
          {t.status !== "resolved" && (
            <div className="flex gap-2">
              <input placeholder="Resolution notes..." value={activeId === t.id ? resolution : ""}
                onChange={(e) => { setActiveId(t.id); setResolution(e.target.value) }}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500" />
              <button onClick={() => resolve(t.id)} className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-medium text-white">Resolve</button>
            </div>
          )}
          {t.resolution && <p className="mt-2 text-xs text-zinc-500">Resolution: {t.resolution}</p>}
        </div>
      ))}
    </div>
  )
}

// ========================== BANK DETAILS ==========================
function BankDetailsSection() {
  const [form, setForm] = useState({ bankName: "", accountName: "", accountNumber: "", branch: "", swiftCode: "" })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    saFetch("/api/school/bank").then((d) => { if (d && d.bankName !== undefined) setForm(d); setLoading(false) })
  }, [])

  const save = async () => {
    const d = await saFetch("/api/school/bank", { method: "PUT", body: JSON.stringify(form) })
    if (d.error) { setMessage(d.error); return }
    setMessage("Bank details saved!")
  }

  if (loading) return <Loading />
  return (
    <div className="space-y-6 max-w-2xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">Bank Details</h1>
      <div className="rounded-xl border border-zinc-800 bg-[#12121a] p-6 space-y-4">
        <Input label="Bank Name" value={form.bankName} onChange={(v) => setForm((p) => ({ ...p, bankName: v }))} />
        <Input label="Account Name" value={form.accountName} onChange={(v) => setForm((p) => ({ ...p, accountName: v }))} />
        <Input label="Account Number" value={form.accountNumber} onChange={(v) => setForm((p) => ({ ...p, accountNumber: v }))} />
        <Input label="Branch" value={form.branch} onChange={(v) => setForm((p) => ({ ...p, branch: v }))} />
        <Input label="Swift Code" value={form.swiftCode} onChange={(v) => setForm((p) => ({ ...p, swiftCode: v }))} />
        <button onClick={save} className="rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-6 py-2.5 text-sm font-semibold text-white">Save Bank Details</button>
      </div>
    </div>
  )
}

// ========================== DATA EXPORT ==========================
function DataExportSection() {
  const [message, setMessage] = useState("")

  const fetchAll = async (url: string) => { const d = await saFetch(url); return Array.isArray(d) ? d : [] }

  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const csv = [headers.join(","), ...data.map((row) => headers.map((h) => {
      const v = row[h]
      const s = v === null || v === undefined ? "" : String(v)
      return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    setMessage(`Downloaded ${filename}.csv`)
  }

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    setMessage(`Downloaded ${filename}.json`)
  }

  const exportAll = async () => {
    setMessage("Exporting all data...")
    const [staff, students, classes, subjects, questions, exams, payments, fees, salary, schemes, notes, admissions, documents, timetable, sessions, terms] = await Promise.all([
      fetchAll("/api/staff"), fetchAll("/api/students"), fetchAll("/api/classes"),
      fetchAll("/api/subjects"), fetchAll("/api/question-bank"), fetchAll("/api/exams"),
      fetchAll("/api/payments"), fetchAll("/api/fee-structures"), fetchAll("/api/salary"),
      fetchAll("/api/scheme-of-work"), fetchAll("/api/lesson-notes"), fetchAll("/api/admissions"),
      fetchAll("/api/documents"), fetchAll("/api/timetable"), fetchAll("/api/sessions"), fetchAll("/api/terms"),
    ])
    downloadJSON({ staff, students, classes, subjects, questions, exams, payments, feeStructures: fees, salary: salary, schemeOfWork: schemes, lessonNotes: notes, admissions, documents, timetable, sessions, terms }, "school-export-all")
  }

  const exports = [
    { label: "Staff", url: "/api/staff", file: "staff" },
    { label: "Students", url: "/api/students", file: "students" },
    { label: "Classes", url: "/api/classes", file: "classes" },
    { label: "Subjects", url: "/api/subjects", file: "subjects" },
    { label: "Questions", url: "/api/question-bank", file: "questions" },
    { label: "Exams", url: "/api/exams", file: "exams" },
    { label: "Payments", url: "/api/payments", file: "payments" },
    { label: "Fee Structures", url: "/api/fee-structures", file: "fee-structures" },
    { label: "Salary", url: "/api/salary", file: "salary" },
    { label: "Admissions", url: "/api/admissions", file: "admissions" },
    { label: "Sessions", url: "/api/sessions", file: "sessions" },
    { label: "Terms", url: "/api/terms", file: "terms" },
    { label: "Timetable", url: "/api/timetable", file: "timetable" },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <Toast message={message} type="success" onClose={() => setMessage("")} />
      <h1 className="text-xl font-bold text-white">Data Export</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {exports.map((ex) => (
          <button key={ex.file} onClick={async () => { const d = await fetchAll(ex.url); downloadCSV(d, ex.file) }}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#12121a] p-4 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors">
            <Download className="h-4 w-4 text-red-400" /> {ex.label}
          </button>
        ))}
      </div>
      <button onClick={exportAll}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-800 p-4 text-sm font-semibold text-white hover:opacity-90">
        <Download className="h-5 w-5" /> Export All Data as JSON
      </button>
    </div>
  )
}
