# Architecture Brief

## Persistent context

Each startup run is a durable directory under `runs/<run-id>/`. The run contains `input.json`, `TASKS.md`, `PROMPTS.md`, `STAGE_STATUS.json`, and output artifacts. Future agents should treat these files as the source of truth, not chat history.

The project-level context lives in `BRIEF.md`, `docs/operating-system.md`, `system/stage-gates/`, and `system/roles/`. This keeps the system understandable even when a different model or human operator resumes the work later.

## Technical decisions

- Use local Node scripts with no external dependencies.
- Use Markdown for artifacts because it is easy for humans, Codex, and wanman agents to read.
- Use JSON for startup input and stage status.
- Keep validators heuristic and transparent rather than hiding logic behind an LLM.
- Separate stable workflow scripts from optional wanman orchestration.
- Make promotion a script because stage discipline should be executable, not just documented.

## Data model

Core entities:

- Startup brief: `name`, `idea`, `founderContext`, `targetCustomers`, `hypotheses`, `knownAlternatives`, `mustAnswer`, `constraints`.
- Run: `runId`, created timestamp, current status, stage status, required files.
- Stage artifact: Markdown file with required sections.
- Gate decision: Markdown file with a legal `Decision:` line and supporting evidence.

No customer data, account data, payment data, or remote API credentials are stored in v0.

## Interfaces

Command-line interface:

- `node scripts/new-startup-run.mjs <input.json> [--id <run-id>]`
- `node scripts/validate-stage.mjs <run-dir> idea`
- `node scripts/promote-stage.mjs <run-dir>`
- `node scripts/validate-stage.mjs <run-dir> all`

File interface:

- Operators edit Markdown artifacts.
- Agents receive exact file paths as task scope.
- Validators report missing or weak artifacts in plain terminal output.

## Risks

The architecture is intentionally simple, but validators can become brittle if artifact headings drift. The next iteration should add template files or generator hints for each artifact to reduce format variation.
