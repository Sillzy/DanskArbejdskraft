import { NextRequest, NextResponse } from 'next/server';
import { getRouteHandlerSupabase } from '@/../lib/supabase-server';

const ALLOWED_KEYS = new Set([
  'first_name',
  'last_name',
  'team_title',
  'phone_country',
  'phone_number',
  'bank_reg_no',
  'bank_account_no',
  'swift',
  'iban',
  'address',
  'city',
  'postal_code',
]);

export async function POST(req: NextRequest) {
  const { supabase } = getRouteHandlerSupabase(req);

  // Must be signed in
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Must be admin
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin', {
    p_uid: auth.user.id,
  });
  if (adminErr) {
    return NextResponse.json({ error: adminErr.message }, { status: 500 });
  }
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse body
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request: invalid JSON' }, { status: 400 });
  }

  const uid = typeof body?.uid === 'string' ? body.uid : '';
  const updates = body?.updates && typeof body.updates === 'object' ? body.updates : null;
  if (!uid || !updates) {
    return NextResponse.json({ error: 'Bad request: uid/updates missing' }, { status: 400 });
  }

  // Whitelist fields and strip unknown keys
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (ALLOWED_KEYS.has(k)) clean[k] = v ?? null;
  }
  if (Object.keys(clean).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  clean.updated_at = new Date().toISOString();

  // Update
  const { error } = await supabase
    .from('profiles')
    .update(clean)
    .eq('user_id', uid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
