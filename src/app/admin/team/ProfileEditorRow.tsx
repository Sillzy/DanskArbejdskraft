'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type Profile = {
  user_id: string;
  profile_status?: 'under_review' | 'approved' | 'rejected' | null;

  first_name?: string | null;
  last_name?: string | null;

  email?: string | null;
  phone_country?: string | null;
  phone_number?: string | null;

  team_title?: string | null;

  bank_reg_no?: string | null;
  bank_account_no?: string | null;
  swift?: string | null;
  iban?: string | null;

  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
};

function StatusPill({ s }: { s?: Profile['profile_status'] }) {
  const look =
    s === 'approved'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : s === 'rejected'
      ? 'bg-red-100 text-red-700 border-red-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-xs ${look}`}>
      {s ?? 'under_review'}
    </span>
  );
}

export default function ProfileEditorRow({
  profile,
  showStatusActions = true,
}: {
  profile: Profile;
  showStatusActions?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Local state (pre-filled)
  const [firstName, setFirstName] = React.useState(profile.first_name ?? '');
  const [lastName, setLastName] = React.useState(profile.last_name ?? '');
  const [teamTitle, setTeamTitle] = React.useState(profile.team_title ?? '');

  const [phoneCountry, setPhoneCountry] = React.useState(profile.phone_country ?? '');
  const [phoneNumber, setPhoneNumber] = React.useState(profile.phone_number ?? '');

  const [reg, setReg] = React.useState(profile.bank_reg_no ?? '');
  const [acc, setAcc] = React.useState(profile.bank_account_no ?? '');
  const [swift, setSwift] = React.useState(profile.swift ?? '');
  const [iban, setIban] = React.useState(profile.iban ?? '');

  const [address, setAddress] = React.useState(profile.address ?? '');
  const [city, setCity] = React.useState(profile.city ?? '');
  const [postal, setPostal] = React.useState(profile.postal_code ?? '');

  function updates() {
    const u: Record<string, any> = {};
    const set = (k: keyof Profile, v: string | null, cur?: string | null) => {
      if ((cur ?? '') !== (v ?? '')) u[k] = v;
    };

    set('first_name', firstName || null, profile.first_name ?? null);
    set('last_name', lastName || null, profile.last_name ?? null);
    set('team_title', teamTitle || null, profile.team_title ?? null);

    set('phone_country', phoneCountry || null, profile.phone_country ?? null);
    set('phone_number', phoneNumber || null, profile.phone_number ?? null);

    set('bank_reg_no', reg || null, profile.bank_reg_no ?? null);
    set('bank_account_no', acc || null, profile.bank_account_no ?? null);
    set('swift', swift || null, profile.swift ?? null);
    set('iban', iban || null, profile.iban ?? null);

    set('address', address || null, profile.address ?? null);
    set('city', city || null, profile.city ?? null);
    set('postal_code', postal || null, profile.postal_code ?? null);

    return u;
  }

  async function saveAll() {
    const u = updates();
    if (Object.keys(u).length === 0) {
      setErr('Nothing to save');
      setTimeout(() => setErr(null), 1500);
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: profile.user_id, updates: u }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed with ${res.status}`);
      }
      router.refresh();
    } catch (e: any) {
      setErr(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border p-3 md:p-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">
            {(firstName || profile.first_name || '—')}{' '}
            {(lastName || profile.last_name || '')}
          </div>
          <div className="mt-0.5 text-xs text-slate-600 truncate">
            {profile.email ?? ''}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill s={profile.profile_status} />
          {showStatusActions && (
            <>
              <form action={`/api/admin/profile-status?uid=${profile.user_id}&status=approved`} method="post">
                <button
                  type="submit"
                  className="rounded bg-emerald-600 px-3 py-1.5 text-white text-xs"
                >
                  Approve
                </button>
              </form>
              <form action={`/api/admin/profile-status?uid=${profile.user_id}&status=rejected`} method="post">
                <button
                  type="submit"
                  className="rounded bg-red-600 px-3 py-1.5 text-white text-xs"
                >
                  Reject
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Compact editor — always visible, small inputs, two columns */}
      <div className="mt-3 grid gap-2 sm:grid-cols-6">
        {/* Left column */}
        <label className="text-xs text-slate-600">
          <span className="mb-1 block">First name</span>
          <input
            className="w-full rounded border px-2 py-2 text-sm"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>

        <label className="text-xs text-slate-600">
          <span className="mb-1 block">Last name</span>
          <input
            className="w-full rounded border px-2 py-2 text-sm"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>

        <label className="text-xs text-slate-600">
          <span className="mb-1 block">Team title</span>
          <input
            className="w-full rounded border px-2 py-2 text-sm"
            value={teamTitle}
            onChange={(e) => setTeamTitle(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-[100px_1fr] gap-2">
          <label className="text-xs text-slate-600">
            <span className="mb-1 block">Phone country</span>
            <input
              className="w-full rounded border px-2 py-2 text-sm"
              value={phoneCountry}
              onChange={(e) => setPhoneCountry(e.target.value)}
              placeholder="+45"
            />
          </label>
          <label className="text-xs text-slate-600">
            <span className="mb-1 block">Phone number</span>
            <input
              className="w-full rounded border px-2 py-2 text-sm"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </label>
        </div>

        <label className="text-xs text-slate-600">
          <span className="mb-1 block">REG no.</span>
          <input
            className="w-full rounded border px-2 py-2 text-sm"
            value={reg}
            onChange={(e) => setReg(e.target.value)}
          />
        </label>

        <label className="text-xs text-slate-600">
          <span className="mb-1 block">ACCOUNT no.</span>
          <input
            className="w-full rounded border px-2 py-2 text-sm"
            value={acc}
            onChange={(e) => setAcc(e.target.value)}
          />
        </label>

        <label className="text-xs text-slate-600">
          <span className="mb-1 block">SWIFT/BIC</span>
          <input
            className="w-full rounded border px-2 py-2 text-sm"
            value={swift}
            onChange={(e) => setSwift(e.target.value)}
          />
        </label>

        <label className="text-xs text-slate-600">
          <span className="mb-1 block">IBAN</span>
          <input
            className="w-full rounded border px-2 py-2 text-sm"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
          />
        </label>

        <label className="text-xs text-slate-600 sm:col-span-2">
          <span className="mb-1 block">Address</span>
          <input
            className="w-full rounded border px-2 py-2 text-sm"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>

        <label className="text-xs text-slate-600">
          <span className="mb-1 block">City</span>
          <input
            className="w-full rounded border px-2 py-2 text-sm"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </label>

        <label className="text-xs text-slate-600">
          <span className="mb-1 block">Postal code</span>
          <input
            className="w-full rounded border px-2 py-2 text-sm"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {err ? <div className="text-xs text-red-600">{err}</div> : <span />}
        <button
          onClick={saveAll}
          disabled={saving}
          className="rounded bg-blue-600 px-3 py-2 text-white text-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save all'}
        </button>
      </div>
    </div>
  );
}
