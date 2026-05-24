# Security Review

## Data

The v0 stores local JSON and Markdown files. It should not collect secrets, customer personal data, payment data, or production credentials. Users may paste sensitive startup notes into artifacts, so documentation should remind them that run directories are plain local files.

Risk: if the project is synced to cloud storage or committed to a public repository, private startup notes could leak.

## Auth

There is no authentication in v0 because there is no hosted service. That is acceptable for a local workflow. If a hosted version is built later, auth becomes a launch-blocking requirement before teams can store customer interviews or strategy notes.

## Abuse

Potential abuse cases:

- Generating confident but unsupported market claims.
- Using automated outreach without consent or review.
- Treating competitor summaries as verified when they are stale.
- Using the system to justify a decision the founder already wanted.

Mitigation:

- Validators require `needs verification` handling.
- Devil's advocate artifact is mandatory.
- Gate decisions must include risks and next steps.

## Pre-launch checks

- Confirm no sample file contains real secrets.
- Confirm demo sources are labelled correctly.
- Confirm validation fails on empty artifacts.
- Confirm promotion fails when Idea Gate is `BLOCK` or `PIVOT`.
- Add `.gitignore` before storing private user runs in a real repo.

## Blocking issues

No security issue blocks local MVP testing. A hosted or collaborative version must revisit auth, access control, data retention, audit history, and privacy policy requirements.
