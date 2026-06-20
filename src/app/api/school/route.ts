import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET() {
  const saSettings = store.schoolSettings.get()
  return NextResponse.json({
    id: "1",
    name: saSettings.schoolName || "Access International School",
    shortName: "Access",
    email: saSettings.schoolEmail || "info@access.school",
    phone: saSettings.schoolPhone || "+1 234 567 8900",
    address: saSettings.schoolAddress || "123 Education Lane, Learning City",
    motto: saSettings.schoolMotto || "Excellence in Education",
    logo: saSettings.schoolLogo || null,
    aboutText: saSettings.aboutText || "",
    exportDefaultExamHeader: saSettings.exportDefaultExamHeader || "",
    primaryColor: "#6366f1",
    secondaryColor: "#06b6d4",
    accentColor: "#f59e0b",
    loginEnabled: saSettings.loginEnabled,
    expirationDate: saSettings.expirationDate,
  })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const current = store.schoolSettings.get()
  store.schoolSettings.update({
    schoolName: body.name ?? current.schoolName,
    schoolEmail: body.email ?? current.schoolEmail,
    schoolPhone: body.phone ?? current.schoolPhone,
    schoolAddress: body.address ?? current.schoolAddress,
    schoolMotto: body.motto ?? current.schoolMotto,
    schoolLogo: body.logo !== undefined ? body.logo : current.schoolLogo,
    aboutText: body.aboutText ?? current.aboutText,
    exportDefaultExamHeader: body.exportDefaultExamHeader ?? current.exportDefaultExamHeader,
  })
  return NextResponse.json({ success: true })
}
