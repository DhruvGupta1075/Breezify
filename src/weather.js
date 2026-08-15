/* ==========================================================================
   Breezify Weather Dashboard Controller (Open-Meteo API Integration)
   ========================================================================== */

let currentWeatherData = null;
let currentAirQualityData = null;
let currentLocationInfo = null;
let isCelsius = true;

// Helper to format with current unit
function formatTemp(celsius) {
  return formatTemperature(celsius, isCelsius);
}

// --- DOM Initialization ---
document.addEventListener("DOMContentLoaded", function () {
  // Initialize 3D Parallax Mouse Tracking
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

  // Carousel Dragging & Scroll Logic (Hourly Weather)
  initCarousel();

  // Search input & geocoding dropdown
  initSearch();

  // Fetch Live Google News RSS
  fetchNews();

  // Initial load default city
  fetchWeather("Rajpura");
});

// --- Carousel Controller ---
function initCarousel() {
  const carousel = document.querySelector(".carousel");
  const arrowBtns = document.querySelectorAll(".wrapper i");
  const leftBtn = document.getElementById("left");
  const rightBtn = document.getElementById("right");
  const firstCardWidth = 190;

  let isDragging = false,
    startX,
    startScrollLeft;

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
    rightBtn.style.display =
      carousel.scrollLeft >= maxScrollLeft - 1 ? "none" : "block";
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
        carousel.scrollLeft +=
          btn.id === "left" ? -firstCardWidth : firstCardWidth;
        toggleArrowVisibility();
      }
    });
  });

  toggleArrowVisibility();
}

// --- Live Geocoding Search Box with Debounce & Dropdown ---
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
      const geoUrl = buildGeocodingUrl(query);
      const res = await fetch(geoUrl);
      if (!res.ok) return;
      const data = await res.json();

      if (!searchDropdown) return;
      searchDropdown.innerHTML = "";

      if (!data.results || data.results.length === 0) {
        searchDropdown.classList.remove("show");
        return;
      }

      data.results.forEach((loc) => {
        const item = document.createElement("div");
        item.classList.add("search-dropdown-item");

        const subText = [loc.admin1, loc.country].filter(Boolean).join(", ");

        item.innerHTML = `
          <div class="search-item-name">${loc.name}</div>
          <div class="search-item-sub">${subText || "Location"}</div>
        `;

        item.addEventListener("click", () => {
          searchInput.value = loc.name;
          searchDropdown.classList.remove("show");
          fetchWeatherByLocation(loc);
        });

        searchDropdown.appendChild(item);
      });

      searchDropdown.classList.add("show");
    } catch (e) {
      console.error("Geocoding suggestion error:", e);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchGeocodingSuggestions(query);
      }, 350);
    });

    searchInput.addEventListener("focus", () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        fetchGeocodingSuggestions(query);
      }
    });

    searchInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        if (searchBtn) searchBtn.click();
      }
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

  // Close dropdown on outside click
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

// --- Open-Meteo API Fetching & Controller ---
async function fetchWeatherByLocation(loc) {
  currentLocationInfo = loc;
  await fetchForecastAndRender(loc.latitude, loc.longitude);
}

async function fetchWeather(query) {
  try {
    const geoUrl = buildGeocodingUrl(query);
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error(`Geocoding Error: ${geoRes.status}`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      alert("Location not found. Please try another city.");
      return;
    }

    const loc = geoData.results[0];
    currentLocationInfo = loc;
    await fetchForecastAndRender(loc.latitude, loc.longitude);
  } catch (error) {
    console.error("Error fetching Open-Meteo weather data:", error);
    alert("Failed to fetch weather data. Please try again.");
  }
}

async function fetchForecastAndRender(lat, lon) {
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&hourly=temperature_2m,weather_code,precipitation_probability,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=10`;

  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5&timezone=auto`;

  const [forecastRes, aqRes] = await Promise.all([
    fetch(forecastUrl),
    fetch(aqUrl).catch(() => null),
  ]);

  if (!forecastRes.ok)
    throw new Error(`Forecast Error: ${forecastRes.status}`);

  currentWeatherData = await forecastRes.json();
  currentAirQualityData = aqRes && aqRes.ok ? await aqRes.json() : null;

  renderAllWeatherData();
}

// --- Render Controller ---
function renderAllWeatherData() {
  if (!currentWeatherData || !currentLocationInfo) return;

  updateCurrentWeather();
  updateHighlights();
  updateHourlyForecast();
  update10DayForecast();
}

// 1. Current Weather Banner & Hero Live Reading
function updateCurrentWeather() {
  if (!currentWeatherData || !currentLocationInfo) return;

  const cur = currentWeatherData.current;
  const daily = currentWeatherData.daily;

  // City Name Title
  const heroCityElem = document.getElementById("heroCityName");
  if (heroCityElem) {
    const locParts = [currentLocationInfo.name, currentLocationInfo.admin1, currentLocationInfo.country].filter(Boolean);
    heroCityElem.innerText = locParts.join(", ");
  }

  // Left Circular Gauge Ring
  const heroTempElem = document.getElementById("heroTemp");
  if (heroTempElem) {
    heroTempElem.innerText = formatTemp(cur.temperature_2m);
  }

  const heroCondElem = document.getElementById("heroCondition");
  if (heroCondElem) {
    const cond = getWMOCondition(cur.weather_code, cur.is_day);
    heroCondElem.innerText = cond.text;
    if (typeof update3DWeatherScene === "function") {
      update3DWeatherScene(cur.weather_code, cur.is_day);
    }
  }

  // Right Summary Stats
  const feelsLikeElem = document.getElementById("heroFeelsLike");
  if (feelsLikeElem) {
    feelsLikeElem.innerText = formatTemp(cur.apparent_temperature);
  }

  const highLowElem = document.getElementById("heroHighLow");
  if (highLowElem && daily.temperature_2m_max && daily.temperature_2m_min) {
    const maxT = formatTemp(daily.temperature_2m_max[0]);
    const minT = formatTemp(daily.temperature_2m_min[0]);
    highLowElem.innerText = `${maxT} / ${minT}`;
  }

  const localTimeElem = document.getElementById("heroLocalTime");
  if (localTimeElem && cur.time) {
    const timeObj = parseNaiveTime(cur.time);
    if (timeObj) localTimeElem.innerText = timeObj.formatted;
  }
}

// 2. Instrument Panel Highlights Panel
function updateHighlights() {
  const cur = currentWeatherData.current;
  const daily = currentWeatherData.daily;
  const hourly = currentWeatherData.hourly;

  const currentStationTimeStr = cur.time;
  const currentHourIdx = Math.max(
    0,
    hourly.time.findIndex((t) => t.startsWith(currentStationTimeStr.slice(0, 13)))
  );

  // 1. Wind Card & Compass Needle
  const windSpeedElem = document.getElementById("windSpeed");
  if (windSpeedElem) {
    windSpeedElem.innerHTML = `${cur.wind_speed_10m} <span class="unit">km/h</span>`;
  }
  const windDirDegreeElem = document.getElementById("windDirDegree");
  if (windDirDegreeElem) {
    const dirCard = getWindDirection(cur.wind_direction_10m);
    const degRound = Math.round(cur.wind_direction_10m);
    windDirDegreeElem.innerText = `${dirCard} · ${degRound}°`;
  }
  const needleElem = document.getElementById("compassNeedle");
  if (needleElem) {
    needleElem.style.transform = `rotate(${cur.wind_direction_10m}deg)`;
  }

  // 2. UV Index
  const uvVal =
    hourly.uv_index && hourly.uv_index[currentHourIdx] !== undefined
      ? hourly.uv_index[currentHourIdx]
      : Math.max(...(hourly.uv_index || [0]).slice(0, 24));

  const uvValueElem = document.getElementById("uvValue");
  if (uvValueElem) uvValueElem.innerText = uvVal.toFixed(1);

  const uvStatusElem = document.getElementById("uvStatus");
  if (uvStatusElem) {
    uvStatusElem.innerText =
      uvVal > 7 ? "Very High" : uvVal > 5 ? "High" : uvVal > 2 ? "Moderate" : "Low";
  }

  const uvArcProgress = document.getElementById("uvArcProgress");
  if (uvArcProgress) {
    const uvRatio = Math.min(1, Math.max(0, uvVal / 11));
    const strokeOffset = 188.5 * (1 - uvRatio);
    uvArcProgress.style.strokeDashoffset = strokeOffset.toFixed(2);
    uvArcProgress.style.stroke =
      uvVal > 7 ? "#ef4444" : uvVal > 5 ? "#f97316" : uvVal > 2 ? "#f59e0b" : "#38bdf8";
  }

  // 3. Sunrise & Sunset
  const sunriseCard = document.querySelector("#Sunrise");
  if (sunriseCard && daily.sunrise && daily.sunset) {
    const sunriseObj = parseNaiveTime(daily.sunrise[0]);
    const sunsetObj = parseNaiveTime(daily.sunset[0]);

    if (sunriseObj && sunsetObj) {
      const startElem = sunriseCard.querySelector(".time-start");
      const endElem = sunriseCard.querySelector(".time-end");
      if (startElem) startElem.innerText = sunriseObj.formatted;
      if (endElem) endElem.innerText = sunsetObj.formatted;

      updateSunPosition(sunriseObj, sunsetObj, cur.time);
    }
  }

  // 4. Humidity
  const humidityValueElem = document.getElementById("humidityValue");
  if (humidityValueElem) {
    humidityValueElem.innerHTML = `${cur.relative_humidity_2m} <span class="unit">%</span>`;
  }
  const humidityStatusElem = document.getElementById("humidityStatus");
  if (humidityStatusElem) {
    humidityStatusElem.innerText =
      cur.relative_humidity_2m > 70 ? "Humid" : "Normal";
  }

  // 5. Pressure
  const pressureValueElem = document.getElementById("pressureValue");
  if (pressureValueElem) {
    pressureValueElem.innerHTML = `${Math.round(cur.pressure_msl)} <span class="unit">hPa</span>`;
  }
  const pressureStatusElem = document.getElementById("pressureStatus");
  if (pressureStatusElem) {
    pressureStatusElem.innerText =
      cur.pressure_msl < 1005 ? "Low" : cur.pressure_msl > 1020 ? "High" : "Normal";
  }

  // 6. Visibility
  const visMeters =
    hourly.visibility && hourly.visibility[currentHourIdx] !== undefined
      ? hourly.visibility[currentHourIdx]
      : 10000;
  const visKm = visMeters / 1000;

  const visValueElem = document.getElementById("visibilityValue");
  if (visValueElem) {
    visValueElem.innerHTML = `${visKm.toFixed(1)} <span class="unit">km</span>`;
  }
  const visStatusElem = document.getElementById("visibilityStatus");
  if (visStatusElem) {
    visStatusElem.innerText = visKm < 5 ? "Poor" : "Good";
  }

  // 7. Air Quality
  const pm25 = currentAirQualityData?.current?.pm2_5;
  const aqValueElem = document.getElementById("airQualityValue");
  const aqStatusElem = document.getElementById("airQualityStatus");

  if (aqValueElem && aqStatusElem) {
    if (pm25 !== undefined && pm25 !== null) {
      aqValueElem.innerText = Math.round(pm25);
      aqStatusElem.innerText =
        pm25 > 150 ? "Very Poor" : pm25 > 50 ? "Moderate" : "Good";
    } else {
      aqValueElem.innerText = "N/A";
      aqStatusElem.innerText = "Normal";
    }
  }

  // 8. Dew Point
  const dewPoint = cur.dew_point_2m !== undefined && cur.dew_point_2m !== null
    ? cur.dew_point_2m
    : (cur.temperature_2m - ((100 - cur.relative_humidity_2m) / 5));

  const dewPointValueElem = document.getElementById("dewPointValue");
  if (dewPointValueElem) {
    dewPointValueElem.innerHTML = `${formatTemp(dewPoint)}`;
  }
  const dewPointStatusElem = document.getElementById("dewPointStatus");
  if (dewPointStatusElem) {
    dewPointStatusElem.innerText = dewPoint > 20 ? "Muggy" : dewPoint > 15 ? "Moist" : "Comfortable";
  }
}

// 3. SVG Sun Arc Position Calculation
function updateSunPosition(sunriseObj, sunsetObj, stationCurrentTimeStr) {
  const sunDot = document.querySelector("#Sunrise .sun-dot");
  if (!sunDot) return;

  const curObj = parseNaiveTime(stationCurrentTimeStr);
  if (!curObj) return;

  const sunriseMin = sunriseObj.minutesFromMidnight;
  const sunsetMin = sunsetObj.minutesFromMidnight;
  const currentMin = curObj.minutesFromMidnight;

  let t = 0;
  if (currentMin <= sunriseMin) {
    t = 0.0;
  } else if (currentMin >= sunsetMin) {
    t = 1.0;
  } else {
    t = (currentMin - sunriseMin) / (sunsetMin - sunriseMin);
  }

  // Bezier Curve P(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
  // Arc Path: d="M 15 70 Q 90 15 165 70"
  const cx = Math.pow(1 - t, 2) * 15 + 2 * (1 - t) * t * 90 + Math.pow(t, 2) * 165;
  const cy = Math.pow(1 - t, 2) * 70 + 2 * (1 - t) * t * 15 + Math.pow(t, 2) * 70;

  sunDot.setAttribute("cx", cx.toFixed(2));
  sunDot.setAttribute("cy", cy.toFixed(2));

  if (currentMin > sunsetMin || currentMin < sunriseMin) {
    sunDot.setAttribute("fill", "#94a3b8");
    sunDot.setAttribute("filter", "drop-shadow(0 0 6px #64748b)");
  } else {
    sunDot.setAttribute("fill", "#fbbf24");
    sunDot.setAttribute("filter", "drop-shadow(0 0 8px #fbbf24)");
  }
}

// 4. Hourly Forecast
function updateHourlyForecast() {
  const hourly = currentWeatherData.hourly;
  if (!hourly || !hourly.time) return;

  const carousel = document.getElementById("hourlyCarousel");
  if (!carousel) return;
  carousel.innerHTML = "";

  const currentStationTimeStr = currentWeatherData.current.time;
  const startIdx = Math.max(
    0,
    hourly.time.findIndex((t) => t.startsWith(currentStationTimeStr.slice(0, 13)))
  );

  for (let i = 0; i < 24 && startIdx + i < hourly.time.length; i++) {
    const dataIdx = startIdx + i;
    const timeObj = parseNaiveTime(hourly.time[dataIdx]);
    const tempVal = hourly.temperature_2m[dataIdx];
    const code = hourly.weather_code[dataIdx];
    const pop = hourly.precipitation_probability[dataIdx] || 0;
    const cond = getWMOCondition(code, 1);

    const card = document.createElement("li");
    card.classList.add("card");
    card.style.minWidth = "180px";
    card.style.textAlign = "center";
    card.style.padding = "20px 16px";

    card.innerHTML = `
      <div class="day" style="font-weight: 600; font-size: 15px;">${timeObj ? timeObj.formatted : "—"}</div>
      <div class="icon" style="margin: 10px 0; font-size: 32px; color: ${cond.color};">
        <i class="fa-solid ${cond.iconClass}"></i>
      </div>
      <div class="temperature" style="font-size: 22px; font-weight: 700; color: #0284c7;">${formatTemp(tempVal)}</div>
      <div style="font-size: 13px; color: #64748b; margin-top: 6px; font-weight: 500;">${cond.text}</div>
      <div style="font-size: 12px; color: #0284c7; margin-top: 6px; font-weight: 600; background: rgba(56,189,248,0.1); padding: 4px 8px; border-radius: 12px; display: inline-block;">
        <i class="fa-solid fa-droplet"></i> ${pop}%
      </div>
    `;
    carousel.appendChild(card);
  }
}

// 5. 10-Day Forecast
function update10DayForecast() {
  const daily = currentWeatherData.daily;
  if (!daily || !daily.time) return;

  const tenDayList = document.getElementById("tenDayList");
  if (!tenDayList) return;
  tenDayList.innerHTML = "";

  for (let i = 0; i < daily.time.length; i++) {
    const dateStr = daily.time[i];
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min ? daily.temperature_2m_min[i] : null;
    const code = daily.weather_code[i];
    const cond = getWMOCondition(code, 1);
    const dayName = parseNaiveDate(dateStr);

    const row = document.createElement("div");
    row.classList.add("hour");
    row.innerHTML = `
      <div class="time" style="font-weight: 600; font-size: 16px; min-width: 110px;">${dayName}</div>
      <div class="icon-temp" style="gap: 12px;">
        <i class="fa-solid ${cond.iconClass} fa-xl" style="color: ${cond.color};"></i>
      </div>
      <div class="condition" style="padding-left: 20px; font-size: 15px;">${cond.text}</div>
      <div class="temp" style="display: flex; align-items: center; gap: 8px;">
        <span class="high-temp">${formatTemp(maxTemp)}</span>
        ${minTemp !== null ? `<span style="font-size: 15px; color: #94a3b8; font-weight: 500;">/ ${formatTemp(minTemp)}</span>` : ""}
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

// --- Live Google News RSS Fetching ---
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
        <img src="${imgUrl}" alt="${item.title}" class="card-image" onerror="this.onerror=null; this.src='${fallbackImages[idx % fallbackImages.length]}';">
        <div class="text-container">
          <h2 class="title"><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h2>
          <p class="summary">${excerpt || "Latest weather news and forecast updates."}</p>
        </div>
      `;
      newsContainer.appendChild(card);
    });
  } catch (error) {
    console.warn("News RSS fetch failed, falling back to static cards:", error);
  }
}

// --- News See More Toggle ---
function seeMore() {
  const div = document.querySelector(".news-container");
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
