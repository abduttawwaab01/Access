"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GraduationCap, Shield, Users, UserCheck, BookOpen, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const roles = [
  { key: "admin", label: "Admin", icon: Shield, desc: "Full school management", route: "/admin" },
  { key: "teacher", label: "Teacher", icon: BookOpen, desc: "Lessons, exams, grading", route: "/teacher" },
  { key: "parent", label: "Parent", icon: Users, desc: "Monitor your child", route: "/parent" },
  { key: "student", label: "Student", icon: UserCheck, desc: "Take exams, view results", route: "/student" },
]

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    setError("")
    setEmail("")
    setPassword("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      role: selectedRole,
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error)
      setLoading(false)
    } else {
      const route = roles.find((r) => r.key === selectedRole)?.route || "/admin"
      router.push(route)
    }
  }

  const selectedRoleData = roles.find((r) => r.key === selectedRole)

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
        <h1 className="text-2xl font-bold">Welcome to Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your portal</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="roles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex w-full max-w-xs flex-col gap-3"
          >
            {roles.map((role, i) => (
              <motion.div
                key={role.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleRoleSelect(role.key)}
                  className="glass-card flex h-auto w-full items-center gap-4 border-0 p-4 text-left transition-all hover:scale-[1.02]"
                >
                  <div className="animated-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <role.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{role.label}</div>
                    <div className="text-xs text-muted-foreground">{role.desc}</div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-xs"
          >
            <div className="glass-card rounded-xl border-0 p-6">
              <div className="mb-4 text-center">
                <div className="animated-gradient mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                  {selectedRoleData && <selectedRoleData.icon className="h-6 w-6 text-white" />}
                </div>
                <h2 className="text-lg font-semibold">{selectedRoleData?.label} Login</h2>
                <p className="text-xs text-muted-foreground">Enter your credentials</p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="you@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 pr-10"
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
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-red-500"
                  >
                    {error}
                  </motion.p>
                )}

                <Button type="submit" disabled={loading} className="animated-gradient mt-2 w-full border-0 text-white">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <button
                onClick={() => setSelectedRole(null)}
                className="mt-4 flex w-full items-center justify-center gap-1 text-center text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground/80"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to role selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
