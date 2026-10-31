"""Generate assets/icon-180.png from a small vector-like drawing.

Run with the bundled Python:
  python scripts/make-icon.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "icon-180.png"
SCALE = 4
SIZE = 180 * SCALE


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    gradient = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pixels = gradient.load()
    start = (59, 111, 224)
    end = (124, 92, 255)
    for y in range(SIZE):
        for x in range(SIZE):
            t = (x / SIZE * 0.55) + (y / SIZE * 0.45)
            pixels[x, y] = (
                lerp(start[0], end[0], t),
                lerp(start[1], end[1], t),
                lerp(start[2], end[2], t),
                255,
            )
    gradient.putalpha(rounded_mask(SIZE, 42 * SCALE))
    draw = ImageDraw.Draw(gradient)

    # Soft paper with a folded corner.
    left, top, right, bottom = 42 * SCALE, 30 * SCALE, 128 * SCALE, 148 * SCALE
    paper = (248, 251, 255, 255)
    edge = (201, 220, 255, 255)
    draw.rounded_rectangle((left, top, right, bottom), radius=12 * SCALE, fill=paper, outline=edge, width=3 * SCALE)
    fold = [(right - 27 * SCALE, top), (right, top + 27 * SCALE), (right - 27 * SCALE, top + 27 * SCALE)]
    draw.polygon(fold, fill=(204, 222, 255, 255))
    draw.line([(right - 27 * SCALE, top), (right - 27 * SCALE, top + 27 * SCALE), (right, top + 27 * SCALE)],
              fill=(151, 181, 238, 255), width=2 * SCALE)

    # Text lines.
    ink = (88, 124, 180, 255)
    for index, width in enumerate((47, 47, 33, 24)):
        y = (57 + index * 17) * SCALE
        draw.rounded_rectangle((56 * SCALE, y, (56 + width) * SCALE, y + 5 * SCALE), radius=2.5 * SCALE, fill=ink)

    # Sparkle mark.
    cx, cy, outer, inner = 130 * SCALE, 112 * SCALE, 30 * SCALE, 9 * SCALE
    star = [
        (cx, cy - outer), (cx + inner, cy - inner), (cx + outer, cy),
        (cx + inner, cy + inner), (cx, cy + outer),
        (cx - inner, cy + inner), (cx - outer, cy), (cx - inner, cy - inner),
    ]
    draw.polygon(star, fill=(255, 213, 90, 255))
    # Small secondary spark.
    sx, sy, so, si = 148 * SCALE, 74 * SCALE, 13 * SCALE, 4 * SCALE
    draw.polygon([
        (sx, sy - so), (sx + si, sy - si), (sx + so, sy),
        (sx + si, sy + si), (sx, sy + so),
        (sx - si, sy + si), (sx - so, sy), (sx - si, sy - si),
    ], fill=(255, 255, 255, 235))

    gradient.resize((180, 180), Image.LANCZOS).save(OUT, "PNG", optimize=True)
    print(OUT)


if __name__ == "__main__":
    main()
