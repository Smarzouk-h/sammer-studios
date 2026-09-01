#!/usr/bin/env python3
"""Rebuild the web-sized photographs and the data file the site reads.

Run this after editing tools/curation.py (to add, remove, retitle, or
re-sort photographs):

    python3 tools/build_images.py --source "/path/to/your/originals"

It writes photos/thumb, photos/full, photos/hero, data/photos.json and
data/photos.js. Every output is stripped of metadata, which matters: a good
number of the originals carry GPS coordinates, and those must not go online.

Needs ImageMagick (`brew install imagemagick`) and Pillow + pillow-heif
(`pip3 install pillow pillow-heif`).
"""
import argparse
import base64, hashlib, io, json, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from curation import CURATION, COLLECTIONS

SP = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(SP)          # the site root, one level up from tools/

_ap = argparse.ArgumentParser(description=__doc__)
_ap.add_argument("--source", required=True,
                 help="folder holding the original photographs")
_ap.add_argument("--index", default=os.path.join(SP, "_source_index.txt"),
                 help="index mapping curation numbers to filenames")
ARGS = _ap.parse_args()
SRC_ROOT = ARGS.source

THUMB_EDGE = 1000
FULL_EDGE = 2400
HERO_WIDTHS = [1200, 1800, 2400]
HERO_SLUG = "lakefront-sunstar"

idx_to_path = {}
for line in open(ARGS.index):
    i, p = line.rstrip("\n").split("\t")
    idx_to_path[int(i)] = os.path.join(SRC_ROOT, p)


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd[:3])}...\n{r.stderr[:400]}")


def convert(src, dst, edge, quality, is_width=False):
    resize = f"{edge}x" if is_width else f"{edge}x{edge}>"
    run([
        "magick", src,
        "-auto-orient",
        "-colorspace", "sRGB",
        "-resize", resize,
        "-strip",                       # drop EXIF/GPS/IPTC entirely
        "-quality", str(quality),
        "-interlace", "Plane",
        "-sampling-factor", "4:2:0",
        dst,
    ])


def lqip(src):
    """24px wide blurred JPEG as a data URI for progressive loading."""
    out = f"{SP}/_lqip.jpg"
    run(["magick", src, "-auto-orient", "-colorspace", "sRGB", "-resize", "24x",
         "-blur", "0x1.2", "-strip", "-quality", "40", out])
    with open(out, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()


# EXIF model strings mapped to how the camera should read on the site. Anything
# not listed falls back to the raw model string, so a new body still shows up
# with a sensible name rather than disappearing.
CAMERAS = {
    "ILCE-7M4": "Sony A7 IV",
    "Canon EOS DIGITAL REBEL XTi": "Canon Rebel XTi, 2006",
    "Canon EOS 5D": "Canon EOS 5D, 2005",
    "iPhone 14": "iPhone 14",
    "iPhone 14 Pro Max": "iPhone 14 Pro Max",
    "iPhone 17 Pro Max": "iPhone 17 Pro Max",
    "DC VARIO-SUMMILUX 1:1.7-2.8/10.9-34 ASPH.": "Leica D-Lux 8",
    "DCR-DVD650": "Sony Handycam",
}


def camera_of(path):
    """Read the camera model from the ORIGINAL, before metadata is stripped."""
    try:
        from PIL import Image
        from PIL.ExifTags import TAGS
        ex = Image.open(path).getexif() or {}
        tags = {TAGS.get(k, k): v for k, v in ex.items()}
        return str(tags.get("Model") or "").strip()
    except Exception:
        return ""


def dims(path):
    r = subprocess.run(["magick", "identify", "-format", "%w %h", path],
                       capture_output=True, text=True, check=True)
    w, h = r.stdout.split()
    return int(w), int(h)


def build(entry):
    src_idx, slug, title, coll, loc, feat = entry
    src = idx_to_path[src_idx]
    convert(src, f"{OUT}/photos/thumb/{slug}.webp", THUMB_EDGE, 80)
    convert(src, f"{OUT}/photos/thumb/{slug}.jpg",  THUMB_EDGE, 80)
    convert(src, f"{OUT}/photos/full/{slug}.webp",  FULL_EDGE, 82)
    convert(src, f"{OUT}/photos/full/{slug}.jpg",   FULL_EDGE, 84)
    w, h = dims(f"{OUT}/photos/full/{slug}.jpg")
    model = camera_of(src)
    # Short content hash. It goes on the image URLs so that replacing a
    # photograph changes its address and browsers cannot serve the old one,
    # while everything unchanged keeps its URL and stays cached.
    with open(f"{OUT}/photos/full/{slug}.jpg", "rb") as fh:
        ver = hashlib.md5(fh.read()).hexdigest()[:8]
    if slug == HERO_SLUG:
        # Responsive hero. Kept at or below 2400px: some browsers fail to
        # composite very large WebP images, and phones should not pull 3000px.
        for hw in HERO_WIDTHS:          # not `w`: that holds the photo's own width
            convert(src, f"{OUT}/photos/hero/hero-{hw}.webp", hw, 80, is_width=True)
            convert(src, f"{OUT}/photos/hero/hero-{hw}.jpg",  hw, 82, is_width=True)
    return {
        "slug": slug, "title": title, "collection": coll, "location": loc,
        "featured": feat, "w": w, "h": h,
        "camera": CAMERAS.get(model, model),
        "v": ver,
        "orient": "square" if abs(w - h) / max(w, h) < 0.06 else ("landscape" if w > h else "portrait"),
    }


print(f"Processing {len(CURATION)} photos ...")
with ThreadPoolExecutor(6) as ex:
    photos = list(ex.map(build, CURATION))

# LQIPs are sequential (they share one temp file)
for p, entry in zip(photos, CURATION):
    p["lqip"] = lqip(idx_to_path[entry[0]])
os.path.exists(f"{SP}/_lqip.jpg") and os.remove(f"{SP}/_lqip.jpg")

data = {
    "collections": [{"id": k, **v} for k, v in COLLECTIONS.items()],
    "photos": photos,
}
os.makedirs(f"{OUT}/data", exist_ok=True)
with open(f"{OUT}/data/photos.json", "w") as f:
    json.dump(data, f, indent=1)

# The hero lives in static HTML so it cannot use photoURL. Stamp its version
# here instead, so swapping the hero photograph cannot serve a cached old one.
hero_ref = f"{OUT}/photos/hero/hero-2400.jpg"
if os.path.exists(hero_ref):
    with open(hero_ref, "rb") as fh:
        hv = hashlib.md5(fh.read()).hexdigest()[:8]
    idx_path = f"{OUT}/index.html"
    html = open(idx_path).read()
    new_html = re.sub(r'(photos/hero/hero-\d+\.(?:webp|jpg))(\?v=[0-9a-f]+)?',
                      lambda m: f"{m.group(1)}?v={hv}", html)
    if new_html != html:
        open(idx_path, "w").write(new_html)
        print(f"  stamped the hero URLs with v={hv}")

with open(f"{OUT}/data/photos.js", "w") as f:
    f.write("/* Generated by build_images.py - do not edit by hand. */\n")
    f.write("window.PHOTO_DATA = ")
    json.dump(data, f, separators=(",", ":"))
    f.write(";\n")

print(f"  wrote {len(photos)} photos -> data/photos.json + data/photos.js")
from collections import Counter
print(" ", dict(Counter(p["collection"] for p in photos)))
print(" ", dict(Counter(p["orient"] for p in photos)))
