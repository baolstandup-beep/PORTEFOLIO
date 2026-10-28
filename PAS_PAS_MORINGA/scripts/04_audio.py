"""Original 30 s score for the PAS-PAS film, synthesised from scratch (no samples,
no third-party music -> no rights to clear).

    python3 scripts/04_audio.py      -> assets/audio/pas_pas_score.wav (48 kHz, 24-bit stereo)

Cues are locked to the picture (25 fps):
    0-4 s    sub drone, air, sparkles, riser            S1 mystery
    4.0 s    impact + pad enters (E minor)               S2 reveal
    9.0 s    whoosh, plucked arpeggio starts             S3 orbit
    16.0 s   whoosh back to front                        S4
    17.6 / 18.8 / 20.2 s  soft chimes on each title     S4 typography
    23.0 s   lift                                         S5 hero
    24.8-26 s chimes on the hero titles
    28.5 s   final sting on the logo, tail to 30 s
"""
import os
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, DUR = 48000, 30.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(11)
L = np.zeros(N)
R = np.zeros(N)


def env(points):
    """Piecewise-linear envelope from (time, gain) points."""
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


def add(sig, start=0.0, pan=0.0, gain=1.0):
    i = int(start * SR)
    n = min(len(sig), N - i)
    if n <= 0:
        return
    lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + n] += sig[:n] * gain * lg * 1.414
    R[i:i + n] += sig[:n] * gain * rg * 1.414


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be an array (sweeps)."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def lowpass_fast(x, cutoff):
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    from itertools import accumulate
    return np.fromiter(accumulate(x, lambda acc, v: acc + a * (v - acc), initial=0.0), float, len(x) + 1)[1:]


def note(freq, dur, attack=0.01, decay=None, harmonics=((1, 1.0),), detune=0.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for h, a in harmonics:
        for d in ((-detune, detune) if detune else (0.0,)):
            s += a * np.sin(2 * np.pi * freq * h * (1 + d) * tt + rng.uniform(0, 6.28))
    e = np.minimum(tt / attack, 1.0)
    if decay:
        e *= np.exp(-tt / decay)
    return s * e


# --- 1. sub drone (E1 + B1), swells in the dark ------------------------------
drone = 0.5 * np.sin(2 * np.pi * 41.2 * t) + 0.25 * np.sin(2 * np.pi * 61.74 * t + 1.0)
drone *= env([(0, 0), (3.5, 0.55), (4.0, 0.7), (23, 0.6), (28.4, 0.75), (30, 0)])
add(drone, gain=0.28)

# --- 2. air: filtered noise ---------------------------------------------------
noise = rng.normal(0, 1, N)
air = lowpass_fast(noise, 1600.0) - lowpass_fast(noise, 280.0)   # band-pass, keeps the lows clean
air *= env([(0, 0), (2.5, 0.9), (4.0, 0.3), (28, 0.25), (30, 0)])
add(air, pan=-0.3, gain=0.16)
add(np.roll(air, 4800), pan=0.3, gain=0.16)

# --- 3. sparkles (floating particles) ----------------------------------------
for _ in range(70):
    st = rng.uniform(0.2, 27.5)
    f = rng.choice([1318.5, 1975.5, 2637.0, 2959.9, 3951.1])
    s = note(f, 0.6, attack=0.004, decay=0.12, harmonics=((1, 1.0), (2.0, 0.2)))
    g = 0.035 if st < 4 else 0.018
    add(s, st, pan=rng.uniform(-0.8, 0.8), gain=g)

# --- 4. riser into the reveal, impact at 4.0 s --------------------------------
rs, re_ = 2.2, 4.0
n = int((re_ - rs) * SR)
tt = np.arange(n) / SR
sweep = np.linspace(300, 6000, n) ** 1.0
riser = lowpass(rng.normal(0, 1, n), sweep) * (tt / tt[-1]) ** 2.2
tone = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 440, n)) / SR) * (tt / tt[-1]) ** 3
add(riser, rs, gain=0.35)
add(tone, rs, gain=0.08)


def impact(start, gain=1.0):
    n = int(2.5 * SR)
    tt = np.arange(n) / SR
    f = 32 + 60 * np.exp(-tt / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.55)
    click = lowpass_fast(rng.normal(0, 1, n), 2500.0) * np.exp(-tt / 0.03)
    add(boom, start, gain=0.9 * gain)
    add(click, start, gain=0.25 * gain)


impact(4.0)

# --- 5. pad: E minor progression ---------------------------------------------
CH = {
    "Em9": (164.81, 246.94, 293.66, 369.99, 392.00),
    "Cmaj7": (130.81, 196.00, 246.94, 329.63),
    "G": (123.47, 146.83, 196.00, 293.66),
    "Dsus2": (146.83, 220.00, 329.63),
    "E": (82.41, 164.81, 246.94, 329.63, 415.30),
}
PROG = [(4.0, 8.5, "Em9"), (8.5, 12.5, "Cmaj7"), (12.5, 16.0, "G"), (16.0, 19.5, "Em9"),
        (19.5, 23.0, "Cmaj7"), (23.0, 26.5, "G"), (26.5, 28.5, "Dsus2"), (28.5, 30.0, "E")]
pad_h = ((1, 1.0), (2, 0.35), (3, 0.18), (4, 0.08))
for a, b, ch in PROG:
    dur = b - a + 1.2
    for i, f in enumerate(CH[ch]):
        s = note(f, dur, attack=0.9, harmonics=pad_h, detune=0.0025)
        nn = len(s)
        rel = np.ones(nn)
        k = int(1.2 * SR)
        rel[-k:] = np.linspace(1, 0, k)
        add(s * rel, a, pan=(-0.5 + i / max(len(CH[ch]) - 1, 1)), gain=0.05)

# --- 6. plucked arpeggio, 96 bpm eighths from the orbit onwards ----------------
step = 60 / 96 / 2
pluck_h = ((1, 1.0), (2, 0.5), (3, 0.25), (5, 0.08))
tcur, k = 9.0, 0
while tcur < 28.3:
    ch = next(c for a, b, c in PROG if a <= tcur < b)
    tones = CH[ch]
    f = tones[(k * 2 + (k // 4)) % len(tones)] * 2
    lift = 1.35 if tcur >= 23.0 else 1.0
    s = note(f, 1.2, attack=0.003, decay=0.22, harmonics=pluck_h)
    g = 0.045 * lift * min(1.0, (tcur - 9.0) / 2.0 + 0.3)
    pan = 0.35 if k % 2 else -0.35
    add(s, tcur, pan=pan, gain=g)
    # ping-pong delay (dotted eighth)
    add(s, tcur + step * 1.5, pan=-pan, gain=g * 0.45)
    add(s, tcur + step * 3.0, pan=pan, gain=g * 0.2)
    tcur += step
    k += 1


# --- 7. whooshes ---------------------------------------------------------------
def whoosh(center, length=1.6, gain=0.3, pan_from=-0.7, pan_to=0.7):
    n = int(length * SR)
    tt = np.arange(n) / SR
    shape = np.sin(np.pi * tt / length) ** 2
    cutoff = 400 + 3500 * shape
    s = lowpass(rng.normal(0, 1, n), cutoff) * shape
    half = n // 2
    add(s[:half], center - length / 2, pan=pan_from, gain=gain)
    add(s[half:], center - length / 2 + half / SR, pan=pan_to, gain=gain)


whoosh(9.2, 1.8, 0.32)
whoosh(16.0, 1.6, 0.26, 0.7, -0.7)
whoosh(23.0, 2.0, 0.22)


# --- 8. title chimes (soft bell, inharmonic partials) ------------------------
def bell(f, dur=3.0):
    return note(f, dur, attack=0.002, decay=0.9,
                harmonics=((1, 1.0), (2.76, 0.35), (5.40, 0.12), (8.93, 0.05)))


for st, f in ((17.6, 987.77), (18.8, 1318.5), (20.2, 1174.7), (24.8, 987.77), (25.3, 1318.5),
              (25.9, 1479.98), (26.4, 1975.5)):
    add(bell(f), st, pan=rng.uniform(-0.4, 0.4), gain=0.05)

# --- 9. final sting on the logo ------------------------------------------------
impact(28.45, 0.8)
for i, f in enumerate((329.63, 493.88, 659.26, 830.61, 987.77)):
    add(bell(f, 2.5), 28.45 + 0.03 * i, pan=-0.6 + 0.3 * i, gain=0.06)

# --- reverb (synthetic stereo IR) + master ----------------------------------------
ir_n = int(2.8 * SR)
it = np.arange(ir_n) / SR
irL = rng.normal(0, 1, ir_n) * np.exp(-it / 0.55)
irR = rng.normal(0, 1, ir_n) * np.exp(-it / 0.55)
irL[: int(0.012 * SR)] = 0
irR[: int(0.017 * SR)] = 0
irL = lowpass_fast(irL, 5000.0)
irR = lowpass_fast(irR, 5000.0)


def conv(x, ir):
    m = len(x) + len(ir)
    nfft = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[:len(x)]


wetL, wetR = conv(L, irL), conv(R, irR)
wetL *= 0.6 / (np.abs(wetL).max() + 1e-9) * np.abs(L).max()
wetR *= 0.6 / (np.abs(wetR).max() + 1e-9) * np.abs(R).max()
outL, outR = L + 0.45 * wetL, R + 0.45 * wetR

fade = env([(0, 0), (0.05, 1), (29.3, 1), (30, 0)])
mix = np.stack([outL, outR], 1) * fade[:, None]
mix = np.tanh(1.2 * mix / np.abs(mix).max()) / np.tanh(1.2)
mix *= 10 ** (-1.0 / 20)  # -1 dBFS peak
MASTER_DB = -2.0           # trims the programme to about -16 LUFS integrated
mix *= 10 ** (MASTER_DB / 20)

os.makedirs(os.path.join(ROOT, "assets", "audio"), exist_ok=True)
path = os.path.join(ROOT, "assets", "audio", "pas_pas_score.wav")
pcm = (np.clip(mix, -1, 1) * (2 ** 23 - 1)).astype(np.int32)
raw = np.zeros((N, 2, 3), dtype=np.uint8)
for b in range(3):
    raw[:, :, b] = (pcm >> (8 * b)) & 0xFF
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(3)
    w.setframerate(SR)
    w.writeframes(raw.tobytes())
print("written", path, f"rms {20 * np.log10(np.sqrt((mix ** 2).mean())):.1f} dBFS")
