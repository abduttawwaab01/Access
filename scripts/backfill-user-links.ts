import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const school = await prisma.school.findFirst()
  if (!school) {
    console.error("No school found — cannot proceed")
    process.exit(1)
  }
  const schoolId = school.id
  console.log("School:", school.name, "ID:", schoolId)

  // ── 1. Fetch all data ──────────────────────────────────────────
  const allUsers = await prisma.user.findMany()
  const allStaff = await prisma.staff.findMany()
  const allStudents = await prisma.student.findMany()

  console.log("\nCurrent counts:")
  console.log("  Users:", allUsers.length)
  console.log("  Staff:", allStaff.length)
  console.log("  Students:", allStudents.length)

  // Build lookup maps
  const userByEmail = new Map<string, typeof allUsers[0]>()
  for (const u of allUsers) userByEmail.set(u.email.toLowerCase(), u)

  const staffByEmail = new Map<string, typeof allStaff[0]>()
  for (const s of allStaff) {
    if (s.email) staffByEmail.set(s.email.toLowerCase(), s)
  }

  const studentByEmail = new Map<string, typeof allStudents[0]>()
  for (const s of allStudents) {
    if (s.email) studentByEmail.set(s.email.toLowerCase(), s)
  }

  let created = 0, linked = 0

  // ── 2. Staff — create missing User records ─────────────────────
  console.log("\n── Staff without User records ──")
  for (const s of allStaff) {
    if (s.email) {
      const existing = userByEmail.get(s.email.toLowerCase())
      if (existing) {
        // User exists — link if not already linked
        if (!(s as any).userId) {
          await prisma.staff.update({ where: { id: s.id }, data: { userId: existing.id } })
          console.log("  LINKED staff", s.email, "→ user", existing.id.slice(0, 12))
          linked++
        }
      } else {
        // No User record — create one
        const hashed = await bcrypt.hash("password123", 10)
        const user = await prisma.user.create({
          data: {
            name: `${s.firstName} ${s.lastName}`,
            email: s.email,
            password: hashed,
            role: "teacher",
            schoolId,
          },
        })
        await prisma.staff.update({ where: { id: s.id }, data: { userId: user.id } })
        userByEmail.set(s.email.toLowerCase(), user)
        console.log("  CREATED user for staff", s.email, "→ user", user.id.slice(0, 12))
        created++
      }
    }
  }

  // ── 3. Users(teacher/admin) — create missing Staff records ──────
  console.log("\n── Users (teacher/admin) without Staff records ──")
  for (const u of allUsers) {
    if (u.role === "teacher" || u.role === "admin") {
      const existing = staffByEmail.get(u.email.toLowerCase())
      if (!existing) {
        const [firstName, ...rest] = u.name.split(" ")
        const lastName = rest.join(" ") || "Staff"
        const staffId = "STF" + Date.now() + Math.random().toString(36).slice(2, 8).toUpperCase()
        const staff = await prisma.staff.create({
          data: {
            firstName,
            lastName,
            staffId,
            email: u.email,
            schoolId,
            userId: u.id,
          },
        })
        staffByEmail.set(u.email.toLowerCase(), staff)
        console.log("  CREATED staff for user", u.email, "→ staff", staff.id.slice(0, 12))
        created++
      }
    }
  }

  // ── 4. Students — create missing User records ──────────────────
  console.log("\n── Students without User records ──")
  for (const s of allStudents) {
    if (s.email) {
      const existing = userByEmail.get(s.email.toLowerCase())
      if (existing) {
        if (!s.userId) {
          await prisma.student.update({ where: { id: s.id }, data: { userId: existing.id } })
          console.log("  LINKED student", s.email, "→ user", existing.id.slice(0, 12))
          linked++
        }
      } else {
        const hashed = await bcrypt.hash("student123", 10)
        const user = await prisma.user.create({
          data: {
            name: `${s.firstName} ${s.lastName}`,
            email: s.email,
            password: hashed,
            role: "student",
            schoolId,
          },
        })
        await prisma.student.update({ where: { id: s.id }, data: { userId: user.id } })
        userByEmail.set(s.email.toLowerCase(), user)
        console.log("  CREATED user for student", s.email, "→ user", user.id.slice(0, 12))
        created++
      }
    }
  }

  // ── 5. Users(student) — create missing Student records ─────────
  console.log("\n── Users (student) without Student records ──")
  for (const u of allUsers) {
    if (u.role === "student") {
      const existing = studentByEmail.get(u.email.toLowerCase())
      if (!existing && u.email !== "student@school.com") {
        console.log("  ORPHAN user (student)", u.email, "- no Student record exists; skipping (needs class assignment)")
      }
    }
  }

  console.log("\n── Done ──")
  console.log("  Records created:", created)
  console.log("  Records linked:", linked)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
