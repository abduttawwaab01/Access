import { prisma } from "./prisma"
import { store } from "./api-store"

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
      const { classId, ...rest } = data
      return prisma.student.create({
        data: {
          ...rest,
          studentId,
          classId: classId || "",
          status: data.status || "active",
        },
      })
    },
    update: async (id: string, data: any) => {
      const { studentId, createdAt, ...rest } = data
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
      if (!school) return null
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

      const settingsFields = ["studentIdCardConfig", "staffIdCardConfig", "schoolQRCode", "loginEnabled", "expirationDate"]
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

      return db.get()
    },
  },

  announcements: {
    getAll: async () => {
      return prisma.announcement.findMany({ orderBy: { createdAt: "desc" } })
    },
    getById: async (id: string) => {
      return prisma.announcement.findUnique({ where: { id } })
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
}
