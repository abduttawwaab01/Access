import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  if (studentId) return NextResponse.json(store.reportCards.getByStudent(studentId))
  return NextResponse.json(store.reportCards.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.reportCards.create(body)
  return NextResponse.json(item, { status: 201 })
}
