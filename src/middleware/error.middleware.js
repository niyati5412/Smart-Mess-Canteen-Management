// 404 Handler
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  console.error(" Error:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = { notFound, errorHandler };