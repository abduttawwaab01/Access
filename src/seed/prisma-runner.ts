// ============================================================
// PRISMA SEED RUNNER – Populates the Neon database via db
// ============================================================

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

import {
  generateClasses,
  generateSubjects,
  generateStaff,
  generateStudents,
  generateParents,
  generateParentLinks,
  generateTeacherAssignments,
  generateTimetable,
  generateTopics,
  generateSchemeOfWork,
  generateLessonNotes,
  generateResults,
  generateReportCards,
  generateFeeStructures,
  generatePayments,
  generateBankDetails,
  generateSchoolSettings,
  generateAdmissionApplications,
  generateFeedbackTickets,
  resetIdCounter,
} from "./generators"
import { generateAllQuestions, generateExams, generateExamSessionsAndSubmissions } from "./questions"
import { SEED_SCHOOL, CURRENT_SESSION, TERM_NAMES } from "./data"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  resetIdCounter()

  // 1. School
  const school = await prisma.school.upsert({
    where: { slug: SEED_SCHOOL.slug },
    update: {
      settings: {
        loginEnabled: true,
        superAdminPassword: "successor",
      },
    },
    create: {
      name: SEED_SCHOOL.name,
      shortName: SEED_SCHOOL.shortName,
      slug: SEED_SCHOOL.slug,
      phone: SEED_SCHOOL.phone,
      email: SEED_SCHOOL.email,
      address: SEED_SCHOOL.address,
      primaryColor: SEED_SCHOOL.primaryColor,
      secondaryColor: SEED_SCHOOL.secondaryColor,
      accentColor: SEED_SCHOOL.accentColor,
      settings: {
        loginEnabled: true,
        superAdminPassword: "successor",
      },
    },
  })
  const schoolId = school.id
  console.log(`[Seed] School: ${school.name} (${schoolId})`)

  // 1b. Users (admin + teachers + students + parents) for login
  const passwordHash = await bcrypt.hash("successor", 10)
  const teacherPasswordHash = await bcrypt.hash("password123", 10)
  const studentPasswordHash = await bcrypt.hash("student123", 10)
  const parentPasswordHash = await bcrypt.hash("parent123", 10)
  const staffList = generateStaff()
  for (const s of staffList) {
    const email = s.email
    const existing = await prisma.user.findUnique({ where: { email } })
    const adminPw = email === "admin@skoolar.org"
    if (!existing) {
      await prisma.user.create({
        data: {
          name: `${s.firstName} ${s.lastName}`.trim(),
          email: s.email,
          password: adminPw ? passwordHash : teacherPasswordHash,
          role: s.role,
          phone: s.phone || null,
          schoolId,
        },
      })
    } else if (adminPw) {
      await prisma.user.update({
        where: { email },
        data: { password: passwordHash },
      })
    }
  }
  console.log(`[Seed] ${staffList.length} staff users created`)

  // 2. Academic session & terms
  let session = await prisma.academicSession.findFirst({
    where: { schoolId, isCurrent: true },
  })
  if (!session) {
    session = await prisma.academicSession.create({
      data: {
        name: CURRENT_SESSION,
        startDate: new Date("2024-09-09"),
        endDate: new Date("2025-07-18"),
        isCurrent: true,
        schoolId,
      },
    })
  }
  console.log(`[Seed] Session: ${session.name}`)

  const termStartEnd = [
    ["2024-09-09", "2024-12-13"],
    ["2025-01-06", "2025-03-28"],
    ["2025-04-14", "2025-07-18"],
  ]

  for (let i = 0; i < TERM_NAMES.length; i++) {
    const existing = await prisma.term.findFirst({
      where: { sessionId: session.id, name: TERM_NAMES[i] },
    })
    if (!existing) {
      await prisma.term.create({
        data: {
          name: TERM_NAMES[i],
          startDate: new Date(termStartEnd[i][0]),
          endDate: new Date(termStartEnd[i][1]),
          isCurrent: i === 0,
          sessionId: session.id,
        },
      })
    }
  }
  console.log(`[Seed] Terms: ${TERM_NAMES.join(", ")}`)

  // 3. Classes
  const classList = generateClasses()
  const createdClasses: any[] = []
  for (const c of classList) {
    const existing = await prisma.class.findFirst({
      where: { name: c.name, schoolId },
    })
    if (existing) {
      createdClasses.push(existing)
    } else {
      const created = await prisma.class.create({
        data: { id: c.id, name: c.name, section: c.section, schoolId },
      })
      createdClasses.push(created)
    }
  }
  console.log(`[Seed] ${createdClasses.length} classes`)

  // 4. Subjects
  const subjectList = generateSubjects(createdClasses)
  const createdSubjects: any[] = []
  for (const s of subjectList) {
    const existing = await prisma.subject.findFirst({
      where: { name: s.name, classId: s.classId, schoolId },
    })
    if (existing) {
      createdSubjects.push(existing)
    } else {
      const created = await prisma.subject.create({
        data: { id: s.id, name: s.name, code: s.code, classId: s.classId, schoolId },
      })
      createdSubjects.push(created)
    }
  }
  console.log(`[Seed] ${createdSubjects.length} subjects`)

  // 5. Topics
  const topicList = generateTopics(createdSubjects, createdClasses)
  await prisma.topic.deleteMany({ where: { schoolId } })
  // Batch insert in chunks of 100
  for (let i = 0; i < topicList.length; i += 100) {
    await prisma.topic.createMany({
      data: topicList.slice(i, i + 100).map((t: any) => ({
        id: t.id, name: t.name, subjectId: t.subjectId, schoolId,
      })),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${topicList.length} topics`)

  // 6. Timetable
  const timetableList = generateTimetable(createdClasses, createdSubjects)
  const randomTeacher = await prisma.staff.findFirst({ where: { schoolId } })
  const timetableData = timetableList.map((t: any) => {
    const subject = createdSubjects.find((s: any) => s.name === t.subject)
    return subject ? {
      id: t.id, day: t.day, period: t.time,
      subjectId: subject.id, classId: t.classId,
      teacherId: randomTeacher?.id || null,
      room: t.room || null, schoolId,
    } : null
  }).filter((t: any): t is NonNullable<typeof t> => t !== null)
  await prisma.timetableEntry.deleteMany({ where: { schoolId } })
  for (let i = 0; i < timetableData.length; i += 100) {
    await prisma.timetableEntry.createMany({
      data: timetableData.slice(i, i + 100),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${timetableData.length} timetable entries`)

  // 7. Scheme of Work
  const schemes = generateSchemeOfWork(createdClasses, createdSubjects)
  await prisma.schemeOfWork.deleteMany({ where: { schoolId } })
  for (let i = 0; i < schemes.length; i += 50) {
    await prisma.schemeOfWork.createMany({
      data: schemes.slice(i, i + 50).map((s: any) => ({
        id: s.id, classId: s.classId, subjectId: s.subjectId,
        title: s.title,
        content: { weeks: s.weeks, term: s.term, session: s.session },
        status: s.status || "published",
        createdBy: s.createdBy || null,
        approvedBy: s.approvedBy || null,
        approvedAt: s.approvedAt ? new Date(s.approvedAt) : null,
        schoolId,
      })),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${schemes.length} schemes of work`)

  // 8. Students
  const studentList = generateStudents(createdClasses)
  const createdStudents: any[] = []
  // Try createMany first, fall back to individual for getting back data
  const studentData = studentList.map((s: any) => ({
    id: s.id, firstName: s.firstName, lastName: s.lastName,
    studentId: s.studentId, email: s.email || null,
    dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth) : null,
    gender: s.gender || null, address: s.address || null,
    phone: s.phone || null, bloodGroup: s.bloodGroup || null,
    medicalNotes: s.medicalNotes || null,
    enrollmentDate: s.enrollmentDate ? new Date(s.enrollmentDate) : null,
    status: s.status || "active", classId: s.classId, schoolId,
  }))
  await prisma.student.deleteMany({ where: { schoolId } })
  for (let i = 0; i < studentData.length; i += 50) {
    await prisma.student.createMany({
      data: studentData.slice(i, i + 50),
      skipDuplicates: true,
    })
  }
  // Re-read to get created records
  for (const s of studentList) {
    const found = await prisma.student.findFirst({ where: { studentId: s.studentId } })
    if (found) createdStudents.push(found)
  }
  // Create student user accounts for login
  for (const s of studentList) {
    const email = s.email
    if (!email) continue
    const existing = await prisma.user.findUnique({ where: { email } })
    if (!existing) {
      await prisma.user.create({
        data: {
          name: `${s.firstName} ${s.lastName}`.trim(),
          email,
          password: studentPasswordHash,
          role: "student",
          schoolId,
        },
      })
    }
  }
  console.log(`[Seed] ${createdStudents.length} students`)

  // 9. Parents (from User model) — create if missing
  const parentList = generateParents()
  const parentEmails = parentList.map((p: any) => p.email)
  for (const p of parentList) {
    const existing = await prisma.user.findUnique({ where: { email: p.email } })
    if (!existing) {
      await prisma.user.create({
        data: {
          name: `${p.firstName} ${p.lastName}`.trim(),
          email: p.email,
          password: parentPasswordHash,
          role: "parent",
          phone: p.phone || null,
          schoolId,
        },
      })
    }
  }
  const createdParents = await prisma.user.findMany({
    where: { email: { in: parentEmails } },
  })
  console.log(`[Seed] ${createdParents.length} parents`)

  // 10. Parent Links
  const parentLinkList = generateParentLinks(createdStudents, createdParents)
  await prisma.parentLink.deleteMany({ where: { schoolId } })
  for (let i = 0; i < parentLinkList.length; i += 100) {
    await prisma.parentLink.createMany({
      data: parentLinkList.slice(i, i + 100).map((pl: any) => ({
        id: pl.id, parentId: pl.parentId, studentId: pl.studentId, schoolId,
      })),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${parentLinkList.length} parent links`)

  // 11. Questions (50 Math + 50 English per class)
  const adminUser = await prisma.user.findFirst({
    where: { schoolId, role: "admin" },
  })
  const adminId = adminUser?.id || "1"
  const allQuestions = generateAllQuestions(createdClasses, createdSubjects, adminId)
  await prisma.question.deleteMany({ where: { schoolId } })
  for (let i = 0; i < allQuestions.length; i += 100) {
    await prisma.question.createMany({
      data: allQuestions.slice(i, i + 100).map((q: any) => ({
        id: q.id,
        question: q.text,
        options: q.options || undefined,
        answer: q.correctAnswer || null,
        points: q.points,
        difficulty: q.difficulty || "medium",
        subjectId: q.subjectId,
        classId: q.classId,
        topic: q.topic || "General",
        approved: q.approved ?? true,
        approvedBy: q.approvedBy || null,
        approvedAt: q.approvedAt ? new Date(q.approvedAt) : null,
        createdBy: q.createdBy || null,
        schoolId,
      })),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${allQuestions.length} questions`)

  // 12. Exams
  const exams = generateExams(createdClasses, createdSubjects, allQuestions, adminId)
  await prisma.exam.deleteMany({ where: { schoolId } })
  for (const e of exams) {
    await prisma.exam.create({
      data: {
        id: e.id,
        title: e.title,
        description: e.description || null,
        duration: e.duration || 60,
        type: e.type || "objective",
        shuffleQuestions: e.shuffleQuestions ?? false,
        showResults: e.showResults ?? true,
        requireFullscreen: e.requireFullscreen ?? true,
        tabSwitchLimit: e.tabSwitchLimit ?? 3,
        allowCopyPaste: e.allowCopyPaste ?? false,
        maxAttempts: e.maxAttempts ?? 0,
        subjectId: e.subjectId,
        classId: e.classId,
        createdBy: e.createdBy || null,
        questions: e.questions || [],
        status: e.status || "draft",
        schoolId,
      },
    })
  }
  console.log(`[Seed] ${exams.length} exams`)

  // 13. Exam Sessions & Submissions
  const { sessions: examSessions, submissions } = generateExamSessionsAndSubmissions(
    exams,
    createdStudents,
    createdSubjects
  )
  for (const es of examSessions) {
    await prisma.examSession.create({
      data: {
        id: es.id,
        examId: es.examId,
        studentId: es.studentId,
        status: es.status || "completed",
        answers: es.answers || [],
        score: es.totalScore || 0,
        tabSwitches: es.tabSwitches || 0,
        flagged: es.flagged || false,
        schoolId,
      },
    }).catch(() => {})
  }
  for (const sub of submissions) {
    await prisma.submission.create({
      data: {
        id: sub.id,
        assignmentId: sub.sessionId,
        studentId: "",
        content: {},
        score: sub.totalScore || 0,
        feedback: sub.feedback || null,
        status: sub.status || "graded",
        schoolId,
      },
    }).catch(() => {})
  }
  console.log(`[Seed] ${examSessions.length} exam sessions, ${submissions.length} submissions`)

  // 14. Results
  const resultsList = generateResults(createdStudents, createdSubjects, createdClasses)
  const studentClassMap: Record<string, string> = {}
  createdStudents.forEach((s: any) => { studentClassMap[s.id] = s.classId })
  await prisma.result.deleteMany({ where: { schoolId } })
  for (let i = 0; i < resultsList.length; i += 100) {
    await prisma.result.createMany({
      data: resultsList.slice(i, i + 100).map((r: any) => ({
        id: r.id, studentId: r.studentId, subjectId: r.subjectId,
        classId: studentClassMap[r.studentId] || r.studentId,
        term: r.term || "First Term", session: r.session || null,
        caScore: r.caScore ?? 0, examScore: r.examScore ?? 0,
        caTotal: r.caTotal ?? null, examTotal: r.examTotal ?? null,
        total: r.total ?? 0, score: r.score ?? 0,
        totalMax: r.totalMax ?? null, grade: r.grade || "F",
        remark: r.remark || "Needs Improvement", schoolId,
      })),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${resultsList.length} results`)

  // 15. Report Cards
  const reportCards = generateReportCards(createdStudents, createdClasses, resultsList, [])
  await prisma.reportCard.deleteMany({ where: { schoolId } })
  for (let i = 0; i < reportCards.length; i += 50) {
    await prisma.reportCard.createMany({
      data: reportCards.slice(i, i + 50).map((rc: any) => ({
        id: rc.id, studentId: rc.studentId,
        data: rc,
        schoolId,
      })),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${reportCards.length} report cards`)

  // 16. Fee Structures
  const feeList = generateFeeStructures(createdClasses)
  await prisma.feeStructure.deleteMany({ where: { schoolId } })
  for (let i = 0; i < feeList.length; i += 50) {
    await prisma.feeStructure.createMany({
      data: feeList.slice(i, i + 50).map((fs: any) => ({
        id: fs.id, classId: fs.classId,
        amount: fs.total ?? 0,
        description: JSON.stringify({ className: fs.className, tuition: fs.tuition, development: fs.development, sports: fs.sports, library: fs.library, ict: fs.ict }),
        term: fs.term || "First Term", session: fs.session || "", schoolId,
      })),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${feeList.length} fee structures`)

  // 17. Payments
  const paymentList = generatePayments(createdStudents, feeList)
  await prisma.payment.deleteMany({ where: { schoolId } })
  for (let i = 0; i < paymentList.length; i += 100) {
    await prisma.payment.createMany({
      data: paymentList.slice(i, i + 100).map((p: any) => ({
        id: p.id, studentId: p.studentId,
        amount: p.amount ?? 0,
        status: p.status || "pending",
        confirmedBy: p.confirmedBy || null,
        confirmedAt: p.confirmedAt ? new Date(p.confirmedAt) : null, schoolId,
      })),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${paymentList.length} payments`)

  // 18. Admission Applications
  const admissionList = generateAdmissionApplications(createdClasses)
  await prisma.admissionApplication.deleteMany({ where: { schoolId } })
  for (const a of admissionList) {
    await prisma.admissionApplication.create({
      data: {
        id: a.id, firstName: a.firstName, lastName: a.lastName,
        email: a.email || null, phone: a.phone || null,
        classApplyingFor: a.classId || null,
        status: a.status || "pending",
        appliedAt: a.appliedAt ? new Date(a.appliedAt) : new Date(),
        dateOfBirth: a.dob ? new Date(a.dob) : null, gender: a.gender || null,
        address: a.address || null, schoolId,
      },
    })
  }
  console.log(`[Seed] ${admissionList.length} admission applications`)

  // 19. Feedback Tickets
  const feedbackList = generateFeedbackTickets()
  await prisma.feedbackTicket.deleteMany({ where: { schoolId } })
  for (const fb of feedbackList) {
    await prisma.feedbackTicket.create({
      data: {
        id: fb.id, from: fb.name || "",
        subject: fb.subject, message: fb.message,
        status: fb.status || "pending",
        createdAt: new Date(fb.createdAt),
        resolvedAt: fb.resolvedAt ? new Date(fb.resolvedAt) : null,
        resolution: fb.resolution || null, schoolId,
      },
    })
  }
  console.log(`[Seed] ${feedbackList.length} feedback tickets`)

  // 20. Lesson Notes
  const lessonNoteList = generateLessonNotes(createdClasses, createdSubjects, [])
  await prisma.lessonNote.deleteMany({ where: { schoolId } })
  for (let i = 0; i < lessonNoteList.length; i += 50) {
    await prisma.lessonNote.createMany({
      data: lessonNoteList.slice(i, i + 50).map((ln: any) => ({
        id: ln.id, classId: ln.classId, subjectId: ln.subjectId,
        title: ln.title,
        content: { html: ln.content, resources: ln.resources },
        topic: ln.title.split(":")[0] || ln.title,
        quiz: ln.quiz || [],
        status: ln.status || "published",
        createdBy: ln.createdBy || null,
        approvedBy: ln.approvedBy || null,
        approvedAt: ln.approvedAt ? new Date(ln.approvedAt) : null,
        schoolId,
      })),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${lessonNoteList.length} lesson notes`)

  // 21. Teacher Assignments
  const allStaff = await prisma.staff.findMany({ where: { schoolId } })
  const assignments = generateTeacherAssignments(allStaff.map((s) => ({ id: s.id, department: s.department || "" })), createdClasses, createdSubjects)
  await prisma.teacherAssignment.deleteMany({ where: { schoolId } })
  for (let i = 0; i < assignments.length; i += 50) {
    await prisma.teacherAssignment.createMany({
      data: assignments.slice(i, i + 50).map((a: any) => ({
        id: a.id, teacherId: a.teacherId,
        classIds: a.classIds || [], subjectIds: a.subjectIds || [],
        isClassTeacher: a.isClassTeacher || false, schoolId,
      })),
      skipDuplicates: true,
    })
  }
  console.log(`[Seed] ${assignments.length} teacher assignments`)

  // 22. Bank Details
  const bankData = generateBankDetails()
  await prisma.bankDetails.upsert({
    where: { id: bankData.id },
    update: {},
    create: {
      id: bankData.id,
      bankName: bankData.bankName,
      accountName: bankData.accountName,
      accountNumber: bankData.accountNumber,
      schoolId,
    },
  })
  console.log(`[Seed] Bank details saved`)

  // 23. School Settings via GradingConfig
  await prisma.gradingConfig.upsert({
    where: { id: "gc_default" },
    update: {},
    create: {
      id: "gc_default",
      gradeBoundaries: [
        { min: 75, grade: "A", remark: "Excellent" },
        { min: 65, grade: "B", remark: "Very Good" },
        { min: 55, grade: "C", remark: "Good" },
        { min: 45, grade: "D", remark: "Fair" },
        { min: 35, grade: "E", remark: "Poor" },
        { min: 0, grade: "F", remark: "Needs Improvement" },
      ],
      schoolId,
    },
  })
  console.log(`[Seed] Grading config saved`)

  console.log("\n========================================")
  console.log("  Seeding Complete!")
  console.log("========================================")
}

main()
  .catch((e) => {
    console.error("[Seed Runner] Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
