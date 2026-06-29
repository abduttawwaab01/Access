import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  try {
    return NextResponse.json(await db.salaryStructures.getAll())
  } catch (err: any) {
    console.error("GET /api/salary-structures error:", err?.message || err)
    return NextResponse.json({ error: "Failed to fetch salary structures" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  try {
    const body = await request.json()
    const { action, staffId, ...data } = body
    const mapped = {
      staffId: staffId || data.staffId,
      amount: data.amount ?? data.baseSalary,
    }
    if (!mapped.staffId) {
      return NextResponse.json({ error: "staffId is required" }, { status: 400 })
    }
    if (typeof mapped.amount !== "number" || mapped.amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }
    if (action === "update" && staffId) {
      const item = await db.salaryStructures.update(staffId, mapped)
      if (!item) return NextResponse.json({ error: "Salary structure not found" }, { status: 404 })
      return NextResponse.json(item)
    }
    const item = await db.salaryStructures.create(mapped)
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/salary-structures error:", err?.message || err)
    return NextResponse.json({ error: err?.message || "Failed to create salary structure" }, { status: 500 })
  }
}
