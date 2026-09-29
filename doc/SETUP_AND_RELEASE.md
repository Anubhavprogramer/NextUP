# NextUP App — Setup, Build & Release

## Requirements
- Node ≥ 20, JDK 17, Android SDK (compile/target 36, min 24), NDK 27.1.12297006
- Kotlin 2.1.20 (set in `android/build.gradle`)
- iOS (later): Xcode + CocoaPods via `bundle exec pod install`

## Run (dev)
```sh
npm install
npm run setup-fonts      # copies vector-icon fonts (scripts/setup-fonts.sh)
npm start                # Metro
npm run android          # in another terminal
```
`npm run clean-build` clears the RN and Gradle caches when native builds act up.

## Configuration
Right now the only config is the TMDB key, hardcoded in `src/API/tmdb.ts`. **It should move to env vars** (AUDIT S2):

```sh
npm i react-native-config
```
`.env` (git-ignored) and `.env.example` (committed):
```
TMDB_API_KEY=
NEXTUP_API_URL=https://<project>.vercel.app
NEXTUP_API_KEY=
```

## Android identity
| Field | Current value | Where |
|---|---|---|
| `applicationId` / `namespace` | `com.anubhavx10tion.codes` | `android/app/build.gradle:80,83` |
| `versionCode` / `versionName` | `1` / `1.0` | `android/app/build.gradle:86-87` |
| Display name | `NextUP` | `app.json`, `strings.xml` |

> Decide the final `applicationId` **before the first Play upload**. It's permanent after that.

## Release signing

The current setup commits `nextup-release-key.jks` and puts its passwords in `android/gradle.properties`. **That's accepted for now, because the repo is private and the app is personal.** Still enroll in **Play App Signing** (step 4), so a leaked upload key can be reset. If the repo ever becomes public, harden it like this:

1. Generate a new upload key and keep it **outside** the repo:
   ```sh
   keytool -genkeypair -v -storetype PKCS12 -keystore ~/keys/nextup-upload.jks \
     -alias nextup-upload -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Put the credentials in `~/.gradle/gradle.properties` (user-level, never committed):
   ```
   MYAPP_UPLOAD_STORE_FILE=/Users/<you>/keys/nextup-upload.jks
   MYAPP_UPLOAD_KEY_ALIAS=nextup-upload
   MYAPP_UPLOAD_STORE_PASSWORD=...
   MYAPP_UPLOAD_KEY_PASSWORD=...
   ```
3. Remove the four `MYAPP_UPLOAD_*` lines from `android/gradle.properties`. Run `git rm --cached nextup-release-key.jks android/app/nextup-release-key.jks` and add `*.jks` (except `debug.keystore`) to `.gitignore`.
4. Enroll in **Play App Signing** when you create the app in Play Console. Google keeps the real app-signing key, and yours is only the upload key.

## Build the release bundle
```sh
cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```
Before uploading:
- [ ] Turn on `minifyEnabled true` + `shrinkResources true` for release, then test it. RN needs its ProGuard rules; check that vector icons and AsyncStorage still work.
- [ ] Install a release APK on a real device (`./gradlew assembleRelease`) and run through onboarding → search → add → share a reel
- [ ] Bump `versionCode` on every upload

## Play Console checklist
- [ ] App content: privacy policy URL, Data Safety (no data collected; reel URLs are sent to our server for processing), target audience, content rating
- [ ] TMDB attribution in the app (Settings → About)
- [ ] Store listing: 512×512 icon, 1024×500 feature graphic, ≥ 4 phone screenshots, short (80 chars) and full description
- [ ] Internal testing → closed testing (a new personal developer account needs **12 testers opted in for 14 days** before production)
