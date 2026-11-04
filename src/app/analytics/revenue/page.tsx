
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OwnerRevenue {
  OwnerID: string;
  OwnerName: string;
  TotalLicenses: number;
  TotalRevenue: string;
}

interface HighRevenueOwner {
  OwnerID: string;
  OwnerName: string;
  TotalRevenue: string;
}

interface AboveAverageLicensee {
  LicenseeID: string;
  LicenseeName: string;
  TotalPayments: string;
}

interface RevenueAnalytics {
  ownerRevenue: OwnerRevenue[];
  highRevenueOwners: HighRevenueOwner[];
  aboveAverageLicensees: AboveAverageLicensee[];
  totalRevenue: string;
}

export default function RevenueAnalyticsPage() {
  const router = useRouter();

  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics/revenue");
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load revenue analytics.");
          return;
        }

        setAnalytics(data.analytics);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  function formatCurrency(value: string | number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Revenue Analytics</h1>
            <p className="mt-2 text-slate-400">
              Revenue analysis by asset owner and licensee.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>

        {loading && (
          <p className="text-slate-400">Loading revenue analytics...</p>
        )}

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-300">
            {error}
          </div>
        )}

        {analytics && !loading && (
          <>
            <section className="mb-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Total Paid Revenue (USD)</p>
                <p className="mt-3 text-3xl font-bold text-green-400">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Owners Above $50,000</p>
                <p className="mt-3 text-3xl font-bold">
                  {analytics.highRevenueOwners.length}
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">
                Revenue by Asset Owner
              </h2>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="p-4">Owner ID</th>
                      <th className="p-4">Owner Name</th>
                      <th className="p-4">Total Licenses</th>
                      <th className="p-4">Paid Revenue (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.ownerRevenue.map((owner) => (
                      <tr key={owner.OwnerID} className="border-t border-slate-800">
                        <td className="p-4">{owner.OwnerID}</td>
                        <td className="p-4">{owner.OwnerName}</td>
                        <td className="p-4">{owner.TotalLicenses}</td>
                        <td className="p-4 font-medium text-green-400">
                          {formatCurrency(owner.TotalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">
                High-Revenue Owners (Above $50,000)
              </h2>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="p-4">Owner ID</th>
                      <th className="p-4">Owner Name</th>
                      <th className="p-4">Total Revenue (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.highRevenueOwners.map((owner) => (
                      <tr key={owner.OwnerID} className="border-t border-slate-800">
                        <td className="p-4">{owner.OwnerID}</td>
                        <td className="p-4">{owner.OwnerName}</td>
                        <td className="p-4 font-medium text-green-400">
                          {formatCurrency(owner.TotalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">
                Licensees with Above-Average Payments
              </h2>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="p-4">Licensee ID</th>
                      <th className="p-4">Licensee Name</th>
                      <th className="p-4">Total Payments (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.aboveAverageLicensees.map((licensee) => (
                      <tr key={licensee.LicenseeID} className="border-t border-slate-800">
                        <td className="p-4">{licensee.LicenseeID}</td>
                        <td className="p-4">{licensee.LicenseeName}</td>
                        <td className="p-4 font-medium text-green-400">
                          {formatCurrency(licensee.TotalPayments)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
