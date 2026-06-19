"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    // TODO: Send reset link via API
  }

  return (
    <div className="relative flex w-full max-w-sm flex-col px-6">
      <div className="floating-orbs absolute inset-0 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Link href="/login" className="mb-6 inline-flex">
          <div className="animated-gradient mb-4 inline-flex rounded-xl p-3">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold">{sent ? "Check your email" : "Reset password"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sent ? "We sent a reset link to your email" : "Enter your email and we'll send you a reset link"}
        </p>
      </motion.div>

      {sent ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="glass-card rounded-xl p-6 mb-6">
            <p className="text-sm text-muted-foreground">
              If an account with <strong className="text-foreground">{email}</strong> exists, you'll receive a password reset link shortly.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@school.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" required />
          </div>
          <Button type="submit" size="lg" className="animated-gradient mt-2 w-full border-0 text-white shadow-lg shadow-primary/25">
            Send Reset Link
          </Button>
          <Link href="/login">
            <Button variant="ghost" type="button" className="w-full text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </motion.form>
      )}
    </div>
  )
}
