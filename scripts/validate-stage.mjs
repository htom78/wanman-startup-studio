#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const IDEA_REQUIRED = [
  ["output/idea/problem-hypothesis.md", 700],
  ["output/idea/customer-discovery-plan.md", 700],
  ["output/idea/competitor-threat-map.md", 700],
  ["output/idea/disconfirming-evidence.md", 500],
  ["output/idea/solution-concept.md", 500],
  ["output/idea/source-index.md", 400],
  ["output/idea/gate-decision.md", 500]
];

const MVP_REQUIRED = [
  ["output/mvp/mvp-scope.md", 600],
  ["output/mvp/architecture-brief.md", 650],
  ["output/mvp/measurement-framework.md", 600],
  ["output/mvp/security-review.md", 500],
  ["output/mvp/gate-decision.md", 500],
  ["output/final-summary.md", 500]
];

function usage() {
  console.error("Usage: node scripts/validate-stage.mjs <run-dir> [idea|mvp|all]");
  process.exit(2);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function fail(failures, message) {
  failures.push(message);
}

function requireSections(failures, fileName, text, sections) {
  for (const section of sections) {
    if (!text.toLowerCase().includes(section.toLowerCase())) {
      fail(failures, `${fileName} missing section hint: ${section}`);
    }
  }
}

function requireRegex(failures, fileName, text, regex, message) {
  if (!regex.test(text)) fail(failures, `${fileName} ${message}`);
}

function validateRequired(root, required, failures) {
  for (const [relative, minBytes] of required) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) {
      fail(failures, `missing ${relative}`);
      continue;
    }
    const size = fs.statSync(file).size;
    if (size < minBytes) {
      fail(failures, `${relative} too small (${size} bytes, expected >= ${minBytes})`);
    }
    const text = read(file);
    if (/\b(TODO|TBD)\b/i.test(text)) {
      fail(failures, `${relative} still contains TODO/TBD placeholders`);
    }
  }
}

function validateIdea(root, failures) {
  validateRequired(root, IDEA_REQUIRED, failures);

  const files = {
    problem: "output/idea/problem-hypothesis.md",
    discovery: "output/idea/customer-discovery-plan.md",
    competitor: "output/idea/competitor-threat-map.md",
    disconfirming: "output/idea/disconfirming-evidence.md",
    concept: "output/idea/solution-concept.md",
    source: "output/idea/source-index.md",
    gate: "output/idea/gate-decision.md"
  };

  for (const relative of Object.values(files)) {
    if (!fs.existsSync(path.join(root, relative))) return;
  }

  const problem = read(path.join(root, files.problem));
  requireSections(failures, files.problem, problem, ["Problem", "Target customer", "Frequency", "Assumptions"]);

  const discovery = read(path.join(root, files.discovery));
  requireSections(failures, files.discovery, discovery, ["Interview questions", "Recruiting", "Leading questions", "Evidence capture"]);
  const questionCount = (discovery.match(/\?/g) || []).length;
  if (questionCount < 6) fail(failures, `${files.discovery} should include at least 6 customer interview questions`);

  const competitor = read(path.join(root, files.competitor));
  requireSections(failures, files.competitor, competitor, ["Direct", "Adjacent", "Manual", "Pricing", "Differentiation"]);

  const disconfirming = read(path.join(root, files.disconfirming));
  requireSections(failures, files.disconfirming, disconfirming, ["Strongest counterargument", "Kill criteria", "What would change our mind"]);

  const concept = read(path.join(root, files.concept));
  requireSections(failures, files.concept, concept, ["Workflow", "Not building", "Prototype"]);

  const source = read(path.join(root, files.source));
  requireRegex(failures, files.source, source, /https?:\/\//, "must include URLs");
  requireRegex(failures, files.source, source, /needs verification/i, "must include needs verification handling");

  const gate = read(path.join(root, files.gate));
  requireRegex(failures, files.gate, gate, /Decision:\s*(ALLOW_MVP|PIVOT|BLOCK)\b/i, "must include a legal Idea Gate decision");
  requireSections(failures, files.gate, gate, ["Evidence", "Risks", "Next step"]);
}

function validateMvp(root, failures) {
  validateRequired(root, MVP_REQUIRED, failures);

  const files = {
    scope: "output/mvp/mvp-scope.md",
    architecture: "output/mvp/architecture-brief.md",
    measurement: "output/mvp/measurement-framework.md",
    security: "output/mvp/security-review.md",
    gate: "output/mvp/gate-decision.md",
    summary: "output/final-summary.md"
  };

  for (const relative of Object.values(files)) {
    if (!fs.existsSync(path.join(root, relative))) return;
  }

  const scope = read(path.join(root, files.scope));
  requireSections(failures, files.scope, scope, ["In scope", "Out of scope", "First user task", "Non-goals"]);

  const architecture = read(path.join(root, files.architecture));
  requireSections(failures, files.architecture, architecture, ["Persistent context", "Technical decisions", "Data model", "Interfaces"]);

  const measurement = read(path.join(root, files.measurement));
  requireSections(failures, files.measurement, measurement, ["Activation", "Retention", "Revenue", "Referral", "Instrumentation"]);

  const security = read(path.join(root, files.security));
  requireSections(failures, files.security, security, ["Data", "Auth", "Abuse", "Pre-launch checks"]);

  const gate = read(path.join(root, files.gate));
  requireRegex(failures, files.gate, gate, /Decision:\s*(BUILD|REVISE|STOP)\b/i, "must include a legal MVP Gate decision");
  requireSections(failures, files.gate, gate, ["Build readiness", "Risks", "First sprint"]);

  const summary = read(path.join(root, files.summary));
  requireSections(failures, files.summary, summary, ["Recommendation", "Stage status", "Next actions"]);
}

const runDir = process.argv[2];
const stage = process.argv[3] || "idea";
if (!runDir || !["idea", "mvp", "all"].includes(stage)) usage();

const root = path.resolve(process.cwd(), runDir);
const failures = [];

if (!fs.existsSync(root)) {
  fail(failures, `run directory does not exist: ${root}`);
} else {
  if (stage === "idea" || stage === "all") validateIdea(root, failures);
  if (stage === "mvp" || stage === "all") validateMvp(root, failures);
}

if (failures.length) {
  console.error("Validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validation passed: ${root} (${stage})`);
