import { NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const summary = searchParams.get("summary") === "true"
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")

  if (pageRaw) {
    const page = parseInt(pageRaw, 10)
    const pageSize = parseInt(pageSizeRaw || "50", 10)
    if (!studentId) {
      const result = await paginatedQuery(prisma.fee, { orderBy: { createdAt: "desc" } }, { page, pageSize })
      return NextResponse.json(result, cacheHeader())
    }
    const result = await paginatedQuery(
      prisma.fee,
      { where: { studentId }, orderBy: { createdAt: "desc" } },
      { page, pageSize }
    )
    return NextResponse.json(result, cacheHeader())
  }

  if (!studentId) return NextResponse.json(await db.fees.getAll(), cacheHeader())
  if (summary) return NextResponse.json(await db.fees.getSummary(studentId), cacheHeader())
  return NextResponse.json(await db.fees.getByStudent(studentId), cacheHeader())
}
