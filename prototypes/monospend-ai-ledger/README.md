# MonoSpend AI Ledger Prototype

Local validation prototype for the `monospend-ai-ledger-validation` run.

## What It Tests

The prototype tests one product question:

> Do users prefer AI capture that writes to a readable, editable notepad ledger?

It is not a full personal finance app.

## Run

```bash
npm run monospend:prototype
```

Open:

```text
http://localhost:4177
```

## AI Provider

Default mode is local heuristic extraction. It is offline and good enough for testing the flow.

Optional OpenAI mode:

```bash
MONOSPEND_AI_PROVIDER=openai OPENAI_API_KEY=... npm run monospend:prototype
```

Optional model override:

```bash
OPENAI_MODEL=gpt-4o-mini MONOSPEND_AI_PROVIDER=openai OPENAI_API_KEY=... npm run monospend:prototype
```

The server asks the model for strict JSON and validates the result before the UI can save it.

## Privacy Notes

- Confirmed ledger entries are stored in browser localStorage.
- Raw receipt images and voice transcripts are not persisted by the server.
- In local mode, extraction happens without a remote model.
- In OpenAI mode, text and images are sent to the configured model provider.

