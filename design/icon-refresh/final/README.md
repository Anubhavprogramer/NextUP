# NextUP mark — "UP ligature" (v1, 29 Sep 2026)

**Idea:** the U's right arm becomes the P's stem, so a single continuous stroke spells **UP**. It's a refresh of the original icon: the palette and the U→P ligature stay, and "NEXT" and the hairline outline go.

## Files
| File | Use |
|---|---|
| `nextup-mark-brown.svg` | **Master.** Brand-brown mark, transparent, 256-unit canvas |
| `nextup-mark-black.svg` / `-white.svg` | One-colour versions (black on light, white on dark or photos) |
| `nextup-icon-square.svg` | Full-bleed app icon (iOS 1024, Play 512): the platform applies its own mask |
| `nextup-icon-rounded.svg` / `-circle.svg` | Pre-masked icons (legacy Android launcher PNGs, web) |
| `exports/` | Black, white, mono, social square, favicon and app-icon tile, as SVG + 1024 PNG |

Where it's wired in:
- **Android:** `android/app/src/main/res/drawable/ic_launcher_foreground.xml` (vector), `mipmap-anydpi-v26/ic_launcher*.xml` (adaptive + monochrome), `values/ic_launcher_background.xml`, `mipmap-*/ic_launcher*.png` (legacy)
- **iOS:** `ios/NextUP/Images.xcassets/AppIcon.appiconset/AppIcon-1024.png`
- **App:** `assets/app-icon.png` (onboarding)
- **Store:** `store-assets/icon-512.png`, `feature-graphic.jpg`
- **Privacy site:** `nextup-privacy/icon.png`, `favicon.ico`

## Colour
| | HEX | RGB | Use |
|---|---|---|---|
| Brand brown | `#743700` | 116 55 0 | The mark, always |
| Peach | `#FADCC2` | 250 220 194 | Icon tile and app background |
| Burnt orange | `#BC6C25` | 188 108 37 | UI accents only, **not the mark** (only 3.0:1 on peach; brown is 7.0:1) |

## Construction
- One weight: 32 units on the 256 grid. Round terminals (r = 16). P counter 34 × 56 units.
- Optical lift: the mark sits 5 units (2%) above the geometric centre.
- Android adaptive icon: the 256-unit canvas maps onto the **66 dp safe zone** of the 108 dp layer, so any launcher mask (circle, squircle, teardrop) keeps the whole mark.

## Usage
- **Clear space:** at least one stroke width (32 units) around the mark.
- **Minimum size:** 24 px for the mark on its own. Below 20 px the P's counter fills in; if a 16 px notification icon is ever needed, draw a simplified cut with a thicker stroke and a bigger counter.
- **Backgrounds:** peach tile (preferred), white, or brand brown with the white mark. On photos, use the white or black one-colour version.
- **Don't:** put "NEXT" back inside the icon, stretch or rotate it, add outlines, shadows or gradients, recolour it in orange, or place brown on dark photos.

With the name, pair the mark with **"NextUP"** set in SF Pro / Roboto Bold (the app's system fonts). The Play listing name "NextUP: Watchlist from Reels" carries the full name.

## Open items
- **Trademark:** no clearance search was done. Before launch, run a reverse-image search and a quick USPTO/WIPO/Indian TM search for "UP" letterform marks in class 9.
- **Launch video:** `brag-output/brag.mp4` is re-rendered with the new mark. The yc-parody video's folder was removed, so it hasn't been updated.
