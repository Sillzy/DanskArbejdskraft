// src/app/dashboard/onboarding/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/../lib/supabaseClient';

/** ---- One-line phone component ---- */
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
          <option value="+45">Denmark +45</option>
          <option value="+46">Sweden +46</option>
          <option value="+47">Norway +47</option>
          <option value="+49">Germany +49</option>
          <option value="+48">Poland +48</option>
          <option value="+370">Lithuania +370</option>
          <option value="+371">Latvia +371</option>
          <option value="+372">Estonia +372</option>
        </select>

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

/** ---------------- Types ---------------- */
type PersonForm = {
  first_name: string;
  last_name: string;
  birthday: string;
  phone_country: string;
  phone_number: string;
  address?: string;
  city?: string;
  postal_code?: string;
  bank_reg_no?: string;
  bank_account_no?: string;
  iban?: string;
  swift?: string;
};

type CompanyForm = {
  name: string;
  cvr: string;
  phone_country: string;
  phone_number: string;
  address?: string;
  city?: string;
  postal?: string;
  bank_reg_no?: string;
  bank_account_no?: string;
  iban?: string;
  swift?: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<'individual' | 'company'>('individual');

  const [p, setP] = useState<PersonForm>({
    first_name: '',
    last_name: '',
    birthday: '',
    phone_country: '+45',
    phone_number: '',
    address: '',
    city: '',
    postal_code: '',
    bank_reg_no: '',
    bank_account_no: '',
    iban: '',
    swift: '',
  });

  const [c, setC] = useState<CompanyForm>({
    name: '',
    cvr: '',
    phone_country: '+45',
    phone_number: '',
    address: '',
    city: '',
    postal: '',
    bank_reg_no: '',
    bank_account_no: '',
    iban: '',
    swift: '',
  });

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  // Must be logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login?next=/dashboard/onboarding');
      } else {
        setUserId(data.user.id);
      }
    });
    const preset = params.get('mode');
    if (preset === 'company') setMode('company');
  }, [router, params]);

  // NEW RULE: if first_name & last_name exist -> redirect to /dashboard
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'first_name,last_name,birthday,phone_country,phone_number,address,city,postal_code,bank_reg_no,bank_account_no,iban,swift'
        )
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (!error && data) {
        const hasFirst = String(data.first_name ?? '').trim().length > 0;
        const hasLast = String(data.last_name ?? '').trim().length > 0;

        if (hasFirst && hasLast) {
          router.replace('/dashboard');
          return; // stop, we’re navigating
        }

        // Not complete → prefill what we do have
        setP((prev) => ({
          ...prev,
          first_name: data.first_name ?? prev.first_name,
          last_name: data.last_name ?? prev.last_name,
          birthday: data.birthday ?? prev.birthday,
          phone_country: data.phone_country ?? prev.phone_country,
          phone_number: data.phone_number ?? prev.phone_number,
          address: data.address ?? prev.address,
          city: data.city ?? prev.city,
          postal_code: data.postal_code ?? prev.postal_code,
          bank_reg_no: data.bank_reg_no ?? prev.bank_reg_no,
          bank_account_no: data.bank_account_no ?? prev.bank_account_no,
          iban: data.iban ?? prev.iban,
          swift: data.swift ?? prev.swift,
        }));
      }

      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, router]);

  /** ---------- Save handlers ---------- */
  const saveIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!userId) return setErr('Please sign in.');
    if (!p.first_name || !p.last_name || !p.birthday) {
      return setErr('First name, Last name, and Birthdate are required.');
    }
    setSaving(true);

    const payload = {
      user_id: userId,
      first_name: p.first_name,
      last_name: p.last_name,
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
    };

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'user_id' });
    setSaving(false);

    if (error) return setErr(error.message || 'Could not save profile.');
    setMsg('Saved!');
    router.replace('/dashboard');
  };

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!userId) return setErr('Please sign in.');
    if (!c.name || !c.cvr) return setErr('Company name and CVR are required.');
    setSaving(true);

    const { error } = await supabase.from('workplaces').insert({
      user_id: userId,
      name: c.name,
      address: c.address || null,
      metadata: {
        cvr: c.cvr,
        phone_country: c.phone_country || null,
        phone_number: c.phone_number || null,
        city: c.city || null,
        postal: c.postal || null,
        bank_reg_no: c.bank_reg_no || null,
        bank_account_no: c.bank_account_no || null,
        iban: c.iban || null,
        swift: c.swift || null,
      },
    });

    setSaving(false);
    if (error) return setErr(error.message || 'Could not save company.');
    setMsg('Company saved!');
    router.replace('/dashboard');
  };

  if (checking) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-12 text-slate-600">
        Redirecting …
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-6 text-slate-900">Onboarding</h1>

        <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            className={`px-4 py-2 rounded-lg text-sm ${mode === 'individual' ? 'bg-blue-600 text-white' : 'text-slate-700'}`}
            onClick={() => setMode('individual')}
            type="button"
          >
            Individual
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm ${mode === 'company' ? 'bg-blue-600 text-white' : 'text-slate-700'}`}
            onClick={() => setMode('company')}
            type="button"
          >
            Company
          </button>
        </div>

        {err && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        {msg && <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}

        {mode === 'individual' ? (
          <form onSubmit={saveIndividual} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="First name *"
                value={p.first_name}
                onChange={(e) => setP({ ...p, first_name: e.target.value })}
                required
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="Last name *"
                value={p.last_name}
                onChange={(e) => setP({ ...p, last_name: e.target.value })}
                required
              />

              <label>
                <div className="mb-1 text-sm text-slate-700">Birthdate *</div>
                <input
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                  type="date"
                  value={p.birthday}
                  onChange={(e) => setP({ ...p, birthday: e.target.value })}
                  required
                />
              </label>

              <PhoneRow
                label="Phone"
                country={p.phone_country}
                number={p.phone_number}
                onCountry={(v) => setP({ ...p, phone_country: v })}
                onNumber={(v) => setP({ ...p, phone_number: v })}
              />

              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200 md:col-span-2"
                placeholder="Address"
                value={p.address}
                onChange={(e) => setP({ ...p, address: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="City"
                value={p.city}
                onChange={(e) => setP({ ...p, city: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="Postal code"
                value={p.postal_code}
                onChange={(e) => setP({ ...p, postal_code: e.target.value })}
              />

              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="REG no."
                value={p.bank_reg_no}
                onChange={(e) => setP({ ...p, bank_reg_no: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="ACCOUNT no."
                value={p.bank_account_no}
                onChange={(e) => setP({ ...p, bank_account_no: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="IBAN"
                value={p.iban}
                onChange={(e) => setP({ ...p, iban: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="SWIFT/BIC"
                value={p.swift}
                onChange={(e) => setP({ ...p, swift: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save information'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={saveCompany} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="Company name *"
                value={c.name}
                onChange={(e) => setC({ ...c, name: e.target.value })}
                required
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="CVR no. *"
                value={c.cvr}
                onChange={(e) => setC({ ...c, cvr: e.target.value })}
                required
              />

              <PhoneRow
                label="Company phone"
                country={c.phone_country}
                number={c.phone_number}
                onCountry={(v) => setC({ ...c, phone_country: v })}
                onNumber={(v) => setC({ ...c, phone_number: v })}
              />

              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200 md:col-span-2"
                placeholder="Address"
                value={c.address}
                onChange={(e) => setC({ ...c, address: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="City"
                value={c.city}
                onChange={(e) => setC({ ...c, city: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="Postal code"
                value={c.postal}
                onChange={(e) => setC({ ...c, postal: e.target.value })}
              />

              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="REG no."
                value={c.bank_reg_no}
                onChange={(e) => setC({ ...c, bank_reg_no: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="ACCOUNT no."
                value={c.bank_account_no}
                onChange={(e) => setC({ ...c, bank_account_no: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="IBAN"
                value={c.iban}
                onChange={(e) => setC({ ...c, iban: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 ring-blue-200"
                placeholder="SWIFT/BIC"
                value={c.swift}
                onChange={(e) => setC({ ...c, swift: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save information'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
