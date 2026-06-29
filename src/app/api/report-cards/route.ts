import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  if (studentId) return NextResponse.json(await db.reportCards.getByStudent(studentId))
  return NextResponse.json(await db.reportCards.getAll())
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  const item = await db.reportCards.create(body)
  return NextResponse.json(item, { status: 201 })
}
