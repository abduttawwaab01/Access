const uid = () => String(Date.now()) + Math.random().toString(36).slice(2, 8)

const PERSIST = "__opencode_store_v1"

function g<T>(key: string, init: T): T {
  if (typeof globalThis === "undefined") return init
  const root = ((globalThis as any)[PERSIST] as Record<string, any>) || ((globalThis as any)[PERSIST] = {})
  return (root[key] ?? (root[key] = init))
}

let sessions: any[] = g("sessions", [])
let terms: any[] = g("terms", [])
let classes: any[] = g("classes", [])
let subjects: any[] = g("subjects", [])
let students: any[] = g("students", [])
let parents: any[] = g("parents", [])
let staff: any[] = g("staff", [])
let teacherAssignments: any[] = g("teacherAssignments", [])
let lessonNotes: any[] = g("lessonNotes", [])
let schemeOfWorks: any[] = g("schemeOfWorks", [])
let assignments: any[] = g("assignments", [])
let timetable: any[] = g("timetable", [])
let announcements: any[] = g("announcements", [])
let results: any[] = g("results", [])
let attendanceRecords: any[] = g("attendanceRecords", [])
let fees: any[] = g("fees", [])
let parentLinks: any[] = g("parentLinks", [])
let attendanceLogs: any[] = g("attendanceLogs", [])
let attendanceQRCodes: any[] = g("attendanceQRCodes", [])
let reportCards: any[] = g("reportCards", [])
let topics: any[] = g("topics", [])
let lessonQuizResults: any[] = g("lessonQuizResults", [])
let questions: any[] = g("questions", [])
let exams: any[] = g("exams", [])
let examSessions: any[] = g("examSessions", [])
let submissions: any[] = g("submissions", [])
let bankDetails: any = g("bankDetails", {})
let feeStructures: any[] = g("feeStructures", [])
let payments: any[] = g("payments", [])
let salaryRecords: any[] = g("salaryRecords", [])
let salaryStructures: any[] = g("salaryStructures", [])
let documents: any[] = g("documents", [])
let gradingConfigData: any = g("gradingConfigData", {})
let schoolSettingsData: any = g("schoolSettingsData", {})
let admissionApplications: any[] = g("admissionApplications", [])
let admissionSettingsData: any = g("admissionSettingsData", {})
let superAnnouncements: any[] = g("superAnnouncements", [])
let feedbackTickets: any[] = g("feedbackTickets", [])
let weeklyReports: any[] = g("weeklyReports", [])
let events: any[] = g("events", [])

export const store = {
  sessions: {
    getAll: () => sessions,
    getById: (id: string) => sessions.find((s) => s.id === id),
    create: (data: any) => { const item = { id: uid(), ...data }; sessions.push(item); return item },
    update: (id: string, data: any) => { const idx = sessions.findIndex((s) => s.id === id); if (idx === -1) return null; sessions[idx] = { ...sessions[idx], ...data }; return sessions[idx] },
    delete: (id: string) => { const idx = sessions.findIndex((s) => s.id === id); if (idx === -1) return false; sessions.splice(idx, 1); return true },
  },
  terms: {
    getAll: (sessionId?: string) => sessionId ? terms.filter((t) => t.sessionId === sessionId) : terms,
    getById: (id: string) => terms.find((t) => t.id === id),
    create: (data: any) => { const item = { id: uid(), ...data }; terms.push(item); return item },
    update: (id: string, data: any) => { const idx = terms.findIndex((t) => t.id === id); if (idx === -1) return null; terms[idx] = { ...terms[idx], ...data }; return terms[idx] },
    delete: (id: string) => { const idx = terms.findIndex((t) => t.id === id); if (idx === -1) return false; terms.splice(idx, 1); return true },
  },
  classes: {
    getAll: () => classes,
    getById: (id: string) => classes.find((c) => c.id === id),
    create: (data: any) => { const item = { id: uid(), ...data }; classes.push(item); return item },
    update: (id: string, data: any) => { const idx = classes.findIndex((c) => c.id === id); if (idx === -1) return null; classes[idx] = { ...classes[idx], ...data }; return classes[idx] },
    delete: (id: string) => { const idx = classes.findIndex((c) => c.id === id); if (idx === -1) return false; classes.splice(idx, 1); return true },
  },
  subjects: {
    getAll: (classId?: string) => classId ? subjects.filter((s) => s.classId === classId) : subjects,
    getById: (id: string) => subjects.find((s) => s.id === id),
    create: (data: any) => { const item = { id: uid(), ...data }; subjects.push(item); return item },
    update: (id: string, data: any) => { const idx = subjects.findIndex((s) => s.id === id); if (idx === -1) return null; subjects[idx] = { ...subjects[idx], ...data }; return subjects[idx] },
    delete: (id: string) => { const idx = subjects.findIndex((s) => s.id === id); if (idx === -1) return false; subjects.splice(idx, 1); return true },
  },
  students: {
    getAll: (classId?: string) => classId ? students.filter((s) => s.classId === classId) : students,
    getById: (id: string) => students.find((s) => s.id === id),
    getByEmail: (email: string) => students.find((s) => s.email === email),
    create: (data: any) => { const item = { id: uid(), studentId: `STU${Date.now()}`, ...data, status: "active" }; students.push(item); return item },
    update: (id: string, data: any) => { const idx = students.findIndex((s) => s.id === id); if (idx === -1) return null; students[idx] = { ...students[idx], ...data }; return students[idx] },
    delete: (id: string) => { const idx = students.findIndex((s) => s.id === id); if (idx === -1) return false; students.splice(idx, 1); return true },
  },
  parents: {
    getAll: () => parents,
    getById: (id: string) => parents.find((p) => p.id === id),
    getByEmail: (email: string) => parents.find((p) => p.email === email),
    create: (data: any) => { const item = { id: uid(), ...data }; parents.push(item); return item },
    update: (id: string, data: any) => { const idx = parents.findIndex((p) => p.id === id); if (idx === -1) return null; parents[idx] = { ...parents[idx], ...data }; return parents[idx] },
    delete: (id: string) => { const idx = parents.findIndex((p) => p.id === id); if (idx === -1) return false; parents.splice(idx, 1); return true },
  },
  staff: {
    getAll: () => staff,
    getByEmail: (email: string) => staff.find((s) => s.email === email),
    getById: (id: string) => staff.find((s) => s.id === id),
    create: (data: any) => { const item = { id: uid(), staffId: `STF${Date.now()}`, ...data, status: "active" }; staff.push(item); return item },
    update: (id: string, data: any) => { const idx = staff.findIndex((s) => s.id === id); if (idx === -1) return null; staff[idx] = { ...staff[idx], ...data }; return staff[idx] },
    delete: (id: string) => { const idx = staff.findIndex((s) => s.id === id); if (idx === -1) return false; staff.splice(idx, 1); return true },
  },
  teacherAssignments: {
    getAll: () => teacherAssignments,
    getByTeacher: (teacherId: string) => teacherAssignments.find((a) => a.teacherId === teacherId),
    create: (data: any) => { const item = { id: uid(), ...data }; teacherAssignments.push(item); return item },
    update: (teacherId: string, data: any) => { const idx = teacherAssignments.findIndex((a) => a.teacherId === teacherId); if (idx === -1) return null; teacherAssignments[idx] = { ...teacherAssignments[idx], ...data }; return teacherAssignments[idx] },
    delete: (id: string) => { const idx = teacherAssignments.findIndex((a) => a.id === id); if (idx === -1) return false; teacherAssignments.splice(idx, 1); return true },
  },
  lessonNotes: {
    getAll: (classId?: string) => classId ? lessonNotes.filter((n) => n.classId === classId) : lessonNotes,
    getAllPublished: (classId?: string) => classId ? lessonNotes.filter((n) => n.classId === classId && n.status === "published") : lessonNotes.filter((n) => n.status === "published"),
    getByTeacher: (teacherId: string) => { const ta = teacherAssignments.find((a) => a.teacherId === teacherId); if (!ta) return []; return lessonNotes.filter((n) => ta.classIds.includes(n.classId)) },
    getById: (id: string) => lessonNotes.find((n) => n.id === id),
    create: (data: any) => { const item = { id: uid(), ...data, quiz: data.quiz || [], status: data.status || "draft", createdAt: new Date().toISOString().split("T")[0], approvedBy: data.approvedBy || null, approvedAt: data.approvedAt || null }; lessonNotes.push(item); return item },
    update: (id: string, data: any) => { const idx = lessonNotes.findIndex((n) => n.id === id); if (idx === -1) return null; lessonNotes[idx] = { ...lessonNotes[idx], ...data }; return lessonNotes[idx] },
    delete: (id: string) => { const idx = lessonNotes.findIndex((n) => n.id === id); if (idx === -1) return false; lessonNotes.splice(idx, 1); return true },
    approve: (id: string, approvedBy: string) => { const idx = lessonNotes.findIndex((n) => n.id === id); if (idx === -1) return null; lessonNotes[idx] = { ...lessonNotes[idx], status: "published", approvedBy, approvedAt: new Date().toISOString() }; return lessonNotes[idx] },
    reject: (id: string) => { const idx = lessonNotes.findIndex((n) => n.id === id); if (idx === -1) return null; lessonNotes[idx] = { ...lessonNotes[idx], status: "rejected", rejectedAt: new Date().toISOString() }; return lessonNotes[idx] },
    getPending: () => lessonNotes.filter((n) => n.status === "draft" || n.status === "pending"),
  },
  schemeOfWorks: {
    getAll: (classId?: string, subjectId?: string) => { let result = [...schemeOfWorks]; if (classId) result = result.filter((s) => s.classId === classId); if (subjectId) result = result.filter((s) => s.subjectId === subjectId); return result },
    getById: (id: string) => schemeOfWorks.find((s) => s.id === id),
    create: (data: any) => { const now = new Date().toISOString(); const item = { id: uid(), ...data, status: data.status || "draft", createdAt: now, updatedAt: now, approvedBy: data.approvedBy || null, approvedAt: data.approvedAt || null }; schemeOfWorks.push(item); return item },
    update: (id: string, data: any) => { const idx = schemeOfWorks.findIndex((s) => s.id === id); if (idx === -1) return null; schemeOfWorks[idx] = { ...schemeOfWorks[idx], ...data, updatedAt: new Date().toISOString() }; return schemeOfWorks[idx] },
    delete: (id: string) => { const idx = schemeOfWorks.findIndex((s) => s.id === id); if (idx === -1) return false; schemeOfWorks.splice(idx, 1); return true },
    approve: (id: string, approvedBy: string) => { const idx = schemeOfWorks.findIndex((s) => s.id === id); if (idx === -1) return null; schemeOfWorks[idx] = { ...schemeOfWorks[idx], status: "published", approvedBy, approvedAt: new Date().toISOString() }; return schemeOfWorks[idx] },
    reject: (id: string) => { const idx = schemeOfWorks.findIndex((s) => s.id === id); if (idx === -1) return null; schemeOfWorks[idx] = { ...schemeOfWorks[idx], status: "draft", approvedBy: null, approvedAt: null }; return schemeOfWorks[idx] },
  },
  assignments: {
    getAll: (classId?: string) => classId ? assignments.filter((a) => a.classId === classId) : assignments,
    getById: (id: string) => assignments.find((a) => a.id === id),
    create: (data: any) => { const item = { id: uid(), ...data }; assignments.push(item); return item },
    update: (id: string, data: any) => { const idx = assignments.findIndex((a) => a.id === id); if (idx === -1) return null; assignments[idx] = { ...assignments[idx], ...data }; return assignments[idx] },
    delete: (id: string) => { const idx = assignments.findIndex((a) => a.id === id); if (idx === -1) return false; assignments.splice(idx, 1); return true },
  },
  timetable: {
    getAll: () => timetable,
    getByDay: (day: string) => timetable.filter((t) => t.day === day),
    create: (data: any) => { const item = { id: uid(), ...data }; timetable.push(item); return item },
    update: (id: string, data: any) => { const idx = timetable.findIndex((t) => t.id === id); if (idx === -1) return null; timetable[idx] = { ...timetable[idx], ...data }; return timetable[idx] },
    delete: (id: string) => { const idx = timetable.findIndex((t) => t.id === id); if (idx === -1) return false; timetable.splice(idx, 1); return true },
  },
  announcements: {
    getAll: () => announcements,
    getById: (id: string) => announcements.find((a) => a.id === id),
    getByAudience: (audience: string) => audience === "all" ? announcements : announcements.filter((a) => a.audience === audience || a.audience === "all"),
    create: (data: any) => { const item = { id: uid(), ...data, createdAt: new Date().toISOString() }; announcements.push(item); return item },
    update: (id: string, data: any) => { const idx = announcements.findIndex((a) => a.id === id); if (idx === -1) return null; announcements[idx] = { ...announcements[idx], ...data }; return announcements[idx] },
    delete: (id: string) => { const idx = announcements.findIndex((a) => a.id === id); if (idx === -1) return false; announcements.splice(idx, 1); return true },
  },
  gradingConfig: {
    get: () => gradingConfigData,
    update: (data: any) => { Object.assign(gradingConfigData, data, { updatedAt: new Date().toISOString() }); return gradingConfigData },
  },
  results: {
    getAll: () => results,
    getByStudent: (studentId: string) => results.filter((r) => r.studentId === studentId),
    getByStudentAndTerm: (studentId: string, term: string) => results.filter((r) => r.studentId === studentId && r.term === term),
    getByClassAndSubject: (classId: string, subjectId: string, term?: string, session?: string, examId?: string) => {
      const studentIds = students.filter((s) => s.classId === classId).map((s) => s.id)
      let result = results.filter((r) => studentIds.includes(r.studentId) && r.subjectId === subjectId)
      if (term) result = result.filter((r) => r.term === term)
      if (session) result = result.filter((r) => r.session === session)
      if (examId) result = result.filter((r) => r.examId === examId)
      return result
    },
    create: (data: any) => {
      const gc = gradingConfigData
      const caScore = data.caScore ?? 0
      const examScore = data.examScore ?? 0
      const caTotal = data.caTotal ?? gc.caMax
      const examTotal = data.examTotal ?? gc.examMax
      const total = caScore + examScore
      const totalMax = caTotal + examTotal
      const pct = totalMax > 0 ? (total / totalMax) * 100 : 0
      const boundaries = gc.gradeBoundaries || []
      let grade = "F", remark = "Needs Improvement"
      for (const b of boundaries) {
        if (pct >= b.min) { grade = b.grade; remark = b.remark }
      }
      const item = { id: uid(), ...data, caScore, examScore, caTotal, examTotal, total, score: total, totalMax, grade, remark, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      results.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = results.findIndex((r) => r.id === id)
      if (idx === -1) return null
      const gc = gradingConfigData
      const existing = results[idx]
      const caScore = data.caScore ?? existing.caScore ?? 0
      const examScore = data.examScore ?? existing.examScore ?? 0
      const caTotal = data.caTotal ?? existing.caTotal ?? gc.caMax
      const examTotal = data.examTotal ?? existing.examTotal ?? gc.examMax
      const total = caScore + examScore
      const totalMax = caTotal + examTotal
      const pct = totalMax > 0 ? (total / totalMax) * 100 : 0
      const boundaries = gc.gradeBoundaries || []
      let grade = "F", remark = "Needs Improvement"
      for (const b of boundaries) {
        if (pct >= b.min) { grade = b.grade; remark = b.remark }
      }
      results[idx] = { ...results[idx], ...data, caScore, examScore, caTotal, examTotal, total, score: total, totalMax, grade, remark, updatedAt: new Date().toISOString() }
      return results[idx]
    },
    delete: (id: string) => { const idx = results.findIndex((r) => r.id === id); if (idx === -1) return false; results.splice(idx, 1); return true },
  },
  attendance: {
    getAll: () => attendanceRecords,
    getByStudent: (studentId: string) => attendanceRecords.filter((a) => a.studentId === studentId),
    getSummary: (studentId: string) => {
      const records = attendanceRecords.filter((a) => a.studentId === studentId);
      return { present: records.filter((a) => a.status === "present").length, absent: records.filter((a) => a.status === "absent").length, late: records.filter((a) => a.status === "late").length, total: records.length }
    },
  },
  fees: {
    getAll: () => fees,
    getByStudent: (studentId: string) => fees.filter((f) => f.studentId === studentId),
    getSummary: (studentId: string) => {
      const records = fees.filter((f) => f.studentId === studentId);
      return { total: records.reduce((s, f) => s + f.amount, 0), paid: records.reduce((s, f) => s + f.paid, 0), outstanding: records.reduce((s, f) => s + (f.amount - f.paid), 0), items: records }
    },
  },
  questions: {
    getAll: (subjectId?: string, classId?: string, approved?: boolean) => { let result = [...questions]; if (subjectId) result = result.filter((q) => q.subjectId === subjectId); if (classId) result = result.filter((q) => q.classId === classId); if (approved !== undefined) result = result.filter((q) => q.approved === approved); return result },
    getAllPending: () => questions.filter((q) => !q.approved),
    getByTeacher: (teacherId: string) => { const ta = teacherAssignments.find((a) => a.teacherId === teacherId); if (!ta) return []; return questions.filter((q) => ta.classIds.includes(q.classId) && ta.subjectIds.includes(q.subjectId)) },
    getById: (id: string) => questions.find((q) => q.id === id),
    create: (data: any) => { const now = new Date().toISOString(); const item = { id: uid(), ...data, difficulty: data.difficulty || "medium", approved: false, approvedBy: null, approvedAt: null, createdAt: now, updatedAt: now }; questions.push(item); return item },
    update: (id: string, data: any) => { const idx = questions.findIndex((q) => q.id === id); if (idx === -1) return null; questions[idx] = { ...questions[idx], ...data, updatedAt: new Date().toISOString() }; return questions[idx] },
    delete: (id: string) => { const idx = questions.findIndex((q) => q.id === id); if (idx === -1) return false; questions.splice(idx, 1); return true },
    approve: (id: string, approvedBy: string) => { const idx = questions.findIndex((q) => q.id === id); if (idx === -1) return null; questions[idx] = { ...questions[idx], approved: true, approvedBy, approvedAt: new Date().toISOString() }; return questions[idx] },
    approveAll: (ids: string[], approvedBy: string) => { ids.forEach((id) => { const idx = questions.findIndex((q) => q.id === id); if (idx !== -1) questions[idx] = { ...questions[idx], approved: true, approvedBy, approvedAt: new Date().toISOString() } }); return true },
    reject: (id: string) => { const idx = questions.findIndex((q) => q.id === id); if (idx === -1) return null; questions[idx] = { ...questions[idx], approved: false, approvedBy: null, approvedAt: null }; return questions[idx] },
    autoPopulate: (classId: string, subjectId: string, counts: { topic: string; count: number; difficulty: string }[]) => { const pool = questions.filter((q) => q.classId === classId && q.subjectId === subjectId && q.approved); const selected: any[] = []; const used = new Set<string>(); counts.forEach(({ topic, count, difficulty }) => { const candidates = pool.filter((q) => q.topic === topic && q.difficulty === difficulty && !used.has(q.id)); candidates.slice(0, count).forEach((q) => { selected.push({ questionId: q.id, points: q.points }); used.add(q.id) }) }); return selected },
  },
  exams: {
    getAll: (subjectId?: string, classId?: string, type?: string) => { let result = [...exams]; if (subjectId) result = result.filter((e) => e.subjectId === subjectId); if (classId) result = result.filter((e) => e.classId === classId); if (type) result = result.filter((e) => e.type === type); return result },
    getByTeacher: (teacherId: string, type?: string) => { const ta = teacherAssignments.find((a) => a.teacherId === teacherId); if (!ta) return []; let result = exams.filter((e) => ta.classIds.includes(e.classId) && ta.subjectIds.includes(e.subjectId)); if (type) result = result.filter((e) => e.type === type); return result },
    getById: (id: string) => exams.find((e) => e.id === id),
    create: (data: any) => { const now = new Date().toISOString(); const item = { id: uid(), ...data, status: data.status || "draft", createdAt: now, updatedAt: now }; exams.push(item); return item },
    update: (id: string, data: any) => { const idx = exams.findIndex((e) => e.id === id); if (idx === -1) return null; exams[idx] = { ...exams[idx], ...data, updatedAt: new Date().toISOString() }; return exams[idx] },
    delete: (id: string) => { const idx = exams.findIndex((e) => e.id === id); if (idx === -1) return false; exams.splice(idx, 1); return true },
    approve: (id: string, approvedBy: string) => { const idx = exams.findIndex((e) => e.id === id); if (idx === -1) return null; exams[idx] = { ...exams[idx], status: "published", approvedBy, approvedAt: new Date().toISOString() }; return exams[idx] },
  },
  examSessions: {
    getAll: (examId?: string, examType?: string) => {
      let result = examId ? examSessions.filter((s) => s.examId === examId) : examSessions
      if (examType) result = result.filter((s) => s.examType === examType)
      return result
    },
    getById: (id: string) => examSessions.find((s) => s.id === id),
    create: (data: any) => { const item = { id: uid(), ...data, status: "pending", tabSwitches: 0, flagged: false, createdAt: new Date().toISOString() }; examSessions.push(item); return item },
    update: (id: string, data: any) => { const idx = examSessions.findIndex((s) => s.id === id); if (idx === -1) return null; examSessions[idx] = { ...examSessions[idx], ...data }; return examSessions[idx] },
    delete: (id: string) => { const idx = examSessions.findIndex((s) => s.id === id); if (idx === -1) return false; examSessions.splice(idx, 1); return true },
  },
  submissions: { getAll: () => submissions, getById: (id: string) => submissions.find((s) => s.id === id), create: (data: any) => { const item = { id: uid(), ...data, status: "pending" }; submissions.push(item); return item }, update: (id: string, data: any) => { const idx = submissions.findIndex((s) => s.id === id); if (idx === -1) return null; submissions[idx] = { ...submissions[idx], ...data }; return submissions[idx] } },
  parentLinks: { getAll: () => parentLinks, getByParent: (parentId: string) => parentLinks.filter((l) => l.parentId === parentId), getByStudent: (studentId: string) => parentLinks.find((l) => l.studentId === studentId), create: (data: any) => { const item = { id: uid(), ...data }; parentLinks.push(item); return item }, delete: (id: string) => { const idx = parentLinks.findIndex((l) => l.id === id); if (idx === -1) return false; parentLinks.splice(idx, 1); return true } },
  attendanceLogs: { getAll: (date?: string) => date ? attendanceLogs.filter((l) => l.date === date) : attendanceLogs, getByUser: (userId: string) => attendanceLogs.filter((l) => l.userId === userId), getByUserAndDate: (userId: string, date: string) => attendanceLogs.find((l) => l.userId === userId && l.date === date), create: (data: any) => { const item = { id: uid(), ...data, timestamp: new Date().toISOString() }; attendanceLogs.push(item); return item }, getToday: () => { const today = new Date().toISOString().split("T")[0]; return attendanceLogs.filter((l) => l.date === today) } },
  attendanceQRCodes: { getAll: () => attendanceQRCodes, getByType: (type: string) => attendanceQRCodes.filter((q) => q.type === type), create: (data: any) => { const item = { id: uid(), ...data, createdAt: new Date().toISOString() }; attendanceQRCodes.push(item); return item } },
  reportCards: { getAll: () => reportCards, getByStudent: (studentId: string) => reportCards.filter((r) => r.studentId === studentId), create: (data: any) => { const item = { id: uid(), ...data }; reportCards.push(item); return item } },
  topics: { getAll: (subjectId?: string) => subjectId ? topics.filter((t) => t.subjectId === subjectId) : topics, getById: (id: string) => topics.find((t) => t.id === id), create: (data: any) => { const item = { id: uid(), ...data }; topics.push(item); return item }, update: (id: string, data: any) => { const idx = topics.findIndex((t) => t.id === id); if (idx === -1) return null; topics[idx] = { ...topics[idx], ...data }; return topics[idx] }, delete: (id: string) => { const idx = topics.findIndex((t) => t.id === id); if (idx === -1) return false; topics.splice(idx, 1); return true } },
  bankDetails: { get: () => bankDetails, update: (data: any) => { Object.assign(bankDetails, data, { updatedAt: new Date().toISOString() }); return bankDetails } },
  feeStructures: { getAll: (classId?: string) => classId ? feeStructures.filter((f) => f.classId === classId) : feeStructures, getById: (id: string) => feeStructures.find((f) => f.id === id), create: (data: any) => { const item = { id: uid(), ...data }; feeStructures.push(item); return item }, update: (id: string, data: any) => { const idx = feeStructures.findIndex((f) => f.id === id); if (idx === -1) return null; feeStructures[idx] = { ...feeStructures[idx], ...data }; return feeStructures[idx] }, delete: (id: string) => { const idx = feeStructures.findIndex((f) => f.id === id); if (idx === -1) return false; feeStructures.splice(idx, 1); return true } },
  payments: { getAll: (studentId?: string) => studentId ? payments.filter((p) => p.studentId === studentId) : payments, getById: (id: string) => payments.find((p) => p.id === id), create: (data: any) => { const item = { id: uid(), ...data, status: "pending", confirmedAt: null, confirmedBy: null }; payments.push(item); return item }, update: (id: string, data: any) => { const idx = payments.findIndex((p) => p.id === id); if (idx === -1) return null; payments[idx] = { ...payments[idx], ...data }; return payments[idx] }, confirm: (id: string, confirmedBy: string) => { const idx = payments.findIndex((p) => p.id === id); if (idx === -1) return null; payments[idx] = { ...payments[idx], status: "confirmed", confirmedAt: new Date().toISOString(), confirmedBy }; return payments[idx] }, reject: (id: string, confirmedBy: string) => { const idx = payments.findIndex((p) => p.id === id); if (idx === -1) return null; payments[idx] = { ...payments[idx], status: "rejected", confirmedAt: new Date().toISOString(), confirmedBy }; return payments[idx] }, getPending: () => payments.filter((p) => p.status === "pending"), getByStudentAndStatus: (studentId: string, status: string) => payments.filter((p) => p.studentId === studentId && p.status === status) },
  salaryStructures: { getAll: () => salaryStructures, getByStaff: (staffId: string) => salaryStructures.find((s) => s.staffId === staffId), create: (data: any) => { const item = { id: uid(), ...data }; salaryStructures.push(item); return item }, update: (staffId: string, data: any) => { const idx = salaryStructures.findIndex((s) => s.staffId === staffId); if (idx === -1) return null; salaryStructures[idx] = { ...salaryStructures[idx], ...data }; return salaryStructures[idx] } },
  salaryRecords: { getAll: (staffId?: string) => staffId ? salaryRecords.filter((r) => r.staffId === staffId) : salaryRecords, getByStaffAndMonth: (staffId: string, month: string, year: string) => salaryRecords.find((r) => r.staffId === staffId && r.month === month && r.year === year), getById: (id: string) => salaryRecords.find((r) => r.id === id), create: (data: any) => { const item = { id: uid(), ...data, status: "pending", paidAt: null, confirmedAt: null, confirmedBy: null }; salaryRecords.push(item); return item }, markPaid: (id: string, paidAt: string, confirmedBy: string) => { const idx = salaryRecords.findIndex((r) => r.id === id); if (idx === -1) return null; salaryRecords[idx] = { ...salaryRecords[idx], status: "paid", paidAt, confirmedAt: new Date().toISOString(), confirmedBy }; return salaryRecords[idx] }, getByMonth: (month: string, year: string) => salaryRecords.filter((r) => r.month === month && r.year === year) },
  documents: { getAll: (studentId?: string) => studentId ? documents.filter((d) => d.studentId === studentId) : documents, getById: (id: string) => documents.find((d) => d.id === id), getByType: (type: string) => documents.filter((d) => d.type === type), create: (data: any) => { const item = { id: uid(), ...data, generatedAt: new Date().toISOString(), status: "final" }; documents.push(item); return item }, update: (id: string, data: any) => { const idx = documents.findIndex((d) => d.id === id); if (idx === -1) return null; documents[idx] = { ...documents[idx], ...data }; return documents[idx] } },
  schoolSettings: { get: () => schoolSettingsData, update: (data: any) => { Object.assign(schoolSettingsData, data); return schoolSettingsData } },
  admissionSettings: { get: () => admissionSettingsData, update: (data: any) => { Object.assign(admissionSettingsData, data, { updatedAt: new Date().toISOString() }); return admissionSettingsData } },
  admissionApplications: { getAll: () => admissionApplications, getById: (id: string) => admissionApplications.find((a) => a.id === id), getByStatus: (status: string) => admissionApplications.filter((a) => a.status === status), create: (data: any) => { const item = { id: uid(), ...data, status: "pending", appliedAt: new Date().toISOString() }; admissionApplications.push(item); return item }, update: (id: string, data: any) => { const idx = admissionApplications.findIndex((a) => a.id === id); if (idx === -1) return null; admissionApplications[idx] = { ...admissionApplications[idx], ...data }; return admissionApplications[idx] }, delete: (id: string) => { const idx = admissionApplications.findIndex((a) => a.id === id); if (idx === -1) return false; admissionApplications.splice(idx, 1); return true } },
  events: {
    getAll: (filters?: { type?: string; upcoming?: boolean }) => {
      let result = [...events]
      if (filters?.type) result = result.filter((e) => e.type === filters.type)
      if (filters?.upcoming) result = result.filter((e) => !e.date || new Date(e.date) >= new Date(new Date().toDateString()))
      return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    },
    getById: (id: string) => events.find((e) => e.id === id),
    create: (data: any) => { const item = { id: uid(), ...data, createdAt: new Date().toISOString() }; events.push(item); return item },
    update: (id: string, data: any) => { const idx = events.findIndex((e) => e.id === id); if (idx === -1) return null; events[idx] = { ...events[idx], ...data }; return events[idx] },
    delete: (id: string) => { const idx = events.findIndex((e) => e.id === id); if (idx === -1) return false; events.splice(idx, 1); return true },
  },
  superAnnouncements: { getAll: () => superAnnouncements, getActive: () => superAnnouncements.filter((a) => a.active && (!a.endDate || new Date(a.endDate) >= new Date())), getById: (id: string) => superAnnouncements.find((a) => a.id === id), create: (data: any) => { const item = { id: uid(), ...data, createdAt: new Date().toISOString(), active: true }; superAnnouncements.push(item); return item }, update: (id: string, data: any) => { const idx = superAnnouncements.findIndex((a) => a.id === id); if (idx === -1) return null; superAnnouncements[idx] = { ...superAnnouncements[idx], ...data }; return superAnnouncements[idx] }, delete: (id: string) => { const idx = superAnnouncements.findIndex((a) => a.id === id); if (idx === -1) return false; superAnnouncements.splice(idx, 1); return true } },
  feedbackTickets: { getAll: () => feedbackTickets, getByStatus: (status: string) => feedbackTickets.filter((t) => t.status === status), getById: (id: string) => feedbackTickets.find((t) => t.id === id), getByUser: (userId: string) => feedbackTickets.filter((t) => t.from === userId), create: (data: any) => { const item = { id: uid(), ...data, status: "pending", createdAt: new Date().toISOString(), resolvedAt: null, resolution: null }; feedbackTickets.push(item); return item }, update: (id: string, data: any, userId?: string) => { const idx = feedbackTickets.findIndex((t) => t.id === id); if (idx === -1) return null; if (userId && feedbackTickets[idx].from !== userId) return null; feedbackTickets[idx] = { ...feedbackTickets[idx], ...data }; return feedbackTickets[idx] }, delete: (id: string, userId?: string) => { const idx = feedbackTickets.findIndex((t) => t.id === id); if (idx === -1) return false; if (userId && feedbackTickets[idx].from !== userId) return false; feedbackTickets.splice(idx, 1); return true }, resolve: (id: string, resolution: string) => { const idx = feedbackTickets.findIndex((t) => t.id === id); if (idx === -1) return null; feedbackTickets[idx] = { ...feedbackTickets[idx], status: "resolved", resolvedAt: new Date().toISOString(), resolution }; return feedbackTickets[idx] } },
  weeklyReports: {
    getAll: (filters?: { studentId?: string; classId?: string; week?: number; term?: string; session?: string; createdBy?: string; status?: string }) => {
      let result = [...weeklyReports]
      if (filters?.studentId) result = result.filter((r) => r.studentId === filters.studentId)
      if (filters?.classId) result = result.filter((r) => r.classId === filters.classId)
      if (filters?.week !== undefined) result = result.filter((r) => r.week === filters.week)
      if (filters?.term) result = result.filter((r) => r.term === filters.term)
      if (filters?.session) result = result.filter((r) => r.session === filters.session)
      if (filters?.createdBy) result = result.filter((r) => r.createdBy === filters.createdBy)
      if (filters?.status) result = result.filter((r) => r.status === filters.status)
      return result
    },
    getById: (id: string) => weeklyReports.find((r) => r.id === id),
    getByStudent: (studentId: string, term?: string, session?: string) => {
      let result = weeklyReports.filter((r) => r.studentId === studentId)
      if (term) result = result.filter((r) => r.term === term)
      if (session) result = result.filter((r) => r.session === session)
      return result
    },
    create: (data: any) => { const now = new Date().toISOString(); const item = { id: uid(), ...data, status: data.status || "draft", createdAt: now, updatedAt: now, publishedAt: data.status === "published" ? now : null }; weeklyReports.push(item); return item },
    update: (id: string, data: any) => { const idx = weeklyReports.findIndex((r) => r.id === id); if (idx === -1) return null; const now = new Date().toISOString(); weeklyReports[idx] = { ...weeklyReports[idx], ...data, updatedAt: now, publishedAt: data.status === "published" && !weeklyReports[idx].publishedAt ? now : weeklyReports[idx].publishedAt }; return weeklyReports[idx] },
    delete: (id: string) => { const idx = weeklyReports.findIndex((r) => r.id === id); if (idx === -1) return false; weeklyReports.splice(idx, 1); return true },
  },
  lessonQuizResults: {
    getAll: () => lessonQuizResults,
    getByStudent: (studentId: string) => lessonQuizResults.filter((r) => r.studentId === studentId),
    getByLessonNote: (lessonNoteId: string) => lessonQuizResults.filter((r) => r.lessonNoteId === lessonNoteId),
    getByStudentAndLessonNote: (studentId: string, lessonNoteId: string) => lessonQuizResults.find((r) => r.studentId === studentId && r.lessonNoteId === lessonNoteId),
    create: (data: any) => { const item = { id: uid(), ...data, attemptedAt: new Date().toISOString() }; lessonQuizResults.push(item); return item },
    getAnalysis: (studentId: string) => {
      const results = lessonQuizResults.filter((r) => r.studentId === studentId)
      const totalAttempts = results.length
      const totalQuestions = results.reduce((s: number, r: any) => s + (r.totalQuestions || 0), 0)
      const totalCorrect = results.reduce((s: number, r: any) => s + (r.correctAnswers || 0), 0)
      const masteryRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
      const subjectBreakdown: Record<string, { total: number; correct: number }> = {}
      results.forEach((r: any) => {
        const sub = r.subject || "General"
        if (!subjectBreakdown[sub]) subjectBreakdown[sub] = { total: 0, correct: 0 }
        subjectBreakdown[sub].total += r.totalQuestions || 0
        subjectBreakdown[sub].correct += r.correctAnswers || 0
      })
      return { totalAttempts, totalQuestions, totalCorrect, masteryRate, subjectBreakdown }
    },
    getClassAnalysis: (classId: string) => {
      const studentIds = students.filter((s) => s.classId === classId).map((s) => s.id)
      const results = lessonQuizResults.filter((r) => studentIds.includes(r.studentId))
      const studentMap: Record<string, { total: number; correct: number; subjectBreakdown: Record<string, { total: number; correct: number }> }> = {}
      results.forEach((r: any) => {
        if (!studentMap[r.studentId]) studentMap[r.studentId] = { total: 0, correct: 0, subjectBreakdown: {} }
        studentMap[r.studentId].total += r.totalQuestions || 0
        studentMap[r.studentId].correct += r.correctAnswers || 0
        const sub = r.subject || "General"
        if (!studentMap[r.studentId].subjectBreakdown[sub]) studentMap[r.studentId].subjectBreakdown[sub] = { total: 0, correct: 0 }
        studentMap[r.studentId].subjectBreakdown[sub].total += r.totalQuestions || 0
        studentMap[r.studentId].subjectBreakdown[sub].correct += r.correctAnswers || 0
      })
      const classTotalQ = results.reduce((s: number, r: any) => s + (r.totalQuestions || 0), 0)
      const classTotalC = results.reduce((s: number, r: any) => s + (r.correctAnswers || 0), 0)
      return {
        studentCount: studentIds.length,
        attemptedCount: Object.keys(studentMap).length,
        totalQuestions: classTotalQ,
        totalCorrect: classTotalC,
        classMastery: classTotalQ > 0 ? Math.round((classTotalC / classTotalQ) * 100) : 0,
        students: Object.entries(studentMap).map(([sid, data]) => ({
          studentId: sid,
          studentName: students.find((s) => s.id === sid) ? `${students.find((s) => s.id === sid).firstName} ${students.find((s) => s.id === sid).lastName}` : "Unknown",
          masteryRate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
          totalQuestions: data.total,
          correctAnswers: data.correct,
          subjectBreakdown: data.subjectBreakdown,
        })),
      }
    },
  },
}
