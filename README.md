# TravelBuddy

## Overview

**TravelBuddy** is a full-stack travel planner application that lets users manage destinations, plan trips with date ranges and budgets, and view destinations on an interactive map. Users register and log in to create destinations (with optional daily budget in BAM), create trips with start/end dates and notes, and see automatic total budget calculation. The app also displays weather per destination and supports itinerary items per trip. The Maps page uses OpenStreetMap and geocoding to show destination locations.

## Features

- **Authentication** — Register and login with JWT; token stored in a cookie and verified on load.
- **Destinations CRUD** — Create, read, update, and delete destinations (name, country, description, optional daily budget in BAM/day). Destinations list shows a weather card per destination (current weather via OpenWeather API).
- **Trips CRUD** — Create trips with destination, start date, end date, and notes. The backend computes trip duration (inclusive days) and total budget (daily_budget_bam × days) and stores them. Edit and delete are restricted to the logged-in user’s trips. Trips list is shown in a table with sortable start date.
- **Date and budget validation** — Start date cannot be in the past; end date must be ≥ start date. Enforced on both frontend (min attributes, error messages) and backend (400 with message).
- **Itinerary items** — Per-trip items (trip_id, day_number, activity, note) with full CRUD; accessible only when authenticated.
- **Maps page** — Dropdown of destinations; selection triggers Nominatim geocoding to get coordinates, then the map (React Leaflet, OpenStreetMap tiles) centers and shows a marker with a popup (destination name and daily budget BAM/day if set). Results are cached in component state to avoid repeated geocoding.
- **API documentation** — Swagger UI at `/api/docs` (backend).

## Tech Stack

| Layer      | Technology |
|-----------|------------|
| Frontend  | React 18, React Router 6, Tailwind CSS, Leaflet + react-leaflet, js-cookie |
| Backend   | Node.js, Express, CORS |
| Database  | SQLite (file: `travelbuddy.db`) |
| Auth      | JWT (jsonwebtoken), bcrypt for password hashing |
| APIs      | OpenStreetMap tiles, Nominatim (geocoding), OpenWeather (current weather) |
| Docs      | Swagger (swagger-jsdoc, swagger-ui-express) |

## Architecture

- **Client–server**: The React app (default port 3000) talks to the Express API (port 3001) via `fetch`. CORS is enabled on the server.
- **Auth flow**: On login/register the server returns a JWT. The client stores it in a cookie (`authData`) and sends it in the `Authorization` header for protected routes. On app load, the client calls `POST /api/auth/verify-token` with that header to restore the session; invalid or missing token redirects to login.
- **Protected routes**: Destinations, trips, and itinerary routes use `authenticateToken` middleware; `req.user` (decoded JWT) is used for user-scoped data (e.g. trips and itinerary). Weather and Swagger are public.
- **Database**: SQLite is used from the Express server via the `sqlite3` driver. Tables are created by running scheme files under `server/db/schemes/`; an optional migration adds budget and date-range columns to destinations and trips.

## Project Structure

```
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Header, Footer, Body
│   │   ├── pages/          # Login, Register, Home, Destinations, Trips, Maps, etc.
│   │   │   ├── destinations/  # Destinations, addDestination, editDestination, Destination (card)
│   │   │   ├── trips/        # Trips (table), addTrip
│   │   │   ├── maps/         # Maps (Leaflet + Nominatim)
│   │   │   ├── login/, register/, dashboard/
│   │   ├── routes/         # routesList.js (React Router config)
│   │   ├── App.js          # Auth check (verify-token), layout
│   │   └── index.js        # Entry; imports leaflet.css
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/       # auth, destination, trip, itinerary, weather
│   ├── middlewares/       # authMiddleware (JWT verify)
│   ├── models/            # User, Destination, Trip, ItineraryItem
│   ├── routes/            # auth, destinations, trips, itinerary, weather
│   ├── db/
│   │   ├── database.js    # SQLite connection (travelbuddy.db)
│   │   └── schemes/       # userScheme, destinationScheme, tripScheme, itineraryScheme, migrateDateRangeAndBudget
│   ├── config.js          # SECRET_KEY, OPENWEATHER_API_KEY
│   ├── server.js          # Express app, route mounting, CORS
│   └── package.json
└── README.md
```

## Installation & Run Guide (Step-by-step)

### Prerequisites

- **Node.js** (v16 or later) and **npm**.

### 1. Backend

```bash
cd server
npm install
```

Create the database and tables (run from `server`):

```bash
node db/schemes/userScheme.js
node db/schemes/destinationScheme.js
node db/schemes/tripScheme.js
node db/schemes/itineraryScheme.js
```

Optional (for date range and budget features):

```bash
node db/schemes/migrateDateRangeAndBudget.js
```

Start the server:

```bash
npm start
```

- Server runs at **http://localhost:3001** (nodemon).
- Database file: `server/travelbuddy.db` (created when schemes run).

### 2. Frontend

```bash
cd client
npm install
npm start
```

- App runs at **http://localhost:3000** (or next free port).

### 3. Environment / config

- No `.env` is required. Backend uses `server/config.js` for:
  - `SECRET_KEY` — JWT signing.
  - `OPENWEATHER_API_KEY` — used by `GET /api/weather` (required for weather on destination cards).

## Database

- **Engine**: SQLite; single file `travelbuddy.db` in the `server` directory.
- **Initialization**: Run each scheme file under `server/db/schemes/` once (and the migration if you use budgets and date ranges).

| Table             | Purpose |
|------------------|---------|
| **users**        | `id`, `username` (unique), `password` (bcrypt hash). |
| **destinations** | `id`, `name`, `country`, `description`. After migration: `daily_budget_bam` (REAL, optional). |
| **trips**        | `id`, `user_id`, `destination_id`, `trip_date` (legacy). After migration: `start_date`, `end_date` (TEXT), `notes` (TEXT), `total_budget_bam` (REAL). FKs to users and destinations. |
| **itinerary_items** | `id`, `trip_id`, `day_number`, `activity`, `note`. FK to trips. |

Budgets and dates: each destination can have a `daily_budget_bam`. For each trip the server computes days = (end_date − start_date) + 1 and total_budget_bam = daily_budget_bam × days and stores `total_budget_bam` in the trips table.

## API Overview

Base URL: `http://localhost:3001/api`. All protected routes expect header: `Authorization: <JWT>`.

| Method | Route | Auth | Description |
|--------|--------|------|-------------|
| POST   | `/auth/register` | No  | Register; body: `username`, `password`. Returns user + token. |
| POST   | `/auth/login`    | No  | Login; body: `username`, `password`. Returns `{ user }` (includes token). |
| POST   | `/auth/verify-token` | Yes | Validates token; returns `{ message, token }`. |
| GET    | `/destinations`  | Yes | List all destinations. |
| GET    | `/destinations/:id` | Yes | One destination. |
| POST   | `/destinations`  | Yes | Create; body: `name`, `country`, `description`, optional `daily_budget_bam`. |
| PUT    | `/destinations/:id` | Yes | Update same fields. |
| DELETE | `/destinations/:id` | Yes | Delete destination. |
| GET    | `/trips`         | Yes | List current user’s trips (with destination_name, daily_budget_bam). |
| POST   | `/trips`         | Yes | Create; body: `destinationId`, `start_date`, `end_date`, `notes`. Server computes total_budget_bam. |
| PUT    | `/trips/:id`     | Yes | Update (same body); only if trip belongs to user. |
| DELETE | `/trips/:id`     | Yes | Delete trip; only if belongs to user. |
| GET    | `/itinerary/:tripId` | Yes | List itinerary items for trip. |
| POST   | `/itinerary`     | Yes | Create item; body: `tripId`, `day_number`, `activity`, `note`. |
| PUT    | `/itinerary/:id` | Yes | Update item. |
| DELETE | `/itinerary/:id` | Yes | Delete item. |
| GET    | `/weather?city=...&country=...` | No | Current weather (OpenWeather); returns `{ city, tempC, description }`. |

Swagger UI: **http://localhost:3001/api/docs**.

## Authentication

- **Register**: `POST /api/auth/register` with `username` and `password`. Passwords are hashed with bcrypt; server returns user and JWT.
- **Login**: `POST /api/auth/login` with `username` and `password`. On success the server returns `{ user }` (including `token`). The client stores the token in a cookie named `authData` and sets auth state.
- **Token usage**: For protected API calls the client sends `Authorization: <token>`. On initial load, `App.js` calls `POST /api/auth/verify-token` with that header; if valid, the app treats the user as logged in; otherwise it redirects to login.
- **Protected routes**: Destinations, trips, and itinerary endpoints use `authenticateToken`; trips and itinerary are scoped by `req.user.id` (delete/update only for the owner).

## External Services / APIs

- **OpenStreetMap (OSM)** — Tiles for the Maps page: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`. No API key.
- **Nominatim** — Geocoding for Maps: `https://nominatim.openstreetmap.org/search?format=json&q=<query>`. The frontend uses the first result’s `lat`/`lon` and caches by destination in component state. A custom User-Agent is sent (e.g. `TravelBuddy/1.0`).
- **OpenWeather** — Current weather: backend calls `api.openweathermap.org/data/2.5/weather` with `OPENWEATHER_API_KEY` from `config.js`. Used by the destination cards on the Destinations list page. No auth required for the app’s `/api/weather` endpoint.

## How the System Works (Data Flow)

1. **Add destination** — User submits form (name, country, description, optional daily_budget_bam). Frontend POSTs to `/api/destinations`; backend inserts into `destinations` and returns the created row.
2. **Create trip** — User selects destination and enters start_date, end_date, notes. Frontend shows computed days and estimated total (daily_budget_bam × days). On submit, POST `/api/trips` sends destinationId, start_date, end_date, notes. Backend validates dates (start ≥ today, end ≥ start), loads destination’s daily_budget_bam, computes days and total_budget_bam, and inserts into `trips`.
3. **Edit/delete trip** — Table row has Edit (inline form) or Delete. Edit sends PUT with destinationId, start_date, end_date, notes; backend recalculates total and updates only if the trip belongs to `req.user.id`. Delete calls DELETE and checks ownership the same way.
4. **Maps** — User selects a destination from a dropdown. If coordinates are not in cache, frontend requests Nominatim with destination name (and country). On success it caches lat/lon, centers the map, and shows a marker with a popup (name + daily budget BAM/day if present). Errors (e.g. no result) show a message; loading state is shown while fetching.

## Tutorial Section (Developer Guide)

### Add a new page and route

1. Create a component under `client/src/pages/`, e.g. `client/src/pages/example/Example.js`.
2. In `client/src/routes/routesList.js`, import it and add a route, e.g. `<Route path="example" element={<Example />} />`.
3. Optionally add a link in `client/src/components/header/Header.js` (e.g. next to Destinations / Trips / Maps when `auth` is true).

### Add a new field to Destination or Trip

1. **Database**: Add the column (e.g. new migration in `server/db/schemes/` with `ALTER TABLE ... ADD COLUMN ...`), then run it.
2. **Backend model**: In the corresponding model (e.g. `destinationModel.js` or `tripModel.js`), include the new field in `create`/`update` and in any SELECTs that should return it.
3. **Backend controller**: Ensure the controller passes the new field from `req.body` to the model (no change if you already pass the whole body or a spread).
4. **Frontend**: Add an input in the add/edit form, add the field to component state, and include it in the JSON body of the POST/PUT request. Update any list/detail view to display the new field.

### Add a new API route

1. **Model** (if new entity): Create `server/models/<name>Model.js` with DB access (e.g. `getAll`, `getById`, `create`).
2. **Controller**: Create `server/controllers/<name>Controller.js` with handlers that call the model and send `res.json()` or error statuses.
3. **Route**: Create `server/routes/<name>.js` with `express.Router()`, attach handlers (and `authenticateToken` if needed), then in `server/server.js` require the router and use `app.use('/api/<path>', <router>)`.

## Future Improvements

- **Favorites** — Allow users to mark destinations or trips as favorites and filter by them.
- **Packing list** — Per-trip checklist (e.g. stored in DB or linked to itinerary).
- **Currency converter** — Convert BAM to other currencies for display using a public API.
- **Photo uploads** — Attach images to destinations or trips (storage + thumbnails).
- **Itinerary UI** — Dedicated itinerary editor/list page linked from the trip row.
- **Offline / PWA** — Service worker and caching for limited offline use.
- **Environment variables** — Move `SECRET_KEY` and `OPENWEATHER_API_KEY` to `.env` and load with `dotenv`.

## Author

TravelBuddy is a student project developed for educational purposes. The codebase demonstrates a full-stack React + Express application with authentication, CRUD, external APIs, and an interactive map.
