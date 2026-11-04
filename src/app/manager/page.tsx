import { requireRole } from "@/lib/auth";
import ManagerDashboardClient from "./ManagerDashboardClient";

export default async function ManagerDashboard() {
  await requireRole("LICENSE_MANAGER");

  return <ManagerDashboardClient />;
}