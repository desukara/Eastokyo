from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "assets" / "images" / "brand"
SOURCE = BRAND / "eastokyo-crow.jpg"
REPORT = BRAND / "asset-validation.json"

PAPER = (244, 236, 223, 255)
INK = (23, 23, 23, 255)


def transparent_mark(source: Image.Image) -> Image.Image:
    image = source.convert("RGBA")
    data = np.asarray(image, dtype=np.float32)
    rgb = data[..., :3]
    luminance = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    alpha = np.clip((250 - luminance) / 22 * 255, 0, 255)
    alpha[luminance < 220] = 255
    rgba = np.dstack([rgb, alpha]).astype(np.uint8)
    result = Image.fromarray(rgba, "RGBA")
    bbox = result.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError("The approved crow source produced an empty transparent mark.")
    result = result.crop(bbox)
    side = max(result.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(result, ((side - result.width) // 2, (side - result.height) // 2))
    return canvas


def fit(image: Image.Image, size: int, padding: int = 0) -> Image.Image:
    inner = size - 2 * padding
    resized = image.copy()
    resized.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
    return canvas


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    )
    for candidate in candidates:
        if os.path.exists(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def save_opaque_icon(mark: Image.Image, size: int, filename: str, padding_fraction: float) -> Path:
    background = Image.new("RGBA", (size, size), PAPER)
    background.alpha_composite(fit(mark, size, int(size * padding_fraction)))
    path = BRAND / filename
    background.convert("RGB").save(path, optimize=True)
    return path


def save_card(mark: Image.Image, width: int, height: int, filename: str, mark_fraction: float, title_size: int, subtitle_size: int) -> Path:
    background = Image.new("RGB", (width, height), PAPER[:3])
    drawing = ImageDraw.Draw(background)
    mark_image = fit(mark, int(min(width, height) * mark_fraction))
    x = (width - mark_image.width) // 2
    y = int(height * 0.05)
    background.paste(mark_image, (x, y), mark_image)
    title = "EASTOKYO"
    subtitle = "MAGAZINE"
    title_font = font(title_size)
    subtitle_font = font(subtitle_size)
    title_box = drawing.textbbox((0, 0), title, font=title_font)
    subtitle_box = drawing.textbbox((0, 0), subtitle, font=subtitle_font)
    title_y = int(height * 0.76)
    drawing.text(((width - (title_box[2] - title_box[0])) / 2, title_y), title, font=title_font, fill=INK[:3])
    drawing.text(((width - (subtitle_box[2] - subtitle_box[0])) / 2, title_y + title_size + 10), subtitle, font=subtitle_font, fill=INK[:3])
    path = BRAND / filename
    background.save(path, quality=92, optimize=True, progressive=True)
    return path


def validate(paths: list[Path]) -> None:
    report = []
    for path in paths:
        image = Image.open(path)
        rgba = np.asarray(image.convert("RGBA"))
        alpha = rgba[..., 3]
        visible_pixels = int((alpha > 0).sum())
        ink_pixels = int(((rgba[..., :3].mean(axis=2) < 220) & (alpha > 0)).sum())
        if visible_pixels == 0 or ink_pixels == 0 or path.stat().st_size == 0:
            raise RuntimeError(f"Generated asset is empty or invalid: {path.name}")
        report.append({"file": path.name, "width": image.width, "height": image.height, "mode": image.mode, "bytes": path.stat().st_size, "visible_pixels": visible_pixels, "ink_pixels": ink_pixels, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    REPORT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Approved source artwork is missing: {SOURCE}")
    BRAND.mkdir(parents=True, exist_ok=True)
    mark = transparent_mark(Image.open(SOURCE))
    generated: list[Path] = []
    for size in (512, 256, 128):
        path = BRAND / f"eastokyo-crow-mark-{size}.png"
        fit(mark, size, int(size * 0.02)).save(path, optimize=True)
        generated.append(path)
    for size in (16, 32, 48):
        path = BRAND / f"favicon-{size}.png"
        fit(mark, size, max(1, int(size * 0.06))).save(path, optimize=True)
        generated.append(path)
    favicon = BRAND / "favicon.ico"
    fit(mark, 256, 8).save(favicon, sizes=[(16, 16), (32, 32), (48, 48)])
    generated.append(favicon)
    generated.extend([
        save_opaque_icon(mark, 180, "apple-touch-icon.png", 0.10),
        save_opaque_icon(mark, 192, "android-chrome-192.png", 0.10),
        save_opaque_icon(mark, 512, "android-chrome-512.png", 0.10),
        save_opaque_icon(mark, 512, "android-maskable-512.png", 0.22),
        save_card(mark, 1600, 1200, "eastokyo-splash-1600x1200.jpg", 0.62, 150, 48),
        save_card(mark, 1200, 630, "eastokyo-social-card-1200x630.jpg", 0.53, 105, 34),
    ])
    lockup = Image.new("RGBA", (1400, 360), (0, 0, 0, 0))
    lockup.alpha_composite(fit(mark, 320, 8), (0, 20))
    drawing = ImageDraw.Draw(lockup)
    drawing.text((360, 40), "EASTOKYO", font=font(180), fill=INK)
    drawing.text((370, 238), "MAGAZINE", font=font(54), fill=INK)
    lockup_path = BRAND / "eastokyo-logo-horizontal.png"
    lockup.save(lockup_path, optimize=True)
    generated.append(lockup_path)
    validate(generated)
    print(f"Generated and validated {len(generated)} Eastokyo brand assets.")


if __name__ == "__main__":
    main()
