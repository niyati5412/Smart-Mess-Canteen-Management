const express = require("express");
const router = express.Router();
const controller = require("../controllers/orders.controller");

router.get("/", controller.getOrders);
router.post("/", controller.createOrder);
router.put("/:id/status", controller.updateOrderStatus);
router.put("/mark-all-delivered", controller.markAllDelivered);

module.exports = router;