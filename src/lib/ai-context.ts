import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

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

async function buildSuperAdminContext(): Promise<ContextResult> {
  const [
    schools, students, classes, subjects, staff, results,
    lessonNotes, users, payments, feeStructures, exams,
    examSessions, questions, admissionApps, feedbackTickets,
    parentLinks, salaryRecords, announcements,
  ] = await Promise.all([
    prisma.school.findMany(),
    prisma.student.findMany(),
    prisma.class.findMany(),
    prisma.subject.findMany(),
    prisma.staff.findMany(),
    prisma.result.findMany(),
    prisma.lessonNote.findMany(),
    prisma.user.findMany(),
    prisma.payment.findMany(),
    prisma.feeStructure.findMany(),
    prisma.exam.findMany(),
    prisma.examSession.findMany(),
    prisma.question.findMany(),
    prisma.admissionApplication.findMany(),
    prisma.feedbackTicket.findMany(),
    prisma.parentLink.findMany(),
    prisma.salaryRecord.findMany(),
    prisma.announcement.findMany(),
  ])

  const teachers = staff.filter((s) => s.role === "teacher")
  const admins = staff.filter((s) => s.role === "admin")
  const parents = users.filter((u) => u.role === "parent")
  const studentUsers = users.filter((u) => u.role === "student")

  const resultsWithScores = results.filter((r) => r.total > 0 && r.score !== undefined)
  const avgScore = resultsWithScores.length > 0
    ? round(resultsWithScores.reduce((s, r) => s + (r.score / r.total) * 100, 0) / resultsWithScores.length)
    : 0
  const passRate = resultsWithScores.length > 0
    ? round(resultsWithScores.filter((r) => (r.score / r.total) * 100 >= 50).length / resultsWithScores.length * 100)
    : 0

  const classEnrollments = classes.map((c) => ({
    name: c.name,
    students: students.filter((s) => s.classId === c.id).length,
  }))

  const publishedNotes = lessonNotes.filter((n) => n.status === "published").length
  const draftNotes = lessonNotes.filter((n) => n.status === "draft" || n.status === "pending").length

  const totalRevenue = payments.reduce((s, p) => s + (p.status === "confirmed" ? p.amount : 0), 0)
  const pendingPayments = payments.filter((p) => p.status === "pending").length
  const pendingApps = admissionApps.filter((a) => a.status === "pending").length
  const openTickets = feedbackTickets.filter((t) => t.status === "open" || t.status === "pending").length
  const totalFees = feeStructures.reduce((s, f) => s + f.amount, 0)
  const totalSalaryPaid = salaryRecords.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0)

  const snapshot = {
    totalSchools: schools.length,
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalAdmins: admins.length,
    totalStaff: staff.length,
    totalClasses: classes.length,
    totalSubjects: subjects.length,
    totalParents: parents.length,
    totalStudentUsers: studentUsers.length,
    totalExams: exams.length,
    totalExamSessions: examSessions.length,
    totalQuestions: questions.length,
    totalLessonNotes: lessonNotes.length,
    totalAnnouncements: announcements.length,
    totalParentLinks: parentLinks.length,
    overallAvgScore: avgScore,
    passRate,
    publishedLessonNotes: publishedNotes,
    draftLessonNotes: draftNotes,
    totalRevenue,
    pendingPayments,
    totalFeesOwed: totalFees,
    totalSalaryPaid,
    pendingAdmissionApps: pendingApps,
    openFeedbackTickets: openTickets,
    classEnrollments,
  }

  const systemPrompt = `You are an AI assistant for the Super Admin of the entire school management system.
You have FULL access to ALL data across ALL schools. Answer helpfully and concisely — use bullet points, bold text, and short paragraphs.

SYSTEM OVERVIEW:
- Schools: ${snapshot.totalSchools}
- Students: ${snapshot.totalStudents} | Teachers: ${snapshot.totalTeachers} | Staff: ${snapshot.totalStaff}
- Classes: ${snapshot.totalClasses} | Subjects: ${snapshot.totalSubjects}
- Parent accounts: ${snapshot.totalParents} | Student accounts: ${snapshot.totalStudentUsers}
- Parent-student links: ${snapshot.totalParentLinks}

ACADEMICS:
- Overall average score: ${snapshot.overallAvgScore}% | Pass rate: ${snapshot.passRate}%
- Lesson notes: ${snapshot.publishedLessonNotes} published, ${snapshot.draftLessonNotes} drafts
- Exams created: ${snapshot.totalExams} | Exam sessions: ${snapshot.totalExamSessions}
- Questions in bank: ${snapshot.totalQuestions}

Class breakdown:
${snapshot.classEnrollments.map((c) => `- ${c.name}: ${c.students} students`).join("\n")}

FINANCE:
- Total confirmed revenue: $${snapshot.totalRevenue.toLocaleString()}
- Pending payments: ${snapshot.pendingPayments}
- Total fee structures: $${snapshot.totalFeesOwed.toLocaleString()}
- Total salary paid: $${snapshot.totalSalaryPaid.toLocaleString()}

OPERATIONS:
- Pending admission applications: ${snapshot.pendingAdmissionApps}
- Open feedback/support tickets: ${snapshot.openFeedbackTickets}
- Active announcements: ${snapshot.totalAnnouncements}

You help with: system-wide analytics, financial insights, school management, data summaries, operational overview, user management insights.
Always format responses with clear structure. If the answer requires specific data not in this snapshot, note what data you'd need.`

  const contextSummary = `System: ${snapshot.totalSchools} schools | ${snapshot.totalStudents} students, ${snapshot.totalTeachers} teachers | Avg: ${snapshot.overallAvgScore}% | Revenue: $${snapshot.totalRevenue.toLocaleString()}`

  return { systemPrompt, contextSummary }
}

export async function buildContext(role: string, userId?: string): Promise<ContextResult> {
  if (role === "superadmin") {
    return buildSuperAdminContext()
  }
  if (role === "teacher" && userId) {
    return buildTeacherContext(userId)
  }
  return buildAdminContext()
}