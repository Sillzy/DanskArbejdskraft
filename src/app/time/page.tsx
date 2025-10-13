//src/app/time/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useSession } from '../../../hooks/useSession';

type Project = { id: string; project_no: string | null; address: string | null };

export default function TimePage() {
  const session = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [msg, setMsg] = useState<string>('');
  const [form, setForm] = useState({ project_id: '', start: '', end: '', break_minutes: 0 });

  useEffect(() => {
    (async () => {
      if (!session) return;
      // fetch projects where the user is a member
      const { data: pms, error: pmErr } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', session.user.id);

      if (pmErr) {
        setMsg(pmErr.message);
        return;
      }

      const ids = (pms ?? []).map((r) => r.project_id);
      if (!ids.length) {
        setProjects([]);
        return;
      }

      const { data: projs, error: projErr } = await supabase
        .from('projects')
        .select('id, project_no, address')
        .in('id', ids)
        .order('created_at', { ascending: false });

      if (projErr) setMsg(projErr.message);
      setProjects(projs ?? []);
    })();
  }, [session]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return setMsg('Please sign in first.');
    if (!form.project_id || !form.start || !form.end)
      return setMsg('Please fill project, start and end.');

    const started_at = new Date(form.start);
    const ended_at = new Date(form.end);

    const { error } = await supabase.from('time_entries').insert({
      project_id: form.project_id,
      user_id: session.user.id,
      started_at,
      ended_at,
      break_minutes: Number(form.break_minutes) || 0,
      status: 'pending',
    });

    setMsg(error ? error.message : 'Time entry submitted for approval.');
  };

  return (
    <main>
      <form onSubmit={submit} className="max-w-2xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Time Tracking</h1>

        <select
          className="border p-2 rounded w-full"
          value={form.project_id}
          onChange={(e) => setForm({ ...form, project_id: e.target.value })}
          required
        >
          <option value="">Select a project…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {(p.project_no ?? 'No number')} – {p.address ?? 'No address'}
            </option>
          ))}
        </select>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="flex flex-col">
            <span>Start</span>
            <input
              className="border p-2 rounded"
              type="datetime-local"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
              required
            />
          </label>
          <label className="flex flex-col">
            <span>End</span>
            <input
              className="border p-2 rounded"
              type="datetime-local"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
              required
            />
          </label>
        </div>

        <label className="flex items-center gap-2">
          Break (minutes)
          <input
            className="border p-2 rounded w-28"
            type="number"
            min="0"
            value={form.break_minutes}
            onChange={(e) => setForm({ ...form, break_minutes: Number(e.target.value) })}
          />
        </label>

        <button className="px-4 py-2 border rounded">Save</button>
        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </main>
  );
}
