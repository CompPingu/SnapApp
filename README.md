# SnapApp (Personal Calorie + Protein Tracker)

Minimal **React Native + Expo** mobile app + **Node.js + Express** backend for personal use.

## Features

- **Home**: today’s totals (calories + protein) + today’s meals
- **Scan Food**: uses the phone camera → uploads image to backend → “vision” recognition (stub by default) → USDA nutrition lookup → saves meal
- **Manual Add**: log a meal manually
- **History**: past days grouped by date

## Folder structure

- `mobile/`: Expo app (runs on your phone with **Expo Go**)
- `backend/`: Express server + JSON storage (`backend/data/meals.json`)

## Prerequisites

- **Node.js 18+** (Node 18+ includes `fetch()` which this backend uses)
- **Expo Go** installed on your phone (iOS/Android)
- Phone + computer on the **same Wi‑Fi**
- (Recommended) Free USDA FoodData Central API key: get one from `https://fdc.nal.usda.gov/api-key-signup.html`
- (Optional) Hugging Face token (free-tier) to enable real image recognition via API

## Backend setup (Express)

From the repo root:

```bash
cd backend
npm install
copy env.example .env   # Windows PowerShell: Copy-Item env.example .env
# then edit backend/.env and set USDA_API_KEY (optional but recommended)
npm run dev
```

Backend will run on `http://localhost:4000`.

Endpoints:

- `GET /health`
- `GET /api/today` → totals + meals for today
- `GET /api/history?days=14` → grouped history
- `POST /api/meals` → manual add `{ name, calories, protein, timestamp? }`
- `POST /api/scan` → multipart upload field name **`image`**
- `DELETE /api/meals/:id`

Data is stored in `backend/data/meals.json` (personal-use JSON “database”).

## Mobile setup (Expo)

1) Set your backend URL (LAN IP)

Edit `mobile/src/config.ts`:

- Replace `http://YOUR_LAN_IP_HERE:4000` with your computer’s LAN IP, e.g. `http://192.168.1.50:4000`
- **Do not use `localhost`** (your phone won’t reach your PC’s localhost)

2) Install and run:

```bash
cd mobile
npm install
npm start
```

Then open Expo Go on your phone and scan the QR code.

If you can’t connect:

- Ensure Windows Firewall allows inbound connections to port **4000**
- Ensure phone + computer are on the same Wi‑Fi

## Example data flow (Scan Food)

1) Mobile (Scan screen) captures a photo with `expo-camera`
2) Mobile uploads it to backend: `POST /api/scan` (multipart form-data field `image`)
3) Backend:
   - saves the uploaded file to `backend/uploads/`
   - calls `backend/src/vision.js` to get a food name (**stubbed by default**, free)
   - calls USDA FoodData Central to fetch calories + protein (requires free API key)
   - writes a meal entry into `backend/data/meals.json`
4) Backend responds with `{ meal, debug }`
5) Mobile shows confirmation; Home/History reflect the new meal on refresh

## Notes / Customization

- **Vision provider**: default is a free stub in `backend/src/vision.js`. You can swap it with any AI vision API later.
- **Optional real vision (free-tier)**: set `HF_API_TOKEN` (and optionally `HF_MODEL`) in `backend/.env` to use Hugging Face Inference API.
- **Nutrition accuracy**: USDA search results vary by description; for personal use, you can tweak how we pick “best” matches in `backend/src/usda.js`.
