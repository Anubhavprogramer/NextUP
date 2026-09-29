# NextUP App — Architecture

React Native 0.83 · React 19 · TypeScript · New Architecture (`newArchEnabled=true`) · Hermes · React Navigation 7 (native-stack) · AsyncStorage.

## Folder map

```
App.tsx                     Provider tree + status bar
src/
├── Navigation/AppNavigator.tsx   Gate (loading → error → onboarding) + native stack
├── Screens/                      One file per screen
│   ├── ProfileSetupScreen        First launch: asks for a name
│   ├── HomeScreen                Greeting, 3 StatCards, 3 CollectionSections
│   ├── SearchScreen              Debounced TMDB multi-search + recent searches
│   ├── MediaDetailScreen         Poster, metadata, add / move / remove
│   ├── CollectionScreen          "See all" for one status
│   ├── LoadingScreen, ErrorScreen
├── Store/                        React Context state
│   ├── AppContext.tsx            appState + collection actions (wraps DataManager)
│   ├── ThemeContext.tsx          light / dark / system, saved to storage
│   ├── ToastContext.tsx          showSuccess / showError / showInfo
│   └── hooks.ts                  useDebounce
├── Manager/                      Business logic singletons (no React)
│   ├── DataManager.ts            Profile, collections, search history, change events
│   └── StorageManager.ts         AsyncStorage wrapper: retry, corruption cleanup, backup/restore, migrations
├── API/tmdb.ts                   fetch wrapper + search/discover/details, maps TMDB → MediaItem
├── Components/
│   ├── Themed/                   ThemedView/Text/Button/Input/Card (read from ThemeContext)
│   └── Regular/                  MediaCard, MediaList, CollectionSection, StatCard, StatusButton, Toast, …
├── Types/index.ts                All domain types, type guards, STORAGE_KEYS, VALIDATION_CONSTANTS
└── Utils/
    ├── constants.ts              DESIGN_CONSTANTS, LIGHT_THEME, DARK_THEME, TMDB_CONFIG, APP_CONFIG
    ├── helpers.ts                id gen, formatting, image URLs, sorting, stats
    ├── debugger.ts               `logger` (in-memory log buffer, exportLogs)
    └── Imges.ts                  static image requires
```

## Layering

```
Screen ──uses──▶ useApp() / useTheme() / useToast()
                     │
                     ▼
               AppContext ──calls──▶ DataManager ──▶ StorageManager ──▶ AsyncStorage
                     ▲                    │
                     └──── change events ─┘   (ITEM_ADDED, ITEM_UPDATED, …)

Screen ──calls directly──▶ API/tmdb.ts ──▶ TMDB
```

Rule of thumb for new code: **network calls go in `API/`, orchestration and persistence go in `Manager/`, React state goes in `Store/`, and screens only compose.** The reel feature should follow the same pattern: `API/reels.ts` → `Manager/ReelManager.ts` → a screen.

## Domain model

```ts
MediaItem       { id: number /*TMDB*/, title, overview, posterPath, backdropPath,
                  releaseDate, voteAverage, genreIds[], mediaType: 'movie'|'tv', originalLanguage }
CollectionItem  { id: uuid, mediaItem, status, addedAt, updatedAt,
                  userRating?, notes?, watchedDate?, progress? }
CollectionStatus = 'watched' | 'watching' | 'will_watch'
```

Storage keys (`STORAGE_KEYS`): `user_profile`, `collections` (a single blob `{watched[], watching[], will_watch[]}`), `theme_preference`, `is_first_launch`, `search_history`.

A `mediaItem.id` appears at most once across all three lists. `DataManager.addItem` enforces this and throws `DUPLICATE_ITEM`.

## Navigation

`AppNavigator` renders one of four things:
1. `LoadingScreen` while `loading`
2. `ErrorScreen` when `error`
3. `ProfileSetupScreen` when `isFirstLaunch || !userProfile`
4. `NavigationContainer` with the stack `Main | Search | Collection | MediaDetail`

> **Important invariant:** `loading` is only for the *initial* load. `refreshAppState()` reloads silently. If it flips `loading`, `AppNavigator` unmounts the `NavigationContainer` and the user loses their place (this was AUDIT A-1, now fixed and covered by `src/Store/__tests__/AppContext.test.tsx`). Collection mutations must go through `useApp()`. `AppProvider` no longer refreshes on `ITEM_*` events, so calling `dataManager` directly from a screen won't update the UI.

`RootStackParamList` also declares `Statistics` and `Settings`, but no screens are registered for them yet.

## Theming

`ThemeContext` picks `LIGHT_THEME` or `DARK_THEME` (warm peach/coffee palette) based on the saved preference or the system scheme. Components read `theme.colors.*` and `DESIGN_CONSTANTS.*`, and don't hardcode values. `toggleTheme` and `setThemePreference` exist, but no UI calls them yet. That's planned for the Settings screen.

## Error handling

- `StorageError(code)` and `APIError(code, status)` live in `Types`.
- `StorageManager` retries up to 3 times with linear backoff. If JSON is corrupt, it deletes the key.
- `DataManager` rethrows `StorageError`s unchanged, so codes like `DUPLICATE_ITEM` and `ITEM_NOT_FOUND` reach the UI. Anything else is wrapped with an operation-level code.
- Screens catch errors and show a toast.
