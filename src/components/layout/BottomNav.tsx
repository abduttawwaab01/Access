"use client"

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
  HelpCircle,
  Award,
  BotMessageSquare,
  MessageSquare,
  Wallet,
  Download,
  Star,
  PenLine,
  QrCode,
  type LucideIcon,
} from "lucide-react"

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
  MessageSquare,
  Wallet,
  Download,
  Star,
  PenLine,
  QrCode,
}

interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}

interface BottomNavProps {
  items: NavItem[]
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-card rounded-t-2xl border-t border-border/50 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
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
                  "relative flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "relative rounded-xl p-1.5 transition-all duration-300",
                    isActive && "bg-primary/10"
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  {item.badge && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {isActive && (
                  <span className="absolute -top-0.5 h-1 w-6 rounded-full bg-primary transition-all" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
