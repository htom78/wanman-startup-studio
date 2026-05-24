# Disconfirming Evidence

## Strongest counterargument

The strongest counterargument is that AI capture is already commoditized. Many apps now promise voice logging, receipt scanning, AI categorization, budgets, and insights. Users may not care whether the saved record is a readable ledger line if the conventional transaction list is easier to understand.

Another counterargument is privacy. If MonoSpend uses cloud AI for voice or image extraction, the original 100% offline promise becomes weaker. If it insists on on-device AI from day one, implementation complexity may slow validation.

## Kill criteria

Kill or pause the pivot if:

- Users choose a standard transaction table over notepad ledger output.
- Users do not want to confirm or edit AI extraction before saving.
- Users expect bank sync more than capture flexibility.
- Users see ledger text as technical or confusing.
- AI extraction cost makes one-time pricing unrealistic.
- Privacy objections block cloud AI and on-device AI is too hard for v0.

## What would change our mind

The pivot becomes much stronger if users react positively to a ledger line like:

`2026-05-25 lunch ramen $15.50 #food @RamenHouse`

and say they would rather keep that than a black-box transaction row.

It becomes very strong if users bring receipt photos or voice notes and ask to convert them into their own ledger.

## Bias check

The team may overvalue text ownership because it appeals to builders, note-takers, and local-first product instincts. The product must verify that ordinary users understand and value the ledger output.

The team may also underweight AI capture competition because the ledger idea feels distinctive internally.

## Current recommendation

Recommend `ALLOW_MVP` for a very narrow validation MVP, not a full app. The problem has stronger evidence than the original live-math concept because many competitors are attacking capture friction. The differentiator is still unproven, so the MVP must test one thing: AI capture into editable notepad ledger.
