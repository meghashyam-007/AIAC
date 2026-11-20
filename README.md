# AgriSense — AI-Assisted Smart Agriculture Website

This version keeps the original React dashboard design and adds a working Flask API with a local SQLite database. No AWS account, PostgreSQL server, IoT device, or hardware is required for the local demo.

## Working features
- Dashboard reads farm, crop, soil-demo, irrigation and recommendation data from Flask.
- Add and delete crop records; crop data is saved in `backend/agriculture.db`.
- Add and delete irrigation schedules; schedules are saved in SQLite.
- Analytics are calculated from saved crop and irrigation records.
- Weather can show demo readings by default, or live current conditions when an OpenWeatherMap API key is configured.
- Health endpoint: `http://127.0.0.1:5000/api/health`.

**Important:** Soil readings are simulated, and recommendations are rule-based examples. The website does not control a real irrigation pump or diagnose crop disease. Weather is demo data unless you configure a valid API key.

## Requirements
- Python 3.10 or newer
- Node.js 20.19+ or 22.12+ recommended
- Windows CMD or VS Code terminal

## Run on Windows
Extract the ZIP. Open two terminals in the extracted `AI_Assisted_Smart_Agriculture_Website` folder.

### Terminal 1 — Flask backend
```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```
Keep this terminal open. Flask runs at `http://127.0.0.1:5000` and creates `backend/agriculture.db` automatically.

### Terminal 2 — React frontend
```cmd
cd frontend
npm install
npm run dev
```
Open the URL printed by Vite, usually `http://localhost:5173`.

## Optional live weather
Edit `backend/.env` and set:
```env
WEATHER_CITY=Hyderabad
WEATHER_API_KEY=your_openweathermap_api_key
```
Restart Flask. Without a key, the app safely shows clearly labelled demo weather.

## Troubleshooting
- If the dashboard says it cannot reach the backend, make sure Terminal 1 is still running and `http://127.0.0.1:5000/api/health` returns `status: ok`.
- If port 5000 is busy, close the other app using it or change the port in `backend/app.py` and update `API` in `frontend/src/App.jsx`.
- If `npm` is not recognized, install Node.js, reopen CMD, and retry.
- If dependencies fail, run `pip install -r requirements.txt` in the activated backend environment and `npm install` inside `frontend`.

## API endpoints
- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/crops`, `POST /api/crops`, `DELETE /api/crops/<id>`
- `GET /api/irrigation`, `POST /api/irrigation`, `DELETE /api/irrigation/<id>`
- `GET /api/analytics`
- `GET /api/weather?city=Hyderabad`
