import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const item = await db.examSessions.getById(id)
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching exam session:", error)
    return NextResponse.json(
      { error: "Failed to fetch exam session" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()
    const session = await db.examSessions.getById(id)
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Prevent re-submission if already completed
    if (body.status === "completed" && session.status === "completed") {
      return NextResponse.json({ error: "Exam already submitted" }, { status: 409 })
    }

    // Server-side score recalculation for MCQ/TF questions
    let recalculatedScore = body.totalScore
    let recalculatedAnswers = body.answers

    if (body.status === "completed" && body.answers && body.examId) {
      const exam = await prisma.exam.findUnique({ where: { id: body.examId } })
      if (exam?.questions) {
        const examQuestions = (exam.questions as any[]) || []
        const qIds = examQuestions.map((q: any) => q.questionId).filter(Boolean)
        const allQuestions = await prisma.question.findMany({
          where: { id: { in: qIds } },
        })
        const questionMap = new Map(allQuestions.map((q: any) => [q.id, q]))

        let verifiedTotal = 0
        const verifiedAnswers = body.answers.map((a: any) => {
          const q = questionMap.get(a.questionId)
          if (q && (q.type === "mcq" || q.type === "true_false") && q.answer) {
            const correct = a.answer?.trim().toLowerCase() === q.answer.trim().toLowerCase()
            const eq = examQuestions.find((eq: any) => eq.questionId === q.id)
            const pts = correct ? (eq?.points || q.points || 0) : 0
            if (correct) verifiedTotal += pts
            return { ...a, score: pts }
          }
          return { ...a, score: 0 }
        })

        recalculatedScore = verifiedTotal
        recalculatedAnswers = verifiedAnswers
      }
    }

    const item = await db.examSessions.update(id, {
      ...body,
      answers: recalculatedAnswers || body.answers,
      totalScore: recalculatedScore,
    })
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // If exam is completed and it's an entrance exam, sync score back to admission application
    if (body.status === "completed" && (item.examType === "entrance" || body.examType === "entrance")) {
      try {
        const application = await prisma.admissionApplication.findFirst({
          where: { examSessionId: id },
        })
        if (application) {
          const totalScore = recalculatedScore ?? item.score ?? 0
          const maxScore = body.maxScore ?? 0
          const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

          const settings = await prisma.admissionSettings.findFirst()
          let passed = false
          if (settings?.cutOffs) {
            const cutOffs = settings.cutOffs as Record<string, number>
            const classes = await prisma.class.findMany()
            const matchedClass = classes.find((c: any) => c.name === application.classApplyingFor)
            const classCutOff = matchedClass ? (cutOffs[matchedClass.id] || 0) : 0
            passed = classCutOff > 0 ? percentage >= classCutOff : false
          }

          await db.admissionApplications.update(application.id, {
            entranceExamScore: percentage,
            entranceExamPassed: passed,
          })
        }
      } catch (syncError) {
        console.error("Failed to sync exam score to application:", syncError)
      }
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating exam session:", error)
    return NextResponse.json(
      { error: "Failed to update exam session" },
      { status: 500 }
    )
  }
}
