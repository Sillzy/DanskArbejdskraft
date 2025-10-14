//components/admin/EditWorkplaceFields 
'use client';

import * as React from 'react';

type Props = {
  id: string;                 // workplace id
  field: 'name' | 'company_name' | 'company_cvr' | 'invoice_email';
  value: string;
  placeholder?: string;
  type?: 'text' | 'email';
  className?: string;         // lets admin/page.tsx make CVR narrower
};

export default function EditWorkplaceFields({
  id,
  field,
  value: initial,
  placeholder,
  type = 'text',
  className,
}: Props) {
  const [value, setValue] = React.useState(initial ?? '');
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => setValue(initial ?? ''), [initial]);

  async function save() {
    setErr(null);
    setOk(false);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/workplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Bad Request' }));
        throw new Error(error || `HTTP ${res.status}`);
      }
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || 'Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setOk(false), 1500);
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-md border px-2 py-1 text-sm"
      />
      <button
        onClick={save}
        disabled={saving}
        className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
        title="Save"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
      {ok && <span className="text-xs text-emerald-600">Saved</span>}
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
