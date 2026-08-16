require("dotenv").config();
const express = require("express");
const path = require("path");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 2024;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Helper: make HTTPS GET request and return parsed JSON
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            reject(new Error("Failed to parse API response"));
          }
        });
      })
      .on("error", reject);
  });
}

// Static files
app.use(express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, "Pics")));

// HTML Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "src", "index.html")));
app.get("/aboutus", (req, res) => res.sendFile(path.join(__dirname, "src", "aboutus.html")));
app.get("/contactus", (req, res) => res.sendFile(path.join(__dirname, "src", "contactus.html")));
app.get("/faqs", (req, res) => res.sendFile(path.join(__dirname, "src", "faqs.html")));
app.get("/policy", (req, res) => res.sendFile(path.join(__dirname, "src", "policy.html")));
app.get("/t&c", (req, res) => res.sendFile(path.join(__dirname, "src", "t&c.html")));

// ==========================================================================
//  PROXY ROUTES — WeatherAPI key stays on server, never exposed to browser
// ==========================================================================

// GET /api/current?q=<city|lat,lon>
// Returns: WeatherAPI forecast (current + 3-day hourly + astro)
app.get("/api/current", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing query parameter: q" });
  if (!WEATHER_API_KEY) {
    return res.status(500).json({ error: "Server API key not configured" });
  }

  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(q)}&days=3&aqi=no&alerts=no`;
    const result = await httpsGet(url);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("WeatherAPI current error:", err.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// GET /api/search?q=<query>
// Returns: WeatherAPI city autocomplete results
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing query parameter: q" });
  if (!WEATHER_API_KEY) {
    return res.status(500).json({ error: "Server API key not configured" });
  }

  try {
    const url = `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(q)}`;
    const result = await httpsGet(url);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("WeatherAPI search error:", err.message);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  if (!WEATHER_API_KEY) {
    console.warn("WARNING: WEATHER_API_KEY is not set in .env");
  }
});

module.exports = app;
