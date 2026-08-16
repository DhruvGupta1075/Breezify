# 🌤️ Breezify — Complete Project Specification & Technical Report

> **Project Name:** Breezify  
> **Tagline:** Modern Glassmorphic 3D Interactive Weather Dashboard & Forecast Platform  
> **Repository:** [DhruvGupta1075/Breezify](https://github.com/DhruvGupta1075/Breezify)  
> **Port / Local URL:** `http://localhost:2024`  

---

## 1. Executive Summary & Overview
**Breezify** is a full-stack weather web application combining real-time meteorological data with modern visual design, 3D parallax effects, glassmorphic UI cards, responsive layouts across all screen sizes, and a hybrid API architecture. It delivers real-time weather metrics, 24-hour hourly forecasts, 10-day long-range outlooks, atmospheric instruments, astronomical solar tracking, air quality monitoring, and live weather news feeds.

---

## 2. Core Architecture & Hybrid API Strategy

Breezify employs a **Hybrid Backend-Proxy Architecture** to balance security, rich data availability, and free-tier optimization.

```
                           ┌──────────────────────────────────────────────┐
                           │               Browser Client                 │
                           └──────┬───────────────────────────────┬───────┘
                                  │                               │
         (1) Authenticated Proxied Calls            (2) Public Direct Calls
                                  │                               │
                                  ▼                               ▼
                 ┌─────────────────────────────────┐   ┌───────────────────────────┐
                 │       Express.js Backend        │   │      Open-Meteo API       │
                 │   (Port 2024 / Node.js Server)  │   │  (No API Key / Free REST) │
                 └────────────────┬────────────────┘   └─────────────┬─────────────┘
                                  │                                  │
                          WeatherAPI Key                             │
                          from .env file                             │
                                  │                                  │
                                  ▼                                  ▼
                   ┌──────────────────────────────┐    ┌───────────────────────────┐
                   │       WeatherAPI.com         │    │ • 10-Day Daily Forecast   │
                   │ • Current Weather Conditions │    │ • European AQI & PM2.5    │
                   │ • 24-Hour Hourly Forecast    │    └───────────────────────────┘
                   │ • Astronomy (Sunrise/Sunset) │
                   │ • City Autocomplete / Search │
                   └──────────────────────────────┘
```

### Why Hybrid?
1. **WeatherAPI.com (With Secret API Key):** Provides ultra-accurate real-time current conditions, weather condition icons, 24-hour hourly data, astronomical times, and fast fuzzy search autocomplete.
2. **Open-Meteo (Public REST API):** Bridges the free-tier limitation of WeatherAPI (which only offers 3 days of forecast for free) by delivering **10 full days** of high/low temperature forecasts, weather codes, and comprehensive Air Quality metrics (PM2.5).
3. **Security:** The `WEATHER_API_KEY` is kept in `.env` on the server and never exposed in client-side JavaScript.

---

## 3. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Backend** | Node.js, Express.js (v4.x), `dotenv` for environment management, native `https` client |
| **Frontend Core** | Vanilla HTML5 (semantic layout), Vanilla CSS3, Modern ES6+ JavaScript |
| **Styling & Aesthetics** | Modular CSS Architecture, CSS Custom Properties (Variables), Glassmorphism, CSS Grid & Flexbox, Fluid Typography (`clamp()`), 3D CSS Transforms (`preserve-3d`, `perspective`) |
| **APIs Integrated** | • **WeatherAPI.com REST API** (`/v1/forecast.json`, `/v1/search.json`)<br>• **Open-Meteo Forecast & Air Quality API** (`/v1/forecast`, `/v1/air-quality`)<br>• **Google News RSS via rss2json API** |
| **Icons & Typography** | Font Awesome 6.6.0, Google Fonts (*Arima*, *Poppins*, *Inter*) |
| **Theme System** | Dark / Light Mode with `localStorage` state persistence |

---

## 4. Key Features & Functionality

### 🌟 1. Interactive 3D Parallax Weather Scene (`3d-scene.css`, `weather-3d.js`)
- 3D depth layering with floating clouds, glowing sun/moon core, orbital rings, and dynamic particle effects.
- Mouse movement parallax tracking (`perspective`, `rotateX`, `rotateY`, `translateZ`).
- Changes appearance dynamically based on day/night cycles and weather conditions (Rain, Snow, Thunderstorm, Fog, Clear, Overcast).

### 🌡️ 2. Live Weather Reading & Hero Section
- Dynamic circular temperature gauge with tick markers.
- Fluid location header (`clamp()` font scaling).
- Current condition text, "Feels Like" temperature, daily high/low range, and local station clock.
- One-click temperature unit converter (°C ⇄ °F) affecting all data across the entire page.

### 🧭 3. 8-Instrument Meteorological Highlights Panel
1. **Wind Card:** Real-time wind speed in km/h, cardinal direction, and a **dynamically rotating compass needle**.
2. **UV Index Card:** Numeric UV rating, risk status badge, and an **SVG circular arc progress indicator**.
3. **Sunrise & Sunset:** Formatted 12-hour astronomical times with a **dynamic quadratic Bézier curve SVG sun arc trajectory** reflecting the sun's position relative to the local time.
4. **Humidity:** Percentage reading with humidity status indicator.
5. **Pressure:** Barometric pressure in hPa with atmospheric trend classification.
6. **Visibility:** Visual distance in kilometers with clarity status.
7. **Air Quality Index:** PM2.5 pollutant level with European AQI rating badge.
8. **Dew Point:** Dew point temperature and comfort index (Comfortable / Moist / Muggy).

### ⏱️ 4. 24-Hour Hourly Weather Carousel
- Horizontal scrollable & mouse-draggable carousel.
- Displays upcoming 24 hours with exact time, temperature, condition icon, and precipitation probability percentage (`%`).
- Left/Right interactive navigation buttons that automatically hide at boundaries.

### 📅 5. 10-Day Extended Forecast
- Full 10-day outlook with weekday name, weather condition icon, condition description, and High/Low temperature range.

### 📰 6. Live Weather News Feed
- Live Google News RSS fetch for weather news in India and worldwide.
- Rich preview cards with titles, publication summaries, external linkouts, and responsive fallback images.
- Expandable / Collapsible container ("See More" / "See Less").

### 🔍 7. Real-Time Geocoding & City Autocomplete
- Debounced live search input connected to `/api/search`.
- Instant dropdown suggestions displaying City Name, Region/State, and Country.
- Clicking any suggestion instantly re-renders all weather instruments for that coordinate set.

### 📱 8. Universal Responsive Design
- **Desktop (> 1200px):** Full multi-column dashboard with 4-column instrument grid.
- **Tablet (768px – 992px):** 2-column instrument grid, scaled 3D canvas, flexible search input.
- **Mobile Phones (480px – 576px):** 2-column condensed instrument cards, stacked weather hero gauge, wrapped footer navigation.
- **Compact Phones (< 420px):** Single-column stacked layouts, scaled typography, optimized card padding.

---

## 5. File & Directory Structure

```
Breezify/
├── .env                  # Secret environment file containing WEATHER_API_KEY (gitignored)
├── .env.example          # Public template for environment setup
├── .gitignore            # Git exclusion rules (.env, node_modules, logs)
├── package.json          # Project metadata, scripts, and dependencies (express, dotenv)
├── package-lock.json     # Dependency lockfile
├── server.js             # Express server entry point & WeatherAPI backend proxy
├── PROJECT_REPORT.md     # Comprehensive project technical report
├── Pics/                 # Static graphical assets & logos
└── src/                  # Frontend source directory
    ├── index.html        # Main weather dashboard page
    ├── aboutus.html      # Meet the team page
    ├── contactus.html    # Contact & support page
    ├── faqs.html         # Frequently Asked Questions page
    ├── policy.html       # Privacy policy document
    ├── t&c.html          # Terms & conditions document
    ├── theme.js          # Dark/Light mode manager & local storage controller
    ├── weather.js        # Main frontend controller (API calls, DOM rendering)
    ├── weather-utils.js  # Helpers (time/date parsing, temperature & unit converters)
    ├── weather-3d.js     # 3D parallax mouse tracking & scene state controller
    └── css/              # Modular Stylesheets
        ├── styles.css    # Aggregator stylesheet (@import rules)
        ├── common.css    # Global tokens, reset, navbar, footer, search, dark mode variables
        ├── dashboard.css # Main hero gauge, instrument grid, carousel, 10-day forecast styles
        ├── 3d-scene.css  # 3D atmospheric scene, clouds, sun, orbital rings, weather animation states
        ├── news.css      # News grid, cards, summary typography
        ├── aboutus.css   # Team cards and glassmorphic profile styles
        ├── contactus.css # Contact card, form inputs, social links
        ├── faqs.css      # FAQ accordion styling (<details>/<summary>)
        └── legal-doc.css # Scoped document styles for Terms & Privacy pages
```

---

## 6. Server Endpoints & API Specifications

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/` | None | Serves `src/index.html` (Main Dashboard) |
| `GET` | `/aboutus` | None | Serves `src/aboutus.html` |
| `GET` | `/contactus` | None | Serves `src/contactus.html` |
| `GET` | `/faqs` | None | Serves `src/faqs.html` |
| `GET` | `/policy` | None | Serves `src/policy.html` |
| `GET` | `/t&c` | None | Serves `src/t&c.html` |
| `GET` | `/api/current` | `?q=<city or lat,lon>` | **Secure Proxy:** Proxies request to WeatherAPI forecast endpoint with hidden server-side key |
| `GET` | `/api/search` | `?q=<query>` | **Secure Proxy:** Proxies query to WeatherAPI autocomplete search |

---

## 7. Project Team & Contributor Credits

- **Mauli Garg:** Frontend & UI/UX Engineer — Glassmorphic design systems, responsive UI components, 3D visual experiences.
- **Dhruv Gupta:** Lead Full-Stack & API Engineer — System architecture, WeatherAPI and Open-Meteo pipelines, dynamic state controllers.
- **Dhruv Bansal:** Backend & Infrastructure Engineer — Express proxy server, deployment workflows, security & environment configurations.

---

## 8. Setup & Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- npm (installed automatically with Node.js)
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)

### Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/DhruvGupta1075/Breezify.git
cd Breezify

# 2. Install dependencies
npm install

# 3. Create your local .env file
# (Copy .env.example or create .env directly)
# Add your WeatherAPI key:
# WEATHER_API_KEY=your_actual_key_here
# PORT=2024

# 4. Start the application
npm start
```
Open **`http://localhost:2024`** in your browser.
