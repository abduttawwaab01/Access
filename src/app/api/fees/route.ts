import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const summary = searchParams.get("summary") === "true"
  if (!studentId) return NextResponse.json(await db.fees.getAll())
  if (summary) return NextResponse.json(await db.fees.getSummary(studentId))
  return NextResponse.json(await db.fees.getByStudent(studentId))
}
