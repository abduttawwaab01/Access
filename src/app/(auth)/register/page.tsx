"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    schoolName: "",
    adminName: "",
    email: "",
    phone: "",
    password: "",
  })

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="relative flex w-full max-w-sm flex-col px-6">
      <div className="floating-orbs absolute inset-0 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Link href="/" className="mb-6 inline-flex">
          <div className="animated-gradient mb-4 inline-flex rounded-xl p-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold">Create your school</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1 ? "Tell us about your school" : "Set up your admin account"}
        </p>
      </motion.div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <div className={`h-2 w-8 rounded-full transition-colors ${step === 1 ? "bg-primary" : "bg-primary/30"}`} />
        <div className={`h-2 w-8 rounded-full transition-colors ${step === 2 ? "bg-primary" : "bg-primary/30"}`} />
      </div>

      <motion.form
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={(e) => {
          e.preventDefault()
          if (step === 1) setStep(2)
          else {
            // TODO: Register school via API
          }
        }}
        className="flex flex-col gap-4"
      >
        {step === 1 ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input id="schoolName" placeholder="e.g. Springdale High" value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} className="h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 234 567 890" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-12" required />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="adminName">Your Full Name</Label>
              <Input id="adminName" placeholder="e.g. John Doe" value={form.adminName} onChange={(e) => update("adminName", e.target.value)} className="h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="admin@school.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a strong password" value={form.password} onChange={(e) => update("password", e.target.value)} className="h-12" required />
            </div>
          </>
        )}

        {step === 2 && (
          <Button type="button" variant="ghost" onClick={() => setStep(1)} className="self-start -ml-2 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        <Button type="submit" size="lg" className="animated-gradient mt-2 w-full border-0 text-white shadow-lg shadow-primary/25">
          {step === 1 ? "Continue" : "Create School"}
        </Button>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 text-center text-sm text-muted-foreground"
      >
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Sign In
        </Link>
      </motion.p>
    </div>
  )
}
