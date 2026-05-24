# Solution Concept

## Workflow

The user starts with a JSON startup brief. The system creates a run directory with tasks, prompts, status, and required Idea Stage artifact paths. Agents or a human operator fill the artifacts. The validator checks whether the evidence is complete enough for an explicit gate decision.

If the Idea Gate says `Decision: ALLOW_MVP`, the promotion script creates the MVP Gate workspace. If the decision is `PIVOT` or `BLOCK`, the system stops and preserves the evidence. This makes the build/no-build decision visible instead of burying it in chat history.

## Core jobs

- Help a founder define the problem and customer segment precisely.
- Force customer discovery questions before solution design.
- Map direct, adjacent, and manual alternatives.
- Require the strongest counterargument and kill criteria.
- Produce a lightweight solution concept only after the evidence is written.
- Generate MVP scope, architecture, measurement, and security work only after approval.

## Not building

The v0 should not build:

- Hosted dashboard.
- Login or team accounts.
- Payment flows.
- Automated customer outreach.
- Full Launch or Scale automation.
- Generic landing page generator.
- Code generation for the user's startup MVP.

## Prototype

The prototype is the file-based operating system itself: scripts, role packs, validators, and a demo run. It is not validation. It is a tool for running interviews and structured founder workflows.

## First moment of value

The first moment of value is when a founder sees a gate decision that makes their next action obvious: continue to MVP Gate, pivot the customer/problem, or block the idea before wasting build time.

## Risk

The workflow may feel heavy unless the artifacts are concise and directly reusable. The MVP should optimize for a fast, serious run rather than a beautiful interface.
