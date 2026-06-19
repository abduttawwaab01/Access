"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="floating-orbs absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="animated-gradient mb-6 inline-flex rounded-2xl p-4">
          <span className="text-5xl font-bold text-white">404</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
        <p className="mb-8 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/">
          <Button>
            <Home className="mr-2 h-4 w-4" />
            Back Home
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
