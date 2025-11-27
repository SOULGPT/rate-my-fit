# 🔥 FIX FIREBASE PERMISSION ERRORS

If you see an error like **"Permission denied"** or **"Client is offline"**, your Firebase Database rules are likely blocking writes.

## 1. Go to Firebase Console
1.  Open [https://console.firebase.google.com/](https://console.firebase.google.com/)
2.  Select your project **"rate-my-fit"**.

## 2. Update Realtime Database Rules
1.  Click **"Build"** -> **"Realtime Database"** in the left sidebar.
2.  Click the **"Rules"** tab.
3.  **Replace** the existing rules with this:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
*(Note: This allows anyone to read/write. For production, we can make it stricter later, but this ensures the app works now.)*

4.  Click **"Publish"**.

## 3. Update Storage Rules (If using Storage)
1.  Click **"Build"** -> **"Storage"**.
2.  Click the **"Rules"** tab.
3.  Replace with:

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```
4.  Click **"Publish"**.

## 4. Check Authentication Settings
1.  Click **"Build"** -> **"Authentication"**.
2.  Go to **"Sign-in method"**.
3.  Ensure **Google** is **Enabled**.
4.  **IMPORTANT:** Add your Vercel domain (e.g., `rate-my-fit.vercel.app`) to the **"Authorized domains"** list further down the page.

After doing this, try sharing a card again! 🚀
