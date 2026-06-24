"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ClipboardCheck, FileText, GraduationCap, Calendar, ArrowRight } from "lucide-react"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const scaleOnHover = "transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"

const steps = [
  { icon: ClipboardCheck, title: "1. Submit Application", desc: "Fill out our online application form with your details and academic history." },
  { icon: FileText, title: "2. Entrance Exam", desc: "Take our computer-based entrance exam to assess your readiness." },
  { icon: Calendar, title: "3. Interview", desc: "Selected candidates are invited for a brief interview with our admissions team." },
  { icon: GraduationCap, title: "4. Enrollment", desc: "Accepted students complete enrollment and begin their journey with us." },
]

export default function AdmissionsPage() {
  return (
    <div className="floating-orbs px-6 py-16">
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="mx-auto max-w-3xl space-y-12"
      >
        {/* Hero */}
        <motion.section variants={fadeUp} className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="animated-gradient mx-auto mb-6 inline-flex rounded-xl p-3"
          >
            <GraduationCap className="h-6 w-6 text-white" />
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mb-4 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-4xl font-bold text-transparent"
          >
            Admissions
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-xl text-lg text-muted-foreground"
          >
            Join Access School Academy — where excellence meets opportunity. We welcome applications for all grade levels.
          </motion.p>
        </motion.section>

        {/* Steps with connectors */}
        <motion.section variants={stagger} className="relative">
          <motion.h2
            variants={fadeUp}
            className="mb-10 text-center bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-2xl font-bold text-transparent"
          >
            How to Apply
          </motion.h2>

          {/* Vertical gradient connector line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary via-purple-500 to-secondary sm:block" />

          <div className="grid gap-8 sm:grid-cols-2">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, delay: i * 0.15 },
                  },
                }}
                className={`glass-card relative rounded-xl p-5 ${scaleOnHover}`}
              >
                {/* Step number badge */}
                <div className="animated-gradient absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg sm:-right-3">
                  {i + 1}
                </div>

                {/* Arrow connector on desktop */}
                {i < steps.length - 1 && (
                  <div className="absolute -bottom-6 left-1/2 hidden -translate-x-1/2 sm:block">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-px bg-gradient-to-b from-primary/60 to-purple-500/60" />
                      <ArrowRight className="h-4 w-4 rotate-90 text-purple-400" />
                    </div>
                  </div>
                )}

                <div className="animated-gradient mb-3 inline-flex rounded-lg p-2">
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-1 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          variants={fadeUp}
          className={`glass-card rounded-xl p-6 text-center ${scaleOnHover}`}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-xl font-bold text-transparent"
          >
            Ready to Apply?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-sm text-muted-foreground"
          >
            Take the first step towards an exceptional education.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/admissions/entrance"
              className="animated-gradient inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:scale-105"
            >
              I Have an Entrance Code <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admissions/apply"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold border border-border text-foreground hover:bg-muted/50 transition-all"
            >
              Traditional Application
            </Link>
          </motion.div>
        </motion.section>
      </motion.div>
      <div className="mt-12 border-t border-border/40 px-4 py-4 text-center text-[10px] text-muted-foreground/50">
        Built by Skoolar &mdash; Odebunmi Tawwab A
      </div>
    </div>
  )
}
