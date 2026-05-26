# Security Review

## Data

Sensitive data includes receipt images, voice transcripts, merchants, income, rent, subscriptions, cashflow assumptions, and personal notes. The notebook format makes data readable, which is good for ownership but risky if exported or shared accidentally.

The MVP should store only confirmed notebook lines in local browser storage. Raw photos, audio, and cloud extraction payloads should not be retained by default.

## Auth

No account is needed for the local validation MVP. If hosted, avoid server-side persistence. Future sync would require authentication, encryption, deletion, export, and recovery design.

## Abuse

Risks:

- AI parses the wrong amount.
- Prompt injection in receipt text.
- User assumes derived output is financial advice.
- Old calculation notes are misunderstood as live totals.
- Cloud AI receives sensitive receipt or voice content.
- Exported files leak private financial data.

Mitigations:

- clear distinction between fact lines and calculation notes;
- user confirmation/editing before save;
- deterministic calculation engine;
- low-confidence warning;
- no raw media retention;
- explicit privacy copy;
- export warning;
- test cases for calculation note behavior.

## Pre-launch checks

- Confirm no API keys are committed.
- Confirm raw media is not stored by default.
- Confirm cloud AI mode is opt-in and disclosed.
- Confirm calculation notes do not silently update.
- Confirm users can edit canonical lines.
- Confirm export content is explicit.
- Confirm prototype copy avoids "financial advice" claims.

## Blocking issues

No blocker for controlled validation. Public launch is blocked until privacy copy, cloud/on-device AI policy, and calculation-note semantics are polished.
