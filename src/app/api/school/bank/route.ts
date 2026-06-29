import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  return NextResponse.json(await db.bankDetails.get())
}

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  const updated = await db.bankDetails.update(body)
  return NextResponse.json(updated)
}
