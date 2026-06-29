import { NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId") || undefined
  const studentIds = searchParams.get("studentIds") || undefined
  const pending = searchParams.get("pending")
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")

  const ids = studentIds ? studentIds.split(",").filter(Boolean) : studentId ? [studentId] : undefined

  try {
    if (pageRaw) {
      const page = Math.max(1, parseInt(pageRaw, 10) || 1)
      const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeRaw || "50", 10)))

      if (pending === "true") {
        const result = await paginatedQuery(
          prisma.payment,
          { where: { status: "pending" }, orderBy: { createdAt: "desc" } },
          { page, pageSize }
        )
        return NextResponse.json(result, cacheHeader())
      }

      const where: any = {}
      if (ids) where.studentId = { in: ids }
      const result = await paginatedQuery(
        prisma.payment,
        { where, orderBy: { createdAt: "desc" } },
        { page, pageSize }
      )
      return NextResponse.json(result, cacheHeader())
    }

    if (pending === "true") return NextResponse.json(await db.payments.getPending(), cacheHeader())
    if (ids) {
      const all = await Promise.all(ids.map((id: string) => db.payments.getAll(id)))
      return NextResponse.json(all.flat())
    }
    return NextResponse.json(await db.payments.getAll(), cacheHeader())
  } catch (err: any) {
    console.error("GET /api/payments error:", err?.message || err)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  try {
    const body = await request.json()
    const { action, id, confirmedBy } = body

    if ((action === "confirm" || action === "reject") && id) {
      if (user.role !== "admin") {
        return NextResponse.json({ error: "Only admins can confirm/reject payments" }, { status: 403 })
      }
      const item = action === "confirm"
        ? await db.payments.confirm(id, confirmedBy || user.id)
        : await db.payments.reject(id, confirmedBy || user.id)
      if (!item) return NextResponse.json({ error: "Payment not found" }, { status: 404 })
      return NextResponse.json(item)
    }

    if (!body.studentId || !body.amount) {
      return NextResponse.json({ error: "studentId and amount are required" }, { status: 400 })
    }
    if (typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }
    const item = await db.payments.create(body)
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/payments error:", err?.message || err)
    return NextResponse.json({ error: err?.message || "Failed to create payment" }, { status: 500 })
  }
}
