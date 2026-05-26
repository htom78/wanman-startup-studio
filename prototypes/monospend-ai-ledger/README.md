# MonoSpend AI Ledger Prototype

Local validation prototype for the `monospend-ai-ledger-validation` run.

## What It Tests

The prototype tests one product question:

> Do users prefer AI capture that writes to a readable, editable notepad ledger?

It is now a functional validation site: the frontend calls a local backend,
the backend composes notebook notes with either local heuristics or OpenAI,
and confirmed notebook state is persisted as JSON.

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

You can configure the prototype with environment variables or with a local config file. For a directory config file, copy:

```bash
cp prototypes/monospend-ai-ledger/.env.example prototypes/monospend-ai-ledger/.env.local
```

Then edit:

```text
prototypes/monospend-ai-ledger/.env.local
```

`.env.local` is ignored by git and is loaded by the backend on startup.

Optional OpenAI mode:

```bash
MONOSPEND_AI_PROVIDER=openai OPENAI_API_KEY=... npm run monospend:prototype
```

Optional model override:

```bash
OPENAI_MODEL=gpt-4o-mini MONOSPEND_AI_PROVIDER=openai OPENAI_API_KEY=... npm run monospend:prototype
```

Optional OpenRouter mode, defaulting to DeepSeek V4 Pro:

```bash
MONOSPEND_AI_PROVIDER=openrouter OPENROUTER_API_KEY=... npm run monospend:prototype
```

Optional OpenRouter model override:

```bash
OPENROUTER_MODEL=deepseek/deepseek-v4-pro MONOSPEND_AI_PROVIDER=openrouter OPENROUTER_API_KEY=... npm run monospend:prototype
```

The server asks the model for strict JSON and validates the result before the UI can save it. OpenRouter mode uses the OpenAI-compatible Chat Completions API with `response_format: json_schema`.

## Backend API

- `GET /api/state` returns notebooks, active notebook, and provider info.
- `POST /api/folders` creates a notebook folder.
- `POST /api/notebooks` creates a notebook in the active folder or provided folder.
- `POST /api/notebooks/:id/compose` turns text, voice transcript, or receipt notes into saved notebook lines.
- `PATCH /api/notebooks/:id` updates the active notebook or title.
- `PATCH /api/notebooks/:id/lines/:lineId/compose` recomposes one line through AI Composer.
- `PATCH /api/notebooks/:id/lines/:lineId/intent` applies a deterministic user intent override.
- `PATCH /api/notebooks/:id/lines/:lineId/text` edits only the visible line text without running AI Composer.
- `DELETE /api/notebooks/:id/lines/:lineId` deletes one line.
- `DELETE /api/notebooks/:id/lines` clears one notebook.
- `POST /api/reset` restores the demo notebooks for validation sessions.

By default, data is written to:

```text
prototypes/monospend-ai-ledger/data/notebooks.json
```

Override it during tests with:

```bash
MONOSPEND_DATA_FILE=/tmp/monospend-notebooks.json npm run monospend:prototype
```

## Privacy Notes

- Confirmed ledger entries are stored by the local backend as JSON.
- Raw receipt images and voice transcripts are not persisted by the server.
- In local mode, extraction happens without a remote model.
- In OpenAI mode, text and images are sent to the configured model provider.
- In OpenRouter mode, text and images are sent to the configured OpenRouter model. DeepSeek V4 Pro is text-only, so use receipt text or choose a vision model for image-only receipt tests.
