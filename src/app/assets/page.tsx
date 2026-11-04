"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Asset {
  AssetID: string;
  Title: string;
  Type: string;
  Description: string;
  Format: string;
  ReleaseDate: string;
  Status: string;
  OwnerName: string;
  OwnerOrganization: string;
}

export default function AssetsPage() {
  const router = useRouter();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await fetch("/api/assets");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load assets.");
        }

        setAssets(data.assets);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const searchText = search.toLowerCase();

    return (
      asset.Title.toLowerCase().includes(searchText) ||
      asset.AssetID.toLowerCase().includes(searchText) ||
      asset.Type.toLowerCase().includes(searchText) ||
      asset.OwnerName.toLowerCase().includes(searchText)
    );
  });

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Digital Assets</h1>
          <p className="mt-2 text-slate-400">
            View all registered digital assets and their ownership details.
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
        >
          Back to Dashboard
        </button>
      </div>

      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div>
          <p className="text-sm text-slate-400">Total Digital Assets</p>
          <p className="mt-1 text-3xl font-bold">
            {loading ? "..." : assets.length}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by title, ID, type or owner..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500 sm:max-w-md"
        />
      </section>

      {loading && (
        <p className="py-10 text-center text-slate-400">
          Loading digital assets...
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-800 bg-red-950 p-4 text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-slate-900 text-sm text-slate-400">
              <tr>
                <th className="px-5 py-4">Asset ID</th>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Format</th>
                <th className="px-5 py-4">Owner</th>
                <th className="px-5 py-4">Release Date</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.AssetID}
                  className="border-t border-slate-800 hover:bg-slate-900/70"
                >
                  <td className="px-5 py-4 text-sm text-blue-300">
                    {asset.AssetID}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium">{asset.Title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {asset.Description}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm">{asset.Type}</td>

                  <td className="px-5 py-4 text-sm">{asset.Format}</td>

                  <td className="px-5 py-4">
                    <p className="text-sm">{asset.OwnerName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {asset.OwnerOrganization}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {formatDate(asset.ReleaseDate)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-xs text-emerald-300">
                      {asset.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAssets.length === 0 && (
            <p className="p-8 text-center text-slate-400">
              No digital assets found.
            </p>
          )}
        </div>
      )}
    </main>
  );
}