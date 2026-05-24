# Wanman Startup Studio Agent Instructions

This project can run in wanman `sharedWorkspace` mode. All agents share the project root.

## First Action

1. Run `wanman recv`.
2. Run `wanman task list`.
3. Read `BRIEF.md`.
4. Read the relevant role pack under `system/roles/`.
5. Work only on the task's declared output path.

## Stage Rules

- Do not create MVP artifacts until `output/idea/gate-decision.md` contains `Decision: ALLOW_MVP`.
- If evidence is weak, recommend `Decision: BLOCK` or `Decision: PIVOT`.
- Mark unsupported factual claims as `needs verification`.
- Keep research timeboxed; useful evidence beats endless browsing.
- Produce files first, then report completion.

## Required Idea Artifacts

- `output/idea/problem-hypothesis.md`
- `output/idea/customer-discovery-plan.md`
- `output/idea/competitor-threat-map.md`
- `output/idea/disconfirming-evidence.md`
- `output/idea/solution-concept.md`
- `output/idea/source-index.md`
- `output/idea/gate-decision.md`

## Required MVP Gate Artifacts

- `output/mvp/mvp-scope.md`
- `output/mvp/architecture-brief.md`
- `output/mvp/measurement-framework.md`
- `output/mvp/security-review.md`
- `output/mvp/gate-decision.md`
- `output/final-summary.md`

## Verification

Before marking a task done, run the relevant command:

```bash
node scripts/validate-stage.mjs <run-dir> idea
node scripts/validate-stage.mjs <run-dir> mvp
node scripts/validate-stage.mjs <run-dir> all
```

