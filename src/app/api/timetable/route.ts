import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const day = searchParams.get("day") || undefined
  if (day) return NextResponse.json(store.timetable.getByDay(day))
  return NextResponse.json(store.timetable.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.timetable.create(body)
  return NextResponse.json(item, { status: 201 })
}
