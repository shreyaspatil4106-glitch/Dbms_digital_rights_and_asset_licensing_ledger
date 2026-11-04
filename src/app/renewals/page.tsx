import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import DataTable from "@/components/DataTable";

export default async function RenewalsPage() {
  const user = await getAuthUser();

  if (!user) redirect("/");

  return (
    <DataTable
      title="Manage Renewals"
      endpoint="/api/renewals"
      columns={[
        { key: "renewalId", label: "Renewal ID" },
        { key: "licenseId", label: "License ID" },
        { key: "assetTitle", label: "Asset" },
        { key: "licenseeName", label: "Licensee" },
        { key: "renewalDate", label: "Renewal Date" },
        { key: "newStartDate", label: "New Start Date" },
        { key: "newEndDate", label: "New End Date" },
        { key: "status", label: "Status" },
      ]}
      searchKeys={[
        "renewalId",
        "licenseId",
        "assetTitle",
        "licenseeName",
        "status",
      ]}
    />
  );
}
