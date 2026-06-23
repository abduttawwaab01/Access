// ============================================================
// SEED CLI – Run with: npx tsx src/seed/cli.ts
// Seeds auth users (Prisma) + full app data (Prisma runner)
// ============================================================

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

async function main() {
  console.log("========================================")
  console.log("  Royal Kiddies Academy - Seed Tool")
  console.log("========================================\n")

  // Step 1: Seed auth users
  console.log("[1/3] Seeding auth users to database...")
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const school = await prisma.school.upsert({
    where: { slug: "royal-kiddies-academy" },
    update: {},
    create: {
      name: "Royal Kiddies Academy",
      shortName: "RKA",
      slug: "royal-kiddies-academy",
      phone: "+234 801 234 5678",
      email: "info@royalkiddiesacademy.edu.ng",
      address: "42 Education Avenue, Ikeja, Lagos State",
    },
  })
  console.log(`  School: ${school.name} (${school.id})`)

  const adminPw = await bcrypt.hash("admin123", 10)
  const staffPw = await bcrypt.hash("password123", 10)
  const parentPw = await bcrypt.hash("parent123", 10)
  const users = [
    { name: "Admin User", email: "admin@school.com", password: adminPw, role: "admin" as const, schoolId: school.id },
    { name: "Chidi Okonkwo", email: "chidi.okonkwo@royalkiddies.edu.ng", password: staffPw, role: "teacher" as const, schoolId: school.id },
    { name: "Aisha Abubakar", email: "aisha.abubakar@royalkiddies.edu.ng", password: staffPw, role: "teacher" as const, schoolId: school.id },
    { name: "Folake Adebayo", email: "folake.adebayo@royalkiddies.edu.ng", password: staffPw, role: "teacher" as const, schoolId: school.id },
    { name: "Segun Ogunlade", email: "segun.ogunlade@royalkiddies.edu.ng", password: staffPw, role: "teacher" as const, schoolId: school.id },
    { name: "Ngozi Eze", email: "ngozi.eze@royalkiddies.edu.ng", password: staffPw, role: "teacher" as const, schoolId: school.id },
    { name: "Emeka Okafor", email: "emeka.okafor@email.com", password: parentPw, role: "parent" as const, schoolId: school.id },
    { name: "Yetunde Adebayo", email: "yetunde.adebayo@email.com", password: parentPw, role: "parent" as const, schoolId: school.id },
    { name: "Musa Bello", email: "musa.bello@email.com", password: parentPw, role: "parent" as const, schoolId: school.id },
    { name: "Chioma Nwachukwu", email: "chioma.nwachukwu@email.com", password: parentPw, role: "parent" as const, schoolId: school.id },
    { name: "Tunde Olawale", email: "tunde.olawale@email.com", password: parentPw, role: "parent" as const, schoolId: school.id },
    { name: "Aisha Mohammed", email: "aisha.mohammed@email.com", password: parentPw, role: "parent" as const, schoolId: school.id },
    { name: "Kelechi Eze", email: "kelechi.eze@email.com", password: parentPw, role: "parent" as const, schoolId: school.id },
    { name: "Folake Ogunlade", email: "folake.ogunlade@email.com", password: parentPw, role: "parent" as const, schoolId: school.id },
    { name: "Nnamdi Okonkwo", email: "nnamdi.okonkwo@email.com", password: parentPw, role: "parent" as const, schoolId: school.id },
    { name: "Zainab Yusuf", email: "zainab.yusuf@email.com", password: parentPw, role: "parent" as const, schoolId: school.id },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    })
    console.log(`  User: ${u.email} (${u.role})`)
  }
  console.log("  Auth users seeded!\n")

  // Step 2: Seed staff records (for timetable/grading assignment compatibility)
  console.log("[2/3] Seeding staff records...")
  const staffUsers = users.filter((u) => u.role === "teacher" || u.role === "admin")
  for (const u of staffUsers) {
    const exists = await prisma.staff.findFirst({
      where: { email: u.email },
    })
    if (!exists) {
      await prisma.staff.create({
        data: {
          firstName: u.name.split(" ")[0],
          lastName: u.name.split(" ").slice(1).join(" "),
          email: u.email,
          staffId: u.role === "admin" ? "ADM001" : `STF${Math.floor(1000 + Math.random() * 9000)}`,
          role: u.role,
          department: u.role === "admin" ? "Administration" : "Academic",
          phone: "+234 800 000 0000",
          schoolId: school.id,
        },
      })
    }
  }
  console.log(`  Staff records synced!\n`)

  // Cleanup
  await prisma.$disconnect()
  await pool.end()

  // Step 3: Seed app data via Prisma runner
  console.log("[3/3] Seeding curriculum data to database...")
  console.log("  (Classes, Subjects, Questions, Lesson Notes, etc.)\n")
  await import("./prisma-runner")

  console.log("\n========================================")
  console.log("  Login Credentials:")
  console.log("  Admin:   admin@school.com / admin123")
  console.log("  Teacher: chidi.okonkwo@royalkiddies.edu.ng / password123")
  console.log("  (Other teachers: aisha, folake, segun, ngozi)")
  console.log("  Parent:  emeka.okafor@email.com / parent123")
  console.log("  (Other parents: yetunde, musa, chioma, tunde, aisha, kelechi, folake, nnamdi, zainab)")
  console.log("========================================")
}

main().catch(console.error)
