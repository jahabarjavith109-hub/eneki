"""Download final chosen plates, make webp variants, fetch fonts."""
import re
import urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
FONTS = ROOT / "assets" / "fonts"
IMG.mkdir(parents=True, exist_ok=True)
FONTS.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"}

# name -> pexels id
PLATES = {
    "port-dusk":     14020705,
    "crane-view":    24702864,
    "ship-aerial":   12530455,
    "sea-night":     34155535,
    "air-cargo":     27490332,
    "warehouse":     9305407,
    "warehouse-2":   4487363,
    "warehouse-3":   6028170,
    "truck-dock":    3396656,
    "road-dusk":     10359129,
    "control-room":  5831262,
    "cargo-inside":  1267327,
    "ship-dock":     36091628,
    "road-trails":   16766917,
}

def get(url: str) -> bytes:
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()

# ---- plates -------------------------------------------------------------
for name, pid in PLATES.items():
    src = IMG / f"{name}.jpg"
    if not src.exists():
        url = (f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg"
               f"?auto=compress&cs=tinysrgb&w=2400")
        src.write_bytes(get(url))
        print(f"dl {name} ({src.stat().st_size//1024} KB)")
    im = Image.open(src).convert("RGB")
    # full-size webp
    full = IMG / f"{name}.webp"
    if not full.exists():
        im.save(full, "WEBP", quality=80, method=6)
    # small variant 800w
    sm = IMG / f"{name}-s.webp"
    if not sm.exists():
        s = im.copy()
        s.thumbnail((800, 800), Image.LANCZOS)
        s.save(sm, "WEBP", quality=76, method=6)
    print(f"  {name}: {im.size}  full {full.stat().st_size//1024}KB  s {sm.stat().st_size//1024}KB")

# ---- fonts --------------------------------------------------------------
FAMILIES = {
    "archivo-latin-wght-normal": "Archivo:wght@400..900",
    "instrument-sans-latin-wght-normal": "Instrument+Sans:wght@400..700",
    "ibm-plex-mono-latin-400-normal": "IBM+Plex+Mono:wght@400",
}
for slug, fam in FAMILIES.items():
    out = FONTS / f"{slug}.woff2"
    if out.exists():
        print(f"font {slug} exists")
        continue
    css = get(f"https://fonts.googleapis.com/css2?family={fam}&display=swap").decode()
    # latin subset only (last @font-face block without ext ranges beyond latin)
    blocks = re.findall(r"/\*\s*([\w\-\[\]]+)\s*\*/\s*@font-face\s*{(.*?)}", css, re.S)
    latin = [b for k, b in blocks if k == "latin"]
    url = re.search(r"url\((https://[^)]+\.woff2)\)", latin[-1] if latin else css).group(1)
    out.write_bytes(get(url))
    print(f"font {slug}: {out.stat().st_size//1024} KB")

print("done")
