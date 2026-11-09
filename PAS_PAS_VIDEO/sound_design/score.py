# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy"]
# ///
"""Bande-son originale (synthétisée en code, libre de droits) — PAS-PAS, Naufrage au large de Lompoul.

Pistes écrites dans sound_design/stems/ :
  ocean.wav   sons naturels de l'océan (houle filtrée), forts au début, discrets ensuite
  pads.wav    nappes atmosphériques (ré mineur -> fa majeur sur la prévention et la conclusion)
  piano.wav   piano discret, notes espacées
  accents.wav cloches douces / basses sur les moments clés (synchronisés à l'image, voir film.js HITS)
et le mélange musical sound_design/music.wav (sans voix).

Lancer : uv run sound_design/score.py   (depuis PAS_PAS_VIDEO/)
"""
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
from pathlib import Path

SR = 48000
DUR = 60.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
OUT = Path(__file__).parent
(OUT / "stems").mkdir(exist_ok=True)


def env_lin(points):
    """enveloppe par points [(s, gain), ...]"""
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def stereo(m, pan=0.0):
    l = m * np.cos((pan + 1) * np.pi / 4)
    r = m * np.sin((pan + 1) * np.pi / 4)
    return np.stack([l, r], 1)


# ------------------------------------------------------------------ océan
def ocean():
    out = np.zeros((N, 2))
    for ch in range(2):
        n = rng.standard_normal(N)
        body = lp(n, 900) * 0.6 + bp(n, 1500, 5000) * 0.18
        # houle : vagues lentes et irrégulières (~7-9 s)
        swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / (7.5 + ch * 0.9) + ch * 1.7) ** 2
        swell *= 0.8 + 0.2 * np.sin(2 * np.pi * t / 3.1 + ch)
        out[:, ch] = body * swell
    g = env_lin([(0, 0), (0.6, 1.0), (13, 0.9), (16, 0.45), (27, 0.35), (38, 0.35), (41, 0.15), (49.5, 0.1), (51, 0.0), (60, 0)])
    return out * g[:, None] * 0.5


# ------------------------------------------------------------------ nappes
CHORDS = [  # (début s, notes midi)
    (0, [50, 57, 62, 65]),      # Rém
    (6, [46, 53, 58, 62]),      # Sib
    (14, [50, 57, 62, 65, 69]), # Rém (hommage)
    (21, [41, 53, 57, 60]),     # Fa / lumière
    (27, [43, 50, 55, 58]),     # Solm (mobilisation)
    (33, [45, 52, 57, 61]),     # La (tension douce)
    (39, [41, 48, 53, 57, 60]), # Fa majeur : la prévention
    (44, [48, 55, 60, 64]),     # Do
    (50, [46, 53, 58, 62, 65]), # Sib (logo)
    (54, [41, 48, 53, 57, 60, 65]), # Fa : conclusion apaisée
]


def pads():
    out = np.zeros((N, 2))
    xf = 2.5  # fondu enchaîné entre accords
    for i, (s, notes) in enumerate(CHORDS):
        e_ = CHORDS[i + 1][0] if i + 1 < len(CHORDS) else DUR
        g = np.clip((t - s) / xf + 0.5, 0, 1) * np.clip((e_ - t) / xf + 0.5, 0, 1)
        g = np.sin(g * np.pi / 2) ** 2
        idx = g > 0
        for k, m in enumerate(notes):
            for det, pan in ((-0.07, -0.6), (0.07, 0.6)):
                f = hz(m) * 2 ** (det / 12)
                ph = 2 * np.pi * f * t[idx] + k
                w = np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
                out[idx] += stereo(w * g[idx] / len(notes), pan)
    out = np.stack([lp(out[:, c], 1400) for c in range(2)], 1)
    trem = 0.85 + 0.15 * np.sin(2 * np.pi * t / 5.3)
    lvl = env_lin([(0, 0), (3, 0.55), (13, 0.6), (39, 0.6), (40.5, 0.85), (49, 0.95), (52, 0.8), (58, 0.7), (60, 0)])
    return out * (trem * lvl)[:, None] * 0.35


# ------------------------------------------------------------------ piano
def piano_note(f, dur=5.0, vel=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    w = np.zeros(n)
    for h, a in ((1, 1), (2, 0.42), (3, 0.18), (4, 0.09), (5, 0.04)):
        w += a * np.sin(2 * np.pi * f * h * tt * (1 + 0.0004 * h * h)) * np.exp(-tt * (1.1 + 0.7 * h))
    att = np.clip(tt / 0.006, 0, 1)
    return w * att * vel


PIANO = [  # (s, midi, vel) — motif sobre, espacé ; il « monte » à la prévention
    (1.2, 74, .35), (3.0, 72, .3), (4.6, 69, .3),
    (7.0, 70, .35), (8.6, 69, .3), (10.4, 65, .3), (12.4, 62, .28),
    (15.0, 74, .3), (17.2, 72, .28), (19.0, 69, .28), (21.6, 77, .32), (23.6, 76, .28), (25.4, 72, .26),
    (28.4, 67, .28), (30.6, 70, .26), (33.2, 69, .28), (35.6, 73, .26),
    (39.2, 72, .32), (40.4, 77, .3), (41.6, 76, .3), (42.8, 72, .3), (44.2, 79, .32), (45.4, 76, .3), (46.6, 72, .3), (48.0, 74, .3),
    (50.2, 77, .34), (51.8, 74, .3), (53.4, 72, .3), (55.0, 77, .32), (56.4, 81, .3), (57.4, 77, .34), (58.6, 72, .3),
]


def piano():
    out = np.zeros((N, 2))
    for s, m, v in PIANO:
        w = piano_note(hz(m), 5.0, v)
        i = int(s * SR); j = min(N, i + len(w))
        out[i:j] += stereo(w[: j - i], (m - 72) / 20)
    # réverbération simple (échos multiples diffus)
    rev = np.zeros_like(out)
    for d, a in ((0.031, .35), (0.047, .3), (0.071, .26), (0.113, .22), (0.173, .18), (0.257, .14), (0.389, .1)):
        k = int(d * SR)
        rev[k:, 0] += out[:-k, 1] * a; rev[k:, 1] += out[:-k, 0] * a
    rev = np.stack([lp(rev[:, c], 3000) for c in range(2)], 1)
    return (out + rev) * 0.5


# ------------------------------------------------------------------ accents (synchronisés aux HITS de film.js)
HITS = [(0.7, "bell", 86), (6.0, "low", 38), (14.0, "bell", 81), (21.6, "bell", 84), (27.0, "low", 36),
        (39.0, "rise", 0), (50.0, "bell", 89), (57.4, "bell", 84)]


def accents():
    out = np.zeros((N, 2))
    for s, kind, m in HITS:
        if kind == "bell":
            dur = 6.0; n = int(dur * SR); tt = np.arange(n) / SR; f = hz(m)
            w = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * d) for r, a, d in ((1, 1, 0.9), (2.76, .35, 1.8), (5.4, .15, 3), (0.5, .25, 0.7)))
            w *= np.clip(tt / 0.004, 0, 1) * 0.16
            pan = 0.2
        elif kind == "low":
            dur = 5.0; n = int(dur * SR); tt = np.arange(n) / SR
            w = np.sin(2 * np.pi * hz(m) * tt) * np.exp(-tt * 0.9) * np.clip(tt / 0.05, 0, 1) * 0.35
            pan = 0.0
        else:  # rise : souffle qui monte vers la prévention (37.2 -> 39)
            s -= 1.8; dur = 3.2; n = int(dur * SR); tt = np.arange(n) / SR
            nz = bp(rng.standard_normal(n), 400, 4000)
            w = nz * np.clip(tt / 1.8, 0, 1) ** 2 * np.exp(-np.clip(tt - 1.8, 0, None) * 3) * 0.12
            pan = 0.0
        i = int(s * SR); j = min(N, i + n)
        out[i:j] += stereo(w[: j - i], pan)
    return out


def save(name, x):
    x = x / max(1.0, np.abs(x).max() / 0.98)
    wavfile.write(OUT / name, SR, (x * 32767).astype(np.int16))


stems = {"ocean": ocean(), "pads": pads(), "piano": piano(), "accents": accents()}
for k, v in stems.items():
    save(f"stems/{k}.wav", v)
mix = sum(stems.values())
fade = np.clip((DUR - t) / 2.5, 0, 1)[:, None]
save("music.wav", mix * fade)
print("ok:", ", ".join(f"stems/{k}.wav" for k in stems), "+ music.wav")
