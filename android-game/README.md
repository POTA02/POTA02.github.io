# Monster Dodge (Android)

Monster Dodge is a simple offline single-player Android game built with Kotlin + Jetpack Compose.

## Scope
- Genre: arcade dodger
- Mode: offline, single-player
- Minimum Android: API 24
- Output: debug APK and release AAB/APK via Gradle tasks

## MVP Gameplay
- Move the player left/right to dodge falling monsters
- Score increases each successful dodge
- Game ends on collision
- Pause/resume and restart are supported
- Sound toggle and difficulty setting are available
- High score is persisted locally

## Build & Run
1. Install Android Studio (or Android SDK with command-line tools).
2. Open `/tmp/workspace/POTA02/POTA02.github.io/android-game` in Android Studio.
3. Let Gradle sync complete.
4. Run the `app` configuration on an emulator or device.

### Command-line examples
From `/tmp/workspace/POTA02/POTA02.github.io/android-game`:

```bash
./gradlew assembleDebug
./gradlew test
./gradlew bundleRelease
```

- `assembleDebug` generates a debug APK.
- `bundleRelease` generates an AAB for Play Store submission.

## Project Structure
- `app/src/main/java/io/pota02/monsterdefense/MainActivity.kt`: game loop, screens, controls, scoring, collision logic
- `app/src/main/res/`: theme, icon, and backup rules
- `app/build.gradle.kts`: Android app configuration and dependencies
