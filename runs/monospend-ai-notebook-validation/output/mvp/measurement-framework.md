# Measurement Framework

## Activation

Activation requires more than creating an expense. A user is activated when they create at least one canonical notebook line and one calculation note that they understand.

Activation events:

- AI Composer submitted.
- Canonical line created.
- Line edited.
- Calculation note created.
- User explains the calculation note correctly.
- Export used.

## Retention

Retention is the decisive metric. The product is viable only if users return to the notebook to continue reasoning.

Retention metrics:

- Day 2 return to add a line.
- Day 7 return to add or calculate.
- Number of calculation notes per active tester.
- Number of edited lines, because edits may indicate trust and ownership.
- Whether the user asks a new money question without prompting.

## Revenue

Do not charge in the validation MVP. Ask willingness-to-pay questions only after use:

- Would pay for local notebook plus exports.
- Would pay for AI capture credits.
- Would bring own API key.
- Would pay subscription only with on-device AI or sync.

Revenue is not the current gate. Usage and retention are.

## Referral

Referral signals:

- Tester shares the notebook output.
- Tester asks for Markdown, hledger, or CSV compatibility.
- Tester asks for a Mac/iPad app.
- Tester says it replaces a spreadsheet, Apple Notes, or calculator routine.

## Instrumentation

For now, keep instrumentation local and privacy-preserving:

- event counters in local JSON;
- tester diary;
- manual interview notes;
- no raw receipt or voice retention by default.

Log exact prompts that testers are willing to share. Do not collect financial details without explicit consent.
