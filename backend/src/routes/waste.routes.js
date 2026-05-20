const express = require("express");
const router = express.Router();
const controller = require("../controllers/waste.controller");

router.get("/", controller.getWaste);
router.post("/", controller.addWaste);
router.delete("/:id", controller.deleteWaste);

module.exports = router;