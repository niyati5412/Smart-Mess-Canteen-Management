const { readData, writeData } = require("../utils/file.util");
const crypto = require("crypto");

// GET ALL ORDERS
exports.getOrders = (req, res) => {
  const orders = readData("orders.json");
  res.json(orders);
};

// CREATE ORDER (Student side)
exports.createOrder = (req, res) => {
  const { studentId, studentName, items } = req.body;

  if (!studentId || !studentName || !items || !items.length) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const orders = readData("orders.json");

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const newOrder = {
    id: crypto.randomUUID(),
    orderId: "MM-" + Date.now(),
    studentId,
    studentName,
    items,
    totalAmount,
    paymentStatus: "paid",
    status: "pending",
    time: new Date().toLocaleTimeString()
  };

  orders.push(newOrder);
  writeData("orders.json", orders);

  res.status(201).json(newOrder);
};

// UPDATE STATUS
exports.updateOrderStatus = (req, res) => {
  console.log(" PUT HIT", req.params.id, req.body);

  const { status } = req.body;
  const orders = readData("orders.json");

  const index = orders.findIndex(o => o.id === req.params.id);

  if (index === -1) {
    console.log("❌ Order not found");
    return res.status(404).json({ message: "Order not found" });
  }

  orders[index].status = status;

  writeData("orders.json", orders);

  console.log("✅ Updated successfully");
  res.json(orders[index]);
};

// MARK ALL DELIVERED
exports.markAllDelivered = (req, res) => {
  const orders = readData("orders.json");

  orders.forEach(o => {
    if (o.status !== "cancelled") {
      o.status = "delivered";
    }
  });

  writeData("orders.json", orders);

  res.json({ message: "All orders marked delivered" });
};