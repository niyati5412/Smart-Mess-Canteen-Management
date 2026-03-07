const fs = require("fs");
const path = require("path");

// Generic utility — pass any filename
const getFilePath = (filename) => {
  return path.join(__dirname, "../../data", filename);
};

const readData = (filename) => {
  const filePath = getFilePath(filename);
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

const writeData = (filename, data) => {
  const filePath = getFilePath(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };