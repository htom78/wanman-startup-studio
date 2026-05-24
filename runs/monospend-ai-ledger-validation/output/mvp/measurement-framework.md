# Measurement Framework

## Activation

Activation occurs when a user captures one real expense, confirms the AI-generated ledger line, and saves it. A stronger activation event is saving five expenses using at least two input modes.

Activation metrics:

- Capture started.
- Extraction succeeded.
- User edited fields.
- User confirmed ledger line.
- Export used.

## Retention

Retention is the key risk. Measure whether testers return within 7 days and add more expenses. The MVP should not count one-time curiosity as success.

Retention metrics:

- Day 2 return.
- Day 7 return.
- Number of confirmed ledger lines per tester.
- Whether user uses the ledger for a real spending decision.

## Revenue

Do not add payment in MVP. Collect willingness-to-pay evidence:

- Would pay one-time for local ledger and export.
- Would pay for AI capture credits.
- Would bring own API key.
- Would pay subscription only if on-device/private AI exists.

Pricing must be revisited because AI capture introduces recurring cost.

## Referral

Referral signal:

- User shares the ledger format with a friend.
- User asks for import/export compatibility.
- User requests a mobile version after testing.
- User says this replaces notes/spreadsheet tracking.

## Instrumentation

For a local prototype, use manual event logging:

- Store anonymous event counters in local JSON.
- Ask testers for a short diary after one week.
- Record extraction failures and corrections.
- Track input mode preference.
- Record privacy objections verbatim.

If hosted testing is used, avoid collecting raw receipt images or voice files unless explicitly consented.
