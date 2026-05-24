#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const MVP_FILES = [
  "output/mvp/mvp-scope.md",
  "output/mvp/architecture-brief.md",
  "output/mvp/measurement-framework.md",
  "output/mvp/security-review.md",
  "output/mvp/gate-decision.md",
  "output/final-summary.md"
];

const MVP_TEMPLATES = {
  "output/mvp/mvp-scope.md": "system/templates/mvp/mvp-scope.md",
  "output/mvp/architecture-brief.md": "system/templates/mvp/architecture-brief.md",
  "output/mvp/measurement-framework.md": "system/templates/mvp/measurement-framework.md",
  "output/mvp/security-review.md": "system/templates/mvp/security-review.md",
  "output/mvp/gate-decision.md": "system/templates/mvp/gate-decision.md",
  "output/final-summary.md": "system/templates/mvp/final-summary.md"
};

function usage() {
  console.error("Usage: node scripts/promote-stage.mjs <run-dir> [--force]");
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

function parseIdeaDecision(markdown) {
  const match = markdown.match(/Decision:\s*(ALLOW_MVP|PIVOT|BLOCK)\b/i);
  return match ? match[1].toUpperCase() : "";
}

function updateStatus(runDir) {
  const statusPath = path.join(runDir, "STAGE_STATUS.json");
  const status = fs.existsSync(statusPath) ? JSON.parse(read(statusPath)) : {};
  status.status = "mvp_created";
  status.updatedAt = new Date().toISOString();
  status.stages = status.stages || {};
  status.stages.idea = {
    ...(status.stages.idea || {}),
    status: "passed"
  };
  status.stages.mvp = {
    status: "created",
    requiredFiles: MVP_FILES
  };
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2) + "\n");
}

const args = parseArgs(process.argv.slice(2));
const runDir = path.resolve(process.cwd(), args.runDir);
const decisionFile = path.join(runDir, "output/idea/gate-decision.md");

if (!fs.existsSync(decisionFile)) {
  console.error(`Missing Idea Gate decision: ${decisionFile}`);
  process.exit(1);
}

const decision = parseIdeaDecision(read(decisionFile));

if (!decision) {
  console.error("Idea Gate decision must include one of: Decision: ALLOW_MVP, Decision: PIVOT, Decision: BLOCK");
  process.exit(1);
}

if (decision !== "ALLOW_MVP") {
  console.error(`Cannot promote to MVP Gate. Idea Gate says: ${decision}`);
  process.exit(1);
}

let created = 0;
for (const file of MVP_FILES) {
  const templatePath = path.join(process.cwd(), MVP_TEMPLATES[file]);
  const content = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, "utf8") : "";
  if (writeIfSafe(path.join(runDir, file), content, args.force)) created += 1;
}

updateStatus(runDir);

console.log(`Promoted to MVP Gate: ${runDir}`);
console.log(`Created or refreshed ${created} MVP files.`);
console.log(`Next: node scripts/validate-stage.mjs ${path.relative(process.cwd(), runDir)} mvp`);
