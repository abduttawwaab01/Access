"use client"

import { motion } from "framer-motion"
import { CertificateGenerator } from "@/components/certificates/CertificateGenerator"

export default function AdminCertificatesPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        <div>
          <h2 className="text-2xl font-bold">Certificate Generator</h2>
          <p className="text-sm text-muted-foreground">
            Create, customize, and download premium award certificates
          </p>
        </div>
      </motion.div>

      <CertificateGenerator />
    </div>
  )
}
