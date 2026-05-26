# Worktree Strategy

## Runner options

Use Codex worktrees as the default runner for the next implementation pass. Wanman can orchestrate agents later, and Emdash can be evaluated as an execution shell later, but this build does not require either one. The immediate need is isolated coding lanes with clear file ownership, tests, and an integration branch.

Recommended branches:

- `dev/foundation-trust-loop`
- `dev/composer-intents`
- `dev/notebook-revision-ux`
- `dev/validation-telemetry`
- `dev/qa-trust-loop`
- `dev/integration-trust-loop`

## Isolation model

All product code changes belong in `/Volumes/PortableSSD/Projects/Codex_Projects/monospend-ai-ledger`. Startup-studio artifacts remain the planning and validation record.

Suggested ownership:

- Foundation: shared schema, storage helpers, config helpers, fixture files, baseline tests.
- Composer: Composer service/API, prompt/schema version, fallback parser tests.
- Notebook UX: app UI, line edit controls, stale-note display, delete interaction, responsive styling.
- Validation Telemetry: local event counters, tester script export, validation fixtures.
- QA: tests, smoke scripts, accessibility notes, known limitations.
- Integration: merge fixes, release notes, final verification.

No lane should rewrite unrelated files for style cleanup. Shared contracts must be changed through Foundation or Integration.

## Shared context

Every agent must read these files before coding:

- `/Volumes/PortableSSD/Projects/Codex_Projects/wanman-startup-studio/runs/monospend-ai-notebook-validation/input.json`
- `/Volumes/PortableSSD/Projects/Codex_Projects/wanman-startup-studio/runs/monospend-ai-notebook-validation/output/mvp/mvp-scope.md`
- `/Volumes/PortableSSD/Projects/Codex_Projects/wanman-startup-studio/runs/monospend-ai-notebook-validation/output/mvp/architecture-brief.md`
- `/Volumes/PortableSSD/Projects/Codex_Projects/wanman-startup-studio/runs/monospend-ai-notebook-validation/output/mvp/measurement-framework.md`
- `/Volumes/PortableSSD/Projects/Codex_Projects/wanman-startup-studio/runs/monospend-ai-notebook-validation/output/mvp/security-review.md`
- `/Volumes/PortableSSD/Projects/Codex_Projects/wanman-startup-studio/runs/monospend-ai-notebook-validation/output/modules/mvp/dev-department/parallel-task-graph.json`

Agents working in the product repo must also read that repo's README, package scripts, current app entry points, and any local environment example before editing.

## Sync protocol

The dev lead creates the integration branch after Foundation is ready. Feature lanes branch from the same base and do not rebase over each other while active. Each lane reports:

- files changed;
- tests run;
- known conflicts;
- remaining risks;
- exact user flow verified.

Integration merges one lane at a time and runs the required checks after every merge. If two lanes change the same state model, Integration pauses and resolves the contract before continuing.

## Conflict policy

Schema conflicts are resolved in favor of the trust-loop contract, not the easiest UI path. UI conflicts are resolved in favor of a clear notebook mental model: source text on the left, derived output on the right, calculation notes as explicit notebook rows.

Rejected work is not force-merged. The responsible lane revises against the shared contract or the dev lead removes the lane from the current validation slice.

## Cleanup

After integration:

- remove temporary worktrees;
- delete merged local branches only after the demo branch is verified;
- keep fixture data and tester scripts if they are part of the validation harness;
- keep local `.env` and local data ignored;
- record final commit SHA and demo URL in the review gate.
