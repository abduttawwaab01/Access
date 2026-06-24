import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    if (!code) {
      return NextResponse.json({ valid: false, error: "Code is required" }, { status: 400 })
    }

    const entranceCode = await db.entranceExamCodes.getByCode(code.toUpperCase())
    if (!entranceCode) {
      return NextResponse.json({ valid: false, error: "Invalid entrance exam code" }, { status: 404 })
    }

    if (entranceCode.currentUses >= entranceCode.maxUses) {
      return NextResponse.json({ valid: false, error: "This code has reached its maximum usage limit" }, { status: 400 })
    }

    if (entranceCode.expiresAt && new Date(entranceCode.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "This code has expired" }, { status: 400 })
    }

    const exam = await db.exams.getById(entranceCode.examId)
    if (!exam || exam.status !== "published") {
      return NextResponse.json({ valid: false, error: "The associated exam is not available" }, { status: 400 })
    }

    const classInfo = await db.classes.getById(entranceCode.classId)
    if (!classInfo) {
      return NextResponse.json({ valid: false, error: "Associated class not found" }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      codeId: entranceCode.id,
      examId: entranceCode.examId,
      examTitle: exam.title,
      classId: entranceCode.classId,
      className: classInfo.name,
      duration: exam.duration,
      questionCount: ((exam.questions as any[]) || []).length,
    })
  } catch (error) {
    console.error("Error verifying entrance code:", error)
    return NextResponse.json({ valid: false, error: "Failed to verify code" }, { status: 500 })
  }
}
