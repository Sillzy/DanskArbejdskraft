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

  const body = (await req.json().catch(() => null)) as { workplace_id?: string } | null;
  if (!body?.workplace_id) {
    return NextResponse.json({ error: 'Missing workplace_id' }, { status: 400 });
  }

  // ensure workplace is active
  const { data: wp } = await supabase
    .from('workplaces')
    .select('id,is_active')
    .eq('id', body.workplace_id)
    .maybeSingle();

  if (!wp || (wp as any).is_active === false) {
    return NextResponse.json({ error: 'Workplace is not active' }, { status: 400 });
  }

  // insert link, handle duplicates as 409
  const { error } = await supabase
    .from('user_workplaces')
    .insert({ user_id: user.id, workplace_id: body.workplace_id });

  if (error) {
    const msg = String(error.message || '').toLowerCase();
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return NextResponse.json({ error: 'Workplace Already added' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

/** DELETE ?workplace_id=... – unlink mapping for current user only */
export async function DELETE(req: Request) {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workplaceId = searchParams.get('workplace_id');
  if (!workplaceId) {
    return NextResponse.json({ error: 'Missing workplace_id' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_workplaces')
    .delete()
    .eq('user_id', user.id)
    .eq('workplace_id', workplaceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
