import { prisma } from "../src/lib/prisma"

async function main() {
  const school = await prisma.school.findFirst()
  const schoolId = school?.id
  console.log("School:", school?.name, "ID:", schoolId)

  const allUsers = await prisma.user.findMany({ orderBy: { createdAt: "desc" } })
  console.log("\n=== USERS (" + allUsers.length + ") ===")
  for (const u of allUsers) {
    console.log(" ", u.id.slice(0, 8), "|", u.role, "|", u.email, "|", u.name)
  }

  const allStaff = await prisma.staff.findMany({ orderBy: { createdAt: "desc" } })
  console.log("\n=== STAFF (" + allStaff.length + ") ===")
  for (const s of allStaff) {
    console.log(" ", s.id.slice(0, 8), "|", s.role, "|", s.email, "|", s.firstName, s.lastName, "|", s.staffId)
  }

  const allStudents = await prisma.student.findMany({ orderBy: { createdAt: "desc" } })
  console.log("\n=== STUDENTS (" + allStudents.length + ") ===")
  for (const s of allStudents) {
    console.log(" ", s.id.slice(0, 8), "|", s.email || "N/A", "|", s.firstName, s.lastName, "| userId:", s.userId?.slice(0, 12) || "NONE", "|", s.studentId)
  }

  const staffEmails = new Set(allStaff.filter((s) => s.email).map((s) => s.email!.toLowerCase()))
  const studentEmails = new Set(allStudents.filter((s) => s.email).map((s) => s.email!.toLowerCase()))

  console.log("\n=== GAPS ===")
  for (const u of allUsers) {
    if (u.role === "teacher" || u.role === "admin") {
      if (!staffEmails.has(u.email.toLowerCase())) {
        console.log("ORPHAN user (no staff record):", u.email, "(" + u.role + ")", u.name)
      }
    }
    if (u.role === "student") {
      if (!studentEmails.has(u.email.toLowerCase())) {
        console.log("ORPHAN user (no student record):", u.email, u.name)
      }
    }
  }

  for (const s of allStaff) {
    if (!(s as any).userId && s.email) {
      const match = allUsers.find((u) => u.email.toLowerCase() === s.email!.toLowerCase())
      if (match) {
        console.log("UNLINKED staff (" + s.email + ") -> user can be linked")
      } else {
        console.log("NO-USER staff (" + s.email + "): " + s.firstName + " " + s.lastName)
      }
    }
  }

  for (const s of allStudents) {
    if (!s.userId && s.email) {
      const match = allUsers.find((u) => u.email.toLowerCase() === s.email!.toLowerCase())
      if (match) {
        console.log("UNLINKED student (" + s.email + ") -> user can be linked")
      } else {
        console.log("NO-USER student (" + s.email + "): " + s.firstName + " " + s.lastName)
      }
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
