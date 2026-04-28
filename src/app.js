require("dotenv").config();
const express  = require("express");
const path     = require("path");
const morgan   = require("morgan");
const helmet   = require("helmet");
const session  = require("express-session");
const passport = require("./config/passport");

// Routes
const authRoutes      = require("./routes/auth.routes");
const intentionRoutes = require("./routes/intention.routes");
const feedbackRoutes  = require("./routes/feedback.routes");
const menuRoutes      = require("./routes/menu.routes");
const canteenRoutes   = require("./routes/canteen.routes");
const orderRoutes     = require("./routes/orders.routes");
const budgetRoutes    = require("./routes/budget.routes");
const wasteRoutes     = require("./routes/waste.routes");

// Error middleware
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/auth", authRoutes);
app.use("/api/intentions", intentionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/canteen", canteenRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/waste", wasteRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;