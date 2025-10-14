//src/app/api/admin/documents/file/[id]/route.ts
import { getDocument } from '@/../lib/adminDocumentsStore';
import { readFile } from 'fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const doc = getDocument(params.id);
  if (!doc) {
    return new Response('Not found', { status: 404 });
  }

  const data = await readFile(doc.diskPath);
  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
