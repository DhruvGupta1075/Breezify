const express = require("express");
const path = require('path');
const mysql = require("mysql2");

const app = express();

// ✅ Use a connection pool for better reliability
const db = mysql.createPool({
    host: "mysql-71260a-dhruvgupta1075-f693.b.aivencloud.com",
    port: 11418,
    user: "avnadmin",
    password: "AVNS_SftkjechTECu3fErqfF",
    database: "defaultdb",
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(express.static("xyz"));
app.use(express.static(path.join(__dirname, 'Pics')));
app.use(express.urlencoded({ extended: true }));

app.listen(2024, () => {
    console.log("Server started on port 2024");
});

// ✅ Serve HTML pages
app.get("/breezify", (req, res) => res.sendFile(__dirname + "/xyz/frontpage.html"));
app.get("/", (req, res) => res.sendFile(__dirname + "/xyz/index.html"));
app.get("/signup2", (req, res) => res.sendFile(__dirname + "/xyz/signup.html"));
app.get("/login-page", (req, res) => res.sendFile(__dirname + "/xyz/login.html"));  // renamed
app.get("/aboutus", (req, res) => res.sendFile(__dirname + "/xyz/aboutus.html"));
app.get("/contactus", (req, res) => res.sendFile(__dirname + "/xyz/contactus.html"));
app.get("/faqs", (req, res) => res.sendFile(__dirname + "/xyz/faqs.html"));
app.get("/policy", (req, res) => res.sendFile(__dirname + "/xyz/policy.html"));
app.get("/t&c", (req, res) => res.sendFile(__dirname + "/xyz/t&c.html"));

// ✅ Signup logic
app.get("/signup", (req, res) => {
    const { email, uname, txtPwd } = req.query;

    const query = "INSERT INTO signup (email, uname, pwd) VALUES (?, ?, ?)";
    db.query(query, [email, uname, txtPwd], (err) => {
        if (err) {
            console.error("Signup Error:", err.message);
            res.send("Error: " + err.message);
        } else {
            res.send("Signed up Successfully");
        }
    });
});


app.get("/login", (req, res) => {
    const email = req.query.txtEmaillog;
    const pwd = req.query.txtPwdlog;

    const query = "SELECT * FROM signup WHERE email = ? AND pwd = ?";
    db.query(query, [email, pwd], (err, result) => {
        if (err) {
            console.error("Login Error:", err.message);
            res.send("Error: " + err.message);
        } else if (result.length === 1) {
            res.send("Welcome sir");
            
        } else {
            res.send("Incorrect credentials");
        }
    });
});
