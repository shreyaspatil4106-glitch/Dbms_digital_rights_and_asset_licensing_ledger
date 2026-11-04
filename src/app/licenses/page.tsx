"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface License {
  LicenseID: string;
  AssetID: string;
  AssetTitle: string;
  LicenseeName: string;
  LicenseeOrganization: string;
  TerritoryName: string;
  StartDate: string;
  EndDate: string;
  LicenseType: string;
  Exclusivity: string;
  Status: string;
  AutoRenew: number | boolean;
}

export default function LicensesPage() {
  const router = useRouter();

  const [licenses, setLicenses] = useState<License[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLicenses() {
      try {
        const response = await fetch("/api/licenses");
        const data = await response.json();

        if (data.success) {
          setLicenses(data.licenses);
        }
      } catch (error) {
        console.error("Unable to load licenses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLicenses();
  }, []);

 function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
  const filteredLicenses = licenses.filter((license) =>
    [
      license.LicenseID,
      license.AssetTitle,
      license.LicenseeName,
      license.TerritoryName,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.back()}
          className="mb-6 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold">
          Licensing Agreements
        </h1>

        <p className="mt-2 text-slate-400">
          View and search all digital asset licensing agreements.
        </p>

        <div className="mt-8">
          <input
            type="text"
            placeholder="Search by license, asset, licensee or territory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          {loading ? (
            <p className="p-6 text-slate-400">
              Loading licensing agreements...
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  {[
                    "License ID",
                    "Asset",
                    "Licensee",
                    "Territory",
                    "Start Date",
                    "End Date",
                    "Type",
                    "Exclusivity",
                    "Status",
                    "Auto Renew",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-4">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredLicenses.map((license) => (
                  <tr
                    key={license.LicenseID}
                    className="border-t border-slate-800 hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-4 font-medium text-blue-400">
                      {license.LicenseID}
                    </td>
                    <td className="px-4 py-4">
                      {license.AssetTitle}
                    </td>
                    <td className="px-4 py-4">
                      <div>{license.LicenseeName}</div>
                      <div className="text-xs text-slate-500">
                        {license.LicenseeOrganization}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {license.TerritoryName}
                    </td>
                    <td className="px-4 py-4">
                      {formatDate(license.StartDate)}
                    </td>
                    <td className="px-4 py-4">
                      {formatDate(license.EndDate)}
                    </td>
                    <td className="px-4 py-4">
                      {license.LicenseType}
                    </td>
                    <td className="px-4 py-4">
                      {license.Exclusivity}
                    </td>
                    <td className="px-4 py-4">
                      {license.Status}
                    </td>
                    <td className="px-4 py-4">
                      {license.AutoRenew ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}

                {filteredLicenses.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      No licensing agreements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Showing {filteredLicenses.length} of {licenses.length} licensing agreements
        </p>
      </div>
    </main>
  );
}