"""Bande-son originale synthétisée (aucun échantillon sous licence).

Pad cinématique en ré mineur, arpèges, percussions inspirées du djembé + shaker,
whooshes avant chaque coupe, impacts sur les grands titres, montée finale.
Les instants sont calés sur src/timeline.ts (30 fps).
Usage : python3 scripts/generate_audio.py
  -> public/audio/bande-son.wav  (musique + bruitages)
  -> public/audio/bruitages.wav  (bruitages seuls, sans musique)
"""
import wave
import numpy as np

SR = 48000
DUR = 40.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR
CUTS = [f / 30 for f in (120, 270, 480, 630, 810, 1050)]
BPM = 96
BEAT = 60 / BPM

# Pistes : 'music' (pad, arpèges, percussions), 'sfx' (whooshes, impacts, montée),
# 'sfx_extra' (petits bruitages d'animation, uniquement dans la version bruitages).
BUS = {k: (np.zeros(N), np.zeros(N)) for k in ('music', 'sfx', 'sfx_extra')}


def add(sig, start, gain=1.0, pan=0.0, bus='music'):
    L, R = BUS[bus]
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def env(n, a, d):
    e = np.ones(n)
    na, nd = int(a * SR), int(d * SR)
    e[:na] = np.linspace(0, 1, na)
    if nd:
        e[-nd:] *= np.linspace(1, 0, nd)
    return e


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):  # simple one-pole
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def bandnoise(n, lo, hi):
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    x = np.fft.irfft(spec, n)
    return x / (np.abs(x).max() + 1e-9)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


# --- Pad : i - VI - III - VII (Dm, Bb, F, C), un accord par mesure ----------
chords = [[50, 57, 62, 65], [46, 53, 58, 62], [53, 57, 60, 65], [48, 55, 60, 64]]
bar = BEAT * 4
nbars = int(DUR / bar) + 1
pad = np.zeros(N)
for b in range(nbars):
    st = b * bar
    n = int((bar + 0.6) * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for m in chords[b % 4]:
        for det in (-0.12, 0.0, 0.12):
            ph = 2 * np.pi * hz(m + det) * tt
            sig += np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
    sig *= env(n, 0.6, 0.6) / 30
    i = int(st * SR)
    seg = sig[: N - i] if i < N else sig[:0]
    pad[i : i + len(seg)] += seg
pad = lowpass(pad, 1400)
# dynamique : intro douce, montée progressive, sommet sur la scène finale
dyn = np.interp(t, [0, 4, 16, 27, 35, 38, 40], [0.45, 0.6, 0.75, 0.85, 1.0, 0.9, 0.0])
add(pad * dyn, 0, 0.9)

# --- Arpèges (à partir de 4 s) ---------------------------------------------
step = BEAT / 2
k = 0
s = 4.0
while s < 38.5:
    b = int(s / bar)
    notes = chords[b % 4]
    m = notes[[0, 2, 3, 2, 1, 3, 2, 3][k % 8]] + 12
    n = int(0.9 * SR)
    tt = np.arange(n) / SR
    ph = 2 * np.pi * hz(m) * tt
    sig = (np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.1 * np.sin(4 * ph)) * np.exp(-tt * 5)
    lvl = np.interp(s, [4, 9, 27, 35, 38], [0.10, 0.16, 0.2, 0.22, 0.12])
    add(sig, s, lvl, pan=0.35 * np.sin(k))
    k += 1
    s += step

# --- Percussions type djembé + shaker --------------------------------------
def djembe_bass():
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    f = 70 + 60 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)


def djembe_tone():
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    f = 260 + 80 * np.exp(-tt * 40)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 22) + 0.2 * bandnoise(n, 800, 3000) * np.exp(-tt * 60))


def djembe_slap():
    n = int(0.15 * SR)
    tt = np.arange(n) / SR
    return bandnoise(n, 1500, 7000) * np.exp(-tt * 45) + 0.4 * np.sin(2 * np.pi * 420 * tt) * np.exp(-tt * 40)


def shaker():
    n = int(0.08 * SR)
    tt = np.arange(n) / SR
    return bandnoise(n, 5000, 12000) * np.exp(-tt * 70)


B, T, S = djembe_bass(), djembe_tone(), djembe_slap()
# motif sur 16 doubles-croches : B=basse, t=ton, s=claque
pattern = 'B..t..s.B.t.s.t.'
s16 = BEAT / 4
pos = 9.0  # entrée des percussions sur la scène du lieu
i = 0
while pos < 35.0:
    lvl = np.interp(pos, [9, 16, 21, 27, 35], [0.25, 0.35, 0.5, 0.6, 0.7])
    c = pattern[i % 16]
    if c == 'B':
        add(B, pos, 0.9 * lvl)
    elif c == 't':
        add(T, pos, 0.55 * lvl, pan=-0.3)
    elif c == 's' and pos > 16:
        add(S, pos, 0.45 * lvl, pan=0.3)
    if pos > 21:
        add(shaker(), pos, 0.12 * lvl * (1.3 if i % 2 else 0.8), pan=0.5)
    i += 1
    pos += s16

# --- Whooshes avant chaque coupe -------------------------------------------
for c in CUTS:
    n = int(0.7 * SR)
    tt = np.arange(n) / SR
    noise = bandnoise(n, 300, 9000)
    sweep = lowpass(noise * np.sin(np.pi * tt / 0.7) ** 2, 2500)
    add(sweep / (np.abs(sweep).max() + 1e-9), c - 0.55, 0.22, pan=0.0, bus='sfx')

# --- Impacts sur les grands titres ----------------------------------------
def impact(strength=1.0):
    n = int(2.5 * SR)
    tt = np.arange(n) / SR
    f = 42 + 50 * np.exp(-tt * 8)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.2)
    hit = bandnoise(n, 100, 4000) * np.exp(-tt * 18) * 0.35
    return (boom + hit) * strength


add(impact(0.75), 4.0 + 4 / 30, bus='sfx')  # INAUGURATION
add(impact(0.6), 16.0 + 26 / 30, bus='sfx')  # « 08 »
add(impact(0.5), 21.0 + 112 / 30, bus='sfx')  # compteur à 100
add(impact(0.9), 35.0, bus='sfx')  # final

# --- Montée avant le final -------------------------------------------------
n = int(3.0 * SR)
tt = np.arange(n) / SR
riser = bandnoise(n, 400, 10000) * (tt / 3.0) ** 2
riser += 0.3 * np.sin(2 * np.pi * np.cumsum(200 + 600 * (tt / 3) ** 2) / SR) * (tt / 3) ** 2
add(riser, 32.0, 0.18, bus='sfx')

# --- Réverbération (convolution FFT) + mastering ----------------------------
ir_n = int(2.2 * SR)
irt = np.arange(ir_n) / SR
ir = rng.standard_normal(ir_n) * np.exp(-irt * 3.2)
ir[0] = 0
ir /= np.sqrt((ir ** 2).sum())


def conv(x):
    m = len(x) + ir_n
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]


# --- Bruitages d'animation (version bruitages seulement) --------------------
def pop(freq=900, dur=0.18):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = freq * (1 + 0.6 * np.exp(-tt * 40))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 28) + 0.25 * bandnoise(n, 2000, 8000) * np.exp(-tt * 80)


def shimmer(dur=1.2):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    sig = sum(np.sin(2 * np.pi * hz(m) * tt + k) for k, m in enumerate([86, 90, 93, 98]))
    return sig / 4 * np.exp(-tt * 3) * np.minimum(1, tt * 40)


def tick():
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    return bandnoise(n, 2500, 9000) * np.exp(-tt * 200)


F = 1 / 30
add(shimmer(1.6), 12 * F, 0.35, bus='sfx_extra')  # logo d'intro
add(pop(700), (270 + 6) * F, 0.5, bus='sfx_extra')  # épingle LIEU
add(pop(500, 0.3), (480 + 8) * F, 0.5, bus='sfx_extra')  # calendrier
add(pop(800), (630 + 4) * F, 0.45, bus='sfx_extra')  # « 4ème »
last = -1
for fr in range(56, 113):  # tic du compteur 0 → 100
    c = round(100 * (1 - (1 - (fr - 56) / 56) ** 2.2))
    if c // 4 != last:
        last = c // 4
        add(tick(), (630 + fr) * F, 0.35, pan=0.2 * np.sin(fr), bus='sfx_extra')
add(shimmer(1.2), (810 + 10) * F, 0.3, bus='sfx_extra')  # logo contact
add(pop(650), (810 + 34) * F, 0.45, pan=-0.3, bus='sfx_extra')  # QR Wave
add(pop(750), (810 + 44) * F, 0.45, pan=0.3, bus='sfx_extra')  # QR Orange Money
for k in range(17):  # chiffres du numéro
    add(tick(), (810 + 96 + k * 1.6) * F, 0.25, pan=-0.5 + k / 16, bus='sfx_extra')
add(shimmer(1.4), (810 + 150) * F, 0.35, bus='sfx_extra')  # reflet du numéro
add(shimmer(2.0), (1050 + 4) * F, 0.35, bus='sfx_extra')  # logo final

fade = np.interp(t, [0, 0.3, 38.6, 40], [0, 1, 1, 0])


def master(buses, path, mode):
    L = sum(BUS[b][0] for b in buses)
    R = sum(BUS[b][1] for b in buses)
    Lw, Rw = L + 0.28 * conv(L), R + 0.28 * conv(np.roll(R, 371))
    mix = np.stack([Lw, Rw], 1) * fade[:, None]
    if mode == 'rms':  # piste continue : niveau moyen ≈ -16 dBFS RMS
        mix *= 10 ** (-16 / 20) / np.sqrt((mix ** 2).mean())
    else:  # piste ponctuelle : normalisation sur la crête
        mix *= 1.05 / np.abs(mix).max()
    mix = 0.89 * np.tanh(mix / 0.89)  # limiteur doux : crête < -1 dBFS
    pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(path, 'OK', 'peak', round(float(np.abs(mix).max()), 3))


master(['music', 'sfx'], 'public/audio/bande-son.wav', 'rms')
master(['sfx', 'sfx_extra'], 'public/audio/bruitages.wav', 'peak')
