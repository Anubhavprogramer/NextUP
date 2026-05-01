/**
 * Navigation Integration Guide for Instagram Reel Feature
 * 
 * This file shows how to integrate the ReelShareScreen into your app navigation
 */

// ============================================================================
// STEP 1: Update RootStackParamList in src/Types/index.ts
// ============================================================================

// Add to RootStackParamList:
/*
export type RootStackParamList = {
  Main: undefined;
  Search: undefined;
  Collection: { status: CollectionStatus };
  MediaDetail: { mediaItem: MediaItem };
  Statistics: undefined;
  Settings: undefined;
  
  // ADD THIS:
  ReelShare: {
    reelUrl: string;
    collectionStatus?: 'will_watch' | 'watching' | 'watched';
  };
};
*/

// ============================================================================
// STEP 2: Update AppNavigator.tsx to include ReelShareScreen
// ============================================================================

/*
import { ReelShareScreen } from '../Screens';

export function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        // ... existing screens ...
        
        {/* Reel Share Screen *\/}
        <Stack.Screen
          name="ReelShare"
          component={ReelShareScreen}
          options={{
            title: 'Add from Instagram',
            headerShown: true,
            animationEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
*/

// ============================================================================
// STEP 3: Add Deep Linking Configuration
// ============================================================================

/*
const linking = {
  prefixes: ['nextup://', 'https://nextupapp.com'],
  config: {
    screens: {
      Home: '/',
      Search: '/search',
      Collection: '/collection/:status',
      MediaDetail: '/media/:id',
      Statistics: '/stats',
      Settings: '/settings',
      
      // ADD THIS:
      ReelShare: 'reel/share/:reelUrl',
    },
  },
};
*/

// ============================================================================
// STEP 4: Handle Share Intent (Android/iOS)
// ============================================================================

/*
// In your app initialization or root component:

import { Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function HandleDeepLink() {
  const navigation = useNavigation();
  
  // Listen for share intent
  useEffect(() => {
    const unsubscribe = navigation.addListener('navigate', (e) => {
      const { screen, params } = e.data;
      
      if (screen === 'ReelShare' && params?.reelUrl) {
        // Reel URL received from share
        navigation.navigate('ReelShare', {
          reelUrl: params.reelUrl,
          collectionStatus: 'will_watch',
        });
      }
    });
    
    return unsubscribe;
  }, [navigation]);
}
*/

// ============================================================================
// STEP 5: Usage Examples
// ============================================================================

/*
// Example 1: Navigate to ReelShareScreen from code
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();
  
  const handleShareReel = (reelUrl: string) => {
    navigation.navigate('ReelShare', {
      reelUrl,
      collectionStatus: 'will_watch',
    });
  };
  
  return (
    <Button
      title="Share Instagram Reel"
      onPress={() => handleShareReel('https://instagram.com/reel/...')}
    />
  );
}

// Example 2: React to push notification
function NotificationHandler() {
  const navigation = useNavigation();
  
  messaging().onNotificationOpenedApp((message) => {
    if (message.data.type === 'reel_share') {
      navigation.navigate('ReelShare', {
        reelUrl: message.data.reelUrl,
      });
    }
  });
}

// Example 3: From Share Sheet
async function shareReel(movieTitle: string) {
  try {
    const result = await Share.share({
      message: `Check out this movie: ${movieTitle}`,
      url: 'https://nextupapp.com/reel/share/[reelId]',
      title: 'Share Movie',
    });
    
    if (result.action === Share.dismissedAction) {
      // Dismissed
    }
  } catch (error) {
    console.error(error);
  }
}
*/

// ============================================================================
// STEP 6: Update Share Intent Handlers (Optional)
// ============================================================================

/*
// For Android (in android/app/src/main/AndroidManifest.xml):

// Add intent filter to your MainActivity:
<intent-filter>
  <action android:name="android.intent.action.SEND" />
  <category android:name="android.intent.category.DEFAULT" />
  <data android:mimeType="text/*" />
  <data android:mimeType="text/plain" />
</intent-filter>

// For iOS (in ios/NextUP/Info.plist):

<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>nextup</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>nextup</string>
      <string>instagram</string>
    </array>
  </dict>
</array>
*/

// ============================================================================
// STEP 7: Verify Integration
// ============================================================================

/*
Before running the app, verify:

✅ ReelShareScreen is exported from src/Screens/index.ts
✅ ReelShareScreen is imported in AppNavigator.tsx
✅ Stack.Screen is added for ReelShare
✅ RootStackParamList includes ReelShare
✅ Deep linking config includes ReelShare route
✅ useReels hook is available for import

Then run:
- npm test (verify no TypeScript errors)
- npm run start (start metro bundler)
- Test on device or emulator

Test Navigation:
1. Open app normally → should show HomeScreen
2. Deep link: nextup://reel/share/[someurl] → should show ReelShareScreen
3. Share Instagram URL → should open ReelShareScreen
*/

// ============================================================================
// STEP 8: Error Handling
// ============================================================================

/*
If ReelShareScreen doesn't show:

1. Check console for TypeScript errors
   → npm run type-check

2. Verify imports are correct
   → grep "ReelShareScreen" AppNavigator.tsx

3. Check navigation params
   → Add console.log to route.params in ReelShareScreen

4. Verify deep linking config
   → Test with: navigation.navigate('ReelShare', { reelUrl: '...' })

5. Check network connectivity
   → ReelManager makes API calls, verify backend is reachable

Debugging:
- Enable React Navigation debugging:
  linking: { ..., debug: true }
- Check logger output via debugger.ts
- Add breakpoints in ReelManager.processReelAndExtractMovie()
*/

// ============================================================================
// COMPLETE INTEGRATION CHECKLIST
// ============================================================================

/*
□ Update RootStackParamList with ReelShare type
□ Import ReelShareScreen in AppNavigator.tsx
□ Add Stack.Screen for ReelShare
□ Update linking config with ReelShare route
□ Test TypeScript compilation (npm run type-check)
□ Test deep linking on device
□ Test actual Instagram reel sharing
□ Verify error handling
□ Test collection selection
□ Verify movie is added to DataManager
□ Check toast notifications work
□ Test back navigation
*/

export {};
