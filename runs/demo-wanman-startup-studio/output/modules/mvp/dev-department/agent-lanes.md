# Agent Lanes

## Dev lead

Owns decomposition, lane boundaries, shared contracts, and merge sequencing. The dev lead reads the MVP scope and architecture before creating implementation work. The dev lead is also responsible for preventing scope expansion beyond the approved MVP.

## Foundation agent

Owns scripts, validation logic, package scripts, and shared data contracts. This lane can modify `scripts/`, `package.json`, and schema-like project contracts. It must not write demo content except to support validator fixtures.

## Module agent

Owns `modules/mvp/dev-department/`, role packs, and module documentation. This lane writes templates and instructions, but it does not change stage gate decisions.

## QA agent

Owns command verification and negative checks. This lane runs `npm test`, validates the demo, and confirms that templates with placeholders do not pass as completed artifacts.

## Integration agent

Owns merge conflict resolution, final verification, docs alignment, and release note wording. The integration agent is the only lane that should update top-level README after implementation lanes settle.

## Escalation

Agents must escalate if a lane needs broader file ownership, if tests require network access, if the MVP Gate does not say `Decision: BUILD`, or if a task would remove existing stage gate protections.
