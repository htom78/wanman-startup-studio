# Agent Lanes

## Dev lead

The dev lead owns scope control and sequencing. The lead reads the MVP scope, architecture brief, measurement framework, security review, and this Dev Department package before assigning coding work. The lead keeps the product repo focused on the approved validation question: can users trust AI Composer because every output is inspectable, editable, and recoverable?

The lead must prevent expansion into bank sync, dashboards, AI financial advice, authentication, payment, or native mobile work. The lead also owns the final call on whether cloud AI behavior is reliable enough for tester sessions or whether the deterministic fallback should be the primary demo path.

## Foundation agent

The foundation agent works first. This lane creates the shared schema, storage helpers, config boundary, fixture data, and tests that the other agents use. It should touch the smallest possible foundation surface in `/Volumes/PortableSSD/Projects/Codex_Projects/monospend-ai-ledger`.

Expected outputs:

- notebook line schema with `kind`, `canonicalText`, `amount`, `source`, `revision`, `dependsOnLineIds`, and `stale`;
- composer response schema with `intent`, `lines`, `confidence`, `warnings`, and `rawInput`;
- provider config loading that can use a local OpenRouter key without committing it;
- deterministic fixtures for Chinese, English, split bills, taxi, tips, income, and calculation requests;
- baseline parser and calculation tests.

## Composer agent

The composer agent owns the AI Composer lane after Foundation lands. It implements the path from messy user input to editable preview data. It must distinguish at least four intents: recording a fact, creating a calculation note, saving a plain text note, and asking for clarification.

This agent should treat the model as an assistive parser, not the ledger owner. If the model output is malformed, ambiguous, or low-confidence, the UI should still be able to save a text note or ask the user to revise. The Chinese scenario `昨晚我和王智出去玩了，吃了 200 块，aa 的，回来打车花了 50` is a required fixture.

## Notebook UX agent

The Notebook UX agent owns the visible trust loop. This lane must make three actions clear:

- reinterpret with AI Composer;
- edit text only;
- delete or undo delete.

The UX must also show stale calculation notes when a dependent fact changes. It should not silently recompute old calculation notes. The notebook metaphor is important: old notes remain part of the record, but they can be marked as affected by later edits.

## QA agent

The QA agent owns regression confidence. It writes tests and manual scripts around the highest-risk product claims:

- AI can parse messy natural language into useful notebook lines;
- user can correct AI without entering a loop;
- text-only edit bypasses AI;
- calculation notes are intentional and persistent;
- stale notes are visible after edits;
- deletion does not corrupt notebook state;
- export preserves the current notebook.

QA should test both happy paths and model failure paths. The product should still be usable when the AI provider is missing or returns unusable output.

## Integration agent

The Integration agent owns final assembly. It merges Foundation first, then Composer, Notebook UX, Validation Telemetry, QA, and final release notes. It resolves conflicts in shared schema, app state, tests, and CSS. It also runs final smoke checks on a desktop viewport and a mobile-width viewport.

The integration output is a runnable validation build, not a public launch. The handoff must include how to start the app, which API key file is expected, which tests passed, and which scenarios are ready for tester sessions.

## Escalation

Agents must escalate instead of continuing when:

- a required behavior contradicts the MVP scope;
- a schema change would break another lane;
- cloud AI requires storing raw financial content beyond the confirmed notebook line;
- a model interpretation cannot be corrected by the user;
- an old calculation note would be silently rewritten;
- an implementation path requires a full backend account system.

Escalation goes to the dev lead first. The founder decides only on product-scope tradeoffs: whether to keep a feature, simplify it, or postpone it until after trust-loop validation.
