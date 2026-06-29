import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const setId = searchParams.get("setId") || undefined
  const day = searchParams.get("day") || undefined
  const classId = searchParams.get("classId") || undefined
  const teacherId = searchParams.get("teacherId") || undefined
  const filters: { setId?: string; day?: string; classId?: string; teacherId?: string } = {}
  if (setId) filters.setId = setId
  if (day) filters.day = day
  if (classId) filters.classId = classId
  if (teacherId) filters.teacherId = teacherId
  return NextResponse.json(await db.timetable.getAll(filters))
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can create timetable entries" }, { status: 403 })
  }
  try {
    const body = await request.json()
    const item = await db.timetable.create(body)
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/timetable error:", err?.message || err, err?.stack || "")
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}
