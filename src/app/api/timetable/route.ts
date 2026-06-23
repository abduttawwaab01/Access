import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const day = searchParams.get("day") || undefined
  if (day) return NextResponse.json(await db.timetable.getByDay(day))
  return NextResponse.json(await db.timetable.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.timetable.create(body)
  return NextResponse.json(item, { status: 201 })
}
