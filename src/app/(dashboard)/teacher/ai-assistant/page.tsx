"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"
import AIAssistant from "@/components/AIAssistant"
import { useSession } from "next-auth/react"

const QUICK_ACTIONS = [
  { label: "Lesson Ideas", prompt: "Give me creative and engaging lesson ideas for teaching fractions to JSS 1 students." },
  { label: "Analyze My Class", prompt: "Analyze the performance of my classes. Show me which subjects need improvement and which students are excelling." },
  { label: "Draft Report Comment", prompt: "Draft a positive report card comment for a student who has shown improvement in Mathematics this term." },
  { label: "Create Quiz", prompt: "Create a 5-question MCQ quiz on photosynthesis for SSS 1 Biology students. Include answer key." },
  { label: "Teaching Strategies", prompt: "Suggest effective teaching strategies for my weak-performing students in English Language." },
  { label: "Weekly Report Help", prompt: "How can I write a comprehensive weekly report for my students? Give me a template structure." },
]

export default function TeacherAIAssistantPage() {
  const { data: session } = useSession()
  const teacherId = (session?.user as any)?.id || ""

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Assistant</h2>
            <p className="text-sm text-muted-foreground">Your personal teaching assistant</p>
          </div>
        </div>
      </motion.div>

      <AIAssistant
        role="teacher"
        teacherId={teacherId}
        quickActions={QUICK_ACTIONS}
        placeholder="Ask for lesson ideas, student insights, help with reports..."
      />
    </div>
  )
}
