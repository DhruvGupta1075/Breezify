<p align="center">
  <img src="Pics/Weather App Logo.png" alt="Breezify Logo" width="120" />
</p>

<h1 align="center">🌤️ Breezify</h1>

<p align="center">
  <b>Your Daily Weather, Simplified.</b><br/>
  A modern, glassmorphic 3D weather dashboard with live meteorological instruments, hourly & 10-day forecasts, and dark mode.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Express-5.1.0-blue.svg?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/API-Open--Meteo-38bdf8.svg" alt="Open-Meteo" />
  <img src="https://img.shields.io/badge/API-WeatherAPI.com-orange.svg" alt="WeatherAPI" />
  <img src="https://img.shields.io/badge/License-ISC-green.svg" alt="License" />
</p>

<p align="center">
  <a href="https://breezifyweather.vercel.app/"><b>🔗 Live Demo</b></a>
</p>

---

## 🌟 Overview

**Breezify** is a full-stack weather web application that combines real-time meteorological data with a rich, interactive interface. It features a 3D parallax weather scene, live atmospheric instruments, hourly and extended forecasts, astronomical sun tracking, air quality monitoring, and a live weather news feed — all wrapped in a responsive glassmorphic design.

Breezify uses a **hybrid API architecture**: an Express backend securely proxies calls to WeatherAPI.com for rich, accurate current/hourly data, while the client talks directly to the free, key-less Open-Meteo API for extended 10-day forecasts and air quality data.

---

## ✨ Key Features

### 🌌 Interactive 3D Parallax Weather Scene
- Full-width 3D scene that reacts dynamically to cursor movement (`perspective`, `rotateX/Y`, `translateZ`).
- Volumetric elements: glowing sun/moon orbs, layered clouds, lightning, raindrops, and orbital wind rings.
- Scene state adapts to real conditions — clear, overcast, rain, thunderstorm, snow, fog, and night mode.

### 🧭 8-Instrument Meteorological Panel
| Instrument | Details |
|---|---|
| **Live Gauge** | Circular dashed tick ring with temperature, condition, and local station time |
| **Wind** | Real-time speed (km/h) with a rotating compass needle (0°–360°) |
| **UV Index** | SVG arc progress indicator, Low → Extreme |
| **Sunrise / Sunset** | Live Bézier-curve sun-arc tracking solar position |
| **Humidity** | Percentage with status indicator |
| **Pressure** | Barometric pressure (hPa) with trend classification |
| **Visibility** | Distance in km with clarity status |
| **Air Quality** | PM2.5 with European AQI rating |
| **Dew Point** | Temperature with comfort index (Comfortable / Moist / Muggy) |

### 📊 Forecasts
- **24-Hour Carousel** — mouse-draggable, scrollable, with temperature, precipitation %, and condition icons.
- **10-Day Outlook** — daily high/low ranges and conditions.

### 🔍 Live Geocoding Search
- Debounced autocomplete via `/api/search`, showing city, region, and country.
- Instant dashboard refresh on selection.

### 🌓 Persistent Theme Manager
- Dark/Light toggle with `localStorage` persistence to prevent theme flash on load.

### 📰 Live Weather News Feed
- Google News RSS integration (via rss2json) with expandable cards and fallback images.

### 📱 Fully Responsive, Glassmorphic UI
- Mobile-first layout, frosted-glass cards, fluid typography (`clamp()`), and smooth micro-interactions across desktop, tablet, and mobile breakpoints.

---

## 🏗️ Architecture

Breezify uses a **hybrid backend-proxy strategy** to balance data richness, security, and free-tier limits:

```text
┌──────────────────────────────────────────────┐
│                Browser Client                │
└──────┬───────────────────────────────┬───────┘
       │                               │
(1) Authenticated Proxy Calls   (2) Public Direct Calls
       │                               │
       ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────┐
│     Express.js Backend       │ │     Open-Meteo API      │
│         (Port 2024)          │ │  (No key / Free REST)   │
└──────────────┬───────────────┘ └────────────┬────────────┘
               │                              │
       WEATHER_API_KEY                        │
        (from .env)                           │
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌─────────────────────────┐
│        WeatherAPI.com        │ │ • 10-Day Daily Forecast │
│ • Current Conditions         │ │ • European AQI & PM2.5  │
│ • 24-Hour Hourly Data        │ └─────────────────────────┘
│ • Astronomy (Sun/Moon)       │
│ • City Autocomplete          │
└──────────────────────────────┘
```

### Why hybrid?
- **WeatherAPI.com** provides ultra-accurate current conditions, hourly forecasts, astronomical data, and fuzzy-search autocomplete — but its free tier is capped at 3 days of forecast.
- **Open-Meteo** fills that gap with a full 10-day outlook and detailed air quality metrics, at no cost and with no API key required.
- **Security** — the `WEATHER_API_KEY` lives only in a server-side `.env` file and is never exposed to the client; all WeatherAPI calls are proxied through Express.

---

## 🚀 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express 5, dotenv, native https client |
| **Frontend** | Vanilla HTML5, CSS3 (Grid, Flexbox, Glassmorphism, 3D transforms), Vanilla JavaScript (ES6+) |
| **APIs** | WeatherAPI.com (forecast, search), Open-Meteo (forecast, air quality, geocoding), Google News RSS via rss2json |
| **Icons & Fonts** | Font Awesome 6, Google Fonts (Inter, Poppins, Arima) |
| **Theming** | Dark/Light mode with localStorage persistence |

---

## 📁 Repository Structure

```text
Breezify/
├── .env.example          # Template for local environment setup
├── .gitignore
├── package.json
├── package-lock.json
├── server.js             # Express server & WeatherAPI proxy
├── vercel.json
├── Pics/                 # Logo & static image assets
└── src/
    ├── index.html        # Main weather dashboard
    ├── aboutus.html      # Team showcase
    ├── contactus.html    # Contact form & channels
    ├── faqs.html         # FAQ accordion page
    ├── policy.html       # Privacy policy
    ├── t&c.html          # Terms & conditions
    ├── theme.js          # Dark/Light mode manager
    ├── weather.js        # Core dashboard controller & API calls
    ├── weather-utils.js  # Converters & geocoding helpers
    ├── weather-3d.js     # 3D parallax mouse tracking
    └── css/
        ├── styles.css    # Aggregator stylesheet
        ├── common.css    # Tokens, navbar, footer, dark mode
        ├── dashboard.css # Hero gauge, instruments, carousel
        ├── 3d-scene.css  # 3D scene animations & states
        ├── news.css      # News feed styling
        ├── aboutus.css   # Team card styling
        ├── contactus.css # Contact form styling
        ├── faqs.css      # FAQ accordion styling
        └── legal-doc.css # Shared legal page styling
```

---

## 🔌 Server Endpoints

| Method | Endpoint | Query | Description |
|---|---|---|---|
| `GET` | `/` | — | Serves the main dashboard |
| `GET` | `/aboutus` | — | Team page |
| `GET` | `/contactus` | — | Contact page |
| `GET` | `/faqs` | — | FAQ page |
| `GET` | `/policy` | — | Privacy policy |
| `GET` | `/t&c` | — | Terms & conditions |
| `GET` | `/api/current` | `?q=<city or lat,lon>` | Secure proxy to WeatherAPI forecast endpoint |
| `GET` | `/api/search` | `?q=<query>` | Secure proxy to WeatherAPI autocomplete search |

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (v16+ minimum)
- npm
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/DhruvGupta1075/Breezify.git
cd Breezify

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# then edit .env and add:
# WEATHER_API_KEY=your_actual_key_here
# PORT=2024

# 4. Start the app
npm start
```

Open **`http://localhost:2024`** in your browser.

---

## 👥 Authors

| Name | Role |
|---|---|
| **Mauli Garg** | Frontend & UI/UX Engineer — glassmorphic design systems, responsive components, 3D visual experiences |
| **Dhruv Gupta** | Lead Full-Stack & API Engineer — system architecture, WeatherAPI & Open-Meteo pipelines, state controllers |
| **Dhruv Bansal** | Backend & Infrastructure Engineer — built the Express proxy server (`server.js`), implemented secure `/api/current` and `/api/search` endpoints to keep the `WEATHER_API_KEY` server-side and out of client JS, managed environment configuration with `dotenv` and `.env`/`.env.example`, and handled the Vercel deployment setup (`vercel.json`) |

---

## 📄 License

This project is licensed under the ISC License.

<p align="center">Made with ☁️ and a lot of CSS 3D transforms.</p>
