// Bande-son complète, sans ressource externe : musique originale synthétisée,
// bruitages synthétisés, voix off placée phrase par phrase, ducking de la musique
// sous la voix, normalisation à -14 LUFS (cible YouTube).
// Sorties : public/audio/mix.wav (utilisé par le rendu), out/audio/*.wav (pistes séparées),
// out/sous-titres.srt.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const timeline = JSON.parse(readFileSync(join(root, "src/timeline.json"), "utf8"));
const vo = JSON.parse(readFileSync(join(root, "src/voiceover.json"), "utf8"));

const SR = 48000;
const DUR = timeline.durationInFrames / timeline.fps;
const N = Math.round(DUR * SR);
const f2s = (f) => f / timeline.fps;
const TAU = Math.PI * 2;

// ---------- utilitaires ----------
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const buf = () => [new Float32Array(N), new Float32Array(N)];
const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

const add = (bus, t0, mono, gain = 1, pan = 0) => {
  const s0 = Math.round(t0 * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < mono.length; i++) {
    const j = s0 + i;
    if (j < 0 || j >= N) continue;
    bus[0][j] += mono[i] * gl;
    bus[1][j] += mono[i] * gr;
  }
};

const env = (i, n, a, r) => {
  const t = i / SR;
  const len = n / SR;
  return clamp01(t / a) * clamp01((len - t) / r);
};

// Oscillateur en dents de scie à bande limitée (polyBLEP).
const sawSample = (phase, dt) => {
  let v = 2 * phase - 1;
  if (phase < dt) {
    const t = phase / dt;
    v -= t + t - t * t - 1;
  } else if (phase > 1 - dt) {
    const t = (phase - 1) / dt;
    v -= t * t + t + t + 1;
  }
  return v;
};

const lowpass = (x, cutoffAt) => {
  let y = 0;
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const fc = cutoffAt(i);
    const a = 1 - Math.exp((-TAU * fc) / SR);
    y += a * (x[i] - y);
    out[i] = y;
  }
  return out;
};

// ---------- instruments ----------
const pad = (notes, dur, { attack = 1.2, release = 1.5, cutoff = 1200, level = 0.12 } = {}) => {
  const n = Math.round(dur * SR);
  const x = new Float32Array(n);
  notes.forEach((m) => {
    [-0.07, 0, 0.07].forEach((det) => {
      const f = midi(m + det);
      let ph = rnd() * 0.5 + 0.5;
      for (let i = 0; i < n; i++) {
        ph = (ph + f / SR) % 1;
        x[i] += sawSample(ph, f / SR) * 0.33;
      }
    });
  });
  const y = lowpass(x, (i) => cutoff * (0.6 + 0.4 * Math.sin((i / SR) * 0.8)));
  for (let i = 0; i < n; i++) y[i] *= env(i, n, attack, release) * level;
  return y;
};

const pluck = (m, dur = 0.45, level = 0.16, bright = 3500) => {
  const n = Math.round(dur * SR);
  const f = midi(m);
  const x = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    ph = (ph + f / SR) % 1;
    x[i] = sawSample(ph, f / SR) * 0.6 + Math.sin(TAU * ph * 2) * 0.2;
  }
  const y = lowpass(x, (i) => 300 + bright * Math.exp(-(i / SR) * 9));
  for (let i = 0; i < n; i++) y[i] *= Math.exp(-(i / SR) * 6) * clamp01((i / SR) / 0.004) * level;
  return y;
};

const bass = (m, dur, level = 0.3) => {
  const n = Math.round(dur * SR);
  const f = midi(m);
  const y = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    ph = (ph + f / SR) % 1;
    y[i] = (Math.sin(TAU * ph) + 0.25 * Math.sin(TAU * ph * 2)) * env(i, n, 0.01, 0.08) * level;
  }
  return y;
};

const kick = (level = 0.8) => {
  const n = Math.round(0.45 * SR);
  const y = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 48 + 110 * Math.exp(-t * 28);
    ph += f / SR;
    y[i] = Math.sin(TAU * ph) * Math.exp(-t * 7) * level;
  }
  return y;
};

const noiseHit = (dur, decay, cutoff, level) => {
  const n = Math.round(dur * SR);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = rnd();
  const lp = lowpass(x, () => cutoff);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) y[i] = (x[i] - lp[i]) * Math.exp(-(i / SR) * decay) * level; // passe-haut
  return y;
};

const clap = () => {
  const y = noiseHit(0.3, 18, 1200, 0.35);
  return lowpass(y, () => 6000);
};

// ---------- bruitages ----------
const whoosh = (dur = 0.7, level = 0.3, rising = true) => {
  const n = Math.round(dur * SR);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = rnd();
  const y = lowpass(x, (i) => {
    const p = i / n;
    return rising ? 300 + 5000 * Math.sin(p * Math.PI) ** 2 : 5000 - 4500 * p;
  });
  for (let i = 0; i < n; i++) y[i] *= Math.sin((i / n) * Math.PI) ** 1.5 * level;
  return y;
};

const impact = (level = 1, length = 1.8) => {
  const n = Math.round(length * SR);
  const y = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (38 + 40 * Math.exp(-t * 6)) / SR;
    y[i] = Math.sin(TAU * ph) * Math.exp(-t * 2.4) * 0.9;
  }
  const hit = lowpass(noiseHit(0.5, 9, 80, 0.6), () => 2500);
  for (let i = 0; i < hit.length; i++) y[i] += hit[i];
  for (let i = 0; i < n; i++) y[i] *= level;
  return y;
};

const riser = (dur, level = 0.25) => {
  const n = Math.round(dur * SR);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = rnd();
  const y = lowpass(x, (i) => 200 + 7000 * (i / n) ** 2.2);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    ph += (110 + 330 * p * p) / SR;
    y[i] = (y[i] * 0.8 + Math.sin(TAU * ph) * 0.15) * p ** 1.8 * level;
  }
  return y;
};

const blip = (f0, f1, dur, level) => {
  const n = Math.round(dur * SR);
  const y = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    ph += (f0 + (f1 - f0) * p) / SR;
    y[i] = Math.sin(TAU * ph) * Math.exp(-p * 5) * clamp01(i / 60) * level;
  }
  return y;
};

const click = () => {
  const y = noiseHit(0.03, 140, 2000, 0.5);
  const tick = blip(2400, 1800, 0.02, 0.25);
  for (let i = 0; i < tick.length; i++) y[i] += tick[i];
  return y;
};

// Cloche FM (dessin sonore original) : deux frappes « ding-ding ».
const bellTone = (f, dur, level) => {
  const n = Math.round(dur * SR);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const index = 3.2 * Math.exp(-t * 3);
    const mod = Math.sin(TAU * f * 1.4 * t) * index;
    y[i] =
      (Math.sin(TAU * f * t + mod) * Math.exp(-t * 2.2) +
        0.35 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t * 4) +
        0.2 * Math.sin(TAU * f * 5.4 * t) * Math.exp(-t * 7)) *
      clamp01(i / 40) *
      level;
  }
  return y;
};

const shimmer = (dur, level) => {
  const n = Math.round(dur * SR);
  const y = new Float32Array(n);
  [88, 91, 95, 100].forEach((m, k) => {
    const f = midi(m);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      y[i] += Math.sin(TAU * f * t) * (0.5 + 0.5 * Math.sin(TAU * (5 + k) * t)) * Math.exp(-t * 1.6) * clamp01(t / 0.05) * level;
    }
  });
  return y;
};

// ---------- réverbération simple (Schroeder) ----------
const reverb = (bus, mix = 0.22) => {
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.round((d * SR) / 44100));
  const out = buf();
  for (let c = 0; c < 2; c++) {
    const x = bus[c];
    const wet = new Float32Array(N);
    combs.forEach((d, k) => {
      const dd = d + c * 23 + k * 7;
      const line = new Float32Array(dd);
      let idx = 0;
      let lp = 0;
      for (let i = 0; i < N; i++) {
        const yv = line[idx];
        lp = yv * 0.7 + lp * 0.3;
        line[idx] = x[i] + lp * 0.78;
        idx = (idx + 1) % dd;
        wet[i] += yv * 0.25;
      }
    });
    for (let i = 0; i < N; i++) out[c][i] = x[i] + wet[i] * mix;
  }
  return out;
};

// ---------- musique ----------
const BPM = 100;
const BEAT = 60 / BPM;
const music = buf();
const groove = 9.0;
const end = 30.0;
// Progression : la mineur – fa – do – sol (1 mesure = 4 temps).
const chords = [
  [57, 60, 64],
  [53, 57, 60],
  [55, 60, 64],
  [55, 59, 62],
];
const roots = [45, 41, 48, 43];

// Intro mystérieuse (0–4 s) : nappe grave, pulsation, montée.
add(music, 0, pad([45, 52, 57], 5.2, { attack: 2.5, release: 1.2, cutoff: 500, level: 0.16 }), 1, 0);
for (let t = 1.2; t < 4.0; t += BEAT) add(music, t, kick(0.35), 1);
add(music, 1.6, riser(2.6, 0.22), 1);

// Révélation (4–9 s) : nappe qui s'ouvre, arpèges qui montent.
add(music, 4.3, pad([45, 52, 57, 60, 64], 5.2, { attack: 0.6, release: 0.8, cutoff: 1600, level: 0.13 }), 1);
for (let k = 0, t = 5.2; t < groove; k++, t += BEAT / 2) {
  const notes = [69, 72, 76, 79, 81, 79, 76, 72];
  add(music, t, pluck(notes[k % 8], 0.4, 0.06 + (t - 5.2) * 0.02, 1500 + (t - 5.2) * 600), 1, k % 2 ? 0.35 : -0.35);
}
for (let t = 7.0; t < groove; t += BEAT) add(music, t, kick(0.5), 1);
add(music, groove - 1.1, riser(1.1, 0.18), 1);

// Groove principal (9–30 s).
for (let bar = 0; groove + bar * 4 * BEAT < end; bar++) {
  const t0 = groove + bar * 4 * BEAT;
  const c = bar % 4;
  add(music, t0, pad(chords[c].map((m) => m + 12), 4 * BEAT + 0.4, { attack: 0.08, release: 0.4, cutoff: 2200, level: 0.07 }), 1);
  for (let b = 0; b < 4; b++) {
    const t = t0 + b * BEAT;
    if (t >= end) break;
    add(music, t, kick(0.75), 1);
    if (b % 2 === 1) add(music, t, clap(), 0.8, 0.1);
    add(music, t, bass(roots[c], BEAT * 0.45), 1);
    add(music, t + BEAT / 2, bass(roots[c] + 12, BEAT * 0.3, 0.18), 1);
    add(music, t + BEAT / 2, noiseHit(0.06, 60, 7000, 0.12), 1, 0.3);
    add(music, t, noiseHit(0.03, 90, 8000, 0.06), 1, -0.3);
  }
  const motif = [0, 2, 1, 2, 0, 2, 1, 3];
  for (let s = 0; s < 8; s++) {
    const m = chords[c][motif[s] % 3] + 24 + (motif[s] === 3 ? 2 : 0);
    add(music, t0 + s * BEAT / 2, pluck(m, 0.35, 0.045, 2800), 1, s % 2 ? 0.4 : -0.4);
  }
}

// Conclusion (30–35 s) : accord tenu, impact final mémorable.
add(music, f2s(timeline.events.outroImpact) - 0.05, pad([45, 52, 57, 60, 64, 69], 4.8, { attack: 0.05, release: 1.6, cutoff: 2600, level: 0.12 }), 1);
const finalT = f2s(timeline.events.finalFlash);
add(music, finalT, pad([33, 45, 52, 57, 64, 69, 72], DUR - finalT, { attack: 0.01, release: 1.0, cutoff: 3200, level: 0.13 }), 1);
add(music, finalT, kick(1), 1);

const musicVerb = reverb(music, 0.3);

// ---------- bruitages ----------
const sfx = buf();
add(sfx, f2s(timeline.events.lineSweep) - 0.1, whoosh(1.2, 0.28), 1, -0.5);
timeline.transitions.forEach((f) => add(sfx, f2s(f) - 0.45, whoosh(0.7, 0.3), 1));
add(sfx, f2s(timeline.events.logoImpact), impact(0.6, 1.2), 1);
add(sfx, f2s(timeline.events.logoImpact) + 0.05, shimmer(1.6, 0.03), 1);
timeline.events.cards.forEach((f, i) => add(sfx, f2s(f), whoosh(0.4, 0.14), 1, [-0.6, 0, 0.6][i]));
add(sfx, f2s(timeline.events.buttonPop), blip(520, 880, 0.18, 0.25), 1);
add(sfx, f2s(timeline.events.subscribeClick), click(), 1, 0.2);
add(sfx, f2s(timeline.events.subscribeClick) + 0.04, bellTone(1046, 0.6, 0.06), 1);
add(sfx, f2s(timeline.scenes.bell.from), whoosh(0.8, 0.22), 1);
add(sfx, f2s(timeline.events.bellClick), click(), 1, 0.2);
add(sfx, f2s(timeline.events.bellClick) + 0.03, bellTone(1318, 2.2, 0.16), 1, -0.1);
add(sfx, f2s(timeline.events.bellClick) + 0.21, bellTone(1568, 2.0, 0.12), 1, 0.1);
add(sfx, f2s(timeline.events.outroImpact), impact(0.45, 1.0), 1);
add(sfx, finalT, impact(1.0, DUR - finalT), 1);
add(sfx, finalT, shimmer(DUR - finalT, 0.05), 1);
const sfxVerb = reverb(sfx, 0.18);

// ---------- voix off ----------
const voPcm = (() => {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", join(root, vo.source), "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"], {
    maxBuffer: 1 << 28,
  });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
})();
const voice = buf();
const voiceActive = new Float32Array(N);
vo.phrases.forEach((p) => {
  const a = Math.round(p.srcStart * SR);
  const b = Math.round(p.srcEnd * SR);
  const seg = voPcm.slice(a, b);
  const fade = Math.round(0.03 * SR);
  for (let i = 0; i < seg.length; i++) seg[i] *= clamp01(i / fade) * clamp01((seg.length - i) / fade);
  add(voice, p.at, seg, 1.0, 0);
  for (let i = Math.round(p.at * SR); i < Math.min(N, Math.round((p.at + seg.length / SR) * SR)); i++) voiceActive[i] = 1;
});

// Ducking : la musique baisse de ~14 dB pendant la voix (attaque 60 ms, relâche 350 ms).
const duck = new Float32Array(N);
{
  let g = 1;
  const att = Math.exp(-1 / (0.06 * SR));
  const rel = Math.exp(-1 / (0.35 * SR));
  // Anticipation de 80 ms pour que la musique soit déjà basse au premier mot.
  const look = Math.round(0.08 * SR);
  for (let i = 0; i < N; i++) {
    const target = voiceActive[Math.min(N - 1, i + look)] ? 0.2 : 1;
    const k = target < g ? att : rel;
    g = target + (g - target) * k;
    duck[i] = g;
  }
}

// ---------- mixage ----------
const mix = buf();
for (let c = 0; c < 2; c++) {
  for (let i = 0; i < N; i++) {
    const v = musicVerb[c][i] * 0.9 * duck[i] + sfxVerb[c][i] * 0.85 + voice[c][i] * 1.5;
    mix[c][i] = Math.tanh(v * 1.1) / 1.1; // écrêtage doux de sécurité
  }
}
// Fondu de fin (évite toute coupure sèche).
for (let c = 0; c < 2; c++) for (let i = N - Math.round(0.3 * SR); i < N; i++) mix[c][i] *= (N - i) / (0.3 * SR);

const writeWav = (path, [l, r]) => {
  mkdirSync(dirname(path), { recursive: true });
  const data = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, l[i])) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, r[i])) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28);
  h.writeUInt16LE(4, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
};

const scale = (b, k) => [b[0].map((x) => x * k), b[1].map((x) => x * k)];
writeWav(join(root, "out/audio/musique.wav"), scale(musicVerb, 0.9));
writeWav(join(root, "out/audio/bruitages.wav"), scale(sfxVerb, 0.85));
writeWav(join(root, "out/audio/voix-off.wav"), scale(voice, 1.5));
const rawMix = join(root, "out/audio/mix-brut.wav");
writeWav(rawMix, mix);

// Normalisation EBU R128 : -14 LUFS intégrés, crête vraie -1,5 dBTP.
mkdirSync(join(root, "public/audio"), { recursive: true });
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-i", rawMix,
  "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
  "-ar", String(SR), "-ac", "2", "-c:a", "pcm_s16le",
  join(root, "public/audio/mix.wav"),
]);

// Sous-titres (utiles pour le visionnage sans le son).
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const srt = vo.phrases
  .map((p, i) => `${i + 1}\n${ts(p.at)} --> ${ts(p.at + (p.srcEnd - p.srcStart))}\n${p.text}\n`)
  .join("\n");
writeFileSync(join(root, "out/sous-titres.srt"), srt);

console.log(`Audio : ${DUR.toFixed(2)} s, ${vo.phrases.length} phrases de voix off, public/audio/mix.wav écrit.`);
