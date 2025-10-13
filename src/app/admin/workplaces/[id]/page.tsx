// src/app/admin/workplaces/[id]/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSupabase } from '@/../lib/supabase-server';
import AdminWorkplaceClient from './parts/AdminWorkplaceClient';

type ParamsP = Promise<{ id: string }>;

export default async function AdminWorkplacePage({
  params,
}: { params: ParamsP }) {
  const { id } = await params; // Next 15+
  const supabase = await getServerSupabase();

  // Require admin
  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user;
  if (!me) redirect('/login?next=/admin');
  const { data: isAdmin } = await supabase.rpc('is_admin', { p_uid: me.id });
  if (!isAdmin) redirect('/admin');

  // Load workplace
  const { data: wp, error } = await supabase
    .from('workplaces')
    .select('id, name, company_name')
    .eq('id', id)
    .maybeSingle();

  if (error || !wp) redirect('/admin');

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Project — {wp.name}
        </h1>
        <Link href="/admin" className="text-blue-600 underline" prefetch={false}>
          ← Back to Admin
        </Link>
      </div>

      {/* Client side: calendar, photos, interactions */}
      <AdminWorkplaceClient workplaceId={wp.id} workplaceName={wp.name} />
    </main>
  );
}
