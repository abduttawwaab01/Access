import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  return NextResponse.json(await db.admissionApplications.getAll())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const app = await db.admissionApplications.create(body)
  return NextResponse.json(app, { status: 201 })
}
