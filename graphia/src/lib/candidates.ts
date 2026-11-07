import 'server-only';
import type { PoolClient } from 'pg';
import { query, transaction } from './db';
import { MAX_PARTICIPANTS } from './env';
import type { CandidateRowInput } from './validation';
import type { StatusValue } from './constants';

export type Candidate = CandidateRowInput & {
  id: string;
  application_number: string;
  status: StatusValue;
  score_details: Record<string, number | null> | null;
  selection_score: number | null;
  admin_notes: string | null;
  consent: boolean;
  consent_at: Date;
  created_at: Date;
  updated_at: Date;
};

export type ListFilters = {
  q?: string;
  city?: string;
  profile?: string;
  level?: string;
  status?: string;
  sort?: string;
  dir?: string;
  page?: number;
  perPage?: number;
};

const SORTS: Record<string, string> = {
  date: 'created_at',
  numero: 'application_number',
  nom: 'lower(last_name), lower(first_name)',
  ville: 'lower(city)',
  score: 'selection_score',
  statut: 'status',
};

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (m) => '\\' + m);
}

function whereClause(f: ListFilters) {
  const conds: string[] = [];
  const params: unknown[] = [];
  const add = (sql: string, v: unknown) => {
    params.push(v);
    conds.push(sql.replace('?', `$${params.length}`));
  };
  if (f.q?.trim()) {
    params.push(`%${escapeLike(f.q.trim())}%`);
    const p = `$${params.length}`;
    const digits = f.q.replace(/\D/g, '');
    let phoneCond = '';
    if (digits.length >= 4) {
      params.push(`%${digits}%`);
      phoneCond = ` OR phone_normalized LIKE $${params.length}`;
    }
    conds.push(
      `(first_name ILIKE ${p} OR last_name ILIKE ${p} OR (first_name || ' ' || last_name) ILIKE ${p} OR (last_name || ' ' || first_name) ILIKE ${p} OR application_number ILIKE ${p} OR email ILIKE ${p}${phoneCond})`,
    );
  }
  if (f.city) add('lower(trim(city)) = lower(trim(?))', f.city);
  if (f.profile) add('professional_profile = ?', f.profile);
  if (f.level) add('experience_level = ?', f.level);
  if (f.status) add('status = ?::candidate_status', f.status);
  return { where: conds.length ? `WHERE ${conds.join(' AND ')}` : '', params };
}

export async function listCandidates(f: ListFilters) {
  const { where, params } = whereClause(f);
  const sortCol = SORTS[f.sort ?? ''] ?? SORTS.date;
  const dir = f.dir === 'asc' ? 'ASC' : 'DESC';
  const perPage = Math.min(Math.max(Math.floor(f.perPage ?? 25), 1), 10_000);
  const page = Math.max(Math.floor(f.page ?? 1), 1);
  const total = Number((await query<{ n: string }>(`SELECT count(*) AS n FROM candidates ${where}`, params)).rows[0].n);
  const { rows } = await query<Candidate>(
    `SELECT * FROM candidates ${where} ORDER BY ${sortCol} ${dir} NULLS LAST, created_at DESC
     LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`,
    params,
  );
  return { rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function filterOptions() {
  const { rows } = await query<{ city: string }>(
    `SELECT min(trim(city)) AS city FROM candidates GROUP BY lower(trim(city)) ORDER BY count(*) DESC, min(city)`,
  );
  return { cities: rows.map((r) => r.city) };
}

export async function getCandidate(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { rows } = await query<Candidate>('SELECT * FROM candidates WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function getAttachments(candidateId: string) {
  const { rows } = await query<{ id: string; file_name: string; mime_type: string; size_bytes: number }>(
    'SELECT id, file_name, mime_type, size_bytes FROM candidate_attachments WHERE candidate_id = $1 ORDER BY created_at',
    [candidateId],
  );
  return rows;
}

export type NotificationRow = {
  id: string;
  notification_type: string;
  channel: string;
  status: string;
  error: string | null;
  created_at: Date;
  sent_at: Date | null;
  sent_by_name: string | null;
};

export async function getNotifications(candidateId: string) {
  const { rows } = await query<NotificationRow>(
    `SELECT n.id, n.notification_type, n.channel, n.status, n.error, n.created_at, n.sent_at, a.name AS sent_by_name
     FROM notifications n LEFT JOIN administrators a ON a.id = n.sent_by
     WHERE n.candidate_id = $1 ORDER BY n.created_at DESC LIMIT 50`,
    [candidateId],
  );
  return rows;
}

export async function getStats() {
  const { rows } = await query<Record<string, string>>(
    `SELECT count(*) AS total,
       count(*) FILTER (WHERE created_at >= (date_trunc('day', now() AT TIME ZONE 'Africa/Dakar') AT TIME ZONE 'Africa/Dakar')) AS today,
       count(*) FILTER (WHERE status = 'en_attente') AS en_attente,
       count(*) FILTER (WHERE status = 'preselectionne') AS preselectionne,
       count(*) FILTER (WHERE status = 'retenu') AS retenu,
       count(*) FILTER (WHERE status = 'non_retenu') AS non_retenu,
       count(*) FILTER (WHERE selection_score IS NOT NULL) AS scored
     FROM candidates`,
  );
  const r = Object.fromEntries(Object.entries(rows[0]).map(([k, v]) => [k, Number(v)]));
  const byCity = await query<{ label: string; n: string }>(
    `SELECT min(trim(city)) AS label, count(*) AS n FROM candidates GROUP BY lower(trim(city)) ORDER BY count(*) DESC LIMIT 6`,
  );
  const byProfile = await query<{ label: string; n: string }>(
    `SELECT professional_profile AS label, count(*) AS n FROM candidates GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
  );
  return {
    total: r.total,
    today: r.today,
    en_attente: r.en_attente,
    preselectionne: r.preselectionne,
    retenu: r.retenu,
    non_retenu: r.non_retenu,
    scored: r.scored,
    max: MAX_PARTICIPANTS,
    places: Math.max(0, MAX_PARTICIPANTS - r.retenu),
    byCity: byCity.rows.map((x) => ({ label: x.label, n: Number(x.n) })),
    byProfile: byProfile.rows.map((x) => ({ label: x.label, n: Number(x.n) })),
  };
}

export async function audit(c: PoolClient | null, adminId: string, candidateId: string | null, action: string, details?: unknown) {
  const sql = 'INSERT INTO audit_log (admin_id, candidate_id, action, details) VALUES ($1, $2, $3, $4)';
  const params = [adminId, candidateId, action, details === undefined ? null : JSON.stringify(details)];
  if (c) await c.query(sql, params);
  else await query(sql, params);
}

export class CapacityError extends Error {}

/** Change le statut ; refuse de dépasser le nombre de places pour « retenu » (verrou contre deux validations simultanées). */
export async function setStatus(id: string, status: StatusValue, adminId: string) {
  return transaction(async (c) => {
    await c.query('SELECT pg_advisory_xact_lock(2026050)');
    const cur = await c.query<{ status: StatusValue }>('SELECT status FROM candidates WHERE id = $1 FOR UPDATE', [id]);
    if (!cur.rows[0]) return null;
    if (status === 'retenu' && cur.rows[0].status !== 'retenu') {
      const n = Number((await c.query<{ n: string }>(`SELECT count(*) AS n FROM candidates WHERE status = 'retenu'`)).rows[0].n);
      if (n >= MAX_PARTICIPANTS) {
        throw new CapacityError(`Les ${MAX_PARTICIPANTS} places sont déjà attribuées. Retirez d'abord un candidat retenu.`);
      }
    }
    await c.query('UPDATE candidates SET status = $2::candidate_status WHERE id = $1', [id, status]);
    await audit(c, adminId, id, 'status', { from: cur.rows[0].status, to: status });
    return { from: cur.rows[0].status, to: status };
  });
}

export async function setScores(
  id: string,
  scores: Record<string, number | null>,
  total: number | null,
  notes: string | undefined,
  adminId: string,
) {
  return transaction(async (c) => {
    const res = await c.query(
      `UPDATE candidates SET score_details = $2, selection_score = $3, admin_notes = COALESCE($4, admin_notes) WHERE id = $1`,
      [id, JSON.stringify(scores), total, notes ?? null],
    );
    if (res.rowCount) await audit(c, adminId, id, 'score', { scores, total });
    return res.rowCount === 1;
  });
}

/** Colonnes saisies par le candidat (insertion) et modifiables par un administrateur. */
export const CANDIDATE_COLUMNS: (keyof CandidateRowInput)[] = [
  'first_name', 'last_name', 'birth_date', 'gender', 'phone', 'phone_normalized', 'whatsapp', 'email', 'city', 'neighborhood',
  'professional_profile', 'professional_profile_other', 'experience_level', 'experience_duration', 'work_mode', 'has_clients',
  'has_portfolio', 'software_skills', 'software_other', 'uses_ai', 'ai_tools', 'skill_to_improve', 'main_challenge',
  'motivation', 'expectations', 'professional_ambition', 'knowledge_usage', 'portfolio_url', 'behance_url', 'instagram_url',
  'facebook_url', 'available_five_days', 'commitment',
];

export async function updateCandidate(id: string, row: CandidateRowInput, adminId: string) {
  return transaction(async (c) => {
    const sets = CANDIDATE_COLUMNS.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const res = await c.query(`UPDATE candidates SET ${sets} WHERE id = $1`, [id, ...CANDIDATE_COLUMNS.map((k) => row[k])]);
    if (res.rowCount) await audit(c, adminId, id, 'edit');
    return res.rowCount === 1;
  });
}

export async function deleteCandidate(id: string, adminId: string) {
  return transaction(async (c) => {
    const res = await c.query<{ application_number: string }>(
      'DELETE FROM candidates WHERE id = $1 RETURNING application_number',
      [id],
    );
    if (res.rows[0]) await audit(c, adminId, null, 'delete', { application_number: res.rows[0].application_number, id });
    return res.rows[0] ?? null;
  });
}

/** Erreur PostgreSQL de doublon → message lisible. */
export function duplicateMessage(err: unknown): string | null {
  const e = err as { code?: string; constraint?: string };
  if (e?.code !== '23505') return null;
  if (e.constraint === 'candidates_phone_unique') return 'Ce numéro de téléphone est déjà utilisé par une autre candidature.';
  if (e.constraint === 'candidates_email_unique') return 'Cette adresse e-mail est déjà utilisée par une autre candidature.';
  return 'Cette candidature existe déjà.';
}
