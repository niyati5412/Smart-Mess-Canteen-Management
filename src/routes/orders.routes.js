const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/orders.controller");

// ⚠️ CRITICAL: /mark-all-delivered MUST be before /:id routes
// otherwise Express matches "mark-all-delivered" as an :id param
router.put("/mark-all-delivered", controller.markAllDelivered);

router.get("/",           controller.getOrders);
router.post("/",          controller.createOrder);
router.get("/:id",        controller.getOrderById);
router.put("/:id/status", controller.updateOrderStatus);

module.exports = router;