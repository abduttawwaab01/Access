"use client"

import { useState } from "react"
import Link from "next/link"
import { X, Menu } from "lucide-react"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 md:px-6 py-4">
          <Link href="/" className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-lg font-bold text-transparent">Access</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">Home</Link>
            <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Link href="/admissions" className="text-muted-foreground transition-colors hover:text-foreground">Admissions</Link>
            <Link href="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Sign In</Link>
          </nav>
          <button onClick={() => setMenuOpen(true)} className="flex md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
            <div className="relative ml-auto flex h-full w-64 flex-col bg-background p-6 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-lg font-bold text-transparent">Access</span>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-4">
                <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                <Link href="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
                <Link href="/admissions" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Admissions</Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground text-center">Sign In</Link>
              </nav>
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-border/40 px-4 md:px-6 py-8 text-center text-sm text-muted-foreground/50">
        &copy; {new Date().getFullYear()} Access School Academy. All rights reserved.
      </footer>
    </div>
  )
}
