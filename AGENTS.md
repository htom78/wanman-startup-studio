# AGENTS.md

This repository is a stage-gated startup operating system. Wanman is an
optional execution layer; the stable contract is the local file workflow under
`scripts/`, `system/`, `modules/`, and `runs/`.

## Startup Workflow

Before writing code or creating startup artifacts:

1. Confirm you are in the repository root.
2. Read `README.md`, `BRIEF.md`, `AGENT.md`, `feature_list.json`, and
   `progress.md`.
3. Run `./init.sh` to verify the baseline.
4. Choose one feature, module, or run-stage task from `feature_list.json`.
5. If working inside wanman, follow `AGENT.md` and `agents.json`; every task
   must name exact output paths.

## Scope

- One feature at a time.
- Stay in scope for the selected feature and active stage gate.
- Do not create MVP artifacts unless the Idea Gate decision is
  `Decision: ALLOW_MVP`.
- Do not treat prototypes as validation; validation comes from evidence and
  explicit gate decisions.
- Keep wanman optional. Scripted local checks remain the source of truth.

## Verification Commands

- `./init.sh`
- `npm test`
- Stage-specific checks:
  - `node scripts/validate-stage.mjs <run-dir> idea`
  - `node scripts/validate-stage.mjs <run-dir> mvp`
  - `node scripts/validate-stage.mjs <run-dir> all`

## Definition of Done

A change is done only when:

- The target behavior or artifact is implemented.
- The relevant script or stage validation passed.
- Verification evidence is recorded in `progress.md` or `feature_list.json`.
- Affected README, BRIEF, role, module, or stage-gate docs are current.
- The next session can restart from `./init.sh` without reading chat history.

## End of Session

Before ending:

1. Update `progress.md` with verification evidence, blockers, changed files,
   and the recommended next step.
2. Update `feature_list.json` for the active feature.
3. If work is incomplete, update `session-handoff.md`.
4. Leave any run directory with clear gate status and next action.
