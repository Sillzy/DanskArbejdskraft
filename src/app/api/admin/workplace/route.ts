//src/app/api/admin/workplace/route.ts
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/../lib/supabase-server';

/** POST { id, field, value } – admin-only update of a workplace field */
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
    value?: any;
  } | null;

  if (!body?.id || typeof body.field !== 'string') {
    return NextResponse.json({ error: 'Missing id or field' }, { status: 400 });
  }

  const allowed = new Set([
    'name',
    'site_number',
    'project_number',
    'company_name',
    'company_cvr',
    'invoice_email',
    'address',
    'is_active',
  ]);
  if (!allowed.has(body.field)) {
    return NextResponse.json({ error: 'Field not allowed' }, { status: 400 });
  }

  // normalize value for text fields
  let v: any = body.value;
  if (['name','site_number','project_number','company_name','company_cvr','invoice_email','address'].includes(body.field)) {
    v =
      v === undefined || v === null
        ? null
        : (typeof v === 'string' && v.trim() === '' ? null : String(v));
  }
  if (body.field === 'is_active') {
    v = !!v;
  }

  const { error } = await supabase.from('workplaces').update({ [body.field]: v }).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
