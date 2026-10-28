"""Render frames of PAS_PAS_MORINGA.blend with Cycles, in two passes.

  beauty  : the 3D film (product, leaves, light, particles). TYPOGRAPHY and
            FINAL_BRANDING are hidden. Default 1920x1080; on a small CPU use
            --res 1280x720 and let 05_composite.py upscale it.
  overlay : TYPOGRAPHY + FINAL_BRANDING only, transparent film, no depth of
            field, always native 1920x1080 -> text and logo stay razor sharp.

    python3 scripts/03_render.py --pass beauty  --frames 1-750 --samples 48
    python3 scripts/03_render.py --pass beauty  --frames 1-750 --res 1280x720 --samples 20
    python3 scripts/03_render.py --pass overlay --frames 430-750
    blender -b PAS_PAS_MORINGA.blend -P scripts/03_render.py -- --pass beauty --frames 1-750

Already-rendered frames are skipped, so an interrupted render can be resumed.
"""
import argparse
import os
import sys
import time

import bpy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
ap = argparse.ArgumentParser()
ap.add_argument("--frames", default="1-750")
ap.add_argument("--pass", dest="rpass", choices=("beauty", "overlay"), default="beauty")
ap.add_argument("--res", default="1920x1080")
ap.add_argument("--percent", type=int, default=100)
ap.add_argument("--samples", type=int, default=0, help="0 = 48 (beauty) / 6 (overlay)")
ap.add_argument("--threads", type=int, default=0)
ap.add_argument("--out", default="")
args = ap.parse_args(argv)
if not args.out:
    args.out = os.path.join(ROOT, "renders", args.rpass)

if not bpy.data.filepath:
    bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT, "PAS_PAS_MORINGA.blend"))

frames = []
for part in args.frames.split(","):
    if "-" in part:
        a, b = part.split("-")
        frames += list(range(int(a), int(b) + 1))
    else:
        frames.append(int(part))

sc = bpy.context.scene
overlay_cols = ("TYPOGRAPHY", "FINAL_BRANDING")
for col in bpy.data.collections:
    if col.name in overlay_cols:
        col.hide_render = args.rpass == "beauty"
    elif col.name != "CAMERAS":
        col.hide_render = args.rpass == "overlay"
if args.rpass == "overlay":
    args.res = "1920x1080"
    sc.render.film_transparent = True
    sc.render.image_settings.color_mode = "RGBA"
    sc.camera.data.dof.use_dof = False
    sc.cycles.use_denoising = False
    sc.cycles.use_adaptive_sampling = False
w, h = (int(v) for v in args.res.lower().split("x"))
sc.render.resolution_x, sc.render.resolution_y = w, h
sc.render.resolution_percentage = args.percent
sc.cycles.samples = args.samples or (48 if args.rpass == "beauty" else 6)
if args.threads:
    sc.render.threads_mode = "FIXED"
    sc.render.threads = args.threads
os.makedirs(args.out, exist_ok=True)

t_all = time.time()
for f in frames:
    path = os.path.join(args.out, f"f_{f:04d}.png")
    if os.path.exists(path):
        continue
    t = time.time()
    sc.frame_set(f)
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"[render] frame {f} {time.time() - t:.1f}s", flush=True)
print(f"[render] done {len(frames)} frames in {time.time() - t_all:.0f}s", flush=True)
