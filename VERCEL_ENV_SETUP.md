# 🚨 VERCEL DEPLOYMENT FIX: MISSING ENVIRONMENT VARIABLES

If your app works on localhost but fails on Vercel (e.g., "Analysis failed" or white screen), it is because **Vercel does not know your API keys**.

## 🛠️ HOW TO FIX IT (Takes 2 minutes)

1.  **Go to your Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2.  Select your project **"rate-my-fit"**.
3.  Click on **"Settings"** (top tab).
4.  Click on **"Environment Variables"** (left sidebar).
5.  **Add these 8 variables** one by one. Copy the values from your local `.env` file.

| Variable Name | Value (Copy from your local .env) |
| :--- | :--- |
| `VITE_GEMINI_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `rate-my-fit-....firebaseapp.com` |
| `VITE_FIREBASE_DATABASE_URL` | `https://rate-my-fit-....firebasedatabase.app` |
| `VITE_FIREBASE_PROJECT_ID` | `rate-my-fit-...` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `rate-my-fit-....appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456...` |
| `VITE_FIREBASE_APP_ID` | `1:12345...` |

### ⚠️ IMPORTANT:
*   **Do not use quotes** around the values in Vercel.
*   After adding them, you **MUST REDEPLOY** for changes to take effect:
    1.  Go to **"Deployments"** tab.
    2.  Click the **three dots** (...) next to the latest deployment.
    3.  Select **"Redeploy"**.

Your app will work perfectly after this! 🚀
