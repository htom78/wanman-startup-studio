# MVP Scope

## First user task

A founder can create a startup run from a JSON brief, complete Idea Stage artifacts, receive an explicit gate decision, and only then create MVP Gate artifacts. The first successful user task is not "build my startup." It is "make a better build/no-build decision and preserve the evidence."

## In scope

- `new-startup-run.mjs` creates a repeatable run with input, tasks, prompts, status, and Idea artifact paths.
- `validate-stage.mjs` checks required Idea and MVP Gate files for minimum completeness and required headings.
- `promote-stage.mjs` reads the Idea Gate and creates MVP files only when the decision is `ALLOW_MVP`.
- Role packs define founder orchestrator, researcher, devil's advocate, solution designer, product architect, and security reviewer.
- Demo run proves the flow from Idea to MVP Gate.

## Out of scope

- Hosted product UI.
- User accounts.
- Payments.
- Automated web research agents.
- Full wanman runtime bootstrap.
- Launch and Scale automation.
- Code generation for the founder's actual MVP.

## Non-goals

The MVP should not optimize for visual polish or broad startup education. It should prove that a local operating system can enforce stage discipline and leave behind useful artifacts.

## Acceptance criteria

- A new run can be created from `inputs/startup-brief.example.json`.
- Idea Stage validation fails on empty files and passes on complete files.
- MVP Gate promotion fails unless the Idea Gate says `ALLOW_MVP`.
- Complete demo passes `npm test`.
- A founder can read `TASKS.md` and know the next action without additional explanation.
