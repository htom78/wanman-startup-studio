# Idea Gate Decision

Decision: ALLOW_MVP

## Evidence

The revised product shape addresses the biggest weakness in the original MonoSpend idea: manual entry friction. Many current competitors now use voice input, receipt scanning, natural-language text, AI categorization, and offline/on-device processing, which suggests capture friction is a real and active product problem.

The revised differentiator is not AI capture itself. It is the output model: AI turns messy input into a clean, user-owned, editable notepad ledger. This keeps the strongest part of the old concept while making input easier.

The evidence is enough to allow a narrow validation MVP because the MVP can be tiny and directly test the wedge.

## Risks

- AI capture is crowded and may become table stakes.
- Users may prefer a normal transaction table over ledger text.
- Cloud AI weakens the offline privacy promise.
- On-device AI may be too much engineering for v0.
- Receipt OCR accuracy and category quality can undermine trust.
- Pricing must account for recurring AI cost.

## Next step

Proceed to MVP Gate only for a narrow validation prototype:

1. Text input to AI extraction.
2. Receipt image upload to AI/OCR extraction.
3. Optional voice transcription if cheap to implement.
4. Structured JSON validation.
5. Editable ledger-line preview.
6. Local save/export.

Do not build full finance app features yet.

## Conditions

Revoke `ALLOW_MVP` if the MVP scope expands into bank sync, cloud sync, charts, AI finance coaching, group sharing, or a full native app before validating the ledger-output thesis.

Change to `PIVOT` if testers like AI capture but ignore or dislike ledger ownership.

Change to `BLOCK` if users do not trust AI capture enough to record financial data.
