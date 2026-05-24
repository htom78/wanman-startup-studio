# Landing Page Experiment

## First viewport

Recommended headline:

> Speak it. Snap it. Keep it as a notepad ledger.

Supporting copy:

> MonoSpend turns voice, receipts, and messy money notes into clean, editable ledger lines you own.

The hero should show three inputs becoming one ledger:

- Voice: "coffee and sandwich, 14 dollars"
- Photo: receipt total
- Text: "uber airport 23.40 yesterday"
- Ledger output: `2026-05-25 uber airport $23.40 #transport`

## CTA

Primary CTA: "Try with one expense."

Measure whether visitors actually submit a sample voice/text/photo input. Waitlist alone is weaker than conversion into the mini extraction flow.

## Smoke test

Build a mini extraction flow:

1. User chooses text, photo, or voice.
2. AI extracts structured fields.
3. App shows a ledger line preview.
4. User edits or confirms.
5. User can copy/export the result.
6. Ask whether they would use this for one week.

## Claims

- Fact: MonoSpend currently has a notepad-budget landing page.
- Fact: competitors claim AI voice/photo expense capture.
- Inference: ledger output is the best differentiation angle.
- Assumption: users will value editable text over transaction-only UI.
- `needs verification`: conversion rate, retention, AI accuracy, privacy tolerance, and willingness to pay.

## Do not build

Do not build full charts, multi-account, cloud sync, bank sync, AI advice, or native app polish before the mini extraction flow validates that ledger output matters.
