import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  return NextResponse.json(await db.admissionSettings.get())
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  const settings = await db.admissionSettings.update(body)
  return NextResponse.json(settings)
}
