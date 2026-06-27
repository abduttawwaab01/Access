"use client"

import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Bell,
  UserCircle,
  User,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  BarChart3,
  FileText,
  Settings,
  CreditCard,
  Calendar,
  ChevronLeft,
  LogOut,
  HelpCircle,
  Award,
  BotMessageSquare,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  GraduationCap,
  Bell,
  UserCircle,
  User,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  BarChart3,
  FileText,
  Settings,
  CreditCard,
  Calendar,
  HelpCircle,
  Award,
  BotMessageSquare,
}

interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}

interface SidebarProps {
  items: NavItem[]
  collapsed: boolean
  onToggle: () => void
  user?: { name: string; email: string; image?: string; role: string }
  schoolName?: string
  className?: string
  embedded?: boolean
  onClose?: () => void
}

export function Sidebar({ items, collapsed, onToggle, user, schoolName, className, embedded, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        embedded
          ? "flex h-full flex-col bg-card"
          : "fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-border/50 bg-card transition-all duration-300 md:flex",
        collapsed ? "w-[72px]" : "w-64",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              A
            </div>
            <span className="text-lg font-bold">{schoolName || "Access"}</span>
          </div>
        )}
        {collapsed && (
          <div className="flex w-full justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              A
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn("hidden lg:flex", collapsed && "mx-auto")}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
          {embedded && onClose && (
            <Button variant="ghost" size="icon-sm" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className={cn("flex flex-col gap-1", collapsed && "items-center")}>
          {items.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard
            const currentParts = pathname.replace(/\/+$/, "").split("/").filter(Boolean)
            const navParts = item.href.replace(/\/+$/, "").split("/").filter(Boolean)
            const isRoot = navParts.length <= 1
            const isActive = isRoot
              ? currentParts.length === navParts.length && currentParts.every((part, i) => part === navParts[i])
              : currentParts.length >= navParts.length && currentParts.slice(0, navParts.length).every((part, i) => part === navParts[i])

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <div className="relative">
                  {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                  {item.badge && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && (
                  <span className="absolute right-2 h-2 w-2 rounded-full bg-primary" />
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 hidden rounded-lg bg-popover px-2 py-1 text-xs shadow-lg group-hover:block">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-border/50 p-2">
        {collapsed ? (
          <div className="flex justify-center">
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src={user?.image} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.image} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.name || "User"}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-danger" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
