import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const setId = searchParams.get("setId") || undefined
  const day = searchParams.get("day") || undefined
  const classId = searchParams.get("classId") || undefined
  const filters: { setId?: string; day?: string; classId?: string } = {}
  if (setId) filters.setId = setId
  if (day) filters.day = day
  if (classId) filters.classId = classId
  return NextResponse.json(await db.timetable.getAll(filters))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.timetable.create(body)
  return NextResponse.json(item, { status: 201 })
}
