"use client"

import { motion } from "framer-motion"
import { HandwritingGenerator } from "@/components/handwriting/HandwritingGenerator"

export default function TeacherHandwritingSheetsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        <div>
          <h2 className="text-2xl font-bold">Handwriting Sheets</h2>
          <p className="text-sm text-muted-foreground">
            Create, customise, and print handwriting practice sheets for your students
          </p>
        </div>
      </motion.div>

      <HandwritingGenerator />
    </div>
  )
}
