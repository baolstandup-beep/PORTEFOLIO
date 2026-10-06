// Lit les WAV de public/assets/voiceover/ et écrit src/config/vo-durations.ts.
//   node scripts/vo-durations.mjs
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('public/assets/voiceover');
const durations = {};
const wavDuration = (file) => {
  const b = fs.readFileSync(file);
  let off = 12, byteRate = 0, dataSize = 0;
  while (off + 8 <= b.length) {
    const id = b.toString('ascii', off, off + 4);
    const size = b.readUInt32LE(off + 4);
    if (id === 'fmt ') byteRate = b.readUInt32LE(off + 16);
    if (id === 'data') { dataSize = Math.min(size, b.length - off - 8); break; }
    off += 8 + size + (size % 2);
  }
  return byteRate ? dataSize / byteRate : 0;
};
if (fs.existsSync(dir)) {
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.wav')) continue;
    durations[f.replace(/\.wav$/, '')] = +wavDuration(path.join(dir, f)).toFixed(3);
  }
}
fs.writeFileSync(
  path.resolve('src/config/vo-durations.ts'),
  `// Durées (s) des fichiers de voix off — généré par \`npm run vo-durations\`.\n// Une phrase absente de cette liste est considérée comme sans fichier et n'est pas jouée.\nexport const VO_DURATIONS: Record<string, number> = ${JSON.stringify(durations, null, 2)};\n`,
);
console.log('✓ vo-durations', durations);
