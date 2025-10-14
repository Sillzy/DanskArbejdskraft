'use client';

import * as React from 'react';

export default function CreateWorkplaceAdmin({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [projectName, setProjectName] = React.useState('');
  const [siteNumber, setSiteNumber] = React.useState('');
  const [projectNumber, setProjectNumber] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [cvr, setCvr] = React.useState('');
  const [invoiceEmail, setInvoiceEmail] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!projectName.trim() || !siteNumber.trim() || !projectNumber.trim()) {
      setErr('Project Name, Site Number and Project Number are required.');
      return;
    }

    setSaving(true);
    const res = await fetch('/api/admin/workplace/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: projectName.trim(),
        site_number: siteNumber.trim(),
        project_number: projectNumber.trim(),
        company_name: companyName.trim() || null,
        address: address.trim() || null,
        company_cvr: cvr.trim() || null,
        invoice_email: invoiceEmail.trim() || null,
        is_active: true,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j?.error || 'Failed to create workplace.');
      return;
    }

    // refresh the table
    if (onCreated) onCreated();
    else window.location.reload();
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="text-lg font-semibold">Create new workplace</h3>
      {err && (
        <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <input
          className="rounded-lg border p-3"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />
        <input
          className="rounded-lg border p-3"
          placeholder="Site Number"
          value={siteNumber}
          onChange={(e) => setSiteNumber(e.target.value)}
          required
        />
        <input
          className="rounded-lg border p-3"
          placeholder="Project Number"
          value={projectNumber}
          onChange={(e) => setProjectNumber(e.target.value)}
          required
        />

        <input
          className="rounded-lg border p-3"
          placeholder="Company name (optional)"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <input
          className="rounded-lg border p-3"
          placeholder="Full Address (optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <input
          className="rounded-lg border p-3"
          placeholder="CVR (optional)"
          value={cvr}
          onChange={(e) => setCvr(e.target.value)}
        />

        <input
          className="rounded-lg border p-3 lg:col-span-2"
          type="email"
          placeholder="Invoice email (optional)"
          value={invoiceEmail}
          onChange={(e) => setInvoiceEmail(e.target.value)}
        />

        <button
          type="submit"
          disabled={saving}
          className="lg:col-span-3 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-white text-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Creating…' : 'Create workplace'}
        </button>
      </form>
    </div>
  );
}
