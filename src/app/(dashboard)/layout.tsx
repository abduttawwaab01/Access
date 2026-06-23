"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import type { NavItem } from "@/types"

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Sessions", href: "/admin/sessions", icon: "Calendar" },
  { label: "Classes", href: "/admin/classes", icon: "BookOpen" },
  { label: "Subjects", href: "/admin/subjects", icon: "BookOpen" },
  { label: "Students", href: "/admin/students", icon: "Users" },
  { label: "Parents", href: "/admin/parents", icon: "Users" },
  { label: "Teachers", href: "/admin/teachers", icon: "GraduationCap" },
  { label: "AI Assistant", href: "/admin/ai-assistant", icon: "BotMessageSquare" },
  { label: "CBT Engine", href: "/admin/cbt/exams", icon: "ClipboardCheck" },
  { label: "Question Bank", href: "/admin/question-bank", icon: "HelpCircle" },
  { label: "Scheme of Work", href: "/admin/scheme-of-work", icon: "BookOpen" },
  { label: "Lesson Notes", href: "/admin/lesson-notes", icon: "FileText" },
  { label: "Deep Analysis", href: "/admin/analytics/deep-analysis", icon: "BarChart3" },
  { label: "Attendance", href: "/admin/attendance", icon: "Calendar" },
  { label: "Fees", href: "/admin/fees", icon: "CreditCard" },
  { label: "Salary", href: "/admin/salary", icon: "Wallet" },
  { label: "Admissions", href: "/admin/admissions", icon: "ClipboardCheck" },
  { label: "ID Cards", href: "/admin/id-cards", icon: "CreditCard" },
  { label: "Feedback", href: "/admin/feedback", icon: "MessageSquare" },
  { label: "Documents", href: "/admin/documents", icon: "FileText" },
  { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { label: "Announcements", href: "/admin/announcements", icon: "Megaphone" },
  { label: "Events", href: "/admin/events", icon: "Calendar" },
  { label: "Timetable", href: "/admin/timetable", icon: "Calendar" },
  { label: "Reports", href: "/admin/reports", icon: "FileText" },
  { label: "Results", href: "/admin/results", icon: "BarChart3" },
  { label: "Report Cards", href: "/admin/report-cards", icon: "Award" },
  { label: "Weekly Reports", href: "/admin/weekly-reports", icon: "ClipboardList" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
  { label: "Profile", href: "/admin/profile", icon: "User" },
]

const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/teacher", icon: "LayoutDashboard" },
  { label: "AI Assistant", href: "/teacher/ai-assistant", icon: "BotMessageSquare" },
  { label: "Lesson Notes", href: "/teacher/lesson-notes", icon: "FileText" },
  { label: "Scheme of Work", href: "/teacher/scheme-of-work", icon: "BookOpen" },
  { label: "Assignments", href: "/teacher/assignments", icon: "ClipboardCheck" },
  { label: "Timetable", href: "/teacher/timetable", icon: "Calendar" },
  { label: "Communication", href: "/teacher/communication", icon: "Bell" },
  { label: "Classes", href: "/teacher/classes", icon: "BookOpen" },
  { label: "Attendance", href: "/teacher/attendance", icon: "Calendar" },
  { label: "Staff Check-In", href: "/teacher/staff-attendance", icon: "QrCode" },
  { label: "Analytics", href: "/teacher/analytics", icon: "BarChart3" },
  { label: "Weekly Reports", href: "/teacher/weekly-reports", icon: "ClipboardList" },
  { label: "CBT Engine", href: "/teacher/cbt/exams", icon: "ClipboardCheck" },
  { label: "Question Bank", href: "/teacher/question-bank", icon: "HelpCircle" },
  { label: "Results", href: "/teacher/results", icon: "BarChart3" },
  { label: "Salary", href: "/teacher/salary", icon: "Wallet" },
  { label: "Profile", href: "/teacher/profile", icon: "User" },
]

const parentNav: NavItem[] = [
  { label: "Dashboard", href: "/parent", icon: "LayoutDashboard" },
  { label: "My Children", href: "/parent/children", icon: "Users" },
  { label: "Analytics", href: "/parent/analytics", icon: "BarChart3" },
  { label: "Weekly Reports", href: "/parent/weekly-reports", icon: "ClipboardList" },
  { label: "Results", href: "/parent/results", icon: "BarChart3" },
  { label: "Report Card", href: "/parent/report-card", icon: "FileText" },
  { label: "Lesson Notes", href: "/parent/lesson-notes", icon: "BookOpen" },
  { label: "Fees", href: "/parent/fees", icon: "CreditCard" },
  { label: "Attendance", href: "/parent/attendance", icon: "Calendar" },
  { label: "Timetable", href: "/parent/timetable", icon: "BookOpen" },
  { label: "Communication", href: "/parent/communication", icon: "Bell" },
  { label: "Documents", href: "/parent/documents", icon: "FileText" },
  { label: "Settings", href: "/parent/settings", icon: "Settings" },
  { label: "Profile", href: "/parent/profile", icon: "User" },
]

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: "LayoutDashboard" },
  { label: "Analytics", href: "/student/analytics", icon: "BarChart3" },
  { label: "Results", href: "/student/results", icon: "BarChart3" },
  { label: "Fees", href: "/student/fees", icon: "CreditCard" },
  { label: "Attendance", href: "/student/attendance", icon: "Calendar" },
  { label: "Timetable", href: "/student/timetable", icon: "BookOpen" },
  { label: "Lesson Notes", href: "/student/lesson-notes", icon: "FileText" },
  { label: "My Exams", href: "/student/cbt", icon: "ClipboardCheck" },
  { label: "Report Card", href: "/student/report-card", icon: "FileText" },
  { label: "Profile", href: "/student/profile", icon: "User" },
]

const adminBottomNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Students", href: "/admin/students", icon: "Users" },
  { label: "Results", href: "/admin/results", icon: "BarChart3" },
  { label: "AI Assistant", href: "/admin/ai-assistant", icon: "BotMessageSquare" },
  { label: "Reports", href: "/admin/weekly-reports", icon: "ClipboardList" },
  { label: "Fees", href: "/admin/fees", icon: "CreditCard" },
  { label: "Profile", href: "/admin/profile", icon: "User" },
]

const teacherBottomNav: NavItem[] = [
  { label: "Dashboard", href: "/teacher", icon: "LayoutDashboard" },
  { label: "Results", href: "/teacher/results", icon: "BarChart3" },
  { label: "AI Assistant", href: "/teacher/ai-assistant", icon: "BotMessageSquare" },
  { label: "Classes", href: "/teacher/classes", icon: "BookOpen" },
  { label: "Attendance", href: "/teacher/attendance", icon: "Calendar" },
  { label: "Profile", href: "/teacher/profile", icon: "User" },
]

const studentBottomNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: "LayoutDashboard" },
  { label: "Results", href: "/student/results", icon: "BarChart3" },
  { label: "Fees", href: "/student/fees", icon: "CreditCard" },
  { label: "Lesson Notes", href: "/student/lesson-notes", icon: "FileText" },
  { label: "My Exams", href: "/student/cbt", icon: "ClipboardCheck" },
  { label: "Profile", href: "/student/profile", icon: "User" },
]

const parentBottomNav: NavItem[] = [
  { label: "Dashboard", href: "/parent", icon: "LayoutDashboard" },
  { label: "Children", href: "/parent/children", icon: "Users" },
  { label: "Weekly Reports", href: "/parent/weekly-reports", icon: "ClipboardList" },
  { label: "Results", href: "/parent/results", icon: "BarChart3" },
  { label: "Profile", href: "/parent/profile", icon: "User" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading" || status === "unauthenticated") {
    return null
  }

  const role = (session?.user as any)?.role || "student"
  const navMap: Record<string, NavItem[]> = { admin: adminNav, teacher: teacherNav, parent: parentNav, student: studentNav }
  const bottomNavMap: Record<string, NavItem[]> = { admin: adminBottomNav, teacher: teacherBottomNav, parent: parentBottomNav, student: studentBottomNav }
  const navItems = navMap[role] || adminNav
  const bottomNavItems = bottomNavMap[role] || adminBottomNav

  return (
    <AppShell
      title="Dashboard"
      navItems={navItems}
      bottomNavItems={bottomNavItems}
      user={{ id: (session?.user as any)?.id || "", name: session?.user?.name || "", email: session?.user?.email || "", role }}
      schoolName="Access School"
      role={role as "admin" | "teacher" | "parent" | "student"}
    >
      {children}
      <div className="mt-8 border-t border-border/40 px-4 py-3 text-center text-[10px] text-muted-foreground/50">
        Built by Skoolar — Odebunmi Tawwab A
      </div>
    </AppShell>
  )
}
