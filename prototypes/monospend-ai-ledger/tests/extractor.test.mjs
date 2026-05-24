import assert from "node:assert/strict";
import {
  buildLedgerLine,
  localExtractExpense,
  parseAmount,
  validateExtraction
} from "../lib/extractor.mjs";

assert.equal(parseAmount("coffee $5.50 * 2"), 11);
assert.equal(parseAmount("uber airport 23.40 yesterday"), 23.4);

const entry = localExtractExpense({
  text: "lunch ramen at Ramen House $15.50 today",
  source: "text",
  now: new Date("2026-05-25T12:00:00Z")
});

assert.equal(entry.date, "2026-05-25");
assert.equal(entry.amount, 15.5);
assert.equal(entry.currency, "USD");
assert.equal(entry.category, "food");
assert.equal(entry.source, "text");
assert.match(entry.ledgerLine, /2026-05-25/);
assert.match(entry.ledgerLine, /#food/);

const validation = validateExtraction(entry);
assert.equal(validation.ok, true, validation.errors.join(", "));

assert.equal(
  buildLedgerLine({
    date: "2026-05-25",
    amount: 23.4,
    currency: "USD",
    merchant: "Uber",
    category: "transport",
    note: "airport ride"
  }),
  "2026-05-25 airport ride USD 23.40 #transport @Uber"
);

console.log("Extractor tests passed");

