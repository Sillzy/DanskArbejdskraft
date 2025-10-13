// src/app/admin/documents/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Upload, Download, Info } from 'lucide-react';

import { listDocuments, type AdminDocument } from '@/../lib/adminDocumentsStore';
import UploadDocForm from './UploadDocForm';        // <== colocated client component
import { DeleteDocButton } from './DeleteDocButton'; // <== colocated client component

export const metadata: Metadata = {
  title: 'Admin — Documents',
  description: 'Upload and view internal admin documents.',
};

export default async function Page() {
  const docs = listDocuments();

  const contracts = docs.filter((d) => d.type === 'Contract');
  const payslips = docs.filter((d) => d.type === 'Payslip');
  const invoices = docs.filter((d) => d.type === 'Invoice');
  const others = docs.filter((d) => !['Contract', 'Payslip', 'Invoice'].includes(d.type));

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">Admin — Documents</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">
            Upload internal files for the admin team. Title is optional — if blank, the file name
            will be used. Pick a type and add a short description so others can find it.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
        >
          Back to Admin
        </Link>
      </header>

      {/* Info strip */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
            <Info className="h-4 w-4 text-blue-700" />
          </span>
          <div className="text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Who can see this?</div>
            <div>All admins can view documents uploaded here.</div>
          </div>
        </div>
      </section>

      {/* Grid: Upload form + sections */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Upload form (client) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Upload a document</h2>
          </div>

          <UploadDocForm />
        </section>

        {/* Sections */}
        <div className="space-y-8">
          <DocSection title="Contracts" items={contracts} emptyLabel="No contracts uploaded yet." />
          <DocSection title="Payslips" items={payslips} emptyLabel="No payslips uploaded yet." />
          <DocSection title="Invoices" items={invoices} emptyLabel="No invoices uploaded yet." />
          <DocSection title="Documents" items={others} emptyLabel="No documents uploaded yet." />
        </div>
      </div>
    </main>
  );
}

/* ---------- Helpers (server-safe) ---------- */

function DocSection({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: AdminDocument[];
  emptyLabel: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-600">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {items.map((d) => (
            <li key={d.id} className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{d.title}</div>
                  <div className="mt-0.5 text-xs text-slate-600">
                    <span className="rounded bg-blue-50 px-2 py-0.5 ring-1 ring-blue-200">{d.type}</span>
                    <span className="ml-2">{new Date(d.createdAt).toLocaleString()}</span>
                  </div>
                  {d.description && (
                    <p className="mt-2 max-w-prose text-sm text-slate-700">{d.description}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={`/api/admin/documents/file/${d.id}`}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>

                  {/* Delete in-place (client button triggers API + refresh) */}
                  <DeleteDocButton id={d.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
