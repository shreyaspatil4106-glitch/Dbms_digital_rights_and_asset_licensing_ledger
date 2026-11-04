import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import DataTable from "@/components/DataTable";

export default async function PaymentsPage() {
  const user = await getAuthUser();

  if (!user) redirect("/");

  return (
    <DataTable
      title="Payment Records"
      endpoint="/api/payments"
      columns={[
        { key: "paymentId", label: "Payment ID" },
        { key: "licenseId", label: "License ID" },
        { key: "assetTitle", label: "Asset" },
        { key: "licenseeName", label: "Licensee" },
        { key: "amount", label: "Amount" },
        { key: "currency", label: "Currency" },
        { key: "paymentStatus", label: "Payment Status" },
        { key: "paymentDate", label: "Payment Date" },
        { key: "method", label: "Method" },
      ]}
      searchKeys={[
        "paymentId",
        "licenseId",
        "assetTitle",
        "licenseeName",
        "paymentStatus",
      ]}
    />
  );
}
