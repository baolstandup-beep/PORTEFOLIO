#!/usr/bin/env python3
"""
GRAPHIA 2026 : bande-son originale, entièrement synthétisée (aucun sample tiers, aucun droit à payer).

- Musique : afro-house / afro-futuriste à 120 BPM (log drum façon amapiano, kalimba pentatonique,
  pads, shakers, arpège numérique pour la scène IA). Chaque coupe de scène tombe sur une mesure (2 s).
- SFX : impact, whoosh, riser, glitch, ticks d'interface, sparkle… synthétisés et calés sur src/timeline.json.
- Voix off : clips ElevenLabs découpés aux pauses naturelles et posés aux temps de la timeline (jamais accélérés).
- Mixage : la musique est automatiquement baissée sous la voix (ducking), puis normalisation à -14 LUFS.

Usage : python3 scripts/build_audio.py           (génère public/audio/mix_long.wav et mix_short.wav + stems)
Dépendances : numpy, scipy, ffmpeg.
"""
import json, subprocess, os, sys
import numpy as np
from scipy import signal

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
TL = json.load(open(os.path.join(ROOT, "src", "timeline.json"), encoding="utf-8"))
BPM = TL["bpm"]
BEAT = 60.0 / BPM

rng_master = np.random.default_rng(2026)


def rng(seed):
    return np.random.default_rng(seed)


def t_axis(n):
    return np.arange(n) / SR


def env_ad(n, a, d, curve=4.0):
    """Enveloppe attaque linéaire / décroissance exponentielle (en secondes)."""
    t = t_axis(n)
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) * curve / max(d, 1e-4)))
    return e


def place(buf, x, at, gain=1.0):
    i = int(round(at * SR))
    if i >= len(buf) or i + len(x) <= 0:
        return
    j0 = max(0, -i)
    i = max(0, i)
    n = min(len(x) - j0, len(buf) - i)
    buf[i:i + n] += x[j0:j0 + n] * gain


def sos_filter(x, kind, f, order=2):
    if kind == "bp":
        sos = signal.butter(order, f, btype="bandpass", fs=SR, output="sos")
    else:
        sos = signal.butter(order, f, btype=kind, fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def sweep_noise(n, f0, f1, width=0.5, seed=1):
    """Bruit filtré dont la bande centrale glisse de f0 à f1 (STFT, courbe exponentielle)."""
    x = rng(seed).standard_normal(n + 2048)
    f, tt, Z = signal.stft(x, SR, nperseg=1024)
    fc = f0 * (f1 / f0) ** np.linspace(0, 1, Z.shape[1])
    logf = np.log(np.maximum(f, 1.0))[:, None]
    mask = np.exp(-((logf - np.log(fc)[None, :]) ** 2) / (2 * width ** 2))
    _, y = signal.istft(Z * mask, SR, nperseg=1024)
    y = y[:n]
    return y / (np.max(np.abs(y)) + 1e-9)


def reverb_ir(seconds=1.8, seed=7, damp=3.2):
    n = int(seconds * SR)
    t = t_axis(n)
    ir = rng(seed).standard_normal((2, n)) * np.exp(-t * damp)[None, :]
    ir[:, :int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[None, :]
    ir = np.array([sos_filter(ch, "low", 7000) for ch in ir])
    return ir / np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))


IR = reverb_ir()


def reverb(mono, wet=0.25):
    l = signal.fftconvolve(mono, IR[0])[:len(mono)]
    r = signal.fftconvolve(mono, IR[1])[:len(mono)]
    return np.stack([mono * (1 - wet) + l * wet, mono * (1 - wet) + r * wet])


# ───────────────────────────── Instruments ─────────────────────────────

def kick(n_sec=0.42):
    n = int(n_sec * SR)
    t = t_axis(n)
    f = 46 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env_ad(n, 0.002, n_sec, 5.5)
    click = sos_filter(rng(3).standard_normal(n), "high", 2500) * env_ad(n, 0.0005, 0.012, 6)
    return np.tanh((body + click * 0.25) * 1.6) * 0.9


def log_drum(freq, n_sec=0.45, seed=0):
    """Log drum façon amapiano : sinus à attaque glissée + légère saturation."""
    n = int(n_sec * SR)
    t = t_axis(n)
    f = freq * (1 + 0.6 * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    x *= env_ad(n, 0.004, n_sec, 4.0)
    return np.tanh(x * 2.2) * 0.55


def clap(seed=11):
    n = int(0.3 * SR)
    x = rng(seed).standard_normal(n)
    e = np.zeros(n)
    for k, d in enumerate([0, 0.011, 0.022]):
        i = int(d * SR)
        e[i:] += env_ad(n - i, 0.001, 0.02 if k < 2 else 0.18, 5)
    return sos_filter(x * e, "bp", [900, 3200]) * 0.6


def shaker(acc=1.0, seed=0):
    n = int(0.09 * SR)
    x = sos_filter(rng(seed).standard_normal(n), "high", 6000)
    return x * env_ad(n, 0.006, 0.07, 6) * 0.18 * acc


def kalimba(freq, seed=0):
    n = int(1.1 * SR)
    t = t_axis(n)
    x = (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 30)
         + 0.2 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * 6))
    return x * env_ad(n, 0.002, 1.1, 5.0) * 0.32


def pluck_arp(freq):
    n = int(0.22 * SR)
    t = t_axis(n)
    saw = 2 * ((freq * t) % 1) - 1
    sq = np.sign(np.sin(2 * np.pi * freq * 1.003 * t))
    x = sos_filter(0.6 * saw + 0.4 * sq, "low", 2600)
    return x * env_ad(n, 0.002, 0.2, 5) * 0.16


def pad_chord(freqs, n_sec, seed=0, bright=1800):
    n = int(n_sec * SR)
    t = t_axis(n)
    x = np.zeros(n)
    r = rng(seed)
    for f in freqs:
        for det in (-0.006, 0.0, 0.007):
            ph = r.uniform(0, 2 * np.pi)
            ff = f * (1 + det)
            x += (2 * ((ff * t + ph / (2 * np.pi)) % 1) - 1) * 0.5 + np.sin(2 * np.pi * ff * t + ph) * 0.5
    x = sos_filter(x, "low", bright)
    fade = int(0.25 * SR)
    e = np.ones(n)
    e[:fade] = np.linspace(0, 1, fade)
    e[-fade:] = np.linspace(1, 0, fade)
    return x * e / (len(freqs) * 3) * 0.55


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# A mineur : Am9 – Fmaj7 – Cmaj7 – Em7 (1 accord par mesure de 2 s)
CHORDS = [[57, 60, 64, 67, 71], [53, 57, 60, 64], [48, 55, 59, 64], [52, 55, 59, 62]]
BASS_ROOT = [45, 41, 48, 40]
PENTA = [69, 72, 74, 76, 79, 81, 84]


def music(duration, sections, seed=5):
    n = int(duration * SR)
    drums = np.zeros(n)
    bass = np.zeros(n)
    keys = np.zeros(n)
    pads = np.zeros(n)
    r = rng(seed)
    K = kick()
    C = clap()
    nbars = int(np.ceil(duration / 2))
    for kind, a, b in sections:
        for bar in range(nbars):
            t0 = bar * 2.0
            if not (a - 1e-6 <= t0 < b - 1e-6):
                continue
            ci = bar % 4
            # Pads (tous les types)
            bright = {"intro": 900, "digital": 2600, "outro": 1200}.get(kind, 1700)
            vol = {"intro": 0.9, "outro": 1.0}.get(kind, 0.75)
            place(pads, pad_chord([hz(m) for m in CHORDS[ci]], 2.3, seed=bar, bright=bright), t0, vol)
            if kind == "intro":
                # pulsation grave + shaker filtré
                place(bass, log_drum(hz(BASS_ROOT[ci] - 12), 1.4), t0, 0.55)
                for s in range(8):
                    place(drums, shaker(0.5 + 0.3 * (s % 2), seed=bar * 16 + s), t0 + s * BEAT / 2, 0.55)
                continue
            if kind == "outro":
                continue
            for beat in range(4):
                tb = t0 + beat * BEAT
                if kind != "build" or beat < 4:
                    place(drums, K, tb, 0.95 if kind == "groove" else 0.8)
                if beat in (1, 3):
                    place(drums, C, tb, 0.55 if kind != "digital" else 0.35)
                for s in range(4):
                    acc = 1.0 if s == 2 else 0.55
                    place(drums, shaker(acc, seed=bar * 64 + beat * 4 + s), tb + s * BEAT / 4,
                          0.9 if kind == "groove" else 0.7)
            # Log drum (motif syncopé amapiano)
            pattern = [0.0, 0.75, 1.5, 2.25, 2.75, 3.5] if kind != "digital" else [0.0, 1.5, 2.75]
            notes = [0, 0, 7, 0, 12, 10]
            for k, p in enumerate(pattern):
                f = hz(BASS_ROOT[ci] + notes[k % len(notes)] - 12)
                place(bass, log_drum(f, 0.42, seed=k), t0 + p * BEAT, 0.9 if kind == "groove" else 0.7)
            # Mélodie
            if kind in ("groove", "groove_kalimba"):
                motif = [0, 2, 4, 3, 5, 4, 2, 1] if bar % 2 == 0 else [4, 5, 6, 4, 3, 2, 3, 1]
                hits = [0.0, 0.5, 1.0, 1.75, 2.25, 2.5, 3.0, 3.5]
                for k, hpos in enumerate(hits):
                    if r.random() < 0.82:
                        place(keys, kalimba(hz(PENTA[motif[k]])), t0 + hpos * BEAT, 0.7)
            if kind == "digital":
                arp = CHORDS[ci] + [m + 12 for m in CHORDS[ci][:2]]
                for s in range(16):
                    place(keys, pluck_arp(hz(arp[s % len(arp)] + 12)), t0 + s * BEAT / 4, 0.85)
            if kind == "build":
                for s in range(16):
                    place(drums, C * (0.25 + 0.75 * s / 16), t0 + s * BEAT / 4, 0.4)
    # bus
    drums_st = np.stack([drums, drums])
    bass_st = np.stack([sos_filter(bass, "low", 900)] * 2)
    keys_st = reverb(keys, 0.32)
    # léger élargissement stéréo des pads (Haas 12 ms)
    d = int(0.012 * SR)
    pads_r = np.concatenate([np.zeros(d), pads[:-d]])
    pads_st = np.stack([pads, pads_r])
    pads_st = reverb(pads_st.mean(0), 0.4) * 0.5 + pads_st * 0.5
    mix = drums_st * 0.8 + bass_st * 0.62 + keys_st * 0.7 + pads_st * 0.9
    return mix


# ───────────────────────────── SFX ─────────────────────────────

def sfx(kind, length=None, seed=0):
    if kind == "impact":
        n = int(2.4 * SR)
        t = t_axis(n)
        f = 38 + 70 * np.exp(-t * 9)
        boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.003, 1.6, 4)
        crack = sos_filter(rng(seed).standard_normal(n), "bp", [300, 5000]) * env_ad(n, 0.001, 0.25, 6)
        x = np.tanh(boom * 1.4) + crack * 0.5
        return reverb(x, 0.35)
    if kind == "hit":
        n = int(0.8 * SR)
        t = t_axis(n)
        f = 70 + 140 * np.exp(-t * 30)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.002, 0.35, 5)
        x += sos_filter(rng(seed).standard_normal(n), "bp", [1200, 6000]) * env_ad(n, 0.001, 0.06, 6) * 0.6
        return reverb(np.tanh(x * 1.5), 0.25)
    if kind == "whoosh":
        n = int(0.9 * SR)
        y = sweep_noise(n, 300, 5000, 0.55, seed)
        e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2.2
        return reverb(y * e * 0.8, 0.3)
    if kind == "riser":
        L = length or 2.0
        n = int(L * SR)
        t = t_axis(n)
        y = sweep_noise(n, 400, 9000, 0.45, seed) * 0.7
        f = 180 * (8 ** (t / L))
        y += np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
        e = (t / L) ** 2.4
        return reverb(y * e, 0.35)
    if kind == "glitch":
        n = int(0.32 * SR)
        r = rng(seed)
        y = np.zeros(n)
        seg = int(0.018 * SR)
        src = np.sign(np.sin(2 * np.pi * r.uniform(200, 900) * t_axis(seg))) * 0.5 + r.standard_normal(seg) * 0.3
        for k in range(0, n - seg, seg):
            if r.random() < 0.75:
                y[k:k + seg] = src * r.uniform(0.3, 1.0)
        y = np.round(y * 6) / 6
        return np.stack([y * 0.5, np.roll(y, 90) * 0.5])
    if kind in ("tick", "pop", "click"):
        n = int(0.12 * SR)
        t = t_axis(n)
        if kind == "tick":
            y = np.sin(2 * np.pi * 2600 * t) * env_ad(n, 0.0008, 0.03, 6)
        elif kind == "pop":
            f = 420 + 520 * np.exp(-t * 60)
            y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.002, 0.08, 6)
        else:
            y = sos_filter(rng(seed).standard_normal(n), "bp", [1500, 7000]) * env_ad(n, 0.0004, 0.008, 6)
            y += np.roll(y, int(0.045 * SR)) * 0.6
        return reverb(y * 0.7, 0.15)
    if kind == "shine":
        n = int(1.6 * SR)
        t = t_axis(n)
        y = np.zeros(n)
        r = rng(seed)
        for k, f in enumerate([2093, 2637, 3136, 4186, 5274]):
            d = int(k * 0.045 * SR)
            y[d:] += np.sin(2 * np.pi * f * t[:n - d]) * env_ad(n - d, 0.002, 0.9, 5) * r.uniform(0.5, 1)
        return reverb(y * 0.18, 0.45)
    if kind == "type":
        L = length or 1.0
        n = int((L + 0.2) * SR)
        y = np.zeros(n)
        r = rng(seed)
        tt = 0.0
        while tt < L:
            k = sos_filter(r.standard_normal(int(0.02 * SR)), "bp", [2000, 8000]) * env_ad(int(0.02 * SR), 0.0005, 0.012, 6)
            place(y, k, tt, r.uniform(0.4, 1.0))
            tt += r.uniform(0.05, 0.11)
        return np.stack([y, y]) * 0.6
    if kind == "scan":
        L = length or 1.0
        n = int(L * SR)
        y = sweep_noise(n, 800, 7000, 0.3, seed) * np.sin(np.pi * np.linspace(0, 1, n)) * 0.5
        return reverb(y, 0.3)
    if kind == "pen":
        n = int(1.4 * SR)
        y = sweep_noise(n, 1500, 4500, 0.4, seed) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5 * 0.5
        return reverb(y, 0.3)
    raise ValueError(kind)


def as_st(x):
    return x if x.ndim == 2 else np.stack([x, x])


def place_st(buf, x, at, gain):
    x = as_st(x)
    place(buf[0], x[0], at, gain)
    place(buf[1], x[1], at, gain)


# ───────────────────────────── VO ─────────────────────────────

def load_audio(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def vo_track(cut, duration):
    src = load_audio(os.path.join(PUB, cut["voFile"]))
    src = sos_filter(src, "high", 75)
    out = np.zeros(int(duration * SR))
    fade = int(0.03 * SR)
    for c in cut["vo"]:
        a, b = int(c["src"][0] * SR), int(c["src"][1] * SR)
        clip = src[a:b].copy()
        clip[:fade] *= np.linspace(0, 1, fade)
        clip[-fade:] *= np.linspace(1, 0, fade)
        place(out, clip, c["at"], 1.0)
    return out


def envelope(x, attack=0.02, release=0.3):
    a = np.exp(-1 / (attack * SR))
    r = np.exp(-1 / (release * SR))
    ax = np.abs(x)
    # suivi d'enveloppe sous-échantillonné (rapide)
    step = 48
    ds = ax[: len(ax) // step * step].reshape(-1, step).max(1)
    e = np.zeros_like(ds)
    aa, rr = a ** step, r ** step
    for i in range(1, len(ds)):
        c = aa if ds[i] > e[i - 1] else rr
        e[i] = c * e[i - 1] + (1 - c) * ds[i]
    e = np.repeat(e, step)
    return np.pad(e, (0, len(x) - len(e)), mode="edge")


SECTIONS = {
    "long": [("intro", 0, 6), ("groove_light", 6, 20), ("groove_kalimba", 20, 32), ("digital", 32, 42),
             ("groove_light", 42, 48), ("build", 48, 50), ("groove", 50, 58), ("outro", 58, 60)],
    "short": [("intro", 0, 4), ("groove_light", 4, 18), ("digital", 18, 22), ("groove", 22, 28),
              ("outro", 28, 30)],
}


def write_wav(path, st):
    st = np.clip(st, -1, 1).astype(np.float32)
    inter = st.T.reshape(-1)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "pcm_s24le", path], input=inter.tobytes(), check=True)


def loudnorm(src, dst, target=-14.0):
    p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af",
                         f"loudnorm=I={target}:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                        capture_output=True, text=True).stderr
    js = json.loads(p1[p1.rindex("{"):p1.rindex("}") + 1])
    af = (f"loudnorm=I={target}:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", af, "-ar", str(SR), "-c:a", "pcm_s24le", dst],
                   check=True)


def build(name):
    cut = TL["cuts"][name]
    D = cut["duration"]
    n = int(D * SR)
    print(f"[{name}] musique…", flush=True)
    mus = music(D, SECTIONS[name])[:, :n]
    mus = np.pad(mus, ((0, 0), (0, n - mus.shape[1])))
    print(f"[{name}] sfx…", flush=True)
    fx = np.zeros((2, n))
    for k, s in enumerate(cut["sfx"]):
        place_st(fx, sfx(s["type"], s.get("len"), seed=k + 1), s["at"], s.get("gain", 0.5))
    print(f"[{name}] voix…", flush=True)
    vo = vo_track(cut, D)
    vo = vo / (np.max(np.abs(vo)) + 1e-9) * 0.89
    # Ducking : la musique descend d'environ 9 dB sous la voix, les SFX de 4 dB
    e = envelope(vo)
    e = e / (np.max(e) + 1e-9)
    duck_m = 1 - 0.65 * np.clip(e * 2.2, 0, 1)
    duck_fx = 1 - 0.35 * np.clip(e * 2.2, 0, 1)
    # fondu de sortie musique sur la dernière seconde
    tail = np.ones(n)
    tail[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)) ** 1.5
    mus = mus / (np.max(np.abs(mus)) + 1e-9) * 0.42 * duck_m[None, :] * tail[None, :]
    fx = fx / (np.max(np.abs(fx)) + 1e-9) * 0.55 * duck_fx[None, :]
    vo_st = np.stack([vo, vo])
    mix = mus + fx + vo_st
    mix = np.tanh(mix * 1.1) / 1.1
    out_dir = os.path.join(PUB, "audio")
    stems = os.path.join(out_dir, "stems")
    os.makedirs(stems, exist_ok=True)
    write_wav(os.path.join(stems, f"music_{name}.wav"), mus)
    write_wav(os.path.join(stems, f"sfx_{name}.wav"), fx)
    write_wav(os.path.join(stems, f"vo_{name}.wav"), vo_st)
    write_wav(os.path.join(stems, f"_premix_{name}.wav"), mix)
    loudnorm(os.path.join(stems, f"_premix_{name}.wav"), os.path.join(out_dir, f"mix_{name}.wav"))
    # version sans voix (musique + SFX) pour réutilisation
    write_wav(os.path.join(stems, f"_premix_novo_{name}.wav"), mus / np.maximum(duck_m, 1e-3)[None, :] * 0.9 + fx)
    os.remove(os.path.join(stems, f"_premix_{name}.wav"))
    print(f"[{name}] ok", flush=True)


if __name__ == "__main__":
    names = sys.argv[1:] or ["long", "short"]
    for nm in names:
        build(nm)
