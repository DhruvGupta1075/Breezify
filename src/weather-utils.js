/* ==========================================================================
   Breezify Meteorological Utilities & Data Helpers
   ========================================================================== */

// --- WMO Weather Code Mapping (0-99) ---
function getWMOCondition(code, isDay = 1) {
  const map = {
    0: { text: "Clear Sky", iconClass: isDay ? "fa-sun" : "fa-moon", color: "#ffd43b" },
    1: { text: "Mainly Clear", iconClass: isDay ? "fa-sun" : "fa-moon", color: "#ffd43b" },
    2: { text: "Partly Cloudy", iconClass: isDay ? "fa-cloud-sun" : "fa-cloud-moon", color: "#a7abae" },
    3: { text: "Overcast", iconClass: "fa-cloud", color: "#94a3b8" },
    45: { text: "Fog", iconClass: "fa-smog", color: "#cbd5e1" },
    48: { text: "Depositing Rime Fog", iconClass: "fa-smog", color: "#cbd5e1" },
    51: { text: "Light Drizzle", iconClass: "fa-cloud-rain", color: "#38bdf8" },
    53: { text: "Moderate Drizzle", iconClass: "fa-cloud-rain", color: "#38bdf8" },
    55: { text: "Dense Drizzle", iconClass: "fa-cloud-rain", color: "#0284c7" },
    56: { text: "Freezing Drizzle", iconClass: "fa-snowflake", color: "#38bdf8" },
    57: { text: "Dense Freezing Drizzle", iconClass: "fa-snowflake", color: "#0284c7" },
    61: { text: "Slight Rain", iconClass: "fa-cloud-showers-heavy", color: "#38bdf8" },
    63: { text: "Moderate Rain", iconClass: "fa-cloud-showers-heavy", color: "#0284c7" },
    65: { text: "Heavy Rain", iconClass: "fa-cloud-showers-heavy", color: "#1d4ed8" },
    66: { text: "Freezing Rain", iconClass: "fa-snowflake", color: "#38bdf8" },
    67: { text: "Heavy Freezing Rain", iconClass: "fa-snowflake", color: "#1d4ed8" },
    71: { text: "Slight Snow", iconClass: "fa-snowflake", color: "#e2e8f0" },
    73: { text: "Moderate Snow", iconClass: "fa-snowflake", color: "#e2e8f0" },
    75: { text: "Heavy Snow", iconClass: "fa-snowflake", color: "#ffffff" },
    77: { text: "Snow Grains", iconClass: "fa-snowflake", color: "#e2e8f0" },
    80: { text: "Slight Rain Showers", iconClass: "fa-cloud-sun-rain", color: "#38bdf8" },
    81: { text: "Moderate Rain Showers", iconClass: "fa-cloud-sun-rain", color: "#0284c7" },
    82: { text: "Violent Rain Showers", iconClass: "fa-cloud-showers-water", color: "#1d4ed8" },
    85: { text: "Slight Snow Showers", iconClass: "fa-snowflake", color: "#e2e8f0" },
    86: { text: "Heavy Snow Showers", iconClass: "fa-snowflake", color: "#ffffff" },
    95: { text: "Thunderstorm", iconClass: "fa-bolt-lightning", color: "#f59e0b" },
    96: { text: "Thunderstorm with Hail", iconClass: "fa-bolt-lightning", color: "#f59e0b" },
    99: { text: "Thunderstorm with Heavy Hail", iconClass: "fa-bolt-lightning", color: "#ef4444" },
  };
  return map[code] || { text: "Cloudy", iconClass: "fa-cloud", color: "#a7abae" };
}

// --- Naive Time Parsing (Open-Meteo local station time strings) ---
function parseNaiveTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const timePart = timeStr.includes("T") ? timeStr.split("T")[1] : timeStr;
  const hour = parseInt(timePart.slice(0, 2), 10);
  const minute = parseInt(timePart.slice(3, 5), 10);

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  const formatted = `${hour12.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")} ${period}`;

  return {
    hour,
    minute,
    minutesFromMidnight: hour * 60 + minute,
    formatted,
  };
}

function parseNaiveDate(dateStr) {
  if (!dateStr) return "N/A";
  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(5, 7), 10);
  const day = parseInt(dateStr.slice(8, 10), 10);

  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getWindDirection(deg) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round((deg % 360) / 45) % 8];
}

function formatTemperature(celsius, isCelsiusUnit = true) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return "—";
  if (!isCelsiusUnit) {
    return `${((celsius * 9) / 5 + 32).toFixed(1)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
}

function buildGeocodingUrl(query, count = 6) {
  return `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=${count}&language=en&format=json`;
}
