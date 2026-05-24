# Founder Playbook Mapping

This project maps the 2026 Founder Playbook principles into an executable local workflow.

## Core Interpretation

The playbook's central operating shift is that founders gain leverage from AI coding, research, and workflow automation, but still need to orchestrate timing and judgement. Therefore this system is not an autopilot. It is a stage-gated operating system.

## Stage Mapping

| Playbook stage | Studio module | V0 status | Gate question |
| --- | --- | --- | --- |
| Idea | `output/idea/*` | implemented | Is the problem real enough to justify MVP work? |
| MVP | `output/mvp/*` | implemented as gate | Is the build small, measurable, and safe enough for first users? |
| Launch | `system/stage-gates/launch.md` | template only | Is growth and production operation repeatable? |
| Scale | `system/stage-gates/scale.md` | template only | Can the company operate beyond founder heroics? |

## Design Consequences

- The default path blocks building until Idea Gate approval.
- The strongest counterargument is a required artifact, not an optional note.
- MVP planning includes architecture, metrics, and security before coding.
- Launch and Scale are intentionally not automated in v0 because they need evidence produced by real usage.

## Product Boundary

`ai-product-research-studio` fits naturally as a module inside Idea Stage. `wanman-startup-studio` is the parent system that decides when research becomes MVP work.

## Product Research Module

The previous standalone `ai-product-research-studio` workflow is now represented by `modules/idea/product-research`.

What moved into the parent system:

- Competitor map discipline.
- Source index and `needs verification` policy.
- ICP, JTBD, category, and differentiation notes.
- Landing page work as a smoke-test experiment plan.

What deliberately did not move:

- The old project's full landing page prototype as a required artifact.
- Vendor patches and wanman runtime experiments.
- Any assumption that research output alone approves MVP work.

The Idea Gate remains the authority. Product research supplies evidence; it does not promote the startup by itself.
