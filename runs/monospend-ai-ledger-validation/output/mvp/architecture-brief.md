# Architecture Brief

## Persistent context

Future agents and humans must read:

- `input.json`
- `output/idea/gate-decision.md`
- `output/mvp/mvp-scope.md`
- `output/modules/idea/product-research/positioning-notes.md`
- `output/mvp/security-review.md`

The key context is that MonoSpend is not an AI expense dashboard. It is an AI capture layer that writes to a user-owned notepad ledger.

## Technical decisions

- Build a small local-first web prototype first.
- Keep the ledger format independent of the AI provider.
- Validate AI output against a strict JSON schema before generating ledger text.
- Require user confirmation before saving any AI extraction.
- Store ledger entries locally for the MVP.
- Do not store raw receipt photos or voice files by default.
- Make AI provider replaceable: cloud model now, possible on-device model later.

## Data model

Expense extraction JSON:

```json
{
  "date": "2026-05-25",
  "amount": 15.5,
  "currency": "USD",
  "merchant": "Ramen House",
  "category": "food",
  "note": "lunch ramen",
  "source": "voice|photo|text",
  "confidence": 0.82
}
```

Ledger line:

```text
2026-05-25 lunch ramen $15.50 #food @RamenHouse
```

Ledger storage can be JSONL plus generated Markdown/plain text export.

## Interfaces

User interface:

- Capture tabs: text, photo, voice.
- Extraction preview.
- Editable ledger line.
- Confirm/save button.
- Ledger view.
- Export buttons.

AI interface:

- Input: text transcript or image.
- Output: strict JSON.
- Error path: ask user to correct manually.

## Risks

- Unvalidated AI output can corrupt the ledger. Mitigation: schema validation and user confirmation.
- Cloud AI can conflict with privacy positioning. Mitigation: explicit consent and no raw media retention.
- OCR/vision quality may vary. Mitigation: show confidence and easy correction.
- Browser storage can be fragile. Mitigation: export early and often.
