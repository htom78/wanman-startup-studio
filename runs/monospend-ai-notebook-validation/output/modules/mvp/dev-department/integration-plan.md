# Integration Plan

## Merge order

Merge in this order:

1. Foundation.
2. Composer.
3. Notebook UX.
4. Validation Telemetry.
5. QA.
6. Integration fixes and release notes.

Foundation must land first because it defines shared schema, fixtures, storage, and config boundaries. Composer and Notebook UX can then be integrated in either order if they respect the schema, but Composer should normally land before final UX polish so the UI can reflect real intent states and errors.

## Required checks

Run these checks before each merge:

- product repo install check;
- product repo unit tests;
- parser and calculation fixture tests;
- provider config smoke test with no key present;
- no committed API keys, local notebook data, screenshots containing private data, or `.env.local`;
- `git diff --check`.

Run these checks before final handoff:

- app starts locally;
- desktop viewport smoke test;
- mobile-width viewport smoke test;
- manual Chinese AA taxi scenario;
- manual `帮我算一下账` calculation-note scenario;
- text-only edit scenario;
- AI reinterpret scenario;
- stale calculation note scenario;
- delete/undo or delete/confirm scenario;
- JSON and Markdown export scenario.

## Manual checks

Manual trust-loop script:

1. Create a notebook named `Trust Loop Test`.
2. Submit `starting budget = 2400`.
3. Submit `昨晚我和王智出去玩了，吃了 200 块，aa 的，回来打车花了 50`.
4. Confirm AI proposes editable notebook lines rather than silently saving a black-box transaction.
5. Submit `帮我算一下账`.
6. Confirm a calculation note is saved.
7. Revise one amount.
8. Confirm the previous calculation note is marked stale, not silently rewritten.
9. Choose edit text only on a line and confirm AI Composer does not run.
10. Delete one line and confirm notebook state and exports remain coherent.

The manual check passes only if a tester can explain what changed and why the old calculation note is marked.

## Rollback plan

Rollback is lane-based:

- If Composer breaks, keep deterministic fallback and remove cloud model use from the demo.
- If Notebook UX breaks, revert the specific revision/deletion interaction while preserving the schema.
- If telemetry causes privacy risk, disable event export and keep manual tester notes.
- If integration breaks the app, revert the most recent lane merge and rerun the previous passing checks.

Do not rollback by resetting the whole repo unless the founder explicitly asks for it.

## Release artifact

The release artifact is a runnable validation build in the product repo plus a short handoff note containing:

- demo URL;
- setup command;
- model configuration file location;
- tests run;
- manual trust-loop script result;
- known limitations;
- tester-session instructions.

This artifact is for 5 to 10 validation sessions. It is not a public launch, App Store package, paid product, or financial-advice tool.
