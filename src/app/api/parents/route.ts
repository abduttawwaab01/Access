import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { requireRole } from "@/lib/api-auth"

export async function GET() {
  const auth = await requireRole("admin", "superadmin")
  if (auth instanceof Response) return auth
  
  const parents = await db.users.getAll("parent")
  const links = await db.parentLinks.getAll()
  const studentIds = links.map((l: any) => l.studentId)
  const students = studentIds.length > 0
    ? await prisma.student.findMany({ where: { id: { in: studentIds } } })
    : []
  const enriched = parents.map((p: any) => {
    const parentLinks = links.filter((l: any) => l.parentId === p.id)
    const linkedStudents = parentLinks.map((l: any) => {
      const s = students.find((st: any) => st.id === l.studentId)
      return s ? { id: s.id, name: `${s.firstName} ${s.lastName}`, studentId: s.studentId } : null
    }).filter(Boolean)
    return { id: p.id, name: p.name, email: p.email, phone: p.phone, linkedStudents, linkCount: linkedStudents.length }
  })
  return NextResponse.json(enriched)
}

export async function POST(request: Request) {
  const auth = await requireRole("admin", "superadmin")
  if (auth instanceof Response) return auth
  
  const body = await request.json()
  const { name, email, phone, password, studentId } = body
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }
  const existing = await db.users.getByEmail(email)
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 })
  }
  const school = await prisma.school.findFirst()
  const schoolId = school?.id || ""
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, password: hashed, role: "parent", schoolId },
  })
  if (studentId) {
    // Validate student exists before creating link
    const student = await prisma.student.findUnique({ where: { id: studentId } })
    if (student) {
      await db.parentLinks.create({ parentId: user.id, studentId })
    }
  }
  return NextResponse.json({ ...user, linkedStudents: studentId ? [{ id: studentId }] : [] }, { status: 201 })
}
