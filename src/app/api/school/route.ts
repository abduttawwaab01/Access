import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

let schoolSettings = {
  id: "1",
  name: "Access International School",
  shortName: "Access",
  email: "info@access.school",
  phone: "+1 234 567 8900",
  address: "123 Education Lane, Learning City",
  primaryColor: "#6366f1",
  secondaryColor: "#06b6d4",
  accentColor: "#f59e0b",
  logo: null,
}

export async function GET() {
  const saSettings = store.schoolSettings.get()
  return NextResponse.json({ ...schoolSettings, ...saSettings })
}

export async function PUT(request: Request) {
  const body = await request.json()
  schoolSettings = { ...schoolSettings, ...body }
  return NextResponse.json(schoolSettings)
}
