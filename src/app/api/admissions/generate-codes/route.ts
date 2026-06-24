import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

function generateEntranceCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "ENT-"
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-"
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const { examId, classId, count, maxUses, expiresAt } = await request.json()

    if (!examId || !classId) {
      return NextResponse.json({ error: "examId and classId are required" }, { status: 400 })
    }

    const numCodes = Math.min(Math.max(count || 1, 1), 100)
    const usesPerCode = maxUses || 1

    const codes: string[] = []
    const created: any[] = []

    for (let i = 0; i < numCodes; i++) {
      let code = generateEntranceCode()
      // Ensure uniqueness
      let existing = await db.entranceExamCodes.getByCode(code)
      while (existing) {
        code = generateEntranceCode()
        existing = await db.entranceExamCodes.getByCode(code)
      }

      const item = await db.entranceExamCodes.create({
        code,
        examId,
        classId,
        maxUses: usesPerCode,
        expiresAt: expiresAt || null,
      })
      codes.push(code)
      created.push(item)
    }

    return NextResponse.json({
      success: true,
      codes,
      count: codes.length,
      data: created,
    })
  } catch (error) {
    console.error("Error generating entrance codes:", error)
    return NextResponse.json({ error: "Failed to generate codes" }, { status: 500 })
  }
}
