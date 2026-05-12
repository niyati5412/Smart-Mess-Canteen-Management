const User     = require("../models/user.model");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const mongoose = require("mongoose");

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, wardStudentId } = req.body;

    // 1. Basic field validation
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required" });

    // 2. Role validation
    const allowedRoles = ["admin", "student", "guardian"];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: "Invalid role" });

    // 3. Duplicate email check
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    // 4. Guardian-specific validation
    let wardName = null;
    if (role === "guardian") {
      // 4a. wardStudentId must be provided
      if (!wardStudentId)
        return res.status(400).json({ message: "wardStudentId is required for guardian" });

      // 4b. Must be a valid MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(wardStudentId))
        return res.status(400).json({ message: "Invalid wardStudentId format" });

      // 4c. Student must exist AND have role "student"
      const ward = await User.findOne({ _id: wardStudentId, role: "student" });
      if (!ward)
        return res.status(404).json({
          message:
            "Ward student not found. Please make sure your ward has already created a MessMate student account and the ID is correct.",
        });

      wardName = ward.name;
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Profile pic (from multer)
    const profilePic = req.file ? req.file.path : "";

    // 7. Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      profilePic,
      ...(role === "guardian" && { wardStudentId, wardName }),
    });

    // 8. Return safe user object (no password)
    const { password: _, ...safeUser } = newUser.toObject();
    res.status(201).json({ message: "Registered successfully", user: safeUser });

  } catch (err) {
    console.error("[register error]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

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
    console.error("[login error]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/users
// ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("[getAllUsers error]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/users/:id
// ─────────────────────────────────────────────
exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid user ID format" });

    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("[getUserById error]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};