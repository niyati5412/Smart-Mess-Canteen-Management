require("dotenv").config();
const express  = require("express");
const path     = require("path");
const morgan   = require("morgan");
const helmet   = require("helmet");
const session  = require("express-session");
const passport = require("./config/passport");

// Routes — API
const authRoutes      = require("./routes/auth.routes");
const intentionRoutes = require("./routes/intention.routes");
const feedbackRoutes  = require("./routes/feedback.routes");
const menuRoutes      = require("./routes/menu.routes");
const canteenRoutes   = require("./routes/canteen.routes");
const orderRoutes     = require("./routes/orders.routes");
const budgetRoutes    = require("./routes/budget.routes");
const wasteRoutes     = require("./routes/waste.routes");

// Routes — Page (SSR) removed for React migration

// Error middleware
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

// ── Security & logging ────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));

// ── Body parsers ──────────────────────────────────────────────────────────────
// express.json()        → parses application/json      (API calls)
// express.urlencoded()  → parses application/x-www-form-urlencoded (HTML forms)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session & Passport ────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production" }
}));
app.use(passport.initialize());
app.use(passport.session());



// Serve React App in Production (Optional, will add later if needed)
// app.use(express.static(path.join(__dirname, "../frontend/dist")));

// ── API routes  (returns JSON) ────────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/intentions", intentionRoutes);
app.use("/api/feedback",   feedbackRoutes);
app.use("/api/menu",       menuRoutes);
app.use("/api/canteen",    canteenRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/budget",     budgetRoutes);
app.use("/api/waste",      wasteRoutes);

// ── Error handlers ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;