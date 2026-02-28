# 🚌 Aurevia — Premium Bus Booking System

Aurevia is a modern full-stack bus booking web application built using Node.js, Express, MySQL, and Vanilla JavaScript.


## ✨ Features

- 🔐 User Registration & Login (JWT Authentication)
- 🚌 Search Buses by Route
- 💺 Real-time Seat Selection
- 🎟️ Booking & Cancellation
- 📊 Dashboard with Travel Stats
- 🖨️ Printable Ticket System
- 🎨 Premium Luxury UI Design


## 🛠️ Tech Stack

**Frontend**
- HTML5
- CSS3 (Glassmorphism + Dark Theme)
- Vanilla JavaScript

**Backend**
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcrypt Password Hashing


## 📂 Project Structure
Aurevia/
│
├── index.html
├── server.js
├── db.js
├── package.json
├── package-lock.json
└── .env (not uploaded for security)


## ⚙️ How to Run Locally

1️⃣ Install dependencies:
npm install

2️⃣ Setup MySQL database  
Run the provided SQL script.

3️⃣ Create `.env` file:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bus_booking
JWT_SECRET=your_secret_key

4️⃣ Start server:
node server.js

5️⃣ Open `index.html` in browser.


## 📸 Project Preview

### Dashboard
![Dashboard](aurevia-dashboard.jpeg)

### Seat Selection
![Seat Selection](aurevia-seats.jpeg)

## 🔒 Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Seat uniqueness constraint in database
- Foreign key relationships
- Protected routes


## 👩‍💻 Author


Swathi Reddy  
Data Science Student | Full Stack Learner  

⭐ If you like this project, give it a star!
