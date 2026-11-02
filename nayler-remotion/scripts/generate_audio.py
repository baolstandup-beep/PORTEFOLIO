"""Génère la bande-son de l'animation ÑAYLER (15 s, 44.1 kHz, stéréo).

Musique instrumentale afro moderne entièrement synthétisée (aucun sample
sous licence) : percussions type djembé / shaker / basse / kalimba, whooshes
calés sur les transitions, impact doux sur le titre et signature finale.
Les temps (en secondes) correspondent aux scènes de src/timeline.ts.
"""
import wave
import numpy as np

SR = 44100
DUR = 15.0
N = int(SR * DUR)
BPM = 112
BEAT = 60 / BPM
rng = np.random.default_rng(7)

# Repères (secondes) — miroir de src/timeline.ts
WHOOSHES = [0.05, 2.0, 5.25, 8.0, 10.73]  # frames 0, 60, 158, 240, 322
TITLE_IMPACT = 160 / 30
SIGNATURE = 342 / 30
END = 15.0


def t_arr(d):
    return np.arange(int(SR * d)) / SR


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(X, len(x))


def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buf[0, i : i + len(sig)] += sig * l
    buf[1, i : i + len(sig)] += sig * r


# --- instruments -----------------------------------------------------------
def djembe_bass():
    t = t_arr(0.35)
    f = 75 + 60 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)


def djembe_tone():
    t = t_arr(0.22)
    f = 230 + 80 * np.exp(-t * 40)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18)
    return s + 0.25 * bandpass(rng.standard_normal(len(t)), 600, 3000) * np.exp(-t * 60)


def djembe_slap():
    t = t_arr(0.12)
    n = bandpass(rng.standard_normal(len(t)), 1500, 7000)
    return n * np.exp(-t * 45) * 0.8 + np.sin(2 * np.pi * 420 * t) * np.exp(-t * 50) * 0.4


def shaker():
    t = t_arr(0.07)
    n = bandpass(rng.standard_normal(len(t)), 5000, 12000)
    env = np.minimum(1, t * 400) * np.exp(-t * 60)
    return n * env


def kalimba(freq, d=0.9):
    t = t_arr(d)
    s = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 25)
    return s * np.exp(-t * 4.5) * np.minimum(1, t * 800)


def bass(freq, d):
    t = t_arr(d)
    s = np.tanh(1.6 * np.sin(2 * np.pi * freq * t))
    return lowpass(s, 400) * np.exp(-t * 2.2) * np.minimum(1, t * 300)


def pad(freqs, d):
    t = t_arr(d)
    s = sum(np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.25 * t)) for f in freqs)
    env = np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.5)
    return lowpass(s, 1800) * env / len(freqs)


def whoosh(d=0.9, up=True):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    # balayage de filtre par blocs
    out = np.zeros_like(n)
    blocks = 24
    L = len(n) // blocks
    for b in range(blocks):
        p = b / (blocks - 1)
        c = 400 + (5000 if up else 2500) * (p if up else 1 - p)
        seg = n[b * L : (b + 1) * L + 256]
        out[b * L : (b + 1) * L] = bandpass(seg, c * 0.5, c * 1.6)[:L]
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return out * env


def impact():
    t = t_arr(1.6)
    boom = np.sin(2 * np.pi * np.cumsum(48 + 70 * np.exp(-t * 12)) / SR) * np.exp(-t * 3.2)
    body = lowpass(rng.standard_normal(len(t)), 900) * np.exp(-t * 14) * 0.6
    return boom + body


def chime(freqs, d=2.6):
    t = t_arr(d)
    s = sum(
        (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * (1.6 + i * 0.4))
        for i, f in enumerate(freqs)
    )
    return s * np.minimum(1, t * 600) / len(freqs)


# --- arrangement -----------------------------------------------------------
music = np.zeros((2, N))
sfx = np.zeros((2, N))

# notes (pentatonique mineure de A)
A2, C3, D3, E3, G3 = 110.0, 130.81, 146.83, 164.81, 196.0
A4, C5, D5, E5, G5, A5 = 440.0, 523.25, 587.33, 659.25, 783.99, 880.0

# Pad d'ambiance sur toute la durée
add(music, pad([A2 * 2, E3 * 2, C3 * 2 * 2], DUR), 0.0, 0.10)

bars = int(DUR / (BEAT * 4)) + 1
intro_beats = 4  # le groove complet entre après l'intro (≈2 s)
for k in range(bars * 16):  # double-croches
    at = k * BEAT / 4
    if at >= END - 0.6:
        break
    beat = k // 4
    step = k % 16
    full = beat >= intro_beats
    # shaker continu (accent sur les contretemps)
    add(music, shaker(), at + rng.normal(0, 0.004), 0.10 if step % 2 else 0.16, pan=0.35)
    if not full:
        continue
    if step in (0, 6, 10):
        add(music, djembe_bass(), at, 0.55)
    if step in (4, 12):
        add(music, djembe_slap(), at, 0.32, pan=-0.2)
    if step in (3, 7, 9, 14):
        add(music, djembe_tone(), at, 0.22, pan=-0.3)

# basse
bass_line = [A2, A2, C3, G3 / 2, A2, D3, E3, G3 / 2]
for i, f in enumerate(bass_line * 4):
    at = (intro_beats + i * 2) * BEAT
    if at > END - 1.5:
        break
    add(music, bass(f, BEAT * 1.8), at, 0.32)

# kalimba (motif + variations)
motif = [A4, C5, E5, D5, C5, E5, G5, E5]
for i in range(64):
    at = (intro_beats + i * 0.5) * BEAT
    if at > SIGNATURE - 0.2:
        break
    f = motif[i % len(motif)]
    if (i // 8) % 2 == 1 and i % 8 == 6:
        f = A5
    add(music, kalimba(f), at + rng.normal(0, 0.003), 0.11, pan=0.4 if i % 2 else -0.4)

# --- sound design -----------------------------------------------------------
for i, w in enumerate(WHOOSHES):
    add(sfx, whoosh(1.0, up=True), max(0.0, w - 0.45), 0.22 if i else 0.28, pan=-0.3 if i % 2 else 0.3)
add(sfx, impact(), TITLE_IMPACT, 0.55)
add(sfx, djembe_bass(), TITLE_IMPACT, 0.5)
# petits "ticks" de révélation sur le rendez-vous
for at in (255 / 30, 262 / 30, 280 / 30, 288 / 30):  # calendrier, MARDI, horloge, 20H00
    add(sfx, kalimba(A5 * 1.5, 0.4), at, 0.08)
# signature IYAT TV
add(sfx, chime([A4, E5, A5, C5 * 2]), SIGNATURE, 0.32)
add(sfx, impact(), SIGNATURE, 0.25)
add(sfx, whoosh(1.4, up=False), END - 1.3, 0.16)

# --- mix ---------------------------------------------------------------------
t = np.arange(N) / SR
fade = np.clip(t / 0.4, 0, 1) * np.clip((END - t) / 1.2, 0, 1)
mix = (music * 0.85 + sfx) * fade
mix = np.tanh(mix * 1.4) / np.tanh(1.4)  # saturation douce / limiteur
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89  # ≈ -1 dBFS crête

pcm = (mix.T * 32767).astype("<i2")
out = "public/audio/soundtrack.wav"
import os

os.makedirs("public/audio", exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("écrit", out)
