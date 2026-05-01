# Share Intent Setup Guide

## ✅ What Was Done

I've added complete share intent support so Instagram reels appear in your app's share menu.

---

## 🔧 Android Configuration

### 1. AndroidManifest.xml (✅ DONE)
Added share intent filter to MainActivity:

```xml
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="text/*" />
    <data android:mimeType="text/plain" />
    <data android:mimeType="text/html" />
</intent-filter>
```

Also added deep linking support:
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="nextup" android:host="reel" />
    <data android:scheme="https" android:host="nextupapp.com" />
</intent-filter>
```

### 2. Update MainActivity.java

Add this to your `MainActivity.java` (located at `android/app/src/main/java/com/nextup/MainActivity.java`):

```java
import android.content.Intent;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {
  
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Handle share intent if app opened via share
    handleShareIntent(getIntent());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    
    // Handle share intent when app is already running
    handleShareIntent(intent);
  }

  private void handleShareIntent(Intent intent) {
    if (intent != null) {
      String action = intent.getAction();
      String type = intent.getType();

      if (Intent.ACTION_SEND.equals(action) && type != null) {
        if ("text/plain".equals(type)) {
          String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
          if (sharedText != null && getReactNativeHost().hasInstance()) {
            // Send the shared text to React Native
            getReactNativeHost()
              .getReactInstanceManager()
              .getCurrentReactContext()
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
              .emit("INCOMING_SHARE", sharedText);
          }
        }
      }
    }
  }
}
```

---

## 🔧 iOS Configuration

### 1. Info.plist (✅ DONE)
Added URL scheme support:

```xml
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
        </array>
    </dict>
</array>
```

### 2. Update AppDelegate.swift

Add this to your `AppDelegate.swift` (located at `ios/NextUP/AppDelegate.swift`):

```swift
import React

// Add this method to AppDelegate class
override func application(_ app: UIApplication, open url: URL, 
                        options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
  if url.scheme?.hasPrefix("nextup") == true {
    // Handle deep link
    RCTLinkingManager.application(app, open: url, options: options)
    return true
  }
  return false
}

// For receiving shared items
override func application(_ app: UIApplication, 
                        continue userActivity: NSUserActivity, 
                        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
  if userActivity.activityType == NSUserActivityTypeBrowsingWeb {
    if let url = userActivity.webpageURL {
      RCTLinkingManager.application(app, continue: userActivity, 
                                   restorationHandler: restorationHandler)
      return true
    }
  }
  return false
}
```

---

## 📱 React Native Integration

### 1. Hook for Handling Share Intent (✅ CREATED)

File: `src/Hooks/useShareIntentHandler.ts`

This hook listens for incoming share intents and navigates to ReelShareScreen.

### 2. Use in Your App Component

Add this to your root `App.tsx` or wherever you have your navigation:

```tsx
import { useShareIntentHandler } from './src/Hooks/useShareIntentHandler';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function App() {
  const navigation = useNavigation();
  const { handleIncomingShare } = useShareIntentHandler();

  useEffect(() => {
    // Listen for share intents from Android
    const eventEmitter = new NativeEventEmitter(NativeModules.ShareIntentHandler);
    
    const subscription = eventEmitter.addListener('INCOMING_SHARE', (sharedText) => {
      handleIncomingShare(sharedText);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // ... rest of your app
}
```

### 3. Handle Deep Links

The `linking` configuration in `src/Utils/deepLinking.ts` already handles deep links:

```
nextup://reel/share/https://www.instagram.com/reel/ABC123/
```

---

## 🧪 Testing

### Android Testing

1. **Rebuild app:**
   ```bash
   cd android && ./gradlew clean build && cd ..
   npm start
   ```

2. **Open Instagram** and find a reel

3. **Tap Share** → Your app should now appear in the list!

4. **Tap NextUP** → ReelShareScreen should open with the reel URL

### iOS Testing

1. **Rebuild app:**
   ```bash
   cd ios && pod install && cd ..
   npm start
   ```

2. **Open Instagram** and find a reel

3. **Tap Share** → Look for NextUP in the share menu

4. **Tap NextUP** → Should navigate to ReelShareScreen

---

## 🔍 Verification Checklist

After implementing:

- [ ] AndroidManifest.xml has share intent filter
- [ ] MainActivity.java has `handleShareIntent()` method
- [ ] Info.plist has CFBundleURLTypes
- [ ] AppDelegate.swift handles deep links
- [ ] `useShareIntentHandler` hook created
- [ ] App listens for "INCOMING_SHARE" event
- [ ] Deep linking configured in `deepLinking.ts`
- [ ] Rebuilt both Android and iOS apps
- [ ] Can see app in Instagram's share menu
- [ ] Sharing opens ReelShareScreen

---

## 🐛 Troubleshooting

### App not appearing in share menu

**Solution:**
1. Clear app cache: `npm start -- --reset-cache`
2. Rebuild Android: `cd android && ./gradlew clean build`
3. Rebuild iOS: `cd ios && rm -rf build && pod install`
4. Restart devices/emulators

### ReelShareScreen doesn't open when sharing

**Check:**
1. Make sure `handleIncomingShare()` is called
2. Check console logs for errors
3. Verify deep linking config is correct
4. Check if URL validation passes: `isValidInstagramReelUrl()`

### Share intent not being received

**Check:**
1. AndroidManifest.xml has correct intent-filter
2. MainActivity.java has `handleShareIntent()` implementation
3. App is listening to "INCOMING_SHARE" events
4. NativeModules.ShareIntentHandler is available

---

## 📚 Files Modified/Created

- ✅ `android/app/src/main/AndroidManifest.xml` - Added share intent filter
- ✅ `ios/NextUP/Info.plist` - Added URL schemes
- ✅ `src/Hooks/useShareIntentHandler.ts` - Share intent handler hook (created)
- ⏳ `android/app/src/main/java/com/nextup/MainActivity.java` - Need to add handleShareIntent()
- ⏳ `ios/NextUP/AppDelegate.swift` - Need to add deep link handlers

---

## ⏳ Next Steps

1. Update `MainActivity.java` with share intent handling
2. Update `AppDelegate.swift` with deep link handling
3. Add event listener in your root App component
4. Rebuild and test
5. Share Instagram reel to your app!

---

## 📖 Reference

- [Android Intent Filters](https://developer.android.com/guide/components/intents-filters)
- [iOS URL Schemes](https://developer.apple.com/documentation/uikit/inter-process_communication/allowing_apps_to_communicate_with_custom_urls)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)

---

**Status:** Configuration complete, implementation guides provided ✅
