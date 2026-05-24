# Security Review

## Data

Sensitive data includes receipts, merchants, locations, timestamps, spending habits, notes, and possibly voice recordings. The MVP should store only confirmed ledger entries by default. Raw images, raw audio, and transcripts should be discarded unless the tester explicitly opts into debugging.

Ledger exports may contain private financial data, so the UI should warn users before sharing or uploading files.

## Auth

No account or authentication is needed for the local validation MVP. If a hosted demo is used, it should avoid accounts and avoid server-side persistence. A future cloud-sync version would require authentication, encryption decisions, deletion controls, and privacy policy work.

## Abuse

Misuse and failure modes:

- AI extracts wrong amount or merchant.
- Prompt injection in receipt text or user notes.
- User assumes cloud AI is fully private.
- Raw receipt photos leak through logs.
- Categories create misleading budget totals.
- AI provider stores sensitive financial content.

Mitigations:

- Strict JSON schema validation.
- User confirmation before save.
- No raw media retention by default.
- Clear privacy copy.
- Low-confidence extraction warning.

## Pre-launch checks

- Confirm no API keys are committed.
- Confirm raw images/audio are not stored by default.
- Confirm extraction output is validated before ledger generation.
- Confirm users can manually correct every field.
- Confirm export works without cloud account.
- Confirm privacy copy does not claim 100% offline if cloud AI is used.

## Blocking issues

Cloud AI privacy is the main launch-sensitive issue. It does not block a controlled validation MVP if the product clearly states what is processed and obtains user consent. It does block public marketing that claims fully offline AI before on-device extraction exists.
