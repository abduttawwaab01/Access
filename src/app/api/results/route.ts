import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const term = searchParams.get("term") || undefined
  if (studentId) {
    if (term) return NextResponse.json(store.results.getByStudentAndTerm(studentId, term))
    return NextResponse.json(store.results.getByStudent(studentId))
  }
  return NextResponse.json(store.results.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.results.create(body)
  return NextResponse.json(item, { status: 201 })
}
