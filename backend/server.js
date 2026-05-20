require("dotenv").config();
const http      = require("http");
const app       = require("./src/app");
const connectDB = require("./src/config/db");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

// HTTP server banao
const server = new http.createServer(app);

// Socket.io attach karo
const io = new Server(server, {
  cors: { origin: "*" }
});

// Socket.io global available karo
global.io = io;

// Socket events
io.on("connection", (socket) => {
  console.log(`⚡ New client connected: ${socket.id}`);

  // Admin room mein join karo
  socket.on("join-admin", () => {
    socket.join("admin-room");
    console.log(`👨‍💼 Admin joined admin-room`);
  });

  // Student room mein join karo
  socket.on("join-student", (studentId) => {
    socket.join(`student-${studentId}`);
    console.log(`🎓 Student ${studentId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// DB connect karke server start karo
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ MessMate server running at http://localhost:${PORT}`);
    console.log(`📂 Frontend at   http://localhost:${PORT}/`);
    console.log(`🔌 API at        http://localhost:${PORT}/api`);
    console.log(`⚡ Socket.io ready!`);
  });
});