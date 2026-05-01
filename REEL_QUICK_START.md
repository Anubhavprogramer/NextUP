# Instagram Reel Sharing Feature - Quick Start Guide

## ✅ What's Been Implemented

Your app now has a complete Instagram reel sharing feature with:

- ✅ **API Service** (`src/API/reels.ts`) - Connects to backend API
- ✅ **Business Logic Manager** (`src/Manager/ReelManager.ts`) - Orchestrates movie search
- ✅ **React Hook** (`src/Hooks/useReels.ts`) - Manages state and integration
- ✅ **UI Component** (`src/Screens/ReelShareScreen.tsx`) - Beautiful share interface
- ✅ **Navigation Integration** - Added to AppNavigator and types
- ✅ **Deep Linking** - Full configuration for URL handling
- ✅ **Utilities** - URL validation and helpers

**TypeScript Errors: 0** ✅

---

## 🚀 Quick Start (3 Steps)

### Step 1: Test in Your App

Open your app and test the deep link in terminal:

```bash
# For iOS
xcrun simctl openurl booted "nextup://reel/share/https://www.instagram.com/reel/ABC123/"

# For Android
adb shell am start -W -a android.intent.action.VIEW -d "nextup://reel/share/https://www.instagram.com/reel/ABC123/" com.nextup
```

### Step 2: Test from Code

Add a button to your HomeScreen or any screen:

```tsx
import { useNavigation } from '@react-navigation/native';

export function TestReelButton() {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity
      onPress={() => {
        const reelUrl = 'https://www.instagram.com/reel/ABC123DEF456/';
        navigation.navigate('ReelShare', {
          reelUrl,
          collectionStatus: 'will_watch',
        });
      }}
    >
      <Text>Test Reel Share</Text>
    </TouchableOpacity>
  );
}
```

### Step 3: Test with Real Instagram Reel

1. Find an Instagram reel you want to test
2. Copy the reel URL
3. Navigate to ReelShareScreen with that URL
4. App will fetch movie details and show them
5. Select collection and confirm

---

## 📋 Feature Flow

```
User Action
    ↓
Share Instagram Reel URL
    ↓
App receives URL (deep link, share intent, or code)
    ↓
ReelShareScreen opens with URL
    ↓
User taps "Process Reel"
    ↓
useReels hook processes:
  1. Fetch reel details from backend API
  2. Extract movie name
  3. Search TMDB for movie
  4. Display movie preview
    ↓
User confirms and selects collection
    ↓
Movie added to DataManager (persisted)
    ↓
Toast notification shows success
    ↓
Auto-navigate back to previous screen
```

---

## 🔧 Navigation Integration

### Navigate from Code

```tsx
// Option 1: Using navigation prop directly
navigation.navigate('ReelShare', {
  reelUrl: 'https://www.instagram.com/reel/ABC123/',
  collectionStatus: 'will_watch'
});

// Option 2: Using helper function
import { navigateToReelShare } from '../Utils/deepLinking';

navigateToReelShare(navigation, reelUrl, 'will_watch');
```

### Deep Link URLs

```
nextup://reel/share/https://www.instagram.com/reel/ABC123/
https://nextupapp.com/reel/share/https://www.instagram.com/reel/ABC123/
```

---

## 🎯 Usage Examples

### Example 1: Simple Button

```tsx
<TouchableOpacity
  onPress={() => {
    navigation.navigate('ReelShare', {
      reelUrl: 'https://www.instagram.com/reel/ABC123/',
      collectionStatus: 'will_watch',
    });
  }}
>
  <Text>Share Reel</Text>
</TouchableOpacity>
```

### Example 2: Using the Hook

```tsx
import { useReels } from '../Hooks/useReels';

function MyComponent() {
  const { addReelMovie, loading, error } = useReels();
  
  const handleShare = async () => {
    const movie = await addReelMovie('https://www.instagram.com/reel/ABC123/', 'will_watch');
    if (movie) {
      console.log(`Added ${movie.title}`);
    }
  };
  
  return <Button title="Add Movie" onPress={handleShare} />;
}
```

### Example 3: URL Validation

```tsx
import { isValidInstagramReelUrl } from '../Utils/helpers';

if (isValidInstagramReelUrl(url)) {
  navigation.navigate('ReelShare', { reelUrl: url });
} else {
  Alert.alert('Invalid URL', 'Please provide a valid Instagram reel');
}
```

---

## 📁 File Structure

```
src/
├── API/
│   └── reels.ts ✅
│       └── fetchReelDetails(), extractMovieName(), etc.
│
├── Manager/
│   ├── ReelManager.ts ✅
│   │   └── processReelAndExtractMovie()
│   └── index.ts (updated)
│
├── Hooks/
│   ├── useReels.ts ✅
│   │   └── useReels() hook
│   └── index.ts (created)
│
├── Screens/
│   ├── ReelShareScreen.tsx ✅
│   │   └── Main UI component
│   └── index.ts (updated)
│
├── Navigation/
│   └── AppNavigator.tsx ✅
│       └── Integrated ReelShare screen
│
├── Utils/
│   ├── deepLinking.ts ✅
│   │   └── Deep linking configuration
│   ├── helpers.ts (updated)
│   │   └── URL validation helpers
│   └── debugger.ts (existing)
│       └── Logging system
│
├── Components/
│   └── Regular/
│       └── ShareReelExample.tsx ✅
│           └── Example component
│
└── Types/
    └── index.ts (updated)
        └── RootStackParamList
```

---

## 🧪 Testing Checklist

### Before Production

- [ ] Test deep linking: `nextup://reel/share/...`
- [ ] Test from code navigation
- [ ] Test with actual Instagram reel URL
- [ ] Verify movie appears in "Will Watch" collection
- [ ] Test error handling (invalid URL, network error, movie not found)
- [ ] Test all 3 collection options (Will Watch, Watching, Watched)
- [ ] Test back navigation
- [ ] Verify toast notifications appear
- [ ] Check logging output

### Integration Testing

- [ ] Add button to HomeScreen for easy testing
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator
- [ ] Verify share intent works (if applicable)
- [ ] Test from notification deep link

---

## 🐛 Debugging

### Check Logs

```tsx
// In your component
import { logger } from '../Utils/debugger';

logger.debug('MyComponent', 'Processing reel', { reelUrl });
logger.info('MyComponent', 'Success', { movieTitle });
logger.error('MyComponent', 'Error occurred', { error });
```

### Common Issues

**Issue: ReelShareScreen doesn't appear**
- Check that import exists in AppNavigator.tsx
- Verify Stack.Screen is added
- Check console for TypeScript errors: `npm run type-check`

**Issue: Movie not found**
- Check that Instagram reel has movie names in caption
- Verify TMDB has the movie
- Check console logs for "movieNames" in reel details

**Issue: Deep link not working**
- Verify linking config in deepLinking.ts
- Test with exact URL format: `nextup://reel/share/[URL]`
- Rebuild app after changes

**Issue: Reel details API fails**
- Check backend is running: https://nextupbakend-production.up.railway.app/api/reels/detailsapi
- Verify reel URL is valid Instagram reel
- Check network connectivity

---

## 🌐 Environment Setup

### Required URLs

Backend API:
```
https://nextupbakend-production.up.railway.app/api/reels/detailsapi
```

Deep Linking Prefixes:
```
nextup://
https://nextupapp.com
```

---

## 📦 Dependencies Used

- `react-navigation` - Navigation
- `axios` or `fetch` - HTTP requests
- `react-native` - Core framework

No additional packages needed! ✅

---

## ✨ Next Steps

### Optional Enhancements

1. **Share Intent Handler**
   - Handle `android.intent.action.SEND` intents
   - Intercept Instagram shares

2. **Push Notifications**
   - When reel is shared to app, show notification
   - Tap notification to open ReelShareScreen

3. **History**
   - Track shared reels
   - Show recent reels

4. **Social Sharing**
   - Let users share added movies back to Instagram

5. **Unit Tests**
   - Test reelManager functions
   - Test useReels hook
   - Test ReelShareScreen component

---

## 📚 Documentation Files

- `INSTAGRAM_REEL_FEATURE.md` - Complete implementation guide
- `REEL_NAVIGATION_SETUP.ts` - Navigation integration guide (code comments)
- `REEL_EXAMPLES.tsx` - Example code snippets

---

## ✅ Status

**All Components: 0 TypeScript Errors**

```
✅ ReelManager.ts
✅ useReels.ts
✅ ReelShareScreen.tsx
✅ AppNavigator.tsx
✅ deepLinking.ts
✅ helpers.ts
✅ Types/index.ts
```

**Ready to use!** 🎉

---

## 🆘 Support

If you encounter issues:

1. Check console logs via logger
2. Verify all imports are correct
3. Run `npm run type-check` to catch TypeScript errors
4. Check network connectivity to backend API
5. Verify Instagram reel URL format is valid

---

**Happy reel sharing! 🎬**
