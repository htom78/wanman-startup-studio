# GitHub Similar Projects Research

Date: 2026-05-25

## Summary

There are several adjacent GitHub projects, but I did not find a close open-source match for `wanman-startup-studio` as a stage-gated startup operating system.

Most similar projects fall into four categories:

- Startup idea validators: score or analyze one idea.
- AI startup builders: generate business plans, landing pages, and startup documents.
- Founder skill packs: provide reusable AI skills for founder work.
- General multi-agent orchestration platforms: provide agent infrastructure, not a startup lifecycle product.

Our clearest differentiation is executable stage gating: Idea evidence must pass before MVP Gate work starts. Product research is an input to the gate, not the authority that approves building.

## Closest Repositories

| Repository | Similarity | What it does | Gap versus this project |
| --- | --- | --- | --- |
| [MaxKmet/idea-validation-agents](https://github.com/MaxKmet/idea-validation-agents) | High | AI venture analyst workflows for idea generation, validation, market deep dives, and pivots. Saves outputs into memory. | Strongest direct analogue, but optimized for fast validation/scoring rather than a local stage-gated lifecycle with executable promotion from Idea to MVP. |
| [Nirikshan95/VettIQ](https://github.com/Nirikshan95/VettIQ) | High | LangGraph, FastAPI, and Streamlit app for market analysis, competitor research, risk assessment, and go/no-go recommendations. | More app-like and analysis-report oriented. Does not appear to enforce local artifact gates or a broader founder operating system. |
| [weber-stephen/founder-flow](https://github.com/weber-stephen/founder-flow) | Medium-high | Langflow multi-agent startup builder that generates PRDs, user research, design briefs, landing pages, business models, and competitor analysis. | More "generate a startup package" than "block building until evidence passes." Similar output set, different operating philosophy. |
| [kle-08/launchlens](https://github.com/kle-08/launchlens) | Medium | CLI for fast YES/NO idea validation, market scores, competitors, pivots, and JSON output for agents. | Useful as a possible tool/module, but narrower than a lifecycle OS and more score/verdict oriented. |
| [VibeCom-AI/startup-idea-validator](https://github.com/VibeCom-AI/startup-idea-validator) | Medium | AI skill with a VC-style 7-dimension scorecard for startup ideas. | Good benchmark for scoring format, but it is a skill, not a run directory system with validators and stage promotion. |
| [shawnpang/startup-founder-skills](https://github.com/shawnpang/startup-founder-skills) | Medium | Skill pack for founder tasks across fundraising, sales, product, recruiting, engineering, legal, finance, and growth. | Similar founder audience and agent-skill distribution model, but not centered on idea-to-MVP gates. |
| [ankitjha67/product-architect](https://github.com/ankitjha67/product-architect) | Medium | Large product development skill system with many agents and frameworks for solo founders. | Broader and more product-development focused. It may overlap later, but our current wedge is narrower and more enforceable. |

## Lower-Similarity Adjacent Projects

- [FoundationAgents/MetaGPT](https://github.com/FoundationAgents/MetaGPT): multi-agent "software company" framework. Relevant to agent orchestration, but not founder stage-gate workflow.
- [hivementality-ai/hivemind](https://github.com/hivementality-ai/hivemind): self-hosted multi-agent team platform. Relevant infrastructure, not startup validation product.
- [builderz-labs/mission-control](https://github.com/builderz-labs/mission-control): self-hosted AI agent orchestration platform. Similar operating-control language, but much broader and not startup-specific.
- [neondatabase/yc-idea-matcher](https://github.com/neondatabase/yc-idea-matcher): idea similarity against YC companies. Useful research inspiration, but very narrow.

## Differentiation

### What others often do

- Produce one report, score, or verdict.
- Generate business-plan assets quickly.
- Create a landing page or PRD as part of the default flow.
- Package prompts/skills for an AI IDE.
- Provide generic multi-agent infrastructure.

### What this project should emphasize

- Stage-gated founder lifecycle: Idea, MVP, Launch, Scale.
- Executable promotion: `promote-stage.mjs` only creates MVP files after `Decision: ALLOW_MVP`.
- Local, inspectable run directories instead of opaque chat reports.
- Required disconfirming evidence.
- Product research as a module, not the whole product.
- Landing page as smoke-test planning, not automatic proof of validation.

## Positioning Implication

Do not position this as another "AI startup builder" or "idea validator." That space already exists and tends to collapse into scoring, reports, or fast asset generation.

Better positioning:

> A local, stage-gated operating system for AI-native founders that turns raw ideas into evidence-backed build/no-build decisions before MVP work starts.

## Product Lessons To Borrow

- From `idea-validation-agents`: add lightweight workflows for idea generation, validation, market deep dive, and pivot optimization.
- From `LaunchLens`: support machine-readable output for agents, possibly `--json`.
- From `VettIQ`: consider a future UI only after local workflow demand is proven.
- From `startup-founder-skills`: package modules as installable skills later.
- From `FounderFlow`: users understand a "team of agents" metaphor, but we should avoid promising an automatic startup factory.

## Recommended Next Moves

1. Add a comparison section to the public README.
2. Add a `--json` report option to `validate-stage.mjs` for agent integration.
3. Add a `Decision: PIVOT` demo run so we visibly support non-build outcomes.
4. Keep the main wedge: evidence-first stage gates before building.

