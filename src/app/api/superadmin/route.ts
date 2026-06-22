import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action")
  if (action === "dashboard") {
    const students = store.students.getAll()
    const staff = store.staff.getAll()
    const classes = store.classes.getAll()
    const exams = store.exams.getAll()
    const settings = store.schoolSettings.get()
    const pendingApplications = store.admissionApplications.getByStatus("pending")
    const announcements = store.superAnnouncements.getAll()
    const feedback = store.feedbackTickets.getAll()
    return NextResponse.json({
      stats: { students: students.length, staff: staff.length, classes: classes.length, exams: exams.length, pendingApplications: pendingApplications.length },
      settings, pendingApplications, announcements,
      feedbackTickets: feedback.filter((t: any) => t.status !== "resolved"),
      allFeedback: feedback,
    })
  }
  if (action === "announcements") {
    return NextResponse.json(store.superAnnouncements.getActive())
  }
  if (action === "feedback") {
    return NextResponse.json(store.feedbackTickets.getAll())
  }
  if (action === "updateFeedback") {
    const body = await request.json()
    const { id, subject, message, priority } = body
    const ticket = store.feedbackTickets.getById(id)
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }
    const updated = store.feedbackTickets.update(id, { subject, message, priority }, ticket.from)
    return NextResponse.json({ success: true, data: { ticket: updated } })
  }
  if (action === "deleteFeedback") {
    const body = await request.json()
    const { id, from } = body
    const success = store.feedbackTickets.delete(id, from)
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
      const settings = store.schoolSettings.get()
      if (body.password === settings.superAdminPassword) {
        return NextResponse.json({ success: true, token: "superadmin-authenticated" })
      }
      return NextResponse.json({ success: false, error: "Invalid password" })
    }
    case "toggleLogin": {
      const settings = store.schoolSettings.get()
      const updated = store.schoolSettings.update({ loginEnabled: !settings.loginEnabled })
      return NextResponse.json({ success: true, data: { settings: updated }, message: `Login ${updated.loginEnabled ? "enabled" : "disabled"}` })
    }
    case "setExpiration": {
      if (!body.expirationDate) return NextResponse.json({ success: false, error: "Date required" })
      const updated = store.schoolSettings.update({ expirationDate: body.expirationDate })
      return NextResponse.json({ success: true, data: { settings: updated }, message: "Expiration date set" })
    }
    case "clearExpiration": {
      const updated = store.schoolSettings.update({ expirationDate: null })
      return NextResponse.json({ success: true, data: { settings: updated }, message: "Expiration cleared" })
    }
    case "changeAdminPassword": {
      if (!body.newPassword) return NextResponse.json({ success: false, error: "Password required" })
      store.schoolSettings.update({ superAdminPassword: body.newPassword })
      return NextResponse.json({ success: true, message: "Admin password updated" })
    }
    case "acceptApplication": {
      const app = store.admissionApplications.getById(body.id)
      if (!app) return NextResponse.json({ success: false, error: "Application not found" })
      store.admissionApplications.update(body.id, { status: "accepted", entranceExamPassed: true, entranceExamScore: body.score || null })
      store.students.create({
        firstName: app.firstName, lastName: app.lastName, email: app.email, gender: app.gender, classId: app.classApplyingFor, phone: app.phone, status: "active",
      })
      const pendingApplications = store.admissionApplications.getByStatus("pending")
      return NextResponse.json({ success: true, data: { pendingApplications }, message: "Application accepted" })
    }
    case "rejectApplication": {
      const app = store.admissionApplications.getById(body.id)
      if (!app) return NextResponse.json({ success: false, error: "Application not found" })
      store.admissionApplications.update(body.id, { status: "rejected" })
      const pendingApplications = store.admissionApplications.getByStatus("pending")
      return NextResponse.json({ success: true, data: { pendingApplications }, message: "Application rejected" })
    }
    // Announcements
    case "createAnnouncement": {
      store.superAnnouncements.create({
        title: body.title, content: body.content, type: body.type || "text", displayType: body.displayType || "banner",
        targetAudience: body.targetAudience || "all", priority: body.priority || "normal",
        startDate: body.startDate || null, endDate: body.endDate || null,
      })
      return NextResponse.json({ success: true, message: "Announcement created", data: { announcements: store.superAnnouncements.getAll() } })
    }
    case "toggleAnnouncement": {
      const ann = store.superAnnouncements.getById(body.id)
      if (!ann) return NextResponse.json({ success: false, error: "Not found" })
      if (body.title) {
        store.superAnnouncements.update(body.id, { title: body.title, content: body.content, displayType: body.displayType, targetAudience: body.targetAudience, priority: body.priority, startDate: body.startDate, endDate: body.endDate })
      } else {
        store.superAnnouncements.update(body.id, { active: !ann.active })
      }
      return NextResponse.json({ success: true, message: body.title ? "Updated" : "Toggled", data: { announcements: store.superAnnouncements.getAll() } })
    }
    case "deleteAnnouncement": {
      store.superAnnouncements.delete(body.id)
      return NextResponse.json({ success: true, message: "Deleted", data: { announcements: store.superAnnouncements.getAll() } })
    }
    // Feedback
    case "resolveFeedback": {
      if (!body.resolution) return NextResponse.json({ success: false, error: "Resolution required" })
      store.feedbackTickets.resolve(body.id, body.resolution)
      return NextResponse.json({ success: true, message: "Ticket resolved", data: { feedbackTickets: store.feedbackTickets.getAll().filter((t: any) => t.status !== "resolved") } })
    }
    // Renewal
    case "renewSchool": {
      if (!body.newExpirationDate) return NextResponse.json({ success: false, error: "Date required" })
      const updated = store.schoolSettings.update({ expirationDate: body.newExpirationDate, loginEnabled: true })
      return NextResponse.json({ success: true, message: "School renewed", data: { settings: updated } })
    }
    default:
      return NextResponse.json({ success: false, error: "Unknown action" })
  }
}
