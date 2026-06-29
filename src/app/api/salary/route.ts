import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

const VALID_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const staffId = searchParams.get("staffId") || undefined
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  try {
    if (month && year) return NextResponse.json(await db.salaryRecords.getByMonth(month, year))
    return NextResponse.json(await db.salaryRecords.getAll(staffId))
  } catch (err: any) {
    console.error("GET /api/salary error:", err?.message || err)
    return NextResponse.json({ error: "Failed to fetch salary records" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  try {
    const body = await request.json()
    const { action, id, paidAt, confirmedBy } = body

    if (action === "markPaid" && id) {
      if (user.role !== "admin") {
        return NextResponse.json({ error: "Only admins can mark salary as paid" }, { status: 403 })
      }
      const item = await db.salaryRecords.markPaid(id, paidAt || new Date().toISOString(), confirmedBy || user.id)
      if (!item) return NextResponse.json({ error: "Salary record not found" }, { status: 404 })
      return NextResponse.json(item)
    }

    const { staffId, amount, month, year } = body
    if (!staffId || !amount || !month || !year) {
      return NextResponse.json({ error: "staffId, amount, month, and year are required" }, { status: 400 })
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }
    if (!VALID_MONTHS.includes(month)) {
      return NextResponse.json({ error: "Invalid month" }, { status: 400 })
    }
    if (!/^\d{4}$/.test(year)) {
      return NextResponse.json({ error: "Invalid year format" }, { status: 400 })
    }
    const item = await db.salaryRecords.create({ staffId, amount, month, year })
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/salary error:", err?.message || err)
    const msg = err?.message?.includes("already exists") ? err.message : "Failed to create salary record"
    return NextResponse.json({ error: msg }, { status: err?.message?.includes("already exists") ? 409 : 500 })
  }
}
