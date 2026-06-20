"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { Bell, Menu, Search, Moon, Sun, X } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import { useMobile } from "@/hooks/useMobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Sidebar } from "./Sidebar"
import type { NavItem } from "@/types"

interface TopHeaderProps {
  title?: string
  navItems: NavItem[]
  user?: { name: string; email: string; image?: string; role: string }
  schoolName?: string
}

export function TopHeader({ title, navItems, user, schoolName }: TopHeaderProps) {
  const { isDark, toggleTheme } = useTheme()
  const { isMobile } = useMobile()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-6">
        {isMobile && (
          <Sheet>
            <SheetTrigger className="flex items-center justify-center shrink-0">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <Sidebar items={navItems} collapsed={false} onToggle={() => {}} user={user} schoolName={schoolName} />
            </SheetContent>
          </Sheet>
        )}

        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title || "Dashboard"}</h1>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" className="text-muted-foreground relative" onClick={() => router.push("/notifications")}>
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
              3
            </span>
          </Button>

          <Avatar className="h-8 w-8 cursor-pointer ml-1" onClick={() => router.push(`/${user?.role}/profile`)}>
            <AvatarImage src={user?.image} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {user?.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, teachers, classes..."
              className="h-12 flex-1"
              autoFocus
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
