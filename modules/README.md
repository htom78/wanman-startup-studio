# Modules

Modules are reusable stage capabilities. V0 implements the Idea-to-MVP Gate path with local files and validators. Later modules should plug into the same artifact and gate model.

## Implemented in v0

- `idea/product-research`: maps the existing `ai-product-research-studio` work into the parent startup lifecycle.
- `mvp/scope-control`: keeps MVP planning bounded before build work starts.

## Module commands

```bash
node scripts/add-product-research-module.mjs runs/<run-id>
node scripts/validate-stage.mjs runs/<run-id> product-research
```

## Deferred

- `launch/growth-engine`
- `launch/production-readiness`
- `scale/moat-map`
- `scale/founder-handoff`
