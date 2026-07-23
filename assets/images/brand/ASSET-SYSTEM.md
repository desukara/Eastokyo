# Eastokyo brand asset system

The approved crow artwork is the source for all production exports.

- `eastokyo-crow-mark-512.png`, `-256.png`, and `-128.png` use transparent backgrounds for page marks.
- `eastokyo-logo-horizontal.png` is the transparent horizontal lockup.
- `favicon.ico`, `favicon-16.png`, `favicon-32.png`, and `favicon-48.png` are browser icons.
- `apple-touch-icon.png` is the opaque 180×180 Apple touch icon.
- `android-chrome-192.png` and `android-chrome-512.png` are opaque launcher icons.
- `android-maskable-512.png` includes extra safe-area padding for adaptive masks.
- `eastokyo-splash-1600x1200.jpg` is the splash-page artwork.
- `eastokyo-social-card-1200x630.jpg` is the social sharing image.
- `asset-validation.json` records dimensions, file sizes, visible-pixel counts, and hashes for generated exports.

Run `python scripts/build_brand_assets.py` after changing the approved source artwork.
