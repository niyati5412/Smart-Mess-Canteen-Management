

const app = require("./src/app");

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`✅ MessMate server running at http://localhost:${PORT}`);
  console.log(`📂 Serving frontend at   http://localhost:${PORT}/`);
  console.log(`🔌 API available at      http://localhost:${PORT}/api`);
});
















