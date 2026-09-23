# Shetkari Mitra — Project Status & Handoff

_Last updated: 2026-09-23. Read this first when resuming._

## Links
- **Live app (PWA):** https://adesh2151.github.io/shetkari-mitra/
- **Repo:** https://github.com/adesh2151/shetkari-mitra  (PUBLIC)
- **Android APK:** https://github.com/adesh2151/shetkari-mitra/releases/download/apk/ShetkariMitra.apk
- **Local path:** `~/git-personal/shetkari-mitra`
- **Current version:** 0.9.1 (see `public/version.json`)

## Accounts / git (IMPORTANT)
- This is a **personal** project. Repo + commits use the **personal GitHub account `adesh2151`**
  (commit email `adesh2151@users.noreply.github.com`). NOT the work account.
- To push: `gh auth switch --user adesh2151`, do the push, then switch back:
  `gh auth switch --user adesh-via`.
- Do NOT put this under `~/git` (work area) or use the work identity.

## What the app does (features, all in Marathi / Hindi / English)
1. **Disease detection (photo)** — on-device AI, offline, no key. Crop selector on Scan screen.
   - **Real models live for:** Tomato, Potato, Grape, Chilli (one "field" model) + **Sugarcane** (separate model).
   - Field model: ~87% val acc, 19 classes. Sugarcane: ~86% val acc, 5 classes (healthy, red rot, mosaic, rust, yellow).
2. **Weather + farm advice** — Open-Meteo (free, no key). PIN-code + city search (India Post + Open-Meteo).
3. **Irrigation scheduler** — Open-Meteo evapotranspiration + soil moisture.
4. **Market (mandi) prices** — data.gov.in / Agmarknet (REAL govt data; uses shared demo key in `src/config.js` — replace with own free key for reliability).
5. **"What to Grow" advisor** — season + rainfall + live prices.
6. **Fertilizer calculator** — NPK + organic + day-wise schedule + optional Soil Health Card adjustment. Sourced (see below).
7. **Crop Guide** — origin/soil/climate/water/spacing/duration (general references — NOT yet single-sourced).
8. **Pest Guide** — 8 crops, TNAU-sourced.
9. **Dairy/Cattle** — feed calculator + care + diseases (general guidance).
10. **Govt schemes**, **Helpline directory**, **Safety** (pesticide safety + poison helpline 1800-116-117).
11. **Farm diary** (income/expense/profit), **scan history**.
12. **Update notifications** + **announcements** (edit `public/version.json` / `public/announcement.json`).
13. **WhatsApp share preview** (OG tags + `public/og-image.png`).

## Data sources (shown in-app as "📚 Data source: …")
- **Fertilizer NPK:** TNAU Crop Production Guide, Vikaspedia (GoI), IIWBR (ICAR), NHB, ICAR-DOGR — per crop in `src/data/fertilizer.json` (`source` field). Values re-verified against fetched source pages.
- **Disease treatments:** TNAU Agritech + Cornell/UF-IFAS/Ohio State/UC-IPM — per disease in `src/ml/diseases.json` (`source` field).
- **Pest guide:** TNAU Agritech (`src/data/pests.json`).
- **Prices:** Agmarknet / data.gov.in.  **Weather/irrigation:** Open-Meteo.  **PIN:** India Post.
- **Crop guide / dairy:** general references — labelled "verify locally" (candidates to source next).

## How the AI model works
- Runs **on the user's phone** via TensorFlow.js (not on a server; GitHub only hosts the files).
- It does **NOT self-train** from user photos. Improving it = collect labelled photos + retrain manually + redeploy (not built).
- Models live under `public/model/` (field) and `public/model/sugarcane/` (model.json + *.bin + labels.json).

## Tech stack
- React + Vite (PWA, `vite-plugin-pwa`), TensorFlow.js. Wrapped to Android via Capacitor.
- CI (`.github/workflows/`): `deploy.yml` (Pages), `build-apk.yml` (APK on every push + release),
  `convert-model.yml` (Keras .h5 → TF.js, runs on model.h5 changes; then trigger deploy manually
  because GitHub blocks bot-commit auto-deploy: `gh workflow run deploy.yml`).

## Commands
```bash
cd ~/git-personal/shetkari-mitra
npm install && npm run dev          # local dev
npm run build                       # production build
# deploy = git push (as adesh2151) → deploy.yml runs
```

## How to add disease detection for a NEW crop (repeatable pipeline)
Free, no-login datasets already identified (Mendeley, CC BY 4.0) — see below.
1. Download + extract dataset into `model-training/data/<crop>/` (class sub-folders).
   - RAR files: use the standalone unrar (downloaded to scratchpad earlier) or install `unar`.
   - Clean corrupt images first (a PIL open/verify pass).
2. Make `model-training/map-<crop>.json` (folder name → key in `src/ml/diseases.json`).
3. Add the crop's disease entries to `src/ml/diseases.json` (cause/treatment/prevention, 3 langs, `source`).
4. Train:
   ```bash
   cd model-training && . .venv/bin/activate
   python train_local.py --data "data/<crop>/..." --out model-<crop>.h5 \
       --labels labels-<crop>.json --map map-<crop>.json --epochs 6
   ```
5. Add the crop to `JOBS` in `model-training/convert.py`, to `GROUPS` in `src/ml/classifier.js`,
   the paths list in `.github/workflows/convert-model.yml`, i18n `group_<crop>`, and the Scan selector.
6. Commit `model-<crop>.h5` + `labels-<crop>.json` (as adesh2151) → CI converts → `gh workflow run deploy.yml`.

Python env for training: `model-training/.venv` (created with `virtualenv`, Python 3.8,
tensorflow-cpu 2.13.1 + tensorflow-datasets 4.9.2). tensorflowjs can't install on py3.8 → conversion
is done in CI (`convert-model.yml`, Python 3.10 + tensorflowjs 4.10 + jax 0.4.20).

## Free datasets for remaining crops (Mendeley, CC BY 4.0, no login)
- Rice (5,932 imgs, 4 classes): https://data.mendeley.com/datasets/fwcj7stb8r/1
- Cotton (1,373; 5 classes): https://data.mendeley.com/datasets/t9hgvk2h9p/1
- Wheat (407; rust/septoria/healthy): https://data.mendeley.com/datasets/wgd66f8n6h/1
- Maize (17,000; 5 classes): https://data.mendeley.com/datasets/hmkd6nbngr/1
- Grape GVLiD (3,477; field images): https://data.mendeley.com/datasets/wkymf8bhcg/5
- Sugarcane (DONE): https://data.mendeley.com/datasets/9424skmnrk/1

## TODO / next session
- [ ] **Re-source all agronomy data from Maharashtra agri universities** — MPKV Rahuri,
      VNMKV Parbhani, PDKV Akola, Dr. BSKKV Dapoli (replace TNAU / outside refs in
      `src/data/fertilizer.json`, `pests.json`, `cropguide.json`, `src/ml/diseases.json`).
- [ ] **Add more Maharashtra vegetables & fruits** to Crop Guide + Fertilizer + Pest data:
      onion, tomato, brinjal, okra, chilli, cabbage/cauliflower, grape, pomegranate, banana,
      orange/Nagpur mandarin, sugarcane, custard apple, ber — with vidyapeeth citations.
- [ ] **Help contacts → village/taluka authorities**: कृषी सहायक → मंडळ कृषी अधिकारी →
      तालुका कृषी अधिकारी (not a generic krishi kendra) in `src/data/directory.json`.
- [ ] **Voice everywhere**: read-aloud (TTS) on each data screen + voice input on Scan/Advisor
      (foundation added: `src/services/voice.js`, `VoiceButton` navigates by speech).
- [ ] **Daily "आजचे काम" card on Home** — aggregate weather + prices + new GRs into today's tasks.
- [ ] **Telegram alerts for new GRs/news** — set repo secrets `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`
      (scraper `scraper/news_scrape.py` + `.github/workflows/news.yml` already wired).
- [ ] Train disease models for **rice, cotton, wheat, maize** (pipeline above; datasets ready).
- [ ] Expand **Crop Guide** into full encyclopedia: origin, best season, yield, market varieties,
      irrigation, fertilizer+pesticide schedule, **best market to sell + selling ideas** (Maharashtra focus),
      with authoritative citations.
- [ ] Source **Crop Guide** and **Dairy feed** data authoritatively (currently "general references").
- [ ] Confidence threshold on detection: show "not sure — consult expert" when low confidence.
- [ ] Optional: voice output (text-to-speech in Marathi/Hindi) for low-literacy users.
- [ ] Optional: "Help improve" — let users submit a labelled photo (needs backend for retraining).
- [ ] Replace shared data.gov.in demo key with own free key (`src/config.js`).

## Key files
```
src/App.jsx                 screen router + crop-group titles
src/ml/classifier.js        multi-model loader (GROUPS) + inference
src/ml/diseases.json        disease cause/treatment/prevention (3 langs) + source
src/data/                   fertilizer, pests, cropmeta, cropguide, dairy, schemes, directory, safety, commodities
src/components/             one screen per feature
src/services/               weather.js (Open-Meteo + India Post), prices.js (data.gov.in)
model-training/             train_local.py, train_tfds.py, convert.py, venv, datasets (gitignored)
public/model/ , public/model/sugarcane/   deployed TF.js models
public/version.json         changelog shown to users on update
public/announcement.json    broadcast notice (set "active": true)
```
