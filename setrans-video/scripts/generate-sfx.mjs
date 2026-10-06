// Génère la banque d'effets sonores du film (WAV 48 kHz, 16 bits, stéréo)
// dans public/assets/sfx/. Synthèse procédurale : libre de droits, sans dépendance.
//   node scripts/generate-sfx.mjs
import fs from 'node:fs';
import path from 'node:path';

const SR = 48000;
const OUT = path.resolve('public/assets/sfx');
fs.mkdirSync(OUT, { recursive: true });

// ---------- Outils DSP ----------
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const buf = (sec) => new Float32Array(Math.round(sec * SR));
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/** Enveloppe attaque / décroissance exponentielle. */
const envAD = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));
/** Enveloppe en cloche (montée puis descente) sur [0, dur]. */
const envBell = (t, dur, peak = 0.5, curve = 2) => {
  const x = t / dur;
  if (x <= 0 || x >= 1) return 0;
  return x < peak ? Math.pow(x / peak, curve) : Math.pow((1 - x) / (1 - peak), curve);
};

/** Filtre biquad RBJ (lowpass / highpass / bandpass) à fréquence variable. */
const biquad = (type) => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, f, q = 0.707) => {
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR;
    const cs = Math.cos(w), sn = Math.sin(w), al = sn / (2 * q);
    let b0, b1, b2;
    if (type === 'lp') { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; }
    else if (type === 'hp') { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; }
    else { b0 = al; b1 = 0; b2 = -al; }
    const a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};

/** Bruit brun (grave, « océan / grondement »). */
const brown = () => { let v = 0; return () => (v = Math.max(-1, Math.min(1, v + rnd() * 0.02))) * 3; };

/** Réverbération de Schroeder (4 combs + 2 allpass), mono → mono. */
const reverb = (input, mix = 0.25, size = 1, tailSec = 1.5) => {
  const out = new Float32Array(input.length + Math.round(tailSec * SR));
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d: Math.round(d * size), b: new Float32Array(Math.round(d * size)), i: 0 }));
  const aps = [225, 556].map((d) => ({ d, b: new Float32Array(d), i: 0 }));
  for (let n = 0; n < out.length; n++) {
    const x = n < input.length ? input[n] : 0;
    let s = 0;
    for (const c of combs) { const y = c.b[c.i]; c.b[c.i] = x + y * 0.84; c.i = (c.i + 1) % c.d; s += y; }
    s /= 4;
    for (const a of aps) { const y = a.b[a.i]; const v = s + y * 0.5; a.b[a.i] = v; a.i = (a.i + 1) % a.d; s = y - v * 0.5; }
    out[n] = x * (1 - mix) + s * mix;
  }
  return out;
};

const normalize = (b, peak = 0.89) => {
  let m = 0;
  for (const v of b) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < b.length; i++) b[i] *= peak / m;
  return b;
};
const fadeEdges = (b, inSec = 0.005, outSec = 0.03) => {
  const fi = Math.round(inSec * SR), fo = Math.round(outSec * SR);
  for (let i = 0; i < fi && i < b.length; i++) b[i] *= i / fi;
  for (let i = 0; i < fo && i < b.length; i++) b[b.length - 1 - i] *= i / fo;
  return b;
};

/** Écrit un WAV stéréo ; `pan` peut être une constante ou une fonction du temps (-1 → 1). */
const DURATIONS = {};
const writeWav = (name, mono, pan = 0, right = null) => {
  const n = mono.length;
  DURATIONS[name] = +(n / SR).toFixed(3);
  const data = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    let l, r;
    if (right) { l = mono[i]; r = right[i]; }
    else {
      const p = typeof pan === 'function' ? pan(i / SR) : pan;
      const a = ((p + 1) * Math.PI) / 4;
      l = mono[i] * Math.cos(a) * 1.414; r = mono[i] * Math.sin(a) * 1.414;
    }
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, l)) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, r)) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(OUT, `${name}.wav`), Buffer.concat([h, data]));
  console.log('✓', name, (n / SR).toFixed(2) + ' s');
};

// ---------- Sons ----------

/** Whoosh : bruit filtré passe-bande balayé, enveloppe en cloche. */
const whoosh = (dur, f0, f1, peak = 0.6, q = 1.2) => {
  const b = buf(dur), bp = biquad('bp'), lp = biquad('lp');
  for (let i = 0; i < b.length; i++) {
    const t = i / SR, x = t / dur;
    const f = f0 * Math.pow(f1 / f0, envBell(t, dur, peak, 1));
    b[i] = lp(bp(rnd(), f, q), 9000) * envBell(t, dur, peak, 2.2);
  }
  return fadeEdges(normalize(reverb(b, 0.2, 1, 0.6)));
};

/** Riser : bruit + sinus montants, accélération vers la fin. */
const riser = (dur, fStart = 200, fEnd = 2400) => {
  const b = buf(dur), bp = biquad('bp');
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR, x = t / dur;
    const f = fStart * Math.pow(fEnd / fStart, x * x);
    ph += (2 * Math.PI * f * 0.5) / SR;
    const e = Math.pow(x, 2.4) * (x > 0.97 ? (1 - x) / 0.03 : 1);
    b[i] = (bp(rnd(), f, 2) * 0.8 + Math.sin(ph) * 0.12) * e;
  }
  return normalize(reverb(b, 0.3, 1.1, 0.8));
};

/** Impact grave cinématographique (sub + corps + transitoire). */
const impact = (dur = 3, f0 = 70, f1 = 34, bright = 0.3) => {
  const b = buf(dur), lp = biquad('lp');
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const f = f1 + (f0 - f1) * Math.exp(-t / 0.12);
    ph += (2 * Math.PI * f) / SR;
    const sub = Math.sin(ph) * envAD(t, 0.004, 0.9);
    const body = lp(rnd(), 900) * envAD(t, 0.002, 0.18) * 0.9;
    const click = rnd() * envAD(t, 0.0005, 0.012) * bright;
    b[i] = sub + body + click;
  }
  return fadeEdges(normalize(reverb(b, 0.35, 1.3, 2.2)), 0.001, 0.4);
};

/** Note métallique / cloche (partiels inharmoniques). */
const bell = (dur, base, partials = [1, 2.76, 5.4, 8.93], decay = 0.6, gain = 1) => {
  const b = buf(dur);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    let s = 0;
    partials.forEach((p, k) => (s += Math.sin(2 * Math.PI * base * p * t) * Math.exp(-t / (decay / (k + 1))) / (k + 1)));
    b[i] = s * envAD(t, 0.002, 10) * gain;
  }
  return b;
};

/** Tic d'interface : sinus court et doux. */
const tick = (f = 1400, dur = 0.12) => {
  const b = buf(dur);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = Math.sin(2 * Math.PI * f * t) * envAD(t, 0.001, 0.025) + Math.sin(2 * Math.PI * f * 2 * t) * envAD(t, 0.001, 0.01) * 0.3;
  }
  return fadeEdges(normalize(reverb(b, 0.18, 0.7, 0.3), 0.7));
};

/** Pop d'apparition (bulle douce, glissando court). */
const pop = (f = 520, dur = 0.35) => {
  const b = buf(dur);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * f * (1 + 0.6 * Math.exp(-t / 0.02))) / SR;
    b[i] = Math.sin(ph) * envAD(t, 0.003, 0.07);
  }
  return fadeEdges(normalize(reverb(b, 0.25, 0.9, 0.5), 0.75));
};

/** Confirmation : deux notes ascendantes (quinte), timbre cristallin. */
const confirm = () => {
  const b = buf(1.4);
  const n1 = bell(1.4, 880, [1, 2, 3.01], 0.5, 0.6);
  const n2 = bell(1.3, 1318.5, [1, 2, 3.01], 0.6, 0.7);
  const off = Math.round(0.11 * SR);
  for (let i = 0; i < b.length; i++) b[i] = n1[i] + (i >= off ? n2[i - off] : 0);
  return fadeEdges(normalize(reverb(b, 0.3, 1, 0.8), 0.8));
};

/** Tampon : coup sourd + claquement. */
const stamp = () => {
  const b = buf(0.6), lp = biquad('lp'), bp = biquad('bp');
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (110 + 120 * Math.exp(-t / 0.01))) / SR;
    b[i] = Math.sin(ph) * envAD(t, 0.001, 0.06) + lp(rnd(), 2500) * envAD(t, 0.0005, 0.03) * 0.8 + bp(rnd(), 3500, 3) * envAD(t, 0.0005, 0.01) * 0.6;
  }
  return fadeEdges(normalize(reverb(b, 0.18, 0.8, 0.4)));
};

/** Clic de verrou : deux transitoires métalliques. */
const lockClick = () => {
  const b = buf(0.7);
  const hit = (start, f) => {
    const s = Math.round(start * SR);
    const r = bell(0.5, f, [1, 1.71, 2.93, 4.2], 0.08, 1);
    for (let i = 0; i < r.length && s + i < b.length; i++) b[s + i] += r[i] + rnd() * envAD(i / SR, 0.0003, 0.004) * 0.8;
  };
  hit(0, 2300);
  hit(0.085, 1700);
  return fadeEdges(normalize(reverb(b, 0.2, 0.7, 0.4)));
};

/** Fermeture de porte de conteneur : choc grave + résonance métallique. */
const doorSlam = () => {
  const b = buf(2.2), lp = biquad('lp');
  const ring = bell(2.2, 142, [1, 2.37, 4.13, 5.9, 8.2], 0.9, 0.35);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = lp(rnd(), 400) * envAD(t, 0.001, 0.09) * 2.2 + Math.sin(2 * Math.PI * 55 * t) * envAD(t, 0.002, 0.25) + ring[i];
  }
  return fadeEdges(normalize(reverb(b, 0.32, 1.2, 1.2)), 0.001, 0.3);
};

/** Scintillement (particules, lignes lumineuses) : petites cloches aléatoires. */
const shimmer = (dur, density = 14, fMin = 2000, fMax = 5200) => {
  const b = buf(dur);
  const notes = Math.round(dur * density);
  for (let k = 0; k < notes; k++) {
    const start = Math.round(((rnd() + 1) / 2) * (dur - 0.6) * SR);
    const f = fMin + ((rnd() + 1) / 2) * (fMax - fMin);
    const g = 0.2 + 0.8 * ((rnd() + 1) / 2);
    const r = bell(0.6, f, [1, 2.01], 0.18, g);
    for (let i = 0; i < r.length && start + i < b.length; i++) b[start + i] += r[i];
  }
  // Montée globale douce
  for (let i = 0; i < b.length; i++) b[i] *= envBell(i / SR, dur, 0.55, 1.2);
  return fadeEdges(normalize(reverb(b, 0.45, 1.3, 1.5), 0.7));
};

/** Nappe grave (gonflement d'ouverture). */
const swell = (dur, f = 55) => {
  const b = buf(dur), lp = biquad('lp');
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const s = Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 1.5 * t + 0.3) + 0.25 * Math.sin(2 * Math.PI * f * 2.01 * t);
    b[i] = (s * 0.6 + lp(rnd(), 300) * 0.8) * envBell(t, dur, 0.7, 1.6);
  }
  return fadeEdges(normalize(reverb(b, 0.3, 1.2, 1.5), 0.8));
};

/** Ambiance océan : bruit brun filtré, houle lente. */
const ocean = (dur) => {
  const L = buf(dur), R = buf(dur), b1 = brown(), b2 = brown(), lp1 = biquad('lp'), lp2 = biquad('lp'), hp1 = biquad('hp'), hp2 = biquad('hp');
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const wave = 0.55 + 0.45 * Math.sin(2 * Math.PI * t / 3.1) * Math.sin(2 * Math.PI * t / 4.7 + 1);
    const cut = 500 + 1400 * wave;
    L[i] = hp1(lp1(b1() + rnd() * 0.08, cut), 40) * wave;
    R[i] = hp2(lp2(b2() + rnd() * 0.08, cut * 0.9), 40) * (0.55 + 0.45 * Math.sin(2 * Math.PI * t / 3.4 + 2));
  }
  return [L, R];
};

/** Passage d'avion : grondement + sifflement de réacteur, effet Doppler et panoramique. */
const plane = (dur) => {
  const b = buf(dur), lp = biquad('lp'), bp = biquad('bp'), b1 = brown();
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR, x = t / dur;
    const near = Math.exp(-Math.pow((x - 0.5) / 0.28, 2));
    const dop = 1 + 0.06 * Math.tanh((0.5 - x) * 6);
    ph += (2 * Math.PI * 1850 * dop) / SR;
    b[i] = (lp(b1(), 180 + 500 * near) * 1.2 + bp(rnd(), 900 * dop, 1.5) * 0.35 + Math.sin(ph) * 0.03 * near) * (0.25 + 0.75 * near);
  }
  return fadeEdges(normalize(b, 0.8), 0.3, 0.6);
};

/** Ambiance portuaire : bourdonnement grave + chocs métalliques lointains. */
const port = (dur) => {
  const b = buf(dur), lp = biquad('lp'), b1 = brown();
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = lp(b1(), 220) * 0.9 + Math.sin(2 * Math.PI * 49 * t) * 0.05;
  }
  [0.7, 2.0, 3.1].forEach((s, k) => {
    const r = bell(1.6, 180 + k * 37, [1, 2.37, 4.13, 6.1], 0.5, 0.35);
    const off = Math.round(s * SR);
    for (let i = 0; i < r.length && off + i < b.length; i++) b[off + i] += r[i];
  });
  return fadeEdges(normalize(reverb(b, 0.4, 1.4, 0.5), 0.75), 0.3, 0.6);
};

/** Passage de camion : grondement moteur, montée puis éloignement. */
const truck = (dur, steady = false) => {
  const b = buf(dur), lp = biquad('lp'), b1 = brown();
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR, x = t / dur;
    const near = steady ? 0.7 + 0.1 * Math.sin(2 * Math.PI * t / 2.3) : Math.exp(-Math.pow((x - 0.45) / 0.3, 2));
    ph += (2 * Math.PI * (38 + 6 * near)) / SR;
    const engine = Math.sin(ph) + 0.5 * Math.sin(2 * ph) + 0.3 * Math.sin(3 * ph);
    b[i] = (engine * 0.25 + lp(b1(), 260 + 400 * near)) * (0.2 + 0.8 * near);
  }
  return fadeEdges(normalize(b, 0.8), 0.4, 0.8);
};

/** Vent léger (route sahélienne). */
const wind = (dur) => {
  const b = buf(dur), bp = biquad('bp');
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const g = 0.5 + 0.5 * Math.sin(2 * Math.PI * t / 2.7) * Math.sin(2 * Math.PI * t / 1.9 + 0.7);
    b[i] = bp(rnd(), 500 + 700 * g, 0.8) * (0.3 + 0.7 * g);
  }
  return fadeEdges(normalize(b, 0.7), 0.6, 0.8);
};

/** Flux de données (suivi numérique) : tics rapides, très légers. */
const dataStream = (dur) => {
  const b = buf(dur);
  for (let t = 0.05; t < dur - 0.1; t += 0.07 + ((rnd() + 1) / 2) * 0.09) {
    const f = 2400 + ((rnd() + 1) / 2) * 1800;
    const s = Math.round(t * SR);
    for (let i = 0; i < 0.03 * SR && s + i < b.length; i++) b[s + i] += Math.sin(2 * Math.PI * f * (i / SR)) * envAD(i / SR, 0.0005, 0.006) * 0.6;
  }
  for (let i = 0; i < b.length; i++) b[i] *= envBell(i / SR, dur, 0.4, 0.8);
  return fadeEdges(normalize(reverb(b, 0.3, 0.8, 0.4), 0.6));
};

// ---------- Export ----------
writeWav('swell-open', swell(6.5));
writeWav('whoosh-soft', whoosh(1.1, 300, 2600), (t) => -0.6 + t * 1.1);
writeWav('whoosh-deep', whoosh(1.6, 140, 1400, 0.65, 0.9), (t) => 0.5 - t * 0.6);
writeWav('whoosh-light', whoosh(0.7, 900, 5000, 0.5, 1.6), (t) => -0.4 + t * 1.2);
writeWav('riser-dive', riser(2.0, 150, 1800));
writeWav('riser-line', riser(2.4, 400, 3200));
writeWav('impact-soft', impact(3.2, 65, 38, 0.15));
writeWav('impact-final', impact(4.5, 80, 30, 0.35));
writeWav('tick', tick(1500));
writeWav('tick-high', tick(2100, 0.1));
writeWav('pop', pop(520));
writeWav('pop-high', pop(780));
writeWav('confirm', confirm());
writeWav('stamp', stamp());
writeWav('lock', lockClick());
writeWav('door-slam', doorSlam());
writeWav('shimmer', shimmer(3.2));
writeWav('shimmer-long', shimmer(4.5, 18, 1600, 5600));
writeWav('data-stream', dataStream(2.2));
{ const [L, R] = ocean(7.2); writeWav('amb-ocean', normalize(L, 0.7), 0, normalize(R, 0.7)); }
writeWav('amb-plane', plane(7), (t) => -0.8 + (t / 7) * 1.6);
writeWav('amb-port', port(4.2), 0.1);
writeWav('amb-truck-pass', truck(4.2), (t) => -0.7 + (t / 4.2) * 1.4);
writeWav('amb-truck-road', truck(6.6, true), 0);
writeWav('amb-wind', wind(6.6), 0);

// Durées exportées pour le calage des fondus dans Remotion.
fs.writeFileSync(
  path.resolve('src/config/sfx-durations.ts'),
  `// Fichier généré par scripts/generate-sfx.mjs — ne pas modifier à la main.\nexport const SFX_DURATIONS: Record<string, number> = ${JSON.stringify(DURATIONS, null, 2)};\n`,
);
console.log('✓ src/config/sfx-durations.ts');
