"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
    desc: "Nurturing curiosity and foundational skills through play-based learning in a safe, caring environment for ages 2–5.",
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
  { title: "Smart Classrooms", desc: "Interactive whiteboards and digital learning tools in every classroom.", img: "📚" },
  { title: "Science Laboratories", desc: "Well-equipped biology, chemistry, and physics labs for practical learning.", img: "🔬" },
  { title: "Sports Complex", desc: "Football pitch, basketball court, swimming pool, and indoor sports hall.", img: "🏀" },
  { title: "Library & Media Center", desc: "A vast collection of books, e-resources, and quiet study spaces.", img: "📖" },
  { title: "ICT Center", desc: "Modern computer lab with high-speed internet and coding workshops.", img: "💻" },
  { title: "Creative Arts Studio", desc: "Dedicated spaces for music, drama, painting, and cultural performances.", img: "🎨" },
]

export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="relative overflow-hidden">
      <div className="floating-orbs fixed inset-0 -z-10" />

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
      <section className="relative flex min-h-dvh flex-col items-center justify-center px-6 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="glass-card mb-8 rounded-2xl p-3"
          >
            <div className="animated-gradient flex h-20 w-20 items-center justify-center rounded-xl shadow-lg">
              <School className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Access International
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              Academy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mb-2 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Where Excellence Meets Innovation
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
                className="animated-gradient h-13 border-0 px-8 text-base text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
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
            <motion.div variants={fadeUp} className="glass-card rounded-xl p-6 text-center transition-all hover:scale-[1.02]">
              <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-semibold">Our Mission</h3>
              <p className="text-sm text-muted-foreground">
                To provide a nurturing, inclusive environment that fosters academic excellence, critical thinking,
                and moral integrity in every student.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-card rounded-xl p-6 text-center transition-all hover:scale-[1.02]">
              <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-semibold">Our Vision</h3>
              <p className="text-sm text-muted-foreground">
                To be a leading institution that produces globally competitive graduates equipped with 21st-century
                skills and strong ethical values.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-card rounded-xl p-6 text-center transition-all hover:scale-[1.02]">
              <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-semibold">Our Values</h3>
              <p className="text-sm text-muted-foreground">
                Excellence, Integrity, Innovation, Respect, and Compassion — the principles that guide everything we do.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

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
              <motion.div
                key={program.title}
                variants={fadeUp}
                className="glass-card group relative overflow-hidden rounded-xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="animated-gradient absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5" />
                <div className="animated-gradient mb-4 inline-flex rounded-lg p-3">
                  <program.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">{program.title}</h3>
                <p className="text-sm text-muted-foreground">{program.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

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
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="glass-card group relative overflow-hidden rounded-xl p-6 text-center transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="animated-gradient absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5" />
                <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

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
                className="animated-gradient h-14 border-0 px-10 text-base text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              >
                Apply Now <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

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
              <motion.div
                key={facility.title}
                variants={fadeUp}
                className="glass-card group relative overflow-hidden rounded-xl p-6 text-center transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="mb-4 text-4xl">{facility.img}</div>
                <h3 className="mb-2 font-semibold">{facility.title}</h3>
                <p className="text-sm text-muted-foreground">{facility.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

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
                <span className="animated-gradient flex h-8 w-8 cursor-default items-center justify-center rounded-lg text-xs text-white">FB</span>
                <span className="animated-gradient flex h-8 w-8 cursor-default items-center justify-center rounded-lg text-xs text-white">IG</span>
                <span className="animated-gradient flex h-8 w-8 cursor-default items-center justify-center rounded-lg text-xs text-white">X</span>
                <span className="animated-gradient flex h-8 w-8 cursor-default items-center justify-center rounded-lg text-xs text-white">YT</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-6 text-center text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} Access International Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
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
