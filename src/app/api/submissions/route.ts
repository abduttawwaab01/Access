import { NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const assignmentId = searchParams.get("assignmentId") || undefined
  const studentId = searchParams.get("studentId") || undefined
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")

  if (pageRaw) {
    const page = parseInt(pageRaw, 10)
    const pageSize = parseInt(pageSizeRaw || "50", 10)
    const where: any = {}
    if (assignmentId) where.assignmentId = assignmentId
    if (studentId) where.studentId = studentId

    const result = await paginatedQuery(
      prisma.submission,
      { where, orderBy: { createdAt: "desc" } },
      { page, pageSize }
    )
    return NextResponse.json(result, cacheHeader())
  }

  return NextResponse.json(await db.submissions.getAll(), cacheHeader())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.submissions.create(body)
  return NextResponse.json(item, { status: 201 })
}
