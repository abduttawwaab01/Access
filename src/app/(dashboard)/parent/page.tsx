import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getParentDashboardData } from "@/lib/dashboard-data"
import ParentDashboardClient from "./client"

export default async function ParentDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id
  if (!userId) redirect("/login")

  const data = await getParentDashboardData(userId)
  return <ParentDashboardClient initialData={data} />
}
