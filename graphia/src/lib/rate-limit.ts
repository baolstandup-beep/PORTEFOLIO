import 'server-only';
import { query } from './db';

/**
 * Compteur à fenêtre fixe stocké dans PostgreSQL (fonctionne aussi en serverless, où la mémoire n'est pas partagée).
 * Renvoie true si l'action est autorisée.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const { rows } = await query<{ count: number }>(
    `INSERT INTO rate_limits (key, count, window_start) VALUES ($1, 1, now())
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN rate_limits.window_start < now() - make_interval(secs => $2) THEN 1 ELSE rate_limits.count + 1 END,
       window_start = CASE WHEN rate_limits.window_start < now() - make_interval(secs => $2) THEN now() ELSE rate_limits.window_start END
     RETURNING count`,
    [key, windowSeconds],
  );
  // Nettoyage occasionnel des anciennes entrées
  if (Math.random() < 0.02) {
    await query(`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`);
  }
  return rows[0].count <= limit;
}

export async function resetRateLimit(key: string) {
  await query('DELETE FROM rate_limits WHERE key = $1', [key]);
}
