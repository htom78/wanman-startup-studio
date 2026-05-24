# MVP Module: Dev Department

Dev Department adds parallel coding-agent development after the MVP Gate says `Decision: BUILD`.

It is inspired by tools such as Emdash, but it is not a desktop runner. This module defines the operating contract for parallel implementation so the actual runner can be wanman, Codex worktrees, Emdash, or another coding-agent environment.

## Gate

This module must not start until:

- `output/mvp/gate-decision.md` contains `Decision: BUILD`.
- MVP scope, architecture, measurement, and security review exist.

## Outputs

- `output/modules/mvp/dev-department/department-plan.md`
- `output/modules/mvp/dev-department/parallel-task-graph.json`
- `output/modules/mvp/dev-department/agent-lanes.md`
- `output/modules/mvp/dev-department/worktree-strategy.md`
- `output/modules/mvp/dev-department/integration-plan.md`
- `output/modules/mvp/dev-department/review-gate.md`

## Usage

```bash
node scripts/add-dev-department-module.mjs runs/<run-id>
node scripts/validate-stage.mjs runs/<run-id> dev
```

## Role in the lifecycle

Idea and MVP Gates decide whether work should be built. Dev Department decides how to split approved build work across coding agents with isolation, integration, and review.

## Design rules

- Parallelize independent implementation lanes only.
- Keep each agent lane scoped to files, tests, and exit criteria.
- Use separate branches or worktrees for parallel coding work.
- Merge through an integration lane, not directly from every agent.
- Require review and verification before marking the build ready.

