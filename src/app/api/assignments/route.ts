import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  return NextResponse.json(store.assignments.getAll(classId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.assignments.create(body)
  return NextResponse.json(item, { status: 201 })
}
