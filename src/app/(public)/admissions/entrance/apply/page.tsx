"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { GraduationCap, Loader2, ArrowRight, FileText, BookOpen } from "lucide-react"

function ApplyForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const codeId = searchParams.get("codeId")
  const examId = searchParams.get("examId")
  const classId = searchParams.get("classId")
  const className = searchParams.get("className")
  const examTitle = searchParams.get("examTitle")

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
    gender: "", address: "", previousSchool: "", parentName: "", parentPhone: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!codeId) {
      const t = setTimeout(() => {
        toast.error("No entrance code provided. Please use a valid code.")
        router.push("/admissions/entrance")
      }, 100)
      return () => clearTimeout(t)
    }
  }, [codeId, router])

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeId || !examId) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admissions/entrance-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entranceCodeId: codeId,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth || null,
          address: form.address,
          classApplyingFor: classId || className || "",
          parentName: form.parentName,
          parentPhone: form.parentPhone,
          previousSchool: form.previousSchool,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed")

      toast.success("Application submitted! Redirecting to exam...")
      // Redirect to the exam
      setTimeout(() => {
        router.push(data.redirectUrl || `/exam-take/${data.examSessionId}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  if (!codeId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Redirecting to code entry...</p>
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
            Complete Your Application
          </h1>
          <p className="text-sm text-muted-foreground">Fill in your details to apply for admission</p>
        </motion.div>

        {/* Exam Info Card */}
        <Card className="glass-card border-0 mb-6">
          <CardContent className="p-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Class:</span>
              <span className="font-medium">{className || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Exam:</span>
              <span className="font-medium">{examTitle || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSubmit} className="glass-card space-y-5 rounded-2xl border-0 p-6 md:p-8">

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

          <div className="space-y-1.5">
            <Label>Home Address</Label>
            <textarea value={form.address} onChange={(e) => update("address", e.target.value)} required rows={2}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div className="space-y-1.5">
            <Label>Previous School</Label>
            <Input value={form.previousSchool} onChange={(e) => update("previousSchool", e.target.value)} className="h-11" placeholder="Name of last school attended (optional)" />
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

          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 text-center">{error}</motion.p>}

          <Button type="submit" disabled={loading} size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25 hover:shadow-xl transition-all h-12 text-base">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : <><ArrowRight className="mr-2 h-5 w-5" /> Submit &amp; Start Exam</>}
          </Button>
        </motion.form>
      </div>
    </div>
  )
}

export default function EntranceApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-[60dvh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ApplyForm />
    </Suspense>
  )
}
