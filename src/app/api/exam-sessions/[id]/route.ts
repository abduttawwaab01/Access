import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const item = await db.examSessions.getById(id)
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching exam session:", error)
    return NextResponse.json(
      { error: "Failed to fetch exam session" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()
    const item = await db.examSessions.update(id, body)
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // If exam is completed and it's an entrance exam, sync score back to admission application
    if (body.status === "completed" && (item.examType === "entrance" || body.examType === "entrance")) {
      try {
        const application = await prisma.admissionApplication.findFirst({
          where: { examSessionId: id },
        })
        if (application) {
          const totalScore = body.totalScore ?? item.score ?? 0
          const maxScore = body.maxScore ?? 0
          const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

          // Get admission settings for cut-off
          const settings = await prisma.admissionSettings.findFirst()
          let passed = false
          if (settings?.cutOffs) {
            const cutOffs = settings.cutOffs as Record<string, number>
            const classCutOff = cutOffs[application.classApplyingFor || ""] || cutOffs[application.classId || ""] || 0
            passed = classCutOff > 0 ? percentage >= classCutOff : false
          }

          await db.admissionApplications.update(application.id, {
            entranceExamScore: percentage,
            entranceExamPassed: passed,
          })
        }
      } catch (syncError) {
        console.error("Failed to sync exam score to application:", syncError)
      }
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating exam session:", error)
    return NextResponse.json(
      { error: "Failed to update exam session" },
      { status: 500 }
    )
  }
}
