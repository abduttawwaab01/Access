"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { KeyRound, ArrowRight, Loader2, CheckCircle, Clock, BookOpen, FileText } from "lucide-react"

export default function EntranceCodePage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState<any>(null)
  const router = useRouter()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) { toast.error("Please enter an entrance code"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/admissions/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (data.valid) {
        setVerified(data)
        toast.success("Code verified! Please fill in your details.")
      } else {
        toast.error(data.error || "Invalid code")
      }
    } catch {
      toast.error("Failed to verify code. Please try again.")
    }
    setLoading(false)
  }

  const handleProceed = () => {
    if (verified) {
      router.push(`/admissions/entrance/apply?codeId=${verified.codeId}&examId=${verified.examId}&classId=${verified.classId}&className=${encodeURIComponent(verified.className)}&examTitle=${encodeURIComponent(verified.examTitle)}`)
    }
  }

  return (
    <div className="relative flex min-h-[80dvh] items-center justify-center px-6 py-16">
      <div className="floating-orbs absolute inset-0 -z-10" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3 shadow-lg shadow-primary/25">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Entrance Exam
          </h1>
          <p className="text-sm text-muted-foreground">Enter the code provided by the school to begin your admission process</p>
        </div>

        {!verified ? (
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-center block">Entrance Code</label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ENT-ABCD-1234"
                    className="h-14 text-center text-lg font-mono tracking-widest uppercase"
                    maxLength={15}
                    autoFocus
                  />
                </div>
                <Button type="submit" disabled={loading || code.trim().length < 8} size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25 h-12 text-base">
                  {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</> : "Verify Code"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <Card className="border-0 bg-gradient-to-br from-emerald-50 to-green-50">
              <CardContent className="p-5 text-center">
                <CheckCircle className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
                <h2 className="font-bold text-emerald-700">Code Verified</h2>
                <p className="text-xs text-emerald-600 mt-1">You are about to apply for:</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Class</p>
                    <p className="font-semibold">{verified.className}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Entrance Exam</p>
                    <p className="font-semibold">{verified.examTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold">{verified.duration} minutes &middot; {verified.questionCount} questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleProceed} size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25 h-12 text-base">
              Continue to Application <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
