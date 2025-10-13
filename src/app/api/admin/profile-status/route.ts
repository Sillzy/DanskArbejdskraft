// src/app/api/admin/profile-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRouteHandlerSupabase } from '@/../lib/supabase-server';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  // uid is always in the query string in your UI
  const uid = url.searchParams.get('uid') ?? undefined;

  // status can come from query (?status=approved) OR form body
  let status = url.searchParams.get('status');
  if (!status) {
    const form = await req.formData().catch(() => null);
    status = form?.get('status')?.toString() ?? '';
  }

  if (!uid || !['approved', 'rejected', 'under_review'].includes(status)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const { supabase } = getRouteHandlerSupabase(req);

  // must be signed in
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.redirect(new URL('/login?next=/admin/team', req.url));
  }

  // must be admin
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin', {
    p_uid: auth.user.id,
  });
  if (adminErr) {
    return NextResponse.json({ error: adminErr.message }, { status: 500 });
  }
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // keep boolean in sync with profile_status
  const { error } = await supabase
    .from('profiles')
    .update({
      profile_status: status,
      team_approved: status === 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', uid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // go back to Team list
  return NextResponse.redirect(new URL('/admin/team', req.url));
}
