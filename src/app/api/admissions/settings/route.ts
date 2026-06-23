import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET() {
  return NextResponse.json(await db.admissionSettings.get())
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const settings = await db.admissionSettings.update(body)
  return NextResponse.json(settings)
}
