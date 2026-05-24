# Startup Run Tasks - MonoSpend AI Ledger

## Input

- Idea: A personal finance app where users capture spending by voice, receipt photo, or typed notes. An AI module extracts amount, date, merchant, category, and context, then writes a clean editable line into a private notepad-style ledger that users can read, correct, search, export, and calculate from.
- Founder context: A pivot from MonoSpend's original live-math notepad concept. The new shape uses AI to remove manual entry friction while preserving the differentiator: an owned, editable text ledger rather than a black-box transaction database.
- Target customers: people who dislike bank-connected finance apps but still want faster expense capture, users who currently forget to log small purchases because typing is too much work, privacy-conscious manual trackers who want voice/photo capture without losing control of their data, note-taking and spreadsheet users who want AI to clean messy spending inputs into readable ledger lines
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

- Does AI capture plus editable notepad ledger create a stronger wedge than live math alone?
- Is this differentiated from AI expense trackers that already support voice and receipt scanning?
- What privacy promise is credible if AI processing may use cloud models early?
- What is the smallest MVP that validates the ledger ownership thesis?

## Known Alternatives

- Papirer
- HeyJerni
- Duly AI
- Qaizo
- Costline
- Receeto
- SmartWalt
- Spendspace
- Dengii
- MonAi
- SPENDI
- hledger
- Beancount
- manual notes
- spreadsheets
