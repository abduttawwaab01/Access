"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GraduationCap, Loader2, Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error)
      setLoading(false)
    } else {
      const sessionRes = await fetch("/api/auth/session")
      const session = await sessionRes.json()
      const role = (session.user as any)?.role
      const routes: Record<string, string> = { admin: "/admin", teacher: "/teacher", student: "/student", parent: "/parent" }
      router.push(routes[role] || "/admin")
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="floating-orbs absolute inset-0 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="w-full max-w-xs"
      >
        <div className="glass-card rounded-xl border-0 p-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-red-500">
                {error}
              </motion.p>
            )}

            <Button type="submit" disabled={loading} className="animated-gradient mt-2 h-11 w-full border-0 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
        <div className="mt-4 text-center">
          <Button variant="link" className="text-sm text-muted-foreground" onClick={() => router.push("/")}>
            ← Back to Homepage
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
