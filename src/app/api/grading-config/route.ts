import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const config = await db.gradingConfig.get()
  return NextResponse.json(config)
}

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  const config = await db.gradingConfig.update(body)
  return NextResponse.json(config)
}
