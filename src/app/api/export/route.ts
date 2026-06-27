import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { toCsv, flattenForExport, toIsoDate } from "@/lib/export-utils"
import JSZip from "jszip"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = session.user as any
    if (user.role !== "admin" && user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const school = await prisma.school.findFirst()
    if (!school) return NextResponse.json({ error: "No school found" }, { status: 404 })

    const schoolId = school.id
    const where = { schoolId }
    const MAX_ROWS_PER_TABLE = 5000

    const skip = ["schoolId", "id", "createdAt", "updatedAt"]
    const take = MAX_ROWS_PER_TABLE

    const staff = flattenForExport(await prisma.staff.findMany({ where, take }), skip)
    const students = flattenForExport(await prisma.student.findMany({ where, take }), skip)
    const classes = flattenForExport(await prisma.class.findMany({ where, take }), skip)
    const subjects = flattenForExport(await prisma.subject.findMany({ where, take }), skip)
    const sessions_acad = flattenForExport(await prisma.academicSession.findMany({ where, take }), skip)
    const terms = flattenForExport(await prisma.term.findMany({ where: { session: { schoolId } }, take }), skip)
    const timetableEntries = flattenForExport(await prisma.timetableEntry.findMany({ where, take }), skip)
    const teacherAssignments = flattenForExport(await prisma.teacherAssignment.findMany({ where, take }), skip)
    const lessonNotes = flattenForExport(await prisma.lessonNote.findMany({ where, take }), skip)
    const schemeOfWorks = flattenForExport(await prisma.schemeOfWork.findMany({ where, take }), skip)
    const assignments = flattenForExport(await prisma.assignment.findMany({ where, take }), skip)
    const submissions = flattenForExport(await prisma.submission.findMany({ where, take }), skip)
    const results = flattenForExport(await prisma.result.findMany({ where, take }), skip)
    const attendanceRecords = flattenForExport(await prisma.attendanceRecord.findMany({ where, take }), skip)
    const attendanceLogs = flattenForExport(await prisma.attendanceLog.findMany({ where, take }), skip)
    const feeStructures = flattenForExport(await prisma.feeStructure.findMany({ where, take }), skip)
    const fees = flattenForExport(await prisma.fee.findMany({ where, take }), skip)
    const payments = flattenForExport(await prisma.payment.findMany({ where, take }), skip)
    const salaryStructures = flattenForExport(await prisma.salaryStructure.findMany({ where, take }), skip)
    const salaryRecords = flattenForExport(await prisma.salaryRecord.findMany({ where, take }), skip)
    const exams = flattenForExport(await prisma.exam.findMany({ where, take }), skip)
    const examSessions = flattenForExport(await prisma.examSession.findMany({ where, take }), skip)
    const questions = flattenForExport(await prisma.question.findMany({ where, take }), skip)
    const events = flattenForExport(await prisma.event.findMany({ where, take }), skip)
    const announcements = flattenForExport(await prisma.announcement.findMany({ where, take }), skip)
    const weeklyReports = flattenForExport(await prisma.weeklyReport.findMany({ where, take }), skip)
    const documents = flattenForExport(await prisma.document.findMany({ where, take }), skip)
    const parentLinks = flattenForExport(await prisma.parentLink.findMany({ where, take }), skip)
    const gradingConfig = flattenForExport(await prisma.gradingConfig.findMany({ where, take }), skip)
    const bankDetails = flattenForExport(await prisma.bankDetails.findMany({ where, take }), skip)
    const lessonQuizResults = flattenForExport(await prisma.lessonQuizResult.findMany({ where, take }), skip)
    const topics = flattenForExport(await prisma.topic.findMany({ where, take }), skip)

    const tables: Record<string, any[]> = {
      staff, students, classes, subjects,
      "academic-sessions": sessions_acad, terms,
      "timetable-entries": timetableEntries,
      "teacher-assignments": teacherAssignments,
      "lesson-notes": lessonNotes,
      "scheme-of-work": schemeOfWorks,
      assignments, submissions,
      results,
      "attendance-records": attendanceRecords,
      "attendance-logs": attendanceLogs,
      "fee-structures": feeStructures, fees, payments,
      "salary-structures": salaryStructures,
      "salary-records": salaryRecords,
      exams, "exam-sessions": examSessions, questions,
      events, announcements,
      "weekly-reports": weeklyReports,
      documents, "parent-links": parentLinks,
      "grading-config": gradingConfig,
      "bank-details": bankDetails,
      "lesson-quiz-results": lessonQuizResults,
      topics,
    }

    const zip = new JSZip()

    const rowCounts: Record<string, number> = {}
    for (const [name, rows] of Object.entries(tables)) {
      const csv = toCsv(rows)
      if (csv) zip.file(`${name}.csv`, csv)
      rowCounts[name] = rows.length
    }

    const dateStr = new Date().toISOString().split("T")[0]
    const manifest = {
      exportedAt: new Date().toISOString(),
      schoolName: school.name,
      schoolId: school.id,
      rowCounts,
    }
    zip.file("manifest.json", JSON.stringify(manifest, null, 2))

    const readme = [
      `School Data Export — ${school.name}`,
      `Exported: ${new Date().toLocaleString()}`,
      `Total tables: ${Object.keys(rowCounts).length}`,
      `Total rows: ${Object.values(rowCounts).reduce((a, b) => a + b, 0)}`,
      "",
      "Generated by Access School Management System",
    ].join("\n")
    zip.file("README.txt", readme)

    const blob = await zip.generateAsync({ type: "nodebuffer" }) as Buffer
    const uint8 = new Uint8Array(blob)

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="school-export-${dateStr}.zip"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
