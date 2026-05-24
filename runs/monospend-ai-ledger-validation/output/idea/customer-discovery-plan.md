# Customer Discovery Plan

## Recruiting

Recruit 15 people across four groups:

- 5 manual trackers who currently use notes, spreadsheets, or simple apps.
- 4 people who tried expense apps and abandoned them.
- 3 privacy-conscious users who reject bank sync.
- 3 users who regularly save receipts or need reimbursement records.

Recruit from personal networks, productivity communities, privacy-focused app forums, Obsidian/plain-text communities, side project audiences, and people already commenting on AI expense tracker products.

## Interview questions

1. What was the last purchase you forgot to track?
2. How do you currently record small purchases?
3. When do you use voice, photos, screenshots, or notes for money records?
4. What makes expense tracking feel too slow?
5. What do you distrust about bank-connected finance apps?
6. Would you trust AI to extract a transaction if you can see and edit the final ledger line?
7. Which input would you actually use: voice, receipt photo, typed note, or all three?
8. What should happen after AI extracts the data?
9. Would you rather see a transaction table or a readable notepad ledger?
10. How important is export to CSV, JSON, Markdown, hledger, or plain text?
11. What privacy promise would make cloud AI acceptable for a first version?
12. What would make this feel like just another AI expense tracker?
13. Would you test a tiny prototype with five real expenses?
14. If the AI makes a category mistake, how should correction work?
15. What would you pay for if it replaced your current tracking habit?

## Leading questions

Do not lead with "AI-powered." Start from missed tracking moments and current behavior. Avoid asking whether the user "likes" receipt scanning or voice input in the abstract. Ask which input they used in the last week and what happened to that data.

Avoid promising 100% offline if the early prototype may use cloud AI. Ask how they evaluate privacy tradeoffs.

## Evidence capture

Capture:

- Current tracking workflow.
- Frequency of missed entries.
- Preferred capture mode.
- Reaction to AI-generated ledger text.
- Trust objections.
- Export requirements.
- Willingness to test with real expenses.
- Whether the user returns after 7 days.
- Exact phrases for positioning.

## Success threshold

Use `ALLOW_MVP` for the narrow validation prototype if at least 5 of 15 users agree to test the AI-capture-to-ledger flow with real or realistic expenses.

Use `PIVOT` if users like AI capture but do not care about the ledger output.

Use `BLOCK` if users mostly want automatic bank import, a full dashboard, or do not want to manually confirm AI outputs.
