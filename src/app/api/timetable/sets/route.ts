import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || undefined
  const classId = searchParams.get("classId") || undefined
  const filters: { type?: string; classId?: string } = {}
  if (type) filters.type = type
  if (classId) filters.classId = classId
  return NextResponse.json(await db.timetableSets.getAll(filters))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const item = await db.timetableSets.create(body)
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/timetable/sets error:", err?.message || err, err?.stack || "")
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}
