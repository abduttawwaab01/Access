import Link from "next/link"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-lg font-bold text-transparent">Access</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">Home</Link>
            <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Link href="/admissions" className="text-muted-foreground transition-colors hover:text-foreground">Admissions</Link>
            <Link href="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Sign In</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border/40 px-6 py-8 text-center text-sm text-muted-foreground/50">
        &copy; {new Date().getFullYear()} Access School Academy. All rights reserved.
      </footer>
    </div>
  )
}
