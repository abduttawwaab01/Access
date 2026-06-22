"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"
import AIAssistant from "@/components/AIAssistant"
import { useSession } from "next-auth/react"

const QUICK_ACTIONS = [
  { label: "Class Performance", prompt: "Show me the overall performance overview across all classes. Include average scores and pass rates." },
  { label: "Generate Lesson Note", prompt: "Generate a first-term lesson note on Algebra for JSS 1. Include learning objectives, content, activities, and assessment." },
  { label: "Intervention Needed", prompt: "Which students need intervention in Mathematics? List students scoring below 50% in Math." },
  { label: "Draft Announcement", prompt: "Draft a school announcement about the upcoming inter-house sports day event. Keep it professional." },
  { label: "Teacher Insights", prompt: "Give me insights on teacher workload and how many lesson notes each teacher has published." },
  { label: "Attendance Insights", prompt: "Analyze the overall attendance trends. Which classes have the best and worst attendance rates?" },
]

export default function AdminAIAssistantPage() {
  const { data: session } = useSession()
  const adminId = (session?.user as any)?.id || ""

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Assistant</h2>
            <p className="text-sm text-muted-foreground">Your intelligent school administration assistant</p>
          </div>
        </div>
      </motion.div>

      <AIAssistant
        role="admin"
        teacherId={adminId}
        quickActions={QUICK_ACTIONS}
        placeholder="Ask about students, generate lesson notes, get insights, draft announcements..."
      />
    </div>
  )
}
