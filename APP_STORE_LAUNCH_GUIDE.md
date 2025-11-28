# 🚀 DRIPR8 App Store Launch Guide

This guide will walk you through the process of launching **DRIPR8** on the Apple App Store. Since you already have an Apple Developer Account, you are ready to proceed!

## ✅ Phase 1: Prerequisites

1.  **Mac with Xcode:** Ensure you have the latest version of Xcode installed from the Mac App Store.
2.  **Apple Developer Account:** You must be signed in to Xcode with your developer account (`Xcode > Settings > Accounts`).
3.  **iPhone (Optional but Recommended):** For testing on a real device before submission.

---

## 🎨 Phase 2: App Assets & Configuration

We have already renamed the app to **DRIPR8** and set the Bundle ID to `com.dripr8.app`.

### 1. Generate App Icons & Splash Screens
To look professional, you need icons for all device sizes. The easiest way is to use the Capacitor Assets tool.

**Run these commands in your terminal:**
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --ios --android --icon public/icons/icon-512x512.png
```
*(Note: Ensure you have a high-res icon at `public/icons/icon-512x512.png`. If not, place your logo there first.)*

### 2. Update Native Projects
Now, apply the changes to the iOS project.

```bash
npm run build
npx cap sync ios
```

---

## 🛠 Phase 3: Xcode Configuration

1.  **Open the Project:**
    ```bash
    npx cap open ios
    ```
    This will launch Xcode.

2.  **Configure Signing:**
    *   Click on **App** (the blue icon at the top left of the file navigator).
    *   Select the **App** target in the middle pane.
    *   Go to the **Signing & Capabilities** tab.
    *   **Team:** Select your Apple Developer Team.
    *   **Bundle Identifier:** Ensure it says `com.dripr8.app`.
    *   **Display Name:** Ensure it says `DRIPR8`.

3.  **Set Permissions (Info.plist):**
    *   Go to the **Info** tab (or open `Info.plist`).
    *   Ensure the following keys have user-friendly descriptions (we use the Camera and Photo Library):
        *   **Privacy - Camera Usage Description:** "DRIPR8 needs camera access to scan your outfit."
        *   **Privacy - Photo Library Additions Usage Description:** "DRIPR8 needs to save your premium cards to your gallery."
        *   **Privacy - Photo Library Usage Description:** "DRIPR8 needs access to upload photos for analysis."

---

## 🏗 Phase 4: Build & Archive

1.  **Select Generic iOS Device:**
    *   In the top toolbar, click the device selector (usually says your phone name or a simulator).
    *   Select **Any iOS Device (arm64)**.

2.  **Archive the App:**
    *   Go to **Product > Archive**.
    *   Xcode will build the app. This may take a few minutes.

3.  **Validate & Distribute:**
    *   Once the build finishes, the **Organizer** window will open.
    *   Select your latest archive.
    *   Click **Distribute App**.
    *   Select **App Store Connect** -> **Upload**.
    *   Follow the prompts (keep default settings usually).
    *   Click **Upload**.

---

## 🌐 Phase 5: App Store Connect

1.  **Log in to App Store Connect:** [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2.  **Create New App:**
    *   Click the **+** button -> **New App**.
    *   **Platforms:** iOS.
    *   **Name:** DRIPR8.
    *   **Primary Language:** English (US).
    *   **Bundle ID:** Select `com.dripr8.app` (it should appear after your Xcode upload finishes processing).
    *   **SKU:** `DRIPR8_IOS_001` (or anything unique).
    *   **User Access:** Full Access.

3.  **Fill in App Information:**
    *   **Screenshots:** Upload screenshots for iPhone (6.5" and 5.5" displays). You can take these in the Simulator (`Cmd + S`).
    *   **Promotional Text:** "Rate your fit with AI. Get premium trading cards."
    *   **Description:** Explain the features (AI rating, trading cards, sharing).
    *   **Keywords:** fashion, ai, outfit, rating, style, streetwear, drip.
    *   **Support URL:** Your website or GitHub repo.
    *   **Marketing URL:** Your website (`https://rate-my-fit-git-main-eidens-projects.vercel.app/`).

4.  **Select Build:**
    *   Scroll down to the **Build** section.
    *   Click **Add Build** and select the version you uploaded from Xcode. (It may take 10-20 mins to process).

5.  **Submit for Review:**
    *   Answer the compliance questions (Encryption: usually No, unless you added custom crypto).
    *   Click **Add for Review**.
    *   Click **Submit to App Review**.

---

## 🐞 Troubleshooting

*   **"Bundle ID not available":** Someone else might have taken it (unlikely for `com.dripr8.app`). If so, change it in `capacitor.config.json` and Xcode.
*   **"Missing Icon":** Ensure you ran the `capacitor-assets` command.
*   **"Signing Error":** Make sure your Apple Developer membership is active and you selected the correct Team in Xcode.

**Good luck with the launch! 🚀**
