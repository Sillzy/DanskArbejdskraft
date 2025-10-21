//src/app/api/admin/documents/delete/route.ts
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/../lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'admin-documents';

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    // Verify admin with your RPC
    const supabase = await getServerSupabase();
    const { data: ures } = await supabase.auth.getUser();
    const user = ures?.user ?? null;
    if (!user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { data: isAdm } = await supabase.rpc('is_admin', { p_uid: user.id });
    if (!isAdm) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });

    const form = await req.formData();
    const id = String(form.get('id') || '').trim();
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    const s = serviceClient();

    const { data: row, error } = await s
      .from('admin_documents')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (error || !row) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    // Remove file (ignore error if already missing)
    await s.storage.from(BUCKET).remove([row.storage_path]).catch(() => {});

    const { error: delErr } = await s.from('admin_documents').delete().eq('id', id);
    if (delErr) return NextResponse.json({ ok: false, error: delErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Delete error', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
