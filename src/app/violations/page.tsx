import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import DataTable from "@/components/DataTable";

export default async function ViolationsPage() {
  const user = await getAuthUser();

  if (!user) redirect("/");

  return (
    <DataTable
      title="Violation Reports"
      endpoint="/api/violations"
      columns={[
        { key: "reportId", label: "Report ID" },
        { key: "eventId", label: "Event ID" },
        { key: "assetId", label: "Asset ID" },
        { key: "licenseId", label: "License ID" },
        { key: "violationType", label: "Violation Type" },
        { key: "severity", label: "Severity" },
        { key: "status", label: "Status" },
        { key: "detectedAt", label: "Detected At" },
      ]}
      searchKeys={[
        "reportId",
        "eventId",
        "assetId",
        "licenseId",
        "violationType",
        "severity",
        "status",
      ]}
    />
  );
}
