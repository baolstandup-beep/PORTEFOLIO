# Planche contact : python3 scripts/sheet.py out.png img1 img2 …  (vignettes 640 px de large ou 360 en vertical)
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = []
for f in files:
    im = Image.open(f).convert('RGB')
    w = 640 if im.width > im.height else 300
    im = im.resize((w, int(im.height * w / im.width)))
    ImageDraw.Draw(im).text((8, 6), f.split('/')[-1], fill=(255, 0, 255))
    ims.append(im)
W = 1300
rows, row, x, h = [], [], 0, 0
for im in ims:
    if x + im.width > W and row:
        rows.append((row, h)); row, x, h = [], 0, 0
    row.append(im); x += im.width + 6; h = max(h, im.height)
rows.append((row, h))
sheet = Image.new('RGB', (W, sum(h + 6 for _, h in rows)), (60, 60, 60))
y = 0
for row, h in rows:
    x = 0
    for im in row:
        sheet.paste(im, (x, y)); x += im.width + 6
    y += h + 6
sheet.save(out)
