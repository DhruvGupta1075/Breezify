<div align="center">

  <img src="Pics/Weather App Logo.png" alt="Breezify Logo" width="120" height="120" style="border-radius: 50%; box-shadow: 0 10px 30px rgba(2, 132, 199, 0.3);" />

  # Breezify
  **Your Daily Weather Simplified**

  *A modern, responsive weather forecasting web application featuring an interactive 3D parallax scene, live meteorological instrumentation, hourly & 10-day forecasts, and dark mode.*

  <br />

  [![Express](https://img.shields.io/badge/Express-5.1.0-blue.svg?logo=express)](https://expressjs.com/)
  [![Open-Meteo](https://img.shields.io/badge/API-Open--Meteo-38bdf8.svg)](https://open-meteo.com/)
  [![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

</div>

---

## 🌟 Overview

**Breezify** is a web application designed to deliver real-time weather forecasts with rich visual animations and detailed meteorological data. Built with modern Vanilla HTML5, CSS3, and JavaScript, Breezify integrates directly with the **Open-Meteo Weather & Geocoding APIs** to provide weather tracking for any city worldwide without requiring API keys.

---

## ✨ Key Features

### 🌌 Interactive 3D Parallax Weather Scene
- Full-width 3D scene that dynamically reacts to cursor movements.
- Volumetric animated elements including glowing 3D sun orbs, layered cloud puffs, lightning strikes, raindrops, and isobar wind rings.
- Dynamic condition-aware state transforms for clear skies, overcast conditions, rainfall, thunderstorms, snow, and night mode.

### 🧭 Comprehensive Meteorological Instruments
- **Live Gauge**: Circular dashed tick ring with live temperature, condition, and local station time.
- **Wind Speed & Direction**: Real-time rotating compass needle pointing to exact wind bearings (`0°–360°`).
- **UV Index Meter**: Dynamic colored SVG progress arc categorizing UV intensity from Low to Extreme.
- **Sunrise & Sunset Tracker**: Real-time parabolic Bezier sun-arc trajectory based on local solar time.
- **Atmospheric Highlights**: Live readouts for Humidity, Air Pressure (`hPa`), Visibility (`km`), Air Quality (`PM2.5` AQI), and Dew Point.

### 📊 Hourly & 10-Day Extended Forecasts
- **24-Hour Forecast Carousel**: Smooth mouse-draggable and scrollable timeline with temperature, precipitation probability (`%`), and weather condition icons.
- **10-Day Extended Outlook**: Daily high/low temperature ranges and weather conditions.

### 🔍 Live Geocoding Search
- Debounced auto-complete search with dropdown suggestions powered by the Open-Meteo Geocoding API.
- Instant weather updates for any global location on search or selection.

### 🌓 Persistent Theme Manager
- Smooth Dark Mode / Light Mode toggle with instant `localStorage` state persistence to prevent theme flashing.

### 📰 Live Weather News Feed
- Integration with Google News RSS to display live weather updates with fallback news cards and expandable card views.

### 📱 Responsive Glassmorphic Design
- Mobile-first responsive layout with frosted glass aesthetics, modern typography (`Inter`, `Poppins`, `Arima`), and smooth micro-interactions.

---

## 🚀 Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom 3D CSS animations, Flexbox, Grid, Glassmorphism), Vanilla JavaScript (ES6+)
- **Backend / Server**: Node.js, Express 5
- **APIs**:
  - [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs)
  - [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
  - [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)
  - Google News RSS (via rss2json)
- **Icons & Typography**: FontAwesome 6, Google Fonts (`Inter`, `Poppins`, `Arima`)

---

## 📁 Repository Structure

```
Breezify/
├── Pics/
│   └── Weather App Logo.png          # App brand logo & favicon
├── src/
│   ├── css/
│   │   ├── 3d-scene.css             # 3D weather scene transforms & keyframe animations
│   │   ├── aboutus.css              # Team member showcase styles
│   │   ├── common.css               # Shared glassmorphic header, footer & dark mode tokens
│   │   ├── contactus.css            # Contact card & form styling
│   │   ├── dashboard.css            # Hero gauges, highlights instruments & forecast tables
│   │   ├── faqs.css                 # Accordion FAQs stylesheet
│   │   ├── legal-doc.css            # Shared legal document styling (Policy & Terms)
│   │   ├── news.css                 # News feed cards and grid styling
│   │   └── styles.css               # Main modular stylesheet aggregator
│   ├── aboutus.html                 # Team showcase page
│   ├── contactus.html               # Contact form & support channels
│   ├── faqs.html                    # Frequently Asked Questions page
│   ├── index.html                   # Main interactive weather dashboard
│   ├── policy.html                  # Privacy Policy page
│   ├── t&c.html                     # Terms & Conditions page
│   ├── theme.js                     # Dark/Light mode manager & localStorage persistence
│   ├── weather-3d.js                # 3D parallax mouse tracking & scene state manager
│   ├── weather-utils.js             # Meteorological converters & geocoding helper functions
│   └── weather.js                   # Core dashboard controller & API integration
├── package.json
├── package-lock.json
├── README.md
└── server.js                        # Express static server & HTML route handler
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/breezify.git
   cd breezify
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:2024
   ```

---

## 👥 Authors

- **Mauli Garg** — Frontend & UI/UX Engineer
- **Dhruv Gupta** — Lead Full-Stack & API Engineer
- **Dhruv Bansal** — Backend & Infrastructure Engineer

---

## 📄 License

This project is licensed under the **ISC License**.
