"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AccessLog {
  _id: string;
  eventId?: string;
  assetId?: string;
  licenseId?: string;
  licenseeId?: string;
  territoryId?: string;
  eventType?: string;
  result?: string;
  denialReason?: string | null;
  eventDate?: string;
  device?: string;
}

export default function AdminAccessLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        const response = await fetch("/api/admin/access-logs");
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Unable to load access logs.");

        setLogs(data.logs || []);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load access logs.");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  const filtered = logs.filter((log) =>
    Object.values(log).some((value) =>
      String(value ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
      <div className="mx-auto max-w-7xl">
        <button onClick={() => router.push("/admin")} className="mb-6 text-sm text-blue-400">
          &larr; Back to Admin Dashboard
        </button>

        <h1 className="text-3xl font-bold">Asset Access Logs</h1>
        <p className="mt-2 text-slate-400">Latest 200 access events stored in MongoDB.</p>

        {message && <p className="mt-5 rounded-lg border border-slate-700 bg-slate-900 p-4">{message}</p>}

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search access logs..."
          className="mt-6 w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />

        <section className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-5">
          {loading ? <p className="text-slate-400">Loading logs...</p> : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="p-3">Event ID</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3">License</th>
                  <th className="p-3">Licensee</th>
                  <th className="p-3">Territory</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log._id} className="border-b border-slate-800">
                    <td className="p-3">{log.eventId || "â€”"}</td>
                    <td className="p-3">{log.assetId || "â€”"}</td>
                    <td className="p-3">{log.licenseId || "â€”"}</td>
                    <td className="p-3">{log.licenseeId || "â€”"}</td>
                    <td className="p-3">{log.territoryId || "â€”"}</td>
                    <td className="p-3">{log.eventType || "-"}</td>
                    <td className={`p-3 ${log.result === "ALLOWED" ? "text-green-400" : "text-red-400"}`}>
                      {log.result || "â€”"}
                    </td>
                    <td className="p-3">{log.denialReason || "-"}</td>
                    <td className="whitespace-nowrap p-3">
                      {log.eventDate ? new Date(log.eventDate).toLocaleString() : "â€”"}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="p-6 text-center text-slate-500">No access logs found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}