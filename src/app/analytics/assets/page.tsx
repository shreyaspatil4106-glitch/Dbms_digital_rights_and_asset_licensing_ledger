
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Asset {
  AssetID: string;
  Title: string;
  Type: string;
  Description: string;
  Format: string;
  ReleaseDate: string;
  AssetStatus: string;
  OwnerID: string;
  OwnerName: string;
  Organization: string;
}

interface License {
  LicenseID: string;
  AssetID: string;
  LicenseeName: string;
  TerritoryName: string;
  Region: string;
  Country: string;
  StartDate: string;
  EndDate: string;
  LicenseType: string;
  Exclusivity: string;
  LicenseStatus: string;
  AutoRenew: number;
  Notes: string | null;
}

interface Right {
  LicenseID: string;
  RightID: string;
  RightName: string;
  Category: string;
  Description: string | null;
  Allowed: number;
  Restrictions: string | null;
}

interface Payment {
  PaymentID: string;
  LicenseID: string;
  Amount: string | number;
  Currency: string;
  PaymentStatus: string;
  PaymentDate: string;
  Method: string | null;
}

interface Revenue {
  AssetID: string;
  AssetTitle: string;
  Currency: string;
  TotalPaidRevenue: string | number;
  PaidPaymentCount: number;
}

interface Analytics {
  assets: Asset[];
  licenses: License[];
  rights: Right[];
  payments: Payment[];
  revenue: Revenue[];
}

export default function AssetLicensingPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics/assets");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load asset licensing details."
          );
        }

        setData(result.analytics);

        if (result.analytics.assets.length > 0) {
          setSelectedAsset(result.analytics.assets[0].AssetID);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Loading asset licensing details...
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="rounded-lg border border-red-800 bg-red-950 p-4 text-red-300">
          {error || "No data available."}
        </p>
      </main>
    );
  }

  const asset = data.assets.find(
    (item) => item.AssetID === selectedAsset
  );

  const licenses = data.licenses.filter(
    (item) => item.AssetID === selectedAsset
  );

  const assetLicenseIds = licenses.map((item) => item.LicenseID);

  const rights = data.rights.filter(
    (item) => assetLicenseIds.includes(item.LicenseID)
  );

  const payments = data.payments.filter(
    (item) => assetLicenseIds.includes(item.LicenseID)
  );

  const revenue = data.revenue.filter(
    (item) => item.AssetID === selectedAsset
  );

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Asset Licensing Details</h1>
          <p className="mt-2 text-slate-400">
            Complete licensing, rights and payment information for each asset.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
        >
          Back to Dashboard
        </Link>
      </div>

      <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <label className="mb-2 block text-sm text-slate-400">
          Select Digital Asset
        </label>

        <select
          value={selectedAsset}
          onChange={(event) => setSelectedAsset(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white sm:max-w-xl"
        >
          {data.assets.map((item) => (
            <option key={item.AssetID} value={item.AssetID}>
              {item.Title} ({item.AssetID})
            </option>
          ))}
        </select>
      </section>

      {asset && (
        <>
          <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Asset Information</h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-slate-400">Asset ID</p>
                <p className="mt-1 font-medium">{asset.AssetID}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Title</p>
                <p className="mt-1 font-medium">{asset.Title}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Type / Format</p>
                <p className="mt-1">{asset.Type} / {asset.Format}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Owner</p>
                <p className="mt-1">{asset.OwnerName}</p>
                <p className="text-xs text-slate-500">{asset.Organization}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Release Date</p>
                <p className="mt-1">{formatDate(asset.ReleaseDate)}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Asset Status</p>
                <p className="mt-1">{asset.AssetStatus}</p>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-400">{asset.Description}</p>
          </section>

          <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Total Licenses</p>
              <p className="mt-2 text-3xl font-bold">{licenses.length}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Rights Records</p>
              <p className="mt-2 text-3xl font-bold">{rights.length}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Payment Records</p>
              <p className="mt-2 text-3xl font-bold">{payments.length}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Revenue Currencies</p>
              <p className="mt-2 text-3xl font-bold">{revenue.length}</p>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">License Details</h2>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="p-4">License ID</th>
                    <th className="p-4">Licensee</th>
                    <th className="p-4">Territory</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">End Date</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Exclusivity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Auto Renew</th>
                  </tr>
                </thead>

                <tbody>
                  {licenses.map((item) => (
                    <tr key={item.LicenseID} className="border-t border-slate-800">
                      <td className="p-4 text-blue-300">{item.LicenseID}</td>
                      <td className="p-4">{item.LicenseeName}</td>
                      <td className="p-4">
                        {item.TerritoryName}
                        <p className="text-xs text-slate-500">
                          {item.Region}, {item.Country}
                        </p>
                      </td>
                      <td className="p-4">{formatDate(item.StartDate)}</td>
                      <td className="p-4">{formatDate(item.EndDate)}</td>
                      <td className="p-4">{item.LicenseType}</td>
                      <td className="p-4">{item.Exclusivity}</td>
                      <td className="p-4">{item.LicenseStatus}</td>
                      <td className="p-4">{item.AutoRenew ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {licenses.length === 0 && (
                <p className="p-6 text-center text-slate-400">
                  No licenses found for this asset.
                </p>
              )}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">Rights and Restrictions</h2>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="p-4">License ID</th>
                    <th className="p-4">Right</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Allowed</th>
                    <th className="p-4">Restrictions</th>
                  </tr>
                </thead>

                <tbody>
                  {rights.map((item, index) => (
                    <tr key={`${item.LicenseID}-${item.RightID}-${index}`} className="border-t border-slate-800">
                      <td className="p-4 text-blue-300">{item.LicenseID}</td>
                      <td className="p-4">
                        {item.RightName}
                        <p className="text-xs text-slate-500">{item.Description}</p>
                      </td>
                      <td className="p-4">{item.Category}</td>
                      <td className="p-4">
                        <span className={item.Allowed ? "text-emerald-300" : "text-red-300"}>
                          {item.Allowed ? "Allowed" : "Not Allowed"}
                        </span>
                      </td>
                      <td className="p-4">{item.Restrictions || "None specified"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {rights.length === 0 && (
                <p className="p-6 text-center text-slate-400">
                  No rights records found.
                </p>
              )}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">Payment History</h2>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="p-4">Payment ID</th>
                    <th className="p-4">License ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment Date</th>
                    <th className="p-4">Method</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((item) => (
                    <tr key={item.PaymentID} className="border-t border-slate-800">
                      <td className="p-4 text-blue-300">{item.PaymentID}</td>
                      <td className="p-4">{item.LicenseID}</td>
                      <td className="p-4">
                        {item.Currency} {Number(item.Amount).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4">{item.PaymentStatus}</td>
                      <td className="p-4">{formatDate(item.PaymentDate)}</td>
                      <td className="p-4">{item.Method || "Not specified"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {payments.length === 0 && (
                <p className="p-6 text-center text-slate-400">
                  No payment records found.
                </p>
              )}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">Paid Revenue Summary</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {revenue.map((item) => (
                <div key={item.Currency} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <p className="text-sm text-slate-400">{item.Currency} Revenue</p>
                  <p className="mt-2 text-2xl font-bold">
                    {item.Currency} {Number(item.TotalPaidRevenue).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {item.PaidPaymentCount} paid payment(s)
                  </p>
                </div>
              ))}

              {revenue.length === 0 && (
                <p className="text-slate-400">No paid revenue recorded for this asset.</p>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
