import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStudentDashboardData } from "@/lib/dashboard-data"
import StudentDashboardClient from "./client"

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id
  if (!userId) redirect("/login")

  const data = await getStudentDashboardData(userId)
  return <StudentDashboardClient data={data} />
}
