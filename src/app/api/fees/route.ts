import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const summary = searchParams.get("summary") === "true"
  if (!studentId) return NextResponse.json(store.fees.getAll())
  if (summary) return NextResponse.json(store.fees.getSummary(studentId))
  return NextResponse.json(store.fees.getByStudent(studentId))
}
