"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { GraduationCap, CheckCircle, Loader2, ChevronRight, HelpCircle } from "lucide-react"

const nigerianClasses = [
  { value: "Nursery 1", label: "Nursery 1", isSenior: false },
  { value: "Nursery 2", label: "Nursery 2", isSenior: false },
  { value: "Primary 1", label: "Primary 1", isSenior: false },
  { value: "Primary 2", label: "Primary 2", isSenior: false },
  { value: "Primary 3", label: "Primary 3", isSenior: false },
  { value: "Primary 4", label: "Primary 4", isSenior: false },
  { value: "Primary 5", label: "Primary 5", isSenior: false },
  { value: "Primary 6", label: "Primary 6", isSenior: false },
  { value: "JSS 1", label: "JSS 1 (Basic 7)", isSenior: false },
  { value: "JSS 2", label: "JSS 2 (Basic 8)", isSenior: false },
  { value: "JSS 3", label: "JSS 3 (Basic 9)", isSenior: false },
  { value: "SS 1", label: "SS 1", isSenior: true },
  { value: "SS 2", label: "SS 2", isSenior: true },
  { value: "SS 3", label: "SS 3", isSenior: true },
]

const departments = ["Science", "Arts", "Commerce", "Technology"]

export default function ApplyPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
    gender: "", classApplyingFor: "", department: "", previousSchool: "", address: "",
    parentName: "", parentPhone: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const selectedClass = nigerianClasses.find((c) => c.value === form.classApplyingFor)

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Submission failed")
      setSubmitted(true)
      toast.success("Application submitted successfully!")
    } catch {
      setError("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="relative flex min-h-[70dvh] items-center justify-center px-6">
        <div className="floating-orbs absolute inset-0 -z-10" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
          </motion.div>
          <h1 className="mb-2 text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Application Submitted!
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you for applying. Our admissions team will review your application and contact you shortly.
          </p>
          <Button className="animated-gradient mt-6 border-0 text-white shadow-lg shadow-primary/25" onClick={() => (window.location.href = "/")}>
            Back to Homepage <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>
        <div className="fixed bottom-0 left-0 right-0 border-t border-border/40 px-4 py-3 text-center text-[10px] text-muted-foreground/50 bg-background/80 backdrop-blur-sm">
          Built by Skoolar &mdash; Odebunmi Tawwab A
        </div>
      </div>
    )
  }

  return (
    <div className="relative px-6 py-16">
      <div className="floating-orbs absolute inset-0 -z-10" />
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3 shadow-lg shadow-primary/25">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Admission Application
          </h1>
          <p className="text-sm text-muted-foreground">Fill in the details below to apply for admission.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-card space-y-5 rounded-2xl border-0 p-6 md:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="h-11" required />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="h-11" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-11" required />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-11" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className="h-11" required />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => v && update("gender", v)}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Class Applying For</Label>
              <Select value={form.classApplyingFor} onValueChange={(v) => { if (!v) return; update("classApplyingFor", v); if (!nigerianClasses.find((c) => c.value === v)?.isSenior) update("department", "") }}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {nigerianClasses.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClass?.isSenior && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-1.5">
                <Label className="flex items-center gap-1">
                  Department <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Select value={form.department} onValueChange={(v) => v && update("department", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Previous School</Label>
            <Input value={form.previousSchool} onChange={(e) => update("previousSchool", e.target.value)} className="h-11" placeholder="Name of last school attended (optional)" />
          </div>

          <div className="space-y-1.5">
            <Label>Home Address</Label>
            <textarea value={form.address} onChange={(e) => update("address", e.target.value)} required rows={2} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Parent/Guardian Name</Label>
              <Input value={form.parentName} onChange={(e) => update("parentName", e.target.value)} className="h-11" required />
            </div>
            <div className="space-y-1.5">
              <Label>Parent/Guardian Phone</Label>
              <Input type="tel" value={form.parentPhone} onChange={(e) => update("parentPhone", e.target.value)} className="h-11" required />
            </div>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 text-center">{error}</motion.p>
          )}

          <Button type="submit" disabled={loading} size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25 hover:shadow-xl transition-all h-12 text-base">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : "Submit Application"}
          </Button>
        </motion.form>
      </div>
      <div className="mt-12 border-t border-border/40 px-4 py-4 text-center text-[10px] text-muted-foreground/50">
        Built by Skoolar &mdash; Odebunmi Tawwab A
      </div>
    </div>
  )
}
