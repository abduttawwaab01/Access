import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const staffId = searchParams.get("staffId") || undefined
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  if (month && year) return NextResponse.json(store.salaryRecords.getByMonth(month, year))
  return NextResponse.json(store.salaryRecords.getAll(staffId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, id, paidAt, confirmedBy } = body
  if (action === "markPaid" && id) {
    const item = store.salaryRecords.markPaid(id, paidAt || new Date().toISOString(), confirmedBy || "admin")
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 })
    return NextResponse.json(item)
  }
  const item = store.salaryRecords.create(body)
  return NextResponse.json(item, { status: 201 })
}
