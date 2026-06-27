"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Shield, LayoutDashboard, Settings, BookOpen, Calendar, Users,
  GraduationCap, HelpCircle, ClipboardCheck, FileText, CreditCard,
  Wallet, Building2, Download, Megaphone, MessageSquare, ScanLine, Bot,
  AlertTriangle, Award
} from "lucide-react"

interface NavItem { id: string; icon: any; label: string }
interface NavGroup { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  { label: "Overview", items: [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "school-settings", icon: Settings, label: "School Settings" },
    { id: "ai-assistant", icon: Bot, label: "AI Assistant" },
  ]},
  { label: "Academic Management", items: [
    { id: "classes", icon: BookOpen, label: "Classes" },
    { id: "subjects", icon: BookOpen, label: "Subjects" },
    { id: "sessions", icon: Calendar, label: "Sessions" },
    { id: "terms", icon: Calendar, label: "Terms" },
    { id: "timetable", icon: Calendar, label: "Timetable" },
  ]},
  { label: "People", items: [
    { id: "staff", icon: Users, label: "Staff" },
    { id: "teachers", icon: GraduationCap, label: "Teachers" },
    { id: "students", icon: Users, label: "Students" },
    { id: "parents", icon: Users, label: "Parents" },
  ]},
  { label: "Content", items: [
    { id: "question-bank", icon: HelpCircle, label: "Question Bank" },
    { id: "exams", icon: ClipboardCheck, label: "Exams" },
    { id: "scheme-of-work", icon: BookOpen, label: "Scheme of Work" },
    { id: "lesson-notes", icon: FileText, label: "Lesson Notes" },
    { id: "ocr-tool", icon: ScanLine, label: "OCR Tool" },
  ]},
  { label: "Finance", items: [
    { id: "fee-structures", icon: CreditCard, label: "Fee Structures" },
    { id: "payments", icon: Wallet, label: "Payments" },
    { id: "salary", icon: Wallet, label: "Salary" },
  ]},
  { label: "Operations", items: [
    { id: "admissions", icon: ClipboardCheck, label: "Admissions" },
    { id: "attendance", icon: Calendar, label: "Attendance" },
    { id: "documents", icon: FileText, label: "Documents" },
    { id: "communication", icon: MessageSquare, label: "Communication" },
    { id: "certificates", icon: Award, label: "Certificate Generator" },
    { id: "announcements", icon: Megaphone, label: "Announcements" },
    { id: "announcement-reviews", icon: MessageSquare, label: "Announcement Reviews" },
  ]},
  { label: "System", items: [
    { id: "bank-details", icon: Building2, label: "Bank Details" },
    { id: "data-export", icon: Download, label: "Data Export" },
  ]},
  { label: "Danger Zone", items: [
    { id: "danger-zone", icon: AlertTriangle, label: "Danger Zone" },
  ]},
]

export const SuperAdminContext = createContext<{
  activeSection: string
  setActiveSection: (s: string) => void
}>({ activeSection: "dashboard", setActiveSection: () => {} })

export const useSuperAdmin = () => useContext(SuperAdminContext)

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("sa_token")
    if (!token && pathname !== "/superadmin/login") {
      router.push("/superadmin/login")
      return
    }
    setMounted(true)
  }, [pathname, router])

  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    if (hash && navGroups.some(g => g.items.some(i => i.id === hash))) {
      setActiveSection(hash)
    }
  }, [])

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash && navGroups.some(g => g.items.some(i => i.id === hash))) {
        setActiveSection(hash)
      }
    }
    window.addEventListener("hashchange", handler)
    return () => window.removeEventListener("hashchange", handler)
  }, [])

  const navigate = (id: string) => {
    setActiveSection(id)
    window.location.hash = id
    setSidebarOpen(false)
  }

  if (pathname === "/superadmin/login") return <>{children}</>

  if (!mounted) return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0f]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-red-600" />
    </div>
  )

  return (
    <SuperAdminContext.Provider value={{ activeSection, setActiveSection: navigate }}>
      <div className="flex min-h-dvh bg-[#0a0a0f]">
        <button
          id="superadmin-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-[#12121a] border border-zinc-800 text-zinc-400 lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>

        <aside className={`fixed inset-y-0 left-0 z-40 w-[240px] flex-shrink-0 transform border-r border-zinc-800 bg-[#12121a] transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-800">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Super Admin</h1>
                <p className="text-[10px] text-zinc-500">Control Panel</p>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
              {navGroups.map((group) => (
                <div key={group.label} className="mb-5">
                  <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{group.label}</p>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-red-600/20 to-red-800/10 text-red-400 shadow-sm"
                            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                        }`}
                      >
                        <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-red-400" : "text-zinc-500"}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </nav>
            <div className="border-t border-zinc-800 p-4">
              <button
                onClick={() => { localStorage.removeItem("sa_token"); router.push("/superadmin/login") }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="flex-1 overflow-auto lg:ml-0">
          {children}
        </div>
      </div>
    </SuperAdminContext.Provider>
  )
}
