const WEATHER_INFO = {
  0: { description: "Clear sky", icon: "\u2600\ufe0f" },
  1: { description: "Mainly clear", icon: "\ud83c\udf24\ufe0f" },
  2: { description: "Partly cloudy", icon: "\u26c5" },
  3: { description: "Overcast", icon: "\u2601\ufe0f" },
  45: { description: "Foggy", icon: "\ud83c\udf2b\ufe0f" },
  48: { description: "Icy fog", icon: "\ud83c\udf2b\ufe0f" },
  51: { description: "Light drizzle", icon: "\ud83c\udf26\ufe0f" },
  53: { description: "Drizzle", icon: "\ud83c\udf26\ufe0f" },
  55: { description: "Heavy drizzle", icon: "\ud83c\udf26\ufe0f" },
  61: { description: "Light rain", icon: "\ud83c\udf27\ufe0f" },
  63: { description: "Rain", icon: "\ud83c\udf27\ufe0f" },
  65: { description: "Heavy rain", icon: "\ud83c\udf27\ufe0f" },
  66: { description: "Freezing rain", icon: "\ud83c\udf27\ufe0f" },
  67: { description: "Heavy freezing rain", icon: "\ud83c\udf27\ufe0f" },
  71: { description: "Light snow", icon: "\ud83c\udf28\ufe0f" },
  73: { description: "Snow", icon: "\ud83c\udf28\ufe0f" },
  75: { description: "Heavy snow", icon: "\ud83c\udf28\ufe0f" },
  77: { description: "Snow grains", icon: "\ud83c\udf28\ufe0f" },
  80: { description: "Light showers", icon: "\ud83c\udf26\ufe0f" },
  81: { description: "Showers", icon: "\ud83c\udf27\ufe0f" },
  82: { description: "Heavy showers", icon: "\ud83c\udf27\ufe0f" },
  85: { description: "Light snow showers", icon: "\ud83c\udf28\ufe0f" },
  86: { description: "Heavy snow showers", icon: "\ud83c\udf28\ufe0f" },
  95: { description: "Thunderstorm", icon: "\u26c8\ufe0f" },
  96: { description: "Thunderstorm w/ hail", icon: "\u26c8\ufe0f" },
  99: { description: "Thunderstorm w/ heavy hail", icon: "\u26c8\ufe0f" },
};

function getWeatherInfo(code) {
  return WEATHER_INFO[code] || { description: "Unknown", icon: "\u2753" };
}

function getDayName(dateStr, index) {
  if (index === 0) return "Today";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatHour(timeStr) {
  const date = new Date(timeStr);
  return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
}

function uvLabel(uv) {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}

function uvColor(uv) {
  if (uv < 3) return "text-green-400";
  if (uv < 6) return "text-yellow-400";
  if (uv < 8) return "text-orange-400";
  if (uv < 11) return "text-red-400";
  return "text-purple-400";
}

export function renderLoading(container) {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      <p class="text-slate-400">Getting your location...</p>
    </div>
  `;
}

export function renderError(container, message) {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div class="text-5xl">\u26a0\ufe0f</div>
      <p class="text-red-400 text-lg">${message}</p>
      <div class="flex gap-3 mt-4">
        <button
          onclick="location.reload()"
          class="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
        >
          Try Again
        </button>
        <button
          onclick="window.__showLocationSearch()"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
        >
          Search Location
        </button>
      </div>
    </div>
  `;
}

export function renderLocationSearch(container) {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div class="text-center">
        <div class="text-5xl mb-3">\ud83d\udccd</div>
        <h1 class="text-xl font-medium mb-1">Search Location</h1>
        <p class="text-sm text-slate-400">Enter a city name to get the forecast</p>
      </div>
      <form id="search-form" class="w-full max-w-sm">
        <div class="flex gap-2">
          <input
            id="search-input"
            type="text"
            placeholder="e.g. Austin, TX"
            autocomplete="off"
            class="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none text-white placeholder-slate-500"
          />
          <button
            type="submit"
            class="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>
      <div id="search-results" class="w-full max-w-sm"></div>
      <div id="search-error" class="text-red-400 text-sm hidden"></div>
    </div>
  `;
}

export function renderSearchResults(results) {
  const resultsEl = document.getElementById("search-results");
  const errorEl = document.getElementById("search-error");
  errorEl.classList.add("hidden");

  resultsEl.innerHTML = results
    .map((r, i) => {
      const label = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
      return `
        <button
          onclick="window.__selectLocation(${i})"
          class="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors cursor-pointer ${i < results.length - 1 ? "border-b border-white/10" : ""}"
        >
          <span class="text-white">${r.name}</span>
          ${r.admin1 || r.country ? `<span class="text-slate-400 text-sm ml-1">${[r.admin1, r.country].filter(Boolean).join(", ")}</span>` : ""}
        </button>
      `;
    })
    .join("");
}

export function renderSearchError(message) {
  const resultsEl = document.getElementById("search-results");
  const errorEl = document.getElementById("search-error");
  resultsEl.innerHTML = "";
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

export function renderWeather(container, weather, locationName) {
  const current = weather.current;
  const currentInfo = getWeatherInfo(current.weatherCode);

  const hourlyHTML = weather.hourly
    .map((hour, i) => {
      const info = getWeatherInfo(hour.weatherCode);
      return `
        <div class="flex flex-col items-center gap-1.5 min-w-[4rem] text-center">
          <span class="text-xs text-slate-400">${i === 0 ? "Now" : formatHour(hour.time)}</span>
          <span class="text-xl">${info.icon}</span>
          <span class="text-sm font-medium">${hour.temperature}\u00b0</span>
          <span class="text-xs text-slate-400">${hour.precipChance}%</span>
          <span class="text-xs ${uvColor(hour.uvIndex)}">${hour.uvIndex}</span>
        </div>
      `;
    })
    .join("");

  const forecastHTML = weather.daily
    .map((day, i) => {
      const info = getWeatherInfo(day.weatherCode);
      return `
        <div class="flex items-center justify-between py-3 ${i < weather.daily.length - 1 ? "border-b border-white/10" : ""}">
          <span class="w-16 text-sm text-slate-300">${getDayName(day.date, i)}</span>
          <span class="text-2xl w-10 text-center">${info.icon}</span>
          <span class="text-sm text-slate-400 w-12 text-center">${day.precipChance}%</span>
          <span class="text-sm ${uvColor(day.uvIndexMax)} w-10 text-center">${day.uvIndexMax}</span>
          <div class="flex gap-3 w-24 justify-end">
            <span class="font-medium">${day.high}\u00b0</span>
            <span class="text-slate-400">${day.low}\u00b0</span>
          </div>
        </div>
      `;
    })
    .join("");

  const locationDisplay = locationName || "Your Location";

  container.innerHTML = `
    <div class="flex justify-end mb-2">
      <button onclick="window.__showLocationSearch()" class="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Change location</button>
    </div>
    <header class="text-center mb-8">
      <h1 class="text-lg text-slate-400 mb-1">${locationDisplay}</h1>
      <div class="text-7xl mb-2">${currentInfo.icon}</div>
      <div class="text-6xl font-light mb-1">${current.temperature}\u00b0F</div>
      <p class="text-slate-300 text-lg">${currentInfo.description}</p>
      <p class="text-sm text-slate-400 mt-1">Feels like ${current.feelsLike}\u00b0</p>
    </header>

    <div class="grid grid-cols-3 gap-3 mb-8">
      <div class="bg-white/5 rounded-xl p-4 text-center">
        <p class="text-xs text-slate-400 uppercase tracking-wide mb-1">Wind</p>
        <p class="text-xl font-medium">${current.windSpeed} <span class="text-sm text-slate-400">mph</span></p>
      </div>
      <div class="bg-white/5 rounded-xl p-4 text-center">
        <p class="text-xs text-slate-400 uppercase tracking-wide mb-1">Humidity</p>
        <p class="text-xl font-medium">${current.humidity}<span class="text-sm text-slate-400">%</span></p>
      </div>
      <div class="bg-white/5 rounded-xl p-4 text-center">
        <p class="text-xs text-slate-400 uppercase tracking-wide mb-1">UV Index</p>
        <p class="text-xl font-medium ${uvColor(current.uvIndex)}">${current.uvIndex}</p>
        <p class="text-xs text-slate-400 mt-0.5">${uvLabel(current.uvIndex)}</p>
      </div>
    </div>

    <section class="bg-white/5 rounded-xl p-4 mb-4">
      <h2 class="text-sm text-slate-400 uppercase tracking-wide mb-3">Hourly Forecast</h2>
      <div class="overflow-x-auto -mx-4 px-4">
        <div class="flex gap-4 pb-2" style="min-width: max-content">
          ${hourlyHTML}
        </div>
      </div>
    </section>

    <section class="bg-white/5 rounded-xl p-4">
      <h2 class="text-sm text-slate-400 uppercase tracking-wide mb-3">7-Day Forecast</h2>
      ${forecastHTML}
    </section>

    <footer class="text-center mt-6 text-xs text-slate-500">
      Data from <a href="https://open-meteo.com/" class="underline hover:text-slate-400" target="_blank" rel="noopener">Open-Meteo</a>
    </footer>
  `;
}
