/* ==========================================================================
   Breezify Weather Dashboard Controller
   Hybrid: WeatherAPI (current + hourly + search) + Open-Meteo (10-day + AQI)
   ========================================================================== */

let currentWeatherData = null;   // WeatherAPI format
let current10DayData   = null;   // Open-Meteo daily format
let currentAirQualityData = null; // Open-Meteo AQI format
let isCelsius = true;

// Helper to format with current unit
function formatTemp(celsius) {
  return formatTemperature(celsius, isCelsius);
}

// --- WeatherAPI condition code → approximate WMO code (for 3D scene) ---
function approxWMOFromWeatherAPI(code) {
  if ([1087, 1273, 1275, 1276, 1279, 1282].includes(code)) return 95; // Thunder
  if ([1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return 71; // Snow
  if ([1066].includes(code)) return 71; // Snow
  if ([1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(code)) return 61; // Rain
  if ([1063, 1072, 1150, 1153, 1168, 1171].includes(code)) return 51; // Drizzle
  if ([1030, 1135, 1147].includes(code)) return 45; // Fog
  if ([1006, 1009].includes(code)) return 3;  // Overcast
  if ([1003].includes(code)) return 2;         // Partly cloudy
  return 0;                                     // Clear
}

// --- WeatherAPI condition code → Font Awesome icon + color ---
function getWeatherAPICondition(code, isDay = 1) {
  // Thunder
  if ([1087, 1273, 1275, 1276, 1279, 1282].includes(code))
    return { iconClass: "fa-bolt-lightning", color: "#f59e0b" };
  // Snow
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1261, 1264].includes(code))
    return { iconClass: "fa-snowflake", color: "#e2e8f0" };
  // Rain / Drizzle
  if ([1063, 1072, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246, 1249, 1252].includes(code))
    return { iconClass: "fa-cloud-showers-heavy", color: "#38bdf8" };
  // Fog / Mist
  if ([1030, 1135, 1147].includes(code))
    return { iconClass: "fa-smog", color: "#cbd5e1" };
  // Overcast
  if ([1006, 1009].includes(code))
    return { iconClass: "fa-cloud", color: "#94a3b8" };
  // Partly cloudy
  if ([1003].includes(code))
    return { iconClass: isDay ? "fa-cloud-sun" : "fa-cloud-moon", color: "#a7abae" };
  // Clear / Sunny
  return { iconClass: isDay ? "fa-sun" : "fa-moon", color: "#ffd43b" };
}

// --- Parse WeatherAPI 12h time string ("06:12 AM") ---
function parseWeatherAPITime12h(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(" ");
  const [hoursStr, minutesStr] = parts[0].split(":");
  const period = parts[1];
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const formatted = `${hours.toString().padStart(2, "0")}:${minutesStr}`;
  return { formatted, minutesFromMidnight: hours * 60 + minutes };
}

// --- Parse WeatherAPI localtime string ("2026-08-16 13:08") ---
function parseWeatherAPILocalTime(localtime) {
  if (!localtime) return null;
  const timePart = localtime.split(" ")[1] || "00:00";
  const [h, m] = timePart.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const formatted = `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
  return { formatted, minutesFromMidnight: h * 60 + m };
}

// --- DOM Initialization ---
document.addEventListener("DOMContentLoaded", function () {
  if (typeof init3DParallax === "function") {
    init3DParallax();
  }

  // Temperature Unit Toggle
  const tempToggleBtn = document.getElementById("tempToggleBtn");
  if (tempToggleBtn) {
    tempToggleBtn.addEventListener("click", () => {
      isCelsius = !isCelsius;
      tempToggleBtn.textContent = isCelsius ? "°F" : "°C";
      renderAllWeatherData();
    });
  }

  initCarousel();
  initSearch();
  fetchNews();
  fetchWeather("Rajpura");
});

// --- Carousel Controller ---
function initCarousel() {
  const carousel = document.querySelector(".carousel");
  const arrowBtns = document.querySelectorAll(".wrapper i");
  const leftBtn = document.getElementById("left");
  const rightBtn = document.getElementById("right");
  const firstCardWidth = 190;

  let isDragging = false, startX, startScrollLeft;

  const dragStart = (e) => {
    isDragging = true;
    if (carousel) carousel.classList.add("dragging");
    startX = e.pageX;
    startScrollLeft = carousel ? carousel.scrollLeft : 0;
  };

  const dragging = (e) => {
    if (!isDragging || !carousel) return;
    carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
    toggleArrowVisibility();
  };

  const dragStop = () => {
    isDragging = false;
    if (carousel) carousel.classList.remove("dragging");
    toggleArrowVisibility();
  };

  const toggleArrowVisibility = () => {
    if (!carousel || !leftBtn || !rightBtn) return;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
    leftBtn.style.display = carousel.scrollLeft <= 1 ? "none" : "block";
    rightBtn.style.display = carousel.scrollLeft >= maxScrollLeft - 1 ? "none" : "block";
  };

  if (carousel) {
    carousel.addEventListener("mousedown", dragStart);
    carousel.addEventListener("mousemove", dragging);
    document.addEventListener("mouseup", dragStop);
    carousel.addEventListener("scroll", toggleArrowVisibility);
  }

  arrowBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (carousel) {
        carousel.scrollLeft += btn.id === "left" ? -firstCardWidth : firstCardWidth;
        toggleArrowVisibility();
      }
    });
  });

  toggleArrowVisibility();
}

// --- Search Box (WeatherAPI /api/search proxy) ---
function initSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const searchDropdown = document.getElementById("searchDropdown");
  let debounceTimer = null;

  async function fetchGeocodingSuggestions(query) {
    if (!query || query.length < 2) {
      if (searchDropdown) {
        searchDropdown.innerHTML = "";
        searchDropdown.classList.remove("show");
      }
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = await res.json();

      if (!searchDropdown) return;
      searchDropdown.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        searchDropdown.classList.remove("show");
        return;
      }

      data.forEach((loc) => {
        const item = document.createElement("div");
        item.classList.add("search-dropdown-item");
        const subText = [loc.region, loc.country].filter(Boolean).join(", ");
        item.innerHTML = `
          <div class="search-item-name">${loc.name}</div>
          <div class="search-item-sub">${subText || "Location"}</div>
        `;
        item.addEventListener("click", () => {
          searchInput.value = loc.name;
          searchDropdown.classList.remove("show");
          fetchWeatherByCoords(loc.lat, loc.lon);
        });
        searchDropdown.appendChild(item);
      });

      searchDropdown.classList.add("show");
    } catch (e) {
      console.error("Search suggestion error:", e);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchGeocodingSuggestions(query), 350);
    });

    searchInput.addEventListener("focus", () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) fetchGeocodingSuggestions(query);
    });

    searchInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter" && searchBtn) searchBtn.click();
    });
  }

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const city = searchInput.value.trim();
      if (searchDropdown) searchDropdown.classList.remove("show");
      if (city) fetchWeather(city);
      else alert("Please enter a city name.");
    });
  }

  document.addEventListener("click", (e) => {
    if (
      searchDropdown &&
      !searchDropdown.contains(e.target) &&
      e.target !== searchInput
    ) {
      searchDropdown.classList.remove("show");
    }
  });
}

// --- Main Fetch: by city name (via WeatherAPI proxy) ---
async function fetchWeather(query) {
  try {
    const res = await fetch(`/api/current?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Location not found: "${query}". Please try another city.`);
      return;
    }
    const data = await res.json();
    currentWeatherData = data;
    await fetchOpenMeteoData(data.location.lat, data.location.lon);
    renderAllWeatherData();
  } catch (error) {
    console.error("fetchWeather error:", error);
    alert("Failed to fetch weather data. Please try again.");
  }
}

// --- Fetch by coordinates (after search dropdown click) ---
async function fetchWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(`/api/current?q=${lat},${lon}`);
    if (!res.ok) return;
    const data = await res.json();
    currentWeatherData = data;
    await fetchOpenMeteoData(lat, lon);
    renderAllWeatherData();
  } catch (error) {
    console.error("fetchWeatherByCoords error:", error);
  }
}

// --- Open-Meteo: 10-day forecast + Air Quality ---
async function fetchOpenMeteoData(lat, lon) {
  const tenDayUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=10`;
  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5&timezone=auto`;

  const [tenDayRes, aqRes] = await Promise.all([
    fetch(tenDayUrl),
    fetch(aqUrl).catch(() => null),
  ]);

  if (tenDayRes.ok) {
    current10DayData = await tenDayRes.json();
  }
  currentAirQualityData = aqRes && aqRes.ok ? await aqRes.json() : null;
}

// --- Render Controller ---
function renderAllWeatherData() {
  if (!currentWeatherData) return;
  updateCurrentWeather();
  updateHighlights();
  updateHourlyForecast();
  update10DayForecast();
}

// 1. Current Weather Hero Section
function updateCurrentWeather() {
  const cur  = currentWeatherData.current;
  const loc  = currentWeatherData.location;
  const today = currentWeatherData.forecast.forecastday[0];

  // City Name
  const heroCityElem = document.getElementById("heroCityName");
  if (heroCityElem) {
    const parts = [loc.name, loc.region, loc.country].filter(Boolean);
    heroCityElem.innerText = parts.join(", ");
  }

  // Temperature Gauge
  const heroTempElem = document.getElementById("heroTemp");
  if (heroTempElem) heroTempElem.innerText = formatTemp(cur.temp_c);

  // Condition Text + 3D Scene Update
  const heroCondElem = document.getElementById("heroCondition");
  if (heroCondElem) {
    heroCondElem.innerText = cur.condition.text;
    if (typeof update3DWeatherScene === "function") {
      update3DWeatherScene(approxWMOFromWeatherAPI(cur.condition.code), cur.is_day);
    }
  }

  // Feels Like
  const feelsLikeElem = document.getElementById("heroFeelsLike");
  if (feelsLikeElem) feelsLikeElem.innerText = formatTemp(cur.feelslike_c);

  // Today High / Low
  const highLowElem = document.getElementById("heroHighLow");
  if (highLowElem && today) {
    highLowElem.innerText = `${formatTemp(today.day.maxtemp_c)} / ${formatTemp(today.day.mintemp_c)}`;
  }

  // Local Time
  const localTimeElem = document.getElementById("heroLocalTime");
  if (localTimeElem) {
    const timeObj = parseWeatherAPILocalTime(loc.localtime);
    if (timeObj) localTimeElem.innerText = timeObj.formatted;
  }
}

// 2. Instrument Panel
function updateHighlights() {
  const cur   = currentWeatherData.current;
  const today = currentWeatherData.forecast.forecastday[0];

  // 1. Wind
  const windSpeedElem = document.getElementById("windSpeed");
  if (windSpeedElem) windSpeedElem.innerHTML = `${cur.wind_kph} <span class="unit">km/h</span>`;

  const windDirDegreeElem = document.getElementById("windDirDegree");
  if (windDirDegreeElem) windDirDegreeElem.innerText = `${cur.wind_dir} · ${cur.wind_degree}°`;

  const needleElem = document.getElementById("compassNeedle");
  if (needleElem) needleElem.style.transform = `rotate(${cur.wind_degree}deg)`;

  // 2. UV Index
  const uvVal = cur.uv !== undefined ? cur.uv : 0;

  const uvValueElem = document.getElementById("uvValue");
  if (uvValueElem) uvValueElem.innerText = parseFloat(uvVal).toFixed(1);

  const uvStatusElem = document.getElementById("uvStatus");
  if (uvStatusElem) {
    uvStatusElem.innerText = uvVal > 7 ? "Very High" : uvVal > 5 ? "High" : uvVal > 2 ? "Moderate" : "Low";
  }

  const uvArcProgress = document.getElementById("uvArcProgress");
  if (uvArcProgress) {
    const uvRatio = Math.min(1, Math.max(0, uvVal / 11));
    uvArcProgress.style.strokeDashoffset = (188.5 * (1 - uvRatio)).toFixed(2);
    uvArcProgress.style.stroke =
      uvVal > 7 ? "#ef4444" : uvVal > 5 ? "#f97316" : uvVal > 2 ? "#f59e0b" : "#38bdf8";
  }

  // 3. Sunrise & Sunset (from WeatherAPI astro)
  const sunriseCard = document.querySelector("#Sunrise");
  if (sunriseCard && today?.astro) {
    const sunriseObj = parseWeatherAPITime12h(today.astro.sunrise);
    const sunsetObj  = parseWeatherAPITime12h(today.astro.sunset);

    if (sunriseObj && sunsetObj) {
      const startElem = sunriseCard.querySelector(".time-start");
      const endElem   = sunriseCard.querySelector(".time-end");
      if (startElem) startElem.innerText = sunriseObj.formatted;
      if (endElem)   endElem.innerText   = sunsetObj.formatted;

      const localTimeObj = parseWeatherAPILocalTime(currentWeatherData.location.localtime);
      if (localTimeObj) {
        updateSunPosition(sunriseObj, sunsetObj, localTimeObj.minutesFromMidnight);
      }
    }
  }

  // 4. Humidity
  const humidityValueElem = document.getElementById("humidityValue");
  if (humidityValueElem) humidityValueElem.innerHTML = `${cur.humidity} <span class="unit">%</span>`;

  const humidityStatusElem = document.getElementById("humidityStatus");
  if (humidityStatusElem) humidityStatusElem.innerText = cur.humidity > 70 ? "Humid" : "Normal";

  // 5. Pressure
  const pressureValueElem = document.getElementById("pressureValue");
  if (pressureValueElem) pressureValueElem.innerHTML = `${Math.round(cur.pressure_mb)} <span class="unit">hPa</span>`;

  const pressureStatusElem = document.getElementById("pressureStatus");
  if (pressureStatusElem) {
    pressureStatusElem.innerText = cur.pressure_mb < 1005 ? "Low" : cur.pressure_mb > 1020 ? "High" : "Normal";
  }

  // 6. Visibility
  const visValueElem = document.getElementById("visibilityValue");
  if (visValueElem) visValueElem.innerHTML = `${parseFloat(cur.vis_km).toFixed(1)} <span class="unit">km</span>`;

  const visStatusElem = document.getElementById("visibilityStatus");
  if (visStatusElem) visStatusElem.innerText = cur.vis_km < 5 ? "Poor" : "Good";

  // 7. Air Quality (Open-Meteo)
  const pm25 = currentAirQualityData?.current?.pm2_5;
  const aqValueElem  = document.getElementById("airQualityValue");
  const aqStatusElem = document.getElementById("airQualityStatus");

  if (aqValueElem && aqStatusElem) {
    if (pm25 !== undefined && pm25 !== null) {
      aqValueElem.innerText   = Math.round(pm25);
      aqStatusElem.innerText  = pm25 > 150 ? "Very Poor" : pm25 > 50 ? "Moderate" : "Good";
    } else {
      aqValueElem.innerText   = "N/A";
      aqStatusElem.innerText  = "Normal";
    }
  }

  // 8. Dew Point (WeatherAPI provides dewpoint_c)
  const dewVal = cur.dewpoint_c !== undefined ? cur.dewpoint_c
    : cur.temp_c - ((100 - cur.humidity) / 5);

  const dewPointValueElem  = document.getElementById("dewPointValue");
  if (dewPointValueElem) dewPointValueElem.innerHTML = formatTemp(dewVal);

  const dewPointStatusElem = document.getElementById("dewPointStatus");
  if (dewPointStatusElem) {
    dewPointStatusElem.innerText = dewVal > 20 ? "Muggy" : dewVal > 15 ? "Moist" : "Comfortable";
  }
}

// 3. SVG Sun Arc
function updateSunPosition(sunriseObj, sunsetObj, currentMinutes) {
  const sunDot = document.querySelector("#Sunrise .sun-dot");
  if (!sunDot) return;

  const sunriseMin = sunriseObj.minutesFromMidnight;
  const sunsetMin  = sunsetObj.minutesFromMidnight;

  let t = 0;
  if (currentMinutes <= sunriseMin)      t = 0.0;
  else if (currentMinutes >= sunsetMin)  t = 1.0;
  else t = (currentMinutes - sunriseMin) / (sunsetMin - sunriseMin);

  const cx = Math.pow(1 - t, 2) * 15 + 2 * (1 - t) * t * 90 + Math.pow(t, 2) * 165;
  const cy = Math.pow(1 - t, 2) * 70 + 2 * (1 - t) * t * 15 + Math.pow(t, 2) * 70;

  sunDot.setAttribute("cx", cx.toFixed(2));
  sunDot.setAttribute("cy", cy.toFixed(2));

  if (currentMinutes > sunsetMin || currentMinutes < sunriseMin) {
    sunDot.setAttribute("fill", "#94a3b8");
    sunDot.setAttribute("filter", "drop-shadow(0 0 6px #64748b)");
  } else {
    sunDot.setAttribute("fill", "#fbbf24");
    sunDot.setAttribute("filter", "drop-shadow(0 0 8px #fbbf24)");
  }
}

// 4. Hourly Forecast (WeatherAPI hourly)
function updateHourlyForecast() {
  const carousel = document.getElementById("hourlyCarousel");
  if (!carousel) return;
  carousel.innerHTML = "";

  // Collect all hours across forecast days
  const allHours = [];
  currentWeatherData.forecast.forecastday.forEach((day) => {
    allHours.push(...day.hour);
  });

  // Find current hour index using localtime "2026-08-16 13:00"
  const localtimeHour = currentWeatherData.location.localtime.slice(0, 13); // "2026-08-16 13"
  let startIdx = allHours.findIndex((h) => h.time.startsWith(localtimeHour));
  if (startIdx < 0) startIdx = 0;

  for (let i = 0; i < 24 && startIdx + i < allHours.length; i++) {
    const h = allHours[startIdx + i];
    const timeObj = parseWeatherAPILocalTime(h.time);
    const cond    = getWeatherAPICondition(h.condition.code, h.is_day);

    const card = document.createElement("li");
    card.classList.add("card");
    card.style.minWidth  = "180px";
    card.style.textAlign = "center";
    card.style.padding   = "20px 16px";

    card.innerHTML = `
      <div class="day" style="font-weight:600;font-size:15px;">${timeObj ? timeObj.formatted : "—"}</div>
      <div class="icon" style="margin:10px 0;font-size:32px;color:${cond.color};">
        <i class="fa-solid ${cond.iconClass}"></i>
      </div>
      <div class="temperature" style="font-size:22px;font-weight:700;color:#0284c7;">${formatTemp(h.temp_c)}</div>
      <div style="font-size:13px;color:#64748b;margin-top:6px;font-weight:500;">${h.condition.text}</div>
      <div style="font-size:12px;color:#0284c7;margin-top:6px;font-weight:600;background:rgba(56,189,248,0.1);padding:4px 8px;border-radius:12px;display:inline-block;">
        <i class="fa-solid fa-droplet"></i> ${h.chance_of_rain || 0}%
      </div>
    `;
    carousel.appendChild(card);
  }
}

// 5. 10-Day Forecast (Open-Meteo)
function update10DayForecast() {
  if (!current10DayData) return;
  const daily = current10DayData.daily;
  if (!daily || !daily.time) return;

  const tenDayList = document.getElementById("tenDayList");
  if (!tenDayList) return;
  tenDayList.innerHTML = "";

  for (let i = 0; i < daily.time.length; i++) {
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min ? daily.temperature_2m_min[i] : null;
    const code  = daily.weather_code[i];
    const cond  = getWMOCondition(code, 1);
    const dayName = parseNaiveDate(daily.time[i]);

    const row = document.createElement("div");
    row.classList.add("hour");
    row.innerHTML = `
      <div class="time" style="font-weight:600;font-size:16px;min-width:110px;">${dayName}</div>
      <div class="icon-temp" style="gap:12px;">
        <i class="fa-solid ${cond.iconClass} fa-xl" style="color:${cond.color};"></i>
      </div>
      <div class="condition" style="padding-left:20px;font-size:15px;">${cond.text}</div>
      <div class="temp" style="display:flex;align-items:center;gap:8px;">
        <span class="high-temp">${formatTemp(maxTemp)}</span>
        ${minTemp !== null ? `<span style="font-size:15px;color:#94a3b8;font-weight:500;">/ ${formatTemp(minTemp)}</span>` : ""}
      </div>
    `;
    tenDayList.appendChild(row);

    if (i < daily.time.length - 1) {
      const divider = document.createElement("div");
      divider.classList.add("divider");
      tenDayList.appendChild(divider);
    }
  }
}

// --- Live Google News RSS ---
async function fetchNews() {
  const newsContainer = document.getElementById("newsContainer");
  if (!newsContainer) return;

  const rssUrl = "https://news.google.com/rss/search?q=weather+india&hl=en-IN&gl=IN&ceid=IN:en";
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  const fallbackImages = [
    "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=640&q=80",
    "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=640&q=80",
    "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=640&q=80",
    "https://images.unsplash.com/photo-1561484930-998b6a7b22e8?w=640&q=80",
    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=640&q=80",
    "https://images.unsplash.com/photo-1580193769210-b8d1c049a7d9?w=640&q=80",
  ];

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("News RSS response error");
    const data = await res.json();

    if (!data.items || data.items.length === 0) return;

    newsContainer.innerHTML = "";
    const items = data.items.slice(0, 18);

    items.forEach((item, idx) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = item.description || "";
      const rawText = tempDiv.textContent || tempDiv.innerText || "";
      const excerpt = rawText.trim().slice(0, 140) + (rawText.length > 140 ? "..." : "");

      let imgUrl = item.thumbnail || item.enclosure?.link;
      if (!imgUrl || typeof imgUrl !== "string" || imgUrl.trim() === "" || imgUrl.includes("rss2json")) {
        imgUrl = fallbackImages[idx % fallbackImages.length];
      }

      const card = document.createElement("div");
      card.classList.add("news-card");
      card.innerHTML = `
        <img src="${imgUrl}" alt="${item.title}" class="card-image" onerror="this.onerror=null;this.src='${fallbackImages[idx % fallbackImages.length]}';">
        <div class="text-container">
          <h2 class="title"><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h2>
          <p class="summary">${excerpt || "Latest weather news and forecast updates."}</p>
        </div>
      `;
      newsContainer.appendChild(card);
    });
  } catch (error) {
    console.warn("News RSS fetch failed:", error);
  }
}

// --- News See More Toggle ---
function seeMore() {
  const div    = document.querySelector(".news-container");
  const seeBtn = document.getElementById("seeBtn");
  if (div && seeBtn) {
    const isExpanded = div.classList.contains("expanded");
    if (isExpanded) {
      div.classList.remove("expanded");
      div.style.maxHeight = "330px";
      seeBtn.innerHTML = 'See More <i class="fa-solid fa-caret-down"></i>';
    } else {
      div.classList.add("expanded");
      div.style.maxHeight = "5000px";
      seeBtn.innerHTML = 'See Less <i class="fa-solid fa-caret-up"></i>';
    }
  }
}
