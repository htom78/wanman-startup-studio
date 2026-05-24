# Solution Concept

## Workflow

The user opens MonoSpend and types money notes in a freeform editor:

- `salary = +5200`
- `rent 1800`
- `coffee 5.50 * 2`
- `savings = 30% of salary`
- `free cash = income - spent - savings`

MonoSpend parses entries, detects income/expense/category/math, updates totals live, and keeps the data local. The user should feel like they are writing notes, not filling out finance forms.

## Core jobs

- Capture expenses and income with minimal friction.
- Evaluate simple math and variables inline.
- Show monthly totals and category progress.
- Preserve local privacy and exportability.
- Help users answer "how much free cash do I have?" without a spreadsheet.

## Not building

Do not build bank sync, account aggregation, receipt scanning, investment tracking, subscription cancellation, multi-device sync, shared household budgets, or advanced accounting in the first validation prototype.

Do not build a full dashboard before proving the text editor interaction is habit-forming.

## Prototype

The lightest prototype is an offline web or mobile editor that supports:

- Text input.
- Amount parsing.
- A few categories.
- Inline arithmetic.
- Variables.
- Monthly summary.
- CSV/JSON export.

The prototype is not validation by itself. Validation requires users to enter their own real expenses over at least one week.

## First moment of value

The first moment of value is when a user types a messy money note and immediately sees a correct total or useful remaining-cash calculation without opening a spreadsheet.

## Risk

The main concept risk is habit formation. If the experience is delightful once but users do not come back daily, MonoSpend becomes another nice budget toy rather than a meaningful personal finance tool.
