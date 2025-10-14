'use client';

import * as React from 'react';
import Link from 'next/link';
import { supabase } from '@/../lib/supabaseClient';
import {
  Plus,
  Clock,
  FolderOpen,
  Trash2,
  ImageUp,
  Phone,
  Icon as LucideIcon,
} from 'lucide-react';

/* ---------------- Deterministic UTC date formatter (hydration-safe) ---------------- */
function fmtUTC(input: string | number | Date | null | undefined) {
  if (!input) return '—';
  const d = new Date(input);
  const opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  };
  return new Intl.DateTimeFormat('en-GB', opts).format(d);
}

/* --------------------------------------- Types -------------------------------------- */
type Workplace = {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileLite = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  birthday: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone_country: string | null;
  phone_number: string | null;
  profile_status?: 'under_review' | 'approved' | 'rejected' | null;
  status?: 'under_review' | 'approved' | 'rejected' | null;
};

type MonthEntry = { minutes: number; work_date: string };

type Props = {
  userId: string;
  profile: ProfileLite | null;
  workplaces: Workplace[];
  monthEntries?: MonthEntry[];
  lastEntryAt?: string | null;
};

/* ----------------------------------- Small helpers ---------------------------------- */
function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="flex items-center gap-2 font-medium">
        {icon} <span className="truncate max-w-[220px] text-right">{value}</span>
      </span>
    </div>
  );
}

function hhmm(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function startOfISOWeek(d: Date) {
  const tmp = new Date(d);
  const day = (tmp.getDay() + 6) % 7;
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() - day);
  return tmp;
}
function addDays(d: Date, days: number) {
  const t = new Date(d);
  t.setDate(t.getDate() + days);
  return t;
}
function rangeDays(start: Date, end: Date) {
  const out: Date[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
function getISOWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const dayDiff = (d.getTime() - firstThursday.getTime()) / 86400000;
  return 1 + Math.round(dayDiff / 7);
}

/** Big, tappable tile used in the Recent section */
function BigTile({
  href,
  onClick,
  icon: Icon,
  label,
  tone = 'neutral',
}: {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  tone?: 'primary' | 'neutral';
}) {
  const base =
    'w-full rounded-2xl px-6 py-16 flex items-center justify-center text-center border';
  const look =
    tone === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
      : 'bg-white text-slate-900 hover:bg-slate-50 border-slate-200';
  const text =
    tone === 'primary'
      ? 'text-3xl md:text-4xl font-extrabold'
      : 'text-3xl md:text-4xl font-bold';

  const Inner = (
    <div className={`${base} ${look}`}>
      <div className="flex flex-col items-center gap-4">
        <Icon className={tone === 'primary' ? 'h-12 w-12' : 'h-12 w-12 text-slate-800'} />
        <span className={text}>{label.toUpperCase()}</span>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full">
        {Inner}
      </button>
    );
  }
  return (
    <Link href={href ?? '#'} className="w-full">
      {Inner}
    </Link>
  );
}

/* ---------------------------- Register Time Modal (unchanged) ---------------------------- */
// (your RegisterTimeModal code from your message – unchanged)

/* ------------------------------ Photo Upload Modal (unchanged) --------------------------- */
// (your UploadPhotoModal code from your message – unchanged)

/* ------------------------------ Overtime calculations ---------------------------------- */
function splitOvertime(weekTotalMin: number) {
  const regularCap = 37 * 60;
  const after3Cap = 52 * 60;
  const regular = Math.min(weekTotalMin, regularCap);
  const remainder = Math.max(0, weekTotalMin - regularCap);
  const otFirst3 = Math.min(remainder, after3Cap - regularCap);
  const otAfter3 = Math.max(0, weekTotalMin - after3Cap);
  return { regular, otFirst3, otAfter3 };
}

/* ------------------------ Available workplaces (active) picker ----------------------- */
function AvailableWorkplacesGrid({
  disabled,
  already,
  onAdded,
}: {
  disabled?: boolean;
  already: Set<string>;
  onAdded: (id: string) => void;
}) {
  const [rows, setRows] = React.useState<
    Array<{ id: string; name: string; site_number: string | null; project_number: string | null }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from('workplaces')
      .select('id,name,site_number,project_number,is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    setLoading(false);
    if (error) {
      setErr(error.message);
      setRows([]);
      return;
    }
    const list = (data ?? []).filter((r: any) => !already.has(r.id));
    setRows(list as any);
  }, [already]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function add(id: string) {
    if (disabled) return;
    setAdding(id);
    const res = await fetch('/api/user-workplaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workplace_id: id }),
    });
    setAdding(null);

    if (!res.ok) {
      if (res.status === 409) {
        alert('Workplace already added');
        return;
      }
      let msg = 'Failed to add workplace.';
      try {
        const j = await res.json();
        if (j?.error) msg = j.error;
      } catch {}
      alert(msg);
      return;
    }

    // even if already existed, server returns 200; just refresh our list
    onAdded(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <p className="mt-3 text-sm text-slate-500">Loading…</p>;
  if (err) return <p className="mt-3 text-sm text-red-600">{err}</p>;
  if (rows.length === 0) return <p className="mt-3 text-sm text-slate-500">No active workplaces available.</p>;

  return (
    <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {rows.map((r) => {
        const label = [r.name, r.site_number, r.project_number].filter(Boolean).join(' • ');
        return (
          <li key={r.id}>
            <button
              type="button"
              disabled={disabled || adding === r.id}
              onClick={() => add(r.id)}
              className="w-full rounded-xl px-6 py-4 text-left disabled:opacity-60 bg-blue-600 text-white hover:bg-blue-700"
              title="Add workplace"
            >
              <span className="inline-flex items-center gap-2 text-lg font-bold">
                <Plus className="h-5 w-5" />
                ADD • {label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------ Component ------------------------------------- */
export default function DashboardClient({
  userId,
  profile,
  workplaces: initialWps,
  monthEntries = [],
}: Props) {
  const [wps, setWps] = React.useState<Workplace[]>(initialWps ?? []);

  // live profile-status state (init from server prop)
  const [profileStatus, setProfileStatus] = React.useState<'under_review' | 'approved' | 'rejected'>(
    (profile?.profile_status as any) ?? (profile?.status as any) ?? 'under_review'
  );

  // Fetch latest once on mount and subscribe to realtime updates
  React.useEffect(() => {
    let cancelled = false;

    async function fetchLatest() {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_status')
        .eq('user_id', userId)
        .single();

      if (!cancelled && !error && data?.profile_status) {
        setProfileStatus(data.profile_status as any);
      }
    }

    fetchLatest();

    const channel = supabase
      .channel(`profile_status_${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${userId}` },
        (payload) => {
          const next = (payload.new as any)?.profile_status;
          if (next) setProfileStatus(next);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // modal state
  const [regOpen, setRegOpen] = React.useState(false);
  const [regWpId, setRegWpId] = React.useState<string | null>(null);

  // upload modal state
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploadWpId, setUploadWpId] = React.useState<string | null>(null);

  // ---------------------- Fetch last ~45 days for weekly & calendar -------------------
  type RawEntry = { started_at: string; ended_at: string; break_minutes: number; workplace_id: string };
  const [recent, setRecent] = React.useState<RawEntry[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(true);

  const loadRecent = React.useCallback(async () => {
    setLoadingStats(true);
    const since = new Date();
    since.setDate(since.getDate() - 45);
    const { data, error } = await supabase
      .from('time_entries')
      .select('started_at,ended_at,break_minutes,workplace_id')
      .eq('user_id', userId)
      .gte('started_at', since.toISOString())
      .order('started_at', { ascending: true });

    if (!error && data) setRecent(data as RawEntry[]);
    setLoadingStats(false);
  }, [userId]);

  React.useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  // ---- Calendar navigation state (min: Sep 2025) ----
  const MIN_CAL_MONTH = new Date(2025, 8, 1);
  const NOW_MONTH = startOfMonth(new Date());

  const [calMonth, setCalMonth] = React.useState<Date>(startOfMonth(new Date()));
  const [perDayCal, setPerDayCal] = React.useState<Map<string, number>>(new Map());
  const [loadingCal, setLoadingCal] = React.useState(false);

  // Fetch entries only for the visible calendar month
  const loadCalendarMonth = React.useCallback(async (month: Date) => {
    setLoadingCal(true);

    const monthStartUTC = startOfMonth(new Date(month.getFullYear(), month.getMonth(), 1));
    const nextMonthStartUTC = startOfMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

    const { data, error } = await supabase
      .from('time_entries')
      .select('started_at, ended_at, break_minutes')
      .eq('user_id', userId)
      .gte('started_at', monthStartUTC.toISOString())
      .lt('started_at', nextMonthStartUTC.toISOString())
      .order('started_at', { ascending: true });

    const map = new Map<string, number>();
    if (!error && data) {
      for (const r of data as any[]) {
        const mins = Math.max(
          0,
          Math.round((new Date(r.ended_at).getTime() - new Date(r.started_at).getTime()) / 60000) -
            (r.break_minutes || 0)
        );
        const d = new Date(r.started_at);
        const key = ymd(d);
        map.set(key, (map.get(key) ?? 0) + mins);
      }
    }
    setPerDayCal(map);
    setLoadingCal(false);
  }, [userId]);

  React.useEffect(() => {
    loadCalendarMonth(calMonth);
  }, [calMonth, loadCalendarMonth]);

  function prevMonth() {
    if (calMonth <= MIN_CAL_MONTH) return;
    setCalMonth(startOfMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1)));
  }
  function nextMonth() {
    if (calMonth >= NOW_MONTH) return;
    setCalMonth(startOfMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1)));
  }

  // ----------------------------- “This month” from server prop ------------------------
  const totalMinMonthProp = monthEntries.reduce((sum, e) => sum + (e?.minutes ?? 0), 0);

  // ----------------------- Derive per-day minutes & week buckets ----------------------
  function workMinutesOfRow(sISO: string, eISO: string, breakMin: number) {
    const s = new Date(sISO).getTime();
    const e = new Date(eISO).getTime();
    return Math.max(0, Math.round((e - s) / 60000) - (breakMin || 0));
  }

  const perDay = React.useMemo(() => {
    const map = new Map<string, number>(); // YYYY-MM-DD → minutes
    for (const r of recent) {
      const d = new Date(r.started_at);
      const key = ymd(d);
      const mins = workMinutesOfRow(r.started_at, r.ended_at, r.break_minutes);
      map.set(key, (map.get(key) ?? 0) + mins);
    }
    return map;
  }, [recent]);

  const thisWeekMin = React.useMemo(() => {
    const start = startOfISOWeek(new Date());
    const end = addDays(start, 6);
    let total = 0;
    for (const day of rangeDays(start, end)) {
      total += perDay.get(ymd(day)) ?? 0;
    }
    return total;
  }, [perDay]);

  type WeekRow = {
    isoWeek: number;
    label: string;
    spanText: string;
    totalMin: number;
    weekendMin: number;
    otFirst3: number;
    otAfter3: number;
  };
  const weeks5: WeekRow[] = React.useMemo(() => {
    const rows: WeekRow[] = [];
    const startThis = startOfISOWeek(new Date());
    for (let i = 0; i < 5; i++) {
      const start = addDays(startThis, -7 * i);
      const end = addDays(start, 6);

      let total = 0;
      let weekend = 0;

      for (const day of rangeDays(start, end)) {
        const mins = perDay.get(ymd(day)) ?? 0;
        total += mins;
        const dow = day.getDay();
        if (dow === 0 || dow === 6) weekend += mins;
      }

      const { otFirst3, otAfter3 } = splitOvertime(total);
      const spanText = `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;

      rows.push({
        isoWeek: getISOWeek(start),
        label: `Week ${getISOWeek(start)}`,
        spanText,
        totalMin: total,
        weekendMin: weekend,
        otFirst3,
        otAfter3,
      });
    }
    return rows;
  }, [perDay]);

  // -------- unlink workplace (delete mapping only) --------
  async function deleteWorkplace(workplaceId: string, createdAtISO: string) {
    const canDelete = Date.now() - new Date(createdAtISO).getTime() < 24 * 60 * 60 * 1000;
    if (!canDelete) return;
    if (!confirm('Remove this workplace from your dashboard?')) return;

    const res = await fetch(`/api/user-workplaces?workplace_id=${encodeURIComponent(workplaceId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      let msg = 'Failed to remove workplace.';
      try {
        const j = await res.json();
        if (j?.error) msg = j.error;
      } catch {}
      alert(msg);
      return;
    }
    setWps((prev) => prev.filter((w) => w.id !== workplaceId));
  }

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  void monthStart; void monthEnd; // (kept for your previous calendar code)
  const newest = wps[0];

  return (
    <>
      {/* Register Time Modal */}
      {/* @ts-expect-error – provided above */}
      <RegisterTimeModal open={regOpen} onClose={(r?: boolean) => { setRegOpen(false); setRegWpId(null); if (r) loadRecent(); }} userId={userId} workplaceId={regWpId} />

      {/* Upload Photo Modal */}
      {/* @ts-expect-error – provided above */}
      <UploadPhotoModal open={uploadOpen} onClose={() => { setUploadOpen(false); setUploadWpId(null); }} workplaceId={uploadWpId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Profile + Stats + Calendar */}
        {/* (unchanged from your message) */}

        {/* RIGHT: Add / Recent / All */}
        <section className="lg:col-span-2 space-y-6">
          {/* Add workplace (only visible for approved) */}
          {profileStatus === 'approved' ? (
            <div className="rounded-2xl border bg-white p-5">
              <h2 className="text-lg font-semibold">Add workplace</h2>
              <p className="mt-1 text-sm text-slate-600">
                Tap a box to add it to your dashboard. Only workplaces marked <em>Active</em> by Admin are shown.
              </p>

              <AvailableWorkplacesGrid
                already={new Set(wps.map((w) => w.id))}
                onAdded={async (id) => {
                  const { data } = await supabase
                    .from('workplaces')
                    .select('id,user_id,name,address,company_name,created_at,updated_at')
                    .eq('id', id)
                    .single();
                  if (data) {
                    setWps((prev) => [data as any, ...prev.filter((p) => p.id !== id)]);
                  }
                }}
              />
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-5">
              <h2 className="text-lg font-semibold">Add workplace</h2>
              <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                You can add workplaces once your profile is <span className="font-semibold">approved</span>.
              </div>
            </div>
          )}

          {/* Recently visited / created */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-base font-semibold">Recently visited / created</h3>
            {newest ? (
              <div className="mt-3 rounded-xl border p-4">
                <div className="mb-4">
                  <div className="text-2xl font-semibold">{newest.name}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Created {fmtUTC(newest.created_at)} • Updated {fmtUTC(newest.updated_at)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-start">
                  <BigTile onClick={() => { setRegWpId(newest.id); setRegOpen(true); }} icon={Clock} label="Register Time" tone="primary" />
                  <BigTile onClick={() => { setUploadWpId(newest.id); setUploadOpen(true); }} icon={ImageUp} label="Upload Photo" tone="neutral" />
                  <div className="flex flex-col gap-3 w-full md:w-56">
                    <Link href={`/dashboard/workplaces/${newest.id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 h-14 text-base hover:bg-slate-50">
                      <FolderOpen className="h-5 w-5" /> Open Project
                    </Link>
                    {Date.now() - new Date(newest.created_at).getTime() < 24 * 60 * 60 * 1000 && (
                      <button
                        onClick={() => deleteWorkplace(newest.id, newest.created_at)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 h-14 text-base text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-500">No workplaces yet.</div>
            )}
          </div>

          {/* All workplaces */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-base font-semibold">All workplaces</h3>
            {wps.length === 0 ? (
              <div className="mt-3 text-sm text-slate-500">Nothing here yet. Create your first workplace above.</div>
            ) : (
              <ul className="mt-4 space-y-4">
                {wps.map((wp) => {
                  const canDelete = Date.now() - new Date(wp.created_at).getTime() < 24 * 60 * 60 * 1000;
                  return (
                    <li key={wp.id} className="rounded-2xl border p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xl font-semibold flex items-center gap-2">
                          <FolderOpen className="h-6 w-5 text-slate-700" />
                          <span className="truncate">{wp.name}</span>
                        </div>
                        {wp.address && <div className="mt-1 text-sm text-slate-600 line-clamp-2">{wp.address}</div>}
                        <div className="mt-2 text-xs text-slate-500">
                          Created: {fmtUTC(wp.created_at)} • Updated: {fmtUTC(wp.updated_at)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => { setRegWpId(wp.id); setRegOpen(true); }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-white text-lg font-bold hover:bg-blue-700"
                        >
                          <Clock className="h-5 w-5" /> REGISTER TIME
                        </button>

                        <button
                          onClick={() => { setUploadWpId(wp.id); setUploadOpen(true); }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-4 text-lg font-semibold hover:bg-slate-50"
                        >
                          <ImageUp className="h-5 w-5" /> Upload Photo
                        </button>

                        <Link
                          href={`/dashboard/workplaces/${wp.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-base font-medium hover:bg-slate-50"
                        >
                          <FolderOpen className="h-5 w-5" /> Open Project
                        </Link>

                        {canDelete && (
                          <button
                            onClick={() => deleteWorkplace(wp.id, wp.created_at)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-base text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-5 w-5" /> Delete
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
