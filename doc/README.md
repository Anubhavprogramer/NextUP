# NextUP App — Docs

A React Native watchlist app for iOS and Android. Users search TMDB or **share an Instagram reel**, then track titles as *Want to Watch*, *Watching* or *Watched*. All data stays on the device.

| Doc | Contents |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Folder map, layers, navigation, popups, theme, domain model, error handling |
| [REEL_SHARE_INTEGRATION.md](./REEL_SHARE_INTEGRATION.md) | How share → import works on iOS and Android, how to test it, and why the first attempt was reverted |
| [SETUP_AND_RELEASE.md](./SETUP_AND_RELEASE.md) | Setup, running on your iPhone and Android, tests, git/PR workflow, Play Store release |

Product and cross-repo docs: [`../../doc/`](../../doc/README.md) (PRD, roadmap, audit).

## Status at a glance (2026-09-29)
- ✅ Onboarding, Home, Search, Detail, Collection screens
- ✅ Reel import via the share sheet: iOS share extension (tested on iPhone) + Android share intent (compiles; not yet tested on a device)
- ✅ Themed bottom-sheet popups (`useDialog`) · single light theme
- ✅ 17 Jest tests
- ⏳ Settings screen, export/import backup, rating/notes UI
- ⏳ Play Store release (final app ID, privacy policy, store assets)
