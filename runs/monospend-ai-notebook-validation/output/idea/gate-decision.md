# Idea Gate Decision

Decision: ALLOW_MVP

## Evidence

The latest product result is stronger than the previous AI Ledger direction because it no longer competes head-on as an AI expense tracker. The crowded part of the market is AI capture: voice input, receipt scanning, automatic categorization, and AI insights are already common claims. The new wedge is the notebook model.

Evidence supporting the gate:

- Soulver shows that users understand a left-input, right-result notepad calculator model.
- Apple Notes supports the broad notebook mental model and the move toward AI inside notes.
- hledger and plain-text accounting show that some users value durable, editable, human-readable financial records.
- AI expense trackers prove capture friction is real, but they mostly resolve into transaction lists, dashboards, and categories.
- Our prototype now expresses a different behavior: AI Composer writes notebook facts, while calculations are user-triggered notes.

This is enough to allow a narrow MVP because the build can test one thing: whether users prefer AI-generated financial notebook lines plus intentional calculation notes over transaction tables and automatic totals.

## Risks

- Users may still prefer a normal expense list.
- The notebook metaphor may appeal more to builders than mainstream consumers.
- Soulver already owns the general notepad-calculator category.
- Apple Notes plus a calculator may be "good enough" for lightweight users.
- AI expense trackers can copy natural-language capture quickly.
- Cloud AI privacy remains sensitive for financial content.

## Next step

Proceed to MVP Gate for a validation prototype only:

1. Keep the Apple Notes / Soulver-like notebook interface.
2. Make AI Composer the primary input.
3. Save canonical facts as editable notebook lines.
4. Treat aggregate calculations as explicit calculation notes.
5. Test with real cashflow, spending, tip, split, subscription, and runway examples.
6. Measure whether users return to the notebook to ask new money questions.

Do not expand into a full finance app.

## Conditions

Change to `PIVOT` if testers like AI capture but do not care about notebook lines or calculation notes.

Change to `BLOCK` if users consistently ask for bank sync, dashboards, or automatic categorization instead of notebook reasoning.

Keep `ALLOW_MVP` only if at least 5 qualified testers use the notebook with real or realistic money notes and at least 3 return within 7 days to add or calculate something new.
