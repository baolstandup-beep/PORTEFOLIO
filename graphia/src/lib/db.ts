import 'server-only';
import { Pool, types, type PoolClient, type QueryResultRow } from 'pg';

// Les colonnes DATE restent des chaînes « AAAA-MM-JJ » (pas de décalage de fuseau horaire).
types.setTypeParser(1082, (v: string) => v);

const globalForPg = globalThis as unknown as { graphiaPool?: Pool };

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL manquant.');
  return new Pool({ connectionString, max: Number(process.env.PG_POOL_MAX ?? 5), idleTimeoutMillis: 10_000 });
}

export function pool(): Pool {
  if (!globalForPg.graphiaPool) globalForPg.graphiaPool = createPool();
  return globalForPg.graphiaPool;
}

/** Toujours des requêtes paramétrées ($1, $2…) : aucune valeur n'est concaténée dans le SQL. */
export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  return pool().query<T>(text, params);
}

export async function transaction<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
