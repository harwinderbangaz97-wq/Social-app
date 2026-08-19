# Funshann - Android Social App (Capacitor & Native Ready)

This repository contains the full source code for the **Funshann** social network application.

## 🚀 Converting to Android Studio & Generating APK

The project is built as a modern React + Vite application with Capacitor Android integration readiness and native Android Studio project structure.

### Option 1: Generate Android Studio Project via Capacitor (Recommended & Fastest)
To generate the native Android Studio project and build the APK:

```bash
# 1. Install dependencies
npm install

# 2. Add Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Initialize Capacitor
npx cap init Funshann com.funshann.app --web-dir dist

# 4. Build the web distribution
npm run build

# 5. Add Android native project & sync
npx cap add android
npx cap sync

# 6. Open in Android Studio or build APK via Gradle
npx cap open android
```

### Option 2: Building Debug APK via Command Line (Gradle)
Once `npx cap add android` has generated the `android/` directory:

```bash
cd android
./gradlew assembleDebug
```
The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 Features
- **3D Soft Neumorphic Design System**
- **Full Feed with Post Expand/Collapse ("Read More" / "Show Less")**
- **Stories & Animated Story Viewer**
- **Interactive Comment Drawer & Lightbox**
- **User Discovery, Search & Follow System**
- **Full User Profiles with Photos, Bio, Interests & Social Links**
- **Direct Messaging with Audio/Voice Notes & Wallpapers**
- **Custom Theme Studio (Light, Dark, Golden, AMOLED)**
