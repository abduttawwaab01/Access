import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || undefined
  if (type) return NextResponse.json(await db.attendanceQRCodes.getByType(type))
  return NextResponse.json(await db.attendanceQRCodes.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.attendanceQRCodes.create(body)
  return NextResponse.json(item, { status: 201 })
}
