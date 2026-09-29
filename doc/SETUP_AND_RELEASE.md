# NextUP App — Setup, Run, Release

## Requirements
- Node ≥ 20 (tested on 26), npm
- **iOS:** Xcode 26+ (tested on 27), CocoaPods (Homebrew `pod`), an Apple ID signed in to Xcode
- **Android:** JDK 17, Android SDK (compile/target 36, min 24), NDK 27.1.12297006, Kotlin 2.1.20

## First-time setup
```sh
cd NextUP
npm install
npm run setup-fonts          # copies Ionicons into Android assets
cd ios && pod install && cd ..
```
Run `pod install` again whenever native dependencies or `ios/Podfile` change. The Podfile's `post_install` does two things Xcode 26+ needs: it raises pods still on iOS 13.4, and it compiles `fmt` as C++17.

## Run on your iPhone

1. Plug in by cable, unlock, tap **Trust**. Turn on **Developer Mode** once (Settings → Privacy & Security).
2. Check the phone shows up under **Devices** (not "Devices Offline"):
   ```sh
   xcrun xctrace list devices
   ```
3. **Standalone build** (JS bundled in; no Metro needed; best for testing sharing):
   ```sh
   npx react-native run-ios --udid <your-UDID> --mode Release
   ```
   **Dev build** (live reload; phone and Mac on the same Wi-Fi):
   ```sh
   npm start                                   # terminal 1
   npx react-native run-ios --udid <your-UDID> # terminal 2
   ```
4. First launch: Settings → General → VPN & Device Management → your Apple ID → **Trust**.

From Xcode instead: `open ios/NextUP.xcworkspace` (the workspace, not the `.xcodeproj`) → ⇧⌘K to clean → pick your iPhone → ▶. Signing: **NextUP** and **NextUPShare** targets → Signing & Capabilities → your team, "Automatically manage signing".

> With a free Apple ID, installed builds stop opening after **7 days**; run the build again. Yellow Xcode warnings ("Update to recommended settings", "script phase will run during every build") are harmless.

## Run on Android
```sh
npm start
npm run android
```
Test sharing without Instagram: see the `adb` command in [REEL_SHARE_INTEGRATION.md](./REEL_SHARE_INTEGRATION.md#testing-on-a-device).

## Tests and checks
```sh
npx jest            # 28 tests
npx tsc --noEmit    # currently 12 errors that were already there (AUDIT A-8); new code should add none
```

## Configuration

| What | Where | Notes |
|---|---|---|
| Backend URL + API key | `src/Config/env.ts` | Must match the Vercel `NEXTUP_API_KEY`; rebuild the app after changing it |
| TMDB key | `src/API/tmdb.ts` | Hardcoded (accepted for a private repo) |

## App identity

| Field | Value | Where |
|---|---|---|
| Android `applicationId` (Play package, permanent) | `com.anubhavx10tion.codes` | `android/app/build.gradle` — the Kotlin `namespace`/package stays `com.anubhavx10tion.nextup`; bump `versionCode` on every upload |
| iOS bundle id | `com.anubhavx10tion.nextup` | Xcode target NextUP |
| iOS share extension | `com.anubhavx10tion.nextup.share` | Xcode target NextUPShare |
| Version | `1.0` (1) | `build.gradle`, Xcode `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` (keep the extension in sync) |
| URL scheme | `nextup://` | iOS `Info.plist`, `AndroidManifest.xml` |

> Decide the final Android `applicationId` **before the first Play upload**. It's permanent after that.

## Git & PR workflow

`main` is the release branch. For each change:
```sh
git switch main && git pull
git switch -c feat/<name>                 # new branch
# …work, commit…
git log --oneline origin/main..HEAD       # what the PR will contain
git push -u origin feat/<name>
gh pr create --base main --head feat/<name> --web
```
After merging on GitHub: `git switch main && git pull && git branch -d feat/<name>`.

## Release signing (Android)

`nextup-release-key.jks` and its passwords are committed (`android/gradle.properties`). That's **accepted** because the repo is private. Still enroll in **Play App Signing** so the upload key can be reset. If the repo ever becomes public:
1. `keytool -genkeypair -v -storetype PKCS12 -keystore ~/keys/nextup-upload.jks -alias nextup-upload -keyalg RSA -keysize 2048 -validity 10000`
2. Move the `MYAPP_UPLOAD_*` values to `~/.gradle/gradle.properties`.
3. `git rm --cached` the `.jks` files and ignore `*.jks` (except `debug.keystore`).

## Build the Play Store bundle
```sh
cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```
Before uploading:
- [ ] Turn on `minifyEnabled` + `shrinkResources`, then test (vector icons, AsyncStorage, share intent)
- [ ] Install a release APK (`./gradlew assembleRelease`) and run onboarding → search → add → share a reel
- [ ] Bump `versionCode` on every upload

## Play Console checklist
- [ ] Privacy policy URL; Data Safety (no personal data; reel links go to our server, searches to TMDB); target audience; content rating
- [ ] TMDB attribution in the app (Settings → About)
- [ ] 512×512 icon, 1024×500 feature graphic, ≥ 4 screenshots, short + full description
- [ ] Internal testing → closed testing (new personal accounts need **12 testers for 14 days**) → production
