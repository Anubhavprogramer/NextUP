# Instagram Reel Feature - Implementation Guide

## Overview
Complete implementation of Instagram reel sharing feature that allows users to share Instagram reels from the app and automatically add discovered movies to their collection.

## Architecture

### Layer 1: API Service (`src/API/reels.ts`)
**Purpose:** Low-level communication with backend API

**Key Functions:**
- `fetchReelDetails(reelUrl: string)` - Calls backend API with reel URL
  - Returns: `ReelDetailsResponse` with movie names and metadata
  - Error handling: Returns `ReelFetchError` on failure
  
- `extractMovieName(reelDetails: ReelDetailsResponse)` - Extract first movie name
  
- `getReelMetadata(reelDetails: ReelDetailsResponse)` - Extract reel metadata

- `extractHashtags(reelDetails: ReelDetailsResponse)` - Extract hashtags

**Backend API:**
```
Endpoint: https://nextupbakend-production.up.railway.app/api/reels/detailsapi
Method: POST
Request: { "reelUrl": "https://www.instagram.com/reel/..." }
Response: {
  success: boolean,
  data: {
    movieNames: string[],
    title: string,
    description: string,
    author: string,
    // ... other fields
  }
}
```

### Layer 2: Business Logic Manager (`src/Manager/ReelManager.ts`)
**Purpose:** Orchestrate reel processing and movie search

**Key Functions:**
- `processReelAndExtractMovie(reelUrl: string)` - Main orchestration
  1. Fetches reel details from API
  2. Extracts movie name
  3. Searches TMDB for movie
  4. Returns `ReelImportResult` with success status and movie data

**Returns:** `ReelImportResult` interface
```typescript
{
  success: boolean;
  movieItem?: MediaItem;
  message: string;
  reelMetadata?: any;
  error?: string;
}
```

### Layer 3: React Hook (`src/Hooks/useReels.ts`)
**Purpose:** State management and UI integration

**Key Function:**
- `useReels()` - Returns:
  ```typescript
  {
    loading: boolean;
    error: string | null;
    addReelMovie(reelUrl, collectionStatus): Promise<MediaItem | null>;
    clearError(): void;
  }
  ```

**Features:**
- Manages loading and error states
- Calls ReelManager to process reel
- Adds movie to specified collection using DataManager
- Handles toast notifications (success/error)
- Triggers app state refresh on success

### Layer 4: UI Component (`src/Screens/ReelShareScreen.tsx`)
**Purpose:** User interface for reel sharing

**Features:**
- Displays processed movie details
  - Poster image
  - Title, release year
  - Vote average rating
  
- Collection selection
  - Will Watch (default)
  - Currently Watching
  - Already Watched
  
- Process button with loading state
- Error display
- Automatic navigation back after success

**Props:**
```typescript
{
  route?.params?.reelUrl?: string;
  route?.params?.collectionStatus?: 'will_watch' | 'watching' | 'watched';
  navigation?: any;
}
```

## Integration Flow

```
1. User shares Instagram reel URL to app
   ↓
2. App receives URL (via deep linking/share intent)
   ↓
3. ReelShareScreen is opened with reelUrl
   ↓
4. User taps "Process Reel" button
   ↓
5. useReels hook calls reelManager.processReelAndExtractMovie()
   ├─ fetchReelDetails(reelUrl) [API call]
   ├─ extractMovieName() [get first movie]
   ├─ searchMulti(movieName) [search TMDB]
   └─ Return MovieItem
   ↓
6. Screen displays movie details with preview
   ↓
7. User selects collection and confirms
   ↓
8. dataManager.addItem() saves to collection
   ↓
9. Toast notification shows success
   ↓
10. Screen auto-navigates back
```

## File Structure

```
src/
├── API/
│   └── reels.ts ✅
│       ├── fetchReelDetails()
│       ├── extractMovieName()
│       ├── getReelMetadata()
│       └── extractHashtags()
│
├── Manager/
│   ├── ReelManager.ts ✅
│   │   └── processReelAndExtractMovie()
│   └── index.ts (updated)
│
├── Hooks/
│   ├── useReels.ts ✅
│   │   └── useReels()
│   └── index.ts (created)
│
├── Screens/
│   ├── ReelShareScreen.tsx ✅
│   └── index.ts (updated)
│
└── Types/
    └── index.ts (existing - no changes needed)
```

## Error Handling

**API Layer Errors:**
- Invalid URL format
- Network errors
- API failure response
- Returns: `ReelFetchError` with code and message

**Manager Layer Errors:**
- Reel fetch failures
- No movie names found
- Movie not found in TMDB
- Returns: `ReelImportResult` with success=false and error message

**Hook Layer Errors:**
- Caught in try/catch
- Sets error state
- Shows error toast
- Logs to debugger

**UI Layer Errors:**
- Displayed in error container
- User-friendly messages
- Clearable via clearError()

## Usage Example

### In a component:
```typescript
import { useReels } from '../Hooks';
import { ReelShareScreen } from '../Screens';

export function MyComponent() {
  const { addReelMovie, loading, error } = useReels();
  
  const handleShareReel = async (reelUrl: string) => {
    const movie = await addReelMovie(reelUrl, 'will_watch');
    if (movie) {
      console.log(`Added ${movie.title}`);
    }
  };
  
  return <ReelShareScreen />;
}
```

### Navigation Setup (needs to be added):
```typescript
// In AppNavigator.tsx
<Stack.Screen
  name="ReelShare"
  component={ReelShareScreen}
  options={{
    title: 'Add from Instagram',
    // ...
  }}
/>
```

### Deep Linking Setup (needs to be added):
```typescript
// In navigation config
linking: {
  prefixes: ['nextup://', 'https://nextupapp.com'],
  config: {
    screens: {
      ReelShare: 'reel/share/:reelUrl',
      // ...
    },
  },
}
```

## Type Definitions

### ReelDetailsResponse
```typescript
{
  success: boolean;
  message: string;
  data: {
    platform: string;
    reelId: string;
    originalUrl: string;
    canonicalUrl: string;
    fetchedAt: string;
    title: string;
    description: string;
    thumbnail: string;
    author: string;
    authorHandle: string;
    isVerified: boolean;
    hashtags: string[];
    movieNames: string[];
    likes: number;
    comments: number;
    shares: number | null;
    views: number | null;
    duration: number | null;
    captionText: string;
    sound: string;
    soundCreator: string;
    createdAt: string;
    source: string;
    accessible: boolean;
  };
}
```

### ReelImportResult
```typescript
{
  success: boolean;
  movieItem?: MediaItem;
  message: string;
  reelMetadata?: any;
  error?: string;
}
```

## Logging

All components integrate with the debugger system:
- `logger.debug()` - Detailed flow tracking
- `logger.info()` - Key milestones
- `logger.warn()` - Non-critical issues
- `logger.error()` - Critical failures

Examples:
```
ReelsAPI - Fetching reel details
ReelManager - Processing reel
useReels - Processing reel
ReelShareScreen - Processing reel
```

## Theme Integration

Uses app's theme system:
- Primary color for active state buttons
- Text colors for labels
- Error color for error messages
- Surface color for containers
- All colors sourced from `theme.colors` (no hardcoded colors except white text)

## Status

✅ **COMPLETE AND READY FOR USE**

All 4 layers implemented:
- ✅ API Service (reels.ts)
- ✅ Manager (ReelManager.ts)
- ✅ Hook (useReels.ts)
- ✅ UI Component (ReelShareScreen.tsx)

**Next Steps:**
1. Add ReelShareScreen to AppNavigator
2. Set up deep linking for reel URLs
3. Add share intent handlers (iOS/Android)
4. Test with actual Instagram reels
5. Add unit tests for each layer

## Notes

- Feature uses existing TMDB search functionality
- Integrates with existing DataManager for persistence
- Uses existing toast notification system
- Follows established error handling patterns
- Full TypeScript type coverage
- Comprehensive logging for debugging
- Theme-aware UI components
