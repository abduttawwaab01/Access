import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || undefined
  const classId = searchParams.get("classId") || undefined
  const filters: { type?: string; classId?: string } = {}
  if (type) filters.type = type
  if (classId) filters.classId = classId
  return NextResponse.json(store.timetableSets.getAll(filters))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.timetableSets.create(body)
  return NextResponse.json(item, { status: 201 })
}
