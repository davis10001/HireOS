const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "frontend-prototype/hireos-settings.html",
  "frontend-prototype/hireos-settings-mailbox.html",
  "frontend-prototype/hireos-pages.css",
  "frontend-prototype/hireos-pages.js",
  "frontend-prototype/hireos-governance-state.js",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length > 0) {
  console.error(`Missing build inputs: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Static prototype build inputs verified.");
