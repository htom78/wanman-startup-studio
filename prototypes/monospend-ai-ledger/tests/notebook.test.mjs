import assert from "node:assert/strict";
import {
  composeLocalNotebookLines,
  createFolder,
  createNotebook,
  defaultNotebookState,
  normalizeComposedLines,
  normalizeNotebookState,
  reclassifyLineIntent
} from "../lib/notebook.mjs";

const state = defaultNotebookState();
const notebook = state.notebooks[0];

assert.equal(state.activeFolderId, "general");
assert.ok(state.folders.some(folder => folder.id === "general"));
assert.equal(notebook.folderId, "general");

const travelFolder = createFolder("Travel Ideas");
const travelNote = createNotebook("Tokyo cash", travelFolder.id);
assert.equal(travelFolder.id, "travel-ideas");
assert.equal(travelNote.folderId, travelFolder.id);

const migratedState = normalizeNotebookState({
  activeNotebookId: "loose",
  notebooks: [{ id: "loose", title: "Loose note", lines: [] }]
});
assert.equal(migratedState.activeFolderId, "general");
assert.equal(migratedState.notebooks[0].folderId, "general");

const remark = composeLocalNotebookLines({
  raw: "ask sam about rent",
  notebook,
  source: "text"
});
assert.equal(remark.length, 1);
assert.equal(remark[0].kind, "note");
assert.equal(remark[0].amount, 0);
assert.equal(remark[0].canonicalText, "ask sam about rent");

const dinner = composeLocalNotebookLines({
  raw: "dinner sushi 45.90",
  notebook,
  source: "text"
});
assert.equal(dinner[0].kind, "expense");
assert.equal(dinner[0].category, "food");
assert.equal(dinner[0].amount, -45.9);
assert.equal(dinner[0].canonicalText, "dinner sushi = $45.90");

const calc = composeLocalNotebookLines({
  raw: "calculate remaining",
  notebook,
  source: "text"
});
assert.equal(calc[0].kind, "calculation");
assert.equal(calc[0].query, "remaining");
assert.equal(calc[0].amount, 3031.25);

const chineseCostCalc = composeLocalNotebookLines({
  raw: "算一下账",
  notebook,
  source: "voice"
});
assert.equal(chineseCostCalc[0].kind, "calculation");
assert.equal(chineseCostCalc[0].query, "totalCost");
assert.equal(chineseCostCalc[0].amount, -2568.75);
assert.equal(chineseCostCalc[0].canonicalText, "算一下账");

const casualChineseCostCalc = composeLocalNotebookLines({
  raw: "帮我算一下",
  notebook,
  source: "voice"
});
assert.equal(casualChineseCostCalc[0].kind, "calculation");
assert.equal(casualChineseCostCalc[0].query, "totalCost");
assert.equal(casualChineseCostCalc[0].amount, -2568.75);

const chineseRemainingCalc = composeLocalNotebookLines({
  raw: "还剩多少钱",
  notebook,
  source: "voice"
});
assert.equal(chineseRemainingCalc[0].kind, "calculation");
assert.equal(chineseRemainingCalc[0].query, "remaining");
assert.equal(chineseRemainingCalc[0].amount, 3031.25);

const messyVoice = composeLocalNotebookLines({
  raw: "Yesterday Uber to the airport was 38.40, and lunch ramen was 15.50",
  notebook,
  source: "voice"
});
assert.equal(messyVoice.length, 2);
assert.deepEqual(messyVoice.map(line => line.kind), ["expense", "expense"]);
assert.equal(messyVoice[0].canonicalText, "uber to the airport = $38.40");
assert.equal(messyVoice[1].canonicalText, "lunch ramen = $15.50");
assert.equal(messyVoice[0].amount, -38.4);
assert.equal(messyVoice[1].amount, -15.5);

const normalized = normalizeComposedLines({
  raw: "calculate remaining",
  notebook,
  source: "text",
  lines: [{
    text: "remaining",
    canonicalText: "calculate remaining",
    kind: "calculation",
    category: "calculation",
    amount: 999999,
    query: "remaining",
    confidence: 0.9,
    resultText: "$999,999",
    reason: "model guess"
  }]
});
assert.equal(normalized[0].amount, 3031.25);

const normalizedCasualCalculation = normalizeComposedLines({
  raw: "帮我算一下",
  notebook,
  source: "text",
  lines: [{
    text: "帮我算一下",
    canonicalText: "帮我算一下",
    kind: "note",
    category: "note",
    amount: 0,
    query: "",
    confidence: 0.7,
    resultText: "",
    reason: "model treated it as a note"
  }]
});
assert.equal(normalizedCasualCalculation[0].kind, "calculation");
assert.equal(normalizedCasualCalculation[0].query, "totalCost");
assert.equal(normalizedCasualCalculation[0].amount, -2568.75);

const misreadNote = {
  id: "misread-calc",
  text: "帮我算一下",
  canonicalText: "帮我算一下",
  kind: "note",
  category: "note",
  amount: 0,
  source: "text"
};
const correctedCalculation = reclassifyLineIntent({
  line: misreadNote,
  notebook,
  intent: "calculation",
  query: "totalCost"
});
assert.equal(correctedCalculation.id, misreadNote.id);
assert.equal(correctedCalculation.kind, "calculation");
assert.equal(correctedCalculation.query, "totalCost");
assert.equal(correctedCalculation.amount, -2568.75);
assert.equal(correctedCalculation.meta, "corrected intent");

const textOnlyEditable = reclassifyLineIntent({
  line: dinner[0],
  notebook,
  intent: "note"
});
assert.equal(textOnlyEditable.kind, "note");
assert.equal(textOnlyEditable.amount, 0);

const aiCategory = normalizeComposedLines({
  raw: "今天打车去客户会议花了 102 元",
  notebook,
  source: "text",
  lines: [{
    text: "打车去客户会议 = ¥102",
    canonicalText: "打车去客户会议 = ¥102",
    kind: "expense",
    category: "transport",
    amount: -102,
    query: "",
    confidence: 0.95,
    resultText: "",
    reason: "model inferred taxi expense"
  }]
});
assert.equal(aiCategory[0].category, "transport");

console.log("Notebook composer tests passed");
