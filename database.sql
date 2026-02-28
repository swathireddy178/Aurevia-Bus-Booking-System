
-- ============================================================
--  BUS BOOKING SYSTEM — COMPLETE MYSQL CODE
--  Run this entire file in MySQL Workbench
--  Query Menu → Run SQL Script  OR  Ctrl+Shift+Enter
-- ============================================================


-- ── STEP 1: CREATE & SELECT DATABASE ─────────────────────
CREATE DATABASE IF NOT EXISTS bus_booking;
drop database bus_booking;

USE bus_booking;

-- ── STEP 2: CREATE TABLES ─────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    user_id   INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    email     VARCHAR(100) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS buses (
    bus_id          INT AUTO_INCREMENT PRIMARY KEY,
    bus_name        VARCHAR(100) NOT NULL,
    source          VARCHAR(100) NOT NULL,
    destination     VARCHAR(100) NOT NULL,
    total_seats     INT NOT NULL,
    available_seats INT NOT NULL,
    fare            DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT,
    bus_id         INT,
    passenger_name VARCHAR(100),
    seat_number    INT,
    status         ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
    booking_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (bus_id)  REFERENCES buses(bus_id),
    CONSTRAINT unique_seat UNIQUE (bus_id, seat_number)
);


-- ── STEP 3: INSERT BUS DATA ───────────────────────────────

INSERT INTO buses (bus_name, source, destination, total_seats, available_seats, fare)
VALUES
('Express 101',       'Hyderabad', 'Bangalore',    40, 40,  850.00),
('Express 102',       'Hyderabad', 'Chennai',      35, 35,  900.00),
('Express 103',       'Hyderabad', 'Mumbai',       45, 45, 1200.00),
('Super Deluxe 201',  'Bangalore', 'Chennai',      50, 50,  750.00),
('Super Deluxe 202',  'Bangalore', 'Mumbai',       45, 45, 1100.00),
('Super Deluxe 203',  'Chennai',   'Hyderabad',    40, 40,  920.00),
('Night Rider 301',   'Delhi',     'Jaipur',       40, 40,  600.00),
('Night Rider 302',   'Delhi',     'Lucknow',      42, 42,  780.00),
('Night Rider 303',   'Delhi',     'Chandigarh',   38, 38,  650.00),
('Comfort Line 401',  'Mumbai',    'Pune',         40, 40,  450.00),
('Comfort Line 402',  'Pune',      'Goa',          36, 36,  700.00),
('Comfort Line 403',  'Mumbai',    'Ahmedabad',    45, 45,  950.00),
('Royal Travels 501', 'Kolkata',   'Patna',        44, 44,  680.00),
('Royal Travels 502', 'Kolkata',   'Bhubaneswar',  40, 40,  720.00),
('Royal Travels 503', 'Patna',     'Delhi',        48, 48, 1300.00),
('City Express 601',  'Ahmedabad', 'Surat',        38, 38,  400.00),
('City Express 602',  'Surat',     'Mumbai',       42, 42,  500.00),
('City Express 603',  'Ahmedabad', 'Udaipur',      40, 40,  650.00),
('Star Line 701',     'Bangalore', 'Hyderabad',    40, 40,  850.00),
('Star Line 702',     'Chennai',   'Bangalore',    35, 35,  780.00),
('Star Line 703',     'Mumbai',    'Goa',          40, 40,  900.00),
('Premium Coach 801', 'Delhi',     'Mumbai',       50, 50, 1800.00),
('Premium Coach 802', 'Delhi',     'Hyderabad',    48, 48, 1500.00),
('Premium Coach 803', 'Chennai',   'Kochi',        40, 40,  880.00),
('Premium Coach 804', 'Kochi',     'Bangalore',    42, 42,  920.00);


-- ── STEP 4: VERIFY EVERYTHING ────────────────────────────

-- Check all tables were created
SHOW TABLES;

-- Check table structures
DESCRIBE users;
DESCRIBE buses;
DESCRIBE bookings;

-- Check all 25 buses are inserted
SELECT * FROM buses;

-- Check bus count
SELECT COUNT(*) AS total_buses FROM buses;


-- ── STEP 5: USEFUL QUERIES (run anytime) ─────────────────

-- View all bookings with bus details
SELECT
    b.booking_id,
    b.passenger_name,
    b.seat_number,
    b.status,
    b.booking_date,
    bus.bus_name,
    bus.source,
    bus.destination,
    bus.fare
FROM bookings b
JOIN buses bus ON b.bus_id = bus.bus_id
ORDER BY b.booking_date DESC;

-- View seat occupancy per bus
SELECT
    bus_name,
    source,
    destination,
    total_seats,
    available_seats,
    (total_seats - available_seats) AS booked_seats,
    ROUND(((total_seats - available_seats) / total_seats) * 100, 2) AS occupancy_percentage
FROM buses
ORDER BY occupancy_percentage DESC;

-- Search buses by route
SELECT * FROM buses
WHERE source = 'Hyderabad' AND destination = 'Bangalore'
AND available_seats > 0;

-- View booked seats for a specific bus (e.g. bus_id = 1)
SELECT seat_number FROM bookings
WHERE bus_id = 1 AND status = 'confirmed';

-- View all users (passwords are hashed, safe to view)
SELECT user_id, name, email FROM users;