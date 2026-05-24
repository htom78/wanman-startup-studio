# Prompt Pack - MonoSpend AI Ledger

Use these prompts with Codex, wanman roles, or a human operator. Work inside this run directory.

## Founder Orchestrator

Read `input.json`, `system/stage-gates/idea.md`, and current idea artifacts. Produce `output/idea/gate-decision.md` with one legal decision: `ALLOW_MVP`, `PIVOT`, or `BLOCK`.

## Idea Researcher

Read `input.json` and `system/roles/idea-researcher.md`. Produce:

- `output/idea/problem-hypothesis.md`
- `output/idea/customer-discovery-plan.md`
- `output/idea/competitor-threat-map.md`
- `output/idea/source-index.md`

Hard stop after enough evidence to make a useful gate decision. Mark unsupported claims as `needs verification`.

## Devil's Advocate

Read idea research artifacts and `system/roles/devils-advocate.md`. Produce `output/idea/disconfirming-evidence.md`.

## Solution Designer

Read idea artifacts and `system/roles/solution-designer.md`. Produce `output/idea/solution-concept.md`.

## Product Architect

Run only after Idea Gate approval. Read idea artifacts and `system/roles/product-architect.md`. Produce:

- `output/mvp/mvp-scope.md`
- `output/mvp/architecture-brief.md`
- `output/mvp/measurement-framework.md`

## Security Reviewer

Read MVP scope and architecture. Produce `output/mvp/security-review.md`.
