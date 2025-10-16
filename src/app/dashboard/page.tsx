//src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/../lib/supabase-server';
import DashboardClient from './parts/DashboardClient';

export default async function DashboardPage() {
  const supabase = await getServerSupabase();

  // Require an authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // ---------- Profile ----------
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      [
        'user_id',
        'first_name',
        'last_name',
        'birthday',
        'address',
        'city',
        'postal_code',
        'phone_country',
        'phone_number',
        'status',
        'profile_status',
      ].join(',')
    )
    .eq('user_id', user.id)
    .maybeSingle();

  // ---------- Workplaces linked to this user (via user_workplaces) ----------
  const { data: uw = [] } = await supabase
    .from('user_workplaces')
    .select('workplace_id')
    .eq('user_id', user.id);

  const ids = (uw as any[]).map((r) => r.workplace_id);
  let workplaces: any[] = [];
  if (ids.length) {
    const { data } = await supabase
      .from('workplaces')
      .select('id,user_id,name,address,company_name,created_at,updated_at')
      .in('id', ids)
      .order('updated_at', { ascending: false });
    workplaces = data ?? [];
  }

  // ---------- This month total (build entries list for client to sum/plot) ----------
  const now = new Date();
  const monthStartUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
  );
  const nextMonthStartUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0)
  );

  // Pull only what's needed; client computes minutes per-day
  const { data: monthTE = [] } = await supabase
    .from('time_entries')
    .select('started_at,ended_at,break_minutes')
    .eq('user_id', user.id)
    .gte('started_at', monthStartUTC.toISOString())
    .lt('started_at', nextMonthStartUTC.toISOString());

  const monthEntries =
    monthTE?.map((te: any) => {
      const ms =
        new Date(te.ended_at).getTime() - new Date(te.started_at).getTime();
      const minutes = Math.max(
        0,
        Math.round(ms / 60000) - (te.break_minutes ?? 0)
      );

      const d = new Date(te.started_at);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');

      return { minutes, work_date: `${yyyy}-${mm}-${dd}` };
    }) ?? [];

  // ---------- Last entry timestamp ----------
  const { data: last = [] } = await supabase
    .from('time_entries')
    .select('ended_at')
    .eq('user_id', user.id)
    .order('ended_at', { ascending: false })
    .limit(1);

  const lastEntryAt: string | null = last?.[0]?.ended_at ?? null;

  return (
    <div className="px-4 md:px-8 py-6">
      <DashboardClient
        userId={user.id}
        profile={profile ?? null}
        workplaces={workplaces ?? []}
        monthEntries={monthEntries}
        lastEntryAt={lastEntryAt}
      />
    </div>
  );
}
