import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || undefined
  const date = searchParams.get("date") || undefined
  if (userId) return NextResponse.json(store.attendanceLogs.getByUser(userId))
  if (date) return NextResponse.json(store.attendanceLogs.getAll(date))
  return NextResponse.json(store.attendanceLogs.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.attendanceLogs.create(body)
  return NextResponse.json(item, { status: 201 })
}
