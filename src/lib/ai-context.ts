import { db } from "@/lib/prisma-store"

interface ContextResult {
  systemPrompt: string
  contextSummary: string
}

function round(v: number) {
  return Math.round(v * 10) / 10
}

async function buildAdminContext(): Promise<ContextResult> {
  const students = await db.students.getAll()
  const classes = await db.classes.getAll()
  const staff = await db.staff.getAll()
  const subjects = await db.subjects.getAll()
  const results = await db.results.getAll()
  const schoolSettings = await db.school.get()
  const lessonNotes = await db.lessonNotes.getAll()

  const teachers = staff.filter((s: any) => s.role === "teacher")
  const classEnrollments = classes.map((c: any) => ({
    name: c.name,
    students: students.filter((s: any) => s.classId === c.id).length,
  }))

  const resultsWithScores = results.filter((r: any) => r.total > 0 && r.score !== undefined)
  const avgScore = resultsWithScores.length > 0
    ? round(resultsWithScores.reduce((s: number, r: any) => s + (r.score / r.total) * 100, 0) / resultsWithScores.length)
    : 0
  const passRate = resultsWithScores.length > 0
    ? round(resultsWithScores.filter((r: any) => (r.score / r.total) * 100 >= 50).length / resultsWithScores.length * 100)
    : 0

  const classAverages = classes.map((c: any) => {
    const studentIds = students.filter((s: any) => s.classId === c.id).map((s: any) => s.id)
    const clsResults = resultsWithScores.filter((r: any) => studentIds.includes(r.studentId))
    const avg = clsResults.length > 0
      ? round(clsResults.reduce((s: number, r: any) => s + (r.score / r.total) * 100, 0) / clsResults.length)
      : 0
    return { className: c.name, avgScore: avg, studentCount: studentIds.length }
  })

  const publishedNotes = lessonNotes.filter((n: any) => n.status === "published").length
  const draftNotes = lessonNotes.filter((n: any) => n.status === "draft" || n.status === "pending").length

  const snapshot = {
    schoolName: (schoolSettings as any)?.name || "Access School",
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    totalSubjects: subjects.length,
    totalResults: resultsWithScores.length,
    overallAvgScore: avgScore,
    passRate,
    publishedLessonNotes: publishedNotes,
    draftLessonNotes: draftNotes,
    classEnrollments,
    classAverages,
  }

  const systemPrompt = `You are an AI assistant for the school admin at "${snapshot.schoolName}".
You have FULL access to all school data. Answer helpfully and concisely — use bullet points, bold text, and short paragraphs.

SCHOOL SNAPSHOT:
- Students: ${snapshot.totalStudents} across ${snapshot.totalClasses} classes
- Teachers: ${snapshot.totalTeachers} | Subjects offered: ${snapshot.totalSubjects}
- Overall average score: ${snapshot.overallAvgScore}% | Pass rate: ${snapshot.passRate}%
- Lesson notes: ${snapshot.publishedLessonNotes} published, ${snapshot.draftLessonNotes} drafts

Class breakdown:
${snapshot.classEnrollments.map((c: any) => `- ${c.name}: ${c.students} students`).join("\n")}

Per-class averages:
${snapshot.classAverages.map((c: any) => `- ${c.className}: ${c.avgScore}% avg (${c.studentCount} students)`).join("\n")}

You help with: lesson notes, student insights, analytics, drafting announcements, teacher management, admin tasks.
Always format responses with clear structure. If the answer requires specific data not in this snapshot, note what data you'd need.`

  const contextSummary = `School: ${snapshot.schoolName} | ${snapshot.totalStudents} students, ${snapshot.totalTeachers} teachers, ${snapshot.totalClasses} classes | Avg: ${snapshot.overallAvgScore}% | Pass: ${snapshot.passRate}%`

  return { systemPrompt, contextSummary }
}

async function buildTeacherContext(teacherId: string): Promise<ContextResult> {
  const ta = await db.teacherAssignments.getByTeacher(teacherId)
  const teacher = await db.staff.getById(teacherId)
  const schoolSettings = await db.school.get()

  if (!ta) {
    return {
      systemPrompt: `You are an AI assistant for a teacher at "${(schoolSettings as any)?.name || "Access School"}".
No class assignments found for your account. Please contact the admin.
Answer general teaching questions concisely with bullet points.`,
      contextSummary: "No class assignments",
    }
  }

  const students = await db.students.getAll()
  const classes = await db.classes.getAll()
  const subjects = await db.subjects.getAll()
  const results = await db.results.getAll()
  const lessonNotes = await db.lessonNotes.getAll()
  const assignments = await db.assignments.getAll()

  const taClassIds = (ta as any).classIds || []
  const taSubjectIds = (ta as any).subjectIds || []
  const myClasses = classes.filter((c: any) => taClassIds.includes(c.id))
  const mySubjects = subjects.filter((s: any) => taSubjectIds.includes(s.id))
  const myStudents = students.filter((s: any) => taClassIds.includes(s.classId))
  const myLessonNotes = lessonNotes.filter((n: any) => n.createdBy === teacherId)
  const myAssignments = assignments.filter((a: any) => taClassIds.includes(a.classId))

  const classData = myClasses.map((c: any) => {
    const clsStudents = myStudents.filter((s: any) => s.classId === c.id)
    const clsResults = results.filter((r: any) => clsStudents.map((s: any) => s.id).includes(r.studentId))
    const avgScore = clsResults.length > 0
      ? round(clsResults.reduce((s: number, r: any) => s + (r.score / r.total) * 100, 0) / clsResults.length)
      : 0
    return {
      name: c.name,
      studentCount: clsStudents.length,
      avgScore,
    }
  })

  const publishedNotes = myLessonNotes.filter((n: any) => n.status === "published").length
  const draftNotes = myLessonNotes.filter((n: any) => n.status === "draft" || n.status === "pending").length
  const activeAssignments = myAssignments.filter((a: any) => a.status === "active").length

  const snapshot = {
    schoolName: (schoolSettings as any)?.name || "Access School",
    teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "Teacher",
    classes: myClasses.map((c: any) => c.name),
    subjects: mySubjects.map((s: any) => s.name),
    totalStudents: myStudents.length,
    lessonNotes: { published: publishedNotes, draft: draftNotes },
    activeAssignments,
    classData,
  }

  const systemPrompt = `You are an AI assistant for ${snapshot.teacherName}, a teacher at "${snapshot.schoolName}".
You ONLY see data for your assigned classes and students.

YOUR CLASSES: ${snapshot.classes.join(", ") || "None"}
YOUR SUBJECTS: ${snapshot.subjects.join(", ") || "None"}
YOUR STUDENTS: ${snapshot.totalStudents} total

Class details:
${snapshot.classData.map((c: any) => `- ${c.name}: ${c.studentCount} students (avg score: ${c.avgScore}%)`).join("\n")}

Your lesson notes: ${snapshot.lessonNotes.published} published, ${snapshot.lessonNotes.draft} drafts
Your active assignments: ${snapshot.activeAssignments}

You help with: lesson planning, teaching strategies, student performance insights, report comments, quiz/assignment ideas.
Always format responses with clear structure using bullet points and bold text.`

  const contextSummary = `${snapshot.teacherName} | ${snapshot.classes.join(", ")} | ${snapshot.totalStudents} students`

  return { systemPrompt, contextSummary }
}

export async function buildContext(role: string, userId?: string): Promise<ContextResult> {
  if (role === "teacher" && userId) {
    return buildTeacherContext(userId)
  }
  return buildAdminContext()
}