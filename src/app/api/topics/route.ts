import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId") || undefined
  return NextResponse.json(await db.topics.getAll(subjectId))
}
