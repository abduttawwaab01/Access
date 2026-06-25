import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTeacherDashboardData } from "@/lib/dashboard-data"
import TeacherDashboardClient from "./client"

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id
  if (!userId) redirect("/login")

  const data = await getTeacherDashboardData(userId)
  return <TeacherDashboardClient data={data} />
}
