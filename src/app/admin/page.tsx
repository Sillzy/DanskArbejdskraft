import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/../lib/supabase-server';
import EditWorkplaceFields from '@/../components/admin/EditWorkplaceFields';

/* ---------- UTC + ISO week helpers ---------- */
function startOfISOWeek(d: Date) {
  const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = dt.getUTCDay() || 7; // 1..7, Monday=1
  if (day !== 1) dt.setUTCDate(dt.getUTCDate() - (day - 1));
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}
function addDaysUTC(d: Date, days: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}
function formatISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
function getISOWeekNumber(d: Date) {
  const temp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

/* ---------- Overtime split (per week) ---------- */
function splitOvertime(minWeek: number) {
  const min37h = 37 * 60;
  const min52h = 52 * 60;
  const first3 = Math.max(0, Math.min(minWeek - min37h, (min52h - min37h)));
  const after3 = Math.max(0, minWeek - min52h);
  return { first3, after3 };
}
const h1 = (mins: number) => (mins / 60).toFixed(1);

export default async function AdminPage() {
  const supabase = await getServerSupabase();

  // Auth + admin
  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user;
  if (!me) redirect('/login?next=/admin');
  const { data: isAdmin } = await supabase.rpc('is_admin', { p_uid: me.id });
  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-semibold">Admin</h1>
        <p>You don’t have access to this page.</p>
      </main>
    );
  }

  // Cards: pending count
  const { count: pendingCount } = await supabase
    .from('profiles')
    .select('user_id', { count: 'exact', head: true })
    .eq('profile_status', 'under_review');

  // Approved workers
  const { data: workers = [] } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email, phone, bank_reg_no, bank_account_no, swift, iban, team_approved')
    .eq('team_approved', true)
    .order('first_name', { ascending: true });

  const approvedIds = (workers as any[]).map((w) => w.user_id as string);
  const hasWorkers = approvedIds.length > 0;

  // All workplaces (with editable business fields)
  const { data: workplaces = [] } = await supabase
    .from('workplaces')
    .select('id, name, company_name, company_cvr, invoice_email')
    .order('name', { ascending: true });

  const wpNameById = new Map<string, string>();
  (workplaces as any[]).forEach((w) => wpNameById.set(w.id, w.name));

  // Time windows
  // 8-week ISO window: current week + previous 7 weeks
  const mondayThisWeek = startOfISOWeek(new Date());
  const monday7wAgo = addDaysUTC(mondayThisWeek, -7 * 7);
  const rangeStart = monday7wAgo;
  const rangeEnd = addDaysUTC(mondayThisWeek, 7); // exclusive

  // Current month window (UTC)
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)); // exclusive

  // Build week labels (oldest → newest)
  const weeks: string[] = [];
  const weekStartDates: Date[] = [];
  for (let i = 7; i >= 0; i--) {
    const monday = addDaysUTC(mondayThisWeek, -7 * i);
    weeks.push(`W${getISOWeekNumber(monday)}`);
    weekStartDates.push(monday);
  }

  // Raw entries in 8-week window (approved users only)
  const { data: raw = [] } = hasWorkers
    ? await supabase
        .from('time_entries')
        .select('user_id, workplace_id, started_at, ended_at, break_minutes')
        .in('user_id', approvedIds)
        .gte('started_at', formatISO(rangeStart))
        .lt('started_at', formatISO(rangeEnd))
    : { data: [] as any[] };

  // Aggregations
  type WTotals = { sum: number; weekend: number; ot1: number; ot2: number };

  const perWpWeek: Record<string, Record<string, WTotals>> = {};
  const perUserWeek: Record<string, Record<string, WTotals>> = {};
  const workplacesByUser: Record<string, Set<string>> = {};
  const perUserMonthMin: Record<string, number> = {};

  for (const e of raw as any[]) {
    const s = new Date(e.started_at);
    const en = new Date(e.ended_at);
    const mins = Math.max(0, Math.round((en.getTime() - s.getTime()) / 60000) - (e.break_minutes || 0));
    if (mins <= 0) continue;

    const uid = e.user_id as string;
    const wid = (e.workplace_id as string) || null;

    // Month totals (current month only)
    if (s >= monthStart && s < monthEnd) {
      perUserMonthMin[uid] = (perUserMonthMin[uid] || 0) + mins;
    }

    // Which ISO week (by UTC date) within our 8-week window
    const dayUTC = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
    let label = '';
    for (let i = 0; i < weekStartDates.length; i++) {
      const start = weekStartDates[i];
      const end = addDaysUTC(start, 7);
      if (dayUTC >= start && dayUTC < end) {
        label = `W${getISOWeekNumber(start)}`;
        break;
      }
    }
    if (!label) continue;

    // Per workplace
    if (wid) {
      perWpWeek[wid] ||= {};
      perWpWeek[wid][label] ||= { sum: 0, weekend: 0, ot1: 0, ot2: 0 };
      perWpWeek[wid][label].sum += mins;
      const dow = s.getUTCDay();
      if (dow === 0 || dow === 6) perWpWeek[wid][label].weekend += mins;
    }

    // Per user (for worker table)
    perUserWeek[uid] ||= {};
    perUserWeek[uid][label] ||= { sum: 0, weekend: 0, ot1: 0, ot2: 0 };
    perUserWeek[uid][label].sum += mins;
    const dowU = s.getUTCDay();
    if (dowU === 0 || dowU === 6) perUserWeek[uid][label].weekend += mins;

    // Track workplaces per user (names)
    if (wid) {
      workplacesByUser[uid] ||= new Set<string>();
      const nm = wpNameById.get(wid);
      if (nm) workplacesByUser[uid].add(nm);
    }
  }

  // Compute OT splits (per week)
  for (const wid of Object.keys(perWpWeek)) {
    for (const lab of Object.keys(perWpWeek[wid])) {
      const t = perWpWeek[wid][lab];
      const { first3, after3 } = splitOvertime(t.sum);
      t.ot1 = first3;
      t.ot2 = after3;
    }
  }
  for (const uid of Object.keys(perUserWeek)) {
    for (const lab of Object.keys(perUserWeek[uid])) {
      const t = perUserWeek[uid][lab];
      const { first3, after3 } = splitOvertime(t.sum);
      t.ot1 = first3;
      t.ot2 = after3;
    }
  }

  // Active workplaces card
  const activeWorkplaceIds = new Set<string>();
  Object.keys(perWpWeek).forEach((wid) => activeWorkplaceIds.add(wid));

  return (
    <div className="px-4 md:px-8 py-8 space-y-8">
      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-600">Pending reviews</div>
          <div className="mt-1 flex items-end justify-between">
            <div className="text-3xl font-semibold">{pendingCount ?? 0}</div>
            <Link href="/admin/team" className="text-blue-600 underline" prefetch={false}>
              Review
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-600">
            Approved workers{' '}
            <Link href="/admin/team" className="text-blue-600 underline" prefetch={false}>
              List
            </Link>
          </div>
          <div className="mt-1 text-3xl font-semibold">{(workers as any[]).length}</div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-600">Active workplaces past 8 weeks</div>
          <div className="mt-1 text-3xl font-semibold">{activeWorkplaceIds.size}</div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/documents"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <div className="mr-2 h-4 w-4" />
          View Documents, Contracts, Payslips, Invoices
        </Link>
      </div>

      {/* ======================= Workplaces FIRST ======================= */}
      <section className="rounded-2xl border bg-white p-5 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">Workplaces</h2>
        <div className="mb-3 text-s text-slate-600">
          Each week cell shows:{' '}
          <span className="font-medium">Total</span> • <span className="font-medium">Weekend</span> •{' '}
          <span className="font-medium">Overtime First 3H</span> • <span className="font-medium">Overtime After 3H</span>
        </div>

        <table className="min-w-[1160px] w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2 pr-3">Workplace</th>
              <th className="py-2 pr-3">Company name</th>
              <th className="py-2 pr-3">CVR</th>
              <th className="py-2 pr-3">Invoice email</th>
              {weeks.map((w) => (
                <th key={w} className="py-2 px-2 text-center">
                  {w}
                </th>
              ))}
              <th className="py-2 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {(workplaces as any[]).map((wp) => {
              const wid = wp.id as string;
              const row = perWpWeek[wid] || {};
              return (
                <tr key={wid} className="border-t align-top">
                  {/* CHANGE: workplace name is now editable */}
                  <td className="py-2 pr-3 font-medium">
                    <EditWorkplaceFields
                      id={wid}
                      field="name"
                      value={wp.name ?? ''}
                      placeholder="Workplace name"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <EditWorkplaceFields
                      id={wid}
                      field="company_name"
                      value={wp.company_name ?? ''}
                      placeholder="Company A/S"
                    />
                  </td>
                  {/* CHANGE: CVR input visually 50% shorter via a max-width wrapper */}
                  <td className="py-2 pr-3">
                    <div className="max-w-[10rem]">
                      <EditWorkplaceFields
                        id={wid}
                        field="company_cvr"
                        value={wp.company_cvr ?? ''}
                        placeholder="CVR"
                      />
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    <EditWorkplaceFields
                      id={wid}
                      field="invoice_email"
                      value={wp.invoice_email ?? ''}
                      placeholder="billing@company.com"
                      type="email"
                    />
                  </td>

                  {weeks.map((lab) => {
                    const cell = row[lab];
                    if (!cell) {
                      return (
                        <td key={lab} className="py-2 px-2 text-center text-slate-400">
                          0 • 0 • 0 • 0
                        </td>
                      );
                    }
                    return (
                      <td key={lab} className="py-2 px-2 text-center">
                        <div className="inline-grid grid-cols-4 gap-1 text-[14px] leading-tight">
                          <span className="font-medium">{h1(cell.sum)}</span>
                          <span className="text-slate-600">{h1(cell.weekend)}</span>
                          <span className="text-slate-600">{h1(cell.ot1)}</span>
                          <span className="text-slate-600">{h1(cell.ot2)}</span>
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-2 px-2 text-center">
                    <Link
                      href={`/admin/workplaces/${wid}`}
                      prefetch={false}
                      className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                    >
                      Open project
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ======================= Workers summary (after Workplaces) ======================= */}
      <section className="rounded-2xl border bg-white p-5 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">Hours by worker</h2>
        <div className="mb-3 text-s text-slate-600">
          Each week cell shows: <span className="font-medium">Total</span> • <span className="font-medium">Weekend</span> •{' '}
          <span className="font-medium">Overtime First 3H</span> • <span className="font-medium">Overtime After 3H</span>
        </div>

        <table className="min-w-[980px] w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Workplace</th>
              {weeks.map((w) => (
                <th key={w} className="py-2 px-2 text-center">
                  {w}
                </th>
              ))}
              <th className="py-2 px-2 text-center">This Month Total</th>
              <th className="py-2 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {(workers as any[]).map((w) => {
              const uid = w.user_id as string;
              const row = perUserWeek[uid] || {};

              // Workplace names (unique) for that user during the 8-week window
              const wset = (workplacesByUser[uid] ?? new Set<string>());
              const workplaceJoined = Array.from(wset).join(',\n');

              // Current month total (already aggregated above)
              const monthTotal = perUserMonthMin[uid] || 0;

              return (
                <tr key={uid} className="border-t align-top">
                  <td className="py-2 pr-3 font-medium whitespace-pre-wrap">
                    {(w.first_name ?? '—') + ' ' + (w.last_name ?? '')}
                  </td>
                  <td className="py-2 pr-3 whitespace-pre-line">{workplaceJoined || '—'}</td>

                  {weeks.map((lab) => {
                    const cell = row[lab];
                    if (!cell) {
                      return (
                        <td key={lab} className="py-2 px-2 text-center text-slate-400">
                          0 • 0 • 0 • 0
                        </td>
                      );
                    }
                    return (
                      <td key={lab} className="py-2 px-2 text-center">
                        <div className="inline-grid grid-cols-4 gap-1 text-[14px] leading-tight">
                          <span className="font-medium">{h1(cell.sum)}</span>
                          <span className="text-slate-600">{h1(cell.weekend)}</span>
                          <span className="text-slate-600">{h1(cell.ot1)}</span>
                          <span className="text-slate-600">{h1(cell.ot2)}</span>
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-2 px-2 text-center font-semibold">{h1(monthTotal)}</td>

                  <td className="py-2 px-2 text-center">
                    <Link
                      href={`/admin/users/${uid}`}
                      prefetch={false}
                      className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                    >
                      Open worker
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
