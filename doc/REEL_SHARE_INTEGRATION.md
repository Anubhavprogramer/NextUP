# Reel Share Integration — Post-mortem & Rebuild Plan

The first version landed in `b589757` ("Add Instagram Reel sharing feature", 30 files, +5.4k lines) and was reverted in `862d9d0` because it didn't work. This doc explains **why**, and describes a smaller design that will work.

## Why v1 broke

| # | Problem | Where |
|---|---|---|
| 1 | **Cold start loses the share.** `MainActivity.onCreate` fires `INCOMING_SHARE` before the React context exists. `reactNativeHost.hasInstance()` is false or `currentReactContext` is null, so the event goes nowhere. Cold start is the most common case, because users share from Instagram while NextUP is closed. | `MainActivity.kt` |
| 2 | **Old-architecture API on a New Architecture app.** `reactNativeHost.reactInstanceManager` is the bridge API. With `newArchEnabled=true` (bridgeless) it isn't the active runtime. | `MainActivity.kt` |
| 3 | **Nothing on the JS side listened.** `useShareIntentHandler` only registered a navigation `beforeRemove` listener. `handleIncomingShare` was never subscribed to `DeviceEventEmitter.addListener('INCOMING_SHARE')`. | `src/Hooks/useShareIntentHandler.ts` |
| 4 | The hook calls `useNavigation()`, but it had to run at app root, outside `NavigationContainer`, where that throws. | same |
| 5 | `ShareIntentHandler.java` used package `com.nextup`, but the app's package is `com.anubhavx10tion.codes`. So it was dead code. | `android/.../com/nextup/` |
| 6 | App Links with `autoVerify` for `nextupapp.com` had no `assetlinks.json`. They would never verify. | `AndroidManifest.xml` |
| 7 | The backend URL was hardcoded to Railway, but the plan is Vercel, and there's no env config. | `src/API/reels.ts` |
| 8 | It used only `movieNames[0]` from the backend's keyword and regex extraction, which is often wrong (see backend AUDIT B-2). No candidates were offered. | `ReelManager.ts` |
| 9 | Adding an item triggers the navigation-reset bug (AUDIT A-1), so the auto-navigate after adding misbehaved. | `AppContext.tsx` |
| 10 | 11 generated markdown files plus example components added noise. | repo root |

**Worth reusing from `b589757`:** the `ReelDetailsResponse` typing, `ReelManager.processReelAndExtractMovie` structure, the ReelShareScreen layout (poster preview + 3-way collection selector), and the URL helpers in `helpers.ts`. See them with `git show b589757:<path>`.

## Rebuild design

### 1. Native (Android)

**Option A (recommended): use a maintained library.** Choose one that supports RN 0.83 + New Architecture, and check that before installing. Candidates are `react-native-share-menu` and `@kirankumar/react-native-receive-sharing-intent`-style libs, or `expo-share-intent` if you adopt Expo modules. What we need from it:
- `getInitialShare(): Promise<{ text?: string } | null>`, which returns the intent that launched the app (cold start)
- `addListener(cb)` for `onNewIntent` (warm start)

**Option B: a small custom TurboModule.** About 60 lines of Kotlin:
- In `MainActivity.onCreate`/`onNewIntent`, **store** `intent.getStringExtra(EXTRA_TEXT)` in a companion object field. Don't emit anything yet.
- The module exposes `getInitialShare()`, which returns the stored value and clears it.
- On `onNewIntent`, emit an event if the React context is ready (`reactHost.currentReactContext`). Otherwise just store the value.

Manifest (on the existing `MainActivity`, `launchMode="singleTask"`):
```xml
<intent-filter>
  <action android:name="android.intent.action.SEND" />
  <category android:name="android.intent.category.DEFAULT" />
  <data android:mimeType="text/plain" />
</intent-filter>
```
Leave out deep links and App Links for v1.

### 2. JS wiring

```
App.tsx
└─ <ShareIntentProvider>          // at root, no navigation dependency
     • on mount: getInitialShare()
     • subscribe: onShare
     • parseInstagramUrl(text) → pendingReelUrl (state, also persisted to AsyncStorage)
   └─ AppNavigator
        • once NavigationContainer is ready AND user is onboarded:
          if pendingReelUrl → navigationRef.navigate('ReelImport', { url }) → clear pending
```

Use a `navigationRef` (`createNavigationContainerRef`) so navigation can happen outside any screen.

### 3. Files to add

| File | Responsibility |
|---|---|
| `src/Utils/reelUrl.ts` | `parseInstagramUrl(text): string \| null`. Handles `/reel/`, `/reels/`, `/p/`, query strings, and a URL buried in the shared caption. Unit tested. |
| `src/API/reels.ts` | `resolveReel(url)` → `POST {BACKEND_URL}/api/reels/resolve` with `x-api-key`, a 25s `AbortController` timeout, and error codes mapped to `ReelError`. |
| `src/Manager/ReelManager.ts` | Calls the API, maps `candidates[]` → `MediaItem[]`, and marks which candidates are already in a collection. |
| `src/Store/ShareIntentContext.tsx` | Holds the pending URL, as described above. |
| `src/Screens/ReelImportScreen.tsx` | Loading → candidates list + collection picker → add. Includes the fallbacks from PRD §7.2. |
| `Types`: `RootStackParamList.ReelImport: { url: string }` | |
| `Types`: `CollectionItem.source?` | Provenance (PRD R-11, P1) |

### 4. Test matrix (physical device)

| Case | Expected |
|---|---|
| App killed → share reel from Instagram | Import screen opens after splash |
| App backgrounded on Home → share | Import screen is pushed on top of the stack |
| App backgrounded on MediaDetail → share | Import screen pushed; Back returns to MediaDetail |
| First install, not onboarded → share | Onboarding → then the Import screen opens |
| Share a non-reel link | Toast "That doesn't look like a reel link" |
| Airplane mode → share | "You're offline" + Retry |
| Share the same reel twice | The second time shows "Already in Want to Watch" |

---

## Implemented (branch `feat/reel-import`, 2026-09-29)

It ships as one path on both platforms, which replaces the custom-TurboModule plan above:

```
iOS:     Instagram → Share → NextUPShare.appex ──opens──▶ nextup://import?url=<text>
Android: Instagram → Share → MainActivity rewrites ACTION_SEND ─▶ nextup://import?url=<text>
                                         │
                      React Native Linking (getInitialURL + 'url' events)
                                         ▼
      ShareIntentProvider (holds pendingShare) → AppNavigator navigates once the
      stack is mounted and onboarding is done → ReelImportScreen → POST /api/reels/resolve
```

| Piece | File |
|---|---|
| iOS share extension (no App Group, so it works with a free Apple ID) | `ios/NextUPShare/ShareViewController.swift`, `ios/NextUPShare/Info.plist` |
| URL scheme + forwarding to Linking | `ios/NextUP/Info.plist` (`CFBundleURLTypes`), `ios/NextUP/AppDelegate.swift` |
| Android share → import link | `android/.../MainActivity.kt`, `AndroidManifest.xml` (SEND + `nextup://import`) |
| Link parsing | `src/Utils/reelLinks.ts` |
| Backend client | `src/API/reels.ts`, config in `src/Config/env.ts` |
| Pending share hand-off | `src/Store/ShareIntentContext.tsx`, `src/Navigation/AppNavigator.tsx` |
| Import UI | `src/Screens/ReelImportScreen.tsx` (candidates, "already in" state, list picker, fallbacks) |
| Manual-search fallback | `Search` route takes `initialQuery` |

**How the extension opens the app:** extensions can't call `UIApplication.shared.open`, so the extension walks the responder chain to `UIApplication` and calls `open(_:options:completionHandler:)` at runtime. This is widely used, but Apple doesn't document it. If a future iOS blocks it, the fallback is an App Group (needs a paid account) or a "copy link, then open NextUP" flow.

**Verified:** the iOS app + extension build, sign and install on a device. Android `MainActivity` compiles. JS tests cover link parsing and the API client. **Not yet verified:** the on-device share flow, and live Instagram parsing on the backend.
