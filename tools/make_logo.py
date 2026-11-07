"""Derive transparent PNG + favicon sources from company logo.jpg (original untouched)."""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "company logo.jpg"
OUT = ROOT / "assets" / "img"

img = Image.open(SRC).convert("RGBA")
w, h = img.size
px = img.load()

# White/near-white background -> transparent
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if r > 238 and g > 238 and b > 238:
            px[x, y] = (r, g, b, 0)

# Trim to content bbox
bbox = img.getbbox()
img = img.crop(bbox)

# Standard logo on transparent bg (max 640 wide)
logo = img.copy()
logo.thumbnail((640, 640), Image.LANCZOS)
logo.save(OUT / "logo.png", optimize=True)

# Light-on-dark variant: force the dark "S" and swoosh to white, keep blue
light = img.copy()
lp = light.load()
lw, lh = light.size
for y in range(lh):
    for x in range(lw):
        r, g, b, a = lp[x, y]
        if a == 0:
            continue
        # dark charcoal -> white
        if r < 110 and g < 110 and b < 110:
            lp[x, y] = (255, 255, 255, a)
light.thumbnail((640, 640), Image.LANCZOS)
light.save(OUT / "logo-light.png", optimize=True)

# Favicon: square canvas with padding, logo centered
side = max(logo.size)
fav = Image.new("RGBA", (side, side), (0, 0, 0, 0))
fav.paste(logo, ((side - logo.size[0]) // 2, (side - logo.size[1]) // 2), logo)
fav.resize((180, 180), Image.LANCZOS).save(OUT / "favicon-180.png", optimize=True)

for f in ("logo.png", "logo-light.png", "favicon-180.png"):
    p = OUT / f
    print(f"{f}: {p.stat().st_size} bytes, {Image.open(p).size}")
