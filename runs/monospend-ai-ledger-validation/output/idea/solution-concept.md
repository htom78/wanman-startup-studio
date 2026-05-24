# Solution Concept

## Workflow

The user captures spending in any of three ways:

- Voice: "lunch ramen fifteen fifty, coffee eleven for two cups."
- Photo: a receipt image.
- Text: "uber airport 23.40 yesterday."

The AI module extracts structured fields, proposes a human-readable ledger line, and asks for confirmation. The saved record is not a black-box transaction; it is editable ledger text.

Example output:

`2026-05-25 lunch ramen $15.50 #food`

The ledger can still support calculations later, but live math is no longer the primary entry point.

## Core jobs

- Capture expense data from voice, photos, and messy text.
- Extract amount, date, merchant, category, and note with validation.
- Show the extracted result before save.
- Save a clean editable ledger line.
- Keep the ledger searchable and exportable.
- Preserve local data ownership.

## Not building

Do not build bank sync, subscription detection, AI financial advice, group splitting, cloud sync, home screen widgets, full chart dashboards, tax workflows, or multi-account complexity in the validation MVP.

Do not claim fully offline AI if the prototype uses cloud transcription or extraction.

## Prototype

The lightest prototype can be a local web app or simple mobile shell:

- Text area for typed expense notes.
- Upload receipt image.
- Optional voice recording/transcription.
- AI extraction into strict JSON.
- Ledger line generation.
- User confirm/edit step.
- Local ledger saved as Markdown, JSONL, or plain text.

This prototype validates the interaction, not the full personal finance product.

## First moment of value

The first moment of value is when a user speaks or photographs a messy purchase and sees a clean ledger line they understand, trust, and want to keep.

## Risk

The main risk is becoming a generic AI expense tracker. The product must make the ledger feel useful and ownable enough that users remember MonoSpend as "my money notebook" rather than "another AI scanner."
