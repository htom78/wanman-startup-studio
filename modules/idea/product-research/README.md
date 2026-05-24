# Idea Module: Product Research

This module is where `ai-product-research-studio` fits inside the broader startup system. It imports the useful part of that project: competitor research, positioning, source discipline, and landing-page smoke-test planning.

It does not import the whole old project, the vendor patches, or the full landing page prototype by default. In the startup lifecycle, a landing page is an experiment plan until the Idea Gate has enough evidence.

## Inputs

- Startup brief
- Target customer hypotheses
- Known competitors or alternatives
- Must-answer questions

## Outputs

- `output/modules/idea/product-research/competitor-map.md`
- `output/modules/idea/product-research/source-index.md`
- `output/modules/idea/product-research/positioning-notes.md`
- `output/modules/idea/product-research/landing-page-experiment.md`

## Usage

From the project root:

```bash
node scripts/add-product-research-module.mjs runs/<run-id>
node scripts/validate-stage.mjs runs/<run-id> product-research
```

## Gate role

Product research does not approve MVP work by itself. It feeds the Idea Gate, where the founder orchestrator also considers customer discovery, disconfirming evidence, and solution concept.

## Relationship to the previous project

`ai-product-research-studio` was a standalone workflow for competitor research, product positioning, and a static landing page prototype. In this parent system, that work becomes an optional Idea module:

- Competitor research feeds `output/idea/competitor-threat-map.md`.
- Positioning notes inform `output/idea/solution-concept.md`.
- Landing page work becomes a smoke-test plan, not default production.
- The Idea Gate remains the authority for whether MVP work starts.
