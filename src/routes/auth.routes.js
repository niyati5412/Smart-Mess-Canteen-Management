const express  = require("express");
const router   = express.Router();
const passport = require("passport");
const jwt      = require("jsonwebtoken");
const { upload } = require("../utils/multer.util"); 
const {
  register, login, getAllUsers, getUserById
} = require("../controllers/auth.controller");

// Normal routes
router.post("/register", upload.single("profilePic"), register);
router.post("/login",    login);
router.get("/users",     getAllUsers);
router.get("/users/:id", getUserById);

// Google OAuth routes
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),  
  async (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const user = req.user;

    // Session set karke redirect
    res.send(`
      <script>
        sessionStorage.setItem('mm_session', JSON.stringify({
          id:         "${user._id}",
          name:       "${user.name}",
          email:      "${user.email}",
          role:       "${user.role}",
          profilePic: "${user.profilePic || ''}",
          token:      "${token}"
        }));

        const role = "${user.role}";
        if(role === 'admin')       window.location.href = "/admin/dashboard";
        else if(role === 'guardian') window.location.href = "/guardian/dashboard";
        else                         window.location.href = "/student/dashboard";
      </script>
    `);
  }
);

module.exports = router;