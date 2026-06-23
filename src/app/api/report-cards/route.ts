import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  if (studentId) return NextResponse.json(await db.reportCards.getByStudent(studentId))
  return NextResponse.json(await db.reportCards.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.reportCards.create(body)
  return NextResponse.json(item, { status: 201 })
}
