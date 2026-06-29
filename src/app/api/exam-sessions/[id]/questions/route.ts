import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params
  try {
    const session = await prisma.examSession.findUnique({ where: { id: sessionId } })
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const exam = await prisma.exam.findUnique({ where: { id: session.examId } })
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    const examQuestions = (exam.questions as any[]) || []
    const qIds = examQuestions.map((q: any) => q.questionId).filter(Boolean)

    if (qIds.length === 0) {
      return NextResponse.json([])
    }

    const questions = await prisma.question.findMany({
      where: { id: { in: qIds } },
    })

    const sanitized = questions.map((q: any) => {
      const eq = examQuestions.find((eq: any) => eq.questionId === q.id)
      const overridden = eq?.override
      return {
        id: q.id,
        text: overridden?.text ?? q.question,
        type: overridden?.type ?? q.type,
        options: overridden?.options ?? q.options,
        difficulty: overridden?.difficulty ?? q.difficulty,
        topic: overridden?.topic ?? q.topic,
        points: eq?.points ?? q.points,
      }
    })

    return NextResponse.json(sanitized)
  } catch (error) {
    console.error("Error fetching sanitized questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}
