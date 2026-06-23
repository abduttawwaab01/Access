import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const summary = searchParams.get("summary") === "true"
  if (!studentId) return NextResponse.json(await db.attendance.getAll())
  if (summary) return NextResponse.json(await db.attendance.getSummary(studentId))
  return NextResponse.json(await db.attendance.getByStudent(studentId))
}
