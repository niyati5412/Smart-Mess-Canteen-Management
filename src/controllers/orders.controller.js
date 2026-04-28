const Order    = require("../models/order.model");
const User     = require("../models/user.model");
const mongoose = require("mongoose");

function formatOrder(order) {
  const o = order.toObject ? order.toObject() : order;
  return {
    id:            o._id,
    _id:           o._id,
    orderId:       o.orderId || String(o._id).slice(-6).toUpperCase(),
    studentId:     o.studentId,
    studentName:   o.studentName || "Unknown",
    roll:          o.roll        || "",
    dept:          o.dept        || "",
    items:         o.items       || [],
    meal:          o.meal        || "Lunch",
    totalAmount:   o.totalAmount || o.totalPrice || 0,
    time:          o.time        || new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    status:        o.status        || "pending",
    paymentStatus: o.paymentStatus || "unpaid",
    createdAt:     o.createdAt,
  };
}

// GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const resolved = await Promise.all(orders.map(async (order) => {
      const o = order.toObject ? order.toObject() : order;
      if ((!o.studentName || o.studentName.trim() === "") && o.studentId) {
        try {
          const user = await User.findById(o.studentId).select("name roll dept");
          if (user) {
            o.studentName = user.name || "Unknown";
            o.roll        = user.roll || "";
            o.dept        = user.dept || "";
            await Order.findByIdAndUpdate(o._id, {
              studentName: o.studentName,
              roll:        o.roll,
              dept:        o.dept,
            });
          }
        } catch (_) {}
      }
      return formatOrder(o);
    }));

    res.json(resolved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      studentId, studentName, roll, dept,
      items, meal, totalAmount, paymentStatus, source
    } = req.body;

    if (!studentId || !totalAmount)
      return res.status(400).json({ message: "studentId and totalAmount are required" });

    let resolvedName = studentName, resolvedRoll = roll, resolvedDept = dept;
    if (!resolvedName && studentId) {
      try {
        const student = await User.findById(studentId).select("name roll dept");
        if (student) {
          resolvedName = student.name || "";
          resolvedRoll = student.roll || "";
          resolvedDept = student.dept || "";
        }
      } catch (_) {}
    }

    const order = await Order.create({
      studentId,
      studentName:   resolvedName || "",
      roll:          resolvedRoll || "",
      dept:          resolvedDept || "",
      items:         items        || [],
      meal:          meal         || "Lunch",
      totalAmount,
      paymentStatus: paymentStatus || "unpaid",
      status:        "pending",
      time:          new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      menuId:        new mongoose.Types.ObjectId(),
      quantity:      items?.length || 1,
      totalPrice:    totalAmount,
    });

    if (global.io) {
      global.io.to("admin-room").emit("new-order", {
        message:     "New order placed!",
        order:       formatOrder(order),
        studentName: resolvedName,
        time:        order.time,
      });
    }

    res.status(201).json({ message: "Order placed successfully", order: formatOrder(order) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/mark-all-delivered
exports.markAllDelivered = async (req, res) => {
  try {
    await Order.updateMany(
      { status: { $nin: ["delivered", "cancelled"] } },
      { $set: { status: "delivered" } }
    );

    if (global.io) {
      global.io.to("admin-room").emit("all-delivered", {
        message: "All orders marked as delivered!"
      });
    }

    res.json({ message: "All orders marked as delivered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["pending","preparing","ready","delivered","cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status: " + status });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (global.io) {
      global.io.to(`student-${order.studentId}`).emit("order-status-update", {
        orderId: order._id,
        status,
        message: `Your order is now ${status}!`
      });
    }

    res.json(formatOrder(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(formatOrder(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};