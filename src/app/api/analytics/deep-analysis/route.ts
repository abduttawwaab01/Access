import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const classId = searchParams.get("classId")
  const subject = searchParams.get("subject")

  if (classId) {
    const analysis = store.lessonQuizResults.getClassAnalysis(classId)
    const students = store.students.getAll()
    const subjects = store.subjects.getAll()
    const gapAnalysis = analysis.students
      .map((s: any) => {
        const weakSubjects: string[] = []
        const strongSubjects: string[] = []
        Object.entries(s.subjectBreakdown).forEach(([sub, data]: [string, any]) => {
          const rate = data.total > 0 ? (data.correct / data.total) * 100 : 0
          if (rate < 50) weakSubjects.push(sub)
          else if (rate >= 80) strongSubjects.push(sub)
        })
        return { ...s, weakSubjects, strongSubjects }
      })
      .sort((a: any, b: any) => a.masteryRate - b.masteryRate)
    const classMasteryLevel = analysis.classMastery >= 80 ? "High" : analysis.classMastery >= 50 ? "Medium" : "Low"
    return NextResponse.json({ ...analysis, gapAnalysis, classMasteryLevel })
  }

  if (studentId) {
    const student = store.students.getById(studentId)
    const analysis = store.lessonQuizResults.getAnalysis(studentId)
    const examResults = store.results.getByStudent(studentId)
    const classId = student?.classId
    const allNotes = store.lessonNotes.getAll(classId)
    const attemptedNotes = store.lessonQuizResults.getByStudent(studentId)
    const notesWithQuiz = allNotes.filter((n: any) => n.quiz && n.quiz.length > 0)
    const subjects = store.subjects.getAll()

    const subjectMastery: Record<string, { total: number; correct: number; quizCount: number }> = {}
    const subMap: Record<string, string> = {}
    subjects.forEach((s: any) => { subMap[s.id] = s.name })

    attemptedNotes.forEach((r: any) => {
      const sub = r.subject || "General"
      if (!subjectMastery[sub]) subjectMastery[sub] = { total: 0, correct: 0, quizCount: 0 }
      subjectMastery[sub].total += r.totalQuestions || 0
      subjectMastery[sub].correct += r.correctAnswers || 0
      subjectMastery[sub].quizCount += 1
    })

    examResults.forEach((r: any) => {
      const sub = r.subject || "General"
      if (!subjectMastery[sub]) subjectMastery[sub] = { total: 0, correct: 0, quizCount: 0 }
      subjectMastery[sub].total += r.total || 100
      subjectMastery[sub].correct += r.score || 0
    })

    const subjectAnalysis = Object.entries(subjectMastery).map(([sub, data]) => ({
      subject: sub,
      totalQuestions: data.total,
      correctAnswers: data.correct,
      masteryRate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      quizCount: data.quizCount,
      level: data.total > 0 ? (data.correct / data.total) >= 0.8 ? "Mastered" : (data.correct / data.total) >= 0.5 ? "Developing" : "Needs Improvement" : "No Data",
    }))

    const weakAreas = subjectAnalysis.filter((s: any) => s.masteryRate < 50)
    const strengths = subjectAnalysis.filter((s: any) => s.masteryRate >= 80)

    return NextResponse.json({
      studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
      classId: student?.classId,
      overall: {
        totalQuizAttempts: analysis.totalAttempts,
        totalQuestions: analysis.totalQuestions + examResults.reduce((s: number, r: any) => s + (r.total || 100), 0),
        totalCorrect: analysis.totalCorrect + examResults.reduce((s: number, r: any) => s + (r.score || 0), 0),
        masteryRate: analysis.totalQuestions + examResults.reduce((s: number, r: any) => s + (r.total || 100), 0) > 0
          ? Math.round(((analysis.totalCorrect + examResults.reduce((s: number, r: any) => s + (r.score || 0), 0)) / (analysis.totalQuestions + examResults.reduce((s: number, r: any) => s + (r.total || 100), 0))) * 100) : 0,
        masteryLevel: "",
      },
      subjectAnalysis,
      weakAreas,
      strengths,
      lessonQuizProgress: { total: notesWithQuiz.length, attempted: attemptedNotes.length, remaining: notesWithQuiz.length - attemptedNotes.length },
    })
  }

  const allStudents = store.students.getAll()
  const classList = store.classes.getAll()
  const classAnalyses = classList.map((c: any) => {
    const analysis = store.lessonQuizResults.getClassAnalysis(c.id)
    return {
      classId: c.id,
      className: `${c.name}${c.arm ? ` ${c.arm}` : ""}`,
      ...analysis,
    }
  })
  return NextResponse.json({ classAnalyses, totalStudents: allStudents.length })
}
