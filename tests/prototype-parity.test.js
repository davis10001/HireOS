const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function readPrototype(fileName) {
  return fs.readFileSync(path.join(root, "frontend-prototype", fileName), "utf8");
}

test("Settings keeps the contract-defined app shell and governance containers", () => {
  const html = readPrototype("hireos-settings.html");

  [
    'class="app-shell"',
    'class="sidebar"',
    'class="main"',
    'class="topbar"',
    'class="page-content"',
    'class="agent"',
    'class="agent-dock"',
    "Workspace Configuration",
    "Mailbox Connections",
    "Roles & Permissions",
    "Status & SLA Defaults",
    "AI Automation Rules",
    "Hiring Templates",
    "Evidence Policy",
    "Audit Log",
    "Save Changes",
    "language-switch",
  ].forEach((needle) => assert.match(html, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("Settings Mailbox keeps tabs, mailbox scope, writeback, and permission containers", () => {
  const html = readPrototype("hireos-settings-mailbox.html");

  [
    "secondary-tabs",
    "Mailbox Connections",
    "Roles & Permissions",
    "Status & SLA",
    "AI Rules",
    "Connected Sources",
    "Email Processing Rules",
    "Write-back Boundaries",
    "Test Sync",
    "Add Mailbox",
    "Mailbox AI Workspace",
    "agent-dock",
  ].forEach((needle) => assert.match(html, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});
