#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const studioRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const callerCwd = process.cwd();

const COMMANDS = {
  new: "scripts/new-startup-run.mjs",
  validate: "scripts/validate-stage.mjs",
  promote: "scripts/promote-stage.mjs",
  "add-product-research": "scripts/add-product-research-module.mjs",
  "add-dev": "scripts/add-dev-department-module.mjs"
};

function usage() {
  console.log(`Wanman Startup Studio

Usage:
  startup-studio new <input.json> [--id <run-id>] [--from-output <dir>] [--force]
  startup-studio validate <run-dir> [idea|mvp|product-research|dev|all]
  startup-studio promote <run-dir> [--force]
  startup-studio add product-research <run-dir> [--force]
  startup-studio add dev <run-dir> [--force]
  startup-studio root
  startup-studio help
`);
}

function absoluteFromCaller(value) {
  if (!value || value.startsWith("--")) return value;
  return path.isAbsolute(value) ? value : path.resolve(callerCwd, value);
}

function runScript(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: studioRoot,
    stdio: "inherit"
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

function commandArgs(command, args) {
  if (command === "new") {
    const nextArgs = [absoluteFromCaller(args[0])];
    for (let index = 1; index < args.length; index += 1) {
      const arg = args[index];
      nextArgs.push(arg);
      if (arg === "--from-output" && args[index + 1]) {
        nextArgs.push(absoluteFromCaller(args[index + 1]));
        index += 1;
      }
    }
    return nextArgs;
  }
  if (["validate", "promote", "add-product-research", "add-dev"].includes(command)) {
    return [absoluteFromCaller(args[0]), ...args.slice(1)];
  }
  return args;
}

const [rawCommand, ...rawArgs] = process.argv.slice(2);
const command = rawCommand || "help";

if (command === "help" || command === "--help" || command === "-h") {
  usage();
  process.exit(0);
}

if (command === "root") {
  console.log(studioRoot);
  process.exit(0);
}

if (command === "add") {
  const [moduleName, runDir, ...rest] = rawArgs;
  if (moduleName === "product-research") {
    runScript(COMMANDS["add-product-research"], commandArgs("add-product-research", [runDir, ...rest]));
  }
  if (moduleName === "dev") {
    runScript(COMMANDS["add-dev"], commandArgs("add-dev", [runDir, ...rest]));
  }
  usage();
  process.exit(2);
}

if (!COMMANDS[command]) {
  usage();
  process.exit(2);
}

runScript(COMMANDS[command], commandArgs(command, rawArgs));
