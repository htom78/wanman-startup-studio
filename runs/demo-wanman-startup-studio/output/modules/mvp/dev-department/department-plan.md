# Dev Department Plan

## Build objective

Build the approved local MVP for Wanman Startup Studio: a file-based stage-gated startup operating system with Idea Gate, MVP Gate, optional product research module, and optional Dev Department planning. The objective is not to build a hosted app. It is to make the local workflow reliable, inspectable, and ready for founder interviews.

## Department structure

- Dev lead: owns task graph, file ownership, integration order, and escalation.
- Foundation agent: owns shared scripts, validators, package scripts, and schema changes.
- Module agent: owns module templates, role packs, and documentation for optional modules.
- QA agent: owns negative fixtures, validator behavior, and command-level tests.
- Integration agent: merges lanes, resolves conflicts, updates docs, and prepares release notes.

## Parallelization strategy

Foundation, module, and QA lanes can run in parallel after the dev lead freezes the shared artifact contract. Integration must run after all lanes produce patches. Documentation can run in parallel, but final README updates wait until scripts and validators are stable.

Sequential constraints:

- Shared file paths and stage names must be agreed before coding.
- Validators must land before demo outputs are considered complete.
- Integration must run after all lane-level checks pass.

## Shared contracts

- Stage names: `idea`, `mvp`, `product-research`, `dev`, and `all`.
- Dev Department outputs live under `output/modules/mvp/dev-department/`.
- Dev Review Gate legal decisions are `MERGE`, `REVISE`, and `STOP`.
- Scripts must be dependency-free Node programs.
- Templates may contain placeholders, but completed run outputs must have all placeholder text resolved.

## Stop conditions

Agents must stop and escalate if they need to change gate semantics, remove validation checks, introduce external dependencies, or edit files outside their lane. Agents also stop if they find the MVP Gate is not `Decision: BUILD`.

## Verification

Required verification:

- `node --check` for every script.
- `node scripts/validate-stage.mjs runs/demo-wanman-startup-studio dev`.
- `npm test`.
- Manual readback of Dev Department README and operating-system docs.
