"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GraduationCap, ArrowRight, Brain, BarChart3, QrCode, FileText, Wallet, Users, BookOpen, ClipboardCheck, Bell, Calendar, Shield, MessageSquare, DoorOpen, LucideIcon } from "lucide-react"
import Link from "next/link"

const features = [
  { icon: Brain, title: "CBT Engine", desc: "Computer-based testing with auto-grading, anti-cheat, and detailed performance analytics per question." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time insights on academics, attendance trends, and AI-powered recommendations." },
  { icon: QrCode, title: "Smart Attendance", desc: "QR code scanning, one-tap check-in, auto late-detection, and face recognition ready." },
  { icon: FileText, title: "Report Cards", desc: "Auto-generated report cards with radar charts, domain scores, and PNG/Print/WhatsApp export." },
  { icon: Wallet, title: "Fees & Salary", desc: "Fee structures, payment tracking with admin confirmation, and staff salary management." },
  { icon: Users, title: "4 Portals", desc: "Dedicated Admin, Teacher, Parent, and Student dashboards — each tailored to their needs." },
  { icon: BookOpen, title: "Lesson Notes", desc: "Create, organize, and AI-generate lesson plans. Search and filter by class and subject." },
  { icon: ClipboardCheck, title: "Assignments", desc: "Digital assignment submission with progress tracking and status overview per class." },
  { icon: Calendar, title: "Timetable", desc: "Weekly timetable views for every role with class, subject, and teacher scheduling." },
  { icon: MessageSquare, title: "Communications", desc: "Send announcements with priority levels and targeted audience selection." },
  { icon: Bell, title: "Push Notifications", desc: "Real-time push alerts for new assignments, results, and school announcements." },
  { icon: DoorOpen, title: "Online Admissions", desc: "Public application portal, entrance exam management, and one-click accept/reject workflow." },
]

const portals = [
  { role: "Admin", color: "from-blue-500 to-indigo-600", items: ["School settings & branding", "Student & staff management", "Admission applications processing", "Fee & salary management", "Document generation", "CBT exam builder", "Analytics & insights"] },
  { role: "Teacher", color: "from-emerald-500 to-teal-600", items: ["Lesson notes with AI assist", "Assignment management", "CBT exam creation", "Class performance analytics", "Attendance marking", "Announcements"] },
  { role: "Parent", color: "from-violet-500 to-purple-600", items: ["Child performance tracking", "Exam results & report cards", "Attendance monitoring", "Fee payment & history", "School timetable", "Notifications"] },
  { role: "Student", color: "from-orange-500 to-pink-600", items: ["Take CBT exams", "View results & analysis", "Download report cards", "Check attendance", "View timetable", "Track fees"] },
]

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function FeatureCard({ icon: Icon, title, desc, i }: { icon: LucideIcon; title: string; desc: string; i: number }) {
  return (
    <motion.div variants={fadeUp} className="glass-card group relative overflow-hidden rounded-xl p-5 transition-all hover:scale-[1.02] hover:shadow-lg">
      <div className={`animated-gradient absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5`} />
      <div className="animated-gradient mb-3 inline-flex rounded-lg p-2.5">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </motion.div>
  )
}

function PortalCard({ role, color, items }: { role: string; color: string; items: string[] }) {
  return (
    <motion.div variants={fadeUp} className="glass-card rounded-xl p-5 transition-all hover:scale-[1.02]">
      <div className={`bg-gradient-to-r ${color} mb-3 inline-block rounded-lg px-3 py-1 text-xs font-semibold text-white`}>{role} Portal</div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${color}`} />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="floating-orbs fixed inset-0 -z-10" />

      {/* Hero */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative z-10 flex flex-col items-center">
          <div className="glass-card mb-6 rounded-2xl p-3">
            <div className="animated-gradient flex h-16 w-16 items-center justify-center rounded-xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Everything your school needs.
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">One beautiful platform.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="mb-2 max-w-md text-lg text-muted-foreground">
            Access is a complete school management & CBT platform — from exams to report cards, attendance to analytics.
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="mb-10 max-w-sm text-sm text-muted-foreground/70">
            Four tailored portals. Zero complexity. Built for mobile-first, designed for every role.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}>
            <Link href="/login">
              <Button size="lg" className="animated-gradient h-14 border-0 px-10 text-base text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30">
                Explore Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mx-auto max-w-5xl">
          <motion.h2 variants={fadeUp} className="mb-2 text-center text-3xl font-bold">Everything you need to run your school</motion.h2>
          <motion.p variants={fadeUp} className="mb-12 text-center text-muted-foreground">From the classroom to the front office — Access has you covered.</motion.p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} i={i} />)}
          </div>
        </motion.div>
      </section>

      {/* Portals */}
      <section className="relative z-10 px-6 py-24">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mx-auto max-w-5xl">
          <motion.h2 variants={fadeUp} className="mb-2 text-center text-3xl font-bold">Four portals, one school</motion.h2>
          <motion.p variants={fadeUp} className="mb-12 text-center text-muted-foreground">Every role gets a tailored experience with the tools they need.</motion.p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {portals.map((p) => <PortalCard key={p.role} role={p.role} color={p.color} items={p.items} />)}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="glass-card mx-auto max-w-md rounded-2xl p-8">
            <h2 className="mb-3 text-2xl font-bold">Ready to see it in action?</h2>
            <p className="mb-6 text-sm text-muted-foreground">Click a role on the login screen to explore Access with sample data. No sign-up required.</p>
            <Link href="/login">
              <Button size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
                Try Access Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 px-6 py-8 text-center text-xs text-muted-foreground/50">
        &copy; {new Date().getFullYear()} Access School Management Platform. All rights reserved.
      </footer>
    </div>
  )
}
