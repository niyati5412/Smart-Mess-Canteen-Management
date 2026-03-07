const { readData, writeData } = require("../utils/file.util");
const crypto = require("crypto");

// Get all items
exports.getItems = (req, res) => {
  const items = readData("canteen.json");
  res.json(items);
};

// Add new item (Admin)
exports.createItem = (req, res) => {
  const { name, price, category } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const items = readData("canteen.json");

  const newItem = {
    id: crypto.randomUUID(),
    name,
    price: Number(price),
    category,
    available: true
  };

  items.push(newItem);
  writeData("canteen.json", items);

  res.status(201).json(newItem);
};

// Toggle availability
exports.updateItem = (req, res) => {
  const items = readData("canteen.json");
  const index = items.findIndex(i => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  items[index] = { ...items[index], ...req.body };

  writeData("canteen.json", items);
  res.json(items[index]);
};

// Delete item
exports.deleteItem = (req, res) => {
  const items = readData("canteen.json");
  const filtered = items.filter(i => i.id !== req.params.id);

  writeData("canteen.json", filtered);
  res.json({ message: "Deleted" });
};