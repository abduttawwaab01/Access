"use client"

import { motion } from "framer-motion"
import { BehaviourGenerator } from "@/components/behaviour/BehaviourGenerator"

export default function AdminBehaviourPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        <div>
          <h2 className="text-2xl font-bold">Behaviour &amp; Star Achievement Chart</h2>
          <p className="text-sm text-muted-foreground">
            Track student behaviour with star charts, colour codes, and reward milestones
          </p>
        </div>
      </motion.div>

      <BehaviourGenerator />
    </div>
  )
}
