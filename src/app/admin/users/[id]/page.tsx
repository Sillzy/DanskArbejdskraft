// src/app/admin/users/[id]/page.tsx
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/../lib/supabase-server';
import DashboardClient from '@/app/dashboard/parts/DashboardClient'; // adjust if your path differs

type ParamsP = Promise<{ id: string }>;

export default async function AdminWorkerDashboardPage({ params }: { params: ParamsP }) {
  // Next 15+ params are async
  const { id: targetUserId } = await params;

  const supabase = await getServerSupabase();

  // Must be logged in and admin
  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user;
  if (!me) redirect('/login?next=/admin');
  const { data: isAdmin } = await supabase.rpc('is_admin', { p_uid: me.id });
  if (!isAdmin) redirect('/admin');

  // Load target user's profile (light)
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'user_id, first_name, last_name, birthday, address, city, postal_code, phone_country, phone_number, profile_status'
    )
    .eq('user_id', targetUserId)
    .maybeSingle();

  // Load target user's workplaces
  const { data: workplaces = [] } = await supabase
    .from('workplaces')
    .select('id, user_id, name, address, company_name, created_at, updated_at')
    .eq('user_id', targetUserId)
    .order('updated_at', { ascending: false });

  // “This month” aggregation for the target user (same shape as you already pass)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

  const { data: monthEntries = [] } = await supabase
    .from('time_entries')
    .select('minutes:ended_at, started_at, break_minutes') // we’ll compute minutes below
    .eq('user_id', targetUserId)
    .gte('started_at', monthStart.toISOString())
    .lt('started_at', monthEnd.toISOString());

  // Convert to your expected { minutes, work_date }[]
  const monthRollup: { minutes: number; work_date: string }[] = (monthEntries as any[]).map((r) => {
    const s = new Date(r.started_at).getTime();
    const e = new Date(r.ended_at).getTime();
    const mins = Math.max(0, Math.round((e - s) / 60000) - (r.break_minutes || 0));
    return {
      minutes: mins,
      work_date: new Date(r.started_at).toISOString().slice(0, 10),
    };
  });

  // Last entry at (optional)
  const { data: lastRow } = await supabase
    .from('time_entries')
    .select('started_at')
    .eq('user_id', targetUserId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastEntryAt = lastRow?.started_at ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-slate-600">
          Admin view — you are viewing the dashboard of:
        </div>
        <div className="mt-1 text-xl font-semibold">
          {(profile?.first_name ?? '—') + ' ' + (profile?.last_name ?? '')}
        </div>
      </div>

      {/* Reuse the existing DashboardClient. We pass the TARGET userId so admin can register hours on their behalf. */}
      <DashboardClient
        userId={targetUserId}
        profile={profile || null}
        workplaces={workplaces as any}
        monthEntries={monthRollup}
        lastEntryAt={lastEntryAt}
      />
    </main>
  );
}
