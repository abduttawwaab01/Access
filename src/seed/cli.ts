// ============================================================
// SEED CLI – Run with: npx tsx src/seed/cli.ts
// Seeds both Prisma DB (auth) and triggers app store seeding
// ============================================================

async function main() {
  console.log("========================================")
  console.log("  Royal Kiddies Academy - Seed Tool")
  console.log("========================================\n")

  // Step 1: Seed Prisma DB (auth users)
  console.log("[1/2] Seeding auth users to database...")
  try {
    await import("dotenv/config")
    const { PrismaClient } = await import("@prisma/client")
    const { PrismaPg } = await import("@prisma/adapter-pg")
    const { Pool } = await import("pg")
    const bcrypt = await import("bcryptjs")
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
    const teacherPw = await bcrypt.hash("password123", 10)
    const parentPw = await bcrypt.hash("parent123", 10)

    const parents = [
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

    const users = [
      { name: "Admin User", email: "admin@school.com", password: adminPw, role: "admin" as const, schoolId: school.id },
      { name: "Chidi Okonkwo", email: "chidi.okonkwo@royalkiddies.edu.ng", password: teacherPw, role: "teacher" as const, schoolId: school.id },
      { name: "Aisha Abubakar", email: "aisha.abubakar@royalkiddies.edu.ng", password: teacherPw, role: "teacher" as const, schoolId: school.id },
      { name: "Folake Adebayo", email: "folake.adebayo@royalkiddies.edu.ng", password: teacherPw, role: "teacher" as const, schoolId: school.id },
      { name: "Segun Ogunlade", email: "segun.ogunlade@royalkiddies.edu.ng", password: teacherPw, role: "teacher" as const, schoolId: school.id },
      { name: "Ngozi Eze", email: "ngozi.eze@royalkiddies.edu.ng", password: teacherPw, role: "teacher" as const, schoolId: school.id },
      ...parents,
    ]

    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      })
      console.log(`  User: ${u.email} (${u.role})`)
    }

    await prisma.$disconnect()
    await pool.end()
    console.log("  Auth users seeded successfully!\n")
  } catch (e: unknown) {
    console.error("  Auth seed error (may be non-critical):", e instanceof Error ? e.message : e)
    console.log("  Continuing with app data seed...\n")
  }

  // Step 2: Note about app data
  console.log("[2/2] App data seed (auto-seeded on server start)")
  console.log("  ✓ Classes, Subjects, Students, Staff, etc.")
  console.log("  ✓ 100+ Questions, Exams, Results")
  console.log("  ✓ Scheme of Work, Lesson Notes")
  console.log("  ✓ Attendance, Fees, Timetable")
  console.log("  Simply start the dev server: npm run dev\n")

  console.log("========================================")
  console.log("  Login Credentials:")
  console.log("  Admin:   admin@school.com / admin123")
  console.log("  Teacher: chidi.okonkwo@royalkiddies.edu.ng / password123")
  console.log("  (Other teachers: aisha, folake, segun, ngozi)")
  console.log("  Parent:  emeka.okafor@email.com / parent123")
  console.log("  (Other parents: yetunde, musa, chioma, tunde, aisha, kelechi, folake, nnamdi, zainab)")
  console.log("========================================")
}

main().catch(console.error)
