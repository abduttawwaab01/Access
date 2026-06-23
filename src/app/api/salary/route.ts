import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const staffId = searchParams.get("staffId") || undefined
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  if (month && year) return NextResponse.json(await db.salaryRecords.getByMonth(month, year))
  return NextResponse.json(await db.salaryRecords.getAll(staffId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, id, paidAt, confirmedBy } = body
  if (action === "markPaid" && id) {
    const item = await db.salaryRecords.markPaid(id, paidAt || new Date().toISOString(), confirmedBy || "admin")
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 })
    return NextResponse.json(item)
  }
  const { staffId, amount, month, year } = body
  const item = await db.salaryRecords.create({ staffId, amount, month, year })
  return NextResponse.json(item, { status: 201 })
}
