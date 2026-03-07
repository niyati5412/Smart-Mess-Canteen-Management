const { readData, writeData } = require("../utils/file.util");
const crypto = require("crypto");

// GET ALL MENU
exports.getMenu = (req, res) => {
  const menu = readData("menu.json");
  res.json(menu);
};

// GET MENU BY ID
exports.getMenuItemById = (req, res) => {
  const menu = readData("menu.json");
  const item = menu.find(m => m.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  res.json(item);
};

// CREATE MENU ITEM
exports.createMenuItem = (req, res) => {
  const { name, meal, day } = req.body;

  if (!name || !meal || !day) {
    return res.status(400).json({ message: "name, meal, and day are required" });
  }

  const allowedMeals = ["breakfast", "lunch", "dinner", "snacks"];
  if (!allowedMeals.includes(meal)) {
    return res.status(400).json({ message: "Invalid meal type" });
  }

  const menu = readData("menu.json");

  const newItem = {
    id: crypto.randomUUID(),
    name,
    meal,
    day,
    createdAt: new Date().toISOString(),
  };

  menu.push(newItem);
  writeData("menu.json", menu);

  res.status(201).json(newItem);
};

// UPDATE MENU ITEM
exports.updateMenuItem = (req, res) => {
  const menu = readData("menu.json");
  const index = menu.findIndex(m => m.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  menu[index] = { ...menu[index], ...req.body };
  writeData("menu.json", menu);

  res.json(menu[index]);
};

// DELETE MENU ITEM
exports.deleteMenuItem = (req, res) => {
  const menu = readData("menu.json");
  const filtered = menu.filter(m => m.id !== req.params.id);

  if (filtered.length === menu.length) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  writeData("menu.json", filtered);

  res.json({ message: "Menu item deleted successfully" });
};