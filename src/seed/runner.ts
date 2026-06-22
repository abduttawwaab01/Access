// ============================================================
// SEED RUNNER – Populates the in-memory store with seed data
// ============================================================

import {
  generateSession,
  generateTerms,
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
  generateAttendanceRecords,
  generateResults,
  generateReportCards,
  generateFeeStructures,
  generatePayments,
  generateBankDetails,
  generateSchoolSettings,
  generateAdmissionApplications,
  generateFeedbackTickets,
} from "./generators"
import { generateAllQuestions, generateExams, generateExamSessionsAndSubmissions } from "./questions"
import { SEED_SCHOOL } from "./data"

let seeded = false

export function runSeed(store: any) {
  if (seeded) return
  // Guard: only seed if store is empty
  if (store.classes.getAll().length > 0) {
    seeded = true
    return
  }

  console.log("[Seed] Starting data seeding...")

  // 1. School settings & bank details
  store.schoolSettings.update(generateSchoolSettings())
  store.bankDetails.update(generateBankDetails())

  // 2. Academic session & terms
  const session = generateSession()
  // Directly push session/terms since store doesn't have session/term methods that match
  // We'll use a workaround by calling internal methods
  // Actually, the store doesn't expose sessions/terms directly in the exported "store" object
  // Let me check what the store exposes...

  // The store has: sessions, terms. Let me use them.
  const createdSession = (store as any).sessions.create(session)
  const termNames = ["First Term", "Second Term", "Third Term"]
  const terms = termNames.map((name, i) =>
    (store as any).terms.create({
      name,
      startDate: ["2024-09-09", "2025-01-06", "2025-04-14"][i] + "T00:00:00.000Z",
      endDate: ["2024-12-13", "2025-03-28", "2025-07-18"][i] + "T00:00:00.000Z",
      isCurrent: i === 0,
      sessionId: createdSession.id,
    })
  )

  // 3. Classes
  const classList = generateClasses()
  const createdClasses = classList.map((c) => store.classes.create(c))

  // 4. Subjects
  const subjectList = generateSubjects(createdClasses)
  const createdSubjects = subjectList.map((s) => store.subjects.create(s))

  // 5. Staff (admin + 5 teachers)
  const staffList = generateStaff()
  const createdStaff = staffList.map((s) => store.staff.create(s))

  // 6. Students
  const studentList = generateStudents(createdClasses)
  const createdStudents = studentList.map((s) => store.students.create(s))

  // 7. Parents
  const parentList = generateParents()
  const createdParents = parentList.map((p) => store.parents.create(p))

  // 8. Parent links
  const parentLinks = generateParentLinks(createdStudents, createdParents)
  parentLinks.forEach((pl) => (store as any).parentLinks.create(pl))

  // 9. Teacher assignments
  const assignments = generateTeacherAssignments(createdStaff, createdClasses, createdSubjects)
  assignments.forEach((a) => (store as any).teacherAssignments.create(a))

  // 10. Timetable
  const timetable = generateTimetable(createdClasses, createdSubjects)
  timetable.forEach((t) => (store as any).timetable.create(t))

  // 11. Topics
  const topics = generateTopics(createdSubjects, createdClasses)
  topics.forEach((t) => (store as any).topics.create(t))

  // 13. Scheme of Work
  const schemes = generateSchemeOfWork(createdClasses, createdSubjects)
  schemes.forEach((s) => (store as any).schemeOfWorks.create(s))

  // 14. Lesson Notes
  const lessonNotes = generateLessonNotes(createdClasses, createdSubjects, createdStaff)
  lessonNotes.forEach((ln) => (store as any).lessonNotes.create(ln))

  // 15. Questions (100+ Math & English)
  const adminId = createdStaff[0]?.id || "1"
  const allQuestions = generateAllQuestions(createdClasses, createdSubjects, adminId)
  const createdQuestions = allQuestions.map((q) => (store as any).questions.create(q))

  // 16. Exams
  const exams = generateExams(createdClasses, createdSubjects, createdQuestions, adminId)
  const createdExams = exams.map((e) => (store as any).exams.create(e))

  // 17. Exam Sessions & Submissions
  const { sessions: examSessions, submissions } = generateExamSessionsAndSubmissions(
    createdExams,
    createdStudents,
    createdSubjects
  )
  examSessions.forEach((es) => (store as any).examSessions.create(es))
  submissions.forEach((s) => (store as any).submissions.create(s))

  // 18. Attendance Records
  const attendanceRecords = generateAttendanceRecords(createdStudents)
  // Store doesn't have a direct create for attendance, so we push directly via results-like approach
  // Using the store's internal pattern
  attendanceRecords.forEach((ar) => {
    // attendanceRecords are stored as a raw array via the store.attendance but there's no create
    // Let's simulate creation through the store's internal attachment
    // Actually, looking at the store, there's no store.attendance.create
    // We'll need to use the raw approach - add to the array directly
    // Since we can't access the internal arrays, let's use a workaround
    // The store has attendanceLogs which has a create method
    ;(store as any).attendanceLogs.create({
      userId: ar.studentId,
      userType: "student",
      date: ar.date,
      time: ar.timeIn || "08:00",
      status: ar.status,
      method: "manual",
    })
  })

  // 19. Results (full scores for report cards)
  const allResults = generateResults(createdStudents, createdSubjects, createdClasses)
  allResults.forEach((r) => (store as any).results.create(r))

  // 20. Report Cards
  const reportCards = generateReportCards(
    createdStudents,
    createdClasses,
    allResults,
    attendanceRecords
  )
  reportCards.forEach((rc) => (store as any).reportCards.create(rc))

  // 21. Fee Structures
  const feeStructures = generateFeeStructures(createdClasses)
  feeStructures.forEach((fs) => (store as any).feeStructures.create(fs))

  // 22. Payments
  const payments = generatePayments(createdStudents, feeStructures)
  payments.forEach((p) => (store as any).payments.create(p))

  // 23. Admission Applications
  const admissions = generateAdmissionApplications(createdClasses)
  admissions.forEach((a) => (store as any).admissionApplications.create(a))

  // 24. Feedback Tickets
  const feedbackTickets = generateFeedbackTickets()
  feedbackTickets.forEach((t) => (store as any).feedbackTickets.create(t))

  seeded = true
  console.log("[Seed] Seeding complete!")
  console.log(`  - ${createdClasses.length} classes`)
  console.log(`  - ${createdSubjects.length} subjects`)
  console.log(`  - ${createdStaff.length} staff`)
  console.log(`  - ${createdStudents.length} students`)
  console.log(`  - ${createdParents.length} parents`)
  console.log(`  - ${allQuestions.length} questions`)
  console.log(`  - ${exams.length} exams`)
  console.log(`  - ${allResults.length} results`)
  console.log(`  - ${schemes.length} schemes of work`)
  console.log(`  - ${lessonNotes.length} lesson notes`)
  console.log(`  - ${attendanceRecords.length} attendance records`)
  console.log(`  - ${reportCards.length} report cards`)
  console.log(`  - ${timetable.length} timetable entries`)
  console.log(`  - ${feeStructures.length} fee structures`)
  console.log(`  - ${payments.length} payments`)
}
