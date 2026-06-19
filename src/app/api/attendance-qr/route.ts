import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || undefined
  if (type) return NextResponse.json(store.attendanceQRCodes.getByType(type))
  return NextResponse.json(store.attendanceQRCodes.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.attendanceQRCodes.create(body)
  return NextResponse.json(item, { status: 201 })
}
