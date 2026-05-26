# MVP Scope

## First user task

A user opens a notebook, enters messy money context into AI Composer, reviews the canonical notebook line, and asks one calculation question. The MVP succeeds only if the user understands both the saved fact and the saved calculation note.

Example task:

1. Type `lunch was $55 + 25% tip; calculate remaining`.
2. See `lunch = $55.00 + 25% tip`.
3. See `calculate remaining` as a calculation note.
4. Edit a line if needed.
5. Export or return later to ask another calculation.

## In scope

- Multiple notebooks.
- AI Composer for typed messy money notes.
- Browser voice transcription if available.
- Receipt photo input as a capture path.
- Canonical notebook lines for income, expenses, variables, tips, splits, and assumptions.
- Right-column derived output for each line.
- User-triggered calculation notes for total cost, total income, remaining, split, tip, and simple scenario questions.
- Editable notebook lines.
- LocalStorage persistence.
- Markdown, JSON, and CSV export.
- Paper notebook visual prototype.

## Out of scope

- Bank sync.
- Cloud sync.
- Accounts and authentication.
- Investment tracking.
- Automatic financial advice.
- Tax workflows.
- Full mobile app.
- Full chart dashboard.
- Always-on automatic total as the primary behavior.
- User editing the derived result column.

## Non-goals

This MVP is not trying to replace full accounting tools. It is not trying to prove perfect OCR or voice recognition. It is testing whether the notebook interaction changes the perceived value of AI capture.

## Acceptance criteria

- A tester can create or select a notebook.
- A tester can save at least five canonical money lines.
- A tester can ask at least three calculation notes.
- The app does not update old calculation notes invisibly.
- The tester can explain why a calculation note exists.
- The tester returns within 7 days to add or calculate something new.
- The tester exports the notebook or says export matters.
