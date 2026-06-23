import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET() {
  return NextResponse.json(await db.salaryStructures.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, staffId, ...data } = body
  const mapped = {
    staffId: staffId || data.staffId,
    amount: data.amount ?? data.baseSalary,
  }
  if (action === "update" && staffId) {
    const item = await db.salaryStructures.update(staffId, mapped)
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 })
    return NextResponse.json(item)
  }
  const item = await db.salaryStructures.create(mapped)
  return NextResponse.json(item, { status: 201 })
}
