# Startup Run Tasks - Wanman Startup Studio

## Input

- Idea: A stage-gated multi-agent operating system that helps AI-native founders validate startup ideas, decide when to build, and prepare a tightly scoped MVP without confusing prototype creation for customer validation.
- Founder context: Solo technical founder building internal tools and AI workflows for early-stage teams.
- Target customers: solo technical founders, micro startup teams before seed funding, product builders validating new AI products
- Region: global, English-first outputs with Chinese operator notes

## Idea Stage

- [ ] Idea Researcher: write `output/idea/problem-hypothesis.md`
- [ ] Idea Researcher: write `output/idea/customer-discovery-plan.md`
- [ ] Idea Researcher: write `output/idea/competitor-threat-map.md`
- [ ] Devil's Advocate: write `output/idea/disconfirming-evidence.md`
- [ ] Solution Designer: write `output/idea/solution-concept.md`
- [ ] Idea Researcher: write `output/idea/source-index.md`
- [ ] Founder Orchestrator: write `output/idea/gate-decision.md`
- [ ] Run `node scripts/validate-stage.mjs <this-run-dir> idea`

## MVP Gate

Do not start this section until `output/idea/gate-decision.md` contains `Decision: ALLOW_MVP`.

- [ ] Run `node scripts/promote-stage.mjs <this-run-dir>`
- [ ] Product Architect: write `output/mvp/mvp-scope.md`
- [ ] Product Architect: write `output/mvp/architecture-brief.md`
- [ ] Product Architect: write `output/mvp/measurement-framework.md`
- [ ] Security Reviewer: write `output/mvp/security-review.md`
- [ ] Founder Orchestrator: write `output/mvp/gate-decision.md`
- [ ] Founder Orchestrator: write `output/final-summary.md`
- [ ] Run `node scripts/validate-stage.mjs <this-run-dir> all`

## Must Answer

- Is the problem frequent and painful enough for a founder workflow product?
- Which customer segment should be interviewed first?
- What evidence would block or pivot the idea?
- What is the smallest MVP scope if the Idea Gate passes?

## Known Alternatives

- manual founder notebooks
- ChatGPT project chats
- Notion startup templates
- Mixo
- ValidatorAI
- YC Startup School resources
