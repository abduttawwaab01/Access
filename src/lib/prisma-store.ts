import { prisma } from "./prisma"
import { store } from "./api-store"

type PaginationParams = { page?: number; pageSize?: number }

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function paginatedQuery<T, A extends { where?: any; orderBy?: any; include?: any; select?: any }>(
  delegate: { findMany: (args: any) => Promise<T[]>; count: (args: { where?: any }) => Promise<number> },
  args: A,
  params: PaginationParams = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(500, Math.max(1, params.pageSize ?? 500))
  const skip = (page - 1) * pageSize
  const [data, total] = await Promise.all([
    delegate.findMany({ ...args, skip, take: pageSize }),
    delegate.count({ where: (args as any).where }),
  ])
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

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
    getByUserId: async (userId: string) => {
      return prisma.student.findUnique({ where: { userId } })
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
          userId: data.userId || null,
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
        studentIdCardConfig: {
          backTitle: "Student Information",
          showAddress: true,
          showBloodGroup: true,
          showEmergencyContact: true,
          showMedicalNotes: true,
          showRules: true,
          rulesText: "1. This card is the property of the school and must be returned upon request.\n2. Report lost or damaged cards immediately.\n3. This card is non-transferable.\n4. Students must present this card for identification.\n5. Unauthorized modification is prohibited.",
          customFields: [],
          ...(settings.studentIdCardConfig || {}),
        },
        staffIdCardConfig: {
          backTitle: "Staff Information",
          showDepartment: true,
          showEmergencyContact: true,
          showRules: true,
          rulesText: "1. This card is the property of the school.\n2. Report lost or damaged cards immediately.\n3. This card is non-transferable.\n4. Staff must present this card for identification.\n5. Unauthorized modification is prohibited.",
          customFields: [],
          ...(settings.staffIdCardConfig || {}),
        },
        schoolQRCode: settings.schoolQRCode || "",
        loginEnabled: settings.loginEnabled !== false,
        expirationDate: settings.expirationDate || null,
        superAdminPassword: settings.superAdminPassword || "successor",
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
    getByUserId: async (userId: string) => {
      return prisma.staff.findFirst({ where: { userId } })
    },
    getByEmail: async (email: string) => {
      return prisma.staff.findFirst({ where: { email } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      const staffId = `STF${Date.now()}`
      const { password, ...rest } = data
      return prisma.staff.create({
        data: { ...rest, staffId, schoolId },
      })
    },
    update: async (id: string, data: any) => {
      const { staffId, createdAt, password, status, ...rest } = data
      const clean: any = { ...rest }
      if (clean.dateOfBirth === "" || clean.dateOfBirth === null) clean.dateOfBirth = null
      else if (typeof clean.dateOfBirth === "string") clean.dateOfBirth = new Date(clean.dateOfBirth)
      if (clean.employmentDate === "" || clean.employmentDate === null) clean.employmentDate = null
      else if (typeof clean.employmentDate === "string") clean.employmentDate = new Date(clean.employmentDate)
      if (clean.salary === "" || clean.salary === null) clean.salary = null
      else if (typeof clean.salary === "string") clean.salary = Number(clean.salary)
      return prisma.staff.update({ where: { id }, data: clean })
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
          subjectId: data.subjectId || null,
          subject: data.subject || null,
          title: data.title,
          content: data.content || undefined,
          topic: data.topic || null,
          quiz: data.quiz || [],
          week: data.week ? Number(data.week) : null,
          term: data.term || null,
          session: data.session || null,
          resources: data.resources || null,
          status: data.status || "draft",
          createdBy: data.createdBy || null,
          approvedBy: data.approvedBy || null,
          approvedAt: data.approvedAt ? new Date(data.approvedAt) : null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const { approvedAt, rejectedAt, ...rest } = data
      const updateData: any = { ...rest }
      if (data.week) updateData.week = Number(data.week)
      if (approvedAt) updateData.approvedAt = new Date(approvedAt)
      if (rejectedAt) updateData.rejectedAt = new Date(rejectedAt)
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
      const content = data.content || (data.weeks ? { weeks: data.weeks, term: data.term, session: data.session } : undefined)
      return prisma.schemeOfWork.create({
        data: {
          classId: data.classId,
          subjectId: data.subjectId,
          title: data.title,
          content,
          status: data.status || "draft",
          createdBy: data.createdBy || null,
          approvedBy: data.approvedBy || null,
          approvedAt: data.approvedAt ? new Date(data.approvedAt) : null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const updateData: any = {}
      if (data.title !== undefined) updateData.title = data.title
      if (data.classId !== undefined) updateData.classId = data.classId
      if (data.subjectId !== undefined) updateData.subjectId = data.subjectId
      if (data.status !== undefined) updateData.status = data.status
      if (data.createdBy !== undefined) updateData.createdBy = data.createdBy
      if (data.approvedBy !== undefined) updateData.approvedBy = data.approvedBy
      if (data.approvedAt !== undefined) updateData.approvedAt = data.approvedAt ? new Date(data.approvedAt) : null
      if (data.content !== undefined || data.weeks !== undefined) {
        updateData.content = data.content || { weeks: data.weeks, term: data.term, session: data.session }
      }
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
      const assignments = await prisma.assignment.findMany({
        where: classId ? { classId } : undefined,
        orderBy: { createdAt: "desc" },
      })
      const assignmentIds = assignments.map((a) => a.id)
      const classIds = [...new Set(assignments.map((a) => a.classId))]
      const [submissionCounts, studentCounts] = await Promise.all([
        assignmentIds.length > 0
          ? prisma.submission.groupBy({ by: ["assignmentId"], _count: true, where: { assignmentId: { in: assignmentIds } } })
          : Promise.resolve([]),
        classIds.length > 0
          ? Promise.all(classIds.map((cid) => prisma.student.count({ where: { classId: cid } }).then((c) => ({ classId: cid, count: c }))))
          : Promise.resolve([]),
      ])
      const subMap = Object.fromEntries(submissionCounts.map((s) => [s.assignmentId, s._count]))
      const studentMap = Object.fromEntries(studentCounts.map((s) => [s.classId, s.count]))
      return assignments.map((a) => ({
        ...a,
        submissions: subMap[a.id] || 0,
        total: studentMap[a.classId] || 0,
      }))
    },
    getById: async (id: string) => {
      return prisma.assignment.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.assignment.create({
        data: {
          classId: data.classId,
          subjectId: data.subjectId || data.subject || "",
          subject: data.subject || null,
          type: data.type || null,
          title: data.title,
          description: data.description || null,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          status: data.status || "active",
          createdBy: data.createdBy || null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const updateData: any = {}
      if (data.classId !== undefined) updateData.classId = data.classId
      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.subjectId !== undefined) updateData.subjectId = data.subjectId
      if (data.subject !== undefined) updateData.subject = data.subject
      if (data.type !== undefined) updateData.type = data.type
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
      if (data.status !== undefined) updateData.status = data.status
      if (data.createdBy !== undefined) updateData.createdBy = data.createdBy
      return prisma.assignment.update({ where: { id }, data: updateData })
    },
    delete: async (id: string) => {
      await prisma.assignment.delete({ where: { id } })
      return true
    },
  },

  timetableSets: {
    getAll: async (filters?: { type?: string; classId?: string }) => {
      const where: any = {}
      if (filters?.type) where.type = filters.type
      if (filters?.classId) where.classId = filters.classId
      return prisma.timetableSet.findMany({ where, orderBy: { createdAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.timetableSet.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.timetableSet.create({ data: { name: data.name, type: data.type || null, classId: data.classId || null, schoolId } })
    },
    update: async (id: string, data: any) => {
      return prisma.timetableSet.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.timetableEntry.deleteMany({ where: { setId: id } })
      await prisma.timetableSet.delete({ where: { id } })
      return true
    },
  },

  timetable: {
    getAll: async (filters?: { setId?: string; day?: string; classId?: string; teacherId?: string }) => {
      const where: any = {}
      if (filters?.setId) where.setId = filters.setId
      if (filters?.day) where.day = filters.day
      if (filters?.classId) where.classId = filters.classId
      if (filters?.teacherId) where.teacherId = filters.teacherId
      return prisma.timetableEntry.findMany({ where })
    },
    getById: async (id: string) => {
      return prisma.timetableEntry.findUnique({ where: { id } })
    },
    getByDay: async (day: string) => {
      return prisma.timetableEntry.findMany({ where: { day } })
    },
    getBySet: async (setId: string) => {
      return prisma.timetableEntry.findMany({ where: { setId } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      const clean: any = {}
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) clean[k] = v
      }
      return prisma.timetableEntry.create({ data: { ...clean, schoolId } })
    },
    update: async (id: string, data: any) => {
      const clean: any = {}
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) clean[k] = v
      }
      return prisma.timetableEntry.update({ where: { id }, data: clean })
    },
    delete: async (id: string) => {
      await prisma.timetableEntry.delete({ where: { id } })
      return true
    },
    deleteBySet: async (setId: string) => {
      await prisma.timetableEntry.deleteMany({ where: { setId } })
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
    getByClass: async (classId: string, term?: string, session?: string) => {
      const where: any = { classId }
      if (term) where.term = term
      if (session) where.session = session
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
      const boundaries = [...(gc.gradeBoundaries || [])].sort((a: any, b: any) => b.min - a.min)
      let grade = "F", remark = "Needs Improvement"
      for (const b of boundaries) {
        if (pct >= b.min) { grade = b.grade; remark = b.remark; break }
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
    upsert: async (data: any) => {
      const existing = await prisma.result.findFirst({
        where: {
          studentId: data.studentId,
          subjectId: data.subjectId,
          classId: data.classId,
          term: data.term,
          session: data.session || undefined,
        },
      })
      if (existing) {
        return db.results.update(existing.id, data)
      }
      return db.results.create(data)
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
      const boundaries = [...(gc.gradeBoundaries || [])].sort((a: any, b: any) => b.min - a.min)
      let grade = "F", remark = "Needs Improvement"
      for (const b of boundaries) {
        if (pct >= b.min) { grade = b.grade; remark = b.remark; break }
      }
      return prisma.result.update({
        where: { id },
        data: {
          studentId: data.studentId,
          subjectId: data.subjectId,
          classId: data.classId,
          term: data.term,
          session: data.session || null,
          examId: data.examId || null,
          caScore, examScore, caTotal, examTotal, total, score: total, totalMax, grade, remark,
        },
      })
    },
    delete: async (id: string) => {
      await prisma.result.delete({ where: { id } })
      return true
    },
    deleteAll: async () => {
      const schoolId = await ensureSchoolId()
      await prisma.result.deleteMany({ where: { schoolId } })
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
          question: data.question ?? data.text ?? "",
          type: data.type ?? "mcq",
          options: data.options ?? undefined,
          answer: data.answer ?? data.correctAnswer ?? null,
          difficulty: data.difficulty ?? "medium",
          topic: data.topic ?? null,
          points: data.points ?? 1,
          createdBy: data.createdBy ?? null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const mapped: any = {}
      if (data.question !== undefined) mapped.question = data.question
      else if (data.text !== undefined) mapped.question = data.text
      if (data.type !== undefined) mapped.type = data.type
      if (data.options !== undefined) mapped.options = data.options
      if (data.answer !== undefined) mapped.answer = data.answer
      else if (data.correctAnswer !== undefined) mapped.answer = data.correctAnswer
      if (data.difficulty !== undefined) mapped.difficulty = data.difficulty
      if (data.topic !== undefined) mapped.topic = data.topic
      if (data.points !== undefined) mapped.points = data.points
      if (data.approved !== undefined) mapped.approved = data.approved
      if (data.approvedBy !== undefined) mapped.approvedBy = data.approvedBy
      if (data.createdBy !== undefined) mapped.createdBy = data.createdBy
      if (data.subjectId !== undefined) mapped.subjectId = data.subjectId
      if (data.classId !== undefined) mapped.classId = data.classId
      return prisma.question.update({ where: { id }, data: mapped })
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
          description: data.description || null,
          subjectId: data.subjectId,
          classId: data.classId,
          type: data.type || null,
          duration: data.duration || null,
          shuffleQuestions: data.shuffleQuestions ?? false,
          showResults: data.showResults ?? true,
          requireFullscreen: data.requireFullscreen ?? true,
          tabSwitchLimit: data.tabSwitchLimit ?? 3,
          allowCopyPaste: data.allowCopyPaste ?? false,
          maxAttempts: data.maxAttempts ?? 0,
          questions: data.questions || [],
          status: data.status || "published",
          createdBy: data.createdBy || null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const allowed = ["title","description","subjectId","classId","type","duration","shuffleQuestions","showResults","requireFullscreen","tabSwitchLimit","allowCopyPaste","maxAttempts","questions","status","approvedBy","approvedAt","createdBy"]
      const clean: any = {}
      for (const key of allowed) {
        if (data[key] !== undefined) clean[key] = data[key]
      }
      return prisma.exam.update({ where: { id }, data: clean })
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
      
      const exam = await prisma.exam.findUnique({
        where: { id: data.examId },
        include: {
          class: true,
          subject: true,
        },
      })
      
      if (!exam) {
        throw new Error("Exam not found")
      }
      
      // For entrance exams, allow creating session without a student account
      if (data.examType === "entrance" && !data.studentId) {
        return prisma.examSession.create({
          data: {
            examId: data.examId,
            examType: "entrance",
            studentId: data.studentName || "entrance-applicant",
            schoolId,
            status: "active",
          },
        })
      }
      
      const student = await prisma.student.findUnique({
        where: { id: data.studentId },
        include: {
          class: true,
        },
      })
      
      if (!student) {
        throw new Error("Student not found")
      }
      
      if (student.classId !== exam.classId) {
        throw new Error("Student is not enrolled in the class for this exam")
      }
      
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
      const validFields = ["status", "answers", "tabSwitches", "flagged", "examType"]
      const clean: any = {}
      for (const key of validFields) {
        if (data[key] !== undefined) clean[key] = data[key]
      }
      if (data.totalScore !== undefined) clean.score = data.totalScore
      if (data.maxScore !== undefined) clean.maxScore = data.maxScore
      if (data.endTime !== undefined) clean.endTime = new Date(data.endTime)
      if (Object.keys(clean).length === 0) return prisma.examSession.findUnique({ where: { id } })
      return prisma.examSession.update({ where: { id }, data: clean })
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
      const log = await prisma.attendanceLog.create({
        data: {
          userId: data.userId,
          userType: data.userType,
          date: data.date,
          time: data.time,
          status: data.status,
          method: data.method,
          timestamp: data.timestamp || new Date(),
          schoolId,
        },
      })
      return log
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

  reportCardEntries: {
    get: async (studentId: string, term: string, session: string) => {
      return prisma.reportCardEntry.findUnique({
        where: { studentId_term_session: { studentId, term, session } },
      })
    },
    getByStudent: async (studentId: string) => {
      return prisma.reportCardEntry.findMany({ where: { studentId } })
    },
    upsert: async (data: {
      studentId: string
      classId: string
      term: string
      session: string
      teacherComment?: string | null
      teacherName?: string | null
      principalComment?: string | null
      nextTerm?: string | null
      domains?: any
    }) => {
      const schoolId = await ensureSchoolId()
      const existing = await prisma.reportCardEntry.findUnique({
        where: { studentId_term_session: { studentId: data.studentId, term: data.term, session: data.session } },
      })
      if (existing) {
        return prisma.reportCardEntry.update({
          where: { id: existing.id },
          data: {
            classId: data.classId,
            teacherComment: data.teacherComment,
            teacherName: data.teacherName,
            principalComment: data.principalComment,
            nextTerm: data.nextTerm,
            domains: data.domains,
          },
        })
      }
      return prisma.reportCardEntry.create({
        data: {
          studentId: data.studentId,
          classId: data.classId,
          term: data.term,
          session: data.session,
          schoolId,
          teacherComment: data.teacherComment,
          teacherName: data.teacherName,
          principalComment: data.principalComment,
          nextTerm: data.nextTerm,
          domains: data.domains,
        },
      })
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
      const { amount } = data
      return prisma.salaryStructure.create({ data: { staffId: data.staffId, amount, schoolId } })
    },
    update: async (staffId: string, data: any) => {
      const existing = await prisma.salaryStructure.findUnique({ where: { staffId } })
      if (!existing) return null
      const { amount } = data
      return prisma.salaryStructure.update({ where: { staffId }, data: { amount } })
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
          parentName: data.parentName || null,
          parentPhone: data.parentPhone || null,
          previousSchool: data.previousSchool || null,
          entranceCodeId: data.entranceCodeId || null,
          examSessionId: data.examSessionId || null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const allowed = ["firstName","lastName","email","phone","gender","dateOfBirth","address","classApplyingFor","parentName","parentPhone","previousSchool","status","entranceExamPassed","entranceExamScore","entranceCodeId","examSessionId","adminNotes","userId"]
      const clean: any = {}
      for (const key of allowed) {
        if (data[key] !== undefined) clean[key] = data[key]
      }
      if (data.dateOfBirth) clean.dateOfBirth = new Date(data.dateOfBirth)
      return prisma.admissionApplication.update({ where: { id }, data: clean })
    },
    delete: async (id: string) => {
      await prisma.admissionApplication.delete({ where: { id } })
      return true
    },
  },

  entranceExamCodes: {
    getAll: async () => {
      const schoolId = await ensureSchoolId()
      return prisma.entranceExamCode.findMany({
        where: { schoolId },
        orderBy: { createdAt: "desc" },
      })
    },
    getByCode: async (code: string) => {
      return prisma.entranceExamCode.findUnique({ where: { code } })
    },
    getById: async (id: string) => {
      return prisma.entranceExamCode.findUnique({ where: { id } })
    },
    create: async (data: any) => {
      const schoolId = await ensureSchoolId()
      return prisma.entranceExamCode.create({
        data: {
          code: data.code,
          examId: data.examId,
          classId: data.classId,
          maxUses: data.maxUses || 1,
          schoolId,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
      })
    },
    update: async (id: string, data: any) => {
      return prisma.entranceExamCode.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      await prisma.entranceExamCode.delete({ where: { id } })
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
          title: data.title,
          description: data.description || null,
          date: new Date(data.date),
          time: data.time || null,
          type: data.type || null,
          audience: data.audience || "all",
          createdBy: data.createdBy || null,
          schoolId,
        },
      })
    },
    update: async (id: string, data: any) => {
      const { endDate, endTime, createdAt, ...clean } = data
      const updateData: any = { ...clean }
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
          displayType: data.displayType || "banner",
          active: data.active !== undefined ? data.active : true,
          endDate: data.endDate ? new Date(data.endDate) : null,
          buttonLabel: data.buttonLabel || null,
          buttonUrl: data.buttonUrl || null,
          mediaUrl: data.mediaUrl || null,
          mediaType: data.mediaType || "image",
          reviewEnabled: data.reviewEnabled || false,
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

  announcementReviews: {
    getAll: async () => {
      return prisma.announcementReview.findMany({
        orderBy: { createdAt: "desc" },
        include: { announcement: { select: { title: true } } },
      })
    },
    getByAnnouncement: async (announcementId: string) => {
      return prisma.announcementReview.findMany({
        where: { announcementId },
        orderBy: { createdAt: "desc" },
      })
    },
    create: async (data: { announcementId: string; userId?: string; userName?: string; content: string; rating?: number }) => {
      return prisma.announcementReview.create({ data })
    },
    delete: async (id: string) => {
      await prisma.announcementReview.delete({ where: { id } })
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

  dangerZone: {
    async deleteAll(categories: string[]) {
      const schoolId = await ensureSchoolId()
      const catSet = new Set(categories)

      await prisma.$transaction(async (tx) => {
        // Group 1: Academic Records
        if (catSet.has("academic-records")) {
          await tx.lessonQuizResult.deleteMany({ where: { schoolId } })
          await tx.attendanceRecord.deleteMany({ where: { schoolId } })
          await tx.submission.deleteMany({ where: { schoolId } })
          await tx.assignment.deleteMany({ where: { schoolId } })
          await tx.result.deleteMany({ where: { schoolId } })
        }

        // Group 2: Assessment Content
        if (catSet.has("assessment-content")) {
          await tx.examSession.deleteMany({ where: { schoolId } })
          await tx.exam.deleteMany({ where: { schoolId } })
          await tx.question.deleteMany({ where: { schoolId } })
          await tx.topic.deleteMany({ where: { schoolId } })
        }

        // Group 3: Finance
        if (catSet.has("finance")) {
          await tx.salaryRecord.deleteMany({ where: { schoolId } })
          await tx.salaryStructure.deleteMany({ where: { schoolId } })
          await tx.payment.deleteMany({ where: { schoolId } })
          await tx.feeStructure.deleteMany({ where: { schoolId } })
          await tx.fee.deleteMany({ where: { schoolId } })
        }

        // Group 4: Communication & Reports
        if (catSet.has("communication-reports")) {
          await tx.message.deleteMany({ where: { conversation: { schoolId } } })
          await tx.conversationParticipant.deleteMany({ where: { conversation: { schoolId } } })
          await tx.conversation.deleteMany({ where: { schoolId } })
          await tx.weeklyReport.deleteMany({ where: { schoolId } })
          await tx.reportCardEntry.deleteMany({ where: { schoolId } })
          await tx.reportCard.deleteMany({ where: { schoolId } })
        }

        // Group 5: Schedule
        if (catSet.has("schedule")) {
          await tx.timetableEntry.deleteMany({ where: { schoolId } })
          await tx.timetableSet.deleteMany({ where: { schoolId } })
          await tx.attendanceQRCode.deleteMany({ where: { schoolId } })
          await tx.attendanceLog.deleteMany({ where: { schoolId } })
        }

        // Group 6: People Data
        if (catSet.has("people")) {
          await tx.parentLink.deleteMany({ where: { schoolId } })
          await tx.teacherAssignment.deleteMany({ where: { schoolId } })
          await tx.student.deleteMany({ where: { schoolId } })
          await tx.staff.deleteMany({ where: { schoolId } })
          await tx.user.deleteMany({ where: { schoolId } })
        }

        // Group 7: Academic Setup
        if (catSet.has("academic-setup")) {
          await tx.lessonNote.deleteMany({ where: { schoolId } })
          await tx.schemeOfWork.deleteMany({ where: { schoolId } })
          await tx.subject.deleteMany({ where: { schoolId } })
          await tx.term.deleteMany({ where: { session: { schoolId } } })
          await tx.academicSession.deleteMany({ where: { schoolId } })
          await tx.class.deleteMany({ where: { schoolId } })
        }

        // Group 8: Misc
        if (catSet.has("misc")) {
          await tx.event.deleteMany({ where: { schoolId } })
          await tx.feedbackTicket.deleteMany({ where: { schoolId } })
          await tx.document.deleteMany({ where: { schoolId } })
          await tx.entranceExamCode.deleteMany({ where: { schoolId } })
          await tx.admissionApplication.deleteMany({ where: { schoolId } })
          await tx.admissionSettings.deleteMany({ where: { schoolId } })
          await tx.gradingConfig.deleteMany({ where: { schoolId } })
          await tx.bankDetails.deleteMany({ where: { schoolId } })
          await tx.announcement.deleteMany({ where: { schoolId } })
        }

        // Count remaining records for confirmation
        const remaining = await tx.school.findFirst({ where: { id: schoolId } })
        return remaining
      })

      return { success: true, message: "Selected data deleted successfully" }
    },

    async getCounts() {
      const schoolId = await ensureSchoolId()
      const [results, attendance, assignments, submissions, quizzes, sessions, exams, questions, topics,
        payments, fees, feeStructs, salaryRecs, salaryStructs,
        messages, convos, weeklyRpts, reportCards, reportCardEntries,
        ttEntries, ttSets, qrCodes, attLogs,
        parentLinks, teacherAssigns, students, staff, users,
        lessonNotes, schemes, subjects, terms, acadSessions, classes,
        events, tickets, docs, examCodes, admissionApps, admissionSettings, gradingConfigs, bankDetails, announcements] = await Promise.all([
        prisma.result.count({ where: { schoolId } }),
        prisma.attendanceRecord.count({ where: { schoolId } }),
        prisma.assignment.count({ where: { schoolId } }),
        prisma.submission.count({ where: { schoolId } }),
        prisma.lessonQuizResult.count({ where: { schoolId } }),
        prisma.examSession.count({ where: { schoolId } }),
        prisma.exam.count({ where: { schoolId } }),
        prisma.question.count({ where: { schoolId } }),
        prisma.topic.count({ where: { schoolId } }),
        prisma.payment.count({ where: { schoolId } }),
        prisma.fee.count({ where: { schoolId } }),
        prisma.feeStructure.count({ where: { schoolId } }),
        prisma.salaryRecord.count({ where: { schoolId } }),
        prisma.salaryStructure.count({ where: { schoolId } }),
        prisma.message.count({ where: { conversation: { schoolId } } }),
        prisma.conversation.count({ where: { schoolId } }),
        prisma.weeklyReport.count({ where: { schoolId } }),
        prisma.reportCard.count({ where: { schoolId } }),
        prisma.reportCardEntry.count({ where: { schoolId } }),
        prisma.timetableEntry.count({ where: { schoolId } }),
        prisma.timetableSet.count({ where: { schoolId } }),
        prisma.attendanceQRCode.count({ where: { schoolId } }),
        prisma.attendanceLog.count({ where: { schoolId } }),
        prisma.parentLink.count({ where: { schoolId } }),
        prisma.teacherAssignment.count({ where: { schoolId } }),
        prisma.student.count({ where: { schoolId } }),
        prisma.staff.count({ where: { schoolId } }),
        prisma.user.count({ where: { schoolId } }),
        prisma.lessonNote.count({ where: { schoolId } }),
        prisma.schemeOfWork.count({ where: { schoolId } }),
        prisma.subject.count({ where: { schoolId } }),
        prisma.term.count({ where: { session: { schoolId } } }),
        prisma.academicSession.count({ where: { schoolId } }),
        prisma.class.count({ where: { schoolId } }),
        prisma.event.count({ where: { schoolId } }),
        prisma.feedbackTicket.count({ where: { schoolId } }),
        prisma.document.count({ where: { schoolId } }),
        prisma.entranceExamCode.count({ where: { schoolId } }),
        prisma.admissionApplication.count({ where: { schoolId } }),
        prisma.admissionSettings.count({ where: { schoolId } }),
        prisma.gradingConfig.count({ where: { schoolId } }),
        prisma.bankDetails.count({ where: { schoolId } }),
        prisma.announcement.count({ where: { schoolId } }),
      ])

      return {
        "academic-records": { results, attendance, assignments, submissions },
        "assessment-content": { quizzes, sessions, exams, questions, topics },
        finance: { payments, fees, feeStructs, salaryRecs, salaryStructs },
        "communication-reports": { messages, convos, weeklyRpts, reportCards, reportCardEntries },
        schedule: { ttEntries, ttSets, qrCodes, attLogs },
        people: { parentLinks, teacherAssigns, students, staff, users },
        "academic-setup": { lessonNotes, schemes, subjects, terms, acadSessions, classes },
        misc: { events, tickets, docs, examCodes, admissionApps, admissionSettings, gradingConfigs, bankDetails, announcements },
      }
    },
  },
}
