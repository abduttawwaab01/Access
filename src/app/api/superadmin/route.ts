import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action")
  if (action === "dashboard") {
    const [students, staff, classes, exams, settings, pendingApplications, announcements, feedback] = await Promise.all([
      db.students.getAll(),
      db.staff.getAll(),
      db.classes.getAll(),
      db.exams.getAll(),
      db.school.get(),
      db.admissionApplications.getByStatus("pending"),
      db.superAnnouncements.getAll(),
      db.feedbackTickets.getAll(),
    ])
    return NextResponse.json({
      stats: { students: students.length, staff: staff.length, classes: classes.length, exams: exams.length, pendingApplications: pendingApplications.length },
      settings, pendingApplications, announcements,
      feedbackTickets: feedback.filter((t: any) => t.status !== "resolved"),
      allFeedback: feedback,
    })
  }
  if (action === "announcements") {
    return NextResponse.json(await db.superAnnouncements.getActive())
  }
  if (action === "feedback") {
    return NextResponse.json(await db.feedbackTickets.getAll())
  }
  if (action === "getReviews") {
    const announcementId = request.nextUrl.searchParams.get("announcementId")
    if (announcementId) {
      return NextResponse.json(await db.announcementReviews.getByAnnouncement(announcementId))
    }
    return NextResponse.json(await db.announcementReviews.getAll())
  }
  if (action === "updateFeedback") {
    const body = await request.json()
    const { id, subject, message, priority } = body
    const ticket = await db.feedbackTickets.getById(id)
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }
    const updated = await db.feedbackTickets.update(id, { subject, message, priority }, ticket.from)
    return NextResponse.json({ success: true, data: { ticket: updated } })
  }
  if (action === "deleteFeedback") {
    const body = await request.json()
    const { id, from } = body
    const success = await db.feedbackTickets.delete(id, from)
    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to delete ticket or unauthorized" }, { status: 403 })
    }
    return NextResponse.json({ success: true, message: "Ticket deleted" })
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, token } = body

  if (action !== "login" && token !== "superadmin-authenticated") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  switch (action) {
    case "login": {
      const settings = await db.school.get()
      if (body.password === settings.superAdminPassword) {
        return NextResponse.json({ success: true, token: "superadmin-authenticated" })
      }
      return NextResponse.json({ success: false, error: "Invalid password" })
    }
    case "toggleLogin": {
      const settings = await db.school.get()
      const updated = await db.school.update({ loginEnabled: !settings.loginEnabled })
      return NextResponse.json({ success: true, data: { settings: updated }, message: `Login ${updated.loginEnabled ? "enabled" : "disabled"}` })
    }
    case "setExpiration": {
      if (!body.expirationDate) return NextResponse.json({ success: false, error: "Date required" })
      const updated = await db.school.update({ expirationDate: body.expirationDate })
      return NextResponse.json({ success: true, data: { settings: updated }, message: "Expiration date set" })
    }
    case "clearExpiration": {
      const updated = await db.school.update({ expirationDate: null })
      return NextResponse.json({ success: true, data: { settings: updated }, message: "Expiration cleared" })
    }
    case "changeAdminPassword": {
      if (!body.newPassword) return NextResponse.json({ success: false, error: "Password required" })
      await db.school.update({ superAdminPassword: body.newPassword })
      return NextResponse.json({ success: true, message: "Admin password updated" })
    }
    case "acceptApplication": {
      const app = await db.admissionApplications.getById(body.id)
      if (!app) return NextResponse.json({ success: false, error: "Application not found" })
      if (app.status === "accepted") return NextResponse.json({ success: false, error: "Already accepted" })

      const { prisma } = await import("@/lib/prisma")
      const bcrypt = (await import("bcryptjs")).default
      const schoolId = app.schoolId

      // Create User for student with default password
      const studentPassword = "student123"
      const hashedStudentPassword = await bcrypt.hash(studentPassword, 10)
      const studentEmail = app.email || `${app.firstName.toLowerCase()}.${app.lastName.toLowerCase()}@school.com`

      let user = await prisma.user.findFirst({ where: { email: studentEmail } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: `${app.firstName} ${app.lastName}`,
            email: studentEmail,
            password: hashedStudentPassword,
            role: "student",
            schoolId,
          },
        })
      }

      // Resolve class name to class ID
      let targetClassId = body.transferToClassId || ""
      if (!targetClassId && app.classApplyingFor) {
        const classList = await db.classes.getAll()
        const matched = classList.find((c: any) => c.name === app.classApplyingFor)
        if (matched) targetClassId = matched.id
      }
      const student = await db.students.create({
        firstName: app.firstName,
        lastName: app.lastName,
        email: studentEmail,
        gender: app.gender || null,
        classId: targetClassId,
        phone: app.phone || null,
        status: "active",
        userId: user.id,
      })

      // Create Parent account if parent info provided
      if (app.parentName || app.parentPhone) {
        const parentEmail = app.email ? `parent.${app.email}` : `${app.firstName.toLowerCase()}.parent@school.com`
        let parentUser = await prisma.user.findFirst({ where: { email: parentEmail } })
        if (!parentUser) {
          const hashedParent = await bcrypt.hash("parent123", 10)
          parentUser = await prisma.user.create({
            data: {
              name: app.parentName || `${app.firstName}'s Parent`,
              email: parentEmail,
              phone: app.parentPhone || null,
              password: hashedParent,
              role: "parent",
              schoolId,
            },
          })
        }
        await db.parentLinks.create({ parentId: parentUser.id, studentId: student.id }).catch(() => {})
      }

      // Update application
      await db.admissionApplications.update(body.id, {
        status: "accepted",
        entranceExamPassed: true,
        userId: user.id,
      })

      const pendingApplications = await db.admissionApplications.getByStatus("pending")
      return NextResponse.json({
        success: true,
        data: { pendingApplications },
        message: `Application accepted. Student credentials: ${studentEmail} / ${studentPassword}`,
        credentials: { email: studentEmail, password: studentPassword },
      })
    }
    case "rejectApplication": {
      const app = await db.admissionApplications.getById(body.id)
      if (!app) return NextResponse.json({ success: false, error: "Application not found" })
      await db.admissionApplications.update(body.id, { status: "rejected" })
      const pendingApplications = await db.admissionApplications.getByStatus("pending")
      return NextResponse.json({ success: true, data: { pendingApplications }, message: "Application rejected" })
    }
    case "transferApplication": {
      const app = await db.admissionApplications.getById(body.id)
      if (!app) return NextResponse.json({ success: false, error: "Application not found" })
      const targetClass = await db.classes.getById(body.transferToClassId)
      if (!targetClass) return NextResponse.json({ success: false, error: "Target class not found" })
      await db.admissionApplications.update(body.id, { status: "transferred", classApplyingFor: targetClass.name })
      const pendingApplications = await db.admissionApplications.getByStatus("pending")
      return NextResponse.json({ success: true, data: { pendingApplications }, message: `Application deferred to ${targetClass.name}` })
    }
    // Announcements
    case "createAnnouncement": {
      await db.superAnnouncements.create({
        title: body.title, content: body.content, audience: body.targetAudience || "all", priority: body.priority || "normal",
        displayType: body.displayType || "banner",
        endDate: body.endDate || null,
        buttonLabel: body.buttonLabel || null,
        buttonUrl: body.buttonUrl || null,
        mediaUrl: body.mediaUrl || null,
        mediaType: body.mediaType || "image",
        reviewEnabled: body.reviewEnabled || false,
      })
      return NextResponse.json({ success: true, message: "Announcement created", data: { announcements: await db.superAnnouncements.getAll() } })
    }
    case "toggleAnnouncement": {
      const ann = await db.superAnnouncements.getById(body.id)
      if (!ann) return NextResponse.json({ success: false, error: "Not found" })
      if (body.title) {
        await db.superAnnouncements.update(body.id, {
          title: body.title, content: body.content, displayType: body.displayType, endDate: body.endDate,
          buttonLabel: body.buttonLabel || null,
          buttonUrl: body.buttonUrl || null,
          mediaUrl: body.mediaUrl || null,
          mediaType: body.mediaType || "image",
          reviewEnabled: body.reviewEnabled || false,
        })
      } else {
        await db.superAnnouncements.update(body.id, { active: !ann.active })
      }
      return NextResponse.json({ success: true, message: body.title ? "Updated" : "Toggled", data: { announcements: await db.superAnnouncements.getAll() } })
    }
    case "submitReview": {
      if (!body.announcementId || !body.content) return NextResponse.json({ success: false, error: "Announcement ID and content required" })
      const ann = await db.superAnnouncements.getById(body.announcementId)
      if (!ann || !ann.reviewEnabled) return NextResponse.json({ success: false, error: "Reviews not enabled for this announcement" })
      const review = await db.announcementReviews.create({
        announcementId: body.announcementId,
        userId: body.userId || null,
        userName: body.userName || null,
        content: body.content,
        rating: body.rating ? parseInt(body.rating) : undefined,
      })
      return NextResponse.json({ success: true, data: { review } })
    }
    case "deleteReview": {
      if (!body.id) return NextResponse.json({ success: false, error: "Review ID required" })
      await db.announcementReviews.delete(body.id)
      return NextResponse.json({ success: true, message: "Review deleted" })
    }
    case "deleteAnnouncement": {
      await db.superAnnouncements.delete(body.id)
      return NextResponse.json({ success: true, message: "Deleted", data: { announcements: await db.superAnnouncements.getAll() } })
    }
    // Feedback
    case "resolveFeedback": {
      if (!body.resolution) return NextResponse.json({ success: false, error: "Resolution required" })
      await db.feedbackTickets.resolve(body.id, body.resolution)
      const allTickets = await db.feedbackTickets.getAll()
      return NextResponse.json({ success: true, message: "Ticket resolved", data: { feedbackTickets: allTickets.filter((t: any) => t.status !== "resolved") } })
    }
    // Renewal
    case "renewSchool": {
      if (!body.newExpirationDate) return NextResponse.json({ success: false, error: "Date required" })
      const updated = await db.school.update({ expirationDate: body.newExpirationDate, loginEnabled: true })
      return NextResponse.json({ success: true, message: "School renewed", data: { settings: updated } })
    }
    default:
      return NextResponse.json({ success: false, error: "Unknown action" })
  }
}
