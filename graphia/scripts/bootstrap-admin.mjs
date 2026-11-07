// Crée le tout premier administrateur au déploiement, uniquement si la table est vide.
// Variables : ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD (12 caractères min.), ADMIN_BOOTSTRAP_NAME (facultatif).
// Sans effet si un administrateur existe déjà : le mot de passe changé depuis le site n'est jamais écrasé.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || '';
const name = process.env.ADMIN_BOOTSTRAP_NAME || 'Administrateur GRAPHIA';

if (!url || !email || !password) {
  console.log('[bootstrap-admin] rien à faire (base ou variables absentes).');
  process.exit(0);
}
if (password.length < 12) {
  console.error('[bootstrap-admin] ADMIN_BOOTSTRAP_PASSWORD : 12 caractères minimum.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  const { rows } = await client.query('SELECT count(*)::int AS n FROM administrators');
  if (rows[0].n > 0) {
    console.log('[bootstrap-admin] un administrateur existe déjà : aucune modification.');
  } else {
    await client.query(
      `INSERT INTO administrators (name, email, password_hash, role) VALUES ($1, $2, $3, 'superadmin')`,
      [name, email, await bcrypt.hash(password, 12)],
    );
    console.log(`[bootstrap-admin] administrateur créé : ${email}`);
  }
} finally {
  await client.end();
}
