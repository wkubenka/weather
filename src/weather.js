const API_BASE = "https://api.open-meteo.com/v1/forecast";

export async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,uv_index",
    hourly: "temperature_2m,precipitation_probability,uv_index,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: "auto",
    forecast_days: "7",
  });

  const response = await fetch(`${API_BASE}?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch weather data. Please try again.");
  }

  const data = await response.json();

  // Find the index of the current hour to slice hourly data from now forward
  const now = new Date();
  const currentHourIndex = data.hourly.time.findIndex((t) => new Date(t) >= now);
  const hourlyStart = currentHourIndex >= 0 ? currentHourIndex : 0;
  const hourlySlice = data.hourly.time.slice(hourlyStart, hourlyStart + 24);

  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      weatherCode: data.current.weather_code,
      windSpeed: Math.round(data.current.wind_speed_10m),
      humidity: data.current.relative_humidity_2m,
      uvIndex: Math.round(data.current.uv_index * 10) / 10,
    },
    hourly: hourlySlice.map((time, i) => ({
      time,
      temperature: Math.round(data.hourly.temperature_2m[hourlyStart + i]),
      precipChance: data.hourly.precipitation_probability[hourlyStart + i],
      uvIndex: Math.round(data.hourly.uv_index[hourlyStart + i] * 10) / 10,
      weatherCode: data.hourly.weather_code[hourlyStart + i],
    })),
    daily: data.daily.time.map((date, i) => ({
      date,
      weatherCode: data.daily.weather_code[i],
      high: Math.round(data.daily.temperature_2m_max[i]),
      low: Math.round(data.daily.temperature_2m_min[i]),
      precipChance: data.daily.precipitation_probability_max[i],
      uvIndexMax: Math.round(data.daily.uv_index_max[i] * 10) / 10,
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i],
    })),
    timezone: data.timezone,
  };
}
