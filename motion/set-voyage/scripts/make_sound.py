"""Bande-son originale de l'animation, entièrement synthétisée (libre de droits).

Nappe musicale de fond + effets calés sur le minutage de src/layout.ts :
trait lumineux, construction des arcs, passage de l'avion, atterrissage,
lettres SET, révélation de VOYAGE, slogan, reflets et impact final.

Usage : python3 scripts/make_sound.py
Sortie : public/assets/audio/soundtrack.wav (48 kHz, stéréo, 10 s)
"""

import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/assets/audio/soundtrack.wav"

SR = 48000
DUR = 10.0
N = int(SR * DUR)
T = np.arange(N) / SR
rng = np.random.default_rng(7)

# Minutage (secondes) repris de src/layout.ts (images / 30).
F = 30
LINE = (6 / F, 44 / F)
DOME = (34 / F, 104 / F)
PLANE = (56 / F, 112 / F)
LAND = 112 / F
SET = [120 / F + i * 5 / F + 0.12 for i in range(4)]
VOYAGE = (136 / F, 178 / F)
SLOGAN = [182 / F + i * 6 / F + 0.08 for i in range(5)]
SHEEN = (206 / F, 246 / F)
FINAL = 228 / F
SHEEN2 = (258 / F, 292 / F)


def note(name):
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3,
             "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[pitch] + 12 * (octave - 4)) / 12)


def env(start, attack, hold, release, shape=1.0):
    """Enveloppe : montée, maintien, extinction."""
    t = T - start
    e = np.zeros(N)
    a = (t >= 0) & (t < attack)
    e[a] = (t[a] / attack) ** shape
    h = (t >= attack) & (t < attack + hold)
    e[h] = 1
    r = t >= attack + hold
    e[r] = np.exp(-(t[r] - attack - hold) / release)
    return e


def band(signal, lo, hi):
    """Filtre passe-bande par FFT (coupures douces)."""
    spec = np.fft.rfft(signal)
    f = np.fft.rfftfreq(len(signal), 1 / SR)
    gain = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(spec * gain, len(signal))


def sweep(signal, centers, width=1.2):
    """Passe-bande dont la fréquence centrale suit centers(t) (blocs superposés)."""
    size, hop = 2048, 512
    win = np.hanning(size)
    out = np.zeros(len(signal) + size)
    norm = np.zeros(len(signal) + size)
    f = np.fft.rfftfreq(size, 1 / SR)
    for i in range(0, len(signal) - size, hop):
        c = centers((i + size / 2) / SR)
        gain = np.exp(-0.5 * (np.log2(np.maximum(f, 1) / c) / width) ** 2)
        block = np.fft.irfft(np.fft.rfft(signal[i:i + size] * win) * gain, size)
        out[i:i + size] += block * win
        norm[i:i + size] += win ** 2
    return (out / np.maximum(norm, 1e-3))[: len(signal)]


def saw(freq, voices=3, harmonics=14, detune=0.006):
    """Dent de scie douce en synthèse additive, voix légèrement désaccordées."""
    out = np.zeros(N)
    for v in range(voices):
        f = freq * (1 + detune * (v - (voices - 1) / 2))
        phase = rng.uniform(0, 2 * np.pi)
        for k in range(1, harmonics + 1):
            if f * k > 9000:
                break
            out += np.sin(2 * np.pi * f * k * T + phase * k) / k * np.exp(-k / 5)
    return out / voices


def sine(freq, phase=0.0):
    return np.sin(2 * np.pi * freq * T + phase)


def reverb(x, seconds=2.4, mix=0.3, seed=1):
    """Réverbération par convolution avec une réponse de bruit décroissant."""
    r = np.random.default_rng(seed)
    n = int(SR * seconds)
    t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t / (seconds / 6.9))
    ir = band(np.pad(ir, (0, 0)), 200, 7000)[:n]
    ir /= np.sqrt(np.sum(ir ** 2))
    size = len(x) + n
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return x * (1 - mix) + wet * mix * 3


def stereo(mono, pan):
    """pan : -1 gauche, 1 droite (scalaire ou tableau)."""
    pan = np.clip(pan, -1, 1)
    return np.stack([mono * np.cos((pan + 1) * np.pi / 4), mono * np.sin((pan + 1) * np.pi / 4)])


L = np.zeros((2, N))

# ---------------------------------------------------------------- nappe de fond
chords = [
    (0.0, 4.2, ["D3", "A3", "E4", "F#4"]),
    (4.0, 2.2, ["B2", "F#3", "D4", "A4"]),
    (6.0, 1.8, ["G2", "D3", "B3", "F#4"]),
    (FINAL, 10.0 - FINAL, ["D2", "D3", "A3", "F#4", "A4"]),
]
pad = np.zeros(N)
for start, length, notes in chords:
    e = env(start, 0.9 if start == 0 else 0.35, length - 0.3, 0.6)
    for n_ in notes:
        pad += saw(note(n_)) * e
# Lente respiration du filtre (trémolo doux).
pad *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.25 * T)
pad = band(pad, 70, 3200)
L += stereo(pad * 0.05, 0) + stereo(np.roll(pad, 480) * 0.03, 0.6) + stereo(np.roll(pad, 720) * 0.03, -0.6)

# Basse sous les accords à partir du texte.
bass = np.zeros(N)
for start, length, notes in chords[1:]:
    bass += sine(note(notes[0]) / 2) * env(start, 0.05, length - 0.2, 0.5)
L += stereo(bass * 0.16, 0)

# ---------------------------------------------------------------- pulsation (à partir de SET)
beat = 0.6
for i, t0 in enumerate(np.arange(SET[0] - 0.12, FINAL - 0.05, beat)):
    t = T - t0
    m = (t >= 0) & (t < 0.5)
    kick = np.zeros(N)
    kick[m] = np.sin(2 * np.pi * (50 * t[m] + 60 * (1 - np.exp(-t[m] * 30)) / 30)) * np.exp(-t[m] * 9)
    L += stereo(kick * 0.32, 0)
    # Charleston sur le contretemps.
    hat = band(rng.standard_normal(N), 7000, 16000) * env(t0 + beat / 2, 0.002, 0, 0.035)
    L += stereo(hat * 0.12, 0.3 if i % 2 else -0.3)

# ---------------------------------------------------------------- scène 1 : trait lumineux
shimmer = np.zeros(N)
for k, f0 in enumerate([1760, 2217, 2637, 3520]):
    glide = f0 * (1 + 0.04 * np.clip((T - LINE[0]) / (LINE[1] - LINE[0]), 0, 1))
    shimmer += np.sin(2 * np.pi * np.cumsum(glide) / SR + k)
shimmer *= env(LINE[0], LINE[1] - LINE[0], 0, 0.5, shape=2) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * T))
pan_line = np.clip(-1 + 2 * (T - LINE[0]) / (LINE[1] - LINE[0]), -1, 1) * 0.8
L += stereo(shimmer * 0.025, pan_line)

riser = sweep(rng.standard_normal(N), lambda t: 400 * 2 ** (4 * np.clip((t - 0.1) / 1.6, 0, 1)), 0.6)
L += stereo(riser * env(0.1, 1.5, 0, 0.3, shape=2.5) * 0.05, 0)

# Construction des arcs : souffle grave qui enfle.
swell = band(rng.standard_normal(N), 120, 900) * env(DOME[0], DOME[1] - DOME[0] - 0.4, 0, 0.5, shape=2)
L += stereo(swell * 0.05, -0.2)

# ---------------------------------------------------------------- scène 2 : passage de l'avion
p0, p1 = PLANE
mid = p0 + (p1 - p0) * 0.35
whoosh = sweep(rng.standard_normal(N),
               lambda t: 300 * 2 ** (3.2 * np.exp(-((t - mid) / 0.45) ** 2)), 0.9)
w_env = np.exp(-((T - mid) / 0.55) ** 2) * (T > p0 - 0.6)
pan_plane = np.clip(0.9 - 1.1 * (T - p0) / (p1 - p0), -0.3, 0.9)
L += stereo(whoosh * w_env * 0.22, pan_plane)
rumble = band(rng.standard_normal(N), 40, 220) * w_env
L += stereo(rumble * 0.18, pan_plane * 0.5)
# Sifflement de réacteur avec effet Doppler.
doppler = 1400 * (1 + 0.12 * np.tanh(-(T - mid) * 3))
jet = np.sin(2 * np.pi * np.cumsum(doppler) / SR) * w_env
L += stereo(jet * 0.02, pan_plane)

# Atterrissage : impact doux + carillon.
t = T - LAND
m = t >= 0
thump = np.zeros(N)
thump[m] = np.sin(2 * np.pi * (45 * t[m] + 40 * (1 - np.exp(-t[m] * 20)) / 20)) * np.exp(-t[m] * 6)
L += stereo(thump * 0.35, 0.3)
bell = np.zeros(N)
for f0, a in [(note("A5"), 1), (note("E6"), 0.6), (note("A6"), 0.35)]:
    bell += sine(f0) * a * env(LAND, 0.004, 0, 1.1)
L += stereo(bell * 0.05, 0.35)

# ---------------------------------------------------------------- scène 3 : SET- et VOYAGE
for i, t0 in enumerate(SET):
    t = T - t0
    m = (t >= 0) & (t < 0.4)
    hit = np.zeros(N)
    hit[m] = np.sin(2 * np.pi * (90 + 15 * i) * t[m]) * np.exp(-t[m] * 18)
    click = band(rng.standard_normal(N), 2000, 9000) * env(t0, 0.001, 0, 0.012)
    L += stereo(hit * 0.3 + click * 0.15, -0.7 + i * 0.25)

v0, v1 = VOYAGE
reveal = sweep(rng.standard_normal(N), lambda t: 800 * 2 ** (3 * np.clip((t - v0) / (v1 - v0), 0, 1)), 0.5)
L += stereo(reveal * env(v0, (v1 - v0) * 0.7, 0, 0.35, shape=1.5) * 0.08,
            np.clip(-0.2 + 1.0 * (T - v0) / (v1 - v0), -0.2, 0.8))
sparkle_notes = ["D6", "F#6", "A6", "D7"]
for k, n_ in enumerate(sparkle_notes):
    L += stereo(sine(note(n_)) * env(v0 + 0.2 + k * 0.25, 0.003, 0, 0.35) * 0.025, -0.2 + k * 0.3)

# ---------------------------------------------------------------- scène 4 : slogan et reflet
for i, t0 in enumerate(SLOGAN):
    pluck = np.zeros(N)
    for k in range(1, 6):
        pluck += sine(note(["D5", "E5", "F#5", "A5", "B5"][i]) * k) / k ** 1.6
    L += stereo(pluck * env(t0, 0.003, 0, 0.18) * 0.05, -0.6 + i * 0.3)


def glitter(span, count, level, seed):
    r = np.random.default_rng(seed)
    out = np.zeros((2, N))
    s0, s1 = span
    for k in range(count):
        t0 = s0 + (s1 - s0) * k / count + r.uniform(0, 0.03)
        f0 = 2400 * 2 ** (k / count * 1.5) * r.uniform(0.98, 1.02)
        out += stereo(sine(f0) * env(t0, 0.002, 0, 0.12) * level, -0.8 + 1.6 * k / count)
    return out


L += glitter(SHEEN, 18, 0.018, 3)

# ---------------------------------------------------------------- scène 5 : impact final
t = T - FINAL
m = t >= 0
boom = np.zeros(N)
boom[m] = np.sin(2 * np.pi * (38 * t[m] + 50 * (1 - np.exp(-t[m] * 12)) / 12)) * np.exp(-t[m] * 2.2)
L += stereo(boom * 0.45, 0)
crash = band(rng.standard_normal(N), 3000, 14000) * env(FINAL, 0.003, 0, 0.9)
L += stereo(crash * 0.05, 0.2) + stereo(np.roll(crash, 900) * 0.05, -0.2)
L += glitter(SHEEN2, 10, 0.012, 5)

# ---------------------------------------------------------------- mixage
mix = np.stack([reverb(L[0], mix=0.28, seed=11), reverb(L[1], mix=0.28, seed=12)])
fade = np.clip((DUR - T) / 0.6, 0, 1) * np.clip(T / 0.05, 0, 1)
mix *= fade
mix = np.tanh(mix * 1.4) / 1.4  # limiteur doux
mix *= 0.89 / np.max(np.abs(mix))  # crête à -1 dBFS

OUT.parent.mkdir(parents=True, exist_ok=True)
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(str(OUT), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(OUT)
