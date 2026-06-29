import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function GET() {
  const auth = await requireRole("admin", "superadmin", "parent")
  if (auth instanceof Response) return auth
  return NextResponse.json(await db.parentLinks.getAll())
}

export async function POST(request: Request) {
  const auth = await requireRole("admin", "superadmin")
  if (auth instanceof Response) return auth
  
  const body = await request.json()
  
  // Input validation
  if (!body.parentId || !body.studentId) {
    return NextResponse.json({ error: "parentId and studentId are required" }, { status: 400 })
  }
  
  // Verify parent exists
  const parent = await db.users.getById(body.parentId)
  if (!parent) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 })
  }
  
  // Verify student exists
  const student = await prisma.student.findUnique({ where: { id: body.studentId } })
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 })
  }
  
  // Check for duplicate link
  const existing = await prisma.parentLink.findFirst({
    where: { parentId: body.parentId, studentId: body.studentId }
  })
  if (existing) {
    return NextResponse.json({ error: "This parent-student link already exists" }, { status: 409 })
  }
  
  const item = await db.parentLinks.create({ parentId: body.parentId, studentId: body.studentId })
  return NextResponse.json(item, { status: 201 })
}
