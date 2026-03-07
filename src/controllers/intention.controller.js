const { readData, writeData } = require("../utils/file.util");
const crypto = require("crypto");

// ─────────────────────────────────────────
// GET /api/intentions
// Returns all intentions
// ─────────────────────────────────────────
exports.getIntentions = (req, res) => {
  const intentions = readData("intentions.json");
  res.json(intentions);
};

// ─────────────────────────────────────────
// GET /api/intentions/student/:studentId
// Returns intentions for one student
// ─────────────────────────────────────────
exports.getIntentionsByStudent = (req, res) => {
  const intentions = readData("intentions.json");
  const studentIntentions = intentions.filter(
    (i) => i.studentId === req.params.studentId
  );
  res.json(studentIntentions);
};

// ─────────────────────────────────────────
// POST /api/intentions
// Body: { studentId, studentName, meal, date, status }
// meal: "breakfast" | "lunch" | "dinner" | "snacks"
// status: "eating" | "skipping"
// ─────────────────────────────────────────
exports.createIntention = (req, res) => {
  const { studentId, studentName, meal, date, status } = req.body;

  if (!studentId || !meal || !date || !status) {
    return res.status(400).json({ message: "studentId, meal, date, and status are required" });
  }

  const intentions = readData("intentions.json");

  const index = intentions.findIndex(
    (i) => i.studentId === studentId && i.meal === meal && i.date === date
  );

  if (index !== -1) {
    // 🔥 UPDATE existing instead of blocking
    intentions[index].status = status;
    intentions[index].updatedAt = new Date().toISOString();

    writeData("intentions.json", intentions);

    return res.json(intentions[index]);
  }

  const newIntention = {
    id: crypto.randomUUID(),
    studentId,
    studentName,
    meal,
    date,
    status,
    createdAt: new Date().toISOString(),
  };

  intentions.push(newIntention);
  writeData("intentions.json", intentions);

  res.status(201).json(newIntention);
};

// ─────────────────────────────────────────
// PUT /api/intentions/:id
// Update status of an existing intention
// ─────────────────────────────────────────
exports.updateIntention = (req, res) => {
  const intentions = readData("intentions.json");
  const index = intentions.findIndex((i) => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Intention not found" });
  }

  intentions[index] = { ...intentions[index], ...req.body };
  writeData("intentions.json", intentions);

  res.json(intentions[index]);
};

// ─────────────────────────────────────────
// DELETE /api/intentions/:id
// ─────────────────────────────────────────
exports.deleteIntention = (req, res) => {
  const intentions = readData("intentions.json");
  const filtered = intentions.filter((i) => i.id !== req.params.id);

  if (filtered.length === intentions.length) {
    return res.status(404).json({ message: "Intention not found" });
  }

  writeData("intentions.json", filtered);
  res.json({ message: "Intention deleted successfully" });
};