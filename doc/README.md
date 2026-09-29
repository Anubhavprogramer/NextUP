# NextUP App — Docs

A React Native watchlist app. Users search TMDB, then track titles as *Want to Watch*, *Watching* or *Watched*. All data stays on the device.

| Doc | Contents |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Folder map, layers, domain model, navigation, theming, known structural bugs |
| [REEL_SHARE_INTEGRATION.md](./REEL_SHARE_INTEGRATION.md) | Why the first reel-share attempt was reverted, and the rebuild design |
| [SETUP_AND_RELEASE.md](./SETUP_AND_RELEASE.md) | Dev setup, env config, secure signing, AAB build, Play Console checklist |

Product and cross-repo docs: [`../../doc/`](../../doc/README.md), which covers the PRD, roadmap and audit.

## Status at a glance
- ✅ Onboarding, Home, Search, Detail, Collection screens, theming, local storage
- 🔴 Reel import (to be rebuilt), Settings screen, export/import UI
- 🔴 Release signing (the keystore is committed; see the setup doc)
