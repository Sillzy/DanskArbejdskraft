'use client';

import * as React from 'react';
import { supabase } from '@/../lib/supabaseClient';
import { Clock, ImageUp, Trash2, Pencil } from 'lucide-react';

/* ----------------- Config ----------------- */
const BUCKET = 'workplace-photos';
const folderFor = (workplaceId: string) => `workplaces/${workplaceId}`;

/* ----------------- Small helpers ----------------- */
function minutesBetween(startISO: string, endISO: string) {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  return Math.max(0, Math.round((e - s) / 60000));
}
function hhmm(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}
function fmtDate_DDMMYYYY(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
function fmtTime_HHMM(d: Date) {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}
function toISOLocal(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${timeStr}`).toISOString();
}
function parseLocalFromISO(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const MM = String(d.getMinutes()).padStart(2, '0');
  return { date: `${yyyy}-${mm}-${dd}`, time: `${HH}:${MM}` };
}

/* ----------------- Types ----------------- */
type TimeEntry = {
  id: string;
  user_id: string;
  workplace_id: string;
  started_at: string;
  ended_at: string;
  break_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  userId: string;
  workplaceId: string;
  workplaceName: string;
};

/* ----------------- Upload Modal ----------------- */
function UploadPhotoModal({
  open,
  onClose,
  workplaceId,
}: {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  workplaceId: string;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    const f = e.target.files?.[0] || null;
    setFile(f || null);
  }

  async function doUpload() {
    if (!file) {
      setErr('Please choose a photo.');
      return;
    }
    setSaving(true);
    setErr(null);

    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const uuid = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/[^a-zA-Z0-9-]/g, '');
      const path = `${folderFor(workplaceId)}/${uuid}.${ext}`;

      const { error: upErr } = await supabase
        .storage
        .from(BUCKET)
        .upload(path, file, {
          upsert: false,
          contentType: file.type || 'image/jpeg',
          cacheControl: '3600',
        });

      if (upErr) throw upErr;

      onClose(true);
    } catch (e: any) {
      setErr(e.message ?? 'Upload failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:m-auto md:h-fit md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-xl p-6 sm:p-8">
        <h3 className="text-2xl font-semibold">Upload photo</h3>

        {err && (
          <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-base text-red-700">
            {err}
          </div>
        )}

        <div className="mt-5">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPick}
            className="block w-full text-sm"
          />
          <p className="mt-2 text-xs text-slate-500">
            Works on iPhone/Android/desktop. You can take a photo or pick from your library.
          </p>
          {file && (
            <div className="mt-3 text-sm text-slate-700">
              Selected: <span className="font-medium">{file.name}</span>
            </div>
          )}
        </div>

        <div className="mt-7 flex gap-3">
          <button
            className="flex-1 rounded-xl border px-5 py-3 text-base hover:bg-slate-50"
            onClick={() => onClose()}
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-xl bg-blue-600 text-white px-5 py-3 text-base hover:bg-blue-700 disabled:opacity-60"
            disabled={saving}
            onClick={doUpload}
          >
            {saving ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Register Modal ----------------- */
function RegisterTimeModal({
  open,
  onClose,
  userId,
  workplaceId,
  editEntry,
}: {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  userId: string;
  workplaceId: string;
  editEntry: TimeEntry | null;
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

  React.useEffect(() => {
    if (!open) return;
    setErr(null);
    if (editEntry) {
      const s = parseLocalFromISO(editEntry.started_at);
      const e = parseLocalFromISO(editEntry.ended_at);
      setWorkDate(s.date);
      setStart(s.time);
      setEnd(e.time);
      setBreakMin(editEntry.break_minutes ?? 0);
    } else {
      setWorkDate(today);
      setStart('07:00');
      setEnd('16:00');
      setBreakMin(30);
    }
  }, [open, editEntry, today]);

  const dateRef = React.useRef<HTMLInputElement>(null);
  const startRef = React.useRef<HTMLInputElement>(null);
  const endRef = React.useRef<HTMLInputElement>(null);
  function openPicker(ref: React.RefObject<HTMLInputElement>) {
    const el = ref.current;
    if (!el) return;
    // @ts-expect-error
    if (typeof el.showPicker === 'function') el.showPicker();
    el.focus();
  }

  async function saveReplaceByLocalDay() {
    const startISO = toISOLocal(workDate, start);
    const endISO = toISOLocal(workDate, end);

    if (!(new Date(endISO) > new Date(startISO))) {
      setErr('End time must be after start time.');
      return;
    }

    setSaving(true);
    setErr(null);

    const { error } = await supabase.rpc('register_time_entry_replace_local', {
      p_user_id: userId,
      p_workplace_id: workplaceId,
      p_started_at: startISO,
      p_ended_at: endISO,
      p_break_minutes: breakMin,
      p_notes: editEntry?.notes ?? null,
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

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:m-auto md:h-fit md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-xl p-6 sm:p-8">
        <h3 className="text-2xl font-semibold">
          {editEntry ? 'Change work time' : 'Register time'}
        </h3>

        {err && (
          <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-base text-red-700">
            {err}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5">
          <div
            className="rounded-2xl border p-4 sm:p-5 cursor-pointer"
            onClick={() => openPicker(dateRef)}
          >
            <label className="block text-slate-600 text-base mb-2">Date</label>
            <input
              ref={dateRef}
              type="date"
              className="w-full rounded-xl border p-4 text-xl sm:text-2xl tracking-wide"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div
              className="rounded-2xl border p-4 sm:p-5 cursor-pointer"
              onClick={() => openPicker(startRef)}
            >
              <label className="block text-slate-600 text-base mb-2">Start time</label>
              <input
                ref={startRef}
                type="time"
                className="w-full rounded-xl border p-4 text-2xl h-16 sm:h-20 text-center"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">Tap anywhere on this box to open the time wheel</p>
            </div>

            <div
              className="rounded-2xl border p-4 sm:p-5 cursor-pointer"
              onClick={() => openPicker(endRef)}
            >
              <label className="block text-slate-600 text-base mb-2">End time</label>
              <input
                ref={endRef}
                type="time"
                className="w-full rounded-xl border p-4 text-2xl h-16 sm:h-20 text-center"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">Tap anywhere on this box to open the time wheel</p>
            </div>
          </div>

          <div className="rounded-2xl border p-4 sm:p-5">
            <label className="block text-slate-600 text-base mb-2">Break (minutes)</label>
            <select
              className="w-full rounded-xl border p-4 text-xl h-16"
              value={breakMin}
              onChange={(e) => setBreakMin(parseInt(e.target.value, 10))}
            >
              {[0, 15, 30, 45, 60, 75, 90].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-7 flex gap-4">
          <button className="flex-1 rounded-xl border px-5 py-4 text-lg hover:bg-slate-50" onClick={() => onClose()}>
            Cancel
          </button>
          <button
            className="flex-1 rounded-xl bg-blue-600 text-white px-5 py-4 text-lg hover:bg-blue-700 disabled:opacity-60"
            disabled={saving}
            onClick={saveReplaceByLocalDay}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Main page client ----------------- */
export default function RegisterClient({ userId, workplaceId, workplaceName }: Props) {
  const [entries, setEntries] = React.useState<TimeEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  // upload button visibility
  const [canUpload, setCanUpload] = React.useState(false);

  // photos
  type PhotoItem = { name: string; path: string; url: string };
  const [photos, setPhotos] = React.useState<PhotoItem[]>([]);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  // Modal state for time registration
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editEntry, setEditEntry] = React.useState<TimeEntry | null>(null);

  // Load profile status (hide upload if not approved)
  React.useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('profile_status')
        .eq('user_id', userId)
        .maybeSingle();
      setCanUpload((data?.profile_status ?? null) === 'approved');
    })();
  }, [userId]);

  const loadEntries = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('workplace_id', workplaceId)
      .order('started_at', { ascending: false });
    if (error) setErr(error.message);
    setEntries((data as TimeEntry[]) ?? []);
    setLoading(false);
  }, [userId, workplaceId]);

  // load photos for workplace
  const loadPhotos = React.useCallback(async () => {
    const folder = folderFor(workplaceId);
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error) {
      setPhotos([]);
      return;
    }

    if (!data || data.length === 0) {
      setPhotos([]);
      return;
    }

    const paths = data.map((f) => `${folder}/${f.name}`);
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);

    const items: PhotoItem[] =
      signed?.map((s, idx) => ({
        name: data[idx].name,
        path: paths[idx],
        url: s.signedUrl,
      })) ?? [];

    setPhotos(items);
  }, [workplaceId]);

  React.useEffect(() => {
    loadEntries();
    loadPhotos();
  }, [loadEntries, loadPhotos]);

  // Group entries by day
  const grouped = React.useMemo(() => {
    const byDay: Record<
      string,
      { total: number; rows: Array<{ id: string; start: Date; end: Date; breakMin: number; notes: string | null }> }
    > = {};
    for (const te of entries) {
      const s = new Date(te.started_at);
      const e = new Date(te.ended_at);
      const day = fmtDate_DDMMYYYY(s);
      const mins = Math.max(0, minutesBetween(te.started_at, te.ended_at) - (te.break_minutes || 0));
      if (!byDay[day]) byDay[day] = { total: 0, rows: [] };
      byDay[day].rows.push({ id: te.id, start: s, end: e, breakMin: te.break_minutes || 0, notes: te.notes });
      byDay[day].total += mins;
    }
    const order = Object.keys(byDay).sort((a, b) => {
      const [da, ma, ya] = a.split('-').map(Number);
      const [db, mb, yb] = b.split('-').map(Number);
      return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime();
    });
    return order.map((day) => ({ day, ...byDay[day] }));
  }, [entries]);

  async function deleteEntry(id: string) {
    if (!confirm('Delete this work log entry?')) return;
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      alert(error.message);
      return;
    }
    await loadEntries();
  }

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

  return (
    <div className="space-y-6">
      {/* Register time + Upload Photo buttons */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="mb-4">
          <h1 className="text-lg font-semibold">Register time — {workplaceName}</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setEditEntry(null);
              setModalOpen(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-7 py-5 text-lg font-semibold text-white hover:bg-blue-700"
          >
            <Clock className="h-6 w-6" />
            REGISTER TIME
          </button>

          {canUpload && (
            <button
              onClick={() => setUploadOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl border px-7 py-5 text-lg font-semibold hover:bg-slate-50"
            >
              <ImageUp className="h-6 w-6" />
              Upload Photo
            </button>
          )}
        </div>

        {/* Photos section (always visible) */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold">Photos</h3>
          {photos.length === 0 ? (
            <div className="mt-2 text-sm text-slate-500">
              {canUpload ? 'No photos yet. Upload one above.' : 'No photos.'}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {photos.map((p) => (
                <div key={p.path} className="relative group overflow-hidden rounded-lg border">
                  {/* Thumbnail: show the whole image (no crop) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <a href={p.url} target="_blank" rel="noreferrer" title={p.name}>
                    <img src={p.url} alt={p.name} className="h-28 w-full object-contain bg-slate-100" />
                  </a>

                  {/* Delete button */}
                  <button
                    onClick={() => deletePhoto(p.path)}
                    disabled={deleting === p.path}
                    title="Delete photo"
                    className="absolute top-2 right-2 inline-flex items-center justify-center rounded-md bg-white/90 border px-2 py-1 text-xs text-red-600 shadow hover:bg-white"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    {deleting === p.path ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Work log */}
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="text-base font-semibold">Work log</h2>

        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No entries yet.</div>
        ) : (
          <div className="mt-4 space-y-6">
            {grouped.map(({ day, total, rows }) => (
              <div key={day} className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{day}</div>
                  <div className="text-sm text-slate-600">Total: {hhmm(total)}</div>
                </div>

                <ul className="mt-3 space-y-2">
                  {rows.map((r) => (
                    <li key={r.id} className="text-sm text-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-medium">
                          {fmtTime_HHMM(r.start)} – {fmtTime_HHMM(r.end)}
                        </span>{' '}
                        • Break {r.breakMin}m • Work {hhmm(Math.max(0, minutesBetween(r.start.toISOString(), r.end.toISOString()) - r.breakMin))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                          onClick={() => {
                            const entry = entries.find((e) => e.id === r.id) || null;
                            setEditEntry(entry);
                            setModalOpen(true);
                          }}
                          title="Change"
                        >
                          <Pencil className="h-4 w-4" />
                          Change
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                          onClick={() => deleteEntry(r.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <RegisterTimeModal
        open={modalOpen}
        onClose={async (refresh) => {
          setModalOpen(false);
          setEditEntry(null);
          if (refresh) await loadEntries();
        }}
        userId={userId}
        workplaceId={workplaceId}
        editEntry={editEntry}
      />

      <UploadPhotoModal
        open={uploadOpen}
        onClose={async (refresh) => {
          setUploadOpen(false);
          if (refresh) await loadPhotos();
        }}
        workplaceId={workplaceId}
      />
    </div>
  );
}
