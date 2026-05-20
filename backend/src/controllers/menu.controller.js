const Menu = require("../models/menu.model");
function formatItem(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  if (Array.isArray(o.items) && o.items.length) {
    return o.items.map((name, i) => ({
      id:        `${o._id}_${i}`,
      _docId:    o._id,
      name:      name || "",
      meal:      o.mealType || "lunch",
      day:       o.day || "Monday",
      createdAt: o.createdAt,
    }));
  }
  return [{
    id:        o._id,
    name:      o.name || (o.items && o.items[0]) || "",
    meal:      o.mealType || o.meal || "lunch",
    day:       o.day || "Monday",
    createdAt: o.createdAt,
  }];
}

exports.getMenu = async (req, res) => {
  try {
    const docs = await Menu.find();
    const flat = docs.flatMap(formatItem);
    res.json(flat);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMenuItemById = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(formatItem(item)[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { name, meal, day, price } = req.body;
    if (!name || !day) 
      return res.status(400).json({ message: "name and day are required" });

    const mealType = (meal || "lunch").toLowerCase(); // ← add this

    const newDoc = await Menu.create({
      day,
      mealType,                // ← use mealType instead of meal
      items:    [name],
      price:    price || 0,
    });

    res.status(201).json({
      id:        newDoc._id,
      name:      name,
      meal:      mealType,     // ← use mealType here too
      day:       day,
      createdAt: newDoc.createdAt,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};


exports.updateMenuItem = async (req, res) => {
  try {
    const item = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(formatItem(item)[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const result = await Menu.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Menu item not found" });
    res.json({ message: "Menu item deleted successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};