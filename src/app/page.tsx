"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  School, GraduationCap, MapPin, Phone, Mail, BookOpen, Users,
  Trophy, Lightbulb, Heart, Globe, Star, ChevronRight, ExternalLink, Menu, X,
} from "lucide-react"
import Link from "next/link"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Admissions", href: "/admissions" },
]

const programs = [
  {
    title: "Early Childhood Education",
    desc: "Nurturing curiosity and foundational skills through play-based learning in a safe, caring environment for ages 2\u20135.",
    icon: Heart,
  },
  {
    title: "Primary & Secondary",
    desc: "A rigorous academic curriculum blending Nigerian and British standards with critical thinking, creativity, and character development.",
    icon: BookOpen,
  },
  {
    title: "STEM & ICT",
    desc: "Hands-on science, technology, engineering, and math programs with dedicated computer labs and robotics clubs.",
    icon: GraduationCap,
  },
  {
    title: "Creative Arts & Sports",
    desc: "Music, drama, fine arts, and competitive sports programs that build confidence, teamwork, and self-expression.",
    icon: Trophy,
  },
]

const whyUs = [
  { icon: Users, title: "Expert Teachers", desc: "Highly qualified educators committed to bringing out the best in every student." },
  { icon: BookOpen, title: "Modern Curriculum", desc: "A blended curriculum that meets global standards while honoring local values." },
  { icon: Star, title: "Small Class Sizes", desc: "Personalised attention with low student-to-teacher ratios for optimal learning." },
  { icon: Trophy, title: "Sports & Arts", desc: "A vibrant co-curricular program that develops talent beyond the classroom." },
  { icon: Lightbulb, title: "Technology-Driven", desc: "Smart classrooms, e-learning platforms, and digital tools that prepare students for the future." },
  { icon: Globe, title: "Global Recognition", desc: "Certifications and pathways that open doors to universities worldwide." },
]

const facilities = [
  { title: "Smart Classrooms", desc: "Interactive whiteboards and digital learning tools in every classroom.", img: "\uD83D\uDCDA" },
  { title: "Science Laboratories", desc: "Well-equipped biology, chemistry, and physics labs for practical learning.", img: "\uD83D\uDD2C" },
  { title: "Sports Complex", desc: "Football pitch, basketball court, swimming pool, and indoor sports hall.", img: "\uD83C\uDFC0" },
  { title: "Library & Media Center", desc: "A vast collection of books, e-resources, and quiet study spaces.", img: "\uD83D\uDCD6" },
  { title: "ICT Center", desc: "Modern computer lab with high-speed internet and coding workshops.", img: "\uD83D\uDCBB" },
  { title: "Creative Arts Studio", desc: "Dedicated spaces for music, drama, painting, and cultural performances.", img: "\uD83C\uDFA8" },
]

const stats = [
  { label: "Students Enrolled", value: 1200, suffix: "+" },
  { label: "Expert Teachers", value: 85, suffix: "+" },
  { label: "Years of Excellence", value: 15, suffix: "+" },
  { label: "Awards Won", value: 45, suffix: "+" },
]

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const step = Math.ceil(value / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, value])

  return <span ref={ref}>{count}{suffix}</span>
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10
    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 60])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.6])

  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <div className="relative overflow-hidden">
        {/* Background dot grid */}
        <div className="dot-grid fixed inset-0 -z-10 pointer-events-none" />

        {/* Floating Orbs */}
        <div className="orbs-container fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="orb orb-4" />
        </div>

        {/* Sticky Nav */}
        <header className="fixed top-0 right-0 left-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="animated-gradient flex h-8 w-8 items-center justify-center rounded-lg">
                <School className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-lg font-bold text-transparent">
                Access International Academy
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/login">
                <Button size="sm" className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
                  Sign In
                </Button>
              </Link>
            </nav>

            <button
              onClick={() => setNavOpen(!navOpen)}
              className="flex items-center justify-center md:hidden"
              aria-label="Toggle menu"
            >
              {navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {navOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-border/40 bg-background px-6 py-4 md:hidden"
            >
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setNavOpen(false)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/login" onClick={() => setNavOpen(false)}>
                  <Button className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
                    Sign In
                  </Button>
                </Link>
              </nav>
            </motion.div>
          )}
        </header>

        {/* Hero */}
        <section
          ref={heroRef}
          className="relative flex min-h-dvh flex-col items-center justify-center px-6 pt-20 text-center"
        >
          {/* Floating geometric shapes */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute left-[15%] top-[20%] h-3 w-3 border border-primary/30 rounded-sm"
              animate={{ y: [0, -20, 0], rotate: [0, 45, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-[20%] top-[30%] h-2.5 w-2.5 bg-secondary/20 rounded-full"
              animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.div
              className="absolute left-[10%] bottom-[30%] h-4 w-4 border border-purple-400/30 rounded-full"
              animate={{ y: [0, -25, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className="absolute right-[15%] bottom-[25%] h-2 w-2 bg-primary/20 rounded-sm"
              animate={{ rotate: [0, 90, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute left-[30%] bottom-[15%] h-3 w-3 bg-amber-400/20 rounded-sm"
              animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Pulsing glow behind icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl animate-pulse-glow" />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="glass-card relative rounded-2xl p-3"
              >
                <div className="animated-gradient flex h-20 w-20 items-center justify-center rounded-xl shadow-lg">
                  <School className="h-10 w-10 text-white" />
                </div>
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Access International
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent animate-gradient-text">
                Academy
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mb-2 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            >
              <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent animate-gradient-text">
                Where Excellence Meets Innovation
              </span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mb-10 max-w-md text-sm text-muted-foreground/70"
            >
              Nurturing tomorrow&apos;s leaders through world-class education, character development, and a commitment to excellence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="animated-gradient h-13 border-0 px-8 text-base text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 animate-pulse-shadow"
                >
                  Get Started <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 border-border px-8 text-base"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Counter */}
        <section className="relative z-10 px-6 py-16 bg-muted/30">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="glass-card rounded-xl p-6 text-center"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About Us */}
        <section className="relative z-10 px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="mx-auto max-w-5xl"
          >
            <motion.h2 variants={fadeUp} className="mb-4 text-center text-3xl font-bold">
              About Our School
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              Access International Academy is a premier educational institution dedicated to providing a holistic,
              world-class education that empowers students to reach their full potential.
            </motion.p>

            <div className="grid gap-6 md:grid-cols-3">
              <motion.div variants={fadeUp}>
                <TiltCard>
                  <div className="group relative rounded-xl">
                    <div className="gradient-border-bg absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                    <div className="glass-card relative rounded-xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/10" style={{ margin: "1.5px" }}>
                      <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 font-semibold">Our Mission</h3>
                      <p className="text-sm text-muted-foreground">
                        To provide a nurturing, inclusive environment that fosters academic excellence, critical thinking,
                        and moral integrity in every student.
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              <motion.div variants={fadeUp}>
                <TiltCard>
                  <div className="group relative rounded-xl">
                    <div className="gradient-border-bg absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                    <div className="glass-card relative rounded-xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/10" style={{ margin: "1.5px" }}>
                      <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 font-semibold">Our Vision</h3>
                      <p className="text-sm text-muted-foreground">
                        To be a leading institution that produces globally competitive graduates equipped with 21st-century
                        skills and strong ethical values.
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              <motion.div variants={fadeUp}>
                <TiltCard>
                  <div className="group relative rounded-xl">
                    <div className="gradient-border-bg absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                    <div className="glass-card relative rounded-xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/10" style={{ margin: "1.5px" }}>
                      <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 font-semibold">Our Values</h3>
                      <p className="text-sm text-muted-foreground">
                        Excellence, Integrity, Innovation, Respect, and Compassion &mdash; the principles that guide everything we do.
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Section Divider */}
        <div className="relative z-10 -mt-1">
          <svg viewBox="0 0 1440 60" className="w-full h-12 fill-muted/50" preserveAspectRatio="none">
            <path d="M0,30 C360,60 720,0 1440,30 L1440,0 L0,0 Z" />
          </svg>
        </div>

        {/* Academics */}
        <section className="relative z-10 bg-muted/50 px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="mx-auto max-w-5xl"
          >
            <motion.h2 variants={fadeUp} className="mb-4 text-center text-3xl font-bold">
              Our Academic Programs
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              A comprehensive curriculum designed to inspire a lifelong love of learning and prepare students for the future.
            </motion.p>

            <div className="grid gap-6 sm:grid-cols-2">
              {programs.map((program) => (
                <motion.div key={program.title} variants={fadeUp}>
                  <TiltCard>
                    <div className="group relative rounded-xl">
                      <div className="gradient-border-bg absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                      <div className="glass-card relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10" style={{ margin: "1.5px" }}>
                        <div className="animated-gradient absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5" />
                        <div className="animated-gradient mb-4 inline-flex rounded-lg p-3 relative">
                          <program.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="mb-2 font-semibold">{program.title}</h3>
                        <p className="text-sm text-muted-foreground">{program.desc}</p>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section Divider */}
        <div className="relative z-10 -mt-1">
          <svg viewBox="0 0 1440 60" className="w-full h-12 fill-background" preserveAspectRatio="none">
            <path d="M0,0 L720,60 L1440,0 L1440,60 L0,60 Z" />
          </svg>
        </div>

        {/* Why Choose Us */}
        <section className="relative z-10 px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="mx-auto max-w-5xl"
          >
            <motion.h2 variants={fadeUp} className="mb-4 text-center text-3xl font-bold">
              Why Choose Us
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              What sets Access International Academy apart as a leader in education.
            </motion.p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whyUs.map((item) => (
                <motion.div key={item.title} variants={fadeUp}>
                  <TiltCard>
                    <div className="group relative rounded-xl">
                      <div className="gradient-border-bg absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                      <div className="glass-card relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/10" style={{ margin: "1.5px" }}>
                        <div className="animated-gradient absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5" />
                        <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3 relative">
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="mb-2 font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section Divider */}
        <div className="relative z-10 -mt-1">
          <svg viewBox="0 0 1440 60" className="w-full h-12 fill-muted/50" preserveAspectRatio="none">
            <path d="M0,30 C360,60 720,0 1440,30 L1440,0 L0,0 Z" />
          </svg>
        </div>

        {/* Admissions CTA */}
        <section className="relative z-10 bg-muted/50 px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h2 variants={fadeUp} className="mb-4 text-3xl font-bold">
              Join the Access Family
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-8 text-muted-foreground">
              Admissions are now open for the upcoming academic session. Give your child the gift of an exceptional
              education in a community that cares.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/admissions">
                <Button
                  size="lg"
                  className="animated-gradient h-14 border-0 px-10 text-base text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 animate-pulse-shadow"
                >
                  Apply Now <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Section Divider */}
        <div className="relative z-10 -mt-1">
          <svg viewBox="0 0 1440 60" className="w-full h-12 fill-background" preserveAspectRatio="none">
            <path d="M0,0 L720,60 L1440,0 L1440,60 L0,60 Z" />
          </svg>
        </div>

        {/* School Life / Facilities */}
        <section className="relative z-10 px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="mx-auto max-w-5xl"
          >
            <motion.h2 variants={fadeUp} className="mb-4 text-center text-3xl font-bold">
              School Life & Facilities
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              A vibrant campus with modern facilities designed to inspire learning, creativity, and personal growth.
            </motion.p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {facilities.map((facility) => (
                <motion.div key={facility.title} variants={fadeUp}>
                  <TiltCard>
                    <div className="group relative rounded-xl">
                      <div className="gradient-border-bg absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                      <div className="glass-card relative rounded-xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/10" style={{ margin: "1.5px" }}>
                        <div className="mb-4 text-4xl">{facility.img}</div>
                        <h3 className="mb-2 font-semibold">{facility.title}</h3>
                        <p className="text-sm text-muted-foreground">{facility.desc}</p>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section Divider */}
        <div className="relative z-10 -mt-1">
          <svg viewBox="0 0 1440 60" className="w-full h-12 fill-muted/50" preserveAspectRatio="none">
            <path d="M0,30 C360,60 720,0 1440,30 L1440,0 L0,0 Z" />
          </svg>
        </div>

        {/* Contact */}
        <section className="relative z-10 bg-muted/50 px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="mx-auto max-w-5xl"
          >
            <motion.h2 variants={fadeUp} className="mb-4 text-center text-3xl font-bold">
              Get in Touch
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              We&apos;d love to hear from you. Reach out to us with any questions or to schedule a campus tour.
            </motion.p>

            <motion.div variants={fadeUp} className="glass-card mx-auto max-w-2xl rounded-2xl p-8">
              <div className="grid gap-8 sm:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="animated-gradient mb-3 inline-flex rounded-xl p-3">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold">Address</h3>
                  <p className="text-xs text-muted-foreground">
                    123 Education Avenue,<br />GRA, Lagos State, Nigeria
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="animated-gradient mb-3 inline-flex rounded-xl p-3">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold">Phone</h3>
                  <p className="text-xs text-muted-foreground">
                    +234 800 123 4567<br />+234 800 765 4321
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="animated-gradient mb-3 inline-flex rounded-xl p-3">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold">Email</h3>
                  <p className="text-xs text-muted-foreground">
                    info@accessacademy.edu.ng<br />admissions@accessacademy.edu.ng
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border/40 px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="animated-gradient flex h-8 w-8 items-center justify-center rounded-lg">
                    <School className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-lg font-bold text-transparent">
                    Access
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Empowering the next generation of leaders through quality education and holistic development.
                </p>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold">Quick Links</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><Link href="/about" className="transition-colors hover:text-foreground">About Us</Link></li>
                  <li><Link href="/admissions" className="transition-colors hover:text-foreground">Admissions</Link></li>
                  <li><Link href="/login" className="transition-colors hover:text-foreground">Parent Portal</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold">Programs</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><span className="transition-colors hover:text-foreground cursor-default">Early Childhood</span></li>
                  <li><span className="transition-colors hover:text-foreground cursor-default">Primary School</span></li>
                  <li><span className="transition-colors hover:text-foreground cursor-default">Secondary School</span></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold">Follow Us</h4>
                <div className="flex gap-3">
                  <span className="animated-gradient flex h-8 w-8 cursor-default items-center justify-center rounded-lg text-xs text-white social-pill transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/30">FB</span>
                  <span className="animated-gradient flex h-8 w-8 cursor-default items-center justify-center rounded-lg text-xs text-white social-pill transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30">IG</span>
                  <span className="animated-gradient flex h-8 w-8 cursor-default items-center justify-center rounded-lg text-xs text-white social-pill transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/30">X</span>
                  <span className="animated-gradient flex h-8 w-8 cursor-default items-center justify-center rounded-lg text-xs text-white social-pill transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/30">YT</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/40 pt-6 text-center text-xs text-muted-foreground/50">
              &copy; {new Date().getFullYear()} Access International Academy. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .dot-grid {
          background-image: radial-gradient(circle, var(--primary) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.08;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .orb-1 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, var(--primary), transparent 70%);
          top: -100px;
          right: -50px;
          animation: orb-float-1 20s ease-in-out infinite;
          opacity: 0.15;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, var(--secondary), transparent 70%);
          bottom: -80px;
          left: -100px;
          animation: orb-float-2 18s ease-in-out infinite;
          opacity: 0.12;
        }

        .orb-3 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #8b5cf6, transparent 70%);
          top: 40%;
          left: -50px;
          animation: orb-float-3 22s ease-in-out infinite;
          opacity: 0.1;
        }

        .orb-4 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #f59e0b, transparent 70%);
          bottom: 20%;
          right: -30px;
          animation: orb-float-4 16s ease-in-out infinite;
          opacity: 0.1;
        }

        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-40px, 50px) scale(1.15); }
          50% { transform: translate(30px, -30px) scale(0.9); }
          75% { transform: translate(-20px, 40px) scale(1.05); }
        }

        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, -30px) scale(1.1); }
          50% { transform: translate(-40px, 40px) scale(0.95); }
          75% { transform: translate(20px, -50px) scale(1.15); }
        }

        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, 30px) scale(1.15); }
          66% { transform: translate(-30px, -20px) scale(0.9); }
        }

        @keyframes orb-float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, -30px) scale(1.2); }
          66% { transform: translate(40px, 20px) scale(0.85); }
        }

        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text-shift 4s ease infinite;
        }

        @keyframes gradient-text-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }

        .animate-pulse-shadow {
          animation: pulse-shadow 2s ease-in-out infinite;
        }

        @keyframes pulse-shadow {
          0%, 100% { box-shadow: 0 10px 25px -3px rgba(99, 102, 241, 0.25); }
          50% { box-shadow: 0 10px 35px -3px rgba(99, 102, 241, 0.45); }
        }

        .gradient-border-bg {
          background: linear-gradient(135deg, var(--primary), #8b5cf6, var(--secondary));
        }

        .social-pill {
          animation: social-breathe 3s ease-in-out infinite;
        }

        @keyframes social-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        .social-pill:hover {
          animation: none;
        }
      `}</style>
    </>
  )
}

function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
