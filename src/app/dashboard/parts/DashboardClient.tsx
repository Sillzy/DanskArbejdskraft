//src/app/dashboard/parts/DashboardClient.tsx
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

  // use the actual DB column; keep `status` optional for older props
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
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
  const day = (tmp.getDay() + 6) % 7; // 0..6, Monday=0
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

/** ISO Week Number (1..53), local-date aware */
function getISOWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Mon=0..Sun=6
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

/* ---------------------------- Register Time Modal (mobile-safe) ---------------------------- */
function RegisterTimeModal({
  open,
  onClose,
  userId,
  workplaceId,
}: {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  userId: string;
  workplaceId: string | null;
}) {
  const today = React.useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [workDate, setWorkDate] = React.useState(today);
  const [start, setStart] = React.useState('07:00');
  const [end, setEnd] = React.useState('16:00');
  const [breakMin, setBreakMin] = React.useState(30);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const dateRef = React.useRef<HTMLInputElement>(null);
  const startRef = React.useRef<HTMLInputElement>(null);
  const endRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setWorkDate(today);
      setStart('07:00');
      setEnd('16:00');
      setBreakMin(30);
      setErr(null);
    }
  }, [open, today]);

  function openPicker(ref: React.RefObject<HTMLInputElement>) {
    const el = ref.current;
    if (!el) return;
    // @ts-expect-error showPicker is supported on modern iOS/Chrome
    if (typeof el.showPicker === 'function') el.showPicker();
    el.focus();
  }

  async function submit() {
    if (!workplaceId) return;
    setErr(null);

    const startLocal = new Date(`${workDate}T${start}`);
    const endLocal = new Date(`${workDate}T${end}`);

    if (!(endLocal > startLocal)) {
      setErr('End time must be after start time.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc('register_time_entry_replace_local', {
      p_user_id: userId,
      p_workplace_id: workplaceId,
      p_started_at: startLocal.toISOString(),
      p_ended_at: endLocal.toISOString(),
      p_break_minutes: breakMin,
      p_notes: null,
      p_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setSaving(false);

    if (error) {
      setErr(error.message);
      return;
    }
    onClose(true);
  }

  if (!open) return null;

  // Shared styles so inputs never overflow rounded boxes on iOS
  const fieldWrap =
    'rounded-2xl border p-4 sm:p-5 overflow-hidden cursor-pointer bg-white';
  const fieldInput =
    'w-full h-16 sm:h-20 rounded-xl border px-4 text-2xl text-center ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-200 ' +
    'appearance-none [-webkit-appearance:none] [-moz-appearance:textfield] ' +
    'bg-white';

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:m-auto md:h-fit md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-xl p-6 sm:p-8">
        <h3 className="text-2xl font-semibold">Register time</h3>

        {err && (
          <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-base text-red-700">
            {err}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5">
          {/* Date */}
          <div className={fieldWrap} onClick={() => openPicker(dateRef)}>
            <label className="block text-slate-600 text-base mb-2">Date</label>
            <input
              ref={dateRef}
              type="date"
              className={fieldInput}
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              readOnly
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className={fieldWrap} onClick={() => openPicker(startRef)}>
              <label className="block text-slate-600 text-base mb-2">
                Start time
              </label>
              <input
                ref={startRef}
                type="time"
                className={fieldInput}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                readOnly
              />
              <p className="mt-2 text-xs text-slate-500">
                Tap anywhere on this box to open the time wheel
              </p>
            </div>

            <div className={fieldWrap} onClick={() => openPicker(endRef)}>
              <label className="block text-slate-600 text-base mb-2">
                End time
              </label>
              <input
                ref={endRef}
                type="time"
                className={fieldInput}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                readOnly
              />
              <p className="mt-2 text-xs text-slate-500">
                Tap anywhere on this box to open the time wheel
              </p>
            </div>
          </div>

          {/* Break select */}
          <div className="rounded-2xl border p-4 sm:p-5 bg-white">
            <label className="block text-slate-600 text-base mb-2">
              Break (minutes)
            </label>
            <div className="relative">
              <select
                className={
                  'w-full h-16 rounded-xl border p-4 text-xl pr-10 ' +
                  'bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 ' +
                  'appearance-none [-webkit-appearance:none]'
                }
                value={breakMin}
                onChange={(e) => setBreakMin(parseInt(e.target.value, 10))}
              >
                {[0, 15, 30, 45, 60, 75, 90].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {/* chevron */}
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.5 7l4.5 4.5L14.5 7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-7 flex gap-4">
          <button
            className="flex-1 rounded-xl border px-5 py-4 text-lg hover:bg-slate-50"
            onClick={() => onClose()}
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-xl bg-blue-600 text-white px-5 py-4 text-lg hover:bg-blue-700 disabled:opacity-60"
            disabled={saving}
            onClick={submit}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Photo Upload Modal ---------------------------------- */
function UploadPhotoModal({
  open,
  onClose,
  workplaceId,
}: {
  open: boolean;
  onClose: (uploaded?: boolean) => void;
  workplaceId: string | null;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setErr(null);
      setUploading(false);
    }
  }, [open]);

  const isMobile = React.useMemo(
    () =>
      typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    []
  );

  async function doUpload() {
    setErr(null);
    if (!workplaceId) return;
    if (!file) {
      setErr('Please choose a photo.');
      return;
    }

    try {
      setUploading(true);
      const safeName = file.name.replace(/\s+/g, '_').replace(/[^\w.\-]/g, '');
      const filename = `${Date.now()}_${safeName || 'photo.jpg'}`;
      const path = `workplaces/${workplaceId}/${filename}`;

      const { error } = await supabase
        .storage
        .from('workplace-photos')
        .upload(path, file, {
          cacheControl: '3600',
          contentType: file.type || 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;
      onClose(true);
    } catch (e: any) {
      setErr(e?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:m-auto md:h-fit md:max-w-xl bg-white rounded-t-3xl md:rounded-3xl shadow-xl p-6 sm:p-8">
        <h3 className="text-2xl font-semibold">Upload photo</h3>

        {err && (
          <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-base text-red-700">
            {err}
          </div>
        )}

        <div className="mt-5">
          {/* Hidden real input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            {...(isMobile ? { capture: 'environment' as any } : {})}
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          >
            {file ? `Selected: ${file.name}` : 'Choose Photo'}
          </button>

        </div>

        <div className="mt-7 flex gap-3">
          <button
            className="flex-1 rounded-xl border px-5 py-3 text-base hover:bg-slate-50"
            onClick={() => onClose()}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-xl bg-blue-600 text-white px-5 py-3 text-base hover:bg-blue-700 disabled:opacity-60"
            onClick={doUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Overtime calculations ------------------------------ */
function splitOvertime(weekTotalMin: number) {
  const regularCap = 37 * 60; // 2220
  const after3Cap = 52 * 60;  // 3120

  const regular = Math.min(weekTotalMin, regularCap);
  const remainder = Math.max(0, weekTotalMin - regularCap);
  const otFirst3 = Math.min(remainder, after3Cap - regularCap); // up to 900
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
  const [rows, setRows] = React.useState<Array<{
    id: string;
    name: string;
    site_number: string | null;
    project_number: string | null;
  }>>([]);
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

  React.useEffect(() => { load(); }, [load]);

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
      const j = await res.json().catch(() => ({}));
      alert(j?.error || 'Failed to add workplace.');
      return;
    }
    onAdded(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <p className="mt-3 text-sm text-slate-500">Loading…</p>;
  if (err) return <p className="mt-3 text-sm text-red-600">{err}</p>;
  if (rows.length === 0) return <p className="mt-3 text-sm text-slate-500">No active workplaces available.</p>;

  return (
    <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {rows.map((r) => {
        const label = [r.name, r.site_number, r.project_number].filter(Boolean).join(' / ');
        return (
          <li key={r.id}>
            <button
              type="button"
              disabled={disabled || adding === r.id}
              onClick={() => add(r.id)}
              className="w-full rounded-xl border p-4 text-left hover:bg-slate-50 disabled:opacity-60"
              title="Add workplace"
            >
              <div className="text-sm text-slate-500">Add +</div>
              <div className="mt-1 text-base font-semibold">{label}</div>
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
  lastEntryAt,
}: Props) {
  const [wps, setWps] = React.useState<Workplace[]>(initialWps ?? []);

  // live profile-status state (init from server prop)
  const [profileStatus, setProfileStatus] = React.useState<
    'under_review' | 'approved' | 'rejected'
  >(
    (profile?.profile_status as any) ??
      (profile?.status as any) ??
      'under_review'
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
  const MIN_CAL_MONTH = new Date(2025, 8, 1); // 2025-09-01 (0-based month)
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

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = rangeDays(monthStart, monthEnd);

  function openRegister(wpId: string) {
    setRegWpId(wpId);
    setRegOpen(true);
  }

  function closeRegister(refresh?: boolean) {
    setRegOpen(false);
    setRegWpId(null);
    if (refresh) {
      loadRecent();
    }
  }

  function openUpload(wpId: string) {
    setUploadWpId(wpId);
    setUploadOpen(true);
  }

  const newest = wps[0];
  const totalMin = monthEntries.reduce((sum, e) => sum + (e?.minutes ?? 0), 0);

  return (
    <>
      {/* --------------- Register Time Modal --------------- */}
      <RegisterTimeModal
        open={regOpen}
        onClose={closeRegister}
        userId={userId}
        workplaceId={regWpId}
      />

      {/* --------------- Upload Photo Modal --------------- */}
      <UploadPhotoModal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setUploadWpId(null);
        }}
        workplaceId={uploadWpId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---------------- LEFT: Basic info + Overview ---------------- */}
        <div className="space-y-6">
          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Profile Information</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-800">
              <Row label="First name" value={profile?.first_name ?? '—'} />
              <Row label="Last name" value={profile?.last_name ?? '—'} />
              <Row
                label="Birthdate"
                value={
                  profile?.birthday
                    ? new Date(profile.birthday).toLocaleDateString('en-GB')
                    : '—'
                }
              />
              <Row label="Address" value={profile?.address ?? '—'} />
              <Row label="City" value={profile?.city ?? '—'} />
              <Row label="Post code" value={profile?.postal_code ?? '—'} />
              <Row
                label="Phone"
                value={
                  profile?.phone_country || profile?.phone_number
                    ? `${profile?.phone_country ?? ''} ${profile?.phone_number ?? ''}`.trim()
                    : '—'
                }
                icon={<Phone className="h-4 w-4 text-slate-500" />}
              />
            </div>

            <div className="mt-4">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
              >
                Edit Profile
              </Link>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              Profile status:{' '}
              <span className="font-medium">
                {profileStatus === 'approved'
                  ? 'approved'
                  : profileStatus === 'rejected'
                  ? 'rejected'
                  : 'Under Review'}
              </span>
            </div>
          </section>

          {/* Overview / Stats */}
          <section className="rounded-2xl border bg-white p-5">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-700" />
              <h2 className="text-lg font-semibold">Overview / Statistics</h2>
            </div>

            <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-center">
              <div className="text-sm text-slate-600">
                Week {getISOWeek(new Date())}
              </div>
              <div className="mt-1 text-3xl font-bold">
                {loadingStats ? '—' : hhmm(thisWeekMin)}
              </div>
            </div>

            <div className="mt-3 text-sm text-slate-800">
              This month:{' '}
              <span className="font-semibold">
                {Math.floor(totalMinMonthProp / 60)}h {totalMinMonthProp % 60}m
              </span>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold mb-2">Weekly totals (5 weeks)</div>
              <div className="space-y-2">
                {weeks5.map((w, idx) => (
                  <div key={idx} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {w.label}{' '}
                        <span className="text-slate-500">({w.spanText})</span>
                      </div>
                      <div className="text-sm font-semibold">{hhmm(w.totalMin)}</div>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-50 p-2 text-center">
                        <div className="text-slate-500">Total Hours</div>
                        <div className="font-semibold">{hhmm(w.totalMin)}</div>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-2 text-center">
                        <div className="text-slate-600">Weekend Hours</div>
                        <div className="font-semibold">{hhmm(w.weekendMin)}</div>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-2 text-center">
                        <div className="text-slate-600">OT First 3 Hours</div>
                        <div className="font-semibold">{hhmm(w.otFirst3)}</div>
                      </div>
                      <div className="rounded-lg bg-indigo-50 p-2 text-center">
                        <div className="text-slate-600">OT After 3 Hours</div>
                        <div className="font-semibold">{hhmm(w.otAfter3)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar (navigable) */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {calMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  {loadingCal ? <span className="ml-2 text-slate-500">· loading…</span> : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={prevMonth}
                    disabled={calMonth <= MIN_CAL_MONTH}
                    className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
                    title="Previous month"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    disabled={calMonth >= NOW_MONTH}
                    className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
                    title="Next month"
                  >
                    →
                  </button>
                </div>
              </div>

              {(() => {
                const calStart = startOfMonth(calMonth);
                const calEnd = endOfMonth(calMonth);
                const days = rangeDays(calStart, calEnd);

                return (
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((w) => (
                      <div key={w} className="text-xs text-slate-500">{w}</div>
                    ))}

                    {(() => {
                      const first = new Date(calStart);
                      const weekday = (first.getDay() + 6) % 7;
                      return Array.from({ length: weekday }).map((_, i) => (
                        <div key={`lead-${i}`} />
                      ));
                    })()}

                    {days.map((d) => {
                      const key = ymd(d);
                      const mins = perDayCal.get(key) ?? 0;
                      return (
                        <div
                          key={key}
                          className="rounded-lg border p-2 flex flex-col items-center justify-center"
                        >
                          <div className="text-sm font-medium">{d.getDate()}</div>
                          <div className="text-[11px] text-slate-600">{mins ? hhmm(mins) : ''}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </section>
        </div>

        {/* ---------------- RIGHT: Create + Recent + Stats + All ---------------- */}
        <section className="lg:col-span-2 space-y-6">
          {/* Create workplace */}
          <div className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Create new workplace</h2>
            {err && (
              <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            <form
              onSubmit={createWorkplace}
              className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3"
            >
              <input
                className="rounded-lg border p-3"
                placeholder="Project Name / Site Number / Address"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="rounded-lg border p-3"
                placeholder="Company name (optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <input
                className="rounded-lg border p-3 lg:col-span-3"
                placeholder="Full Address (optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <button
                type="submit"
                disabled={saving}
                className="lg:col-span-3 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-white text-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                <Plus className="h-5 w-5" />
                {saving ? 'Creating…' : 'Create workplace'}
              </button>
            </form>
          </div>

          {/* Recent workplace */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-base font-semibold">Recently visited / created</h3>
            {wps[0] ? (
              <div className="mt-3 rounded-xl border p-4">
                <div className="mb-4">
                  <div className="text-2xl font-semibold">{wps[0].name}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Created {fmtUTC(wps[0].created_at)} • Updated {fmtUTC(wps[0].updated_at)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-start">
                  <BigTile
                    onClick={() => openRegister(wps[0].id)}
                    icon={Clock}
                    label="Register Time"
                    tone="primary"
                  />
                  {profileStatus === 'approved' && (
                    <BigTile
                      onClick={() => openUpload(wps[0].id)}
                      icon={ImageUp}
                      label="Upload Photo"
                      tone="neutral"
                    />
                  )}

                  <div className="flex flex-col gap-3 w-full md:w-56">
                    <Link
                      href={`/dashboard/workplaces/${wps[0].id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 h-14 text-base hover:bg-slate-50"
                    >
                      <FolderOpen className="h-5 w-5" />
                      Open Project
                    </Link>

                    {Date.now() - new Date(wps[0].created_at).getTime() <
                      24 * 60 * 60 * 1000 && (
                      <button
                        onClick={() =>
                          deleteWorkplace(wps[0].id, wps[0].created_at)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 h-14 text-base text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                        Delete
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
              <div className="mt-3 text-sm text-slate-500">
                Nothing here yet. Create your first workplace above.
              </div>
            ) : (
              <ul className="mt-4 space-y-4">
                {wps.map((wp) => {
                  const canDelete =
                    Date.now() - new Date(wp.created_at).getTime() <
                    24 * 60 * 60 * 1000;
                  return (
                    <li
                      key={wp.id}
                      className="rounded-2xl border p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-xl font-semibold flex items-center gap-2">
                          <FolderOpen className="h-6 w-5 text-slate-700" />
                          <span className="truncate">{wp.name}</span>
                        </div>
                        {wp.address && (
                          <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                            {wp.address}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-slate-500">
                          Created: {fmtUTC(wp.created_at)} • Updated: {fmtUTC(wp.updated_at)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => openRegister(wp.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-white text-lg font-bold hover:bg-blue-700"
                        >
                          <Clock className="h-20 w-5" />
                          REGISTER TIME
                        </button>

                        {profileStatus === 'approved' && (
                          <button
                            onClick={() => openUpload(wp.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-4 text-lg font-semibold hover:bg-slate-50"
                          >
                            <ImageUp className="h-20 w-5" />
                            Upload Photo
                          </button>
                        )}

                        <Link
                          href={`/dashboard/workplaces/${wp.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-base font-medium hover:bg-slate-50"
                        >
                          <FolderOpen className="h-5 w-5" />
                          Open Project
                        </Link>

                        {canDelete && (
                          <button
                            onClick={() => deleteWorkplace(wp.id, wp.created_at)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-base text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-5 w-5" />
                            Delete
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
