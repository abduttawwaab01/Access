import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const data = await db.students.getAll(classId)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.students.create(body)
  return NextResponse.json(item, { status: 201 })
}
