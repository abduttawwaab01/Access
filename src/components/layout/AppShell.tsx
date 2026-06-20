"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"
import { TopHeader } from "./TopHeader"
import { useMobile } from "@/hooks/useMobile"
import type { NavItem, User } from "@/types"

interface AppShellProps {
  children: React.ReactNode
  title?: string
  navItems: NavItem[]
  bottomNavItems?: NavItem[]
  user?: User
  schoolName?: string
  role: "admin" | "teacher" | "parent" | "student"
}

export function AppShell({ children, title, navItems, bottomNavItems, user, schoolName, role }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isMobile } = useMobile()

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={navItems}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        schoolName={schoolName}
      />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          "md:ml-64",
          sidebarCollapsed && "md:ml-[72px]"
        )}
      >
        <TopHeader
          title={title}
          navItems={navItems}
          user={user}
          schoolName={schoolName}
        />

        <main className={cn("flex-1", isMobile ? "pb-20" : "pb-6")}>
          <div className="animate-in">{children}</div>
        </main>
      </div>

      {isMobile && <BottomNav items={bottomNavItems || navItems} />}
    </div>
  )
}
