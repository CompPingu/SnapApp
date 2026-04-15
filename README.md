# SnapApp (Personal Calorie + Protein Tracker)

Minimal **React Native + Expo** mobile app + **Node.js + Express** backend for personal use.

## Features

- **Home**: today’s totals (calories + protein) + today’s meals
- **Scan Food**: uses the phone camera → uploads image to backend → “vision” recognition (stub by default) → USDA nutrition lookup → saves meal
- **Manual Add**: log a meal manually
- **History**: past days grouped by date

## Folder structure

- `mobile/`: Expo app runs on phone with Expo Go or can run on emulator using  android studio. 
- `backend/`: Express server + JSON storage (`backend/data/meals.json`)

## Prerequisites
## Backend setup (Express)

cd backend
npm install
npm run dev

Endpoints:

- `GET /health`
- `GET /api/today` → totals + meals for today
- `GET /api/history?days=14` → grouped history
- `POST /api/meals` → manual add `{ name, calories, protein, timestamp? }`
- `POST /api/scan` → multipart upload field name **`image`**
- `DELETE /api/meals/:id`

Data is stored in `backend/data/meals.json` (personal-use JSON “database”).

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

