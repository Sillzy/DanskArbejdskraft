//src/app/api/admin/documents/route.ts
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/../lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'admin-documents';

function sanitizeFilename(name: string) {
  return name.normalize('NFKD').replace(/[^\w.\-]+/g, '_');
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    // Verify user is admin (via your RPC)
    const supabase = await getServerSupabase();
    const { data: ures } = await supabase.auth.getUser();
    const user = ures?.user ?? null;
    if (!user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { data: isAdm } = await supabase.rpc('is_admin', { p_uid: user.id });
    if (!isAdm) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });

    const form = await req.formData();

    // Honeypot
    if (String(form.get('website') || '')) {
      return NextResponse.json({ ok: true });
    }

    const rawTitle = String(form.get('title') || '').trim();
    const type = String(form.get('type') || '').trim();
    const description = (String(form.get('description') || '').trim() || null) as string | null;
    const file = form.get('file') as File | null;

    if (!type || !file) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    const s = serviceClient();

    // Upload to Storage (private bucket)
    const safeName = sanitizeFilename(file.name || 'file.bin');
    const path = `uploads/${Date.now()}_${safeName}`;

    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await s.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }

    // Insert metadata
    const title = rawTitle || safeName.replace(/\.[^.]+$/, '');
    const { data: row, error: insErr } = await s
      .from('admin_documents')
      .insert({
        title,
        type,
        description,
        storage_path: path,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (insErr) {
      // rollback storage on failure
      await s.storage.from(BUCKET).remove([path]).catch(() => {});
      return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: row.id });
  } catch (e: any) {
    console.error('Upload error', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
