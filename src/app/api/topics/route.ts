import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId") || undefined
  return NextResponse.json(await db.topics.getAll(subjectId))
}
