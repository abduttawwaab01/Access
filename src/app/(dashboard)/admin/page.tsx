import { getAdminDashboardData } from "@/lib/dashboard-data"
import AdminDashboardClient from "./client"

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData()
  return <AdminDashboardClient data={data} />
}
