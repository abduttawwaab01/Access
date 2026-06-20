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
    return NextResponse.json({
      stats: { students: students.length, staff: staff.length, classes: classes.length, exams: exams.length, pendingApplications: pendingApplications.length },
      settings,
      pendingApplications,
    })
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
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        gender: app.gender,
        classId: app.classApplyingFor,
        phone: app.phone,
        status: "active",
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
    default:
      return NextResponse.json({ success: false, error: "Unknown action" })
  }
}
