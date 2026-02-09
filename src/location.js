const GEOCODE_API = "https://geocoding-api.open-meteo.com/v1/search";

export async function geocode(query) {
  // The API only accepts city names — strip state/country after commas
  const name = query.split(",")[0].trim();

  const params = new URLSearchParams({
    name,
    count: "5",
    language: "en",
    format: "json",
  });

  const response = await fetch(`${GEOCODE_API}?${params}`);

  if (!response.ok) {
    throw new Error("Failed to search for location. Please try again.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("No locations found. Try a different search.");
  }

  return data.results.map((r) => ({
    name: r.name,
    admin1: r.admin1 || "",
    country: r.country || "",
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission denied. Please allow location access and reload."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out. Please try again."));
            break;
          default:
            reject(new Error("An unknown error occurred getting your location."));
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}
