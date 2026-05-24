# Startup Run Tasks - MonoSpend

## Input

- Idea: A private offline personal finance app positioned as a notepad that does your budget. Users type expenses, income, variables, and math like notes; the app parses amounts, categories, budgets, and calculations in real time without accounts, ads, tracking, or cloud sync by default.
- Founder context: A previously considered personal finance app idea that now has a landing page at https://monospend.app/ and should be validated through the stage-gated startup workflow.
- Target customers: people who currently track spending in notes, spreadsheets, or plain text, privacy-conscious users who reject bank-connected finance apps, technical or semi-technical budgeters who like text input and simple math, users who want manual expense tracking but hate forms and dropdowns
- Region: global, English-first

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

- Is privacy-first offline expense tracking already too crowded to be a useful wedge?
- Is the notepad/live-math interaction a strong enough differentiator?
- Who is the first narrow customer segment?
- What evidence should decide ALLOW_MVP, PIVOT, or BLOCK?

## Known Alternatives

- Stroberi
- Expense Trail
- BudgetVault
- Dengii
- MonAi
- SPENDI
- BudgetNote
- hledger
- Beancount
- manual notes
- spreadsheets
