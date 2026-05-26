# Architecture Brief

## Persistent context

Future agents and humans must read:

- `input.json`
- `output/idea/gate-decision.md`
- `output/mvp/mvp-scope.md`
- `prototypes/monospend-ai-ledger/public/app.js`
- `prototypes/monospend-ai-ledger/public/index.html`
- `prototypes/monospend-ai-ledger/public/styles.css`

The key context is that MonoSpend AI Notebook is not a transaction database. The left column is the source of truth. The right column is derived output. Calculation notes are explicit user-triggered notebook artifacts.

## Technical decisions

- Keep a local-first web prototype for validation.
- Store notebooks as arrays of line objects.
- Represent facts and calculation notes with different `kind` values.
- Keep AI output editable and validate structured extraction before saving.
- Do deterministic calculations in app code after AI Composer normalizes input.
- Store only confirmed notebook state in browser localStorage.
- Treat voice/photo as capture modes, not separate product surfaces.
- Version prompts and extraction schema before adding cloud AI tests.

## Data model

Notebook:

```json
{
  "id": "april-2026",
  "title": "April 2026",
  "lines": []
}
```

Fact line:

```json
{
  "kind": "expense",
  "canonicalText": "lunch = $55.00 + 25% tip",
  "amount": -68.75,
  "source": "text"
}
```

Calculation note:

```json
{
  "kind": "calculation",
  "canonicalText": "calculate remaining",
  "query": "remaining",
  "amount": 1486.25
}
```

## Interfaces

- `AI Composer`: user input box for text, voice transcript, or receipt note.
- `Notebook lines`: editable canonical facts.
- `Calculation notes`: user-triggered aggregate answers.
- `Export`: Markdown, JSON, CSV.
- `Extractor API`: optional cloud/local structured extraction behind `/api/extract`.

## Risk controls

AI should not own the ledger. The deterministic calculation layer should be inspectable and testable. If cloud AI is used, the UI must disclose what is sent and avoid storing raw media by default.
