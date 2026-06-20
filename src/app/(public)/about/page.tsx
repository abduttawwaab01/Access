"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Shield, BookOpen, Users, Award, Target, Eye } from "lucide-react"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const fadeUpDelayed = (delay: number) => ({
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
})

const scaleOnHover = "transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end])

  return (
    <p ref={ref} className="text-2xl font-bold">
      {count}{suffix}
    </p>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: typeof Users
  label: string
  value: string
  delay: number
}) {
  const num = parseInt(value.replace(/\D/g, ""))
  const suffix = value.replace(/\d/g, "")
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    card.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05,1.05,1.05)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
  }

  return (
    <motion.div
      variants={fadeUpDelayed(delay)}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-card rounded-xl p-4 text-center ${scaleOnHover}`}
      style={{ transition: "transform 0.15s ease-out" }}
    >
      <div className="animated-gradient mx-auto mb-2 inline-flex rounded-lg p-2">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <CountUp end={num} suffix={suffix} />
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  )
}

function SectionDivider() {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </motion.div>
  )
}

export default function AboutPage() {
  return (
    <div className="floating-orbs px-6 py-16">
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="mx-auto max-w-3xl space-y-16"
      >
        {/* Hero */}
        <motion.section variants={fadeUp} className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="animated-gradient mx-auto mb-6 inline-flex rounded-xl p-3"
          >
            <Shield className="h-6 w-6 text-white" />
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mb-4 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-4xl font-bold text-transparent"
          >
            About Access School Academy
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-xl text-lg text-muted-foreground"
          >
            Empowering the next generation of leaders through innovative education and comprehensive student development since 2010.
          </motion.p>
        </motion.section>

        {/* Mission & Vision */}
        <motion.div variants={stagger} className="grid gap-6 sm:grid-cols-2">
          <motion.div
            variants={fadeUp}
            className={`glass-card rounded-xl p-6 ${scaleOnHover}`}
          >
            <div className="animated-gradient mb-3 inline-flex rounded-lg p-2">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h2 className="mb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-lg font-semibold text-transparent">
              Our Mission
            </h2>
            <p className="text-sm text-muted-foreground">
              To provide a nurturing environment that fosters academic excellence, character development, and lifelong learning in every student.
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className={`glass-card rounded-xl p-6 ${scaleOnHover}`}
          >
            <div className="animated-gradient mb-3 inline-flex rounded-lg p-2">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <h2 className="mb-2 bg-gradient-to-r from-purple-400 to-secondary bg-clip-text text-lg font-semibold text-transparent">
              Our Vision
            </h2>
            <p className="text-sm text-muted-foreground">
              To be a leading educational institution that produces well-rounded, globally competitive graduates equipped with 21st-century skills.
            </p>
          </motion.div>
        </motion.div>

        <SectionDivider />

        {/* Stats */}
        <motion.section variants={stagger}>
          <motion.h2
            variants={fadeUp}
            className="mb-8 text-center bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-2xl font-bold text-transparent"
          >
            By the Numbers
          </motion.h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Users} label="Students" value="500+" delay={0} />
            <StatCard icon={BookOpen} label="Classes" value="24" delay={0.1} />
            <StatCard icon={Award} label="Years" value="15+" delay={0.2} />
            <StatCard icon={Users} label="Staff" value="60+" delay={0.3} />
          </div>
        </motion.section>

        <SectionDivider />

        {/* Facilities */}
        <motion.section variants={stagger}>
          <motion.h2
            variants={fadeUp}
            className="mb-8 text-center bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-2xl font-bold text-transparent"
          >
            Our Facilities
          </motion.h2>
          <motion.div
            variants={stagger}
            className="grid gap-4 sm:grid-cols-3"
          >
            {["Science Laboratories", "Computer Lab", "Library", "Sports Complex", "Music & Arts Studio", "Smart Classrooms"].map((f, i) => (
              <motion.div
                key={f}
                variants={fadeUpDelayed(i * 0.05)}
                className={`glass-card rounded-xl p-4 text-center text-sm font-medium ${scaleOnHover}`}
              >
                {f}
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* Contact */}
        <motion.section
          variants={fadeUp}
          className={`glass-card rounded-xl p-6 text-center ${scaleOnHover}`}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-2 text-lg font-semibold"
          >
            Get in Touch
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-muted-foreground"
          >
            123 Education Street, Lagos, Nigeria
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-muted-foreground"
          >
            +234 800 000 0000
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            info@accessschool.edu
          </motion.p>
        </motion.section>
      </motion.div>
      <div className="mt-12 border-t border-border/40 px-4 py-4 text-center text-[10px] text-muted-foreground/50">
        Built by Skoolar &mdash; Odebunmi Tawwab A
      </div>
    </div>
  )
}
