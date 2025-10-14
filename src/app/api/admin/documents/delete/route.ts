//src/app/api/admin/documents/delete/route.ts
import { NextResponse } from 'next/server';
import { deleteDocument, getDocument } from '@/../lib/adminDocumentsStore';
import { unlink } from 'fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const id = String(form.get('id') || '').trim();
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    const doc = getDocument(id);
    if (!doc) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    try { await unlink(doc.diskPath); } catch {}
    deleteDocument(id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Delete error', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
