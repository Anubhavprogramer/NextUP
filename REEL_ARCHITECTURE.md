# Instagram Reel Feature - Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  HomeScreen / SearchScreen / Custom Components                          │
│       ↓                                                                   │
│  [Share Instagram Reel Button] ─────────────────────┐                  │
│       ↓                                              │                  │
│  ReelShareScreen.tsx                               │                  │
│  ├─ Movie Preview                                  │                  │
│  │  ├─ Poster Image                                │                  │
│  │  ├─ Title & Year                                │                  │
│  │  └─ Vote Average                                │                  │
│  ├─ Collection Selector                            │                  │
│  │  ├─ Will Watch ◎                                │                  │
│  │  ├─ Watching                                    │                  │
│  │  └─ Watched                                     │                  │
│  ├─ Process Button                                 │                  │
│  ├─ Error Display                                  │                  │
│  └─ Loading State                                  │                  │
│                                                    │                  │
└────────────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         REACT HOOK LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  useReels() Hook                                                        │
│  ├─ State Management                                                    │
│  │  ├─ loading: boolean                                                │
│  │  ├─ error: string | null                                            │
│  │  └─ clearError()                                                    │
│  │                                                                      │
│  ├─ addReelMovie(url, collection)                                      │
│  │  ├─ Call ReelManager                                               │
│  │  ├─ Handle result                                                  │
│  │  ├─ Add to collection via DataManager                              │
│  │  └─ Show toast notification                                        │
│  │                                                                      │
│  └─ Return: { loading, error, addReelMovie, clearError }              │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ReelManager (Singleton)                                               │
│  ├─ processReelAndExtractMovie(reelUrl)                                │
│  │  ├─ Step 1: fetchReelDetails(reelUrl)                              │
│  │  ├─ Step 2: extractMovieName()                                     │
│  │  ├─ Step 3: searchAndFetchMovie(movieName)                         │
│  │  │           ├─ searchMulti(movieName) [TMDB]                      │
│  │  │           └─ Convert to MediaItem                               │
│  │  └─ Step 4: Return ReelImportResult                                │
│  │                                                                      │
│  └─ Logging at each step                                               │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        API SERVICE LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  reels.ts API Service                                                  │
│  ├─ fetchReelDetails(reelUrl)                                          │
│  │  ├─ Validate URL                                                   │
│  │  ├─ POST to backend API                                            │
│  │  ├─ Parse response                                                 │
│  │  ├─ Error handling                                                 │
│  │  └─ Return: ReelDetailsResponse | ReelFetchError                   │
│  │                                                                      │
│  ├─ extractMovieName(reelDetails)                                      │
│  │  └─ Return: movieNames[0] | null                                   │
│  │                                                                      │
│  ├─ extractHashtags(reelDetails)                                       │
│  │  └─ Return: string[]                                               │
│  │                                                                      │
│  └─ getReelMetadata(reelDetails)                                       │
│     └─ Return: object (all metadata)                                   │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
          ↓                          ↓
    ┌──────────────────┐     ┌─────────────────────┐
    │   BACKEND API    │     │   TMDB API          │
    │   (Instagram)    │     │   (Movie Database)  │
    │                  │     │                     │
    │ POST /api/reels/ │     │ /search/multi       │
    │   detailsapi     │     │                     │
    │                  │     │ searchMulti(query)  │
    │ Response:        │     │                     │
    │ ├─ movieNames[]  │     │ Response:           │
    │ ├─ author        │     │ ├─ id               │
    │ ├─ title         │     │ ├─ title            │
    │ ├─ likes         │     │ ├─ posterPath       │
    │ └─ ...           │     │ ├─ voteAverage      │
    │                  │     │ └─ ...              │
    └──────────────────┘     └─────────────────────┘
                                   ↓
                          ┌─────────────────────┐
                          │   PERSISTENT        │
                          │   DATA STORAGE      │
                          │                     │
                          │ DataManager         │
                          │ ├─ addItem()        │
                          │ ├─ collections[]    │
                          │ └─ listeners        │
                          │        ↓            │
                          │ AsyncStorage       │
                          │ (Persisted)        │
                          │                     │
                          │ Collections:        │
                          │ ├─ will_watch[]    │
                          │ ├─ watching[]      │
                          │ └─ watched[]       │
                          └─────────────────────┘
```

## 🔄 Data Flow - Complete Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: USER INTERACTION                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ User Action (one of these):                                             │
│  1. Deep link:  nextup://reel/share/https://instagram.com/reel/ABC    │
│  2. Code nav:   navigation.navigate('ReelShare', { reelUrl: '...' })   │
│  3. Share int:  App receives share from Instagram                      │
│  4. Clipboard:  User pastes reel URL                                   │
│                                                                          │
│ Result: ReelShareScreen opens with reelUrl                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: DISPLAY SCREEN                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ReelShareScreen component:                                              │
│  • useReels hook initialized                                            │
│  • Displays "Processing..." placeholder                                 │
│  • Shows collection selector (default: Will Watch)                      │
│  • Shows process button                                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: USER TAPS PROCESS BUTTON                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ReelShareScreen calls:                                                  │
│  const movie = await addReelMovie(reelUrl, collectionStatus)           │
│                                                                          │
│ UI changes:                                                             │
│  • Button shows loading spinner                                         │
│  • Button text changes to "Processing..."                              │
│  • User cannot interact while processing                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: FETCH REEL DETAILS                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ useReels calls: reelManager.processReelAndExtractMovie(reelUrl)        │
│                                                                          │
│ ReelManager calls: fetchReelDetails(reelUrl)                           │
│  • Validates URL format                                                │
│  • Makes POST request to backend API                                    │
│  • Request: { reelUrl: "https://instagram.com/reel/..." }             │
│                                                                          │
│ Backend Response:                                                       │
│  {                                                                       │
│    success: true,                                                       │
│    data: {                                                              │
│      movieNames: ["Avatar", "Avengers"],                              │
│      title: "Amazing Reels",                                            │
│      author: "user123",                                                │
│      likes: 1500,                                                       │
│      ...                                                                │
│    }                                                                     │
│  }                                                                       │
│                                                                          │
│ Error Handling:                                                         │
│  • Invalid URL: return INVALID_URL error                               │
│  • Network error: return NETWORK_ERROR                                 │
│  • API error: return API_ERROR                                         │
│  • API failure: return API_FAILURE                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: EXTRACT MOVIE NAME                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ReelManager calls: extractMovieName(reelData)                          │
│                                                                          │
│ Logic:                                                                  │
│  movieNames = reelData.data.movieNames  // ["Avatar", "Avengers"]     │
│  movieName = movieNames[0]              // "Avatar"                    │
│                                                                          │
│ Result:                                                                 │
│  • Found: Return first movie name                                      │
│  • Not found: Log warning, continue with null                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 6: SEARCH TMDB FOR MOVIE                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ReelManager calls: searchAndFetchMovie("Avatar")                       │
│                                                                          │
│ Which calls: searchMulti("Avatar")  [From existing TMDB service]       │
│                                                                          │
│ TMDB API Request:                                                       │
│  GET /search/multi?query=Avatar&...                                     │
│                                                                          │
│ TMDB Response:                                                          │
│  {                                                                       │
│    results: [                                                           │
│      {                                                                   │
│        id: 19995,                                                       │
│        title: "Avatar",                                                 │
│        release_date: "2009-12-18",                                      │
│        poster_path: "/path/to/poster.jpg",                              │
│        backdrop_path: "/path/to/backdrop.jpg",                          │
│        vote_average: 8.2,                                               │
│        media_type: "movie",                                             │
│        overview: "...",                                                 │
│        ...                                                              │
│      }                                                                   │
│    ]                                                                     │
│  }                                                                       │
│                                                                          │
│ Transform to MediaItem:                                                 │
│  {                                                                       │
│    id: 19995,                                                           │
│    title: "Avatar",                                                     │
│    mediaType: "movie",                                                  │
│    posterPath: "/path/to/poster.jpg",                                   │
│    backdropPath: "/path/to/backdrop.jpg",                               │
│    releaseDate: "2009-12-18",                                           │
│    voteAverage: 8.2,                                                    │
│    overview: "...",                                                     │
│    ...                                                                  │
│  }                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 7: DISPLAY MOVIE PREVIEW                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ReelShareScreen receives MediaItem                                      │
│                                                                          │
│ Updates UI:                                                             │
│  • Movie poster image (from posterPath)                                │
│  • Movie title                                                         │
│  • Release year                                                        │
│  • Vote average (8.2/10)                                               │
│  • Process button now says "Confirm & Add to Collection"               │
│  • User can change collection selection                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 8: USER CONFIRMS & SELECTS COLLECTION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ User selects collection:                                                │
│  • ◎ Will Watch (default, pre-selected)                               │
│  • ○ Watching                                                           │
│  • ○ Watched                                                            │
│                                                                          │
│ User taps "Confirm & Add to Collection"                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 9: ADD TO COLLECTION                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ useReels calls: dataManager.addItem(mediaItem, 'will_watch')           │
│                                                                          │
│ DataManager:                                                            │
│  1. Validate mediaItem                                                 │
│  2. Create CollectionItem:                                             │
│     {                                                                   │
│       id: "uuid-123",                                                  │
│       mediaItem: { ...mediaItem },                                     │
│       status: "will_watch",                                            │
│       addedAt: "2024-01-15T10:30:00Z",                                │
│       updatedAt: "2024-01-15T10:30:00Z"                               │
│     }                                                                   │
│  3. Save to AsyncStorage                                              │
│  4. Emit listener events                                              │
│  5. Update app state                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 10: SUCCESS NOTIFICATION                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Show success toast:                                                     │
│  "Added 'Avatar' to Will Watch" ✓                                      │
│                                                                          │
│ UI updates:                                                             │
│  • Loading spinner goes away                                           │
│  • Button becomes enabled                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 11: AUTO-NAVIGATE                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ReelShareScreen auto-navigates back:                                    │
│  1. After 1.5 second delay                                             │
│  2. Calls navigation.goBack()                                          │
│  3. Returns to previous screen                                         │
│  4. Movie now appears in collection                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
                    ✅ COMPLETE!
```

## 📊 Error Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ERROR SCENARIOS                                                         │
├─────────────────────────────────────────────────────────────────────────┤

1. Invalid URL
   ├─ Input: "hello world" (not instagram URL)
   ├─ Caught at: fetchReelDetails()
   ├─ Error returned: { code: 'INVALID_URL', message: '...' }
   ├─ UI shows: "Invalid Instagram URL"
   └─ User can: Try different URL

2. Network Error
   ├─ Input: Valid reel URL but no internet
   ├─ Caught at: fetch() call
   ├─ Error returned: { code: 'NETWORK_ERROR', message: '...' }
   ├─ UI shows: "Network error occurred"
   └─ User can: Retry, check connection

3. API Failure (Reel not found)
   ├─ Input: Valid URL but not publicly accessible
   ├─ Caught at: response.ok check
   ├─ Error returned: { code: 'API_ERROR', message: '...' }
   ├─ UI shows: "Failed to fetch reel details"
   └─ User can: Try different reel

4. No Movie Names
   ├─ Input: Reel exists but has no movie names
   ├─ Caught at: extractMovieName()
   ├─ Error returned: "No movie names found in reel"
   ├─ UI shows: "No movie found in reel"
   └─ User can: Try different reel

5. Movie Not in TMDB
   ├─ Input: Movie name exists but not in TMDB
   ├─ Caught at: searchMulti() returns empty
   ├─ Error returned: "Movie not found in database"
   ├─ UI shows: "Movie not found in database"
   └─ User can: Try different reel, manual search

6. Storage Error
   ├─ Input: Movie found but storage fails
   ├─ Caught at: dataManager.addItem()
   ├─ Error returned: Storage error
   ├─ UI shows: "Failed to add movie"
   └─ User can: Retry operation

Each error:
  • Logged to debugger system
  • Caught and handled gracefully
  • Displayed in error container
  • User can dismiss and retry
  • No app crash
```

## 🔗 Integration Points

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HOW REEL FEATURE INTEGRATES WITH EXISTING SYSTEMS                       │
├─────────────────────────────────────────────────────────────────────────┤

1. NAVIGATION
   ├─ Uses: React Navigation
   ├─ Screen: ReelShareScreen
   ├─ Type: RootStackParamList
   ├─ Deep linking: linking config
   └─ Integration: AppNavigator.tsx

2. DATA MANAGEMENT
   ├─ Uses: DataManager (existing)
   ├─ Method: dataManager.addItem()
   ├─ Collections: will_watch, watching, watched
   └─ Persistence: AsyncStorage

3. STORAGE
   ├─ Uses: AsyncStorage (existing)
   ├─ Method: StorageManager.set()
   ├─ Key: 'app_state'
   └─ Format: JSON

4. SEARCH
   ├─ Uses: searchMulti() from tmdb.ts
   ├─ Endpoint: /search/multi
   ├─ Results: MediaItem[]
   └─ Transform: transformTMDBItem()

5. NOTIFICATIONS
   ├─ Uses: ToastContext (existing)
   ├─ Methods: showSuccess(), showError()
   ├─ Display: Toast popup
   └─ Auto-dismiss: 3 seconds

6. THEMING
   ├─ Uses: ThemeContext (existing)
   ├─ Colors: theme.colors.*
   ├─ Modes: light/dark
   └─ Component: useTheme()

7. LOGGING
   ├─ Uses: debugger.ts (existing)
   ├─ Methods: logger.debug(), info(), warn(), error()
   ├─ Categories: ReelsAPI, ReelManager, useReels
   └─ Output: Console + storage

8. DEEP LINKING
   ├─ Uses: NavigationContainer linking prop
   ├─ Prefixes: nextup://, https://nextupapp.com
   ├─ Routes: reel/share/:reelUrl
   └─ Handler: linking config
```

## 🎯 Component Interaction Diagram

```
                        ┌──────────────────┐
                        │   HomeScreen     │
                        │  SearchScreen    │
                        │  Other Screens   │
                        └────────┬─────────┘
                                 │ navigation.navigate()
                                 ↓
                        ┌──────────────────────────┐
                        │  ReelShareScreen.tsx    │
                        │  ┌────────────────────┐ │
                        │  │  useReels() hook   │ │
                        │  │  ├─ loading       │ │
                        │  │  ├─ error         │ │
                        │  │  └─ addReelMovie()│ │
                        │  └─────┬──────────────┘ │
                        └────────┼────────────────┘
                                 │ calls
                                 ↓
                        ┌──────────────────────────┐
                        │  ReelManager.ts          │
                        │  (Singleton)            │
                        │  ├─ processReel...()   │
                        │  └─ searchAndFetch...()│
                        └─────┬──────────────┬───┘
                              │              │
                    ┌─────────┘              └──────────┐
                    │                                   │
                    ↓                                   ↓
        ┌──────────────────────┐         ┌──────────────────────┐
        │  reels.ts API        │         │  tmdb.ts API         │
        │  fetchReelDetails()  │         │  searchMulti()       │
        └──────────┬───────────┘         └──────────┬───────────┘
                   │                               │
          ┌────────┘                               └──────────┐
          │                                                   │
          ↓                                                   ↓
┌──────────────────────────────┐           ┌─────────────────────────┐
│ BACKEND API (Instagram)      │           │ TMDB API                │
│ nextupbakend-production...   │           │ api.themoviedb.org      │
│                              │           │                         │
│ POST /api/reels/detailsapi   │           │ GET /search/multi       │
│ ├─ Input: { reelUrl }        │           │ ├─ Input: { query }     │
│ └─ Output:                   │           │ └─ Output:              │
│    ├─ movieNames[]           │           │    ├─ results[]         │
│    ├─ author                 │           │    ├─ page              │
│    ├─ likes                  │           │    └─ total_results     │
│    └─ ...                    │           │                         │
└──────────────────────────────┘           └─────────────────────────┘

        Both send data back to ReelManager
        
                        ↓ ↓
        
                ┌──────────────────┐
                │  DataManager     │
                │  (Singleton)     │
                │  .addItem()      │
                └────────┬─────────┘
                         │ stores to
                         ↓
                ┌──────────────────┐
                │  AsyncStorage    │
                │  (Persistence)   │
                └────────┬─────────┘
                         │ triggers
                         ↓
                ┌──────────────────┐
                │  AppContext      │
                │  (State update)  │
                └────────┬─────────┘
                         │ propagates
                         ↓
        ┌─────────────────┴──────────────────┐
        │                                    │
        ↓                                    ↓
┌──────────────┐                   ┌──────────────────┐
│  ToastContext│                   │ HomeScreen rerf  │
│ .showSuccess()                   │ (Collection      │
└──────────────┘                   │  updated)        │
     ↓                             └──────────────────┘
┌──────────────────┐
│ Toast Popup      │
│ "Added Avatar    │
│  to Will Watch"  │
└──────────────────┘
```

---

This architecture ensures:
- ✅ Separation of concerns
- ✅ Single responsibility per layer
- ✅ Easy testing of individual components
- ✅ Clear data flow
- ✅ Error handling at each step
- ✅ Logging throughout
- ✅ Proper integration with existing systems
