# Solution Concept

## Workflow

The product opens as a notebook, not a finance dashboard. Users enter messy money context through AI Composer:

- "lunch was $55 + 25% tip"
- "salary 5200, rent 2500, phone 45"
- a receipt photo
- a voice note about several purchases
- "calculate remaining"

AI Composer writes canonical notebook lines into the left column. The right column shows derived output for each line. A calculation happens only when the user asks for it, and the answer becomes a saved calculation note.

Example:

```text
salary = $5,200                 +$5,200.00
monthly rent = $2,500           -$2,500.00
lunch = $55.00 + 25% tip        -$68.75

calculate remaining             $2,631.25
```

## Not building

Do not build bank sync, cloud sync, AI financial advice, investment tracking, tax workflows, automatic budget coaching, full analytics dashboards, or a generic receipt scanner. Do not make the right column a primary editing surface. Do not make automatic total the main product behavior.

## Prototype

The existing prototype already demonstrates the right validation shape:

- multiple notebooks;
- AI Composer text input;
- voice/photo capture placeholders;
- canonical editable notebook lines;
- parsed tips, splits, variables, expenses, and income;
- right-column derived results;
- user-triggered calculation notes;
- localStorage persistence and Markdown/JSON/CSV export;
- paper notebook visual style.

The prototype path is `prototypes/monospend-ai-ledger`.

## First moment of value

The first moment of value is when a user gives a messy money thought and sees it become a clean note they would actually keep. The second moment is when they ask a calculation question later and the answer remains as a contextual note instead of disappearing into an automatic dashboard.

## Differentiation

Soulver is a general notepad calculator. Apple Notes is a general notebook. AI expense apps are capture-first transaction tools. MonoSpend AI Notebook should be the intersection: AI turns money mess into editable notebook facts, and calculations are intentional notes.
