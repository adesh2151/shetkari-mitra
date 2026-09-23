# Shetkari Mitra 🌱

Offline-first **crop disease detection** app for farmers in Maharashtra.
Take a photo of a leaf → get the disease name, cause, treatment and prevention
in **मराठी / हिंदी / English**.

- **100% free** — no API keys, no billing, no subscriptions (Option B: on-device model)
- **Works offline** — the AI model runs inside the app, no server
- **One codebase → PWA + Android** (React + Vite, wrapped with Capacitor)

## Status

| Feature | State |
|---------|-------|
| UI, 3 languages, camera, history | ✅ Done |
| Disease detection flow | ✅ Done (runs in **demo mode** until a model is added) |
| Real on-device model | ⏳ Add to `public/model/` — see `public/model/README.md` |
| PWA (installable, offline) | ✅ Configured |
| Android APK wrap (Capacitor) | ✅ Configured — run the commands below |

## Run it (development)

```bash
npm install
npm run dev
```

Open the printed URL on your phone (same Wi-Fi) to test the camera.

## Build the PWA (free hosting)

```bash
npm run build      # output goes to dist/
npm run preview    # test the production build
```

Deploy `dist/` free on **GitHub Pages**, **Netlify**, or **Cloudflare Pages**.
It installs like an app from the browser and works offline.

## Build the Android APK (no Play Store, share manually)

Requires Android Studio + JDK installed.

```bash
npm run cap:add:android   # one time
npm run cap:sync          # build web + copy into android/
npm run cap:open:android  # opens Android Studio → Build > Build APK
```

Share the generated `.apk` via WhatsApp / QR / website. No Play Store fee.

## Add the real AI model

The app works today with sample results. To make detection real, follow
`public/model/README.md` — drop a TensorFlow.js model into `public/model/`.
No other code changes needed.

## Pushing updates (users get notified)

Every push to `master` auto-deploys the PWA **and** rebuilds the Android APK.
To notify installed users and show them what changed:

1. Edit `public/version.json` — bump `version` and list the changes in all three
   languages.
2. Commit and push.
3. Returning users see an **"Update now"** bar; after updating they see a
   **"What's new"** popup with your changelog.

## Showing a notice / announcement (anytime, no version change)

Edit `public/announcement.json`:

```json
{ "id": "2026-10-01-rain", "active": true, "type": "warning",
  "title": { "mr": "...", "hi": "...", "en": "..." },
  "message": { "mr": "...", "hi": "...", "en": "..." } }
```

- Set `"active": true` to show it, `false` to hide.
- Change `id` whenever you want a **new** notice to reappear (users who dismissed
  the old one see the new one).
- `type` = `info` | `warning` | `success` (changes the banner colour).

## Android APK

- Auto-built on every push by `.github/workflows/build-apk.yml`.
- Published as a GitHub Release so the web app's **Download Android app** button
  always points to the latest: `releases/download/apk/ShetkariMitra.apk`.

## Project layout

```
src/
├── App.jsx                 app shell + tab navigation
├── i18n/                   mr / hi / en translations
├── ml/
│   ├── classifier.js       loads model, runs prediction (demo fallback)
│   └── diseases.json       cause/treatment/prevention per disease, 3 languages
├── components/             ScanScreen, ResultCard, HistoryScreen, LanguageSwitcher
└── store/history.js        offline scan history (localStorage)
```

## Important note on advice

The treatment text is general guidance. Always tell users to confirm pesticide
names and doses with their local **Krishi Kendra / agriculture officer** before
spraying. This disclaimer is shown on every result.
