
# WizSmith Technician App - Native Android Build

This is the source code for the Native Android version of the WizSmith Technician App.

## Prerequisites
1. Android Studio Hedgehog or newer.
2. Android SDK API Level 33+.
3. A physical Android device (Bluetooth Low Energy is required for TTLock features).

## Setup Instructions

1. **Create Project**: Open Android Studio > New Project > "Empty Activity" > Language: Kotlin.
2. **Add SDK**: Download `lock-lib.aar` from the TTLock Developer Portal and put it in `app/libs/`.
3. **Copy Code**: Replace the generated files with the source code provided in the prompt.
4. **Sync Gradle**: Click "Sync Now" to download dependencies.
5. **Build APK**: Go to `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

## Critical Dependencies (app/build.gradle)
Ensure you add these to your dependencies block:

```kotlin
implementation("com.google.android.material:material:1.9.0")
implementation("com.squareup.retrofit2:retrofit:2.9.0")
implementation("com.squareup.retrofit2:converter-gson:2.9.0")
implementation(files("libs/ttlock-lib.aar")) // Native TTLock SDK
```
