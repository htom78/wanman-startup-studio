# Idea Gate Decision

Decision: PIVOT

## Evidence

MonoSpend has a coherent and memorable product promise: "A notepad that does your budget." The strongest evidence is the landing page's specific interaction model: type expenses like notes, parse amounts and categories, use live variables, and evaluate budget math offline.

However, the broader category is crowded. Many current products already claim privacy-first, offline, no-account, no-tracking expense tracking. Several adjacent products also support natural-language text or voice expense entry. This means privacy/offline cannot be the main wedge.

The idea should continue only if the wedge is narrowed to users who already track money in notes, spreadsheets, or plain text and want live calculation without switching into a full finance app.

## Risks

- Manual expense tracking has retention risk.
- Offline privacy is a crowded differentiator.
- Mainstream users may want bank sync and cloud backup.
- Technical users may prefer hledger, Beancount, or spreadsheets.
- One-time $4.99 pricing may not support meaningful growth without strong distribution.
- Current waitlist interest and willingness to pay are `needs verification`.

## Next step

Do not proceed to full MVP build yet. Run a tighter validation sprint:

1. Interview 12 target users using the customer discovery plan.
2. Test three positioning variants: "private expense tracker," "notepad budget," and "plain-text money tracker."
3. Build only a tiny parser demo if needed: text input, inline math, variables, monthly total.
4. Measure whether users enter their own real expenses and come back within one week.

## Conditions

Change to `ALLOW_MVP` if at least 6 of 12 interviews show active manual tracking behavior and at least 4 people ask to test the notepad/live-math prototype with their own money notes.

Change to `BLOCK` if most users want automatic bank import, do not manually track, or see MonoSpend as just another offline expense tracker.
