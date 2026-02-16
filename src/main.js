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
const app = document.getElementById("app");
let lastResults = [];

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
  } catch (error) {
    renderError(app, error.message);
  }
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
    const weather = await getWeather(latitude, longitude);
    renderWeather(app, weather);
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

init();
