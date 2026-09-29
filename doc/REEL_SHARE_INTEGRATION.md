# Reel Share → Import

How "Instagram → Share → NextUP" works on iOS and Android (shipped 2026-09-29, merged to `main`), how to test it, and why the first attempt was reverted.

## Flow

The two platforms differ on purpose: **Android shows a sheet over Instagram and never opens the app**, while iOS opens the app on the Import screen (a free Apple account can't share storage with a share extension).

```
Android: Instagram → Share → NextUP
   └─ ShareActivity (translucent, in the caller's task, excluded from Recents)
        └─ React root "NextUPShare" (src/Share/ShareSheetApp.tsx), launch prop sharedText
             • no profile yet  → "Set up NextUP first" → opens the app via nextup://import (share is held)
             • resolveReel()   → movie list (poster · year · "Already in …") + list chips (default Want to Watch)
             • tap a movie     → dataManager.addItem → "Added to … ✓" → closes after 1.1 s (BackHandler.exitApp)
             • error           → reason + Try again (if useful) + "Search in NextUP" (opens the Import screen)

iOS:     Instagram → Share → More → NextUP (NextUPShare.appex)
   └─ opens nextup://import?url=<text> → Linking → ShareIntentProvider → AppNavigator
        → ReelImportScreen → resolveReel() → pick title + list → MediaDetail
```

The Android sheet runs in NextUP's own process and JS runtime, so it uses the same `DataManager`, AsyncStorage and backend client as the app. When the app comes back to the foreground it reloads its lists (`AppState` listener in `AppProvider`), so titles saved from the sheet show up straight away.

## Pieces

| Piece | File |
|---|---|
| Android share target | `android/app/src/main/java/com/anubhavx10tion/nextup/ShareActivity.kt`, `AndroidManifest.xml` (SEND filter on `ShareActivity`), `res/values/styles.xml` (`ShareTheme`, translucent) |
| Android sheet UI | `src/Share/ShareSheetApp.tsx` (+ tests), registered as `NextUPShare` in `index.js` |
| iOS share extension | `ios/NextUPShare/ShareViewController.swift`, `ios/NextUPShare/Info.plist` (accepts 1 web URL or text) |
| iOS URL scheme + forwarding to Linking | `ios/NextUP/Info.plist` (`CFBundleURLTypes: nextup`), `ios/NextUP/AppDelegate.swift` (`RCTLinkingManager`) |
| `nextup://import` on Android | `MainActivity` VIEW filter (used by the sheet's "Open / Search in NextUP") |
| Link helpers | `src/Utils/reelLinks.ts` (+ tests) |
| Error copy (sheet + Import screen) | `src/Utils/reelErrors.ts` |
| Backend client | `src/API/reels.ts` (+ tests), `src/Config/env.ts` |
| iOS hand-off | `src/Store/ShareIntentContext.tsx`, `src/Navigation/AppNavigator.tsx` |
| iOS UI | `src/Screens/ReelImportScreen.tsx` |
| Manual-search fallback | `Search` route param `initialQuery` |

### Android details
- `ShareActivity` is a second `ReactActivity` with main component `NextUPShare`. Its delegate passes `sharedText` as a launch option, which becomes the root component's prop.
- `ShareTheme` makes the window transparent with no dim and no window animation; the sheet animates itself. `taskAffinity=""` and `excludeFromRecents` keep it out of Recents and off NextUP's own task, so closing it lands back in Instagram.
- `BackHandler.exitApp()` finishes `ShareActivity` (not the whole app). The hardware back button and a tap on the backdrop close it too.

### iOS details
- Target `NextUPShare`, bundle id `com.anubhavx10tion.nextup.share`, embedded in `NextUP.app/PlugIns` via the "Embed Foundation Extensions" build phase. It's plain Swift with no pods.
- **No App Group**, so it works with a free (Personal Team) Apple ID. The extension can't call `UIApplication.shared.open`, so it walks the responder chain to `UIApplication` and invokes `open(_:options:completionHandler:)` at runtime. This is widely used but undocumented. If a future iOS breaks it, switch to an App Group (paid account) or a "copy link, then open NextUP" flow.
- The shared text is percent-encoded with only ASCII unreserved characters left as-is, so the reel link's own `?`, `&` and `=` survive as one query value. JS decodes it with `decodeURIComponent`.

## Testing on a device

| Case | Expected |
|---|---|
| **Android:** share a reel from Instagram | Sheet slides up over Instagram, lists the movies; tap one → "Added ✓" → back in Instagram, app never opened |
| **Android:** share before onboarding | Sheet says "Set up NextUP first" → Open NextUP → onboarding → Import screen |
| **iOS:** app closed → share a reel | "Opening NextUP…" → app launches on Import |
| App open on Home → share | Import is pushed on top; Back returns to Home |
| App open on a detail screen → share | Import pushed; Back returns there |
| Fresh install, not onboarded → share | Onboarding first, then Import opens |
| Share a non-Instagram link | "That doesn't look like an Instagram reel link" + Search manually |
| Airplane mode → share | "Couldn't reach NextUP…" + Try again |
| Share a reel whose title is already saved | Candidate shows "Already in …" |

**iOS tip:** NextUP may be hidden the first time. In the share sheet, scroll the app row → **More** → turn on NextUP.

**Android without Instagram (emulator):**
```sh
adb shell am start -a android.intent.action.SEND -t text/plain \
  --es android.intent.extra.TEXT "https://www.instagram.com/reel/<id>/" \
  com.anubhavx10tion.codes/com.anubhavx10tion.nextup.ShareActivity
```

**Status:** iOS confirmed working on an iPhone 16 (iOS 26.6.1) by the user on 2026-09-29. Android compiles but hasn't been run on a device yet. How accurate the matching is on real reels hasn't been measured (see PRD §6.1).

---

## History: why the first attempt was reverted

`b589757` ("Add Instagram Reel sharing feature", 30 files, +5.4k lines) was reverted in `862d9d0`:

1. **Cold start lost the share:** `MainActivity.onCreate` emitted an event before React existed.
2. It used the old bridge API (`reactNativeHost.reactInstanceManager`) on a New Architecture app.
3. No JS listener was ever subscribed to the event.
4. `useNavigation()` was called outside the `NavigationContainer`.
5. `ShareIntentHandler.java` was in the wrong package (`com.nextup`), so it was dead code.
6. App Links with `autoVerify` had no `assetlinks.json`.
7. The backend URL was hardcoded to Railway.
8. It used only `movieNames[0]` from a noisy keyword extractor.
9. The navigation-reset bug (AUDIT A-1) broke the post-add navigation.
10. It added 11 generated markdown files.

The rebuild avoids all of these: it rewrites the intent before React starts, uses Linking instead of custom events, keeps navigation behind a ref, and gets TMDB-ranked candidates from the backend.
