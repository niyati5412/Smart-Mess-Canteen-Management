const express  = require("express");
const router   = express.Router();
const passport = require("passport");
const jwt      = require("jsonwebtoken");
const { upload } = require("../utils/multer.util"); 
const {
  register, login, getAllUsers, getUserById, linkWard, updateProfilePic
} = require("../controllers/auth.controller");

// Normal routes
router.post("/register", upload.single("profilePic"), register);
router.post("/login",    login);
router.get("/users",     getAllUsers);
router.get("/users/:id", getUserById);
router.post("/link-ward", linkWard);
router.post("/update-profile-pic", upload.single("profilePic"), updateProfilePic);

// Google OAuth routes
router.get("/google", (req, res, next) => {
  const role = req.query.role || "student";
  passport.authenticate("google", { 
    scope: ["profile", "email"], 
    prompt: "select_account",
    state: role 
  })(req, res, next);
});

router.get("/google/callback",
  (req, res, next) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    passport.authenticate("google", { failureRedirect: `${frontendUrl}/login` })(req, res, next);
  },
  async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const user = req.user;

    const target = `${frontendUrl}/login?oauth_token=${token}&oauth_id=${user._id}&oauth_name=${encodeURIComponent(user.name)}&oauth_email=${user.email}&oauth_role=${user.role}&oauth_profilePic=${encodeURIComponent(user.profilePic || '')}`;
    res.redirect(target);
  }
);

module.exports = router;