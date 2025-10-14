// src/app/admin/workplaces/[id]/parts/AdminWorkplaceClient.tsx
'use client';

import * as React from 'react';
import { supabase } from '@/../lib/supabaseClient';
import { Trash2, FileDown } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/* ---------------- Config (reuse your bucket/path) ---------------- */
const BUCKET = 'workplace-photos';
const folderFor = (workplaceId: string) => `workplaces/${workplaceId}`;

/* ---------------- Date helpers (UTC/ISO week) ------------------- */
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function startOfISOWeek(d: Date) {
  const tmp = new Date(d);
  const day = (tmp.getDay() + 6) % 7; // Mon=0..Sun=6
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() - day);
  return tmp;
}
function addDays(d: Date, days: number) {
  const t = new Date(d);
  t.setDate(t.getDate() + days);
  return t;
}
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function ddmmyyyy(d: Date) {
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const y = d.getFullYear();
  return `${day}.${m}.${y}`;
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
  const day = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - day + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const dayDiff = (d.getTime() - firstThursday.getTime()) / 86400000;
  return 1 + Math.round(dayDiff / 7);
}
function sIsoYear(d: Date) {
  const wd = new Date(d);
  const day = (wd.getDay() + 6) % 7;
  wd.setDate(wd.getDate() - day + 3);
  return wd.getFullYear();
}
function hhmm(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}
function toHoursDecimal(mins: number) {
  return Math.round((mins / 60) * 100) / 100;
}

/* ---------------- Overtime split (per week total minutes) ------- */
function splitOvertime(weekTotalMin: number) {
  const regularCap = 37 * 60;   // 37h
  const after3Cap  = 52 * 60;   // 37h + 15h → "after first 3h/day" weekly cap
  const otFirst3   = Math.max(0, Math.min(weekTotalMin - regularCap, after3Cap - regularCap));
  const otAfter3   = Math.max(0, weekTotalMin - after3Cap);
  return { otFirst3, otAfter3 };
}

/* ---------------- Types ---------------- */
type TimeRow = {
  user_id: string;
  started_at: string;
  ended_at: string;
  break_minutes: number | null;
};
type UserLite = { user_id: string; first_name: string | null; last_name: string | null };
type Photo = { name: string; path: string; url: string };

/* ---------------- Component ---------------- */
export default function AdminWorkplaceClient({
  workplaceId,
  workplaceName,
}: { workplaceId: string; workplaceName: string }) {
  const [calMonth, setCalMonth] = React.useState<Date>(startOfMonth(new Date()));
  const MIN_CAL_MONTH = new Date(2025, 8, 1); // Sep 2025
  const NOW_MONTH = startOfMonth(new Date());

  const [rows, setRows] = React.useState<TimeRow[]>([]);
  const [usersMap, setUsersMap] = React.useState<Map<string, UserLite>>(new Map());
  const [perDay, setPerDay] = React.useState<Map<string, number>>(new Map());
  const [dayUsers, setDayUsers] = React.useState<{ day: string; list: Array<{ uid: string; name: string; mins: number }> } | null>(null);

  // photos
  const [photos, setPhotos] = React.useState<Photo[]>([]);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  /* ------- Load APPROVED users, then filter entries by those IDs ------- */
  React.useEffect(() => {
    (async () => {
      // 1) Approved profiles (names + ids)
      const { data: approved } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .eq('profile_status', 'approved');

      const map = new Map<string, UserLite>();
      const approvedIds: string[] = [];
      (approved ?? []).forEach((u) => {
        map.set(u.user_id, { user_id: u.user_id, first_name: u.first_name, last_name: u.last_name });
        approvedIds.push(u.user_id);
      });
      setUsersMap(map);

      // No approved workers? then no rows.
      if (approvedIds.length === 0) {
        setRows([]);
        return;
      }

      // 2) Time entries for THIS workplace by APPROVED users
      const since = new Date(2025, 8, 1); // 2025-09-01
      const { data: entries } = await supabase
        .from('time_entries')
        .select('user_id, started_at, ended_at, break_minutes')
        .eq('workplace_id', workplaceId)
        .in('user_id', approvedIds)
        .gte('started_at', since.toISOString())
        .order('started_at', { ascending: true });

      setRows((entries ?? []) as TimeRow[]);
    })();
  }, [workplaceId]);

  /* ------- Month totals for calendar ------- */
  const recomputeMonth = React.useCallback(() => {
    const monthStart = startOfMonth(calMonth);
    const monthEnd = endOfMonth(calMonth);
    const map = new Map<string, number>();
    for (const r of rows) {
      const s = new Date(r.started_at);
      if (s < monthStart || s > monthEnd) continue;
      const e = new Date(r.ended_at);
      const mins = Math.max(0, Math.round((e.getTime() - s.getTime()) / 60000) - (r.break_minutes || 0));
      const key = ymd(s);
      map.set(key, (map.get(key) ?? 0) + mins);
    }
    setPerDay(map);
  }, [rows, calMonth]);

  React.useEffect(() => { recomputeMonth(); }, [recomputeMonth]);

  function prevMonth() { if (calMonth > MIN_CAL_MONTH) setCalMonth(startOfMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))); }
  function nextMonth() { if (calMonth < NOW_MONTH) setCalMonth(startOfMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))); }

  /* ------- Day click ------- */
  function onDayClick(day: Date) {
    const key = ymd(day);
    const byUser = new Map<string, number>();
    for (const r of rows) {
      const s = new Date(r.started_at);
      if (ymd(s) !== key) continue;
      const e = new Date(r.ended_at);
      const mins = Math.max(0, Math.round((e.getTime() - s.getTime()) / 60000) - (r.break_minutes || 0));
      if (mins <= 0) continue;
      byUser.set(r.user_id, (byUser.get(r.user_id) ?? 0) + mins);
    }
    const list = Array.from(byUser.entries()).map(([uid, mins]) => {
      const u = usersMap.get(uid);
      const name = u ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || uid : uid;
      return { uid, name, mins };
    }).sort((a, b) => b.mins - a.mins);
    setDayUsers({ day: key, list });
  }

  /* ------- Weeks W36-2025 → now (with OT) ------- */
  const weekRows = React.useMemo(() => {
    const start = startOfISOWeek(new Date(2025, 8, 1));
    const end = startOfISOWeek(new Date());
    const lines: Array<{
      label: string; spanText: string; weekStart: Date;
      totalMin: number; weekendMin: number; otFirst3: number; otAfter3: number;
    }> = [];

    for (let cur = new Date(start); cur <= end; cur = addDays(cur, 7)) {
      const weekStart = new Date(cur);
      const weekEnd = addDays(weekStart, 7);

      let total = 0, weekend = 0;
      for (const r of rows) {
        const s = new Date(r.started_at);
        if (s < weekStart || s >= weekEnd) continue;
        const e = new Date(r.ended_at);
        const mins = Math.max(0, Math.round((e.getTime() - s.getTime()) / 60000) - (r.break_minutes || 0));
        total += mins;
        const dow = s.getDay();
        if (dow === 0 || dow === 6) weekend += mins;
      }
      const { otFirst3, otAfter3 } = splitOvertime(total);
      const label = `${sIsoYear(weekStart)}W${String(getISOWeek(weekStart)).padStart(2, '0')}`;
      const spanText = `${weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${addDays(weekStart, 6).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;

      lines.push({ label, spanText, weekStart, totalMin: total, weekendMin: weekend, otFirst3, otAfter3 });
    }
    return lines.reverse();
  }, [rows]);

  /* ------- Photos (list & delete) ------- */
  const loadPhotos = React.useCallback(async () => {
    const folder = folderFor(workplaceId);
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
      limit: 200, offset: 0, sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error || !data?.length) { setPhotos([]); return; }
    const paths = data.map(f => `${folder}/${f.name}`);
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
    const list: Photo[] = (signed ?? []).map((s, i) => ({ name: data[i].name, path: paths[i], url: s.signedUrl }));
    setPhotos(list);
  }, [workplaceId]);

  React.useEffect(() => { loadPhotos(); }, [loadPhotos]);

  async function deletePhoto(path: string) {
    if (!confirm('Delete this photo?')) return;
    try {
      setDeleting(path);
      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) throw error;
      await loadPhotos();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete photo.');
    } finally {
      setDeleting(null);
    }
  }

  /* =================== LANDSCAPE “EXCEL-LIKE” PDF (Danish labels) =================== */

  // A4 Landscape points (width x height)
  const A4_LANDSCAPE: [number, number] = [841.89, 595.28];
  const MARGIN = 32;                       // outer margin
  const GRID_TOP = A4_LANDSCAPE[1] - 200;  // where the table starts
  const ROW_H = 26;                        // table row height
  const BORDER = rgb(0.65, 0.67, 0.7);     // light grid color
  const TEXT = rgb(0, 0, 0);

  // Column layout
  const COLS = [
    { key: 'date',  label: 'Dato',        w: 92 },
    { key: 'day',   label: 'Dag',         w: 112 },
    { key: 'start', label: 'Start',       w: 70 },
    { key: 'end',   label: 'Slut',        w: 70 },
    { key: 'break', label: 'Pause (min)', w: 92 },
    { key: 'hours', label: 'Timer',       w: 78 },
    { key: 'notes', label: 'Noter',       w: 280 },
  ] as const;

  function weekdayName(i: number) {
    return ['Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag','Søndag'][i];
  }

  function entriesForUserWeek(uid: string, weekStart: Date) {
    const weekEnd = addDays(weekStart, 7);
    return rows.filter(r => {
      if (r.user_id !== uid) return false;
      const s = new Date(r.started_at);
      return s >= weekStart && s < weekEnd;
    });
  }

  async function buildPdfForUser(opts: {
    user: UserLite;
    weekStart: Date;
    entries: TimeRow[];
    company?: string;
    siteNo?: string;
    address?: string;
  }) {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage(A4_LANDSCAPE);
    const { width, height } = page.getSize();

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const drawText = (t: string, x: number, y: number, size = 10, bold = false) =>
      page.drawText(t, { x, y, size, font: bold ? fontBold : font, color: TEXT });

    const drawCell = (x: number, y: number, w: number, h: number) => {
      page.drawRectangle({ x, y, width: w, height: h, borderColor: BORDER, borderWidth: 0.6, color: undefined });
    };

    const left = MARGIN;
    const right = width - MARGIN;

    const first = (opts.user.first_name ?? '').trim();
    const last = (opts.user.last_name ?? '').trim();
    const fullName = `${first} ${last}`.trim() || opts.user.user_id;
    const isoYear = sIsoYear(opts.weekStart);
    const isoW = String(getISOWeek(opts.weekStart)).padStart(2, '0');

    // Header (Danish)
    const titleY = height - MARGIN - 6;
    drawText('DANSK ARBEJDSKRAFT - UGENTLIG TIMESEDDEL', left, titleY, 16, true);

    const hdrY = height - MARGIN - 36;
    const colW = (right - left) / 2 - 8;

    // Left column
    drawText('Fulde navn', left, hdrY, 10, true);
    drawText(fullName, left, hdrY - 14);
    drawText('Virksomhedsnavn', left, hdrY - 32, 10, true);
    drawText(opts.company || '', left, hdrY - 46);
    drawText('Site / Adresse', left, hdrY - 64, 10, true);
    drawText([opts.siteNo, opts.address].filter(Boolean).join(' • '), left, hdrY - 78);

    // Right column
    drawText('Projekt / Arbejdsplads', left + colW + 16, hdrY, 10, true);
    drawText(workplaceName || '', left + colW + 16, hdrY - 14);
    drawText('Uge', left + colW + 16, hdrY - 32, 10, true);
    drawText(`${isoYear}W${isoW}`, left + colW + 16, hdrY - 46);

    // Table header
    const tableTop = GRID_TOP;
    let xCursor = left;
    COLS.forEach(c => {
      drawCell(xCursor, tableTop, c.w, ROW_H);
      drawText(c.label, xCursor + 6, tableTop + 7, 10, true);
      xCursor += c.w;
    });

    // Day rows
    const byDay = Array.from({ length: 7 }, (_, i) => {
      const dayStart = addDays(opts.weekStart, i);
      const key = ymd(dayStart);
      const dayRows = opts.entries.filter(r => ymd(new Date(r.started_at)) === key);

      if (dayRows.length === 0) {
        return { date: ddmmyyyy(dayStart), start: '', end: '', breakMin: 0, mins: 0, notes: '' };
      }

      let start = Number.POSITIVE_INFINITY;
      let end = Number.NEGATIVE_INFINITY;
      let breakMin = 0;
      let mins = 0;
      for (const r of dayRows) {
        const s = new Date(r.started_at).getTime();
        const e = new Date(r.ended_at).getTime();
        if (s < start) start = s;
        if (e > end) end = e;
        const b = r.break_minutes || 0;
        breakMin += b;
        mins += Math.max(0, Math.round((e - s) / 60000) - b);
      }
      const fmt = (t: number) => {
        const d = new Date(t);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      };
      return {
        date: ddmmyyyy(dayStart),
        start: isFinite(start) ? fmt(start) : '',
        end: isFinite(end) ? fmt(end) : '',
        breakMin,
        mins,
        notes: '',
      };
    });

    // Render rows
    let totalMins = 0;
    byDay.forEach((row, i) => {
      const y = tableTop - ROW_H * (i + 1);
      xCursor = left;

      const cells = [
        row.date,
        ['Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag','Søndag'][i],
        row.start,
        row.end,
        row.breakMin ? String(row.breakMin) : '',
        row.mins ? String(toHoursDecimal(row.mins)) : '',
        row.notes,
      ];

      COLS.forEach((c, idx) => {
        drawCell(xCursor, y, c.w, ROW_H);
        const pad = 6;
        const isNum = idx === 4 || idx === 5;
        let tx = xCursor + pad;
        if (isNum && cells[idx]) {
          const tw = font.widthOfTextAtSize(cells[idx], 10);
          tx = xCursor + c.w - pad - tw;
        }
        drawText(cells[idx], tx, y + 7);
        xCursor += c.w;
      });

      totalMins += row.mins;
    });

    // Totals row (Danish)
    const totalY = tableTop - ROW_H * (7 + 1);
    xCursor = left;
    COLS.forEach((c, idx) => {
      drawCell(xCursor, totalY, c.w, ROW_H);
      if (idx === 0) drawText('I alt timer', xCursor + 6, totalY + 7, 10, true);
      if (idx === 5) {
        const txt = String(toHoursDecimal(totalMins));
        const tw = font.widthOfTextAtSize(txt, 10);
        drawText(txt, xCursor + c.w - 6 - tw, totalY + 7, 10, true);
      }
      xCursor += c.w;
    });

    // Signature block
    const sigY = MARGIN + 34;
    page.drawRectangle({ x: left, y: sigY, width: right - left, height: 64, borderColor: BORDER, borderWidth: 0.6 });

    drawText('Foremand Fulde navn:', left + 400, sigY + 90, 10, true);
    drawText(`${fullName} underskrift:`, left + 8, sigY + 40, 10, true);
    drawText('Foremand underskrift:', left + 400, sigY + 40, 10, true);

    const bytes = await pdf.save();
    const filename = `${fullName} - ${isoYear}W${isoW}.pdf`;
    return { filename, bytes };
  }

  function downloadBytes(filename: string, bytes: Uint8Array) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Week selector state
  const [selectedWeekIdx, setSelectedWeekIdx] = React.useState<number>(0);
  React.useEffect(() => { setSelectedWeekIdx(0); }, [weekRows.length]);

  // Workers with hours for selected week
  const workerListForWeek = React.useMemo(() => {
    if (weekRows.length === 0) return [];
    const ws = weekRows[selectedWeekIdx]?.weekStart;
    if (!ws) return [];
    const weekEnd = addDays(ws, 7);

    const byUser = new Map<string, number>();
    for (const r of rows) {
      const s = new Date(r.started_at);
      if (s < ws || s >= weekEnd) continue;
      const e = new Date(r.ended_at);
      const mins = Math.max(0, Math.round((e.getTime() - s.getTime()) / 60000) - (r.break_minutes || 0));
      if (mins > 0) byUser.set(r.user_id, (byUser.get(r.user_id) ?? 0) + mins);
    }

    const list = Array.from(byUser.entries()).map(([uid, mins]) => {
      const u = usersMap.get(uid);
      const name = u ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || uid : uid;
      return { uid, name, mins };
    }).sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [rows, usersMap, weekRows, selectedWeekIdx]);

  return (
    <div className="space-y-8">
      {/* =================== Download Weekly Timesheet =================== */}
      <section className="rounded-2xl border bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Download Weekly Timesheet</h2>
        </div>

        {weekRows.length === 0 ? (
          <p className="text-sm text-slate-500">No weeks available yet.</p>
        ) : (
          <>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="text-sm text-slate-700">
                Select week:
                <select
                  className="ml-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                  value={selectedWeekIdx}
                  onChange={(e) => setSelectedWeekIdx(Number(e.target.value))}
                >
                  {weekRows.map((w, idx) => (
                    <option key={w.label} value={idx}>
                      {w.label} ({w.spanText})
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-slate-500">
                One PDF per worker, A4 landscape, Excel-like grid with a Total Hours row.
              </p>
            </div>

            {workerListForWeek.length === 0 ? (
              <div className="rounded-lg border p-3 text-sm text-slate-600">
                No registered hours for this week.
              </div>
            ) : (
              <ul className="divide-y">
                {workerListForWeek.map(({ uid, name, mins }) => (
                  <li key={uid} className="flex items-center justify-between py-3">
                    <div className="text-sm">
                      <div className="font-semibold text-slate-900">{name}</div>
                      <div className="text-slate-600 text-xs">Total this week: {hhmm(mins)}</div>
                    </div>
                    <button
                      onClick={async () => {
                        const ws = weekRows[selectedWeekIdx].weekStart;
                        const entries = entriesForUserWeek(uid, ws);
                        const user = usersMap.get(uid) || { user_id: uid, first_name: null, last_name: null };
                        const { filename, bytes } = await buildPdfForUser({
                          user,
                          weekStart: ws,
                          entries,
                          company: '',
                          siteNo: '',
                          address: '',
                        });
                        downloadBytes(filename, bytes);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <FileDown className="h-4 w-4" />
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {/* Calendar */}
      <section className="rounded-2xl border bg-white p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-lg font-semibold">
            Calendar — {calMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} disabled={calMonth <= MIN_CAL_MONTH}
              className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50">←</button>
            <button onClick={nextMonth} disabled={calMonth >= NOW_MONTH}
              className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50">→</button>
          </div>
        </div>

        {(() => {
          const calStart = startOfMonth(calMonth);
          const calEnd = endOfMonth(calMonth);
          const days = rangeDays(calStart, calEnd);
          const first = new Date(calStart);
          const weekday = (first.getDay() + 6) % 7;

          return (
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((w) => (
                <div key={w} className="text-xs text-slate-500">{w}</div>
              ))}
              {Array.from({ length: weekday }).map((_, i) => <div key={`lead-${i}`} />)}
              {days.map((d) => {
                const key = ymd(d);
                const mins = perDay.get(key) ?? 0;
                return (
                  <button
                    key={key}
                    onClick={() => mins > 0 && onDayClick(d)}
                    className={`rounded-lg border p-2 flex flex-col items-center justify-center hover:bg-slate-50 ${mins ? 'cursor-pointer' : 'opacity-70'}`}
                    title={mins ? 'Click to view per-user hours' : undefined}
                  >
                    <div className="text-sm font-medium">{d.getDate()}</div>
                    <div className="text-[11px] text-slate-600">{mins ? hhmm(mins) : ''}</div>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {dayUsers && (
          <div className="mt-4 rounded-xl border p-4">
            <div className="text-sm font-semibold">Details for {dayUsers.day}</div>
            <ul className="mt-2 space-y-1 text-sm">
              {dayUsers.list.length === 0 ? (
                <li className="text-slate-500">No hours.</li>
              ) : dayUsers.list.map(u => (
                <li key={u.uid} className="flex items-center justify-between">
                  <span>{u.name || u.uid}</span>
                  <span className="font-medium">{hhmm(u.mins)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Weeks */}
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold mb-3">Weeks (W36-2025 → current)</h2>
        <div className="space-y-2">
          {weekRows.map((w) => (
            <div key={w.label} className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  {w.label} <span className="text-slate-500">({w.spanText})</span>
                </div>
                <div className="text-sm font-semibold">{hhmm(w.totalMin)}</div>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                <div className="rounded-lg bg-emerald-50 p-2 text-center">
                  <div className="text-slate-600">Total</div>
                  <div className="font-semibold">{hhmm(w.totalMin)}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <div className="text-slate-500">Weekend</div>
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
      </section>

      {/* Workers */}
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold mb-3">Workers on this project</h2>
        <ul className="space-y-1 text-sm">
          {Array.from(new Set(rows.map(r => r.user_id))).length === 0 ? (
            <li className="text-slate-500">No hours yet.</li>
          ) : (
            Array.from(new Set(rows.map(r => r.user_id))).map(uid => {
              const u = usersMap.get(uid);
              const name = u ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || uid : uid;
              return <li key={uid}>• {name}</li>;
            })
          )}
        </ul>
      </section>

      {/* Photos */}
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold mb-3">Photos</h2>
        {photos.length === 0 ? (
          <div className="text-sm text-slate-500">No photos uploaded.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {photos.map(p => (
              <div key={p.path} className="relative group overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <a href={p.url} target="_blank" rel="noreferrer" title={p.name}>
                  <img src={p.url} alt={p.name} className="h-28 w-full object-contain bg-slate-100" />
                </a>
                <button
                  onClick={() => deletePhoto(p.path)}
                  disabled={deleting === p.path}
                  className="absolute top-2 right-2 inline-flex items-center justify-center rounded-md bg-white/90 border px-2 py-1 text-xs text-red-600 shadow hover:bg-white"
                  title="Delete photo"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {deleting === p.path ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
