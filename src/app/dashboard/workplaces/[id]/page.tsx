//src/app/dashboard/workplaces[id]/page.tsx
import { redirect } from 'next/navigation';
import RegisterClient from '@/app/dashboard/workplaces/[id]/parts/RegisterClient';
import { getServerSupabase } from '@/../lib/supabase-server';

type ParamsP = Promise<{ id: string }>;

export default async function WorkplacePage({
  params,
}: {
  params: ParamsP;
}) {
  // ✅ Next 15+ requires awaiting params
  const { id } = await params;

  const supabase = await getServerSupabase();

  // Require auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Only allow loading a workplace owned by the current user
  const { data: wp, error } = await supabase
    .from('workplaces')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !wp) {
    // Not found or not yours → back to dashboard
    redirect('/dashboard');
  }

  return (
    <RegisterClient
      userId={user.id}
      workplaceId={wp.id}
      workplaceName={wp.name}
    />
  );
}
