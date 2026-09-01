#!/usr/bin/env python3
"""Clean up studio headshots: even the backdrop, fix the cast, gentle contrast.

    python3 tools/retouch-portraits.py in.jpg out.jpg           # studio
    python3 tools/retouch-portraits.py in.jpg out.jpg outdoor   # no backdrop

What it does: neutralises the colour cast off the backdrop, lifts the backdrop
to a near-white even tone so lighting shadows behind the subject disappear, and
applies a gentle S-curve. It runs the backdrop lift twice, because a deep
shadow only registers weakly on the first pass and reads as background on the
second.

What it deliberately does NOT do: touch skin. Automated skin work is what makes
a headshot look processed, and a slightly uneven backdrop is a much smaller
problem than a plastic face. Blemish removal, stray hairs and real dodging and
burning still want a person in Lightroom or Photoshop.

The backdrop mask is bright pixels with low saturation, feathered. The
saturation gate is what keeps skin and clothing out of it.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

TARGET_BG = 249.0     # where the backdrop should land
BG_LUM_MIN = 0.55     # only pixels brighter than this are candidates
BG_SAT_MAX = 0.22     # and only unsaturated ones, so clothing is safe
FEATHER = 9           # px blur on the mask, scaled with image size


def to_float(im):
    return np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0


def luma(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def saturation(a):
    mx = a.max(axis=2)
    mn = a.min(axis=2)
    return np.where(mx > 1e-6, (mx - mn) / np.maximum(mx, 1e-6), 0.0)


def background_mask(a, w):
    """Soft mask of the plain backdrop: bright, unsaturated, and feathered so
    the transition through wispy hair does not leave a halo."""
    L, S = luma(a), saturation(a)
    raw = np.clip((L - BG_LUM_MIN) / 0.22, 0, 1) * np.clip((BG_SAT_MAX - S) / 0.12, 0, 1)
    m = Image.fromarray((raw * 255).astype(np.uint8))
    m = m.filter(ImageFilter.GaussianBlur(max(3, int(FEATHER * w / 1600))))
    return np.asarray(m, dtype=np.float32) / 255.0


def neutralise(a, mask):
    """Remove a colour cast by making the backdrop grey."""
    wsum = mask.sum()
    if wsum < 1000:
        return a
    avg = np.array([(a[..., c] * mask).sum() / wsum for c in range(3)])
    if avg.max() < 1e-6:
        return a
    gain = avg.mean() / np.maximum(avg, 1e-6)
    gain = np.clip(gain, 0.92, 1.08)          # cast correction, not a look
    return np.clip(a * gain, 0, 1)


def lift_background(a, mask):
    """Push the backdrop up to a near-white, even tone.

    Works on the gap between each pixel and the target rather than a flat
    multiply, so a shadowed corner is lifted more than an already-bright one
    and the backdrop ends up even."""
    L = luma(a)[..., None]
    target = TARGET_BG / 255.0
    gap = np.clip(target - L, 0, 1)
    return np.clip(a + gap * mask[..., None] * 0.92, 0, 1)


def tone(a, strength=1.0):
    """Gentle S-curve: a little more contrast, blacks kept off the floor."""
    lo, hi = 0.02 * strength, 1.0
    a = np.clip((a - lo) / (hi - lo), 0, 1)
    return np.clip(a + strength * 0.10 * (a * (1 - a) * (a - 0.5)) * -2.0, 0, 1)


def process(src, dst, studio=True, sharpen=True):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    w, h = im.size
    a = to_float(im)

    if studio:
        mask = background_mask(a, w)
        cover = mask.mean()
        if cover < 0.04:
            print(f"  {dst}: backdrop only {cover*100:.1f}% of frame, skipping the lift")
        else:
            a = neutralise(a, mask)
            # Two passes. A deep shadow sits low enough that the first mask only
            # catches it weakly; once partly lifted it reads as background and
            # the second pass finishes it. The saturation gate keeps skin out of
            # both, which is what stops this turning into a face edit.
            for _ in range(2):
                a = lift_background(a, background_mask(a, w))
    a = tone(a, 1.0 if studio else 0.7)

    out = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    if sharpen:
        out = out.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=4))
    out.save(dst, quality=95, subsampling=0)
    return out


if __name__ == "__main__":
    studio = sys.argv[3] != "outdoor" if len(sys.argv) > 3 else True
    process(sys.argv[1], sys.argv[2], studio=studio)
