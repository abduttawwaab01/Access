import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || undefined
  const date = searchParams.get("date") || undefined
  if (userId) return NextResponse.json(await db.attendanceLogs.getByUser(userId))
  if (date) return NextResponse.json(await db.attendanceLogs.getAll())
  return NextResponse.json(await db.attendanceLogs.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.attendanceLogs.create(body)
  return NextResponse.json(item, { status: 201 })
}
