# Worktree Strategy

## Runner options

Supported runner options are wanman shared workspace for simple collaboration, Codex CLI with manual worktree creation, Emdash-style desktop orchestration, or another coding-agent runner. The Dev Department module does not require a specific runner.

For serious parallel work, prefer isolated git worktrees or branches. Shared workspace is acceptable only for small lanes with non-overlapping files.

## Isolation model

Recommended branch names:

- `dev/foundation`
- `dev/module-docs`
- `dev/qa`
- `dev/integration`

Each lane owns a narrow file set. Foundation owns scripts and validation. Module docs owns the Dev Department module and role pack. QA owns demo fixtures and verification notes. Integration owns README and final coordination.

## Shared context

Every coding agent must read:

- `README.md`
- `docs/operating-system.md`
- `output/mvp/mvp-scope.md`
- `output/mvp/architecture-brief.md`
- `output/mvp/gate-decision.md`
- `modules/mvp/dev-department/README.md`

## Sync protocol

Agents start from the same base commit. They do not pull each other's partial work while coding. Each lane hands off a patch or branch to the integration agent. Integration applies lanes in graph order and reruns checks after every merge.

## Conflict policy

The integration agent resolves conflicts. If a conflict changes a shared contract, the integration agent stops and asks the dev lead to decide. Rejected work stays in its lane branch until revised or discarded.

## Cleanup

After integration and review pass, delete temporary worktrees and stale branches. Preserve the final integrated commit and the Dev Review Gate artifact.
