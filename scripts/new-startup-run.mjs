#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const IDEA_FILES = [
  "output/idea/problem-hypothesis.md",
  "output/idea/customer-discovery-plan.md",
  "output/idea/competitor-threat-map.md",
  "output/idea/disconfirming-evidence.md",
  "output/idea/solution-concept.md",
  "output/idea/source-index.md",
  "output/idea/gate-decision.md"
];

const IDEA_TEMPLATES = {
  "output/idea/problem-hypothesis.md": "system/templates/idea/problem-hypothesis.md",
  "output/idea/customer-discovery-plan.md": "system/templates/idea/customer-discovery-plan.md",
  "output/idea/competitor-threat-map.md": "system/templates/idea/competitor-threat-map.md",
  "output/idea/disconfirming-evidence.md": "system/templates/idea/disconfirming-evidence.md",
  "output/idea/solution-concept.md": "system/templates/idea/solution-concept.md",
  "output/idea/source-index.md": "system/templates/idea/source-index.md",
  "output/idea/gate-decision.md": "system/templates/idea/gate-decision.md"
};

function usage() {
  console.error("Usage: node scripts/new-startup-run.mjs <input.json> [--id <run-id>] [--from-output <dir>] [--force]");
  process.exit(2);
}

function parseArgs(argv) {
  const args = { input: argv[0], id: "", fromOutput: "", force: false };
  if (!args.input || args.input.startsWith("--")) usage();

  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--id") {
      args.id = argv[++i] || "";
    } else if (arg === "--from-output") {
      args.fromOutput = argv[++i] || "";
    } else if (arg === "--force") {
      args.force = true;
    } else {
      usage();
    }
  }

  return args;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "startup-run";
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function validateInput(input) {
  const errors = [];
  if (!input.name || typeof input.name !== "string") errors.push("name is required");
  if (!input.idea || typeof input.idea !== "string" || input.idea.length < 40) errors.push("idea must be at least 40 chars");
  if (!Array.isArray(input.targetCustomers) || input.targetCustomers.length === 0) errors.push("targetCustomers must be a non-empty array");
  if (!Array.isArray(input.hypotheses) || input.hypotheses.length === 0) errors.push("hypotheses must be a non-empty array");
  if (!Array.isArray(input.mustAnswer) || input.mustAnswer.length === 0) errors.push("mustAnswer must be a non-empty array");
  return errors;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
}

function copyDir(source, target) {
  if (!fs.existsSync(source)) return;
  ensureDir(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

function renderTasks(input) {
  return `# Startup Run Tasks - ${input.name}

## Input

- Idea: ${input.idea}
- Founder context: ${input.founderContext || "not specified"}
- Target customers: ${(input.targetCustomers || []).join(", ")}
- Region: ${input.region || "not specified"}

## Idea Stage

- [ ] Idea Researcher: write \`output/idea/problem-hypothesis.md\`
- [ ] Idea Researcher: write \`output/idea/customer-discovery-plan.md\`
- [ ] Idea Researcher: write \`output/idea/competitor-threat-map.md\`
- [ ] Devil's Advocate: write \`output/idea/disconfirming-evidence.md\`
- [ ] Solution Designer: write \`output/idea/solution-concept.md\`
- [ ] Idea Researcher: write \`output/idea/source-index.md\`
- [ ] Founder Orchestrator: write \`output/idea/gate-decision.md\`
- [ ] Run \`node scripts/validate-stage.mjs <this-run-dir> idea\`

## MVP Gate

Do not start this section until \`output/idea/gate-decision.md\` contains \`Decision: ALLOW_MVP\`.

- [ ] Run \`node scripts/promote-stage.mjs <this-run-dir>\`
- [ ] Product Architect: write \`output/mvp/mvp-scope.md\`
- [ ] Product Architect: write \`output/mvp/architecture-brief.md\`
- [ ] Product Architect: write \`output/mvp/measurement-framework.md\`
- [ ] Security Reviewer: write \`output/mvp/security-review.md\`
- [ ] Founder Orchestrator: write \`output/mvp/gate-decision.md\`
- [ ] Founder Orchestrator: write \`output/final-summary.md\`
- [ ] Run \`node scripts/validate-stage.mjs <this-run-dir> all\`

## Must Answer

${(input.mustAnswer || []).map(item => `- ${item}`).join("\n")}

## Known Alternatives

${(input.knownAlternatives || []).map(item => `- ${item}`).join("\n") || "- None provided"}
`;
}

function renderPrompts(input) {
  return `# Prompt Pack - ${input.name}

Use these prompts with Codex, wanman roles, or a human operator. Work inside this run directory.

## Founder Orchestrator

Read \`input.json\`, \`system/stage-gates/idea.md\`, and current idea artifacts. Produce \`output/idea/gate-decision.md\` with one legal decision: \`ALLOW_MVP\`, \`PIVOT\`, or \`BLOCK\`.

## Idea Researcher

Read \`input.json\` and \`system/roles/idea-researcher.md\`. Produce:

- \`output/idea/problem-hypothesis.md\`
- \`output/idea/customer-discovery-plan.md\`
- \`output/idea/competitor-threat-map.md\`
- \`output/idea/source-index.md\`

Hard stop after enough evidence to make a useful gate decision. Mark unsupported claims as \`needs verification\`.

## Devil's Advocate

Read idea research artifacts and \`system/roles/devils-advocate.md\`. Produce \`output/idea/disconfirming-evidence.md\`.

## Solution Designer

Read idea artifacts and \`system/roles/solution-designer.md\`. Produce \`output/idea/solution-concept.md\`.

## Product Architect

Run only after Idea Gate approval. Read idea artifacts and \`system/roles/product-architect.md\`. Produce:

- \`output/mvp/mvp-scope.md\`
- \`output/mvp/architecture-brief.md\`
- \`output/mvp/measurement-framework.md\`

## Security Reviewer

Read MVP scope and architecture. Produce \`output/mvp/security-review.md\`.
`;
}

function renderStatus(input, runId) {
  return JSON.stringify({
    runId,
    name: input.name,
    createdAt: new Date().toISOString(),
    status: "idea_created",
    stages: {
      idea: {
        status: "created",
        requiredFiles: IDEA_FILES
      },
      mvp: {
        status: "blocked_until_idea_gate",
        requiredFiles: []
      }
    }
  }, null, 2) + "\n";
}

const args = parseArgs(process.argv.slice(2));
const projectRoot = process.cwd();
const inputPath = path.resolve(projectRoot, args.input);
const input = readJson(inputPath);
const errors = validateInput(input);

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join("\n"));
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const runId = args.id || `${date}-${slugify(input.slug || input.name)}`;
const runDir = path.join(projectRoot, "runs", runId);

if (fs.existsSync(runDir) && !args.force) {
  console.error(`Run already exists: ${runDir}`);
  console.error("Use --force to overwrite generated scaffolding.");
  process.exit(1);
}

ensureDir(runDir);
writeFile(path.join(runDir, "input.json"), JSON.stringify(input, null, 2) + "\n");
writeFile(path.join(runDir, "TASKS.md"), renderTasks(input));
writeFile(path.join(runDir, "PROMPTS.md"), renderPrompts(input));
writeFile(path.join(runDir, "STAGE_STATUS.json"), renderStatus(input, runId));

for (const file of IDEA_FILES) {
  const templatePath = path.join(projectRoot, IDEA_TEMPLATES[file]);
  const content = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, "utf8") : "";
  writeFile(path.join(runDir, file), content);
}

if (args.fromOutput) {
  copyDir(path.resolve(projectRoot, args.fromOutput), path.join(runDir, "output"));
}

console.log(`Created startup run: ${runDir}`);
console.log(`Next: node scripts/validate-stage.mjs ${path.relative(projectRoot, runDir)} idea`);
