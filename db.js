const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "bus_booking"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // Stop server if DB fails
  } else {
    console.log("✅ Connected to MySQL");
  }
});

module.exports = db;