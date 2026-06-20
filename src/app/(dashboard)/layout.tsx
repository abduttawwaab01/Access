"use client"

import { AppShell } from "@/components/layout/AppShell"
import type { NavItem } from "@/types"

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Sessions", href: "/admin/sessions", icon: "Calendar" },
  { label: "Classes", href: "/admin/classes", icon: "BookOpen" },
  { label: "Subjects", href: "/admin/subjects", icon: "BookOpen" },
  { label: "Students", href: "/admin/students", icon: "Users" },
  { label: "Teachers", href: "/admin/teachers", icon: "GraduationCap" },
  { label: "CBT Engine", href: "/admin/cbt/exams", icon: "ClipboardCheck" },
  { label: "Attendance", href: "/admin/attendance", icon: "Calendar" },
  { label: "Fees", href: "/admin/fees", icon: "CreditCard" },
  { label: "Salary", href: "/admin/salary", icon: "Wallet" },
  { label: "Admissions", href: "/admin/admissions", icon: "ClipboardCheck" },
  { label: "Feedback", href: "/admin/feedback", icon: "MessageSquare" },
  { label: "Documents", href: "/admin/documents", icon: "FileText" },
  { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { label: "Reports", href: "/admin/reports", icon: "FileText" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
]

const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/teacher", icon: "LayoutDashboard" },
  { label: "Lesson Notes", href: "/teacher/lesson-notes", icon: "FileText" },
  { label: "Assignments", href: "/teacher/assignments", icon: "ClipboardCheck" },
  { label: "Timetable", href: "/teacher/timetable", icon: "Calendar" },
  { label: "Communication", href: "/teacher/communication", icon: "Bell" },
  { label: "Classes", href: "/teacher/classes", icon: "BookOpen" },
  { label: "Attendance", href: "/teacher/attendance", icon: "Calendar" },
  { label: "Analytics", href: "/teacher/analytics", icon: "BarChart3" },
  { label: "CBT Engine", href: "/teacher/cbt/exams", icon: "ClipboardCheck" },
  { label: "Salary", href: "/teacher/salary", icon: "Wallet" },
]

const parentNav: NavItem[] = [
  { label: "Dashboard", href: "/parent", icon: "LayoutDashboard" },
  { label: "Results", href: "/parent/results", icon: "BarChart3" },
  { label: "Fees", href: "/parent/fees", icon: "CreditCard" },
  { label: "Attendance", href: "/parent/attendance", icon: "Calendar" },
  { label: "Timetable", href: "/parent/timetable", icon: "BookOpen" },
  { label: "Notifications", href: "/parent/notifications", icon: "Bell" },
  { label: "Documents", href: "/parent/documents", icon: "FileText" },
]

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: "LayoutDashboard" },
  { label: "Results", href: "/student/results", icon: "BarChart3" },
  { label: "Fees", href: "/student/fees", icon: "CreditCard" },
  { label: "Attendance", href: "/student/attendance", icon: "Calendar" },
  { label: "Timetable", href: "/student/timetable", icon: "BookOpen" },
  { label: "My Exams", href: "/student/cbt", icon: "ClipboardCheck" },
  { label: "Report Card", href: "/student/report-card", icon: "FileText" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = "student"

  const navMap: Record<string, NavItem[]> = { admin: adminNav, teacher: teacherNav, parent: parentNav, student: studentNav }
  const navItems = navMap[role] || adminNav

  return (
    <AppShell
      title="Dashboard"
      navItems={navItems}
      user={{ id: "1", name: "Alice Johnson", email: "alice@school.com", role }}
      schoolName="Access School"
      role={role as "admin" | "teacher" | "parent" | "student"}
    >
      {children}
    </AppShell>
  )
}
