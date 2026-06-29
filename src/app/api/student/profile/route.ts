import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

async function resolveStudent(userId: string) {
  let student = await db.students.getByUserId(userId)
  if (!student) student = await db.students.getById(userId)
  if (!student) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
    if (user?.email) {
      student = await prisma.student.findFirst({ where: { email: user.email } })
    }
    if (!student && user?.name) {
      const nameParts = user.name.trim().split(/\s+/)
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || firstName
      student = await prisma.student.findFirst({ where: { firstName, lastName } })
    }
    if (student) {
      await prisma.student.update({ where: { id: student.id }, data: { userId } })
    }
  }
  return student
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  try {
    const userId = request.nextUrl.searchParams.get("userId") || ""
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const student = await resolveStudent(userId)

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: student.id,
      name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
      email: student.email || "",
      phone: student.phone || "",
      role: "student"
    })
  } catch (error) {
    console.error("Error fetching student profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  try {
    const body = await request.json()
    const userId = body.id || ""
    if (!userId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const student = await resolveStudent(userId)

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const updated = await db.students.update(student.id, {
      firstName: body.name?.split(" ")[0] || "",
      lastName: body.name?.split(" ").slice(1).join(" ") || "",
      email: body.email,
      phone: body.phone
    })

    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      id: updated.id,
      name: `${updated.firstName || ""} ${updated.lastName || ""}`.trim(),
      email: updated.email || "",
      phone: updated.phone || "",
      role: "student"
    })
  } catch (error) {
    console.error("Error updating student profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}