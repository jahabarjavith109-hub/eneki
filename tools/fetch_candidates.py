"""Download Pexels candidates and build contact sheets for visual selection."""
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw

CAND = Path(__file__).resolve().parent.parent / "tools" / "candidates"
CAND.mkdir(parents=True, exist_ok=True)

B = "https://images.pexels.com/photos/{}/pexels-photo-{}.jpeg?auto=compress&cs=tinysrgb&w=640"

SCENES = {
    "port-dusk":     [35458829, 16520011, 14020705, 27402391, 12841119],
    "crane-view":    [17865551, 12841692, 36091628, 24702864, 12357747],
    "ship-aerial":   [12530455, 25461690, 7502481, 13275008, 33803470],
    "sea-night":     [15406028, 34155535, 10094885, 4638772, 6510357],
    "air-cargo":     [39269834, 11213139, 27490332, 5876475, 3374249],
    "warehouse":     [1267327, 29491402, 4487363, 9305407, 6028170],
    "truck-dock":    [8858566, 20398056, 3396656, 33093563, 11290329],
    "road-dusk":     [10359129, 15610996, 23957127, 16766917, 12676275],
    "control-room":  [13401910, 13025947, 7865064, 5831262, 5920561],
    "cargo-inside":  [29690177, 13427763, 16244327, 31688194, 29690177],
}

for scene, ids in SCENES.items():
    thumbs = []
    for pid in ids:
        f = CAND / f"{scene}-{pid}.jpg"
        if not f.exists():
            try:
                req = urllib.request.Request(B.format(pid, pid), headers={"User-Agent": "Mozilla/5.0"})
                f.write_bytes(urllib.request.urlopen(req, timeout=30).read())
            except Exception as e:
                print(f"FAIL {scene}-{pid}: {e}")
                continue
        try:
            im = Image.open(f).convert("RGB")
            im.thumbnail((400, 300))
            thumbs.append((pid, im))
        except Exception as e:
            print(f"BAD {f.name}: {e}")
    if not thumbs:
        continue
    # contact sheet: 5 across
    cols, cw, ch = len(thumbs), 410, 330
    sheet = Image.new("RGB", (cols * cw, ch), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    for i, (pid, im) in enumerate(thumbs):
        x = i * cw + (cw - im.size[0]) // 2
        sheet.paste(im, (x, 26))
        d.text((i * cw + 8, 6), f"{i}: {pid}", fill=(255, 220, 120))
    out = CAND / f"sheet-{scene}.jpg"
    sheet.save(out, quality=85)
    print(f"sheet-{scene}.jpg  ({len(thumbs)} imgs)  -> {out}")
