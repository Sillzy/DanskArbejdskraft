//src/app/admin/overview/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useSession } from '../../../../hooks/useSession';

type RowUser = {
  user_id: string;
  week_start: string;
  total_minutes: number;
  weekend_minutes: number;
  weekday_minutes: number;
  weekday_overtime_minutes: number;
};

type RowCompany = {
  company_id: string;
  week_start: string;
  total_minutes: number;
  weekend_minutes: number;
  weekday_minutes: number;
  weekday_overtime_minutes: number;
};

export default function AdminOverview() {
  const session = useSession();
  const isAdmin =
    session?.user?.app_metadata?.is_admin === true ||
    session?.user?.user_metadata?.user_role === 'admin';

  const [users, setUsers] = useState<RowUser[]>([]);
  const [companies, setCompanies] = useState<RowCompany[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const u = await supabase.from('v_user_weekly_hours').select('*').limit(100);
      const c = await supabase.from('v_company_weekly_hours').select('*').limit(100);
      if (u.error || c.error) setMsg('No data or missing permissions.');
      setUsers(u.data ?? []);
      setCompanies(c.data ?? []);
    })();
  }, []);

  const fmt = (m?: number) => (m == null ? '—' : `${(m / 60).toFixed(1)} h`);

  if (session && !isAdmin) {
    return <main className="p-6">Only admins can view this page.</main>;
  }

  return (
    <main>
      <section className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Admin — Weekly Overview</h1>
        {msg && <p className="text-sm">{msg}</p>}

        <div>
          <h2 className="text-xl font-medium mb-2">Employees per week</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[700px] border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border">Employee</th>
                  <th className="p-2 border">Week start</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">Weekdays</th>
                  <th className="p-2 border">Weekend</th>
                  <th className="p-2 border">Weekday overtime</th>
                </tr>
              </thead>
              <tbody>
                {users.map((r, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{r.user_id}</td>
                    <td className="p-2 border">{r.week_start}</td>
                    <td className="p-2 border">{fmt(r.total_minutes)}</td>
                    <td className="p-2 border">{fmt(r.weekday_minutes)}</td>
                    <td className="p-2 border">{fmt(r.weekend_minutes)}</td>
                    <td className="p-2 border">{fmt(r.weekday_overtime_minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">Companies per week</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[700px] border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border">Company</th>
                  <th className="p-2 border">Week start</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">Weekdays</th>
                  <th className="p-2 border">Weekend</th>
                  <th className="p-2 border">Weekday overtime</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((r, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{r.company_id}</td>
                    <td className="p-2 border">{r.week_start}</td>
                    <td className="p-2 border">{fmt(r.total_minutes)}</td>
                    <td className="p-2 border">{fmt(r.weekday_minutes)}</td>
                    <td className="p-2 border">{fmt(r.weekend_minutes)}</td>
                    <td className="p-2 border">{fmt(r.weekday_overtime_minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
