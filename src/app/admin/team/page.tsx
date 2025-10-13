import { getServerSupabase } from '@/../lib/supabase-server';
import ProfileEditorRow from './ProfileEditorRow';

export default async function AdminTeamPage() {
  const supabase = await getServerSupabase();

  // Load buckets
  const { data: under = [] } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email, profile_status, created_at')
    .eq('profile_status', 'under_review')
    .order('created_at', { ascending: true });

  const { data: approved = [] } = await supabase
    .from('profiles')
    .select('user_id, profile_status, first_name, last_name, email, team_title, phone_country, phone_number, bank_reg_no, bank_account_no, swift, iban, address, city, postal_code')
    .eq('profile_status', 'approved')
    .order('first_name', { ascending: true });

  const { data: rejected = [] } = await supabase
    .from('profiles')
    .select('user_id, profile_status, first_name, last_name, email, team_title, phone_country, phone_number, bank_reg_no, bank_account_no, swift, iban, address, city, postal_code')
    .eq('profile_status', 'rejected')
    .order('first_name', { ascending: true });

  return (
    <div className="px-4 md:px-8 py-8 space-y-8">
      {/* Under review */}
      <section className="rounded-2xl border bg-white p-5">
        <h1 className="text-xl font-semibold mb-4">Profiles under review</h1>
        {under.length === 0 ? (
          <div className="text-sm text-slate-600">None.</div>
        ) : (
          <ul className="space-y-3">
            {under.map((p: any) => (
              <li key={p.user_id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="text-sm">
                  <div className="font-medium">
                    {p.first_name ?? '—'} {p.last_name ?? ''}
                  </div>
                  <div className="text-slate-600">{p.email ?? ''}</div>
                </div>
                <div className="flex gap-2">
                  <form action={`/api/admin/profile-status?uid=${p.user_id}&status=approved`} method="post">
                    <button className="rounded bg-emerald-600 px-3 py-1.5 text-white text-sm">Approve</button>
                  </form>
                  <form action={`/api/admin/profile-status?uid=${p.user_id}&status=rejected`} method="post">
                    <button className="rounded bg-red-600 px-3 py-1.5 text-white text-sm">Reject</button>
                  </form>
                  <form action={`/api/admin/profile-status?uid=${p.user_id}&status=under_review`} method="post">
                    <button className="rounded bg-slate-200 px-3 py-1.5 text-slate-800 text-sm">Keep Under Review</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Approved */}
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold mb-4">All approved profiles</h2>
        {approved.length === 0 ? (
          <div className="text-sm text-slate-600">None.</div>
        ) : (
          <div className="space-y-3">
            {approved.map((p: any) => (
              <ProfileEditorRow key={p.user_id} profile={p} showStatusActions />
            ))}
          </div>
        )}
      </section>

      {/* Rejected */}
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold mb-4">All rejected profiles</h2>
        {rejected.length === 0 ? (
          <div className="text-sm text-slate-600">None.</div>
        ) : (
          <div className="space-y-3">
            {rejected.map((p: any) => (
              <ProfileEditorRow key={p.user_id} profile={p} showStatusActions />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
