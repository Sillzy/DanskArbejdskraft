 //src/app/api/admin/workplaces/route.ts
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/../lib/supabase-server';

/** POST { id, field, value } – admin-only update of a workplace text field */
export async function POST(req: Request) {
  const supabase = await getServerSupabase();

  // auth
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // admin check
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin', { p_uid: user.id });
  if (adminErr) return NextResponse.json({ error: adminErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // payload
  const body = await req.json().catch(() => null) as {
    id?: string;
    field?: string;
    value?: string | null;
  } | null;

  if (!body?.id || typeof body.field !== 'string') {
    return NextResponse.json({ error: 'Missing id or field' }, { status: 400 });
  }

  const allowed = new Set(['name', 'company_name', 'company_cvr', 'invoice_email']);
  if (!allowed.has(body.field)) {
    return NextResponse.json({ error: 'Field not allowed' }, { status: 400 });
  }

  // normalize value
  const v =
    body.value === undefined
      ? null
      : (typeof body.value === 'string' && body.value.trim() === '' ? null : body.value);

  // update
  const { error } = await supabase
    .from('workplaces')
    .update({ [body.field]: v })
    .eq('id', body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
