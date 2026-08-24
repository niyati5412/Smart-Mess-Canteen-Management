# 🍽️ MessMate — Smart Mess & Canteen Management System

> **A modern, full-stack web application for university hostel mess management, food waste analytics, attendance tracking, and guardian monitoring.**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Project Overview

**MessMate** optimizes university hostel dining by providing real-time meal intention logging (Eat/Skip), automated headcount predictions for mess staff, food waste reduction analytics, and comprehensive guardian oversight.

The system enforces domain-level authentication (**only `@chitkara.edu.in` emails** for students) and supports role-based access control for **Students**, **Admins**, and **Guardians**.

---

## ✨ Key Features

### 👨‍🎓 Student Portal
* **🔐 Domain-Restricted Registration:** Only students registering with `@chitkara.edu.in` can create student accounts.
* **🍱 Daily Meal Intentions:** Mark "Will Eat" or "Will Skip" for Breakfast, Lunch, Dinner, and Snacks.
* **💰 Value & Consumption Analytics:** Track semester fee efficiency (e.g., ₹6000 fee vs consumed value at ₹67/meal).
* **📋 Weekly Menu Viewer:** View day-by-day mess menus with nutrition tags and meal timings.
* **📸 Live Avatar Upload:** Cloudinary & webcam camera capture for student profile images.

### 👨‍💼 Admin Portal
* **📊 Live Intention Headcount:** Real-time summary of student meal intentions to optimize mess cooking quantities.
* **📜 Student Intention Logs:** Detailed table showing individual student statuses, search filtering, and timestamps.
* **🍽️ Menu Management:** Dynamic updating of weekly breakfast, lunch, dinner, and snacks items.
* **📉 Waste & Sustainability Tracker:** Log daily wasted kilograms, cost impact, and reduction targets.

### 👨‍👩‍👧 Guardian Portal
* **🆔 Dual Profile Badges:** Header cards displaying both Guardian (`Tanu Gupta`) and linked Ward (`Niyati Gupta`) with live avatars.
* **📅 Attendance Log Matrix:** Interactive monthly calendar grid logging daily student meal attendance.
* **💚 Ward Health Score:** Real-time health indicator (e.g. 94/100 Excellent) based on meal consumption consistency.
* **🔔 Opt-Out Alerts & Preferences:** Instant notification feeds for skipped meals with email preference toggles.
* **📥 CSV Export:** One-click download of monthly ward mess activity reports.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React 18 (Vite)
* **Routing:** React Router v6
* **Styling:** CSS Modules, Modern CSS Grid & Flexbox, Dynamic Light/Dark Themes
* **Icons & UI:** Custom SVGs, Lucide-style badges

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Authentication:** JWT & Session-based Auth with bcrypt password hashing
* **Database:** MongoDB (Mongoose ORM)
* **Media Upload:** Cloudinary API & Multer

---

## 📁 Project Directory Structure

```
Smart-Mess-Canteen-Management/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary configurations
│   │   ├── controllers/     # Auth, Intention, Menu, Waste controllers
│   │   ├── models/          # Mongoose Schemas (User, Intention, Menu, Waste)
│   │   ├── routes/          # Express API Endpoints
│   │   └── app.js           # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # GuardianSidebar, GuardianHeaderProfiles, Sidebars
│   │   ├── pages/
│   │   │   ├── admin/       # Dashboard, Intentions, Menu, Waste, Budget
│   │   │   ├── guardian/    # Dashboard, Attendance, Budget, Alerts
│   │   │   ├── student/     # Dashboard, Intention, Menu, Feedback, Value
│   │   │   └── public/      # Landing Index, Login, Signup
│   │   ├── App.jsx          # Route definitions
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── start-all.js             # Single-command runner for backend & frontend
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** v18+ installed
* **npm** or **yarn** installed
* **MongoDB** connection string (Local or MongoDB Atlas)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/niyati5412/Smart-Mess-Canteen-Management.git
   cd Smart-Mess-Canteen-Management
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartmess
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Run the Application**
   From the project root:
   ```bash
   node start-all.js
   ```
   * **Frontend:** `http://localhost:5173`
   * **Backend API:** `http://localhost:3000`

---

## 📡 API Endpoints Summary

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/signup` | `POST` | Register new user (Enforces `@chitkara.edu.in` for students) |
| `/api/auth/login` | `POST` | Authenticate user & start session |
| `/api/auth/users` | `GET` | Fetch user directory & profile images |
| `/api/auth/link-ward` | `POST` | Link Guardian account to Student Ward ID |
| `/api/intentions` | `POST` | Submit daily meal intention (Eat / Skip) |
| `/api/intentions/student/:studentId` | `GET` | Get student meal attendance log |
| `/api/intentions/admin/all` | `GET` | Populate live student meal intention headcount |
| `/api/menu` | `GET / POST` | Fetch or update mess menu |
| `/api/waste` | `GET / POST` | Fetch or log mess food waste metrics |

---

## 👥 Authors & Acknowledgments

* **Developer:** [Niyati Gupta](https://github.com/niyati5412)
* **Institution:** Chitkara University

---
