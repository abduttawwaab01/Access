import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const app = await db.admissionApplications.getById(id)
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (!app.examSessionId) {
      return NextResponse.json({ error: "No exam session linked to this application" }, { status: 404 })
    }

    const session = await db.examSessions.getById(app.examSessionId)
    if (!session) {
      return NextResponse.json({ error: "Exam session not found" }, { status: 404 })
    }

    const exam = await db.exams.getById(session.examId)
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Fetch all questions
    const allQuestions = await db.questions.getAll()
    const qIds = (exam.questions || []).map((q: any) => q.questionId)
    const questions = allQuestions.filter((q: any) => qIds.includes(q.id))

    // Build question map
    const questionMap: Record<string, any> = {}
    questions.forEach((q: any) => {
      questionMap[q.id] = q
    })

    // Build answer map from session
    const answers = (session.answers || []) as any[]
    const answerMap: Record<string, any> = {}
    answers.forEach((a: any) => {
      answerMap[a.questionId] = a
    })

    // Subject breakdown
    const subjectScores: Record<string, { name: string; score: number; maxScore: number; questions: any[]; topics: Record<string, { name: string; score: number; maxScore: number; count: number }> }> = {}

    const questionDetails: any[] = []

    exam.questions.forEach((eq: any) => {
      const q = questionMap[eq.questionId]
      if (!q) return

      const points = eq.points || q.points || 1
      const answer = answerMap[eq.questionId]
      const userAnswer = answer?.answer || null
      const correctAnswer = q.answer || null
      const isCorrect = q.type === "mcq" || q.type === "true_false"
        ? userAnswer?.trim().toLowerCase() === correctAnswer?.trim().toLowerCase()
        : null
      const earnedPoints = isCorrect === true ? points : (isCorrect === false ? 0 : 0)

      if (!subjectScores[q.subjectId]) {
        subjectScores[q.subjectId] = {
          name: "",
          score: 0,
          maxScore: 0,
          questions: [],
          topics: {},
        }
      }

      subjectScores[q.subjectId].score += earnedPoints
      subjectScores[q.subjectId].maxScore += points
      subjectScores[q.subjectId].questions.push({
        questionId: q.id,
        question: q.question,
        type: q.type,
        topic: q.topic || "General",
        points,
        earnedPoints,
        userAnswer,
        correctAnswer,
        isCorrect,
      })

      const topicName = q.topic || "General"
      if (!subjectScores[q.subjectId].topics[topicName]) {
        subjectScores[q.subjectId].topics[topicName] = { name: topicName, score: 0, maxScore: 0, count: 0 }
      }
      subjectScores[q.subjectId].topics[topicName].score += earnedPoints
      subjectScores[q.subjectId].topics[topicName].maxScore += points
      subjectScores[q.subjectId].topics[topicName].count += 1

      questionDetails.push({
        questionId: q.id,
        question: q.question,
        type: q.type,
        topic: q.topic || "General",
        subjectId: q.subjectId,
        points,
        earnedPoints,
        userAnswer,
        correctAnswer,
        isCorrect,
      })
    })

    // Resolve subject names
    const allSubjects = await prisma.subject.findMany()
    const subjectMap: Record<string, string> = {}
    allSubjects.forEach((s: any) => { subjectMap[s.id] = s.name })

    const subjectBreakdown = Object.entries(subjectScores).map(([subjectId, data]) => ({
      subjectId,
      subjectName: subjectMap[subjectId] || "Unknown",
      score: data.score,
      maxScore: data.maxScore,
      percentage: data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0,
      topics: Object.values(data.topics).map((t: any) => ({
        name: t.name,
        score: t.score,
        maxScore: t.maxScore,
        percentage: t.maxScore > 0 ? Math.round((t.score / t.maxScore) * 100) : 0,
        count: t.count,
      })),
    }))

    const totalScore = session.score ?? subjectBreakdown.reduce((s, sub) => s + sub.score, 0)
    const maxScore = subjectBreakdown.reduce((s, sub) => s + sub.maxScore, 0)
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

    // Strengths & Weaknesses
    const strengths = questionDetails.filter((q) => q.isCorrect === true)
    const weaknesses = questionDetails.filter((q) => q.isCorrect === false)
    const ungraded = questionDetails.filter((q) => q.isCorrect === null)

    // Recommendation generation
    let recommendation = ""
    if (percentage >= 75) {
      recommendation = "Excellent performance. The applicant demonstrates strong academic readiness and is well-prepared for the desired class."
    } else if (percentage >= 60) {
      recommendation = "Good performance. The applicant meets the standard requirements and shows potential for academic success."
    } else if (percentage >= 45) {
      recommendation = "Average performance. The applicant may need additional academic support to succeed in the desired class."
    } else {
      recommendation = "Below average performance. Consideration should be given to the applicant's overall profile and potential for improvement."
    }

    // Radar chart data
    const radarData = subjectBreakdown.map((s) => ({
      subject: s.subjectName,
      score: s.percentage,
      fullMark: 100,
    }))

    return NextResponse.json({
      applicantName: `${app.firstName} ${app.lastName}`,
      classApplyingFor: app.classApplyingFor,
      examTitle: exam.title,
      totalScore,
      maxScore,
      percentage,
      passed: app.entranceExamPassed,
      // By subject
      subjectBreakdown,
      // Radar chart
      radarData,
      // Question by question
      questionAnalysis: questionDetails,
      // Stats
      totalQuestions: questionDetails.length,
      answeredCorrectly: strengths.length,
      answeredIncorrectly: weaknesses.length,
      ungraded: ungraded.length,
      // Strengths & Weaknesses
      strengths: strengths.map((q) => ({
        question: q.question,
        topic: q.topic,
        subjectId: q.subjectId,
        subjectName: subjectMap[q.subjectId] || "Unknown",
        points: q.points,
      })),
      weaknesses: weaknesses.map((q) => ({
        question: q.question,
        topic: q.topic,
        subjectId: q.subjectId,
        subjectName: subjectMap[q.subjectId] || "Unknown",
        points: q.points,
        userAnswer: q.userAnswer,
        correctAnswer: q.correctAnswer,
      })),
      // Recommendation
      recommendation,
      // Session info
      tabSwitches: session.tabSwitches,
      flagged: session.flagged,
      examDuration: exam.duration,
      submittedAt: session.updatedAt,
    })
  } catch (error) {
    console.error("Error fetching exam analysis:", error)
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 })
  }
}
