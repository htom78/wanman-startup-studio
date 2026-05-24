# Integration Plan

## Merge order

1. Foundation lane: scripts and validator support.
2. Module docs lane: README, module metadata, templates, and dev lead role.
3. QA lane: completed demo artifacts and test confirmation.
4. Integration lane: README, operating-system docs, final review gate.

## Required checks

- `node --check scripts/new-startup-run.mjs`
- `node --check scripts/promote-stage.mjs`
- `node --check scripts/add-product-research-module.mjs`
- `node --check scripts/add-dev-department-module.mjs`
- `node --check scripts/validate-stage.mjs`
- `node scripts/validate-stage.mjs runs/demo-wanman-startup-studio dev`
- `npm test`

## Manual checks

- Confirm Dev Department starts only after MVP Gate `Decision: BUILD`.
- Confirm Emdash is described as an optional runner, not as a dependency.
- Confirm Dev Department does not weaken Idea Gate or MVP Gate.
- Confirm every lane has file ownership, checks, and escalation conditions.

## Rollback plan

If a lane breaks validation, revert that lane patch before merging the next lane. If integration breaks `npm test`, revert the integration commit and preserve the lane branches for diagnosis.

## Release artifact

The release artifact is a committed Dev Department module with script, templates, validation support, demo outputs, and updated operating docs. It is ready to be used as a planning layer before launching real coding agents.
