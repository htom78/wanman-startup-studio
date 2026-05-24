# MVP Scope

## First user task

A user captures one real expense by typing, speaking, or uploading a receipt photo. MonoSpend extracts structured fields, generates a readable ledger line, lets the user edit/confirm it, and saves it into a local notepad-style ledger.

The first user task is complete only when the user sees a ledger line they trust enough to keep.

## In scope

- Typed messy expense input.
- Receipt image upload with OCR or AI vision extraction.
- Optional voice input through browser or platform transcription if available.
- AI extraction into strict JSON fields: date, amount, currency, merchant, category, note, confidence.
- Ledger line generation from structured JSON.
- User edit and confirm step.
- Local ledger saved to a file or browser storage.
- Export as Markdown, JSONL, and CSV.
- Simple monthly total and category total.

## Out of scope

- Bank sync.
- Cloud sync.
- Multi-device accounts.
- AI financial advice.
- Charts and dashboards beyond basic totals.
- Subscription detection.
- Shared budgets.
- Bill splitting.
- Full native mobile app.
- Tax or reimbursement workflows.

## Non-goals

This MVP is not trying to prove that MonoSpend can be a full personal finance app. It is only testing whether AI capture into editable notepad ledger is valuable enough to continue.

It is also not trying to prove perfect OCR or perfect categorization. Mistakes are acceptable if correction is fast and trust remains intact.

## Acceptance criteria

- A tester can enter at least five expenses using two input modes.
- The AI returns valid structured JSON for each expense.
- The app generates a ledger line for each accepted expense.
- The tester can correct mistakes before save.
- The ledger can be exported.
- At least 4 qualified testers say they would use the workflow for one week with real spending.
