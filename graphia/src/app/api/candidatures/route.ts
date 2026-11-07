import { after, NextResponse } from 'next/server';
import { transaction, query } from '@/lib/db';
import { applicationsClosed } from '@/lib/env';
import { CANDIDATE_COLUMNS, duplicateMessage } from '@/lib/candidates';
import { checkFileList, safeFileName, sniffMime } from '@/lib/files';
import { notify } from '@/lib/notifications';
import { rateLimit } from '@/lib/rate-limit';
import { clientIp, jsonError, sameOrigin } from '@/lib/request';
import { issuesToErrors, submissionSchema, toCandidateRow } from '@/lib/validation';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MIN_FILL_MS = 15_000; // un humain met plus de 15 s à remplir 6 étapes

type Created = { id: string; application_number: string; created_at: Date; first_name: string; last_name: string };

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (err) {
    // Base injoignable ou non configurée : message clair, les réponses restent sur l'appareil.
    console.error('[candidature] erreur serveur', err);
    return jsonError(
      "Le service d'inscription est momentanément indisponible. Vos réponses sont conservées sur cet appareil : réessayez dans quelques minutes.",
      503,
    );
  }
}

async function handle(req: Request) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  if (applicationsClosed()) return jsonError('Les candidatures sont closes.', 410);

  const ip = await clientIp();
  // Plusieurs candidats peuvent partager la même connexion (cybercafé) : limite large par adresse IP.
  if (!(await rateLimit(`submit:${ip}`, 20, 3600))) {
    return jsonError('Trop de candidatures envoyées depuis cette connexion. Réessayez dans une heure.', 429);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError('Envoi incomplet. Vérifiez votre connexion et réessayez.', 400);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(String(form.get('payload') ?? ''));
  } catch {
    return jsonError('Données illisibles.', 400);
  }

  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError('Certaines réponses sont à corriger.', 422, { fields: issuesToErrors(parsed.error.issues) });
  }
  const { values, submission_token, started_at, website } = parsed.data;

  // Robots : champ caché rempli ou formulaire rempli trop vite. Réponse volontairement vague.
  if (website || Date.now() - started_at < MIN_FILL_MS) {
    return jsonError("La candidature n'a pas pu être enregistrée. Relisez vos réponses puis réessayez.", 400);
  }

  // Pièces jointes : type vérifié sur le contenu réel, taille totale limitée.
  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  const listError = checkFileList(files);
  if (listError) return jsonError(listError, 413);
  const attachments: { name: string; mime: string; data: Buffer }[] = [];
  for (const f of files) {
    const data = Buffer.from(await f.arrayBuffer());
    const mime = sniffMime(data);
    if (!mime) return jsonError(`« ${f.name} » n'est pas une image JPG, PNG, WebP ou un PDF.`, 415);
    attachments.push({ name: safeFileName(f.name), mime, data });
  }

  // Même envoi répété (connexion lente, double clic) : on renvoie la candidature déjà créée.
  const existing = await query<Created>(
    'SELECT id, application_number, created_at, first_name, last_name FROM candidates WHERE submission_token = $1',
    [submission_token],
  );
  if (existing.rows[0]) return NextResponse.json(publicResult(existing.rows[0]));

  const row = toCandidateRow(values);
  let created: Created;
  try {
    created = await transaction(async (c) => {
      const cols = ['application_number', 'submission_token', ...CANDIDATE_COLUMNS, 'consent'];
      const placeholders = cols.map((_, i) => (i === 0 ? `'GRA26-' || lpad(nextval('application_number_seq')::text, 4, '0')` : `$${i}`));
      const params = [submission_token, ...CANDIDATE_COLUMNS.map((k) => row[k]), true];
      const ins = await c.query<Created>(
        `INSERT INTO candidates (${cols.join(', ')}) VALUES (${placeholders.join(', ')})
         RETURNING id, application_number, created_at, first_name, last_name`,
        params,
      );
      const cand = ins.rows[0];
      for (const a of attachments) {
        await c.query(
          'INSERT INTO candidate_attachments (candidate_id, file_name, mime_type, size_bytes, data) VALUES ($1, $2, $3, $4, $5)',
          [cand.id, a.name, a.mime, a.data.length, a.data],
        );
      }
      return cand;
    });
  } catch (err) {
    const dup = duplicateMessage(err);
    if (dup) {
      // Le même jeton a pu être inséré par une requête parallèle.
      const again = await query<Created>(
        'SELECT id, application_number, created_at, first_name, last_name FROM candidates WHERE submission_token = $1',
        [submission_token],
      );
      if (again.rows[0]) return NextResponse.json(publicResult(again.rows[0]));
      return jsonError(
        `${dup} Une seule candidature par personne est acceptée. En cas d'erreur, contactez l'équipe GRAPHIA.`,
        409,
      );
    }
    console.error('[candidature] échec insertion', err);
    return jsonError("Erreur du serveur : la candidature n'a pas été enregistrée. Vos réponses sont conservées, réessayez.", 500);
  }

  // Confirmation envoyée après la réponse : un service lent ne bloque pas le candidat.
  after(async () => {
    try {
      await notify(
        {
          id: created.id,
          first_name: created.first_name,
          last_name: created.last_name,
          application_number: created.application_number,
          email: row.email,
          phone_normalized: row.phone_normalized,
          whatsapp: row.whatsapp,
        },
        'confirmation',
      );
    } catch (e) {
      console.error('[candidature] notification de confirmation', e);
    }
  });

  return NextResponse.json(publicResult(created), { status: 201 });
}

function publicResult(c: Created) {
  return {
    applicationNumber: c.application_number,
    createdAt: new Date(c.created_at).toISOString(),
    firstName: c.first_name,
    lastName: c.last_name,
  };
}
