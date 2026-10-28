"""Prepare PAS-PAS brand assets from the official banner artwork.

Input : assets/pas_pas_banner_reference.png  (banner extracted from the supplied
        PSD mockup, converted from CMYK FOGRA39 to sRGB with its embedded ICC)
Output: assets/logo_badge.png      round logo on a white disc, transparent outside
        assets/wordmark_blue.png   the original «PAS-PAS» lettering, blue on alpha
        assets/wordmark_white.png  same lettering, white on alpha (for dark scenes)
        assets/label_moringa.png   wrap-around bottle label (demo, replaceable)

Run with: python3 scripts/01_prepare_assets.py   (needs Pillow + numpy)
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "assets")
FONT_DIR = os.path.join(A, "fonts")   # Inter, SIL Open Font License

GREEN = (24, 150, 65)
BLUE = (35, 118, 187)

banner = Image.open(os.path.join(A, "pas_pas_banner_reference.png")).convert("RGB")
arr = np.asarray(banner).astype(np.float32)

# --- Logo badge: circle centred on the round logo of the banner -------------
cx, cy, r = 238, 296, 154
ss = 4
crop = banner.crop((cx - r, cy - r, cx + r, cy + r)).resize((2 * r * ss, 2 * r * ss), Image.LANCZOS)
mask = Image.new("L", crop.size, 0)
ImageDraw.Draw(mask).ellipse((0, 0, crop.size[0] - 1, crop.size[1] - 1), fill=255)
badge = crop.convert("RGBA")
badge.putalpha(mask)
badge = badge.resize((1024, 1024), Image.LANCZOS)
badge.save(os.path.join(A, "logo_badge.png"))

# --- Wordmark «PAS-PAS» : key the white background out -----------------------
x0, y0, x1, y1 = 452, 74, 1114, 170
w = arr[y0:y1, x0:x1]
# alpha from distance to white, normalised by the darkest channel of the brand blue
alpha = np.clip((255.0 - w.min(axis=2)) / (255.0 - BLUE[0]), 0, 1)
up = 4
alpha_img = Image.fromarray((alpha * 255).astype(np.uint8)).resize(((x1 - x0) * up, (y1 - y0) * up), Image.LANCZOS)
for name, col in (("wordmark_blue.png", BLUE), ("wordmark_white.png", (255, 255, 255))):
    im = Image.new("RGBA", alpha_img.size, col + (0,))
    im.putalpha(alpha_img)
    im.save(os.path.join(A, name))

# --- Bottle label (wrap-around, 360°) ----------------------------------------
LW, LH = 3200, 1000
label = Image.new("RGB", (LW, LH), (255, 255, 255))

def tile_strip(y_a, y_b, dest_y, height):
    strip = banner.crop((14, y_a, 1574, y_b))  # skip the banner's side borders
    s = height / strip.size[1]
    strip = strip.resize((int(strip.size[0] * s), height), Image.LANCZOS)
    x = 0
    while x < LW:
        label.paste(strip, (x, dest_y))
        x += strip.size[0]

# decorative dot borders, taken as-is from the banner
tile_strip(6, 46, 0, 110)
tile_strip(516, 562, LH - 120, 120)

# front panel is centred at u = 0.5 (faces the camera at rest). Only ~1/3 of
# the wrap is readable from the front, so the panel stays ~1000 px wide.
fx = LW // 2
wm = Image.open(os.path.join(A, "wordmark_blue.png"))
ws = 1000 / wm.size[0]
wm = wm.resize((1000, int(wm.size[1] * ws)), Image.LANCZOS)
label.paste(wm, (fx - wm.size[0] // 2, 215), wm)

d = ImageDraw.Draw(label)
f_big = ImageFont.truetype(os.path.join(FONT_DIR, "Inter-Black.otf"), 104)
txt = "JUS DE MORINGA"
tw = d.textlength(txt, font=f_big)
band_w = int(tw + 110)
band_x = fx - band_w // 2
d.rounded_rectangle((band_x, 470, band_x + band_w, 625), radius=32, fill=GREEN)
d.text((fx, 549), txt, font=f_big, fill=(255, 255, 255), anchor="mm")

# thin blue rule, echoing the banner
d.rectangle((band_x + 60, 690, band_x + band_w - 60, 697), fill=BLUE)

# side panels (±90°) and back panel (seam): the round logo, no invented text
bb = badge.resize((520, 520), Image.LANCZOS)
for bx in (fx - LW // 4, fx + LW // 4):
    label.paste(bb, (bx - 260, LH // 2 - 260 + 5), bb)
bk = badge.resize((440, 440), Image.LANCZOS)
for bx in (0, LW):  # u = 0 / 1 seam, split across both edges
    label.paste(bk, (bx - 220, LH // 2 - 220 + 5), bk)

label.save(os.path.join(A, "label_moringa.png"))
print("assets written to", A)
