import { NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId") || undefined
  const studentIds = searchParams.get("studentIds") || undefined
  const pending = searchParams.get("pending")
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")

  const ids = studentIds ? studentIds.split(",").filter(Boolean) : studentId ? [studentId] : undefined

  if (pageRaw) {
    const page = parseInt(pageRaw, 10)
    const pageSize = parseInt(pageSizeRaw || "50", 10)

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
