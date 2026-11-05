#!/usr/bin/env python3
"""
Génère la musique (instrumental afrobeat 120 BPM, 20 s) et les effets sonores
de la publicité POROKHANE SOOW, entièrement par synthèse (aucun sample tiers,
donc aucun problème de droits).

Sortie :
  public/audio/music.wav
  public/audio/sfx/{riser,impact,whoosh,splash,shimmer,final}.wav

NB : c'est une musique de maquette propre et libre de droits. Pour une diffusion
payante (sponsorisée), remplacez public/audio/music.wav par une piste afrobeat
sous licence (Artlist, Epidemic Sound...) : le code Remotion n'a pas à changer.
"""
import os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
BPM = 120
BEAT = 60 / BPM
STEP = BEAT / 4  # double-croche
DUR = 20.0
rng = np.random.default_rng(7)

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
os.makedirs(os.path.join(ROOT, "sfx"), exist_ok=True)


# ---------------------------------------------------------------- utilitaires
def t_of(n):
    return np.arange(n) / SR


def env_exp(n, decay):
    return np.exp(-t_of(n) / decay)


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return sosfilt(sos, x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def reverb(x, seconds=1.6, mix=0.25):
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-t_of(n) / (seconds / 5))
    ir = lp(ir, 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = fftconvolve(x, ir)[: len(x)]
    return x * (1 - mix) + wet * mix


def place(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def softclip(x, drive=1.0):
    return np.tanh(x * drive) / np.tanh(drive)


def save(name, x, stereo_width=0.0):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    if stereo_width:
        d = int(0.012 * SR)
        r = np.concatenate([np.zeros(d), x[:-d]])
        st = np.stack([x, x * (1 - stereo_width) + r * stereo_width], axis=1)
    else:
        st = np.stack([x, x], axis=1)
    wavfile.write(os.path.join(ROOT, name), SR, (st * 32767).astype(np.int16))


# ---------------------------------------------------------------- instruments
def kick():
    n = int(0.45 * SR)
    t = t_of(n)
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env_exp(n, 0.16)
    click = hp(rng.standard_normal(n), 3000) * env_exp(n, 0.004) * 0.3
    return softclip(body + click, 1.6)


def rim():
    n = int(0.12 * SR)
    s = bp(rng.standard_normal(n), 1500, 4500) * env_exp(n, 0.018)
    s += np.sin(2 * np.pi * 1700 * t_of(n)) * env_exp(n, 0.012) * 0.6
    return s


def snare():
    n = int(0.3 * SR)
    noise = bp(rng.standard_normal(n), 1800, 9000) * env_exp(n, 0.07)
    tone = np.sin(2 * np.pi * 190 * t_of(n)) * env_exp(n, 0.05)
    return noise * 0.8 + tone * 0.5


def shaker(acc=False):
    n = int(0.07 * SR)
    a = 1.0 if acc else 0.55
    e = np.minimum(1, t_of(n) / 0.008) * env_exp(n, 0.025)
    return hp(rng.standard_normal(n), 7000) * e * a


def log_drum(midi, length=0.38):
    """Basse 'log drum' (sinus + glissando + saturation), typique afro/amapiano."""
    n = int(length * SR)
    t = t_of(n)
    f0 = note_hz(midi)
    f = f0 * (1 + 0.35 * np.exp(-t / 0.02))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.3 * np.sin(2 * ph)
    return softclip(s * env_exp(n, length / 2.2), 2.2)


def pluck(midis, length=0.32):
    n = int(length * SR)
    t = t_of(n)
    out = np.zeros(n)
    for m in midis:
        f = note_hz(m)
        saw = 2 * ((t * f) % 1) - 1
        out += saw
    out = lp(out, 2600) * env_exp(n, 0.09)
    return out / len(midis)


def pad(midis, length):
    n = int(length * SR)
    t = t_of(n)
    out = np.zeros(n)
    for m in midis:
        for det in (-0.12, 0.0, 0.12):
            f = note_hz(m + det)
            out += 2 * ((t * f) % 1) - 1
    out = lp(out, 1400)
    att = np.minimum(1, t / 0.6)
    rel = np.minimum(1, (length - t) / 0.8)
    return out * att * np.clip(rel, 0, 1) / (len(midis) * 3)


def bell(midi, length=0.5):
    n = int(length * SR)
    t = t_of(n)
    f = note_hz(midi)
    s = np.sin(2 * np.pi * f * t + 1.8 * np.sin(2 * np.pi * f * 3.5 * t) * env_exp(n, 0.08))
    return s * env_exp(n, 0.18)


# ---------------------------------------------------------------- arrangement
# Progression en La mineur : Am - F - C - G (1 mesure chacun)
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
BASS = [45, 41, 36, 43]
N = int(DUR * SR) + SR
drums = np.zeros(N)
bass = np.zeros(N)
keys = np.zeros(N)
pads = np.zeros(N)

GROOVE_START = 3.0     # le groove démarre au "drop" de l'intro
BREAK_AT = 14.5        # mini-break avant le packshot
END_HIT = 19.0

KICK_STEPS = [0, 7, 8, 11]
RIM_STEPS = [3, 6, 10, 14]
SNARE_STEPS = [4, 12]
LOG_STEPS = [0, 3, 6, 10, 13]
STAB_STEPS = [2, 5, 10, 14]
BELL_STEPS = [0, 3, 6, 8, 10, 12, 14]

step = 0
t = GROOVE_START
while t < END_HIT:
    bar = int((t - GROOVE_START) // (BEAT * 4))
    s = step % 16
    chord = CHORDS[bar % 4]
    in_break = BREAK_AT <= t < 15.0
    if not in_break:
        if s in KICK_STEPS:
            place(drums, kick(), t, 1.0)
        if s in SNARE_STEPS:
            place(drums, snare(), t, 0.45)
        if s in RIM_STEPS:
            place(drums, rim(), t, 0.35)
        place(drums, shaker(s % 4 == 2), t, 0.22)
        if s in LOG_STEPS:
            place(bass, log_drum(BASS[bar % 4] + (12 if s == 13 else 0)), t, 0.9)
        if s in STAB_STEPS:
            place(keys, pluck([m + 12 for m in chord]), t, 0.5)
        if t >= 7.0 and s in BELL_STEPS:
            place(keys, bell(chord[(s // 2) % 3] + 24), t, 0.12)
    else:
        place(drums, shaker(True), t, 0.3)
    if s == 0:
        place(pads, pad(chord, BEAT * 4 + 0.4), t, 0.35)
    step += 1
    t += STEP

# intro : nappe + bell lointaine
place(pads, pad([57, 60, 64, 69], 3.4), 0.0, 0.5)
for i, m in enumerate([81, 76, 72, 76, 81, 84]):
    place(keys, bell(m, 0.9), 0.25 + i * 0.42, 0.10)

# fin : accord tenu
place(pads, pad([57, 60, 64, 69], 1.8), END_HIT, 0.6)
place(drums, kick(), END_HIT, 1.0)

music = (
    drums * 0.9
    + reverb(bass, 0.4, 0.08) * 0.8
    + reverb(keys, 1.8, 0.3) * 0.8
    + reverb(pads, 2.5, 0.35) * 0.55
)
music = music[: int(DUR * SR)]
# fondu de sortie
fade = int(0.8 * SR)
music[-fade:] *= np.linspace(1, 0, fade)
music = softclip(music / np.max(np.abs(music)) * 1.2, 1.3)
save("music.wav", music, stereo_width=0.35)


# ---------------------------------------------------------------- SFX
def sfx_riser(length=2.6):
    n = int(length * SR)
    t = t_of(n)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    chunks = 40
    for k in range(chunks):
        a, b = k * n // chunks, (k + 1) * n // chunks
        fc = 400 + (k / chunks) ** 2 * 9000
        out[a:b] = bp(noise, fc * 0.7, min(fc * 1.4, 20000))[a:b]
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / length) ** 2) / SR) * 0.25
    e = (t / length) ** 2
    return reverb((out + tone) * e, 1.5, 0.3)


def sfx_impact():
    n = int(1.8 * SR)
    t = t_of(n)
    f = 38 + 70 * np.exp(-t / 0.06)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.45)
    crack = bp(rng.standard_normal(n), 800, 8000) * env_exp(n, 0.05) * 0.5
    return reverb(softclip(boom + crack, 1.8), 2.2, 0.3)


def sfx_whoosh(length=0.7):
    n = int(length * SR)
    t = t_of(n)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    chunks = 30
    for k in range(chunks):
        a, b = k * n // chunks, (k + 1) * n // chunks
        x = k / chunks
        fc = 300 + 5000 * np.sin(np.pi * x)
        out[a:b] = bp(noise, fc * 0.6, min(fc * 1.6, 20000))[a:b]
    e = np.sin(np.pi * t / length) ** 2
    return out * e


def sfx_splash():
    n = int(0.9 * SR)
    t = t_of(n)
    body = bp(rng.standard_normal(n), 400, 6000) * env_exp(n, 0.12)
    bubbles = np.zeros(n)
    for _ in range(14):
        at = rng.uniform(0.02, 0.5)
        f = rng.uniform(600, 1800)
        m = int(0.05 * SR)
        tt = t_of(m)
        b = np.sin(2 * np.pi * np.cumsum(f * (1 + 2 * tt / 0.05)) / SR) * env_exp(m, 0.012)
        place(bubbles, b, at, 0.3)
    return reverb(body + bubbles, 0.8, 0.2)


def sfx_shimmer():
    n = int(1.6 * SR)
    out = np.zeros(n)
    for i, m in enumerate([88, 91, 96, 100, 103, 108]):
        place(out, bell(m, 1.0), i * 0.07, 0.5)
    return reverb(out, 2.0, 0.45)


def sfx_final():
    a = sfx_impact()
    s = sfx_shimmer()
    out = np.zeros(int(2.4 * SR))
    place(out, a, 0, 1.0)
    place(out, s, 0.05, 0.6)
    return out


save("sfx/riser.wav", sfx_riser())
save("sfx/impact.wav", sfx_impact())
save("sfx/whoosh.wav", sfx_whoosh(), stereo_width=0.6)
save("sfx/splash.wav", sfx_splash(), stereo_width=0.4)
save("sfx/shimmer.wav", sfx_shimmer(), stereo_width=0.6)
save("sfx/final.wav", sfx_final(), stereo_width=0.4)
print("Audio généré dans public/audio/")
