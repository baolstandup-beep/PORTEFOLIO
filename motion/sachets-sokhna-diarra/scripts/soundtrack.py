"""Bande-son synthétisée, 120 BPM, calée sur les coupes de la vidéo (24 s)."""
import sys, wave
import numpy as np

SR = 44100
DUR = 24.0
BEAT = 0.5
N = int(SR * DUR)
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))

def put(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    mix[i:i + len(sig), 0] += sig * (1 - max(pan, 0))
    mix[i:i + len(sig), 1] += sig * (1 + min(pan, 0))

def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)

def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.16)

def clap():
    n = int(0.25 * SR)
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0)
    e = env(n, 0.001, 0.06)
    for k in (0.01, 0.02):
        e += env(n, 0.001, 0.008) * np.roll(np.ones(n), int(k * SR)) * (np.arange(n) > k * SR)
    return noise * e * 0.4

def shaker():
    n = int(0.08 * SR)
    noise = np.diff(np.diff(rng.standard_normal(n), prepend=0), prepend=0)
    return noise * env(n, 0.004, 0.02) * 0.12

def tone(freq, length, shape='saw', a=0.005, d=0.4):
    n = int(length * SR); t = np.arange(n) / SR
    ph = (freq * t) % 1
    w = 2 * ph - 1 if shape == 'saw' else np.sin(2 * np.pi * freq * t)
    return w * env(n, a, d)

def lowpass(x, cut):
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc; y[i] = acc
    return y

def whoosh(length=0.6):
    n = int(length * SR); t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    # passe-bas qui s'ouvre : bruit qui « monte » vers la coupe
    y = np.zeros(n); acc = 0.0
    for i in range(n):
        cut = 200 + 6000 * t[i] ** 2
        a = np.exp(-2 * np.pi * cut / SR)
        acc = (1 - a) * noise[i] + a * acc; y[i] = acc
    return y * t ** 1.5 * 0.9

def impact():
    n = int(1.2 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (38 + 60 * np.exp(-t * 12)) * t) * env(n, 0.001, 0.4)
    return body * 0.8 + lowpass(rng.standard_normal(n), 900) * env(n, 0.001, 0.15) * 0.6

K, CL, SH = kick(), clap(), shaker()
# progression la – fa – do – sol, une mesure chacune
roots = [110.0, 87.31, 130.81, 98.0]
chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 261.6, 329.6], [196, 246.9, 293.7]]
cuts = [3, 7, 11, 15, 20]

for b in range(int(DUR / BEAT)):
    t = b * BEAT
    bar, beat = divmod(b, 4)
    intro = t < 3
    if t >= 23.5:
        break
    put(K, t, 0.55 if intro else 0.9)
    if beat in (1, 3) and not intro:
        put(CL, t, 0.55)
    for k in (0.25, 0.5, 0.75):
        if not intro or k == 0.5:
            put(SH, t + k * BEAT, 1.0, pan=0.4 if k != 0.5 else -0.3)
    r = roots[bar % 4]
    if not intro and beat == 0:
        for off, mult in ((0, 1), (0.75, 1), (1.5, 2), (2.0, 1)):
            put(lowpass(tone(r / 2, 0.45, 'saw', 0.003, 0.18), 600), t + off * BEAT, 0.5)
    if beat == 0:
        pad = sum(tone(f, 2.1, 'saw', 0.25, 1.4) for f in chords[bar % 4])
        put(lowpass(pad, 1200), t, 0.07 if intro else 0.09, pan=0.0)
    # petite cloche marimba sur le contretemps
    if not intro and beat in (0, 2):
        put(tone(chords[bar % 4][(beat // 2 + bar) % 3] * 2, 0.4, 'sine', 0.002, 0.12), t + 0.75 * BEAT, 0.16, pan=-0.35)

W = whoosh()
for c in cuts:
    put(W, c - len(W) / SR, 0.35)
    put(impact(), c + 0.05, 0.45)
put(impact(), 0.12, 0.55)
# accord final tenu
put(lowpass(sum(tone(f, 3.5, 'saw', 0.01, 1.6) for f in [220, 261.6, 329.6, 440]), 1800), 22.0, 0.12)

fade = np.ones(N); fl = int(1.2 * SR); fade[-fl:] = np.linspace(1, 0, fl) ** 2
mix *= fade[:, None]
mix /= np.max(np.abs(mix)) / 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1])
