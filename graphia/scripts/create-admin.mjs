// Crée (ou réinitialise) un compte administrateur.
// Usage : npm run admin:create -- --email moi@exemple.com --name "Prénom Nom" [--role superadmin|admin|evaluateur]
// Le mot de passe est demandé dans le terminal (ou lu dans ADMIN_PASSWORD).
import 'dotenv/config';
import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);
const email = (args.email || '').trim().toLowerCase();
const name = (args.name || '').trim();
const role = args.role || 'superadmin';

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) {
  console.error('Usage : npm run admin:create -- --email moi@exemple.com --name "Prénom Nom" [--role superadmin|admin|evaluateur]');
  process.exit(1);
}
if (!['superadmin', 'admin', 'evaluateur'].includes(role)) {
  console.error('Rôle invalide : superadmin, admin ou evaluateur.');
  process.exit(1);
}

async function askHidden(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s); };
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); process.stdout.write('\n'); resolve(a); }));
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await askHidden('Mot de passe (12 caractères minimum) : ');
  const again = await askHidden('Confirmer le mot de passe : ');
  if (password !== again) { console.error('Les mots de passe ne correspondent pas.'); process.exit(1); }
}
if (password.length < 12) { console.error('Mot de passe trop court : 12 caractères minimum.'); process.exit(1); }

const hash = await bcrypt.hash(password, 12);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const { rows } = await client.query(
    `INSERT INTO administrators (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (lower(email)) DO UPDATE
       SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role,
           session_version = administrators.session_version + 1
     RETURNING (xmax = 0) AS inserted`,
    [name, email, hash, role],
  );
  console.log(rows[0].inserted ? `Administrateur créé : ${email} (${role})` : `Administrateur mis à jour : ${email} (${role}). Ses sessions ouvertes sont fermées.`);
} finally {
  await client.end();
}
