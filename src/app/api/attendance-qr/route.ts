import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || undefined
  if (type) return NextResponse.json(await db.attendanceQRCodes.getByType(type))
  return NextResponse.json(await db.attendanceQRCodes.getAll())
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  if (!body.type || !body.data) {
    return NextResponse.json({ error: "type and data are required" }, { status: 400 })
  }
  const item = await db.attendanceQRCodes.create(body)
  return NextResponse.json(item, { status: 201 })
}
