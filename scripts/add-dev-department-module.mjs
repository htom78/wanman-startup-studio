#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const MODULE_NAME = "dev-department";
const DEV_FILES = [
  "output/modules/mvp/dev-department/department-plan.md",
  "output/modules/mvp/dev-department/parallel-task-graph.json",
  "output/modules/mvp/dev-department/agent-lanes.md",
  "output/modules/mvp/dev-department/worktree-strategy.md",
  "output/modules/mvp/dev-department/integration-plan.md",
  "output/modules/mvp/dev-department/review-gate.md"
];

const DEV_TEMPLATES = {
  "output/modules/mvp/dev-department/department-plan.md": "modules/mvp/dev-department/templates/department-plan.md",
  "output/modules/mvp/dev-department/parallel-task-graph.json": "modules/mvp/dev-department/templates/parallel-task-graph.json",
  "output/modules/mvp/dev-department/agent-lanes.md": "modules/mvp/dev-department/templates/agent-lanes.md",
  "output/modules/mvp/dev-department/worktree-strategy.md": "modules/mvp/dev-department/templates/worktree-strategy.md",
  "output/modules/mvp/dev-department/integration-plan.md": "modules/mvp/dev-department/templates/integration-plan.md",
  "output/modules/mvp/dev-department/review-gate.md": "modules/mvp/dev-department/templates/review-gate.md"
};

function usage() {
  console.error("Usage: node scripts/add-dev-department-module.mjs <run-dir> [--force]");
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

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function writeIfSafe(file, content, force) {
  ensureDir(path.dirname(file));
  if (fs.existsSync(file) && fs.statSync(file).size > 0 && !force) return false;
  fs.writeFileSync(file, content);
  return true;
}

function parseMvpDecision(markdown) {
  const match = markdown.match(/Decision:\s*(BUILD|REVISE|STOP)\b/i);
  return match ? match[1].toUpperCase() : "";
}

function updateStatus(runDir) {
  const statusPath = path.join(runDir, "STAGE_STATUS.json");
  const status = fs.existsSync(statusPath) ? JSON.parse(read(statusPath)) : {};
  status.updatedAt = new Date().toISOString();
  status.modules = status.modules || {};
  status.modules[MODULE_NAME] = {
    stage: "mvp",
    status: "created",
    requiredFiles: DEV_FILES
  };
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2) + "\n");
}

const args = parseArgs(process.argv.slice(2));
const projectRoot = process.cwd();
const runDir = path.resolve(projectRoot, args.runDir);
const decisionFile = path.join(runDir, "output/mvp/gate-decision.md");

if (!fs.existsSync(runDir)) {
  console.error(`Run directory does not exist: ${runDir}`);
  process.exit(1);
}

if (!fs.existsSync(decisionFile)) {
  console.error(`Missing MVP Gate decision: ${decisionFile}`);
  process.exit(1);
}

const decision = parseMvpDecision(read(decisionFile));
if (!decision) {
  console.error("MVP Gate decision must include one of: Decision: BUILD, Decision: REVISE, Decision: STOP");
  process.exit(1);
}

if (decision !== "BUILD") {
  console.error(`Cannot create Dev Department. MVP Gate says: ${decision}`);
  process.exit(1);
}

let created = 0;
for (const file of DEV_FILES) {
  const templatePath = path.join(projectRoot, DEV_TEMPLATES[file]);
  const content = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, "utf8") : "";
  if (writeIfSafe(path.join(runDir, file), content, args.force)) created += 1;
}

updateStatus(runDir);

console.log(`Added Dev Department module: ${runDir}`);
console.log(`Created or refreshed ${created} Dev Department files.`);
console.log(`Next: node scripts/validate-stage.mjs ${path.relative(projectRoot, runDir)} dev`);

