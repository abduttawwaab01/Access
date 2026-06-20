"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GraduationCap, Shield, Users, UserCheck, BookOpen } from "lucide-react"
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
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleLogin = async (role: string, route: string) => {
    setLoading(role)
    setError("")
    const res = await signIn("credentials", { role, redirect: false })
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Access denied" : res.error)
      setLoading(null)
    } else {
      router.push(route)
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
        <h1 className="text-2xl font-bold">Welcome to Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose your portal to get started</p>
      </motion.div>

      <div className="flex w-full max-w-xs flex-col gap-3">
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
              disabled={loading !== null}
              onClick={() => handleLogin(role.key, role.route)}
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
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center text-sm text-red-500">
          {error}
        </motion.p>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-4 text-center text-xs text-muted-foreground/50"
      >
        Demo mode — click any role to explore
      </motion.p>
    </div>
  )
}
