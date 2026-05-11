const User   = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, wardStudentId } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required" });

    const allowedRoles = ["admin", "student", "guardian"];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    let wardName = null;
    if (role === "guardian") {
      if (!wardStudentId)
        return res.status(400).json({ message: "wardStudentId required for guardian" });
      const ward = await User.findById(wardStudentId);
      if (!ward)
        return res.status(404).json({ message: "Ward student not found" });
      wardName = ward.name;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
   const profilePic = req.file ? req.file.path : "";

    const newUser = await User.create({
      name, email,
      password: hashedPassword,
      role, profilePic,
      ...(role === "guardian" && { wardStudentId, wardName }),
    });

    const { password: _, ...safeUser } = newUser.toObject();
    res.status(201).json({ message: "Registered successfully", user: safeUser });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ── FIX: token is now included in response ──
    res.json({
      message: "Login successful",
      token,
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        profilePic: user.profilePic,
        messName:   user.messName || null,
        ...(user.role === "guardian" && {
          wardStudentId: user.wardStudentId,
          wardName:      user.wardName,
        }),
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};