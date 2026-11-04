import { requireRole } from "@/lib/auth";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  await requireRole("ADMIN");

  return <AdminDashboardClient />;
}