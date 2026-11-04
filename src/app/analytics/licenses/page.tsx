
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ApproachingExpiry {
  LicenseID: string;
  AssetTitle: string;
  LicenseeName: string;
  EndDate: string;
  DaysRemaining: number;
}

interface ExclusiveOverlap {
  AssetID: string;
  AssetTitle: string;
  LicenseID1: string;
  LicenseID2: string;
  StartDate1: string;
  EndDate1: string;
  StartDate2: string;
  EndDate2: string;
}

interface MultipleLicensedAsset {
  AssetID: string;
  AssetTitle: string;
  TotalLicenses: number;
}

interface UnpaidLicense {
  LicenseID: string;
  AssetTitle: string;
  LicenseeName: string;
  Status: string;
  StartDate: string;
  EndDate: string;
}

interface LicenseAnalytics {
  approachingExpiry: ApproachingExpiry[];
  exclusiveOverlaps: ExclusiveOverlap[];
  multipleLicensedAssets: MultipleLicensedAsset[];
  unpaidLicenses: UnpaidLicense[];
}

export default function LicenseIntelligencePage() {
  const router = useRouter();

  const [analytics, setAnalytics] = useState<LicenseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics/licenses");
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load license intelligence.");
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

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  }

  const summaryCards = analytics
    ? [
        {
          title: "Approaching Expiry",
          value: analytics.approachingExpiry.length,
          description: "Active licenses ending within 30 days",
        },
        {
          title: "Exclusive Overlaps",
          value: analytics.exclusiveOverlaps.length,
          description: "Overlapping active exclusive licenses",
        },
        {
          title: "Multiple Licensed Assets",
          value: analytics.multipleLicensedAssets.length,
          description: "Assets with more than one license",
        },
        {
          title: "No Payment Records",
          value: analytics.unpaidLicenses.length,
          description: "Licenses without payment entries",
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">License Intelligence</h1>
            <p className="mt-2 text-slate-400">
              Advanced analysis of license expiry, exclusivity and payment records.
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
          <p className="text-slate-400">Loading license intelligence...</p>
        )}

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-300">
            {error}
          </div>
        )}

        {analytics && !loading && (
          <>
            <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                >
                  <p className="text-sm text-slate-400">{card.title}</p>
                  <p className="mt-3 text-3xl font-bold">{card.value}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {card.description}
                  </p>
                </div>
              ))}
            </section>

            <section className="mb-10">
              <h2 className="mb-4 text-xl font-semibold">
                Licenses Approaching Expiry
              </h2>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="p-4">License ID</th>
                      <th className="p-4">Asset</th>
                      <th className="p-4">Licensee</th>
                      <th className="p-4">End Date</th>
                      <th className="p-4">Days Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.approachingExpiry.map((item) => (
                      <tr key={item.LicenseID} className="border-t border-slate-800">
                        <td className="p-4 font-medium text-blue-400">{item.LicenseID}</td>
                        <td className="p-4">{item.AssetTitle}</td>
                        <td className="p-4">{item.LicenseeName}</td>
                        <td className="p-4">{formatDate(item.EndDate)}</td>
                        <td className="p-4 font-medium text-amber-400">
                          {item.DaysRemaining} days
                        </td>
                      </tr>
                    ))}
                    {analytics.approachingExpiry.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          No active licenses approaching expiry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="mb-4 text-xl font-semibold">
                Exclusive License Overlaps
              </h2>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="p-4">Asset</th>
                      <th className="p-4">License 1</th>
                      <th className="p-4">License 1 Period</th>
                      <th className="p-4">License 2</th>
                      <th className="p-4">License 2 Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.exclusiveOverlaps.map((item) => (
                      <tr
                        key={`${item.LicenseID1}-${item.LicenseID2}`}
                        className="border-t border-slate-800"
                      >
                        <td className="p-4">{item.AssetTitle}</td>
                        <td className="p-4">{item.LicenseID1}</td>
                        <td className="p-4">
                          {formatDate(item.StartDate1)} – {formatDate(item.EndDate1)}
                        </td>
                        <td className="p-4">{item.LicenseID2}</td>
                        <td className="p-4">
                          {formatDate(item.StartDate2)} – {formatDate(item.EndDate2)}
                        </td>
                      </tr>
                    ))}
                    {analytics.exclusiveOverlaps.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          No overlapping active exclusive licenses found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="mb-4 text-xl font-semibold">
                Assets with Multiple Licenses
              </h2>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="p-4">Asset ID</th>
                      <th className="p-4">Asset Name</th>
                      <th className="p-4">Total Licenses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.multipleLicensedAssets.map((item) => (
                      <tr key={item.AssetID} className="border-t border-slate-800">
                        <td className="p-4">{item.AssetID}</td>
                        <td className="p-4">{item.AssetTitle}</td>
                        <td className="p-4 font-medium">{item.TotalLicenses}</td>
                      </tr>
                    ))}
                    {analytics.multipleLicensedAssets.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-slate-400">
                          No assets with multiple licenses found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">
                Licenses Without Payment Records
              </h2>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="p-4">License ID</th>
                      <th className="p-4">Asset</th>
                      <th className="p-4">Licensee</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Start Date</th>
                      <th className="p-4">End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.unpaidLicenses.map((item) => (
                      <tr key={item.LicenseID} className="border-t border-slate-800">
                        <td className="p-4">{item.LicenseID}</td>
                        <td className="p-4">{item.AssetTitle}</td>
                        <td className="p-4">{item.LicenseeName}</td>
                        <td className="p-4">{item.Status}</td>
                        <td className="p-4">{formatDate(item.StartDate)}</td>
                        <td className="p-4">{formatDate(item.EndDate)}</td>
                      </tr>
                    ))}
                    {analytics.unpaidLicenses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          All licenses have payment records.
                        </td>
                      </tr>
                    )}
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
