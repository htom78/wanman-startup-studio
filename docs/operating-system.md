# Operating System

## Standard Run

1. Create or edit a startup brief under `inputs/`.
2. Create a run:

```bash
node scripts/new-startup-run.mjs inputs/startup-brief.example.json
```

3. Complete Idea Stage files in `runs/<run-id>/output/idea/`.
4. Validate Idea Stage:

```bash
node scripts/validate-stage.mjs runs/<run-id> idea
```

5. Optional: attach the product research module when the Idea Gate needs deeper competitor, positioning, or landing-page smoke-test evidence:

```bash
node scripts/add-product-research-module.mjs runs/<run-id>
node scripts/validate-stage.mjs runs/<run-id> product-research
```

6. Promote only if the Idea Gate decision is `Decision: ALLOW_MVP`:

```bash
node scripts/promote-stage.mjs runs/<run-id>
```

7. Complete MVP Gate files in `runs/<run-id>/output/mvp/`.
8. Optional: attach the Dev Department module after the MVP Gate says `Decision: BUILD`:

```bash
node scripts/add-dev-department-module.mjs runs/<run-id>
node scripts/validate-stage.mjs runs/<run-id> dev
```

9. Validate the complete run:

```bash
node scripts/validate-stage.mjs runs/<run-id> all
```

## Artifact Contract

Idea Stage:

- `output/idea/problem-hypothesis.md`
- `output/idea/customer-discovery-plan.md`
- `output/idea/competitor-threat-map.md`
- `output/idea/disconfirming-evidence.md`
- `output/idea/solution-concept.md`
- `output/idea/source-index.md`
- `output/idea/gate-decision.md`

MVP Gate:

- `output/mvp/mvp-scope.md`
- `output/mvp/architecture-brief.md`
- `output/mvp/measurement-framework.md`
- `output/mvp/security-review.md`
- `output/mvp/gate-decision.md`
- `output/final-summary.md`

Product Research module:

- `output/modules/idea/product-research/competitor-map.md`
- `output/modules/idea/product-research/source-index.md`
- `output/modules/idea/product-research/positioning-notes.md`
- `output/modules/idea/product-research/landing-page-experiment.md`

Dev Department module:

- `output/modules/mvp/dev-department/department-plan.md`
- `output/modules/mvp/dev-department/parallel-task-graph.json`
- `output/modules/mvp/dev-department/agent-lanes.md`
- `output/modules/mvp/dev-department/worktree-strategy.md`
- `output/modules/mvp/dev-department/integration-plan.md`
- `output/modules/mvp/dev-department/review-gate.md`

## Operating Rules

- The system optimizes for good founder judgement, not high activity.
- Every gate decision must name evidence, risks, and next action.
- Claims must be tagged as fact, inference, assumption, or `needs verification`.
- Agent work is useful only when it leaves durable artifacts.
