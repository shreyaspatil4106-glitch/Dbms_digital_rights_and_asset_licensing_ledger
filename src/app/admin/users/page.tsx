"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AppUser {
  UserID: number;
  Name: string;
  Email: string;
  Role: "ADMIN" | "LICENSE_MANAGER";
  Status: "ACTIVE" | "INACTIVE";
  CreatedAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "LICENSE_MANAGER" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load users.");
      setUsers(data.users || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create user.");

      setMessage(data.message);
      setForm({ name: "", email: "", password: "", role: "LICENSE_MANAGER" });
      await loadUsers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create user.");
    }
  }

  async function updateUser(user: AppUser) {
    const role = window.prompt("Enter role: ADMIN or LICENSE_MANAGER", user.Role);
    if (role === null) return;

    const status = window.prompt("Enter status: ACTIVE or INACTIVE", user.Status);
    if (status === null) return;

    const response = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.UserID, role: role.trim().toUpperCase(), status: status.trim().toUpperCase() }),
    });

    const data = await response.json();
    setMessage(data.message || "Update completed.");
    if (response.ok) await loadUsers();
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => router.push("/admin")} className="mb-6 text-sm text-blue-400">
          &larr; Back to Admin Dashboard
        </button>

        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-2 text-slate-400">Create users and manage application roles and status.</p>

        {message && <p className="mt-5 rounded-lg border border-slate-700 bg-slate-900 p-4">{message}</p>}

        <form onSubmit={createUser} className="mt-8 grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:grid-cols-2">
          <h2 className="text-xl font-semibold sm:col-span-2">Create Application User</h2>

          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-slate-700 bg-slate-950 p-3" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-slate-700 bg-slate-950 p-3" />
          <input required minLength={8} type="password" placeholder="Temporary password (minimum 8 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-lg border border-slate-700 bg-slate-950 p-3" />

          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
            <option value="LICENSE_MANAGER">LICENSE_MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500 sm:col-span-2">
            Create User
          </button>
        </form>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-xl font-semibold">Registered Users</h2>

          {loading ? <p className="text-slate-400">Loading users...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.UserID} className="border-b border-slate-800">
                      <td className="p-3">{user.UserID}</td>
                      <td className="p-3">{user.Name}</td>
                      <td className="p-3">{user.Email}</td>
                      <td className="p-3">{user.Role}</td>
                      <td className="p-3">{user.Status}</td>
                      <td className="p-3">
                        <button onClick={() => updateUser(user)} className="text-blue-400">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}