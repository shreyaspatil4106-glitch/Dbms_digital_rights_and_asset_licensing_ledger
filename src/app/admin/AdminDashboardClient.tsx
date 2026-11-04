"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  assets: number;
  licenses: number;
  licensees: number;
  owners: number;
}

const sections = [
  { title: "Manage Assets", path: "/admin/manage/assets", description: "Create and maintain digital assets." },
  { title: "Manage Owners", path: "/admin/manage/owners", description: "Maintain asset owner records." },
  { title: "Manage Licensees", path: "/admin/manage/licensees", description: "Maintain licensee records." },
  { title: "Manage Territories", path: "/admin/manage/territories", description: "Manage licensing territories." },
  { title: "Manage Rights", path: "/admin/manage/rights", description: "Manage available usage rights." },
  { title: "Manage Users", path: "/admin/users", description: "Manage application users and roles." },
  { title: "License Monitoring", path: "/licenses", description: "Monitor licensing agreements." },
  { title: "Renewal Monitoring", path: "/renewals", description: "Monitor renewal records." },
  { title: "Payment Monitoring", path: "/payments", description: "Monitor payment records." },
  { title: "Violation Monitoring", path: "/violations", description: "Review reported violations." },
  { title: "Access Logs", path: "/admin/access-logs", description: "Monitor asset access activity." },
  { title: "Revenue Analytics", path: "/analytics/revenue", description: "View revenue by owner and licensee, including high-revenue analysis." },
  { title: "License Intelligence", path: "/analytics/licenses", description: "Analyze expiring licenses, exclusivity overlaps and payment gaps." },
  { title: "Asset Licensing Details", path: "/analytics/assets", description: "View asset licenses, rights, restrictions and payment history." },
  { title: "License Operations", path: "/manager/operations", description: "Open the licensing operations workspace." },
];

export default function AdminDashboardClient() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    assets: 0,
    licenses: 0,
    licensees: 0,
    owners: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats");
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">DRM Asset Ledger</h1>
          <p className="mt-1 text-sm text-slate-400">Administrator Dashboard</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="rounded-full bg-blue-900/50 px-4 py-2 text-sm text-blue-300">
            ADMIN
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
        <h2 className="text-2xl font-semibold">Welcome, Administrator!</h2>
        <p className="mt-2 text-slate-400">
          Manage master data, users and system-wide licensing activity.
        </p>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Digital Assets", value: stats.assets },
            { title: "Licenses", value: stats.licenses },
            { title: "Licensees", value: stats.licensees },
            { title: "Owners", value: stats.owners },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">{item.title}</p>
              <p className="mt-3 text-3xl font-bold">
                {loading ? "Loading..." : item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h3 className="mb-5 text-xl font-semibold">Administration</h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-blue-500 hover:bg-slate-800"
              >
                <h4 className="font-medium">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}