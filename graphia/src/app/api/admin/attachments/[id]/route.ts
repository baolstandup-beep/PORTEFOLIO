import { adminFor } from '@/lib/auth';
import { query } from '@/lib/db';
import { jsonError } from '@/lib/request';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminFor('view');
  if (!admin) return jsonError('Accès refusé.', 403);
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return jsonError('Introuvable.', 404);
  const { rows } = await query<{ file_name: string; mime_type: string; data: Buffer }>(
    'SELECT file_name, mime_type, data FROM candidate_attachments WHERE id = $1',
    [id],
  );
  const f = rows[0];
  if (!f) return jsonError('Introuvable.', 404);
  const inline = f.mime_type.startsWith('image/');
  return new Response(new Uint8Array(f.data), {
    headers: {
      'Content-Type': f.mime_type,
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${f.file_name}"`,
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}
