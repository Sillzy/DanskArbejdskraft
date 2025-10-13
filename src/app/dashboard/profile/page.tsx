//src/app/dashboard/profile/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/../lib/supabaseClient';

type Profile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  birthday: string | null;
  phone_country: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  bank_reg_no: string | null;
  bank_account_no: string | null;
  iban: string | null;
  swift: string | null;
  avatar_url: string | null;
};

const COUNTRIES = [
  { label: 'Denmark +45', dial: '+45' },
  { label: 'Sweden +46', dial: '+46' },
  { label: 'Norway +47', dial: '+47' },
  { label: 'Germany +49', dial: '+49' },
  { label: 'Poland +48', dial: '+48' },
  { label: 'Lithuania +370', dial: '+370' },
  { label: 'Latvia +371', dial: '+371' },
  { label: 'Estonia +372', dial: '+372' },
] as const;

/** One-line phone row: visible dropdown with grey fill + chevron */
function PhoneRow(props: {
  label?: string;
  country: string;
  number: string;
  onCountry: (v: string) => void;
  onNumber: (v: string) => void;
}) {
  const { label, country, number, onCountry, onNumber } = props;
  return (
    <label className="block">
      {label && <div className="mb-1 text-sm text-slate-700">{label}</div>}
      <div className="relative flex">
        <select
          className="h-10 w-[11.5rem] shrink-0 rounded-l-lg border border-slate-300 border-r-0 bg-slate-100 px-3 pr-8 text-sm outline-none focus:ring-2 ring-blue-200 appearance-none"
          value={country}
          onChange={(e) => onCountry(e.target.value)}
        >
          {COUNTRIES.map((c) => (
            <option key={c.dial} value={c.dial}>
              {c.label}
            </option>
          ))}
        </select>

        {/* chevron indicator on the select */}
        <div className="pointer-events-none absolute left-[10.2rem] top-1/2 -translate-y-1/2 pr-2">
          <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" className="text-slate-500">
            <path fill="currentColor" d="M5.5 7l4.5 4.5L14.5 7z" />
          </svg>
        </div>

        <input
          className="h-10 w-full rounded-r-lg border border-slate-300 border-l-0 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
          inputMode="tel"
          placeholder="Phone number"
          value={number}
          onChange={(e) => onNumber(e.target.value.replace(/[^\d\s\-()+]/g, ''))}
        />
      </div>
    </label>
  );
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>(''); // auth email (read-only)
  const [p, setP] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login?next=/dashboard/profile');
        return;
      }
      setUserId(data.user.id);
      setEmail(data.user.email ?? '');

      const { data: profile } = await supabase
        .from('profiles')
        .select(
          'user_id,first_name,last_name,birthday,phone_country,phone_number,address,city,postal_code,bank_reg_no,bank_account_no,iban,swift,avatar_url'
        )
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from('profiles').insert({ user_id: data.user.id });
        setP({
          user_id: data.user.id,
          first_name: null,
          last_name: null,
          birthday: null,
          phone_country: '+45',
          phone_number: null,
          address: null,
          city: null,
          postal_code: null,
          bank_reg_no: null,
          bank_account_no: null,
          iban: null,
          swift: null,
          avatar_url: null,
        });
      } else {
        setP({
          ...profile,
          phone_country: profile.phone_country ?? '+45',
        });
      }
    });
  }, [router]);

  const publicAvatarUrl = useMemo(() => {
    if (!p?.avatar_url) return null;
    const { data } = supabase.storage.from('avatars').getPublicUrl(p.avatar_url);
    return data.publicUrl ?? null;
  }, [p?.avatar_url]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p || !userId) return;
    setSaving(true);
    setErr('');
    setMsg('');

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: p.first_name || null,
        last_name: p.last_name || null,
        birthday: p.birthday || null,
        phone_country: p.phone_country || null,
        phone_number: p.phone_number || null,
        address: p.address || null,
        city: p.city || null,
        postal_code: p.postal_code || null,
        bank_reg_no: p.bank_reg_no || null,
        bank_account_no: p.bank_account_no || null,
        iban: p.iban || null,
        swift: p.swift || null,
      })
      .eq('user_id', userId);

    setSaving(false);
    if (error) return setErr(error.message);
    setMsg('Profile saved!');
  };

  const onPickAvatar = async (file: File) => {
    if (!userId) return;
    const ext = file.name.split('.').pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) return setErr(uploadError.message);

    await supabase.from('profiles').update({ avatar_url: path }).eq('user_id', userId);
    setP((prev) => (prev ? { ...prev, avatar_url: path } : prev));
    setMsg('Profile image updated!');
  };

  if (!p) return null;

  return (
    <main className="min-h-[80vh] px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {publicAvatarUrl ? (
              <Image src={publicAvatarUrl} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-slate-400 text-sm">No photo</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              Upload profile image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickAvatar(f);
              }}
            />
          </div>
        </header>

        <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          {err && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
          {msg && <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}

          <h2 className="text-lg font-medium">Profile Setting</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auth email (read-only) */}
            <label className="md:col-span-2">
              <div className="mb-1 text-sm text-slate-700">Email (login)</div>
              <input
                className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700"
                value={email}
                readOnly
              />
            </label>

            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
              placeholder="First name"
              value={p.first_name ?? ''}
              onChange={(e) => setP({ ...p, first_name: e.target.value })}
            />
            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
              placeholder="Last name"
              value={p.last_name ?? ''}
              onChange={(e) => setP({ ...p, last_name: e.target.value })}
            />

            <label>
              <div className="mb-1 text-sm text-slate-700">Birthdate</div>
              <input
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                type="date"
                value={p.birthday ?? ''}
                onChange={(e) => setP({ ...p, birthday: e.target.value })}
              />
            </label>

            {/* ONE LINE phone field */}
            <PhoneRow
              label="Phone"
              country={p.phone_country ?? '+45'}
              number={p.phone_number ?? ''}
              onCountry={(v) => setP({ ...p, phone_country: v })}
              onNumber={(v) => setP({ ...p, phone_number: v })}
            />

            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200 md:col-span-2"
              placeholder="Address"
              value={p.address ?? ''}
              onChange={(e) => setP({ ...p, address: e.target.value })}
            />
            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
              placeholder="City"
              value={p.city ?? ''}
              onChange={(e) => setP({ ...p, city: e.target.value })}
            />
            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
              placeholder="Postal code"
              value={p.postal_code ?? ''}
              onChange={(e) => setP({ ...p, postal_code: e.target.value })}
            />

            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
              placeholder="REG no."
              value={p.bank_reg_no ?? ''}
              onChange={(e) => setP({ ...p, bank_reg_no: e.target.value })}
            />
            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
              placeholder="ACCOUNT no."
              value={p.bank_account_no ?? ''}
              onChange={(e) => setP({ ...p, bank_account_no: e.target.value })}
            />
            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
              placeholder="IBAN"
              value={p.iban ?? ''}
              onChange={(e) => setP({ ...p, iban: e.target.value })}
            />
            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
              placeholder="SWIFT/BIC"
              value={p.swift ?? ''}
              onChange={(e) => setP({ ...p, swift: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
