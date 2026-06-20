// ============================================================
// PRISMA SEED – Creates auth users in the PostgreSQL database
// ============================================================

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("[Prisma Seed] Starting...")

  // Check if school already exists
  const existingSchool = await prisma.school.findUnique({
    where: { slug: "royal-kiddies-academy" },
  })

  let school
  if (existingSchool) {
    console.log("[Prisma Seed] School already exists, skipping creation.")
    school = existingSchool
  } else {
    school = await prisma.school.create({
      data: {
        name: "Royal Kiddies Academy",
        shortName: "RKA",
        slug: "royal-kiddies-academy",
        phone: "+234 801 234 5678",
        email: "info@royalkiddiesacademy.edu.ng",
        address: "42 Education Avenue, Ikeja, Lagos State",
        primaryColor: "#6366f1",
        secondaryColor: "#06b6d4",
        accentColor: "#f59e0b",
      },
    })
    console.log(`[Prisma Seed] Created school: ${school.name} (${school.id})`)
  }

  const schoolId = school.id
  const password = await bcrypt.hash("password123", 10)
  const adminPassword = await bcrypt.hash("admin123", 10)
  const parentPassword = await bcrypt.hash("parent123", 10)

  // Users to create
  const users = [
    // Admin
    {
      name: "Admin User",
      email: "admin@school.com",
      password: adminPassword,
      role: "admin" as const,
      phone: "+234 800 000 0001",
      schoolId,
    },
    // 5 Teachers
    {
      name: "Chidi Okonkwo",
      email: "chidi.okonkwo@royalkiddies.edu.ng",
      password,
      role: "teacher" as const,
      phone: "+234 802 111 0001",
      schoolId,
    },
    {
      name: "Aisha Abubakar",
      email: "aisha.abubakar@royalkiddies.edu.ng",
      password,
      role: "teacher" as const,
      phone: "+234 802 111 0002",
      schoolId,
    },
    {
      name: "Folake Adebayo",
      email: "folake.adebayo@royalkiddies.edu.ng",
      password,
      role: "teacher" as const,
      phone: "+234 802 111 0003",
      schoolId,
    },
    {
      name: "Segun Ogunlade",
      email: "segun.ogunlade@royalkiddies.edu.ng",
      password,
      role: "teacher" as const,
      phone: "+234 802 111 0004",
      schoolId,
    },
    {
      name: "Ngozi Eze",
      email: "ngozi.eze@royalkiddies.edu.ng",
      password,
      role: "teacher" as const,
      phone: "+234 802 111 0005",
      schoolId,
    },
    // 10 Parents
    {
      name: "Emeka Okafor",
      email: "emeka.okafor@email.com",
      password: parentPassword,
      role: "parent" as const,
      phone: "+234 803 100 0001",
      schoolId,
    },
    {
      name: "Yetunde Adebayo",
      email: "yetunde.adebayo@email.com",
      password: parentPassword,
      role: "parent" as const,
      phone: "+234 803 100 0002",
      schoolId,
    },
    {
      name: "Musa Bello",
      email: "musa.bello@email.com",
      password: parentPassword,
      role: "parent" as const,
      phone: "+234 803 100 0003",
      schoolId,
    },
    {
      name: "Chioma Nwachukwu",
      email: "chioma.nwachukwu@email.com",
      password: parentPassword,
      role: "parent" as const,
      phone: "+234 803 100 0004",
      schoolId,
    },
    {
      name: "Tunde Olawale",
      email: "tunde.olawale@email.com",
      password: parentPassword,
      role: "parent" as const,
      phone: "+234 803 100 0005",
      schoolId,
    },
    {
      name: "Aisha Mohammed",
      email: "aisha.mohammed@email.com",
      password: parentPassword,
      role: "parent" as const,
      phone: "+234 803 100 0006",
      schoolId,
    },
    {
      name: "Kelechi Eze",
      email: "kelechi.eze@email.com",
      password: parentPassword,
      role: "parent" as const,
      phone: "+234 803 100 0007",
      schoolId,
    },
    {
      name: "Folake Ogunlade",
      email: "folake.ogunlade@email.com",
      password: parentPassword,
      role: "parent" as const,
      phone: "+234 803 100 0008",
      schoolId,
    },
    {
      name: "Nnamdi Okonkwo",
      email: "nnamdi.okonkwo@email.com",
      password: parentPassword,
      role: "parent" as const,
      phone: "+234 803 100 0009",
      schoolId,
    },
    {
      name: "Zainab Yusuf",
      email: "zainab.yusuf@email.com",
      password: parentPassword,
      role: "parent" as const,
      phone: "+234 803 100 0010",
      schoolId,
    },
  ]

  let createdCount = 0
  let skippedCount = 0

  for (const user of users) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (existing) {
      console.log(`[Prisma Seed] User already exists: ${user.email}`)
      skippedCount++
      continue
    }

    await prisma.user.create({ data: user })
    console.log(`[Prisma Seed] Created user: ${user.email} (${user.role})`)
    createdCount++
  }

  console.log(`[Prisma Seed] Complete! Created ${createdCount} users, skipped ${skippedCount} existing.`)
}

main()
  .catch((e) => {
    console.error("[Prisma Seed] Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
