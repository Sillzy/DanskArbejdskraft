//src/app/api/admin/documents/file/[id]/route.ts
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

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin via user session + RPC
    const supabase = await getServerSupabase();
    const { data: ures } = await supabase.auth.getUser();
    const user = ures?.user ?? null;
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: isAdm } = await supabase.rpc('is_admin', { p_uid: user.id });
    if (!isAdm) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const s = serviceClient();

    const { data: row, error } = await s
      .from('admin_documents')
      .select('storage_path, title')
      .eq('id', params.id)
      .single();

    if (error || !row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: signed, error: signErr } = await s
      .storage
      .from(BUCKET)
      .createSignedUrl(row.storage_path, 60); // 60 seconds

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: 'Could not sign URL' }, { status: 500 });
    }

    // redirect to the signed URL (download handled by Storage)
    return NextResponse.redirect(signed.signedUrl);
  } catch (e: any) {
    console.error('Download error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
