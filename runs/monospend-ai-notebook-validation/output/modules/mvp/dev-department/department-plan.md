# Dev Department Plan

## Build objective

Build the next validation slice for MonoSpend AI Notebook as a real web app in `/Volumes/PortableSSD/Projects/Codex_Projects/monospend-ai-ledger`. The objective is not to ship a complete finance product. It is to prove the trust loop around AI Composer:

- messy text, voice transcript, or receipt text becomes an editable notebook line;
- the user can revise AI interpretation when it is wrong;
- the user can edit text only without retriggering AI;
- user-triggered calculation notes are saved as notebook artifacts;
- stale calculation notes are visibly marked when upstream facts change;
- line deletion is discoverable and recoverable enough for a validation MVP.

The build is successful when a tester can record realistic money notes, correct at least one AI mistake, intentionally create a calculation note, understand stale-note behavior, and return later without losing the notebook.

## Department structure

The department has six lanes:

- Dev lead: owns the scope, shared contracts, branch sequencing, and gate decisions.
- Foundation agent: owns app structure, shared types, storage model, config loading, and test harness.
- Composer agent: owns AI Composer API integration, deterministic fallback parsing, intent classification, and structured extraction tests.
- Notebook UX agent: owns notebook list, line editing, edit mode choices, stale-note badges, deletion interaction, and responsive iOS-style UI behavior.
- QA agent: owns regression tests, acceptance scenarios, accessibility checks, and tester script fixtures.
- Integration agent: owns merge order, conflict resolution, smoke verification, release notes, and the demo URL.

The founder remains the product owner and decides whether the resulting behavior is strong enough for moderated tester sessions.

## Parallelization strategy

Work should start sequentially for one short foundation pass, then split. Foundation defines the notebook schema, composer response contract, event names, and storage boundary first. After that, Composer, Notebook UX, and QA can run mostly in parallel because they can work against the same schema and fixtures.

The high-risk dependencies are:

- Notebook UX cannot finalize stale-note behavior until Foundation defines line revision metadata.
- Composer cannot finalize cloud model behavior until config loading and redaction rules exist.
- QA cannot finalize acceptance tests until Composer and UX expose stable user flows.
- Integration must merge Foundation first, then Composer and UX, then QA.

Do not parallelize changes to the same core files unless the integration agent owns the branch.

## Shared contracts

Line model:

```json
{
  "id": "line_01",
  "kind": "expense | income | note | calculation",
  "canonicalText": "lunch = $55.00 + 25% tip",
  "amount": -68.75,
  "source": "text | voice | photo | manual",
  "composerRunId": "run_01",
  "dependsOnLineIds": [],
  "revision": 1,
  "stale": false,
  "updatedAt": "ISO-8601"
}
```

Composer response contract:

```json
{
  "intent": "record_fact | calculate | text_note | needs_clarification",
  "lines": [],
  "confidence": 0.0,
  "warnings": [],
  "rawInput": "user supplied text"
}
```

Required user flows:

- Create fact line from text input.
- Create calculation note from a calculation request.
- Force reinterpret a line with AI Composer.
- Edit text only without AI Composer.
- Mark existing calculation notes stale after a dependent fact changes.
- Delete a line with confirmation or undo.
- Export the notebook as JSON and Markdown.

## Stop conditions

Agents must stop and escalate if:

- implementation requires bank sync, payments, authentication, cloud sync, or a native app;
- the UI hides AI uncertainty or silently changes historical calculation notes;
- a line edit mutates derived results without creating visible revision state;
- raw receipt images, voice audio, or private money text would be stored or transmitted without clear consent;
- the model contract drifts away from editable notebook lines into an opaque transaction database.

If an agent discovers that OpenRouter or another cloud model cannot reliably return structured JSON for the validation scenarios, keep the deterministic fallback and mark model behavior as a test risk rather than expanding scope.

## Verification

Required automated checks:

- package install succeeds in the product repo;
- unit tests cover parser fallback, calculation notes, stale-note marking, line deletion, and export;
- API tests cover success, malformed model output, no API key, and provider failure;
- UI smoke tests cover desktop and mobile widths;
- no committed API keys or local data files.

Required manual checks:

- submit `昨晚我和王智出去玩了，吃了 200 块，aa 的，回来打车花了 50`;
- submit `帮我算一下账`;
- revise the food amount and confirm old calculation notes are marked stale;
- edit text only and confirm AI Composer is not called;
- delete a line and confirm the notebook remains coherent;
- reload the page and confirm local persistence.
