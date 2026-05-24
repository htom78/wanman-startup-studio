#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const MODULE_NAME = "product-research";
const MODULE_FILES = [
  "output/modules/idea/product-research/competitor-map.md",
  "output/modules/idea/product-research/source-index.md",
  "output/modules/idea/product-research/positioning-notes.md",
  "output/modules/idea/product-research/landing-page-experiment.md"
];

const MODULE_TEMPLATES = {
  "output/modules/idea/product-research/competitor-map.md": "modules/idea/product-research/templates/competitor-map.md",
  "output/modules/idea/product-research/source-index.md": "modules/idea/product-research/templates/source-index.md",
  "output/modules/idea/product-research/positioning-notes.md": "modules/idea/product-research/templates/positioning-notes.md",
  "output/modules/idea/product-research/landing-page-experiment.md": "modules/idea/product-research/templates/landing-page-experiment.md"
};

function usage() {
  console.error("Usage: node scripts/add-product-research-module.mjs <run-dir> [--force]");
  process.exit(2);
}

function parseArgs(argv) {
  const args = { runDir: argv[0], force: false };
  if (!args.runDir || args.runDir.startsWith("--")) usage();
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i] === "--force") {
      args.force = true;
    } else {
      usage();
    }
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeIfSafe(file, content, force) {
  ensureDir(path.dirname(file));
  if (fs.existsSync(file) && fs.statSync(file).size > 0 && !force) return false;
  fs.writeFileSync(file, content);
  return true;
}

function readTemplate(projectRoot, relative) {
  const file = path.join(projectRoot, relative);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function updateStatus(runDir) {
  const statusPath = path.join(runDir, "STAGE_STATUS.json");
  const status = fs.existsSync(statusPath) ? readJson(statusPath) : {};
  status.updatedAt = new Date().toISOString();
  status.modules = status.modules || {};
  status.modules[MODULE_NAME] = {
    stage: "idea",
    status: "created",
    requiredFiles: MODULE_FILES
  };
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2) + "\n");
}

const args = parseArgs(process.argv.slice(2));
const projectRoot = process.cwd();
const runDir = path.resolve(projectRoot, args.runDir);

if (!fs.existsSync(runDir)) {
  console.error(`Run directory does not exist: ${runDir}`);
  process.exit(1);
}

if (!fs.existsSync(path.join(runDir, "input.json"))) {
  console.error(`Run directory is missing input.json: ${runDir}`);
  process.exit(1);
}

let created = 0;
for (const file of MODULE_FILES) {
  const content = readTemplate(projectRoot, MODULE_TEMPLATES[file]);
  if (writeIfSafe(path.join(runDir, file), content, args.force)) created += 1;
}

updateStatus(runDir);

console.log(`Added product-research module: ${runDir}`);
console.log(`Created or refreshed ${created} module files.`);
console.log(`Next: node scripts/validate-stage.mjs ${path.relative(projectRoot, runDir)} product-research`);

