# Progress

Last Updated: 2026-05-30

## Current Objective

Make the startup studio repo restartable for Codex and wanman-assisted work
without relying on chat history.

## Current State

- The stable workflow is script-driven stage validation.
- Wanman remains optional and is governed by `AGENT.md` and `agents.json`.
- `npm test` is the primary full baseline check.
- There are existing untracked run inputs under `inputs/` and `runs/`; treat
  them as user work unless explicitly asked to modify them.

## What Is Done

- README and BRIEF define the startup operating system boundary.
- Local scripts define new run, validation, promotion, and module mounting.
- Harness state files have been introduced.

## What Is In Progress

- No active implementation slice. The harness has been validated.

## Blockers

- None known.

## Files Modified

- `AGENTS.md`
- `feature_list.json`
- `progress.md`
- `session-handoff.md`
- `init.sh`

## Verification Evidence

- `node /tmp/learn-harness-engineering-codex-audit/skills/harness-creator/scripts/validate-harness.mjs --target /Volumes/PortableSSD/Projects/Codex_Projects/wanman-startup-studio` passed with `100/100`.
- `./init.sh` passed on 2026-05-26. It ran `npm test`, including syntax checks, MonoSpend prototype tests, notebook composer tests, and `node scripts/validate-stage.mjs runs/demo-wanman-startup-studio all`.
- `./init.sh` re-validated on 2026-05-30. `npm test` passed: syntax checks (9 files), `Extractor tests passed`, `Notebook composer tests passed`, and `Validation passed: runs/demo-wanman-startup-studio (all)`.

## Recommended Next Step

Keep future work tied to exactly one feature or stage-gate task from
`feature_list.json`.

## Next Session Should

1. Read `AGENTS.md`.
2. Run `./init.sh`.
3. Work on exactly one feature or stage-gate task.
