# CLAUDE.md

## Build & Dev

- `npm run dev` — start Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build locally

## Architecture

This is a vanilla JS app with no framework. All rendering is done via `innerHTML` template literals in `src/ui.js`. There is no virtual DOM or component system.

### Module Responsibilities

- **`src/main.js`** — App entry point. Orchestrates the flow: try geolocation → on failure show search → fetch weather → render. Exposes `window.__showLocationSearch` and `window.__selectLocation` for inline `onclick` handlers in the HTML templates.
- **`src/location.js`** — Two exports: `getLocation()` wraps the browser Geolocation API in a Promise. `geocode(query)` hits the Open-Meteo Geocoding API. Note: the geocoding `name` param only accepts city names, so commas and everything after are stripped before the request.
- **`src/weather.js`** — Single export: `getWeather(lat, lon)` fetches from Open-Meteo Forecast API. Returns normalized `{ current, hourly, daily }` data. Hourly data is sliced to 24 hours starting from the current hour. Units: Fahrenheit, mph.
- **`src/ui.js`** — Pure rendering functions that write to a container's `innerHTML`. Exports: `renderLoading`, `renderError`, `renderLocationSearch`, `renderSearchResults`, `renderSearchError`, `renderWeather`. The `WEATHER_INFO` map translates WMO weather codes to descriptions and emoji icons. UV helpers (`uvLabel`, `uvColor`) provide color-coded display.

### Key Patterns

- All UI interaction uses inline `onclick` handlers that call functions on `window` (e.g., `window.__showLocationSearch()`). This is because `innerHTML` replaces DOM nodes, so event listeners can't be attached before render.
- The search flow stores results in a module-level `lastResults` array, and `window.__selectLocation(index)` references into it by index.
- The service worker (`public/sw.js`) uses cache-first for static assets and network-first for API calls (with cache fallback for offline).

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin. No `tailwind.config.js` needed — Tailwind v4 uses CSS-based configuration. The single CSS file is just `@import "tailwindcss"`.

## External APIs

Both APIs are free with no authentication:

- **Forecast**: `https://api.open-meteo.com/v1/forecast` — [docs](https://open-meteo.com/en/docs)
- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search` — [docs](https://open-meteo.com/en/docs/geocoding-api)

The geocoding API's `name` parameter only accepts city names (not "city, state" format). The `geocode()` function strips everything after the first comma.
