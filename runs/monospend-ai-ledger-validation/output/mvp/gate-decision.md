# MVP Gate Decision

Decision: BUILD

## Build readiness

The MVP is ready to build as a narrow validation prototype. The scope is constrained to AI capture, structured extraction, editable ledger-line preview, local save, and export. This is small enough to test the core thesis without becoming a full personal finance app.

Build readiness is conditional on honest privacy language and strict validation of AI output.

## Risks

- AI capture competitors are already active.
- Users may not value ledger text.
- Cloud AI may conflict with privacy expectations.
- AI extraction mistakes may reduce trust.
- Voice/photo support can expand scope quickly.

## First sprint

1. Define extraction JSON schema.
2. Build typed-input extraction first.
3. Add receipt image upload and extraction.
4. Add voice only if browser/platform support is straightforward.
5. Generate editable ledger line preview.
6. Save confirmed entries locally.
7. Add Markdown/JSONL/CSV export.
8. Test with five real or realistic expenses.

## Recommendation

Build the narrow validation MVP. Do not build bank sync, cloud sync, dashboards, AI advice, or full mobile app polish. The next decision should depend on whether testers choose to keep using the ledger after initial capture.
