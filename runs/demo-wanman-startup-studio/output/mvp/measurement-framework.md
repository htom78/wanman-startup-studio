# Measurement Framework

## Activation

A user is activated when they create a run, complete the required Idea Stage files, and get a passing Idea validation result. A stronger activation event is successful promotion to MVP Gate through `promote-stage.mjs`.

Activation metric:

- Number of runs created.
- Percentage of runs with complete Idea artifacts.
- Percentage of runs that produce a legal gate decision.

## Retention

Retention is measured by repeated use across multiple ideas or by returning to the same run after customer interviews. The workflow is only valuable if founders reuse it when decisions get harder.

Retention metric:

- Repeat runs per founder.
- Reopened runs after interviews.
- Number of artifacts updated with new evidence.

## Revenue

Revenue is not in scope for the local MVP. The first revenue hypothesis is `needs verification`: founders may pay for a packaged workflow, hosted version, team collaboration, or service-assisted validation. The MVP should capture willingness-to-pay signals during interviews rather than adding payment infrastructure.

Revenue signal:

- Users ask to apply the workflow to a real current idea.
- Users ask for team sharing, hosted runs, or assisted research.
- Users offer to pay for a repeatable validation kit.

## Referral

Referral indicates that the artifact quality is high enough to share with a cofounder, advisor, investor, or customer discovery partner.

Referral metric:

- Number of runs shared externally.
- Number of artifacts copied into advisor or cofounder discussions.
- Qualitative comments that the gate decision clarified action.

## Instrumentation

Because v0 is local, instrumentation is manual:

- Log each demo or user test in a research notes file.
- Record whether the user completed each stage.
- Record time to Idea Gate and time to MVP Gate.
- Capture confusion points in `output/final-summary.md`.

Future hosted versions may add event tracking, but v0 should not introduce analytics dependencies before demand is validated.
