import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  return NextResponse.json(await db.levels.getSchoolLevels())
}
