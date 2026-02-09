# Weather PWA

A weather forecast progressive web app served as static files. Uses the browser's Geolocation API with a manual search fallback, and fetches data from [Open-Meteo](https://open-meteo.com/) (free, no API key).

## Features

- Current conditions: temperature, feels like, wind, humidity, UV index
- 24-hour hourly forecast with temp, rain chance, and UV index
- 7-day daily forecast with highs/lows, precipitation, and UV
- Auto-detects location via browser geolocation
- Manual city search fallback (Open-Meteo Geocoding API)
- Installable PWA with offline support via service worker
- Responsive, mobile-first design

## Tech Stack

- **Vanilla JS** — no framework
- **Vite** — dev server and production build
- **Tailwind CSS v4** — styling via `@tailwindcss/vite` plugin

## Getting Started

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Outputs static files to `dist/`. Upload the contents to an S3 bucket configured for static website hosting.

## Project Structure

```
index.html              Entry point
src/
  main.js               App entry — orchestrates location, weather, and UI
  location.js           Geolocation API wrapper + Open-Meteo geocoding
  weather.js            Open-Meteo forecast API client
  ui.js                 DOM rendering (loading, error, search, weather views)
  style.css             Tailwind CSS import
public/
  manifest.json         PWA web app manifest
  sw.js                 Service worker (cache-first static, network-first API)
  favicon.svg           SVG favicon
  icon-192.png          PWA icon 192x192
  icon-512.png          PWA icon 512x512
```

## APIs

All external APIs are free and require no keys:

- **Forecast**: `https://api.open-meteo.com/v1/forecast` — current weather, hourly, and daily data
- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search` — city name to coordinates

Weather codes follow the [WMO standard](https://open-meteo.com/en/docs) and are mapped to descriptions and emoji icons in `src/ui.js`.
