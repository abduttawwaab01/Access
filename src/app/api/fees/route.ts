import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 })
  const summary = searchParams.get("summary") === "true"
  if (summary) return NextResponse.json(store.fees.getSummary(studentId))
  return NextResponse.json(store.fees.getByStudent(studentId))
}
