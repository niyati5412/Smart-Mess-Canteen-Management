const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Token check
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token — access denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // user info request mein add ho jaayegi
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Sirf admin allow karo
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Sirf student allow karo
const studentOnly = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({ message: "Student access required" });
  }
  next();
};

module.exports = { protect, adminOnly, studentOnly };