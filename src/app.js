const express = require("express");
const path = require("path");

// ── Import all routes ──────────────────────────────
const authRoutes       = require("./routes/auth.routes");
const intentionRoutes  = require("./routes/intention.routes");
const feedbackRoutes   = require("./routes/feedback.routes");
const menuRoutes       = require("./routes/menu.routes");
const canteenRoutes    = require("./routes/canteen.routes");
const orderRoutes = require("./routes/orders.routes");
const budgetRoutes = require("./routes/budget.routes");
const wasteRoutes = require("./routes/waste.routes");



const app = express();

// ── Middleware ─────────────────────────────────────
// Parse incoming JSON request bodies
app.use(express.json());

// Serve your entire public/ folder as static files
// This means /admin/dashboard.html, /student/dashboard.html etc all work
app.use(express.static(path.join(__dirname, "../public")));

// ── API Routes ─────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/intentions", intentionRoutes);
app.use("/api/feedback",   feedbackRoutes);
app.use("/api/menu",       menuRoutes);
app.use("/api/canteen",    canteenRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/waste", wasteRoutes);

// ── 404 Handler ────────────────────────────────────
// Catches any unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ── Global Error Handler ───────────────────────────
// Catches any errors thrown in controllers
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: err.message });
});

module.exports = app;