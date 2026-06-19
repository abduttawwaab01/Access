"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <div className="animated-gradient absolute inset-0 opacity-5" />
      <div className="floating-orbs absolute inset-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="glass-card mb-8 rounded-2xl p-4">
          <div className="animated-gradient flex h-16 w-16 items-center justify-center rounded-xl shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-3 text-4xl font-bold tracking-tight"
        >
          Welcome to{" "}
          <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Access
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mb-2 max-w-sm text-lg text-muted-foreground"
        >
          School management, simplified.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mb-10 max-w-xs text-sm text-muted-foreground/70"
        >
          Manage classes, exams, attendance, and analytics — all in one beautiful platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="flex flex-col items-center gap-3 w-full max-w-xs"
        >
          <Link href="/login" className="w-full">
            <Button size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
              <span>Get Started</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/auth/register" className="w-full">
            <Button variant="outline" size="lg" className="w-full glass-card border-0">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Create School
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 z-10"
      >
        <p className="text-xs text-muted-foreground/50">&copy; 2026 Access. All rights reserved.</p>
      </motion.div>
    </div>
  )
}
