# Google Play — Listing & Console Answers

Everything to paste into Play Console for **NextUP: Watchlist from Reels** (`com.anubhavx10tion.codes`, the permanent Play package name). The answers below reflect what the code actually does (see `doc/ARCHITECTURE.md`); update them if features change.

## Main store listing

**App name** (30 max): `NextUP: Watchlist from Reels` (28)

**Short description** (80 max):
```
Share an Instagram reel. NextUP finds the movie and saves it to your watchlist.
```
(79 characters)

**Full description** (4000 max):
```
Saw a great movie on a reel, then forgot the name by dinner? NextUP fixes that.

SHARE A REEL, GET THE MOVIE
Tap Share on an Instagram reel and pick NextUP. It reads the reel's caption, finds the matching movies and shows on TMDB, and lets you add the right one to your list in one tap. No typing, no screenshots.

YOUR WATCHLIST, ORGANIZED
• Three simple lists: Want to Watch, Currently Watching and Watched
• Move a title between lists with one tap, or long-press for more options
• Search any movie or TV show and see its poster, year and rating
• Your stats at a glance: how much you've watched, what you're watching, what's next

PRIVATE BY DESIGN
• No account, no sign-up
• Your lists stay on your phone
• No ads, no tracking, no analytics
• Export a backup file any time, and import it on a new phone

Built for people who find their next favorite film while scrolling.

This product uses the TMDB API but is not endorsed or certified by TMDB. NextUP is not affiliated with Instagram or Meta.
```

**App category:** Entertainment · **Tags:** Movies & TV, Entertainment tracking
**Contact email:** (required, shown publicly) · **Website:** optional · **Privacy policy:** `https://anubhavprogramer.github.io/nextup-privacy/`

## Graphics
| Asset | Spec | File |
|---|---|---|
| App icon | 512×512 PNG, ≤ 1 MB | `store-assets/icon-512.png` (UP ligature; see `design/icon-refresh/final/README.md`) |
| Feature graphic | 1024×500 JPG/PNG, no alpha | `store-assets/feature-graphic.jpg` |
| Phone screenshots | 2–8, 16:9 or 9:16, 320–3840 px per side | `store-assets/screenshots/*.png` |
| Promo video (optional) | YouTube URL | could use `brag-output/brag.mp4` (check the music licence first) |

## App content (Policy → App content)

**Privacy policy:** URL above.

**Ads:** No, the app doesn't contain ads.

**App access:** All functionality is available without special access (no login).

**Target audience and content:** 13+ (choose "13–15", "16–17", "18 and over"). Not designed for children. The app doesn't appeal to children.

**Content rating (IARC questionnaire):** category **"All Other App Types"** (not a game, social network or reference app). Answer **No** to violence, sexuality, language, controlled substances, gambling and horror. Users **can't** chat with each other, share their location or buy digital goods. The app doesn't offer unrestricted web browsing; it shows TMDB posters and overviews only. Expected rating: **Everyone / PEGI 3**. TMDB posters are studio artwork; if a rater flags a mature poster, it may become Teen.

**News app:** No. **Government app:** No. **Financial features:** None. **Health:** None.

### Data safety
| Question | Answer | Why |
|---|---|---|
| Does your app collect or share any of the required user data types? | **Yes** | The shared reel link is sent to our server, and search text to TMDB, to provide the feature |
| Is all user data encrypted in transit? | **Yes** | HTTPS only |
| Can users request data deletion? | **Yes**, via uninstalling or clearing app storage; nothing is kept server-side per user | |
| **Data types collected** | | |
| App activity → *Other user-generated content* (the shared reel link / text) | Collected, **not shared**, **processed ephemerally: No** (cached up to 7 days by reel ID), **required**, purpose **App functionality** | Server caches the resolved result by reel ID, not linked to a user |
| App activity → *In-app search history* | **Not collected** (it stays on the device). Searches go to TMDB to fetch results; Google treats sending data to a service provider to fulfil the request as not "sharing" | |
| Personal info → Name | **Not collected** (stored only on the device) | |
| Device or other IDs | Not collected | |

Google counts data that never leaves the device as not collected. If unsure, the conservative option is to also declare *In-app search history → collected, ephemeral, app functionality*.

## Release notes (first release)
```
First release: share a reel to NextUP to save the movie in it, keep three watchlists, and back them up to a file.
```

## Testing track (required for new personal developer accounts)
1. **Testing → Closed testing** → create track → add an email list with **12+ testers** (Google accounts).
2. Upload the AAB, roll out, and share the opt-in link. Testers must **opt in and keep it installed**.
3. After **14 consecutive days** with ≥ 12 opted-in testers, **Apply for production** (Dashboard). Google asks a few questions about the test.
