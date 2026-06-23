import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId") || undefined
  const pending = searchParams.get("pending")
  if (pending === "true") return NextResponse.json(await db.payments.getPending())
  return NextResponse.json(await db.payments.getAll(studentId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, id, confirmedBy } = body
  if (action === "confirm" && id) {
    const item = await db.payments.confirm(id, confirmedBy || "admin")
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 })
    return NextResponse.json(item)
  }
  if (action === "reject" && id) {
    const item = await db.payments.reject(id, confirmedBy || "admin")
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 })
    return NextResponse.json(item)
  }
  const item = await db.payments.create(body)
  return NextResponse.json(item, { status: 201 })
}
