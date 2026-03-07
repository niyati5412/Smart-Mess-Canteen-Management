const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
router.get("/users/:id", authController.getUserById);
// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// GET /api/auth/users  (admin - see all users)
router.get("/users", authController.getAllUsers);

module.exports = router;