//src/app/admin/documents/UploadDocForm.tsx

'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

export default function UploadDocForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!formRef.current) return;
    const fd = new FormData(formRef.current);

    // basic front-end check for required fields
    const file = fd.get('file') as File | null;
    const type = String(fd.get('type') || '').trim();
    if (!file || !type) {
      setMsg('Please select a type and choose a file.');
      return;
    }

    try {
      setBusy(true);
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok !== true) {
        setMsg('Upload failed. Please try again.');
        return;
      }

      // success — clear form and refresh list
      formRef.current.reset();
      setMsg('Uploaded successfully.');
      router.refresh();
      // optional: clear success after a short delay
      setTimeout(() => setMsg(null), 2500);
    } catch {
      setMsg('Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      encType="multipart/form-data"
      className="space-y-3"
      noValidate
    >
      {/* Honeypot */}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <label htmlFor="title" className="sr-only">Title</label>
        <input
          id="title"
          name="title"
          placeholder="File title (optional)"
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="type" className="sr-only">Type</label>
        <select
          id="type"
          name="type"
          required
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-200 focus:ring-2"
          defaultValue=""
        >
          <option value="" disabled>Select type</option>
          <option value="Contract">Contract</option>
          <option value="Payslip">Payslip</option>
          <option value="Invoice">Invoice</option>
          <option value="Policy">Policy</option>
          <option value="Procedure">Procedure</option>
          <option value="Template">Template</option>
          <option value="Report">Report</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="sr-only">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Short description so others understand the context..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="file" className="sr-only">File</label>
        <input
          id="file"
          name="file"
          type="file"
          required
          className="w-full rounded-lg border border-dashed border-slate-300 p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-slate-500">PDF, DOCX, XLSX, images, etc.</p>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60"
      >
        <Upload className="mr-2 h-4 w-4" />
        {busy ? 'Uploading…' : 'Upload'}
      </button>

      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </form>
  );
}
