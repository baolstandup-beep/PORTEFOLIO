"""Composite beauty + overlay passes, grade, and encode the final H.264 film.

    python3 scripts/05_composite.py                       # full film -> PAS_PAS_MORINGA_FINAL.mp4
    python3 scripts/05_composite.py --frames 50,520 --stills renders/tests/comp   # check stills

Per frame: beauty pass (any resolution) -> Lanczos to 1920x1080 -> soft bloom
-> gentle vignette + film grain -> overlay pass (native 1080p typography/logo).
Audio (assets/audio/pas_pas_score.wav) is muxed if present.
"""
import argparse
import os
import subprocess

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS, N = 1920, 1080, 25, 750
BLACK_FROM = 727   # the end-card curtain is opaque from this frame on

ap = argparse.ArgumentParser()
ap.add_argument("--beauty", default=os.path.join(ROOT, "renders", "beauty"))
ap.add_argument("--overlay", default=os.path.join(ROOT, "renders", "overlay"))
ap.add_argument("--frames", default="")
ap.add_argument("--stills", default="")
ap.add_argument("--out", default=os.path.join(ROOT, "PAS_PAS_MORINGA_FINAL.mp4"))
ap.add_argument("--audio", default=os.path.join(ROOT, "assets", "audio", "pas_pas_score.wav"))
args = ap.parse_args()

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r2 = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
VIGNETTE = (1.0 - 0.28 * np.clip(r2 - 0.25, 0, None) ** 1.2)[..., None]
grain_rng = np.random.default_rng(7)


def frame(f):
    bp = os.path.join(args.beauty, f"f_{f:04d}.png")
    if not os.path.exists(bp):
        if f < BLACK_FROM:
            raise FileNotFoundError(bp)
        bp = None  # fully covered by the fade to black: never rendered
    b = Image.open(bp).convert("RGB") if bp else Image.new("RGB", (W, H))
    if b.size != (W, H):
        b = b.resize((W, H), Image.LANCZOS)
    a = np.asarray(b).astype(np.float32) / 255.0
    # bloom: highlights above 0.72, two blur radii, screen-blended
    hi = np.clip((a - 0.72) / 0.28, 0, 1) * a
    hi_img = Image.fromarray((hi * 255).astype(np.uint8))
    small = hi_img.resize((W // 4, H // 4), Image.BILINEAR)
    g1 = np.asarray(small.filter(ImageFilter.GaussianBlur(6)).resize((W, H), Image.BILINEAR)).astype(np.float32) / 255
    g2 = np.asarray(small.filter(ImageFilter.GaussianBlur(22)).resize((W, H), Image.BILINEAR)).astype(np.float32) / 255
    glow = 0.35 * g1 + 0.45 * g2
    a = 1 - (1 - a) * (1 - glow)
    a = a * VIGNETTE
    a = a + grain_rng.normal(0, 0.008, (H, W, 1)).astype(np.float32)
    out = Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))
    op = os.path.join(args.overlay, f"f_{f:04d}.png")
    if os.path.exists(op):
        ov = Image.open(op).convert("RGBA")
        if ov.size != (W, H):
            ov = ov.resize((W, H), Image.LANCZOS)
        out = out.convert("RGBA")
        out.alpha_composite(ov)
        out = out.convert("RGB")
    return out


def parse(spec):
    fr = []
    for part in spec.split(","):
        if "-" in part:
            x, y = part.split("-")
            fr += range(int(x), int(y) + 1)
        elif part:
            fr.append(int(part))
    return fr


if args.stills:
    os.makedirs(args.stills, exist_ok=True)
    for f in parse(args.frames):
        frame(f).save(os.path.join(args.stills, f"c_{f:04d}.png"))
        print("still", f)
else:
    frames = parse(args.frames) if args.frames else list(range(1, N + 1))
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-"]
    if os.path.exists(args.audio):
        cmd += ["-i", args.audio, "-c:a", "aac", "-b:a", "256k", "-shortest"]
    cmd += ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
            "-profile:v", "high", "-level", "4.1", "-movflags", "+faststart",
            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", args.out]
    enc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i, f in enumerate(frames):
        enc.stdin.write(frame(f).tobytes())
        if i % 50 == 0:
            print("composite", f, flush=True)
    enc.stdin.close()
    enc.wait()
    print("written", args.out, "exit", enc.returncode)
