# Startup Run Tasks - MonoSpend AI Notebook

## Input

- Idea: A personal finance notebook where the left column is the only source of truth. Users speak, paste, type, or photograph messy money context into an AI Composer. The AI writes editable notebook facts such as income, expenses, variables, tips, splits, and assumptions. The right column shows derived output for each line, but totals are not automatic dashboard state. Aggregate calculations happen only when the user asks for a calculation note, so the answer becomes a timestamped, editable notebook remark rather than an always-on report.
- Founder context: A second pivot from MonoSpend AI Ledger after studying Soulver 3 and Apple Notes. The product is no longer a category-led expense table. It is an AI-native financial thinking notebook: Apple Notes familiarity, Soulver-style two-column derived results, and AI-generated canonical money lines.
- Target customers: people who currently reason about money in Apple Notes, Notion, spreadsheets, calculators, or plain text, freelancers and indie builders who need lightweight cashflow notes without full accounting software, privacy-conscious manual trackers who do not want bank sync but dislike entering every expense by hand, users who want to capture receipts, voice notes, and ad hoc financial questions in one editable notebook
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

- Does AI Composer plus canonical notebook lines create a stronger wedge than AI expense capture alone?
- Does user-triggered calculation note behavior make the product feel more trustworthy and notebook-like than automatic totals?
- Can this be differentiated from Soulver, Apple Notes, plain-text accounting, and AI expense trackers?
- What is the smallest MVP that validates whether users keep using calculation notes for real money decisions?

## Known Alternatives

- Soulver 3
- Apple Notes
- Notion
- spreadsheets
- hledger
- Beancount
- Duly AI
- HeyJerni
- Dengii
- Yavo
- Yomio
- Receiptix
- manual notes
- calculator apps
