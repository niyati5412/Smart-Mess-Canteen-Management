const Canteen = require("../models/canteen.model");

exports.getItems = async (req, res) => {
  try {
    const items = await Canteen.find();
    // _id ko id mein convert karo frontend ke liye
    const formatted = items.map(item => ({
      ...item.toObject(),
      id: item._id.toString()
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.createItem = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    if (!name || !price || !category)
      return res.status(400).json({ message: "Missing fields" });
    const newItem = await Canteen.create({ name, price: Number(price), category });
    res.status(201).json(newItem);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Canteen.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Canteen.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};