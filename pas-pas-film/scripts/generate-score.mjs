// Bande sonore originale du film PAS-PAS, synthétisée de façon déterministe (aucun échantillon externe,
// aucun droit tiers). Les accents sont calés sur src/timeline.json : changer un repère là-bas déplace
// le son en même temps que l'image.
// Usage : node scripts/generate-score.mjs  →  public/assets/score.wav (48 kHz, stéréo, 16 bits)
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const timeline = JSON.parse(await readFile(new URL('src/timeline.json', root), 'utf8'));
const { fps, durationInFrames, cues } = timeline;
const t = (frame) => frame / fps;

const SR = 48000;
const DURATION = durationInFrames / fps;
const N = Math.round(SR * DURATION);
const L = new Float32Array(N);
const R = new Float32Array(N);

// Bruit pseudo-aléatoire reproductible.
let seed = 0x9e3779b9;
const rand = () => {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296) * 2 - 1;
};

const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const env = (time, a, b) => smooth((time - a) / (b - a));

const add = (i, v, pan = 0) => {
  L[i] += v * Math.cos((pan + 1) * Math.PI / 4);
  R[i] += v * Math.sin((pan + 1) * Math.PI / 4);
};

// 1. Nappe grave : la et mi, légèrement désaccordés, du premier au dernier instant.
for (let i = 0; i < N; i++) {
  const s = i / SR;
  const level = 0.16 * env(s, 0, 3.2) * (1 - env(s, t(cues.fadeOutStart), t(cues.silenceAt)));
  const wob = 1 + 0.002 * Math.sin(2 * Math.PI * 0.11 * s);
  const v = Math.sin(2 * Math.PI * 55 * wob * s) + 0.5 * Math.sin(2 * Math.PI * 82.41 * s) + 0.2 * Math.sin(2 * Math.PI * 110.3 * s);
  add(i, v * level * 0.55, -0.15);
  add(i, Math.sin(2 * Math.PI * 55.15 * s) * level * 0.4, 0.15);
}

// 2. Souffle filtré qui monte pendant l'ouverture, puis montée (riser) jusqu'au dévoilement.
{
  let lp = 0;
  let lp2 = 0;
  for (let i = 0; i < N; i++) {
    const s = i / SR;
    const air = 0.05 * env(s, 0.3, 3.5) * (1 - env(s, t(cues.reveal) + 0.3, t(cues.reveal) + 2.5));
    const rise = env(s, t(cues.riserStart), t(cues.reveal)) * (s < t(cues.reveal) ? 1 : 0);
    const cutoff = 300 + 3200 * rise * rise;
    const a = 1 - Math.exp(-2 * Math.PI * cutoff / SR);
    lp += a * (rand() - lp);
    lp2 += a * (lp - lp2);
    const sweep = Math.sin(2 * Math.PI * (180 + 520 * rise * rise) * s) * 0.05 * rise * rise;
    add(i, lp2 * (air + 0.2 * rise * rise) * 1.6 + sweep, Math.sin(s * 0.7) * 0.4);
  }
}

// 3. Impacts graves (dévoilement, finale) : sinus à glissement de hauteur, décroissance longue.
const impact = (at, gain) => {
  const start = Math.round(at * SR);
  for (let i = start; i < Math.min(N, start + SR * 3.5); i++) {
    const s = (i - start) / SR;
    const f = 42 + 50 * Math.exp(-s * 9);
    const phase = 2 * Math.PI * (42 * s + (50 / 9) * (1 - Math.exp(-s * 9)));
    const v = Math.sin(phase) * Math.exp(-s * 1.4) * (1 - Math.exp(-s * 400)) * gain;
    add(i, v + 0.15 * Math.tanh(3 * v) * (f > 60 ? 1 : 0.5));
  }
};
impact(t(cues.reveal), 0.55);
impact(t(cues.finale), 0.5);

// 4. Accords tenus : la m9 → fa maj9 → sol sus4 → do add9 (vi – IV – V – I).
const pad = (from, to, notes, gain) => {
  const a = Math.round(from * SR);
  const b = Math.min(N, Math.round((to + 2.5) * SR));
  for (let i = a; i < b; i++) {
    const s = i / SR;
    const level = gain * env(s, from, from + 1.6) * (1 - env(s, to - 0.3, to + 2.5)) * (1 - env(s, t(cues.fadeOutStart), t(cues.silenceAt)));
    if (level <= 0) continue;
    notes.forEach((m, k) => {
      const f = midi(m);
      const vib = 1 + 0.0015 * Math.sin(2 * Math.PI * (0.2 + k * 0.03) * s + k);
      let v = 0;
      for (let h = 1; h <= 4; h++) v += Math.sin(2 * Math.PI * f * h * vib * s + k * h) / (h * h);
      add(i, v * level / notes.length, (k / (notes.length - 1)) * 1.2 - 0.6);
    });
  }
};
const rev = t(cues.reveal);
const hero = t(cues.heroStart);
const title = t(cues.titleIn);
const fin = t(cues.finale);
pad(rev, hero, [45, 52, 55, 59, 60], 0.32);                 // la m9
pad(hero, title, [41, 48, 52, 55, 57], 0.32);               // fa maj9
pad(title, fin, [43, 50, 55, 60, 62], 0.3);                 // sol sus4
pad(fin, DURATION, [36, 48, 52, 55, 62, 64], 0.36);         // do add9

// 5. Cloches (FM douce) : arpège pendant la mise en valeur, accents sur le titre, l'accroche, la finale.
const bell = (at, m, gain, pan = 0) => {
  const start = Math.round(at * SR);
  const f = midi(m);
  for (let i = start; i < Math.min(N, start + SR * 2.8); i++) {
    const s = (i - start) / SR;
    const e = Math.exp(-s * 2.2) * (1 - Math.exp(-s * 300));
    const v = Math.sin(2 * Math.PI * f * s + 1.6 * Math.exp(-s * 3) * Math.sin(2 * Math.PI * f * 3.5 * s));
    add(i, v * e * gain, pan);
  }
};
const step = 60 / 100 / 2; // croches à 100 BPM
const arp = [[57, 60, 64, 67, 69, 67, 64, 60], [55, 59, 62, 67, 69, 67, 62, 59]];
for (let s = hero + 0.4, k = 0; s < fin - 0.2; s += step, k++) {
  const chord = s < title ? arp[0] : arp[1];
  const fadeIn = env(s, hero + 0.4, hero + 3);
  bell(s, chord[k % chord.length] + 12, 0.05 * fadeIn * (k % 4 === 0 ? 1.25 : 1), ((k % 3) - 1) * 0.5);
}
[[title, [79, 83, 86]], [t(cues.taglineIn), [81, 84]], [fin, [72, 76, 79, 84, 88]], [t(cues.pressLineIn), [86]]].forEach(([at, notes]) =>
  notes.forEach((m, k) => bell(at + k * 0.045, m, 0.09, (k - 1) * 0.35))
);

// 6. Souffle inversé avant le titre et avant la finale.
for (const at of [title, fin]) {
  let lp = 0;
  const a = Math.round((at - 1.2) * SR);
  for (let i = a; i < Math.round(at * SR); i++) {
    const s = (i - a) / SR / 1.2;
    lp += 0.25 * (rand() - lp);
    add(i, lp * 0.16 * s * s * s, Math.sin(i / SR * 3) * 0.6);
  }
}

// 7. Réverbération de Schroeder (stéréo décorrélée).
const reverb = (input, delays, ap) => {
  const out = new Float32Array(N);
  for (const d of delays) {
    const buf = new Float32Array(d);
    let idx = 0;
    let lp = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[idx];
      lp = y * 0.6 + lp * 0.4;
      buf[idx] = input[i] + lp * 0.82;
      out[i] += y / delays.length;
      idx = (idx + 1) % d;
    }
  }
  for (const d of ap) {
    const buf = new Float32Array(d);
    let idx = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[idx];
      const x = out[i] + y * 0.5;
      buf[idx] = x;
      out[i] = y - x * 0.5;
      idx = (idx + 1) % d;
    }
  }
  return out;
};
const wetL = reverb(L, [1557, 1617, 1491, 1422].map((d) => d * 2), [225, 556]);
const wetR = reverb(R, [1277, 1356, 1188, 1116].map((d) => d * 2), [341, 441]);

// 8. Mélange, saturation douce, normalisation à −1 dBFS, fin propre.
let peak = 0;
const mixL = new Float32Array(N);
const mixR = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const s = i / SR;
  const tail = 1 - env(s, DURATION - 0.6, DURATION - 0.05);
  mixL[i] = Math.tanh((L[i] * 0.8 + wetL[i] * 0.55) * 1.2) * tail;
  mixR[i] = Math.tanh((R[i] * 0.8 + wetR[i] * 0.55) * 1.2) * tail;
  peak = Math.max(peak, Math.abs(mixL[i]), Math.abs(mixR[i]));
}
const gain = 10 ** (-1 / 20) / peak;

const data = Buffer.alloc(44 + N * 4);
data.write('RIFF', 0); data.writeUInt32LE(36 + N * 4, 4); data.write('WAVE', 8);
data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
data.write('data', 36); data.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mixL[i] * gain)) * 32767), 44 + i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mixR[i] * gain)) * 32767), 46 + i * 4);
}
await mkdir(new URL('public/assets/', root), { recursive: true });
await writeFile(new URL('public/assets/score.wav', root), data);
console.log(`score.wav : ${DURATION.toFixed(2)} s, ${SR} Hz stéréo, crête −1 dBFS`);
