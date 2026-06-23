import { prisma } from "./prisma"
import { store } from "./api-store"

async function ensureSchoolId(): Promise<string> {
  const school = await prisma.school.findFirst()
  return school?.id || ""
}

export const db = {
  students: {
    getAll: async (classId?: string) => {
      return prisma.student.findMany({
        where: classId ? { classId } : undefined,
        orderBy: { createdAt: "desc" },
      })
    },
    getById: async (id: string) => {
      return prisma.student.findUnique({ where: { id } })
    },
    getByEmail: async (email: string) => {
      return prisma.student.findFirst({ where: { email } })
    },
    create: async (data: any) => {
      const studentId = `STU${Date.now()}`
      const schoolId = await ensureSchoolId()
      const { password, ...rest } = data
      return prisma.student.create({
        data: {
          ...rest,
          studentId,
          classId: data.classId || "",
          schoolId,
          status: data.status || "active",
        },
      })
    },
    update: async (id: string, data: any) => {
      const { studentId, createdAt, password, ...rest } = data
      return prisma.student.update({ where: { id }, data: rest })
    },
    delete: async (id: string) => {
      await prisma.student.delete({ where: { id } })
      return true
    },
  },

  school: {
    get: async () => {
      const school = await prisma.school.findFirst()
      if (!school) return store.schoolSettings.get()
      const settings = (school.settings as Record<string, any>) || {}
      return {
        id: school.id,
        name: school.name,
        shortName: school.shortName || "Access",
        email: school.email || "info@access.school",
        phone: school.phone || "+1 234 567 8900",
        address: school.address || "123 Education Lane, Learning City",
        motto: school.motto || "Excellence in Education",
        logo: school.logo || null,
        aboutText: school.aboutText || "",
        exportDefaultExamHeader: school.exportDefaultExamHeader || "",
        primaryColor: school.primaryColor,
        secondaryColor: school.secondaryColor,
        accentColor: school.accentColor,
        studentIdCardConfig: settings.studentIdCardConfig || {
          backTitle: "Student Information",
          showAddress: true,
          showBloodGroup: true,
          showEmergencyContact: true,
          showMedicalNotes: true,
          customFields: [],
        },
        staffIdCardConfig: settings.staffIdCardConfig || {
          backTitle: "Staff Information",
          showDepartment: true,
          showEmergencyContact: true,
          customFields: [],
        },
        schoolQRCode: settings.schoolQRCode || "",
        loginEnabled: settings.loginEnabled,
        expirationDate: settings.expirationDate,
        superAdminPassword: settings.superAdminPassword,
      }
    },
    update: async (data: any) => {
      const school = await prisma.school.findFirst()
      if (!school) return null

      const currentSettings = (school.settings as Record<string, any>) || {}

      const dbFields: any = {}
      if (data.name !== undefined) dbFields.name = data.name
      if (data.shortName !== undefined) dbFields.shortName = data.shortName
      if (data.email !== undefined) dbFields.email = data.email
      if (data.phone !== undefined) dbFields.phone = data.phone
      if (data.address !== undefined) dbFields.address = data.address
      if (data.motto !== undefined) dbFields.motto = data.motto
      if (data.aboutText !== undefined) dbFields.aboutText = data.aboutText
      if (data.exportDefaultExamHeader !== undefined) dbFields.exportDefaultExamHeader = data.exportDefaultExamHeader
      if (data.logo !== undefined) dbFields.logo = data.logo
      if (data.primaryColor !== undefined) dbFields.primaryColor = data.primaryColor
      if (data.secondaryColor !== undefined) dbFields.secondaryColor = data.secondaryColor
      if (data.accentColor !== undefined) dbFields.accentColor = data.accentColor

      const settingsFields = ["studentIdCardConfig", "staffIdCardConfig", "schoolQRCode", "loginEnabled", "expirationDate", "superAdminPassword"]
      const settingsUpdate: Record<string, any> = { ...currentSettings }
      for (const key of settingsFields) {
        if ((data as any)[key] !== undefined) {
          settingsUpdate[key] = (data as any)[key]
        }
      }
      dbFields.settings = settingsUpdate

      await prisma.school.update({
        where: { id: school.id },
        data: dbFields,
      })

      return db.school.get()
    },
  },

  announcements: {
    getAll: async () => {
      return prisma.announcement.findMany({ orderBy: { createdAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.announcement.findUnique({ where: { id } })
    },
    getByAudience: async (audience: string) => {
      const all = await prisma.announcement.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      })
      return audience === "all" ? all : all.filter((a) => a.audience === audience || a.audience === "all")
    },
    create: async (data: any) => {
      const { endDate, ...rest } = data
      return prisma.announcement.create({
        data: {
          ...rest,
          endDate: endDate ? new Date(endDate) : null,
        },
      })
    },
    update: async (id: string, data: any) => {
      const { endDate, createdAt, ...rest } = data
      return prisma.announcement.update({
        where: { id },
        data: {
          ...rest,
          endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        },
      })
    },
    delete: async (id: string) => {
      await prisma.announcement.delete({ where: { id } })
      return true
    },
  },

  sessions: {
    getAll: async () => {
      return prisma.academicSession.findMany({ orderBy: { createdAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.academicSession.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.academicSession.create({
        data: {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const updateData: any = { ...data }
      if (data.startDate) updateData.startDate = new Date(data.startDate)
      if (data.endDate) updateData.endDate = new Date(data.endDate)
      return prisma.academicSession.update({ where: { id }, data: updateData })
    },
    delete: async (id: string) => {
      await prisma.academicSession.delete({ where: { id } })
      return true
    },
  },

  terms: {
    getAll: async (sessionId?: string) => {
      return prisma.term.findMany({
        where: sessionId ? { sessionId } : undefined,
        orderBy: { createdAt: "desc" },
      })
    },
    getById: async (id: string) => {
      return prisma.term.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      return prisma.term.create({
        data: {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
      })
    },
    update: async (id: string, data: any) => {
      const updateData: any = { ...data }
      if (data.startDate) updateData.startDate = new Date(data.startDate)
      if (data.endDate) updateData.endDate = new Date(data.endDate)
      return prisma.term.update({ where: { id }, data: updateData })
    },
    delete: async (id: string) => {
      await prisma.term.delete({ where: { id } })
      return true
    },
  },

  classes: {
    getAll: async () => {
      return prisma.class.findMany({ orderBy: { createdAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.class.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.class.create({ data: { ...data, schoolId } })
    },
    update: async (id: string, data: any) => {
      return prisma.class.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.class.delete({ where: { id } })
      return true
    },
  },

  subjects: {
    getAll: async (classId?: string) => {
      return prisma.subject.findMany({
        where: classId ? { classId } : undefined,
        orderBy: { createdAt: "desc" },
      })
    },
    getById: async (id: string) => {
      return prisma.subject.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.subject.create({ data: { ...data, schoolId } })
    },
    update: async (id: string, data: any) => {
      return prisma.subject.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.subject.delete({ where: { id } })
      return true
    },
  },

  staff: {
    getAll: async () => {
      return prisma.staff.findMany({ orderBy: { createdAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.staff.findUnique({ where: { id } })
    },
    getByEmail: async (email: string) => {
      return prisma.staff.findFirst({ where: { email } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      const staffId = `STF${Date.now()}`
      return prisma.staff.create({
        data: { ...data, staffId, schoolId, status: data.status || "active" },
      })
    },
    update: async (id: string, data: any) => {
      const { staffId, createdAt, ...rest } = data
      return prisma.staff.update({ where: { id }, data: rest })
    },
    delete: async (id: string) => {
      await prisma.staff.delete({ where: { id } })
      return true
    },
  },

  teacherAssignments: {
    getAll: async () => {
      return prisma.teacherAssignment.findMany()
    },
    getByTeacher: async (teacherId: string) => {
      return prisma.teacherAssignment.findFirst({ where: { teacherId } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.teacherAssignment.create({
        data: {
          teacherId: data.teacherId,
          classIds: data.classIds || [],
          subjectIds: data.subjectIds || [],
          isClassTeacher: data.isClassTeacher || false,
          schoolId,
        },
      })
    },
    upsert: async (teacherId: string, data: any) => {
      const schoolId = await ensureSchoolId()
      const existing = await prisma.teacherAssignment.findFirst({ where: { teacherId } })
      if (existing) {
        return prisma.teacherAssignment.update({
          where: { id: existing.id },
          data: {
            classIds: data.classIds ?? existing.classIds,
            subjectIds: data.subjectIds ?? existing.subjectIds,
            isClassTeacher: data.isClassTeacher ?? existing.isClassTeacher,
          },
        })
      }
      return prisma.teacherAssignment.create({
        data: {
          teacherId,
          classIds: data.classIds || [],
          subjectIds: data.subjectIds || [],
          isClassTeacher: data.isClassTeacher || false,
          schoolId,
        },
      })
    },
    delete: async (id: string) => {
      await prisma.teacherAssignment.delete({ where: { id } })
      return true
    },
  },

  lessonNotes: {
    getAll: async (classId?: string) => {
      return prisma.lessonNote.findMany({
        where: classId ? { classId } : undefined,
        orderBy: { createdAt: "desc" },
      })
    },
    getById: async (id: string) => {
      return prisma.lessonNote.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.lessonNote.create({
        data: {
          classId: data.classId,
          subjectId: data.subjectId,
          title: data.title,
          content: data.content || undefined,
          topic: data.topic || null,
          quiz: data.quiz || [],
          status: data.status || "draft",
          createdBy: data.createdBy || null,
          approvedBy: data.approvedBy || null,
          approvedAt: data.approvedAt ? new Date(data.approvedAt) : null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const updateData: any = { ...data }
      if (data.approvedAt) updateData.approvedAt = new Date(data.approvedAt)
      if (data.rejectedAt) updateData.rejectedAt = new Date(data.rejectedAt)
      return prisma.lessonNote.update({ where: { id }, data: updateData })
    },
    delete: async (id: string) => {
      await prisma.lessonNote.delete({ where: { id } })
      return true
    },
    approve: async (id: string, approvedBy: string) => {
      return prisma.lessonNote.update({
        where: { id },
        data: { status: "published", approvedBy, approvedAt: new Date() },
      })
    },
    reject: async (id: string) => {
      return prisma.lessonNote.update({
        where: { id },
        data: { status: "rejected", rejectedAt: new Date() },
      })
    },
    getPending: async () => {
      return prisma.lessonNote.findMany({
        where: { status: { in: ["draft", "pending"] } },
        orderBy: { createdAt: "desc" },
      })
    },
  },

  schemeOfWorks: {
    getAll: async (classId?: string, subjectId?: string) => {
      const where: any = {}
      if (classId) where.classId = classId
      if (subjectId) where.subjectId = subjectId
      return prisma.schemeOfWork.findMany({ where, orderBy: { createdAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.schemeOfWork.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.schemeOfWork.create({
        data: {
          classId: data.classId,
          subjectId: data.subjectId,
          title: data.title,
          content: data.content || undefined,
          status: data.status || "draft",
          createdBy: data.createdBy || null,
          approvedBy: data.approvedBy || null,
          approvedAt: data.approvedAt ? new Date(data.approvedAt) : null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const updateData: any = { ...data }
      if (data.approvedAt) updateData.approvedAt = new Date(data.approvedAt)
      return prisma.schemeOfWork.update({ where: { id }, data: updateData })
    },
    delete: async (id: string) => {
      await prisma.schemeOfWork.delete({ where: { id } })
      return true
    },
    approve: async (id: string, approvedBy: string) => {
      return prisma.schemeOfWork.update({
        where: { id },
        data: { status: "published", approvedBy, approvedAt: new Date() },
      })
    },
    reject: async (id: string) => {
      return prisma.schemeOfWork.update({
        where: { id },
        data: { status: "draft", approvedBy: null, approvedAt: null },
      })
    },
  },

  assignments: {
    getAll: async (classId?: string) => {
      return prisma.assignment.findMany({
        where: classId ? { classId } : undefined,
        orderBy: { createdAt: "desc" },
      })
    },
    getById: async (id: string) => {
      return prisma.assignment.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.assignment.create({
        data: {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const updateData: any = { ...data }
      if (data.dueDate) updateData.dueDate = new Date(data.dueDate)
      return prisma.assignment.update({ where: { id }, data: updateData })
    },
    delete: async (id: string) => {
      await prisma.assignment.delete({ where: { id } })
      return true
    },
  },

  timetable: {
    getAll: async () => {
      return prisma.timetableEntry.findMany()
    },
    getByDay: async (day: string) => {
      return prisma.timetableEntry.findMany({ where: { day } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.timetableEntry.create({ data: { ...data, schoolId } })
    },
    update: async (id: string, data: any) => {
      return prisma.timetableEntry.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.timetableEntry.delete({ where: { id } })
      return true
    },
  },

  gradingConfig: {
    get: async () => {
      const school = await prisma.school.findFirst()
      if (!school) return store.gradingConfig.get()
      const config = await prisma.gradingConfig.findFirst({ where: { schoolId: school.id } })
      if (!config) {
        const defaultConfig = await prisma.gradingConfig.create({
          data: {
            schoolId: school.id,
            caMax: 40,
            examMax: 60,
            gradeBoundaries: [
              { grade: "A", min: 75, remark: "Excellent" },
              { grade: "B", min: 65, remark: "Very Good" },
              { grade: "C", min: 55, remark: "Good" },
              { grade: "D", min: 45, remark: "Fair" },
              { grade: "E", min: 35, remark: "Poor" },
            ],
          },
        })
        return {
          caMax: defaultConfig.caMax,
          examMax: defaultConfig.examMax,
          gradeBoundaries: defaultConfig.gradeBoundaries as any[],
        }
      }
      return {
        caMax: config.caMax,
        examMax: config.examMax,
        gradeBoundaries: config.gradeBoundaries as any[],
      }
    },
    update: async (data: any) => {
      const school = await prisma.school.findFirst()
      if (!school) return store.gradingConfig.update(data)
      const updateData: any = {}
      if (data.caMax !== undefined) updateData.caMax = data.caMax
      if (data.examMax !== undefined) updateData.examMax = data.examMax
      if (data.gradeBoundaries !== undefined) updateData.gradeBoundaries = data.gradeBoundaries
      const config = await prisma.gradingConfig.upsert({
        where: { schoolId: school.id },
        create: { schoolId: school.id, ...updateData },
        update: updateData,
      })
      return {
        caMax: config.caMax,
        examMax: config.examMax,
        gradeBoundaries: config.gradeBoundaries as any[],
        updatedAt: config.updatedAt.toISOString(),
      }
    },
  },

  results: {
    getAll: async () => {
      return prisma.result.findMany({ orderBy: { createdAt: "desc" } })
    },
    getByStudent: async (studentId: string) => {
      return prisma.result.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } })
    },
    getByStudentAndTerm: async (studentId: string, term: string) => {
      return prisma.result.findMany({ where: { studentId, term }, orderBy: { createdAt: "desc" } })
    },
    getByClassAndSubject: async (classId: string, subjectId: string, term?: string, session?: string, examId?: string) => {
      const where: any = { classId, subjectId }
      if (term) where.term = term
      if (session) where.session = session
      if (examId) where.examId = examId
      return prisma.result.findMany({ where })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      const gc = await db.gradingConfig.get()
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
      return prisma.result.create({
        data: {
          studentId: data.studentId,
          subjectId: data.subjectId,
          classId: data.classId,
          term: data.term,
          session: data.session || null,
          examId: data.examId || null,
          caScore, examScore, caTotal, examTotal, total, score: total, totalMax, grade, remark,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const existing = await prisma.result.findUnique({ where: { id } })
      if (!existing) return null
      const gc = await db.gradingConfig.get()
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
      return prisma.result.update({
        where: { id },
        data: { ...data, caScore, examScore, caTotal, examTotal, total, score: total, totalMax, grade, remark },
      })
    },
    delete: async (id: string) => {
      await prisma.result.delete({ where: { id } })
      return true
    },
  },

  attendance: {
    getAll: async () => {
      return prisma.attendanceRecord.findMany()
    },
    getByStudent: async (studentId: string) => {
      return prisma.attendanceRecord.findMany({ where: { studentId } })
    },
    getSummary: async (studentId: string) => {
      const records = await prisma.attendanceRecord.findMany({ where: { studentId } })
      const present = records.filter((r) => r.status === "present").length
      const absent = records.filter((r) => r.status === "absent").length
      const late = records.filter((r) => r.status === "late").length
      return { present, absent, late, total: records.length }
    },
  },

  fees: {
    getAll: async () => {
      return prisma.fee.findMany()
    },
    getByStudent: async (studentId: string) => {
      return prisma.fee.findMany({ where: { studentId } })
    },
    getSummary: async (studentId: string) => {
      const records = await prisma.fee.findMany({ where: { studentId } })
      const total = records.reduce((s, f) => s + f.amount, 0)
      const paid = records.reduce((s, f) => s + f.paid, 0)
      return { total, paid, outstanding: total - paid, items: records }
    },
  },

  questions: {
    getAll: async (subjectId?: string, classId?: string, approved?: boolean) => {
      const where: any = {}
      if (subjectId) where.subjectId = subjectId
      if (classId) where.classId = classId
      if (approved !== undefined) where.approved = approved
      return prisma.question.findMany({ where, orderBy: { createdAt: "desc" } })
    },
    getAllPending: async () => {
      return prisma.question.findMany({ where: { approved: false }, orderBy: { createdAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.question.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.question.create({
        data: {
          subjectId: data.subjectId,
          classId: data.classId,
          question: data.question,
          options: data.options || undefined,
          answer: data.answer || null,
          difficulty: data.difficulty || "medium",
          topic: data.topic || null,
          points: data.points || 1,
          createdBy: data.createdBy || null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      return prisma.question.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.question.delete({ where: { id } })
      return true
    },
    approve: async (id: string, approvedBy: string) => {
      return prisma.question.update({
        where: { id },
        data: { approved: true, approvedBy, approvedAt: new Date() },
      })
    },
    reject: async (id: string) => {
      return prisma.question.update({
        where: { id },
        data: { approved: false, approvedBy: null, approvedAt: null },
      })
    },
  },

  exams: {
    getAll: async (subjectId?: string, classId?: string, type?: string) => {
      const where: any = {}
      if (subjectId) where.subjectId = subjectId
      if (classId) where.classId = classId
      if (type) where.type = type
      return prisma.exam.findMany({ where, orderBy: { createdAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.exam.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.exam.create({
        data: {
          title: data.title,
          subjectId: data.subjectId,
          classId: data.classId,
          type: data.type || null,
          duration: data.duration || null,
          questions: data.questions || [],
          status: data.status || "draft",
          createdBy: data.createdBy || null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      return prisma.exam.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.exam.delete({ where: { id } })
      return true
    },
    approve: async (id: string, approvedBy: string) => {
      return prisma.exam.update({
        where: { id },
        data: { status: "published", approvedBy, approvedAt: new Date() },
      })
    },
  },

  examSessions: {
    getAll: async (examId?: string) => {
      return prisma.examSession.findMany({
        where: examId ? { examId } : undefined,
      })
    },
    getById: async (id: string) => {
      return prisma.examSession.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.examSession.create({
        data: {
          examId: data.examId,
          examType: data.examType || null,
          studentId: data.studentId,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      return prisma.examSession.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.examSession.delete({ where: { id } })
      return true
    },
  },

  submissions: {
    getAll: async () => {
      return prisma.submission.findMany()
    },
    getById: async (id: string) => {
      return prisma.submission.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.submission.create({
        data: {
          assignmentId: data.assignmentId,
          studentId: data.studentId,
          content: data.content || undefined,
          fileUrl: data.fileUrl || null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      return prisma.submission.update({ where: { id }, data })
    },
  },

  parentLinks: {
    getAll: async () => {
      return prisma.parentLink.findMany()
    },
    getByParent: async (parentId: string) => {
      return prisma.parentLink.findMany({ where: { parentId } })
    },
    getByStudent: async (studentId: string) => {
      return prisma.parentLink.findFirst({ where: { studentId } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.parentLink.create({ data: { ...data, schoolId } })
    },
    delete: async (id: string) => {
      await prisma.parentLink.delete({ where: { id } })
      return true
    },
  },

  attendanceLogs: {
    getAll: async () => {
      return prisma.attendanceLog.findMany()
    },
    getByUser: async (userId: string) => {
      return prisma.attendanceLog.findMany({ where: { userId } })
    },
    getByUserAndDate: async (userId: string, date: string) => {
      return prisma.attendanceLog.findFirst({ where: { userId, date } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.attendanceLog.create({ data: { ...data, schoolId } })
    },
    getToday: async () => {
      const today = new Date().toISOString().split("T")[0]
      return prisma.attendanceLog.findMany({ where: { date: today } })
    },
  },

  attendanceQRCodes: {
    getAll: async () => {
      return prisma.attendanceQRCode.findMany()
    },
    getByType: async (type: string) => {
      return prisma.attendanceQRCode.findMany({ where: { type } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.attendanceQRCode.create({ data: { ...data, schoolId } })
    },
  },

  reportCards: {
    getAll: async () => {
      return prisma.reportCard.findMany()
    },
    getByStudent: async (studentId: string) => {
      return prisma.reportCard.findMany({ where: { studentId } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.reportCard.create({ data: { ...data, schoolId } })
    },
  },

  topics: {
    getAll: async (subjectId?: string) => {
      return prisma.topic.findMany({
        where: subjectId ? { subjectId } : undefined,
      })
    },
    getById: async (id: string) => {
      return prisma.topic.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.topic.create({ data: { ...data, schoolId } })
    },
    update: async (id: string, data: any) => {
      return prisma.topic.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.topic.delete({ where: { id } })
      return true
    },
  },

  bankDetails: {
    get: async () => {
      const school = await prisma.school.findFirst()
      if (!school) return store.bankDetails.get()
      const details = await prisma.bankDetails.findFirst({ where: { schoolId: school.id } })
      if (!details) return {}
      return {
        bankName: details.bankName || "",
        accountName: details.accountName || "",
        accountNumber: details.accountNumber || "",
      }
    },
    update: async (data: any) => {
      const school = await prisma.school.findFirst()
      if (!school) return store.bankDetails.update(data)
      const details = await prisma.bankDetails.upsert({
        where: { schoolId: school.id },
        create: { schoolId: school.id, ...data },
        update: data,
      })
      return {
        bankName: details.bankName || "",
        accountName: details.accountName || "",
        accountNumber: details.accountNumber || "",
        updatedAt: details.updatedAt.toISOString(),
      }
    },
  },

  feeStructures: {
    getAll: async (classId?: string) => {
      return prisma.feeStructure.findMany({
        where: classId ? { classId } : undefined,
      })
    },
    getById: async (id: string) => {
      return prisma.feeStructure.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.feeStructure.create({ data: { ...data, schoolId } })
    },
    update: async (id: string, data: any) => {
      return prisma.feeStructure.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.feeStructure.delete({ where: { id } })
      return true
    },
  },

  payments: {
    getAll: async (studentId?: string) => {
      return prisma.payment.findMany({
        where: studentId ? { studentId } : undefined,
        orderBy: { createdAt: "desc" },
      })
    },
    getById: async (id: string) => {
      return prisma.payment.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.payment.create({
        data: {
          studentId: data.studentId,
          feeStructureId: data.feeStructureId || null,
          amount: data.amount,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      return prisma.payment.update({ where: { id }, data })
    },
    confirm: async (id: string, confirmedBy: string) => {
      return prisma.payment.update({
        where: { id },
        data: { status: "confirmed", confirmedAt: new Date(), confirmedBy },
      })
    },
    reject: async (id: string, confirmedBy: string) => {
      return prisma.payment.update({
        where: { id },
        data: { status: "rejected", confirmedAt: new Date(), confirmedBy },
      })
    },
    getPending: async () => {
      return prisma.payment.findMany({ where: { status: "pending" } })
    },
    getByStudentAndStatus: async (studentId: string, status: string) => {
      return prisma.payment.findMany({ where: { studentId, status } })
    },
  },

  salaryStructures: {
    getAll: async () => {
      return prisma.salaryStructure.findMany()
    },
    getByStaff: async (staffId: string) => {
      return prisma.salaryStructure.findUnique({ where: { staffId } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.salaryStructure.create({ data: { ...data, schoolId } })
    },
    update: async (staffId: string, data: any) => {
      const existing = await prisma.salaryStructure.findUnique({ where: { staffId } })
      if (!existing) return null
      return prisma.salaryStructure.update({ where: { staffId }, data })
    },
  },

  salaryRecords: {
    getAll: async (staffId?: string) => {
      return prisma.salaryRecord.findMany({
        where: staffId ? { staffId } : undefined,
        orderBy: { createdAt: "desc" },
      })
    },
    getByStaffAndMonth: async (staffId: string, month: string, year: string) => {
      return prisma.salaryRecord.findFirst({ where: { staffId, month, year } })
    },
    getById: async (id: string) => {
      return prisma.salaryRecord.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.salaryRecord.create({ data: { ...data, schoolId } })
    },
    markPaid: async (id: string, paidAt: string, confirmedBy: string) => {
      return prisma.salaryRecord.update({
        where: { id },
        data: { status: "paid", paidAt: new Date(paidAt), confirmedAt: new Date(), confirmedBy },
      })
    },
    getByMonth: async (month: string, year: string) => {
      return prisma.salaryRecord.findMany({ where: { month, year } })
    },
  },

  documents: {
    getAll: async (studentId?: string) => {
      return prisma.document.findMany({
        where: studentId ? { studentId } : undefined,
      })
    },
    getById: async (id: string) => {
      return prisma.document.findUnique({ where: { id } })
    },
    getByType: async (type: string) => {
      return prisma.document.findMany({ where: { type } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.document.create({ data: { ...data, schoolId } })
    },
    update: async (id: string, data: any) => {
      return prisma.document.update({ where: { id }, data })
    },
  },

  admissionSettings: {
    get: async () => {
      const school = await prisma.school.findFirst()
      if (!school) return store.admissionSettings.get()
      const settings = await prisma.admissionSettings.findFirst({ where: { schoolId: school.id } })
      if (!settings) return { cutOffs: [], entranceExamId: null }
      return {
        cutOffs: settings.cutOffs as any[] || [],
        entranceExamId: settings.entranceExamId || null,
      }
    },
    update: async (data: any) => {
      const school = await prisma.school.findFirst()
      if (!school) return store.admissionSettings.update(data)
      const settings = await prisma.admissionSettings.upsert({
        where: { schoolId: school.id },
        create: { schoolId: school.id, ...data },
        update: data,
      })
      return {
        cutOffs: settings.cutOffs as any[] || [],
        entranceExamId: settings.entranceExamId || null,
        updatedAt: settings.updatedAt.toISOString(),
      }
    },
  },

  admissionApplications: {
    getAll: async () => {
      return prisma.admissionApplication.findMany({ orderBy: { appliedAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.admissionApplication.findUnique({ where: { id } })
    },
    getByStatus: async (status: string) => {
      return prisma.admissionApplication.findMany({ where: { status } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.admissionApplication.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || null,
          phone: data.phone || null,
          gender: data.gender || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          address: data.address || null,
          classApplyingFor: data.classApplyingFor || null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      return prisma.admissionApplication.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.admissionApplication.delete({ where: { id } })
      return true
    },
  },

  events: {
    getAll: async (filters?: { type?: string; upcoming?: boolean }) => {
      const where: any = {}
      if (filters?.type) where.type = filters.type
      let events = await prisma.event.findMany({ where, orderBy: { date: "asc" } })
      if (filters?.upcoming) {
        const today = new Date(new Date().toDateString())
        events = events.filter((e) => e.date >= today)
      }
      return events
    },
    getById: async (id: string) => {
      return prisma.event.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.event.create({
        data: {
          ...data,
          date: new Date(data.date),
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const updateData: any = { ...data }
      if (data.date) updateData.date = new Date(data.date)
      return prisma.event.update({ where: { id }, data: updateData })
    },
    delete: async (id: string) => {
      await prisma.event.delete({ where: { id } })
      return true
    },
  },

  superAnnouncements: {
    getAll: async () => {
      return prisma.announcement.findMany({
        where: { source: "super" },
        orderBy: { createdAt: "desc" },
      })
    },
    getActive: async () => {
      return prisma.announcement.findMany({
        where: {
          source: "super",
          active: true,
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
        orderBy: { createdAt: "desc" },
      })
    },
    getById: async (id: string) => {
      return prisma.announcement.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.announcement.create({
        data: {
          title: data.title,
          content: data.content,
          audience: data.audience || "all",
          priority: data.priority || "normal",
          active: data.active !== undefined ? data.active : true,
          endDate: data.endDate ? new Date(data.endDate) : null,
          source: "super",
          author: data.author || "Super Admin",
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const updateData: any = { ...data }
      if (data.endDate !== undefined) {
        updateData.endDate = data.endDate ? new Date(data.endDate) : null
      }
      return prisma.announcement.update({ where: { id }, data: updateData })
    },
    delete: async (id: string) => {
      await prisma.announcement.delete({ where: { id } })
      return true
    },
  },

  feedbackTickets: {
    getAll: async () => {
      return prisma.feedbackTicket.findMany({ orderBy: { createdAt: "desc" } })
    },
    getByStatus: async (status: string) => {
      return prisma.feedbackTicket.findMany({ where: { status } })
    },
    getById: async (id: string) => {
      return prisma.feedbackTicket.findUnique({ where: { id } })
    },
    getByUser: async (userId: string) => {
      return prisma.feedbackTicket.findMany({ where: { from: userId } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.feedbackTicket.create({
        data: {
          from: data.from,
          subject: data.subject,
          message: data.message,
          priority: data.priority || null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any, userId?: string) => {
      if (userId) {
        const ticket = await prisma.feedbackTicket.findUnique({ where: { id } })
        if (!ticket || ticket.from !== userId) return null
      }
      return prisma.feedbackTicket.update({ where: { id }, data })
    },
    delete: async (id: string, userId?: string) => {
      if (userId) {
        const ticket = await prisma.feedbackTicket.findUnique({ where: { id } })
        if (!ticket || ticket.from !== userId) return false
      }
      await prisma.feedbackTicket.delete({ where: { id } })
      return true
    },
    resolve: async (id: string, resolution: string) => {
      return prisma.feedbackTicket.update({
        where: { id },
        data: { status: "resolved", resolvedAt: new Date(), resolution },
      })
    },
  },

  weeklyReports: {
    getAll: async (filters?: { studentId?: string; classId?: string; week?: number; term?: string; session?: string; createdBy?: string; status?: string }) => {
      const where: any = {}
      if (filters?.studentId) where.studentId = filters.studentId
      if (filters?.classId) where.classId = filters.classId
      if (filters?.week !== undefined) where.week = filters.week
      if (filters?.term) where.term = filters.term
      if (filters?.session) where.session = filters.session
      if (filters?.createdBy) where.createdBy = filters.createdBy
      if (filters?.status) where.status = filters.status
      return prisma.weeklyReport.findMany({ where, orderBy: { createdAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.weeklyReport.findUnique({ where: { id } })
    },
    getByStudent: async (studentId: string, term?: string, session?: string) => {
      const where: any = { studentId }
      if (term) where.term = term
      if (session) where.session = session
      return prisma.weeklyReport.findMany({ where })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.weeklyReport.create({
        data: {
          studentId: data.studentId,
          classId: data.classId,
          week: data.week,
          term: data.term || null,
          session: data.session || null,
          content: data.content || undefined,
          status: data.status || "draft",
          createdBy: data.createdBy || null,
          publishedAt: data.status === "published" ? new Date() : null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const updateData: any = { ...data }
      if (data.status === "published") {
        const existing = await prisma.weeklyReport.findUnique({ where: { id } })
        if (existing && !existing.publishedAt) {
          updateData.publishedAt = new Date()
        }
      }
      return prisma.weeklyReport.update({ where: { id }, data: updateData })
    },
    delete: async (id: string) => {
      await prisma.weeklyReport.delete({ where: { id } })
      return true
    },
  },

  users: {
    getByEmail: async (email: string) => {
      return prisma.user.findFirst({ where: { email } })
    },
    getById: async (id: string) => {
      return prisma.user.findUnique({ where: { id } })
    },
    getAll: async (role?: string) => {
      return prisma.user.findMany({
        where: role ? { role: role as any } : undefined,
      })
    },
    update: async (id: string, data: any) => {
      return prisma.user.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.user.delete({ where: { id } })
      return true
    },
  },

  lessonQuizResults: {
    getAll: async () => {
      return prisma.lessonQuizResult.findMany()
    },
    getByStudent: async (studentId: string) => {
      return prisma.lessonQuizResult.findMany({ where: { studentId } })
    },
    getByLessonNote: async (lessonNoteId: string) => {
      return prisma.lessonQuizResult.findMany({ where: { lessonNoteId } })
    },
    getByStudentAndLessonNote: async (studentId: string, lessonNoteId: string) => {
      return prisma.lessonQuizResult.findFirst({ where: { studentId, lessonNoteId } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.lessonQuizResult.create({
        data: {
          studentId: data.studentId,
          lessonNoteId: data.lessonNoteId,
          score: data.score || 0,
          totalQuestions: data.totalQuestions || 0,
          correctAnswers: data.correctAnswers || 0,
          answers: data.answers || undefined,
          subject: data.subject || null,
          schoolId,
        },
      })
    },
    getAnalysis: async (studentId: string) => {
      const results = await prisma.lessonQuizResult.findMany({ where: { studentId } })
      const totalAttempts = results.length
      const totalQuestions = results.reduce((s, r) => s + r.totalQuestions, 0)
      const totalCorrect = results.reduce((s, r) => s + r.correctAnswers, 0)
      const masteryRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
      const subjectBreakdown: Record<string, { total: number; correct: number }> = {}
      results.forEach((r) => {
        const sub = r.subject || "General"
        if (!subjectBreakdown[sub]) subjectBreakdown[sub] = { total: 0, correct: 0 }
        subjectBreakdown[sub].total += r.totalQuestions
        subjectBreakdown[sub].correct += r.correctAnswers
      })
      return { totalAttempts, totalQuestions, totalCorrect, masteryRate, subjectBreakdown }
    },
    getClassAnalysis: async (classId: string) => {
      const sts = await prisma.student.findMany({ where: { classId } })
      const studentIds = sts.map((s) => s.id)
      const results = await prisma.lessonQuizResult.findMany({ where: { studentId: { in: studentIds } } })
      const studentMap: Record<string, { total: number; correct: number; subjectBreakdown: Record<string, { total: number; correct: number }> }> = {}
      results.forEach((r) => {
        if (!studentMap[r.studentId]) studentMap[r.studentId] = { total: 0, correct: 0, subjectBreakdown: {} }
        studentMap[r.studentId].total += r.totalQuestions
        studentMap[r.studentId].correct += r.correctAnswers
        const sub = r.subject || "General"
        if (!studentMap[r.studentId].subjectBreakdown[sub]) studentMap[r.studentId].subjectBreakdown[sub] = { total: 0, correct: 0 }
        studentMap[r.studentId].subjectBreakdown[sub].total += r.totalQuestions
        studentMap[r.studentId].subjectBreakdown[sub].correct += r.correctAnswers
      })
      const classTotalQ = results.reduce((s, r) => s + r.totalQuestions, 0)
      const classTotalC = results.reduce((s, r) => s + r.correctAnswers, 0)
      const nameMap = sts.reduce((acc: Record<string, string>, s) => { acc[s.id] = `${s.firstName} ${s.lastName}`; return acc }, {})
      return {
        studentCount: studentIds.length,
        attemptedCount: Object.keys(studentMap).length,
        totalQuestions: classTotalQ,
        totalCorrect: classTotalC,
        classMastery: classTotalQ > 0 ? Math.round((classTotalC / classTotalQ) * 100) : 0,
        students: Object.entries(studentMap).map(([sid, data]) => ({
          studentId: sid,
          studentName: nameMap[sid] || "Unknown",
          masteryRate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
          totalQuestions: data.total,
          correctAnswers: data.correct,
          subjectBreakdown: data.subjectBreakdown,
        })),
      }
    },
  },
}
