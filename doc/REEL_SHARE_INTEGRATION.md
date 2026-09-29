# Reel Share → Import

How "Instagram → Share → NextUP" works on iOS and Android (shipped 2026-09-29, merged to `main`), how to test it, and why the first attempt was reverted.

## Flow

```
iOS:     Instagram → Share → More → NextUP  (NextUPShare.appex)
Android: Instagram → Share → NextUP          (MainActivity, ACTION_SEND text/plain)
                     │
                     ▼   both open the app with
          nextup://import?url=<percent-encoded shared text>
                     │
   React Native Linking: getInitialURL() (cold start) + 'url' events (warm start)
                     ▼
   ShareIntentProvider  → parseImportLink() → pendingShare
                     ▼
   AppNavigator (once the stack is mounted and onboarding is done)
     → navigate('ReelImport', { sharedText })
                     ▼
   ReelImportScreen → findInstagramReelUrl() → resolveReel() → POST /api/reels/resolve
     → candidates → pick title + list → addToCollection → MediaDetail
```

One deep link on both platforms means there's no custom native module and only one JS code path.

## Pieces

| Piece | File |
|---|---|
| iOS share extension | `ios/NextUPShare/ShareViewController.swift`, `ios/NextUPShare/Info.plist` (accepts 1 web URL or text) |
| iOS URL scheme + forwarding to Linking | `ios/NextUP/Info.plist` (`CFBundleURLTypes: nextup`), `ios/NextUP/AppDelegate.swift` (`RCTLinkingManager`) |
| Android share → import link | `android/app/src/main/java/com.anubhavx10tion.nextup/MainActivity.kt` (`toImportIntent`), `AndroidManifest.xml` (SEND + `nextup://import` filters) |
| Link helpers | `src/Utils/reelLinks.ts` (+ tests) |
| Backend client | `src/API/reels.ts` (+ tests), `src/Config/env.ts` |
| Hand-off | `src/Store/ShareIntentContext.tsx`, `src/Navigation/AppNavigator.tsx` |
| UI | `src/Screens/ReelImportScreen.tsx` |
| Manual-search fallback | `Search` route param `initialQuery` |

### iOS details
- Target `NextUPShare`, bundle id `com.anubhavx10tion.nextup.share`, embedded in `NextUP.app/PlugIns` via the "Embed Foundation Extensions" build phase. It's plain Swift with no pods.
- **No App Group**, so it works with a free (Personal Team) Apple ID. The extension can't call `UIApplication.shared.open`, so it walks the responder chain to `UIApplication` and invokes `open(_:options:completionHandler:)` at runtime. This is widely used but undocumented. If a future iOS breaks it, switch to an App Group (paid account) or a "copy link, then open NextUP" flow.
- The shared text is percent-encoded with only ASCII unreserved characters left as-is, so the reel link's own `?`, `&` and `=` survive as one query value. JS decodes it with `decodeURIComponent`.

### Android details
- `MainActivity` rewrites an `ACTION_SEND` text intent into `ACTION_VIEW nextup://import?url=…` **before** `super.onCreate` / `super.onNewIntent`. React Native's Linking then treats it like any deep link, cold or warm.
- `launchMode="singleTask"` means a warm share goes to `onNewIntent` rather than opening a second activity.

## Testing on a device

| Case | Expected |
|---|---|
| App closed → share a reel | "Opening NextUP…" (iOS) → app launches on Import |
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
  com.anubhavx10tion.nextup
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
