//src/app/api/admin/workplace/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/../lib/supabase-server';

export async function POST(req: Request) {
  const supabase = await getServerSupabase();

  // auth + admin
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin', { p_uid: user.id });
  if (adminErr) return NextResponse.json({ error: adminErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // payload (aligned with “Create new workplace” UI)
  const body = await req.json().catch(() => null) as {
    name?: string;
    company_name?: string | null;
    address?: string | null;
    company_cvr?: string | null;
    invoice_email?: string | null;
    is_active?: boolean;
  } | null;

  if (!body?.name || !body.name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('workplaces')
    .insert({
      user_id: user.id,               // IMPORTANT for RLS
      name: body.name.trim(),
      company_name: body.company_name ?? null,
      address: body.address ?? null,
      company_cvr: body.company_cvr ?? null,
      invoice_email: body.invoice_email ?? null,
      is_active: body.is_active ?? true,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data?.id });
}
