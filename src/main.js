import "./style.css";
import { getLocation, geocode } from "./location.js";
import { getWeather } from "./weather.js";
import {
  renderLoading,
  renderError,
  renderWeather,
  renderLocationSearch,
  renderSearchResults,
  renderSearchError,
} from "./ui.js";

const LOCATION_KEY = "weather-location";
const LAST_FETCH_KEY = "weather-last-fetch";
const INSTALL_DISMISSED_KEY = "weather-install-dismissed";
const STALE_MS = 60 * 60 * 1000; // 1 hour
const app = document.getElementById("app");
let lastResults = [];
let deferredInstallPrompt = null;

function showInstallBanner() {
  if (document.getElementById("install-banner")) return;
  const banner = document.createElement("div");
  banner.id = "install-banner";
  banner.className =
    "fixed bottom-4 left-4 right-4 max-w-lg mx-auto bg-blue-600 rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-lg z-50";
  banner.innerHTML = `
    <span class="text-sm font-medium">Install Weather for quick access</span>
    <div class="flex gap-2 shrink-0">
      <button onclick="window.__dismissInstall()" class="px-3 py-1 text-sm text-white/70 hover:text-white transition-colors cursor-pointer">Dismiss</button>
      <button onclick="window.__installApp()" class="px-3 py-1 text-sm bg-white text-blue-600 font-medium rounded-lg hover:bg-white/90 transition-colors cursor-pointer">Install</button>
    </div>
  `;
  document.body.appendChild(banner);
}

window.__installApp = async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  document.getElementById("install-banner")?.remove();
  if (outcome === "accepted") {
    try { localStorage.setItem(INSTALL_DISMISSED_KEY, "1"); } catch {}
  }
};

window.__dismissInstall = () => {
  document.getElementById("install-banner")?.remove();
  try { localStorage.setItem(INSTALL_DISMISSED_KEY, "1"); } catch {}
};

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  try {
    if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;
  } catch {}
  showInstallBanner();
});

function saveLocation(latitude, longitude) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify({ latitude, longitude }));
  } catch {}
}

function loadLocation() {
  try {
    const stored = localStorage.getItem(LOCATION_KEY);
    if (!stored) return null;
    const { latitude, longitude } = JSON.parse(stored);
    if (typeof latitude === "number" && typeof longitude === "number") {
      return { latitude, longitude };
    }
  } catch {}
  return null;
}

async function fetchAndRender(latitude, longitude, locationName) {
  renderLoading(app);
  try {
    const weather = await getWeather(latitude, longitude);
    renderWeather(app, weather, locationName);
    try {
      localStorage.setItem(LAST_FETCH_KEY, JSON.stringify({
        time: Date.now(),
        latitude,
        longitude,
        locationName: locationName || null,
      }));
    } catch {}
  } catch (error) {
    renderError(app, error.message);
  }
}

function isDataStale() {
  try {
    const stored = localStorage.getItem(LAST_FETCH_KEY);
    if (!stored) return false;
    const { time } = JSON.parse(stored);
    return Date.now() - time >= STALE_MS;
  } catch {}
  return false;
}

function autoRefresh() {
  if (!isDataStale()) return;
  try {
    const stored = localStorage.getItem(LAST_FETCH_KEY);
    if (!stored) return;
    const { latitude, longitude, locationName } = JSON.parse(stored);
    fetchAndRender(latitude, longitude, locationName);
  } catch {}
}

function showLocationSearch() {
  renderLocationSearch(app);

  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    try {
      lastResults = await geocode(query);
      renderSearchResults(lastResults);
    } catch (error) {
      renderSearchError(error.message);
    }
  });

  input.focus();
}

window.__showLocationSearch = showLocationSearch;

window.__selectLocation = (index) => {
  const result = lastResults[index];
  if (!result) return;
  const name = [result.name, result.admin1, result.country]
    .filter(Boolean)
    .join(", ");
  saveLocation(result.latitude, result.longitude);
  fetchAndRender(result.latitude, result.longitude, name);
};

async function init() {
  renderLoading(app);

  try {
    const { latitude, longitude } = await getLocation();
    saveLocation(latitude, longitude);
    await fetchAndRender(latitude, longitude);
  } catch {
    const cached = loadLocation();
    if (cached) {
      fetchAndRender(cached.latitude, cached.longitude);
    } else {
      showLocationSearch();
    }
  }
}

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") autoRefresh();
});

init();
