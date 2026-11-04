
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  assets: number;
  licenses: number;
  renewals: number;
}

export default function ManagerDashboardClient() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    assets: 0,
    licenses: 0,
    renewals: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/manager/stats");
        const data = await response.json();

        if (response.ok && data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Unable to load dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const operations = [
    { title: "View Digital Assets", path: "/assets" },
    { title: "View Licensing Agreements", path: "/licenses" },
    { title: "Manage Renewals", path: "/renewals" },
    { title: "View Payment Records", path: "/payments" },
    { title: "View Violation Reports", path: "/violations" },
    { title: "Manage Operations", path: "/manager/operations" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">DRM Asset Ledger</h1>
          <p className="mt-1 text-sm text-slate-400">
            License Manager Dashboard
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="rounded-full bg-emerald-900/50 px-4 py-2 text-sm text-emerald-300">
            LICENSE MANAGER
          </span>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="p-8">
        <h2 className="text-2xl font-semibold">
          Welcome, License Manager!
        </h2>

        <p className="mt-2 text-slate-400">
          Monitor licensing agreements, renewals and payment information.
        </p>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Digital Assets",
              value: stats.assets,
              description: "Available registered assets",
            },
            {
              title: "Licensing Agreements",
              value: stats.licenses,
              description: "Total recorded licenses",
            },
            {
              title: "Renewal Records",
              value: stats.renewals,
              description: "Total recorded renewals",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-sm text-slate-400">{item.title}</p>
              <p className="mt-3 text-3xl font-bold">
                {loading ? "Loading..." : item.value}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h3 className="mb-5 text-xl font-semibold">
            Licensing Operations
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {operations.map((item) => (
              <button
                key={item.title}
                onClick={() => router.push(item.path)}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-emerald-500 hover:bg-slate-800"
              >
                <h4 className="font-medium">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-400">
                  Open {item.title.toLowerCase()}.
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
