# MVP Gate Decision

Decision: BUILD

## Build readiness

The MVP is ready for a controlled validation build because the prototype already covers the central behavior: AI Composer, canonical notebook lines, derived right-column results, multiple notebooks, local persistence, exports, and user-triggered calculation notes.

The build is not ready for public launch, mobile distribution, or payment. It is ready for 5 to 10 structured tester sessions.

## Risks

- Users may prefer automatic totals.
- Users may not understand calculation notes until they try several examples.
- The paper notebook style may delight some users but feel decorative to others.
- Voice/photo extraction quality can distract from the core notebook test.
- Cloud AI privacy copy must be exact.
- The prototype currently stores local browser state, which is fine for validation but not enough for cross-device usage.

## First sprint

1. Stabilize the prototype copy around "AI financial notebook."
2. Add 8 to 12 sample prompts: tips, splits, income, rent, subscriptions, travel, runway, total cost.
3. Add a one-week tester script.
4. Add lightweight local event logging for line creation and calculation notes.
5. Run 5 moderated tests with manual trackers.
6. Run 5 async one-week tests.
7. Decide whether calculation notes are retained, revised, or removed.

## Recommendation

Build and test the narrow validation MVP. Do not build bank sync, accounts, charts, AI advisor flows, or a native app until the notebook behavior proves retention.
