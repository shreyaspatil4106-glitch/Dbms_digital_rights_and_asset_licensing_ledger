"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DataTableProps {
  title: string;
  endpoint: string;
  columns: { key: string; label: string }[];
  searchKeys: string[];
}

export default function DataTable({
  title,
  endpoint,
  columns,
  searchKeys,
}: DataTableProps) {
  const router = useRouter();
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecords() {
      try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load records.");
        }

        setRecords(data.records);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [endpoint]);

  const filteredRecords = records.filter((record) =>
    searchKeys
      .map((key) => String(record[key] ?? ""))
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function displayValue(value: unknown) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.back()}
          className="mb-6 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold">{title}</h1>

        <p className="mt-2 text-slate-400">
          View and search records from the licensing ledger.
        </p>

        <input
          type="text"
          placeholder="Search records..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mt-8 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
        />

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          {loading ? (
            <p className="p-6 text-slate-400">Loading records...</p>
          ) : error ? (
            <p className="p-6 text-red-400">{error}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="whitespace-nowrap px-4 py-4">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr
                    key={String(record[columns[0].key] ?? index)}
                    className="border-t border-slate-800 hover:bg-slate-800/60"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="whitespace-nowrap px-4 py-4">
                        {displayValue(record[column.key])}
                      </td>
                    ))}
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Showing {filteredRecords.length} of {records.length} records
        </p>
      </div>
    </main>
  );
}
