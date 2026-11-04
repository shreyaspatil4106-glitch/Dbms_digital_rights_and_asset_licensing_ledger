"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Field = {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
};

const definitions: Record<string, { title: string; id: string; fields: Field[] }> = {
  assets: {
    title: "Digital Assets",
    id: "AssetID",
    fields: [
      { name: "AssetID", label: "Asset ID", required: true },
      { name: "OwnerID", label: "Owner ID", required: true },
      { name: "Title", label: "Title", required: true },
      { name: "Type", label: "Type" },
      { name: "Description", label: "Description" },
      { name: "Format", label: "Format" },
      { name: "ReleaseDate", label: "Release Date", type: "date" },
      { name: "Status", label: "Status" },
    ],
  },
  owners: {
    title: "Owners",
    id: "OwnerID",
    fields: [
      { name: "OwnerID", label: "Owner ID", required: true },
      { name: "Name", label: "Name", required: true },
      { name: "Organization", label: "Organization" },
      { name: "Type", label: "Type" },
      { name: "ContactInfo", label: "Contact Information" },
    ],
  },
  licensees: {
    title: "Licensees",
    id: "LicenseeID",
    fields: [
      { name: "LicenseeID", label: "Licensee ID", required: true },
      { name: "Name", label: "Name", required: true },
      { name: "Organization", label: "Organization" },
      { name: "Type", label: "Type" },
      { name: "ContactInfo", label: "Contact Information" },
    ],
  },
  territories: {
    title: "Territories",
    id: "TerritoryID",
    fields: [
      { name: "TerritoryID", label: "Territory ID", required: true },
      { name: "Name", label: "Name", required: true },
      { name: "Region", label: "Region" },
      { name: "Country", label: "Country" },
      { name: "Description", label: "Description" },
    ],
  },
  rights: {
    title: "Usage Rights",
    id: "RightID",
    fields: [
      { name: "RightID", label: "Right ID", required: true },
      { name: "RightName", label: "Right Name", required: true },
      { name: "Description", label: "Description" },
      { name: "Category", label: "Category" },
    ],
  },
};

export default function AdminManagementPage() {
  const params = useParams();
  const router = useRouter();
  const entity = String(params.entity || "");
  const definition = definitions[entity];

  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  async function loadRecords() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/manage?entity=${encodeURIComponent(entity)}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to load records.");

      setRecords(data.records || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (definition) loadRecords();
  }, [entity]);

  if (!definition) {
    return <main className="min-h-screen bg-slate-950 p-8 text-white">Invalid management section.</main>;
  }

  function resetForm() {
    setForm({});
    setEditing(false);
  }

 function startEdit(record: Record<string, unknown>) {
  const next: Record<string, string> = {};

  for (const field of definition.fields) {
    const value = record[field.name];

    next[field.name] =
      value === null || value === undefined
        ? ""
        : field.type === "date"
          ? String(value).slice(0, 10)
          : String(value);
  }

  setForm(next);
  setEditing(true);
  setMessage("");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

  async function saveRecord(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/admin/manage", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, record: form }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Operation failed.");

      setMessage(data.message);
      resetForm();
      await loadRecords();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operation failed.");
    }
  }

  async function deleteRecord(id: unknown) {
    if (!window.confirm(`Delete record ${String(id)}? This cannot be undone.`)) return;

    setMessage("");

    try {
      const response = await fetch("/api/admin/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, id }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Delete failed.");

      setMessage(data.message);
      await loadRecords();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  const filtered = records.filter((record) =>
    Object.values(record).some((value) =>
      String(value ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.push("/admin")}
          className="mb-6 text-sm text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Admin Dashboard
        </button>

        <h1 className="text-3xl font-bold">{definition.title} Management</h1>
        <p className="mt-2 text-slate-400">Create, view, update and delete records.</p>

        {message && (
          <div className="mt-5 rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={saveRecord} className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-xl font-semibold">
            {editing ? "Update Record" : "Add New Record"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {definition.fields.map((field) => (
              <label key={field.name} className="text-sm text-slate-300">
                {field.label}
                <input
                  type={field.type || "text"}
                  required={field.required}
                  disabled={editing && field.name === definition.id}
                  value={form[field.name] || ""}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      [field.name]: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white disabled:opacity-50"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-lg bg-blue-600 px-5 py-2 font-medium hover:bg-blue-500">
              {editing ? "Save Changes" : "Create Record"}
            </button>

            {editing && (
              <button type="button" onClick={resetForm} className="rounded-lg border border-slate-700 px-5 py-2">
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Existing Records ({filtered.length})</h2>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search records..."
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm"
            />
          </div>

          {loading ? (
            <p className="mt-6 text-slate-400">Loading records...</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    {definition.fields.map((field) => (
                      <th key={field.name} className="px-3 py-3">{field.label}</th>
                    ))}
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr key={String(record[definition.id])} className="border-b border-slate-800">
                      {definition.fields.map((field) => (
                        <td key={field.name} className="max-w-xs px-3 py-3 text-slate-300">
                          {String(record[field.name] ?? "â€”")}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-3 py-3">
                        <button onClick={() => startEdit(record)} className="mr-3 text-blue-400">
                          Edit
                        </button>
                        <button onClick={() => deleteRecord(record[definition.id])} className="text-red-400">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={definition.fields.length + 1} className="px-3 py-8 text-center text-slate-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}