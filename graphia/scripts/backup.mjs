// Sauvegarde complète de la base avec pg_dump (doit être installé : paquet postgresql-client).
// Le fichier est écrit dans ./backups/ (ignoré par git). À copier ensuite hors du serveur.
import 'dotenv/config';
import { spawn } from 'node:child_process';
import { mkdirSync, createWriteStream } from 'node:fs';

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL manquant.'); process.exit(1); }
mkdirSync('backups', { recursive: true });
const file = `backups/graphia-${new Date().toISOString().replace(/[:.]/g, '-')}.dump`;
const out = createWriteStream(file, { mode: 0o600 });
const dump = spawn('pg_dump', ['--format=custom', '--no-owner', url], { stdio: ['ignore', 'pipe', 'inherit'] });
dump.stdout.pipe(out);
dump.on('error', (e) => { console.error('pg_dump introuvable :', e.message); process.exit(1); });
dump.on('close', (code) => {
  if (code !== 0) { console.error(`pg_dump a échoué (code ${code}).`); process.exit(code); }
  console.log(`Sauvegarde écrite : ${file}\nRestauration : pg_restore --clean --no-owner -d "$DATABASE_URL" ${file}`);
});
