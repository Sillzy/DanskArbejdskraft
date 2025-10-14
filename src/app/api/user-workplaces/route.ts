import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/../lib/supabase-server';

/** POST { workplace_id } – add mapping for current user (must be approved) */
export async function POST(req: Request) {
  const supabase = await getServerSupabase();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: prof } = await supabase
    .from('profiles')
    .select('profile_status')
    .eq('user_id', user.id)
    .maybeSingle();

  if ((prof as any)?.profile_status !== 'approved') {
    return NextResponse.json({ error: 'Profile not approved' }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as { workplace_id?: string } | null;
  if (!body?.workplace_id) {
    return NextResponse.json({ error: 'Missing workplace_id' }, { status: 400 });
  }

  // ensure workplace is active
  const { data: wp } = await supabase
    .from('workplaces')
    .select('id, is_active')
    .eq('id', body.workplace_id)
    .maybeSingle();
  if (!wp || (wp as any).is_active === false) {
    return NextResponse.json({ error: 'Workplace is not active' }, { status: 400 });
  }

  // insert link (ignore duplicates)
  const { error } = await supabase
    .from('user_workplaces')
    .insert({ user_id: user.id, workplace_id: body.workplace_id })
    .select('user_id')
    .single()
    .catch(() => ({ error: null } as any)); // if PK conflict RLS may throw; treat as OK

  if (error && !String(error.message).includes('duplicate')) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
