const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");

// GET    /api/menu
router.get("/", menuController.getMenu);

// GET    /api/menu/:id
router.get("/:id", menuController.getMenuItemById);

// POST   /api/menu
router.post("/", menuController.createMenuItem);

// PUT    /api/menu/:id
router.put("/:id", menuController.updateMenuItem);

// DELETE /api/menu/:id
router.delete("/:id", menuController.deleteMenuItem);

module.exports = router;