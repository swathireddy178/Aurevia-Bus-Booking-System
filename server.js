const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "mysecretkey123"; // Move to .env in production

/* ===============================
   JWT MIDDLEWARE
================================ */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized ❌" });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token ❌" });
  }
}

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("Bus Booking Backend Running 🚀");
});

/* ===============================
   REGISTER
================================ */
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required ❌" });

  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters ❌" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

    db.query(query, [name, email, hashedPassword], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ message: "Email already registered ❌" });
        return res.status(500).json({ message: "Server error" });
      }
      res.json({ message: "Registration successful 🎉" });
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   LOGIN
================================ */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields are required ❌" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0)
      return res.status(404).json({ message: "User not found ❌" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ message: "Incorrect password ❌" });

    const token = jwt.sign(
      { id: user.user_id, name: user.name, email: user.email },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful 🎉",
      token,
      user: { id: user.user_id, name: user.name, email: user.email }
    });
  });
});

/* ===============================
   GET ALL BUSES
================================ */
app.get("/buses", (req, res) => {
  db.query("SELECT * FROM buses ORDER BY bus_name ASC", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching buses" });
    res.json(results);
  });
});

/* ===============================
   SEARCH BUS
================================ */
app.get("/search", (req, res) => {
  const { source, destination } = req.query;

  if (!source || !destination)
    return res.status(400).json({ message: "Source and destination required" });

  const query = `
    SELECT * FROM buses
    WHERE LOWER(source) = LOWER(?) AND LOWER(destination) = LOWER(?)
    AND available_seats > 0
    ORDER BY fare ASC
  `;

  db.query(query, [source, destination], (err, results) => {
    if (err) return res.status(500).json({ message: "Search error" });
    res.json(results);
  });
});

/* ===============================
   GET BOOKED SEATS FOR A BUS
================================ */
app.get("/seats/:bus_id", (req, res) => {
  const { bus_id } = req.params;

  const query = `
    SELECT seat_number FROM bookings
    WHERE bus_id = ? AND status = 'confirmed'
  `;

  db.query(query, [bus_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching seats" });
    const bookedSeats = results.map(r => r.seat_number);
    res.json({ bookedSeats });
  });
});

/* ===============================
   BOOK SEAT (Protected)
================================ */
app.post("/book", authMiddleware, (req, res) => {
  const { bus_id, passenger_name, seat_number } = req.body;
  const user_id = req.user.id;

  if (!bus_id || !passenger_name || !seat_number)
    return res.status(400).json({ message: "All fields required ❌" });

  // 1. Check if seat already booked
  const seatCheckQuery = `
    SELECT * FROM bookings WHERE bus_id = ? AND seat_number = ? AND status = 'confirmed'
  `;

  db.query(seatCheckQuery, [bus_id, seat_number], (err, seatResults) => {
    if (err) return res.status(500).json({ message: "Error checking seat" });

    if (seatResults.length > 0)
      return res.status(409).json({ message: "Seat already booked ❌" });

    // 2. Check available seats
    db.query(
      "SELECT available_seats, total_seats FROM buses WHERE bus_id = ?",
      [bus_id],
      (err2, results) => {
        if (err2) return res.status(500).json({ message: "Error checking bus" });
        if (results.length === 0)
          return res.status(404).json({ message: "Bus not found ❌" });
        if (results[0].available_seats <= 0)
          return res.status(400).json({ message: "No seats available ❌" });

        // Validate seat number range
        const totalSeats = results[0].total_seats;
        if (seat_number < 1 || seat_number > totalSeats)
          return res.status(400).json({ message: `Seat must be between 1 and ${totalSeats} ❌` });

        // 3. Insert booking
        const insertQuery = `
          INSERT INTO bookings (user_id, bus_id, passenger_name, seat_number, status)
          VALUES (?, ?, ?, ?, 'confirmed')
        `;

        db.query(insertQuery, [user_id, bus_id, passenger_name, seat_number], (err3) => {
          if (err3) return res.status(500).json({ message: "Booking failed ❌" });

          // 4. Reduce available seats
          db.query(
            "UPDATE buses SET available_seats = available_seats - 1 WHERE bus_id = ? AND available_seats > 0",
            [bus_id]
          );

          res.json({ message: "Booking confirmed! 🎉" });
        });
      }
    );
  });
});

/* ===============================
   VIEW MY BOOKINGS (Protected)
================================ */
app.get("/bookings", authMiddleware, (req, res) => {
  const user_id = req.user.id;

  const query = `
    SELECT b.booking_id,
           b.passenger_name,
           b.seat_number,
           b.booking_date,
           b.status,
           bus.bus_id,
           bus.bus_name,
           bus.source,
           bus.destination,
           bus.fare
    FROM bookings b
    JOIN buses bus ON b.bus_id = bus.bus_id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching bookings" });
    res.json(results);
  });
});

/* ===============================
   CANCEL BOOKING (Protected)
================================ */
app.delete("/booking/:id", authMiddleware, (req, res) => {
  const booking_id = req.params.id;
  const user_id = req.user.id;

  // Verify ownership
  db.query(
    "SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?",
    [booking_id, user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Booking not found ❌" });

      const booking = results[0];

      if (booking.status === "cancelled")
        return res.status(400).json({ message: "Already cancelled" });

      // Update status to cancelled
      db.query(
        "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?",
        [booking_id],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Cancellation failed" });

          // Restore seat
          db.query(
            "UPDATE buses SET available_seats = available_seats + 1 WHERE bus_id = ?",
            [booking.bus_id]
          );

          res.json({ message: "Booking cancelled successfully ✅" });
        }
      );
    }
  );
});

/* ===============================
   GET USER PROFILE (Protected)
================================ */
app.get("/profile", authMiddleware, (req, res) => {
  db.query(
    "SELECT user_id, name, email FROM users WHERE user_id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0) return res.status(404).json({ message: "User not found" });
      res.json(results[0]);
    }
  );
});

/* ===============================
   START SERVER
================================ */
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});