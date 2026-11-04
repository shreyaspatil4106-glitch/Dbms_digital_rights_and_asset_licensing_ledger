"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-blue-500";
const buttonClass = "rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500";

export default function OperationsPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(endpoint: string, body: Record<string, unknown>) {
  setBusy(true);
  setMessage("");

  // Remove leading and trailing whitespace from all string values.
  const cleanedBody = Object.fromEntries(
    Object.entries(body).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value
    ])
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanedBody)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Operation failed.");
    }

    setMessage(data.message || "Operation completed successfully.");
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "Something went wrong.");
  } finally {
    setBusy(false);
  }
}

  function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-5 text-xl font-semibold">{title}</h2>
        {children}
      </section>
    );
  }

  function Field({ label, name, type = "text", required = true }: {
    label: string; name: string; type?: string; required?: boolean;
  }) {
    return (
      <label className="block text-sm text-slate-300">
        {label}
        <input name={name} type={type} required={required} className={`${inputClass} mt-2`} />
      </label>
    );
  }

function SelectField({
  label,
  name,
  options,
  required = true,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block text-sm text-slate-300">
      {label}
      <select
        name={name}
        required={required}
        className={`${inputClass} mt-2`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

  function FormGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <button onClick={() => router.push("/manager")} className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800">
          ← Manager Dashboard
        </button>

        <div>
          <h1 className="text-3xl font-bold">License Manager Operations</h1>
          <p className="mt-2 text-slate-400">Create, update and manage licensing operations.</p>
        </div>

        {message && (
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm">
            {message}
          </div>
        )}

       <FormSection title="1. Create or Update Licensing Agreement">
  <form
    className="space-y-4"
    onSubmit={(e) => {
      e.preventDefault();

      const f = new FormData(e.currentTarget);
      const action = f.get("action");
      const licenseId = String(f.get("licenseId") || "").trim();

      if (action === "delete") {
        if (!licenseId) {
          setMessage("Please enter a License ID to delete.");
          return;
        }

        if (!window.confirm(`Are you sure you want to delete license ${licenseId}?`)) {
          return;
        }

        submit("/api/licenses/manage", {
          action: "delete",
          licenseId,
        });

        return;
      }

      submit("/api/licenses/manage", {
        action,
        licenseId,
        assetId: f.get("assetId"),
        licenseeId: f.get("licenseeId"),
        territoryId: f.get("territoryId"),
        startDate: f.get("startDate"),
        endDate: f.get("endDate"),
        licenseType: f.get("licenseType"),
        exclusivity: f.get("exclusivity"),
        status: f.get("status"),
        notes: f.get("notes"),
        autoRenew: f.get("autoRenew") === "on",
      });
    }}
  >
            <FormGrid>
              <SelectField label="Action" name="action" options={["create", "update" , "delete"]} />
              <Field label="License ID (new ID when creating)" name="licenseId" />
              <Field label="Asset ID" name="assetId"  required={false}/>
              <Field label="Licensee ID" name="licenseeId"  required={false}/>
              <Field label="Territory ID" name="territoryId"  required={false}/>
              <Field label="Start Date" name="startDate" type="date"  required={false}/>
              <Field label="End Date" name="endDate" type="date"  required={false}/>
              <SelectField label="License Type" name="licenseType" options={["Exclusive", "Non-Exclusive"]}  required={false}/>
              <SelectField label="Exclusivity" name="exclusivity" options={["Exclusive", "Non-Exclusive"]}  required={false}/>
              <SelectField label="Status" name="status" options={["Active", "Pending", "Expired", "Suspended"]}  required={false}/>
              <Field label="Notes" name="notes" required={false} />
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" name="autoRenew" /> Enable auto renewal
              </label>
            </FormGrid>
            <button disabled={busy} className={buttonClass}>Save License</button>
          </form>
        </FormSection>

        <FormSection title="2. Renew a License">
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            submit("/api/renewals/manage", {
              renewalId: f.get("renewalId"),
              licenseId: f.get("licenseId"),
              newStartDate: f.get("newStartDate"),
              newEndDate: f.get("newEndDate"),
              status: f.get("status")
            });
          }}>
            <FormGrid>
              <Field label="New Renewal ID" name="renewalId" />
              <Field label="Existing License ID" name="licenseId" />
              <Field label="New Start Date" name="newStartDate" type="date" />
              <Field label="New End Date" name="newEndDate" type="date" />
              <SelectField label="Renewal Status" name="status" options={["Approved", "Pending"]} />
            </FormGrid>
            <button disabled={busy} className={buttonClass}>Process Renewal</button>
          </form>
        </FormSection>

        <FormSection title="3. Record a Payment">
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            submit("/api/payments/manage", {
              paymentId: f.get("paymentId"),
              licenseId: f.get("licenseId"),
              amount: f.get("amount"),
              currency: f.get("currency"),
              paymentStatus: f.get("paymentStatus"),
              paymentDate: f.get("paymentDate"),
              method: f.get("method")
            });
          }}>
            <FormGrid>
              <Field label="Payment ID" name="paymentId" />
              <Field label="License ID" name="licenseId" />
              <Field label="Amount" name="amount" type="number" />
              <Field label="Currency" name="currency" />
              <SelectField label="Payment Status" name="paymentStatus" options={["Paid", "Pending", "Failed"]} />
              <Field label="Payment Date" name="paymentDate" type="date" />
              <SelectField label="Payment Method" name="method" options={["Bank Transfer", "Credit Card", "UPI", "Other"]} />
            </FormGrid>
            <button disabled={busy} className={buttonClass}>Record Payment</button>
          </form>
        </FormSection>

        <FormSection title="4. Resolve a Violation Report">
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            submit("/api/violations/manage", {
              reportId: f.get("reportId"),
              remarks: f.get("remarks")
            });
          }}>
            <FormGrid>
              <Field label="Violation Report ID" name="reportId" />
              <Field label="Resolution Remarks" name="remarks" />
            </FormGrid>
            <button disabled={busy} className={buttonClass}>Resolve Violation</button>
          </form>
        </FormSection>

        <FormSection title="5. Simulate an Asset Access Attempt">
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            submit("/api/access/check", {
              assetId: f.get("assetId"),
              licenseId: f.get("licenseId"),
              licenseeId: f.get("licenseeId"),
              territoryId: f.get("territoryId"),
              eventType: f.get("eventType"),
              deviceType: f.get("deviceType"),
              operatingSystem: f.get("operatingSystem")
            });
          }}>
            <FormGrid>
              <Field label="Asset ID" name="assetId" />
              <Field label="License ID" name="licenseId" />
              <Field label="Licensee ID" name="licenseeId" />
              <Field label="Attempted Territory ID" name="territoryId" />
              <SelectField label="Access Type" name="eventType" options={["STREAM", "DOWNLOAD", "VIEW"]} />
              <Field label="Device Type" name="deviceType" required={false} />
              <Field label="Operating System" name="operatingSystem" required={false} />
            </FormGrid>
            <button disabled={busy} className={buttonClass}>Check Asset Access</button>
          </form>
        </FormSection>
      </div>
    </main>
  );
}
