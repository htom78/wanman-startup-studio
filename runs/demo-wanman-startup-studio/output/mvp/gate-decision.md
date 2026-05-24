# MVP Gate Decision

Decision: BUILD

## Build readiness

The MVP is ready to build as a local operating system, not as a hosted SaaS product. Scope is narrow, the architecture has no external dependencies, the measurement plan can be gathered manually, and security risk is acceptable for private local testing.

The core product behavior is already represented in the scripts: create run, validate Idea Stage, promote only after `ALLOW_MVP`, and validate MVP Gate.

## Risks

- Users may want a UI before they understand the value of the workflow.
- Validation heuristics may reject good artifacts if headings differ.
- The system may still feel too process-heavy for fast-moving founders.
- Customer interview evidence is still required before investing in hosted collaboration.

## First sprint

1. Add artifact templates so users can fill each file faster.
2. Add a negative test fixture where `Decision: BLOCK` prevents promotion.
3. Run three founder interviews using the demo workflow.
4. Convert interview feedback into a revised Idea Gate checklist.
5. Decide whether the next iteration needs a lightweight UI or better CLI ergonomics.

## Recommendation

Build the local MVP and use it for real customer discovery. Do not build Launch or Scale modules until at least three completed Idea runs show repeatable demand for the next stage.
