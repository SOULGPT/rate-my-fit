# Rate My Fit 🔥
> **Latest Update:** 2025-11-27 (Auth & Safety Features Added)

AI-powered outfit analyzer and sticker creator. Snap a pic, get rated, and join the global drip feed.with scores and compliments, create custom stickers, and share with the community.

![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20iOS%20%7C%20Android-blue)

## ✨ Features

- **AI Outfit Analysis** - Get instant ratings (0-10) powered by Google Gemini AI
- **Detailed Breakdown** - Style, color combo, trend level, and drip scores
- **Custom Stickers** - Create shareable stickers with your rating and emojis
- **Real-time Background** - See community stickers floating in the background
- **Emoji Support** - Add up to 3 emojis to personalize your stickers
- **High Quality** - 2x resolution stickers for crisp sharing
- **PWA Ready** - Install on any device, works offline

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Native Apps
```bash
# Android
npm run cap:android

# iOS (Mac only)
npm run cap:ios
```

## 📱 Deployment

### PWA (Web)
Deploy to Vercel, Netlify, or Firebase Hosting. See [deployment guide](./DEPLOYMENT.md) for details.

### iOS App Store
Requires Mac, Xcode, and Apple Developer account ($99/year).

### Google Play Store
Requires Android Studio and Google Play Developer account ($25 one-time).

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: CSS with custom design system
- **AI**: Google Gemini API
- **Backend**: Firebase Realtime Database
- **Mobile**: Capacitor for iOS/Android
- **PWA**: Service Worker, Web Manifest

## 📦 Project Structure

```
rate-my-fit/
├── src/
│   ├── components/     # React components
│   ├── firebase-config.js
│   └── main.jsx
├── public/
│   ├── icons/         # App icons (all sizes)
│   ├── manifest.json  # PWA manifest
│   └── sw.js         # Service worker
├── android/          # Android native project
├── ios/             # iOS native project
└── dist/            # Production build
```

## 🎨 Key Components

- **App.jsx** - Main app with camera integration
- **Results.jsx** - AI analysis results display
- **StickerCreator.jsx** - Custom sticker creation with emojis
- **BackgroundLoop.jsx** - Animated sticker background

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_DATABASE_URL=your_db_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📄 License

Private project - All rights reserved

## 🙏 Credits

Built with ❤️ using React, Vite, Firebase, and Google Gemini AI
