const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 2024;

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

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = app;
