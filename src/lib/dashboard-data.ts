import { prisma } from "./prisma"
import { db } from "./prisma-store"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export interface AdminDashboardData {
  events: any[]
  pendingAdmissions: number
  pendingSalary: number
  draftReports: number
  pendingFeedback: number
  teachersMissingNotes: number
  outstandingFees: number
  upcomingExams: number
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [events, admissions, salary, reports, feedback, notes, feesData, exams] = await Promise.all([
    db.events.getAll({ upcoming: true }),
    db.admissionApplications.getAll().catch(() => []),
    db.salaryRecords.getAll().catch(() => []),
    db.weeklyReports.getAll().catch(() => []),
    db.feedbackTickets.getAll().catch(() => []),
    db.lessonNotes.getAll().catch(() => []),
    db.fees.getAll().catch(() => []),
    db.exams.getAll().catch(() => []),
  ])

  const admissionsArr = Array.isArray(admissions) ? admissions : []
  const salaryArr = Array.isArray(salary) ? salary : []
  const reportsArr = Array.isArray(reports) ? reports : []
  const feedbackArr = Array.isArray(feedback) ? feedback : []
  const notesArr = Array.isArray(notes) ? notes : []
  const feesArr = Array.isArray(feesData) ? feesData : []
  const examsArr = Array.isArray(exams) ? exams : []

  return {
    events: Array.isArray(events) ? events.slice(0, 5) : [],
    pendingAdmissions: admissionsArr.filter((a: any) => a.status === "pending").length,
    pendingSalary: salaryArr.filter((s: any) => s.status === "pending").length,
    draftReports: reportsArr.filter((r: any) => r.status === "draft").length,
    pendingFeedback: feedbackArr.filter((f: any) => f.status === "pending").length,
    teachersMissingNotes: notesArr.filter((n: any) => n.status === "draft").length,
    outstandingFees: feesArr.filter((f: any) => (f.outstanding || f.balance || 0) > 0).length,
    upcomingExams: examsArr.filter((e: any) => new Date(e.date) > new Date()).length,
  }
}

export interface TeacherDashboardData {
  teacher: any
  stats: { classes: number; students: number; lessons: number; assignments: number }
  lessons: any[]
  assignments: any[]
  schedule: any[]
  events: any[]
  attendanceMarked: boolean
}

export async function getTeacherDashboardData(userId: string): Promise<TeacherDashboardData> {
  const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()]

  const staffData = await db.staff.getByUserId(userId)
  if (!staffData) {
    return { teacher: null, stats: { classes: 0, students: 0, lessons: 0, assignments: 0 }, lessons: [], assignments: [], schedule: [], events: [], attendanceMarked: false }
  }
  const staffId = staffData.id || ""

  const ta = await db.teacherAssignments.getByTeacher(staffId)
  const classIds: string[] = (ta?.classIds as string[]) || []

  const [classes, notes, asgns, tt, evts, logs] = await Promise.all([
    db.classes.getAll().catch(() => []),
    db.lessonNotes.getAll().catch(() => []),
    db.assignments.getAll().catch(() => []),
    db.timetable.getAll().catch(() => []),
    db.events.getAll({ upcoming: true }).catch(() => []),
    db.attendanceLogs.getAll().catch(() => []),
  ])

  const notesArr = Array.isArray(notes) ? notes : []
  const asgnsArr = Array.isArray(asgns) ? asgns : []
  const ttArr = Array.isArray(tt) ? tt : []
  const classesArr = Array.isArray(classes) ? classes : []
  const evtsArr = Array.isArray(evts) ? evts : []
  const logsArr = Array.isArray(logs) ? logs : []

  const filteredNotes = classIds.length > 0 ? notesArr.filter((n: any) => classIds.includes(n.classId)) : notesArr
  const filteredAsgns = classIds.length > 0 ? asgnsArr.filter((a: any) => classIds.includes(a.classId)) : asgnsArr
  const filteredTT = classIds.length > 0 ? ttArr.filter((t: any) => classIds.includes(t.classId)) : ttArr

  const attendanceMarked = logsArr.some((l: any) => {
    const logDate = new Date(l.date || l.createdAt)
    const now = new Date()
    return logDate.toDateString() === now.toDateString()
  })

  return {
    teacher: staffData,
    stats: {
      classes: classIds.length || classesArr.length,
      students: classesArr.reduce((s: number, c: any) => s + (c.studentCount || 0), 0),
      lessons: filteredNotes.length,
      assignments: filteredAsgns.length,
    },
    lessons: filteredNotes.filter((n: any) => n.status === "draft").slice(0, 3),
    assignments: filteredAsgns.filter((a: any) => a.status === "active"),
    schedule: filteredTT.filter((t: any) => t.day === today),
    events: evtsArr.slice(0, 5),
    attendanceMarked,
  }
}

export interface StudentDashboardData {
  student: any
  studentId: string
  results: any[]
  attendance: any[]
  exams: any[]
  events: any[]
  activeSession: string
}

export async function getStudentDashboardData(userId: string): Promise<StudentDashboardData> {
  const student = await db.students.getByUserId(userId)
  if (!student) {
    return { student: null, studentId: "", results: [], attendance: [], exams: [], events: [], activeSession: "" }
  }
  const studentId = student.id

  const [r, a, e, evts, sessions] = await Promise.all([
    db.results.getByStudent(studentId).catch(() => []),
    db.attendance.getByStudent(studentId).catch(() => []),
    db.examSessions.getAll().catch(() => []),
    db.events.getAll({ upcoming: true }).catch(() => null),
    db.sessions.getAll().catch(() => null),
  ])

  const resultsArr = Array.isArray(r) ? r : []
  const attendanceArr = Array.isArray(a) ? a : []
  const examSessionsArr = Array.isArray(e) ? e : []
  const eventsArr = Array.isArray(evts) ? evts.slice(0, 5) : []
  const sessionsArr = Array.isArray(sessions) ? sessions : []

  const active = sessionsArr.find((s: any) => s.isActive || s.isCurrent)
  const activeSession = active?.name || ""

  return {
    student,
    studentId,
    results: resultsArr,
    attendance: attendanceArr,
    exams: examSessionsArr.filter((x: any) => x.studentId === studentId),
    events: eventsArr,
    activeSession,
  }
}

export interface ParentDashboardData {
  children: any[]
  gradeBoundaries: { min: number; grade: string; color: string }[]
  activeChildId: string
  activeChild: any
  results: any[]
  attendance: any
  fees: any
  events: any[]
}

async function buildChildrenList(userId: string): Promise<any[]> {
  const [links, students, classes] = await Promise.all([
    db.parentLinks.getAll().catch(() => []),
    db.students.getAll().catch(() => []),
    db.classes.getAll().catch(() => []),
  ])

  const myLinks = Array.isArray(links) ? links.filter((l: any) => l.parentId === userId) : []
  const allStudents = Array.isArray(students) ? students : []
  const allClasses = Array.isArray(classes) ? classes : []

  return myLinks.map((link: any) => {
    const student: any = allStudents.find((s: any) => s.id === link.studentId)
    const cls: any = student ? allClasses.find((c: any) => c.id === student.classId) : null
    if (!student) return null
    return {
      id: student.id,
      studentId: student.studentId || "",
      name: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName,
      className: cls ? `${cls.name}${cls.arm ? ` ${cls.arm}` : ""}` : "",
      arm: cls?.arm,
      classId: student.classId,
      image: student.image,
      relationship: link.relationship,
      passportPhoto: student.passportPhoto || "",
      gender: student.gender || "",
      dateOfBirth: student.dateOfBirth || "",
    }
  }).filter(Boolean)
}

async function getGradeBoundaries(): Promise<{ min: number; grade: string; color: string }[]> {
  const gradingConfig = await db.gradingConfig.get().catch(() => null)
  if (gradingConfig?.gradeBoundaries) {
    const sorted = [...gradingConfig.gradeBoundaries].sort((a: any, b: any) => b.min - a.min)
    const colors: Record<string, string> = { A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", E: "#ef4444", F: "#ef4444" }
    return sorted.map((g: any) => ({ min: g.min, grade: g.grade, color: colors[g.grade] || "#6b7280" }))
  }
  return [
    { min: 75, grade: "A", color: "#10b981" },
    { min: 60, grade: "B", color: "#3b82f6" },
    { min: 0, grade: "C", color: "#ef4444" },
  ]
}

export async function getParentDashboardData(userId: string): Promise<ParentDashboardData> {
  const [childrenList, boundaryColors] = await Promise.all([
    buildChildrenList(userId),
    getGradeBoundaries(),
  ])

  const activeChild = childrenList[0] || null
  const activeChildId = activeChild?.id || ""

  let results: any[] = []
  let attendance: any = {}
  let fees: any = {}
  let events: any[] = []

  if (activeChildId) {
    const [r, att, fee, evts] = await Promise.all([
      db.results.getByStudent(activeChildId).catch(() => []),
      db.attendance.getSummary(activeChildId).catch(() => ({})),
      db.fees.getSummary(activeChildId).catch(() => ({})),
      db.events.getAll({ upcoming: true }).catch(() => []),
    ])
    results = await mapSubjectNames(Array.isArray(r) ? r : [])
    attendance = att || {}
    fees = fee || {}
    events = Array.isArray(evts) ? evts.slice(0, 5) : []
  }

  return {
    children: childrenList,
    gradeBoundaries: boundaryColors,
    activeChildId,
    activeChild,
    results,
    attendance,
    fees,
    events,
  }
}

async function mapSubjectNames(results: any[]): Promise<any[]> {
  if (!results.length) return results
  const subjects = await prisma.subject.findMany({ select: { id: true, name: true } })
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s.name]))
  return results.map((r: any) => ({
    ...r,
    subject: subjectMap[r.subjectId] || r.subjectId,
  }))
}
