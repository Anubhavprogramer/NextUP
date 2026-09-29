# NextUP App — Architecture

React Native 0.83 · React 19 · TypeScript · New Architecture (`newArchEnabled=true`) · Hermes · React Navigation 7 (native-stack) · AsyncStorage.

## Folder map

```
App.tsx                           Provider tree + status bar (always dark text)
src/
├── Navigation/AppNavigator.tsx   Gates (loading → error → onboarding) + native stack; opens pending shares
├── Screens/
│   ├── ProfileSetupScreen        First launch: asks for a name
│   ├── HomeScreen                Greeting, 3 StatCards, 3 CollectionSections (long-press → action sheet)
│   ├── SearchScreen              Debounced TMDB multi-search, recent searches, optional initialQuery
│   ├── MediaDetailScreen         Poster, metadata, add / move / remove
│   ├── CollectionScreen          "See all" for one list (long-press → action sheet)
│   ├── ReelImportScreen          Shared reel → candidates → pick title + list → add
│   ├── SettingsScreen            Edit name · export/import backup · version, privacy link, TMDB attribution
│   └── LoadingScreen, ErrorScreen
├── Store/                        React Context
│   ├── AppContext.tsx            appState + collection actions (wraps DataManager)
│   ├── ThemeContext.tsx          the single light theme (useTheme / useThemeColor)
│   ├── ToastContext.tsx          showSuccess / showError / showInfo
│   ├── DialogContext.tsx         showActionSheet (themed bottom sheet)
│   ├── ShareIntentContext.tsx    receives nextup://import links, holds pendingShare
│   └── hooks.ts                  useDebounce
├── Manager/                      Business logic singletons (no React)
│   ├── DataManager.ts            Profile, collections, search history, mergeCollectionItems, change events
│   ├── BackupManager.ts          createExport / importBackup (validate + merge, never overwrite)
│   └── StorageManager.ts         AsyncStorage wrapper: retry, corruption cleanup, migrations
├── API/
│   ├── tmdb.ts                   TMDB search/discover/details → MediaItem
│   └── reels.ts                  POST /api/reels/resolve → ResolvedReel | ReelError(code)
├── Config/env.ts                 Backend base URL, API key, timeout
├── Components/
│   ├── Themed/                   ThemedView/Text/Button/Input/Card
│   └── Regular/                  MediaCard, MediaList, CollectionSection, StatCard, StatusButton, Toast, ActionSheet, …
├── Types/index.ts                Domain types, type guards, STORAGE_KEYS, VALIDATION_CONSTANTS, RootStackParamList
└── Utils/
    ├── constants.ts              DESIGN_CONSTANTS, LIGHT_THEME, TMDB_CONFIG, APP_CONFIG
    ├── helpers.ts                ids, formatting, image URLs, sorting, stats
    ├── reelLinks.ts              findInstagramReelUrl, parseImportLink
    ├── collectionActions.ts      shared "Want to Watch / Watching / Watched" sheet actions
    ├── backupFiles.ts            saveBackupFile / pickBackupFile (system save + file picker)
    ├── debugger.ts               `logger`
    └── Imges.ts                  static image requires
ios/NextUPShare/                  iOS share extension (Swift), see REEL_SHARE_INTEGRATION.md
```

Provider order in `App.tsx`: `SafeAreaProvider → ThemeProvider → AppProvider → ToastProvider → DialogProvider → ShareIntentProvider → AppNavigator`.

## Layering

```
Screen ──▶ useApp() / useTheme() / useToast() / useDialog()
              │
              ▼
        AppContext ──▶ DataManager ──▶ StorageManager ──▶ AsyncStorage
              ▲            │
              └─ events ───┘  (PROFILE_UPDATED, COLLECTION_CLEARED)

Screen ──▶ API/tmdb.ts  ──▶ TMDB
ReelImportScreen ──▶ API/reels.ts ──▶ NextUP backend
```

Rule of thumb: **network calls in `API/`, persistence and orchestration in `Manager/`, React state in `Store/`, screens only compose.**

## Domain model

```ts
MediaItem       { id: number /*TMDB*/, title, overview, posterPath, backdropPath,
                  releaseDate, voteAverage, genreIds[], mediaType: 'movie'|'tv', originalLanguage }
CollectionItem  { id: uuid, mediaItem, status, addedAt, updatedAt,
                  userRating?, notes?, watchedDate?, progress? }
CollectionStatus = 'watched' | 'watching' | 'will_watch'
```

App metadata lives in `APP_CONFIG` (`Utils/constants.ts`): `APP_VERSION` (keep in sync with the native versions), `PRIVACY_POLICY_URL` (the Settings row is hidden while it's `null`), `TMDB_URL`.

Storage keys: `user_profile`, `collections` (one blob `{watched[], watching[], will_watch[]}`), `is_first_launch`, `search_history`. A `mediaItem.id` appears at most once across the three lists; `DataManager.addItem` throws `DUPLICATE_ITEM` otherwise.

## Navigation

`AppNavigator` renders one of four things:
1. `LoadingScreen` while `loading`
2. `ErrorScreen` when `error`
3. `ProfileSetupScreen` when `isFirstLaunch || !userProfile`
4. `NavigationContainer` (with `navigationRef`) and the stack `Main | Search | Collection | ReelImport | MediaDetail`

Route params: `Search: { initialQuery? }`, `Collection: { status }`, `ReelImport: { sharedText }`, `MediaDetail: { mediaItem }`, `Settings` (none). Settings opens from the gear icon in the Home header. `Statistics` is declared but not registered yet (AUDIT A-4).

## Backup (Settings → Your data)

```
Export: createExport() → ExportData JSON → temp file (react-native-fs) → system "Save to…" dialog (saveDocuments)
Import: file picker (pick) → local copy (keepLocalCopy) → readFile → importBackup(json)
          → validate (format version, isCollectionItem per entry)
          → dataManager.mergeCollectionItems → DATA_IMPORTED event → AppContext refresh
```

- **Format:** `{ version: "1", exportDate, userProfile, collections: { watched, watching, will_watch }, metadata: { totalItems, appVersion } }` (`ExportData`). File name: `nextup-backup-YYYY-MM-DD.json`.
- **Import never removes or changes existing titles.** Items whose TMDB id is already saved are skipped, damaged entries are counted and ignored, and the current profile is kept. Bump `BACKUP_FORMAT_VERSION` if the shape changes, and keep reading old versions.
- Native packages: `@react-native-documents/picker` (save dialog + picker) and `@dr.pogodin/react-native-fs` (temp file read/write). Both are mocked in `src/Utils/testSetup.ts`.
- Tests: `src/Manager/__tests__/BackupManager.test.ts` (round trip, duplicates, damaged/invalid files) and `src/Utils/__tests__/backupFiles.test.ts`.

> **Invariant:** `loading` is only for the *initial* load. `refreshAppState()` reloads silently. If it ever flips `loading`, the `NavigationContainer` unmounts and the user loses their place. `src/Store/__tests__/AppContext.test.tsx` guards this. Collection changes must go through `useApp()`: `AppProvider` doesn't refresh on `ITEM_*` events, so calling `dataManager` directly from a screen won't update the UI.

**Pending shares:** when `ShareIntentProvider` has a `pendingShare`, `AppNavigator` waits until the main stack is mounted (`onReady`) and onboarding is done, then calls `navigationRef.navigate('ReelImport', …)`.

## Popups

Use `useDialog().showActionSheet({ media?, title?, message?, actions, cancelLabel? })` instead of `Alert.alert`. Each action is `{ label, icon?, iconColor?, destructive?, onPress }`.

- The sheet slides up over a dimmed backdrop; tapping the backdrop, Cancel or Android back closes it.
- `onPress` runs **after** the close animation, so navigation and toasts don't clash with the modal.
- `collectionStatusActions(theme, onSelect, { exclude?, prefix? })` builds the standard three list actions with the same icons and colours as the Home stats.
- Tests: `src/Store/__tests__/DialogContext.test.tsx`.

## Theme

NextUP has **one theme**: `LIGHT_THEME` (warm peach). There is no dark mode. `ThemeContext` always provides the light palette. Light mode is also pinned natively so system UI (keyboard, sheets, the share extension) can't go dark:
- iOS: `UIUserInterfaceStyle = Light` in `ios/NextUP/Info.plist` and `ios/NextUPShare/Info.plist`
- Android: `AppTheme` extends `Theme.AppCompat.Light.NoActionBar` with `forceDarkAllowed=false`

Always read colours via `useTheme().theme.colors.*` and sizes via `DESIGN_CONSTANTS.*`; don't hardcode values.

## Error handling

- `StorageError(code)`, `APIError(code, status)` in `Types`; `ReelError(code, keywords)` in `API/reels.ts`.
- `StorageManager` retries 3× with backoff and deletes keys holding corrupt JSON.
- `DataManager` rethrows `StorageError` unchanged, so `DUPLICATE_ITEM` / `ITEM_NOT_FOUND` reach the UI.
- Screens catch errors and show a toast. The Import screen maps `ReelError.code` to a message plus Retry / Search manually.
