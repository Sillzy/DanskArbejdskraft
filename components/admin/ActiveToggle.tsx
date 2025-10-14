'use client';

import * as React from 'react';

export default function ActiveToggle({
  id,
  value,
}: {
  id: string;
  value: boolean;
}) {
  const [on, setOn] = React.useState(!!value);
  const [saving, setSaving] = React.useState(false);

  async function toggle() {
    setSaving(true);
    const res = await fetch('/api/admin/workplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, field: 'is_active', value: !on }),
    });
    setSaving(false);
    if (res.ok) setOn((v) => !v);
    // on failure we silently keep current visual state (admins will try again)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ring-1 ${
        on
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-slate-50 text-slate-600 ring-slate-200'
      }`}
      title="Toggle active"
    >
      <span
        className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${
          on ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />
      {on ? 'Active' : 'Inactive'}
    </button>
  );
}
