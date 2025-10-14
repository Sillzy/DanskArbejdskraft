//src/app/admin/documents/DeleteDocButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export function DeleteDocButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onDelete() {
    if (!confirm('Delete this file?')) return;
    try {
      setBusy(true);
      const fd = new FormData();
      fd.set('id', id);
      const res = await fetch('/api/admin/documents/delete', { method: 'POST', body: fd });
      if (res.ok) startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy || pending}
      className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-100 disabled:opacity-60"
      title="Delete"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {busy || pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
