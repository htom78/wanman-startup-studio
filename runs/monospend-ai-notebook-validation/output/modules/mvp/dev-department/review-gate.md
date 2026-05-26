# Dev Review Gate

Decision: MERGE

## Review scope

This review covers the Dev Department plan for the MonoSpend AI Notebook trust-loop validation build. It reviews the department structure, task graph, worktree strategy, integration order, verification requirements, and escalation rules. It does not review a completed product implementation yet.

The approved build target is the private product repo `/Volumes/PortableSSD/Projects/Codex_Projects/monospend-ai-ledger`. The startup-studio run remains the planning and gate record.

## Findings

No blocker findings for entering a dev-planning-to-build pass.

High-priority constraints:

- The app must keep editable notebook lines as the source of truth.
- AI Composer must expose uncertainty through editable previews, warnings, or clarification states.
- Text-only edits must bypass AI Composer.
- Existing calculation notes must not be silently recomputed after upstream facts change.
- Cloud AI configuration must not leak API keys or retain raw private financial media by default.

Medium-priority risks:

- Multiple lanes may touch shared app state, so Foundation must land before feature work.
- Voice and photo capture can distract from the trust-loop test if they become product surfaces rather than input modes.
- A polished notebook UI can create false positive enthusiasm; the tester script must measure repeated use and correction behavior.

Low-priority notes:

- Emdash remains optional as a future runner. It is not required for this validation slice.
- Wanman supervisor is not required because the file-based startup-studio workflow is enough to coordinate the next pass.

## Verification results

Planning verification passed when the Dev Department artifacts were created from an MVP Gate with `Decision: BUILD` and the task graph defined at least two independent lanes plus integration checks.

The implementation still needs product-repo verification:

- product repo tests;
- local app smoke test;
- provider config smoke test;
- mobile viewport check;
- manual trust-loop script;
- secret and local-data audit.

## Risks

Residual risks:

- The real model may parse natural language inconsistently, especially Chinese split-bill and follow-up calculation phrasing.
- Users may still expect automatic totals even after seeing calculation notes.
- Stale-note marking may be cognitively new and needs careful UI copy.
- Local-only storage is enough for validation but may limit one-week async testing if testers switch devices.
- Receipt photo and microphone permissions may add friction unrelated to the core product question.

These risks do not block the dev pass because the next build is explicitly a validation build.

## Next action

Merge this Dev Department plan into the active startup-studio run, then start the Foundation lane in the product repo. After Foundation lands, run Composer, Notebook UX, and Validation Telemetry in parallel. Integrate through QA and then run the manual trust-loop script before inviting testers.
