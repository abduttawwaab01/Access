import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const classId = searchParams.get("classId")
  const week = searchParams.get("week") ? Number(searchParams.get("week")) : undefined
  const term = searchParams.get("term")
  const session = searchParams.get("session")
  const createdBy = searchParams.get("createdBy")
  const status = searchParams.get("status")

  const filters: any = {}
  if (studentId) filters.studentId = studentId
  if (classId) filters.classId = classId
  if (week !== undefined) filters.week = week
  if (term) filters.term = term
  if (session) filters.session = session
  if (createdBy) filters.createdBy = createdBy
  if (status) filters.status = status

  const data = await db.weeklyReports.getAll(Object.keys(filters).length ? filters : undefined)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.weeklyReports.create(body)
  return NextResponse.json(item, { status: 201 })
}
