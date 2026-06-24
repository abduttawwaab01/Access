import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function getSchoolId(): Promise<string> {
  const school = await prisma.school.findFirst()
  return school?.id || ""
}

export async function GET() {
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
  const body = await request.json()
  const { name, email, phone, password, studentId } = body
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
  }
  const existing = await db.users.getByEmail(email)
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 })
  }
  const schoolId = await getSchoolId()
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, password: hashed, role: "parent", schoolId },
  })
  if (studentId) {
    await db.parentLinks.create({ parentId: user.id, studentId })
  }
  return NextResponse.json({ ...user, linkedStudents: studentId ? [{ id: studentId }] : [] }, { status: 201 })
}
