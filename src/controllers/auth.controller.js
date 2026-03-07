const { readData, writeData } = require("../utils/file.util");
const crypto = require("crypto");

// ─────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password, role, wardStudentId? }
// ─────────────────────────────────────────
exports.register = (req, res) => {
  const { name, email, password, role, wardStudentId } = req.body;

  // Validate all fields present
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate role
  const allowedRoles = ["admin", "student", "guardian"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Role must be admin, student, or guardian" });
  }

  const users = readData("users.json");

  // Check duplicate email
  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  // If guardian — wardStudentId required
  if (role === "guardian" && !wardStudentId) {
    return res.status(400).json({ message: "wardStudentId is required for guardian registration" });
  }

  // If guardian — find ward's name from users
  let wardName = null;
  if (role === "guardian" && wardStudentId) {
    const ward = users.find((u) => u.id === wardStudentId);
    if (!ward) {
      return res.status(404).json({ message: "Ward student not found with given wardStudentId" });
    }
    wardName = ward.name;
  }

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    role,
    ...(role === "guardian" && { wardStudentId, wardName }),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeData("users.json", users);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ message: "Registered successfully", user: safeUser });
};

// ─────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ─────────────────────────────────────────
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const users = readData("users.json");
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // ✅ wardStudentId + wardName bhi bhejo agar guardian hai
  res.json({
    message: "Login successful",
    user: {
      id:           user.id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      ...(user.role === "guardian" && {
        wardStudentId: user.wardStudentId || null,
        wardName:      user.wardName      || null,
      }),
    },
  });
};

// ─────────────────────────────────────────
// GET /api/auth/users  (admin use)
// ─────────────────────────────────────────
exports.getAllUsers = (req, res) => {
  const users = readData("users.json");
  const safeUsers = users.map(({ password, ...rest }) => rest);
  res.json(safeUsers);
};

// ─────────────────────────────────────────
// GET /api/auth/users/:id
// ─────────────────────────────────────────
exports.getUserById = (req, res) => {
  const { id } = req.params;
  const users = readData("users.json");
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { password, ...safeUser } = user;
  res.json(safeUser);
};