import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET() {
  const data = await db.school.get()
  if (!data) {
    return NextResponse.json({
      id: "1",
      name: "Access International School",
      shortName: "Access",
      email: "info@access.school",
      phone: "+1 234 567 8900",
      address: "123 Education Lane, Learning City",
      motto: "Excellence in Education",
      logo: null,
      aboutText: "",
      exportDefaultExamHeader: "",
      primaryColor: "#6366f1",
      secondaryColor: "#06b6d4",
      accentColor: "#f59e0b",
      studentIdCardConfig: { backTitle: "Student Information", showAddress: true, showBloodGroup: true, showEmergencyContact: true, showMedicalNotes: true, customFields: [] },
      staffIdCardConfig: { backTitle: "Staff Information", showDepartment: true, showEmergencyContact: true, customFields: [] },
    })
  }
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  await db.school.update(body)
  return NextResponse.json({ success: true })
}
