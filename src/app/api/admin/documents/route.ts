import { NextResponse } from 'next/server';
import { addDocument } from '@/../lib/adminDocumentsStore';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join, parse } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // Honeypot
    if (String(form.get('website') || '')) {
      return NextResponse.json({ ok: true });
    }

    const rawTitle = String(form.get('title') || '').trim(); // may be empty
    const type = String(form.get('type') || '').trim();
    const description = String(form.get('description') || '').trim();
    const file = form.get('file') as File | null;

    if (!type || !file) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    const arrayBuf = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuf);

    const uploadsDir = join(process.cwd(), '.uploads');
    await mkdir(uploadsDir, { recursive: true });

    const id = randomUUID();
    const safeName = file.name.replace(/[^\w.\-]+/g, '_');
    const diskPath = join(uploadsDir, `${id}__${safeName}`);

    await writeFile(diskPath, buf);

    // Fallback: use filename (without extension) as title when blank
    const fallbackTitle = parse(file.name).name;
    const title = rawTitle || fallbackTitle;

    addDocument({
      title,
      type,
      description,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      diskPath,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Upload error', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
