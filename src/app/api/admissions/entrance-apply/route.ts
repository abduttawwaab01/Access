import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entranceCodeId, firstName, lastName, email, phone, gender, dateOfBirth, address, classApplyingFor, parentName, parentPhone, previousSchool } = body

    if (!entranceCodeId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const entranceCode = await db.entranceExamCodes.getById(entranceCodeId)
    if (!entranceCode) {
      return NextResponse.json({ error: "Invalid entrance code" }, { status: 404 })
    }

    if (entranceCode.currentUses >= entranceCode.maxUses) {
      return NextResponse.json({ error: "Code usage limit reached" }, { status: 400 })
    }

    if (entranceCode.expiresAt && new Date(entranceCode.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Code has expired" }, { status: 400 })
    }

    const exam = await db.exams.getById(entranceCode.examId)
    if (!exam || exam.status !== "published") {
      return NextResponse.json({ error: "Exam not available" }, { status: 400 })
    }

    // Create the exam session first
    const session = await db.examSessions.create({
      examId: entranceCode.examId,
      examType: "entrance",
      studentName: `${firstName} ${lastName}`,
    })

    // Create the admission application with the exam session ID
    const application = await db.admissionApplications.create({
      firstName,
      lastName,
      email,
      phone: phone || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      classApplyingFor: classApplyingFor || entranceCode.classId,
      parentName: parentName || null,
      parentPhone: parentPhone || null,
      previousSchool: previousSchool || null,
      entranceCodeId,
      examSessionId: session.id,
    })

    // Increment the code usage
    await db.entranceExamCodes.update(entranceCode.id, {
      currentUses: entranceCode.currentUses + 1,
    })

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      examSessionId: session.id,
      redirectUrl: `/exam-take/${session.id}`,
    })
  } catch (error) {
    console.error("Error in entrance application:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
