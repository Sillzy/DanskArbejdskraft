// src/app/api/admin/delete-user/route.ts
import { NextResponse } from 'next/server';
import { getRouteHandlerSupabase } from '@/../lib/supabase-server';

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid') || '';

  if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

  const supabase = await getRouteHandlerSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc('is_admin', { p_uid: user.user.id });
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // You can delete profile rows; deleting auth.users requires service-role key (do from dashboard or Edge func).
  const { error } = await supabase.from('profiles').delete().eq('user_id', uid);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
