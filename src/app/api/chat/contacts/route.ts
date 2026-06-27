import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/chat-auth"

export async function GET(request: Request) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let contacts: { id: string; name: string; email: string; role: string; image?: string | null }[] = []

  if (user.role === "superadmin") {
    const all = await prisma.user.findMany({ where: { role: { not: "student" as const } }, select: { id: true, name: true, email: true, role: true, image: true }, orderBy: { name: "asc" as const } })
    contacts = all.map((u: { id: string; name: string; email: string; role: string; image?: string | null }) => ({ ...u, role: u.role }))
    contacts.unshift({ id: "superadmin", name: "Super Admin", email: "superadmin@skoolar.com", role: "superadmin", image: null })
  } else if (user.role === "admin") {
    const all = await prisma.user.findMany({ where: { schoolId: user.schoolId, role: { not: "student" as const } }, select: { id: true, name: true, email: true, role: true, image: true }, orderBy: { name: "asc" as const } })
    contacts = all.map((u: any) => ({ ...u, role: u.role }))
  } else if (user.role === "teacher") {
    const staff = await prisma.staff.findFirst({ where: { userId: user.id } })
    if (staff) {
      const assignment = await prisma.teacherAssignment.findFirst({ where: { teacherId: staff.id } })
      if (assignment) {
        const classIds = (assignment.classIds as string[]) || []
        const students = await prisma.student.findMany({ where: { classId: { in: classIds }, parentId: { not: null } }, select: { parentId: true }, distinct: ["parentId"] })
        const parentIds = students.map((s: { parentId: string | null }) => s.parentId!).filter(Boolean)
        const parents = await prisma.user.findMany({ where: { id: { in: parentIds } }, select: { id: true, name: true, email: true, role: true, image: true } })
        contacts = parents.map((u: any) => ({ ...u, role: u.role }))
      }
    }
    const admins = await prisma.user.findMany({ where: { schoolId: user.schoolId, role: "admin" }, select: { id: true, name: true, email: true, role: true, image: true } })
    const teachers = await prisma.user.findMany({ where: { schoolId: user.schoolId, role: "teacher" }, select: { id: true, name: true, email: true, role: true, image: true } })
    contacts = [...contacts, ...admins, ...teachers]
  } else if (user.role === "parent") {
    const students = await prisma.student.findMany({ where: { parentId: user.id }, select: { classId: true } })
    const classIds = [...new Set(students.map((s: { classId: string }) => s.classId))]
    const allAssignments = await prisma.teacherAssignment.findMany({ select: { teacherId: true, classIds: true } })
    const matchedAssignmentIds = allAssignments.filter((a: { classIds: any }) => {
      const ids: string[] = (a.classIds as string[]) || []
      return ids.some((id: string) => classIds.includes(id))
    }).map((a: { teacherId: any }) => a.teacherId)
    const staffRecords = await prisma.staff.findMany({ where: { id: { in: matchedAssignmentIds }, userId: { not: null } }, select: { userId: true } })
    const teacherIds = staffRecords.map((s: { userId: string | null }) => s.userId!).filter(Boolean)
    const teachers = await prisma.user.findMany({ where: { id: { in: teacherIds } }, select: { id: true, name: true, email: true, role: true, image: true } })
    contacts = teachers.map((u: any) => ({ ...u, role: u.role }))
    const admins = await prisma.user.findMany({ where: { schoolId: user.schoolId, role: "admin" }, select: { id: true, name: true, email: true, role: true, image: true } })
    contacts = [...contacts, ...admins]
  }

  const filtered = contacts.filter((c) => c.id !== user.id)
  const seen = new Set<string>()
  const unique = filtered.filter((c) => { const k = c.id; if (seen.has(k)) return false; seen.add(k); return true })

  return NextResponse.json(unique)
}
