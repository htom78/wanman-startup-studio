const STORAGE_KEYS = {
  notebooks: "monospend-ai-notebook-notes-v2",
  activeNotebookId: "monospend-ai-notebook-active-v2"
};

const CATEGORY_EMOJI = {
  food: "🍜",
  transport: "🚗",
  housing: "🏠",
  shopping: "🛍️",
  health: "💊",
  income: "💵",
  calculation: "Σ",
  other: "•"
};

const DEFAULT_NOTEBOOKS = [
  {
    id: "april-2026",
    title: "April 2026",
    lines: [
      line("demo-salary", "salary = $5.2k", "income", 5200, "salary = $5,200"),
      line("demo-freelance", "freelance = $400", "income", 400, "freelance = $400"),
      line("demo-rent", "monthly rent = $2.5k", "expense", -2500, "monthly rent = $2,500"),
      line("demo-phone", "phone bill = $45", "expense", -45, "phone bill = $45"),
      line("demo-food", "food = ~$50 per day × 30 days", "expense", -1500, "food = ~$50 per day × 30 days"),
      calculationLine("demo-total-cost", "calculate total cost", "totalCost", -4045),
      calculationLine("demo-remaining", "calculate remaining", "remaining", 1555)
    ]
  },
  {
    id: "runway-plan",
    title: "Runway Plan",
    lines: [
      line("runway-budget", "starting budget = $2.4k", "income", 2400, "starting budget = $2,400"),
      line("runway-cloud", "cloud tools = $84", "expense", -84, "cloud tools = $84"),
      line("runway-ads", "landing page ads = $320", "expense", -320, "landing page ads = $320"),
      calculationLine("runway-total", "calculate remaining runway", "remaining", 1996)
    ]
  },
  {
    id: "tokyo-trip",
    title: "Tokyo Trip",
    lines: [
      line("trip-budget", "trip budget = $1.2k", "income", 1200, "trip budget = $1,200"),
      line("trip-hotel", "hotel three nights = $420", "expense", -420, "hotel three nights = $420"),
      line("trip-train", "airport train = $38.40", "expense", -38.4, "airport train = $38.40"),
      calculationLine("trip-left", "calculate trip money left", "remaining", 741.6)
    ]
  }
];

function line(id, text, kind, amount, canonicalText = text, category = kind === "income" ? "income" : "other") {
  return {
    id,
    text,
    canonicalText,
    kind,
    category,
    amount,
    confidence: 0.92,
    source: "demo"
  };
}

function calculationLine(id, text, query, amount, source = "demo") {
  return {
    id,
    text,
    canonicalText: text,
    kind: "calculation",
    category: "calculation",
    query,
    amount,
    confidence: 1,
    source
  };
}

const state = {
  mode: "text",
  imageData: "",
  notebooks: loadNotebooks(),
  activeNotebookId: loadActiveNotebookId(),
  lastComposer: null
};

const els = {
  notebookList: document.querySelector("#notebookList"),
  newNotebook: document.querySelector("#newNotebook"),
  notebookTitle: document.querySelector("#notebookTitle"),
  incomeRows: document.querySelector("#incomeRows"),
  expenseRows: document.querySelector("#expenseRows"),
  calculatedRows: document.querySelector("#calculatedRows"),
  commandInput: document.querySelector("#commandInput"),
  submitCommand: document.querySelector("#submitCommand"),
  modeTabs: [...document.querySelectorAll(".mode-tab")],
  photoInput: document.querySelector("#photoInput"),
  receiptPreview: document.querySelector("#receiptPreview"),
  sampleButton: document.querySelector("#sampleButton"),
  recordButton: document.querySelector("#recordButton"),
  voiceStatus: document.querySelector("#voiceStatus"),
  message: document.querySelector("#message"),
  providerBadge: document.querySelector("#providerBadge"),
  entryCount: document.querySelector("#entryCount"),
  totalAmount: document.querySelector("#totalAmount"),
  topCategory: document.querySelector("#topCategory"),
  exportMarkdown: document.querySelector("#exportMarkdown"),
  exportJson: document.querySelector("#exportJson"),
  exportCsv: document.querySelector("#exportCsv"),
  clearLedger: document.querySelector("#clearLedger")
};

if (!state.notebooks.some(notebook => notebook.id === state.activeNotebookId)) {
  state.activeNotebookId = state.notebooks[0].id;
}

function cloneDefaultNotebooks() {
  return JSON.parse(JSON.stringify(DEFAULT_NOTEBOOKS));
}

function loadNotebooks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.notebooks) || "[]");
    if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeNotebook).filter(Boolean);
  } catch {
    // Fall through to defaults.
  }
  return cloneDefaultNotebooks();
}

function normalizeNotebook(notebook) {
  if (!notebook || typeof notebook !== "object") return null;
  return {
    id: notebook.id || crypto.randomUUID(),
    title: notebook.title || "Untitled",
    lines: Array.isArray(notebook.lines) ? notebook.lines.map(normalizeLine).filter(Boolean) : []
  };
}

function normalizeLine(item) {
  if (!item || typeof item !== "object") return null;
  const kind = item.kind === "query"
    ? "calculation"
    : ["income", "expense", "calculation"].includes(item.kind)
      ? item.kind
      : item.category === "income" ? "income" : "expense";
  return {
    id: item.id || crypto.randomUUID(),
    text: item.text || item.canonicalText || item.note || "untitled line",
    canonicalText: item.canonicalText || item.text || item.note || "untitled line",
    kind,
    category: item.category === "query" ? "calculation" : item.category || "other",
    amount: Number(item.amount || 0),
    query: item.query || "",
    confidence: Number(item.confidence || 0.75),
    source: item.source || "text",
    rawText: item.rawText || ""
  };
}

function loadActiveNotebookId() {
  return localStorage.getItem(STORAGE_KEYS.activeNotebookId) || DEFAULT_NOTEBOOKS[0].id;
}

function persistAll() {
  localStorage.setItem(STORAGE_KEYS.notebooks, JSON.stringify(state.notebooks));
  localStorage.setItem(STORAGE_KEYS.activeNotebookId, state.activeNotebookId);
}

function activeNotebook() {
  return state.notebooks.find(notebook => notebook.id === state.activeNotebookId) || state.notebooks[0];
}

function setMessage(text, kind = "") {
  els.message.textContent = text;
  els.message.dataset.kind = kind;
}

function setMode(mode) {
  state.mode = mode;
  els.modeTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.mode === mode));

  if (mode === "voice") {
    els.commandInput.placeholder = "say: this month salary 5200, lunch ramen 15.50";
    els.voiceStatus.style.display = "block";
  } else if (mode === "photo") {
    els.commandInput.placeholder = "receipt notes, e.g. lunch ramen total 15.50";
    els.voiceStatus.style.display = "none";
  } else {
    els.commandInput.placeholder = "write a money note, or ask AI to calculate...";
    els.voiceStatus.style.display = "none";
  }
  els.commandInput.focus();
}

function render() {
  renderNotebooks();
  renderNotebookTitle();
  renderLines();
  renderComposerTrace();
  renderMetrics();
}

function renderNotebooks() {
  const buttons = state.notebooks.map(notebook => {
    const button = document.createElement("button");
    button.className = "notebook-tab";
    button.classList.toggle("active", notebook.id === state.activeNotebookId);
    button.type = "button";
    button.dataset.id = notebook.id;
    button.innerHTML = `<span>${escapeHtml(notebook.title)}</span><strong>${notebook.lines.length} notes</strong>`;
    button.addEventListener("click", () => {
      state.activeNotebookId = notebook.id;
      persistAll();
      render();
    });
    return button;
  });
  els.notebookList.replaceChildren(...buttons);
}

function renderNotebookTitle() {
  els.notebookTitle.value = activeNotebook().title;
}

function renderLines() {
  const notebook = activeNotebook();
  const inputLines = notebook.lines.filter(item => item.kind !== "calculation");
  const calculationLines = notebook.lines.filter(item => item.kind === "calculation");
  els.incomeRows.replaceChildren(...inputLines.map(renderNotebookLine));
  els.expenseRows.replaceChildren();
  els.calculatedRows.replaceChildren(...calculationLines.map(renderNotebookLine));
}

function renderComposerTrace() {
  if (!state.lastComposer) {
    els.expenseRows.replaceChildren(composerPlaceholder());
    return;
  }
  els.expenseRows.replaceChildren(composerTraceRow(state.lastComposer));
}

function composerPlaceholder() {
  const row = document.createElement("div");
  row.className = "composer-trace empty";
  row.innerHTML = [
    "<span>AI Composer</span>",
    "<strong>Text, voice, or photo becomes canonical notebook lines here.</strong>"
  ].join("");
  return row;
}

function composerTraceRow(trace) {
  const row = document.createElement("div");
  row.className = "composer-trace";
  row.innerHTML = [
    "<span>AI Composer</span>",
    `<strong>${escapeHtml(trace.raw)}</strong>`,
    `<em>${escapeHtml(trace.canonical)}</em>`
  ].join("");
  return row;
}

function renderNotebookLine(item) {
  const row = document.createElement("div");
  row.className = `ledger-row ${item.kind}-row`;
  row.title = `${item.source || "text"} · confidence ${Math.round((item.confidence || 0) * 100)}%`;

  const main = document.createElement("div");
  main.className = "row-main";

  const icon = document.createElement("span");
  icon.className = "row-icon";
  icon.textContent = CATEGORY_EMOJI[item.category] || CATEGORY_EMOJI[item.kind] || CATEGORY_EMOJI.other;

  const title = document.createElement("span");
  title.className = "row-title canonical-line";
  title.textContent = item.canonicalText;
  title.contentEditable = "true";
  title.spellcheck = false;
  title.addEventListener("blur", () => updateLineText(item.id, title.textContent));

  main.append(icon, title);

  const result = document.createElement("span");
  const amount = resultAmount(item);
  result.className = `amount result-cell ${amount >= 0 ? "positive" : "negative"}`;
  result.textContent = formatMoney(amount, { signed: item.kind !== "calculation", cents: true });

  row.append(main, result);
  return row;
}

function updateLineText(id, value) {
  const item = activeNotebook().lines.find(lineItem => lineItem.id === id);
  if (!item) return;
  const next = String(value || "").trim();
  if (!next || next === item.canonicalText) return;
  item.canonicalText = next;
  item.text = next;
  const parsed = parseCanonicalAmount(next, item.kind);
  if (parsed) {
    item.kind = parsed.kind;
    item.amount = parsed.amount;
    item.category = parsed.category;
  }
  persistAll();
  render();
}

function calculateNotebook(notebook = activeNotebook()) {
  const inputLines = notebook.lines.filter(item => item.kind !== "calculation");
  const income = inputLines.filter(item => resultAmount(item) > 0).reduce((sum, item) => sum + resultAmount(item), 0);
  const expenses = inputLines.filter(item => resultAmount(item) < 0).reduce((sum, item) => sum + Math.abs(resultAmount(item)), 0);
  const remaining = Number((income - expenses).toFixed(2));
  return { income, expenses, remaining };
}

function resultAmount(item, notebook = activeNotebook()) {
  return Number(item.amount || 0);
}

function topCategory(lines) {
  const totals = new Map();
  lines
    .filter(item => item.kind === "expense")
    .forEach(item => {
      totals.set(item.category, (totals.get(item.category) || 0) + Math.abs(Number(item.amount || 0)));
    });

  let winner = "none";
  let amount = 0;
  for (const [category, total] of totals) {
    if (total > amount) {
      winner = category;
      amount = total;
    }
  }
  return winner;
}

function renderMetrics() {
  const notebook = activeNotebook();
  const lastCalculation = [...notebook.lines].reverse().find(item => item.kind === "calculation");
  els.totalAmount.textContent = lastCalculation ? formatMoney(lastCalculation.amount, { cents: true }) : "No calc";
  els.entryCount.textContent = `${notebook.lines.length} ${notebook.lines.length === 1 ? "line" : "lines"}`;
  els.topCategory.textContent = topCategory(notebook.lines);
}

function formatMoney(value, { signed = false, cents = false } = {}) {
  const number = Number(value || 0);
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : Number.isInteger(number) ? 0 : 2,
    maximumFractionDigits: 2
  });
  const prefix = signed && number > 0 ? "+" : "";
  return `${prefix}${formatter.format(number)}`;
}

async function submitCommand() {
  const raw = els.commandInput.value.trim();
  if (!raw) {
    setMessage("Write a fact, or ask AI to calculate a note first.", "error");
    return;
  }

  const multiple = composeMultipleLocal(raw);
  if (multiple.length > 1) {
    addComposedLines(multiple, raw);
    return;
  }

  const semantic = semanticCalculationLine(raw);
  if (semantic) {
    addComposedLine(semantic, raw);
    return;
  }

  const local = parseSemanticMoneyExpression(raw) || parseCanonicalAmount(raw);
  if (local) {
    addComposedLine(local, raw);
    return;
  }

  els.submitCommand.disabled = true;
  setMessage("AI is writing a notebook note...");

  try {
    const response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadForCommand(raw))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Extraction failed");

    const item = lineFromExtraction(data.extraction, raw);
    els.providerBadge.textContent = data.provider || "local";
    addComposedLine(item, raw);
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    els.submitCommand.disabled = false;
  }
}

function payloadForCommand(raw) {
  if (state.mode === "voice") return { source: "voice", transcript: raw };
  if (state.mode === "photo") {
    return {
      source: "photo",
      receiptText: raw,
      imageData: state.imageData
    };
  }
  return { source: "text", text: raw };
}

function addComposedLine(item, raw) {
  addComposedLines([item], raw);
}

function addComposedLines(items, raw) {
  const notebook = activeNotebook();
  notebook.lines.push(...items);
  state.lastComposer = {
    raw,
    canonical: items.map(item => item.canonicalText).join(" / ")
  };
  persistAll();
  els.commandInput.value = "";
  render();
  setMessage(`AI wrote ${items.length} ${items.length === 1 ? "note" : "notes"}.`);
}

function lineFromExtraction(extraction, rawText) {
  const kind = extraction.category === "income" ? "income" : "expense";
  const signed = kind === "income" ? Math.abs(Number(extraction.amount || 0)) : -Math.abs(Number(extraction.amount || 0));
  const note = cleanNotebookText(extraction.note || extraction.merchant || rawText, extraction.amount);
  const canonicalText = `${note} = ${formatMoney(Math.abs(signed), { cents: true })}`;
  return {
    id: crypto.randomUUID(),
    text: rawText,
    canonicalText,
    kind,
    category: extraction.category || "other",
    amount: signed,
    confidence: extraction.confidence || 0.72,
    source: extraction.source || state.mode,
    rawText
  };
}

function parseCanonicalAmount(raw, fallbackKind = "") {
  const text = raw.replace(/,/g, "").trim();
  const assignment = text.match(/^(.+?)\s*(?:=|is|:)\s*([~+\-−]?\s*[$¥€£]?\s*\d+(?:\.\d{1,2})?)\s*([kK])?/);
  const plain = text.match(/^(.+?)\s+([~+\-−]?\s*[$¥€£]?\s*\d+(?:\.\d{1,2})?)\s*([kK])?$/);
  const match = assignment || plain;
  if (!match) return null;

  const label = cleanNotebookText(match[1], 0);
  const multiplier = match[3] ? 1000 : 1;
  const amountText = match[2].replace(/\s/g, "").replace(/[~$¥€£]/g, "").replace("−", "-");
  const explicitSign = amountText.startsWith("-") || amountText.startsWith("+");
  const expressionMultiplier = expressionFactor(text);
  const absoluteAmount = Math.abs(Number(amountText || 0) * multiplier * expressionMultiplier);
  const kind = inferKind(label, amountText, fallbackKind);
  const signed = kind === "income" ? absoluteAmount : -absoluteAmount;
  const canonicalText = assignment
    ? `${label} = ${normalizeExpressionText(text.slice(match[0].length ? match[1].length : 0), absoluteAmount)}`
    : `${label} = ${formatMoney(absoluteAmount, { cents: !Number.isInteger(absoluteAmount) })}`;

  return {
    id: crypto.randomUUID(),
    text: raw,
    canonicalText,
    kind: explicitSign && amountText.startsWith("+") ? "income" : kind,
    category: inferCategory(label, kind),
    amount: explicitSign && amountText.startsWith("+") ? absoluteAmount : signed,
    confidence: 0.88,
    source: state.mode,
    rawText: raw
  };
}

function composeMultipleLocal(raw) {
  const parts = raw
    .split(/\s+(?:and|plus|then)\s+|[;,]\s*/i)
    .map(part => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return [];
  const parsed = [];
  for (const part of parts) {
    const moneyLine = parseSemanticMoneyExpression(part) || parseCanonicalAmount(part);
    if (moneyLine) {
      parsed.push(moneyLine);
      continue;
    }
    const calculation = semanticCalculationLine(part, parsed);
    if (calculation) parsed.push(calculation);
  }
  return parsed.length > 1 ? parsed : [];
}

function parseSemanticMoneyExpression(raw) {
  const tip = parseTipExpression(raw);
  if (tip) return tip;
  const split = parseSplitExpression(raw);
  if (split) return split;
  return null;
}

function parseTipExpression(raw) {
  const text = raw.replace(/,/g, "").trim();
  const match = text.match(/^(.+?)\s+(?:was|is|=|:)?\s*([+\-−]?\s*[$¥€£]?\s*\d+(?:\.\d{1,2})?)\s*\+\s*(\d+(?:\.\d+)?)%\s*(tip|tax)?$/i);
  if (!match) return null;
  const label = cleanNotebookText(match[1], 0);
  const base = parseMoneyToken(match[2]);
  const percentage = Number(match[3] || 0);
  const absoluteAmount = Number((Math.abs(base) * (1 + percentage / 100)).toFixed(2));
  const kind = inferKind(label, match[2], "");
  const signed = kind === "income" ? absoluteAmount : -absoluteAmount;
  const suffix = match[4] || "tip";
  return {
    id: crypto.randomUUID(),
    text: raw,
    canonicalText: `${label} = ${formatMoney(Math.abs(base), { cents: true })} + ${percentage}% ${suffix}`,
    kind,
    category: inferCategory(label, kind),
    amount: signed,
    confidence: 0.9,
    source: state.mode,
    rawText: raw
  };
}

function parseSplitExpression(raw) {
  const text = raw.replace(/,/g, "").trim();
  const labeled = text.match(/^(.+?)\s*(?:=|is|:)?\s*([+\-−]?\s*[$¥€£]?\s*\d+(?:\.\d{1,2})?)\s*([kK])?\s*(.*?)\s*(?:÷|\/|divided by)\s*(\d+(?:\.\d+)?)\s*(people|persons|ways|pax)?$/i);
  const leading = text.match(/^([+\-−]?\s*[$¥€£]?\s*\d+(?:\.\d{1,2})?)\s*([kK])?\s+(.+?)\s*(?:÷|\/|divided by)\s*(\d+(?:\.\d+)?)\s*(people|persons|ways|pax)?$/i);
  const match = labeled || leading;
  if (!match) return null;
  const label = labeled
    ? cleanNotebookText(`${match[1]} ${match[4] || ""}`.trim(), 0) || "split amount"
    : cleanNotebookText(match[3], 0) || "split amount";
  const amountToken = labeled ? match[2] : match[1];
  const multiplier = (labeled ? match[3] : match[2]) ? 1000 : 1;
  const base = Math.abs(parseMoneyToken(amountToken) * multiplier);
  const divisor = Number((labeled ? match[5] : match[4]) || 1);
  if (!divisor) return null;
  const absoluteAmount = Number((base / divisor).toFixed(2));
  const kind = inferKind(label, amountToken, "");
  const signed = kind === "income" ? absoluteAmount : -absoluteAmount;
  const unit = (labeled ? match[6] : match[5]) || "ways";
  return {
    id: crypto.randomUUID(),
    text: raw,
    canonicalText: `${label} = ${formatMoney(base, { cents: false })} / ${divisor} ${unit}`,
    kind,
    category: inferCategory(label, kind),
    amount: signed,
    confidence: 0.88,
    source: state.mode,
    rawText: raw
  };
}

function parseMoneyToken(token) {
  return Number(String(token || "0").replace(/\s/g, "").replace(/[~$¥€£]/g, "").replace("−", "-"));
}

function expressionFactor(text) {
  const match = String(text).match(/(?:x|×|\*)\s*(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : 1;
}

function normalizeExpressionText(rawExpression, absoluteAmount) {
  const text = String(rawExpression || "").trim().replace(/^\s*(?:=|is|:)\s*/, "");
  if (/(?:x|×|\*)\s*\d/i.test(text) || /\bper\b/i.test(text)) return text.replace(/\s*x\s*/i, " × ");
  return formatMoney(absoluteAmount, { cents: !Number.isInteger(absoluteAmount) });
}

function semanticCalculationLine(raw, pendingLines = []) {
  const normalized = raw.trim().toLowerCase();
  if (/^(?:calculate\s+)?(?:total cost|total spend|total expenses|spending total)(?:\s+.*)?$/.test(normalized)) {
    return calculatedNote(raw, "totalCost", pendingLines);
  }
  if (/^(?:calculate\s+)?(?:total income|income total)(?:\s+.*)?$/.test(normalized)) {
    return calculatedNote(raw, "totalIncome", pendingLines);
  }
  if (/^(?:calculate\s+)?(?:remaining|free cash|balance|left|money left|cash left)(?:\s+.*)?$/.test(normalized)) {
    return calculatedNote(raw, "remaining", pendingLines);
  }
  return null;
}

function calculatedNote(raw, query, pendingLines = []) {
  const baseNotebook = activeNotebook();
  const notebook = pendingLines.length
    ? { ...baseNotebook, lines: [...baseNotebook.lines, ...pendingLines] }
    : baseNotebook;
  const totals = calculateNotebook(notebook);
  const amount = query === "totalCost" ? -totals.expenses : query === "totalIncome" ? totals.income : totals.remaining;
  return calculationLine(crypto.randomUUID(), canonicalCalculationText(raw, query), query, amount, state.mode);
}

function canonicalCalculationText(raw, query) {
  const text = String(raw || "").trim().toLowerCase();
  if (text) return text.startsWith("calculate") ? text : `calculate ${text}`;
  if (query === "totalCost") return "calculate total cost";
  if (query === "totalIncome") return "calculate total income";
  return "calculate remaining";
}

function inferKind(label, amountText, fallbackKind) {
  if (amountText.startsWith("+")) return "income";
  if (amountText.startsWith("-")) return "expense";
  if (fallbackKind === "income" || /\b(salary|freelance|income|paycheck|revenue|budget)\b/i.test(label)) return "income";
  return "expense";
}

function inferCategory(label, kind) {
  if (kind === "income") return "income";
  if (/\b(food|lunch|dinner|coffee|ramen|restaurant|grocery)\b/i.test(label)) return "food";
  if (/\b(uber|lyft|taxi|train|bus|flight|airport)\b/i.test(label)) return "transport";
  if (/\b(rent|hotel|mortgage|utilities|phone|internet)\b/i.test(label)) return "housing";
  if (/\b(ad|ads|amazon|shopping|tools|software)\b/i.test(label)) return "shopping";
  if (/\b(doctor|medicine|pharmacy|gym)\b/i.test(label)) return "health";
  return "other";
}

function cleanNotebookText(text, amount) {
  return String(text || "expense")
    .replace(/\s+/g, " ")
    .replace(/\b(today|yesterday|this month|this week)\b/gi, "")
    .replace(trailingAmountPattern(amount), "")
    .replace(/\b(?:was|is|equals?)\s*$/i, "")
    .replace(/\bat\s+$/i, "")
    .trim()
    .toLowerCase();
}

function trailingAmountPattern(amount) {
  const fixed = escapeRegExp(Number(amount || 0).toFixed(2));
  const compact = escapeRegExp(String(Number(amount || 0)));
  return new RegExp(`\\s*(?:[$¥€£]\\s*)?(?:${fixed}|${compact})\\s*$`, "i");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  const span = document.createElement("span");
  span.textContent = value;
  return span.innerHTML;
}

function setSample() {
  const samples = {
    text: "lunch was $55 + 25% tip; calculate remaining",
    voice: "salary equals five thousand two hundred",
    photo: "Ramen House receipt lunch ramen total $15.50"
  };
  els.commandInput.value = samples[state.mode] || samples.text;
  els.commandInput.focus();
}

function createNotebook() {
  const nextNumber = state.notebooks.length + 1;
  const notebook = {
    id: crypto.randomUUID(),
    title: `Notebook ${nextNumber}`,
    lines: []
  };
  state.notebooks.push(notebook);
  state.activeNotebookId = notebook.id;
  state.lastComposer = null;
  persistAll();
  render();
  els.notebookTitle.focus();
  els.notebookTitle.select();
}

function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    els.recordButton.disabled = true;
    els.voiceStatus.textContent = "Speech recognition unavailable in this browser.";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.onstart = () => {
    setMode("voice");
    els.voiceStatus.textContent = "Listening...";
    els.recordButton.disabled = true;
  };
  recognition.onresult = event => {
    els.commandInput.value = event.results[0][0].transcript;
    els.voiceStatus.textContent = "Transcript ready. Press Enter to compose it.";
  };
  recognition.onerror = () => {
    els.voiceStatus.textContent = "Voice capture stopped.";
  };
  recognition.onend = () => {
    els.recordButton.disabled = false;
  };
  els.recordButton.addEventListener("click", () => recognition.start());
}

function setupPhoto() {
  els.photoInput.addEventListener("change", () => {
    const file = els.photoInput.files?.[0];
    state.imageData = "";
    els.receiptPreview.classList.remove("visible");
    if (!file) return;
    setMode("photo");
    const reader = new FileReader();
    reader.onload = () => {
      state.imageData = String(reader.result || "");
      els.receiptPreview.src = state.imageData;
      els.receiptPreview.classList.add("visible");
      setMessage("Receipt attached. Add a note and let AI compose a canonical line.");
    };
    reader.readAsDataURL(file);
  });
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportMarkdown() {
  const notebook = activeNotebook();
  const lines = [
    `# ${notebook.title}`,
    "",
    "## Notebook Lines",
    ...notebook.lines.map(item => `- ${item.canonicalText} -> ${formatMoney(resultAmount(item, notebook), { signed: item.kind !== "calculation", cents: true })}`),
    ""
  ];
  download(`${slugify(notebook.title)}.md`, lines.join("\n"), "text/markdown");
}

function exportJson() {
  const notebook = activeNotebook();
  const payload = {
    ...notebook
  };
  download(`${slugify(notebook.title)}.json`, JSON.stringify(payload, null, 2) + "\n", "application/json");
}

function exportCsv() {
  const notebook = activeNotebook();
  const header = ["canonicalText", "kind", "resultAmount", "category", "source", "rawText"];
  const rows = notebook.lines.map(item => [
    item.canonicalText,
    item.kind,
    resultAmount(item, notebook),
    item.category,
    item.source,
    item.rawText || ""
  ].map(csvEscape).join(","));
  download(`${slugify(notebook.title)}.csv`, [header.join(","), ...rows].join("\n") + "\n", "text/csv");
}

function csvEscape(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function slugify(value) {
  return String(value || "monospend-ledger").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function clearLedger() {
  const notebook = activeNotebook();
  if (!notebook.lines.length) {
    setMessage("This notebook has no lines to clear.");
    return;
  }
  if (!confirm(`Clear lines in ${notebook.title}?`)) return;
  notebook.lines = [];
  state.lastComposer = null;
  persistAll();
  render();
  setMessage("Notebook lines cleared.");
}

function setupIosMock() {
  const shell = document.querySelector(".ios-mock-shell");
  if (!shell) return;

  const iosEls = {
    notebookButton: document.querySelector("#iosNotebookButton"),
    privacyButton: document.querySelector("#iosPrivacyButton"),
    notebookMonth: document.querySelector("#iosNotebookMonth"),
    notebookTitle: document.querySelector("#iosNotebookTitle"),
    composerStatus: document.querySelector("#iosComposerStatus"),
    privacyChip: document.querySelector("#iosPrivacyChip"),
    rawLine: document.querySelector("#iosRawLine"),
    cleanLine: document.querySelector("#iosCleanLine"),
    intentSheet: document.querySelector("#iosIntentSheet"),
    intentLineTitle: document.querySelector("#iosIntentLineTitle"),
    intentCloseButton: document.querySelector("#iosIntentClose"),
    intentButtons: [...document.querySelectorAll("#iosIntentSheet [data-intent], #iosIntentSheet [data-action]")],
    rows: document.querySelector("#iosLedgerRows"),
    input: document.querySelector("#iosComposerInput"),
    commitButton: document.querySelector("#iosCommitButton"),
    deleteLineButton: document.querySelector("#iosDeleteLineButton"),
    addButton: document.querySelector("#iosAddButton"),
    composerMicButton: document.querySelector("#iosComposerMicButton"),
    captureMenu: document.querySelector("#iosCaptureMenu"),
    captureMenuButtons: [...document.querySelectorAll("#iosCaptureMenu [data-capture-source]")],
    cameraInput: document.querySelector("#iosCameraInput"),
    libraryInput: document.querySelector("#iosLibraryInput"),
    panel: document.querySelector("#iosSidePanel"),
    panelBackdrop: document.querySelector("#iosPanelBackdrop"),
    panelEyebrow: document.querySelector("#iosPanelEyebrow"),
    panelTitle: document.querySelector("#iosPanelTitle"),
    panelSettingsButton: document.querySelector("#iosPanelSettings"),
    panelTutorialButton: document.querySelector("#iosPanelTutorial"),
    drawerActiveFolder: document.querySelector("#iosDrawerActiveFolder"),
    drawerNotebookList: document.querySelector("#iosDrawerNotebookList"),
    drawerCreateNotebookButton: document.querySelector("#iosDrawerCreateNotebook"),
    drawerFolderList: document.querySelector("#iosDrawerFolderList"),
    drawerCreateFolderButton: document.querySelector("#iosDrawerCreateFolder"),
    drawerResetButton: document.querySelector("#iosDrawerResetDemo"),
    drawerProvider: document.querySelector("#iosDrawerProvider"),
    validationProvider: document.querySelector("#iosValidationProvider"),
    notebookList: document.querySelector("#iosNotebookList"),
    createNotebookButton: document.querySelector("#iosCreateNotebook"),
    resetButton: document.querySelector("#iosResetDemo"),
    scenarioButtons: [...document.querySelectorAll(".scenario-button[data-scenario]")],
    captureTabs: [...document.querySelectorAll(".capture-tab[data-ios-mode]")],
    tabbarItems: [...document.querySelectorAll(".tabbar-item[data-ios-view]")]
  };

  if (!iosEls.rows || !iosEls.input || !iosEls.commitButton) return;

  const fallbackFolders = [
    { id: "general", title: "General" },
    { id: "work", title: "Work" },
    { id: "travel", title: "Travel" }
  ];
  const fallbackNotebooks = [
    {
      id: "april-2026",
      folderId: "general",
      month: "April 2026",
      title: "Money notebook",
      lines: [
        iosLine("ios-salary", "salary = $5,200", "income", 5200, "income"),
        iosLine("ios-freelance", "freelance = $400", "income", 400, "income"),
        iosLine("ios-rent", "monthly rent = $2,500", "expense", -2500, "fixed cost"),
        iosLine("ios-lunch", "lunch = $55.00 + 25% tip", "expense", -68.75, "captured from voice"),
        iosLine("ios-remaining", "calculate remaining", "calculation", 3031.25, "AI calculation note")
      ]
    },
    {
      id: "runway-plan",
      folderId: "work",
      month: "May 2026",
      title: "Runway notebook",
      lines: [
        iosLine("runway-budget", "starting budget = $2,400", "income", 2400, "income"),
        iosLine("runway-cloud", "cloud tools = $84", "expense", -84, "typed note"),
        iosLine("runway-total", "calculate remaining runway", "calculation", 1996, "AI calculation note")
      ]
    },
    {
      id: "tokyo-trip",
      folderId: "travel",
      month: "Tokyo Trip",
      title: "Travel notebook",
      lines: [
        iosLine("trip-budget", "trip budget = $1,200", "income", 1200, "income"),
        iosLine("trip-hotel", "hotel three nights = $420", "expense", -420, "scanned receipt"),
        iosLine("trip-left", "calculate trip money left", "calculation", 780, "AI calculation note")
      ]
    }
  ];
  const samples = {
    talk: "coffee = $5.50 x 2",
    scan: "Ramen House receipt lunch ramen total $15.50",
    type: "dinner sushi 45.90"
  };
  const placeholders = {
    talk: "Say: coffee = $5.50 x 2",
    scan: "Scan: Ramen House total $15.50",
    type: "Type: dinner sushi 45.90"
  };
  const mockState = {
    mode: "talk",
    notebookIndex: 0,
    activeFolderId: "general",
    activeNotebookId: "april-2026",
    provider: "local",
    folders: JSON.parse(JSON.stringify(fallbackFolders)),
    notebooks: JSON.parse(JSON.stringify(fallbackNotebooks)),
    imageData: "",
    recentId: "",
    editingLineId: "",
    intentLineId: "",
    openSwipeLineId: "",
    timers: [],
    privacyLocal: true
  };

  function iosLine(id, text, kind, amount, meta, resultText = "") {
    return { id, text, canonicalText: text, kind, amount, meta, resultText };
  }

  function activeIosNotebook() {
    const active = mockState.notebooks.find(notebook => notebook.id === mockState.activeNotebookId);
    if (active && (active.folderId || "general") === mockState.activeFolderId) return active;
    const [firstVisible] = visibleIosNotebooks();
    return firstVisible || {
      id: "",
      folderId: mockState.activeFolderId || "general",
      title: "New note",
      lines: []
    };
  }

  function activeIosFolder() {
    return mockState.folders.find(folder => folder.id === mockState.activeFolderId)
      || mockState.folders[0]
      || fallbackFolders[0];
  }

  function visibleIosNotebooks() {
    const activeFolderId = activeIosFolder().id;
    const notebooks = mockState.notebooks.filter(notebook => (notebook.folderId || "general") === activeFolderId);
    return notebooks.length ? notebooks : [];
  }

  function folderForNotebook(notebook) {
    const folderId = notebook?.folderId || "general";
    return mockState.folders.find(folder => folder.id === folderId) || fallbackFolders[0];
  }

  function setActiveIosNotebook(notebook) {
    const index = mockState.notebooks.findIndex(item => item.id === notebook.id);
    notebook.folderId = notebook.folderId || mockState.activeFolderId || "general";
    if (index >= 0) {
      mockState.notebooks[index] = notebook;
    } else {
      mockState.notebooks.push(notebook);
    }
    mockState.activeFolderId = notebook.folderId;
    mockState.activeNotebookId = notebook.id;
    mockState.notebookIndex = Math.max(0, mockState.notebooks.findIndex(item => item.id === notebook.id));
    renderIosHeader();
  }

  function showComposerStatus(raw, clean, phase = "thinking") {
    if (iosEls.composerStatus) iosEls.composerStatus.hidden = false;
    shell.dataset.phase = phase;
    iosEls.rawLine.textContent = raw;
    iosEls.cleanLine.textContent = clean;
  }

  function hideComposerStatus(delay = 0) {
    const hide = () => {
      if (iosEls.composerStatus) iosEls.composerStatus.hidden = true;
      shell.dataset.phase = "";
    };
    if (delay > 0) {
      queueIosStep(delay, hide);
      return;
    }
    hide();
  }

  function setComposerActionLabel(label) {
    iosEls.commitButton.dataset.action = label.toLowerCase();
    if (iosEls.deleteLineButton) iosEls.deleteLineButton.hidden = label !== "Update";
    iosEls.commitButton.setAttribute(
      "aria-label",
      label === "Update" ? "Update selected notebook line" : "Write money note"
    );
  }

  function editTextForLine(item) {
    return String(item.rawText || item.text || item.canonicalText || "").trim();
  }

  function startIosLineEdit(item) {
    if (!item?.id) return;
    clearIosTimers();
    closeCaptureMenu();
    mockState.editingLineId = item.id;
    mockState.recentId = "";
    const inputValue = editTextForLine(item);
    setIosModePreservingInput(iosModeForSource(item.source), inputValue);
    mockState.editingLineId = item.id;
    showIntentOverride(item);
    setComposerActionLabel("Update");
    showComposerStatus("Correcting selected line", item.canonicalText || item.text, "thinking");
    renderIosRows();
    queueIosStep(900, () => hideComposerStatus());
    iosEls.input.focus();
    iosEls.input.select();
  }

  function clearIosEditMode({ rerender = true, resetAction = true } = {}) {
    mockState.editingLineId = "";
    hideIntentOverride();
    if (resetAction) setComposerActionLabel("Write");
    if (rerender) renderIosRows();
  }

  function showIntentOverride(item) {
    if (!iosEls.intentSheet || !item?.id) return;
    mockState.intentLineId = item.id;
    if (iosEls.intentLineTitle) {
      iosEls.intentLineTitle.textContent = item.canonicalText || item.text || "Selected line";
    }
    iosEls.intentSheet.hidden = false;
  }

  function hideIntentOverride() {
    mockState.intentLineId = "";
    if (iosEls.intentSheet) iosEls.intentSheet.hidden = true;
  }

  function iosModeForSource(source) {
    if (source === "voice" || source === "talk") return "talk";
    if (source === "photo" || source === "scan") return "scan";
    return "type";
  }

  function renderIosHeader() {
    const notebook = activeIosNotebook();
    const folder = folderForNotebook(notebook);
    iosEls.notebookMonth.textContent = folder.title || "General";
    iosEls.notebookTitle.textContent = titleForIosNotebook(notebook);
    if (iosEls.drawerActiveFolder) {
      iosEls.drawerActiveFolder.textContent = activeIosFolder().title || "General";
    }
    iosEls.privacyChip.textContent = mockState.provider === "local"
      ? "local AI + JSON"
      : mockState.provider;
    if (iosEls.validationProvider) {
      iosEls.validationProvider.textContent = mockState.provider;
    }
    if (iosEls.drawerProvider) {
      iosEls.drawerProvider.textContent = mockState.provider;
    }
    renderIosNotebookList();
  }

  function titleForIosNotebook(notebook) {
    return notebook.title || "Money notebook";
  }

  function renderIosRows() {
    const notebook = activeIosNotebook();
    const rows = (notebook.lines || []).slice(-5).map(item => {
      const wrapper = document.createElement("div");
      wrapper.className = "ios-ledger-swipe-row";
      wrapper.classList.toggle("open", item.id === mockState.openSwipeLineId);

      const deleteButton = document.createElement("button");
      deleteButton.className = "swipe-delete-button";
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", `Delete ${item.canonicalText || item.text}`);

      const row = document.createElement("div");
      row.className = `ios-ledger-row ${iosRowClass(item.kind)}`;
      if (item.id === mockState.recentId) row.classList.add("added");
      if (item.id === mockState.editingLineId) row.classList.add("editing");
      row.role = "button";
      row.tabIndex = 0;
      row.setAttribute("aria-label", `Edit ${item.canonicalText || item.text}`);

      const symbol = document.createElement("span");
      symbol.className = `row-symbol ${iosSymbolClass(item.kind)}`;

      const copy = document.createElement("div");
      const title = document.createElement("p");
      const meta = document.createElement("small");
      title.textContent = item.canonicalText || item.text;
      meta.textContent = iosMetaForLine(item);
      copy.append(title, meta);

      const amount = document.createElement("strong");
      amount.textContent = iosResultText(item);

      row.append(symbol, copy, amount);
      attachSwipeDelete(wrapper, row, item);
      deleteButton.addEventListener("click", event => {
        event.stopPropagation();
        deleteIosLine(item.id);
      });
      row.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startIosLineEdit(item);
        }
        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          deleteIosLine(item.id);
        }
      });
      wrapper.append(deleteButton, row);
      return wrapper;
    });
    iosEls.rows.replaceChildren(...rows);
  }

  function renderIosNotebookList() {
    renderNotebookButtons(iosEls.notebookList, "validation-notebook", false);
    renderNotebookButtons(iosEls.drawerNotebookList, "side-panel-notebook", true);
    renderFolderButtons();
  }

  function renderNotebookButtons(container, className, closeOnSelect) {
    if (!container) return;
    const notebooks = visibleIosNotebooks();
    if (!notebooks.length) {
      const empty = document.createElement("div");
      empty.className = className === "side-panel-notebook" ? "side-panel-empty" : "validation-empty";
      empty.textContent = "No notes in this folder";
      container.replaceChildren(empty);
      return;
    }
    const buttons = notebooks.map(notebook => {
      const button = document.createElement("button");
      button.className = className;
      button.classList.toggle("active", notebook.id === mockState.activeNotebookId);
      button.type = "button";
      button.innerHTML = [
        `<span>${escapeHtml(notebook.title || "Untitled")}</span>`,
        `<strong>${(notebook.lines || []).length} lines</strong>`
      ].join("");
      button.addEventListener("click", () => selectIosNotebook(notebook.id, { closePanel: closeOnSelect }));
      return button;
    });
    container.replaceChildren(...buttons);
  }

  function renderFolderButtons() {
    if (!iosEls.drawerFolderList) return;
    const buttons = mockState.folders.map(folder => {
      const count = mockState.notebooks.filter(notebook => (notebook.folderId || "general") === folder.id).length;
      const button = document.createElement("button");
      button.className = "side-panel-folder";
      button.classList.toggle("active", folder.id === mockState.activeFolderId);
      button.type = "button";
      button.innerHTML = [
        `<span>${escapeHtml(folder.title || "Untitled")}</span>`,
        `<strong>${count} notes</strong>`
      ].join("");
      button.addEventListener("click", () => selectIosFolder(folder.id));
      return button;
    });
    iosEls.drawerFolderList.replaceChildren(...buttons);
  }

  function iosMetaForLine(item) {
    if (item.meta) return item.meta;
    if (item.kind === "calculation") return "AI calculation note";
    if (item.kind === "note") return "remark";
    if (item.kind === "income") return "income";
    if (item.source === "scan" || item.source === "photo") return "scanned receipt";
    if (item.source === "talk" || item.source === "voice") return "captured from voice";
    return "typed note";
  }

  function iosRowClass(kind) {
    if (kind === "income") return "income-row";
    if (kind === "expense") return "expense-row";
    if (kind === "calculation") return "calculation-row";
    return "note-row";
  }

  function iosSymbolClass(kind) {
    if (kind === "income") return "money-symbol";
    if (kind === "calculation") return "calculation-symbol";
    if (kind === "note") return "note-symbol";
    return "dot-symbol";
  }

  function attachSwipeDelete(wrapper, row, item) {
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let tracking = false;
    let didSwipe = false;

    row.addEventListener("pointerdown", event => {
      if (event.button !== undefined && event.button !== 0) return;
      startX = event.clientX;
      startY = event.clientY;
      deltaX = 0;
      tracking = true;
      didSwipe = false;
      row.setPointerCapture?.(event.pointerId);
    });

    row.addEventListener("pointermove", event => {
      if (!tracking) return;
      const x = event.clientX - startX;
      const y = event.clientY - startY;
      if (Math.abs(y) > 24 && Math.abs(y) > Math.abs(x)) {
        tracking = false;
        row.style.transform = "";
        return;
      }
      deltaX = Math.max(-88, Math.min(0, x));
      if (Math.abs(deltaX) > 8) didSwipe = true;
      if (didSwipe) {
        row.style.transform = `translateX(${deltaX}px)`;
      }
    });

    row.addEventListener("pointerup", () => {
      if (!tracking) return;
      tracking = false;
      row.style.transform = "";
      if (deltaX < -36) {
        mockState.openSwipeLineId = item.id;
        renderIosRows();
        return;
      }
      if (didSwipe) {
        mockState.openSwipeLineId = "";
        renderIosRows();
        return;
      }
      if (mockState.openSwipeLineId) {
        mockState.openSwipeLineId = "";
        renderIosRows();
        return;
      }
      startIosLineEdit(item);
    });

    row.addEventListener("pointercancel", () => {
      tracking = false;
      row.style.transform = "";
    });
  }

  function iosResultText(item) {
    if (item.kind === "note") return item.resultText || "";
    if (item.kind === "calculation") return formatMoney(item.amount, { cents: true });
    return formatMoney(item.amount, {
      signed: item.kind === "income",
      cents: !Number.isInteger(item.amount)
    });
  }

  function setIosMode(mode) {
    mockState.mode = mode;
    shell.dataset.mode = mode;
    iosEls.captureTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.iosMode === mode));
    iosEls.input.placeholder = placeholders[mode];
    iosEls.input.value = samples[mode];
    if (mode === "talk") {
      iosEls.rawLine.textContent = "\"Say a messy money note naturally...\"";
      iosEls.cleanLine.textContent = "AI turns speech into one notebook line";
    } else if (mode === "scan") {
      iosEls.rawLine.textContent = "Receipt camera is ready";
      iosEls.cleanLine.textContent = "AI extracts merchant, item, and total";
    } else {
      iosEls.rawLine.textContent = "Typed notes stay editable";
      iosEls.cleanLine.textContent = "Write a fact or ask for a calculation";
    }
  }

  function setIosModePreservingInput(mode, inputValue) {
    setIosMode(mode);
    iosEls.input.value = inputValue;
  }

  function openIosPanel(view = "notebooks") {
    setIosPanelView(view);
    iosEls.panel?.classList.add("open");
    iosEls.panel?.setAttribute("aria-hidden", "false");
    if (iosEls.panelBackdrop) iosEls.panelBackdrop.hidden = false;
    closeCaptureMenu();
  }

  function closeIosPanel() {
    iosEls.panel?.classList.remove("open");
    iosEls.panel?.setAttribute("aria-hidden", "true");
    if (iosEls.panelBackdrop) iosEls.panelBackdrop.hidden = true;
  }

  function setIosPanelView(view) {
    if (!iosEls.panel) return;
    const safeView = ["notebooks", "settings", "tutorial"].includes(view) ? view : "notebooks";
    iosEls.panel.dataset.panel = safeView;
    const copy = {
      notebooks: ["Notebooks", "Money library"],
      settings: ["Settings", "App settings"],
      tutorial: ["Guide", "How AI Composer works"]
    };
    if (iosEls.panelEyebrow) iosEls.panelEyebrow.textContent = copy[safeView][0];
    if (iosEls.panelTitle) iosEls.panelTitle.textContent = copy[safeView][1];
    if (iosEls.panelSettingsButton) {
      iosEls.panelSettingsButton.textContent = safeView === "settings" ? "N" : "T";
      iosEls.panelSettingsButton.classList.toggle("active", safeView === "settings");
      iosEls.panelSettingsButton.setAttribute("aria-label", safeView === "settings" ? "Open notebooks" : "Open settings");
    }
    if (iosEls.panelTutorialButton) {
      iosEls.panelTutorialButton.classList.toggle("active", safeView === "tutorial");
      iosEls.panelTutorialButton.setAttribute("aria-label", safeView === "tutorial" ? "Open notebooks" : "Open tutorial");
    }
  }

  async function selectIosNotebook(notebookId, { closePanel = false } = {}) {
    const notebook = mockState.notebooks.find(item => item.id === notebookId);
    if (!notebook) return;
    clearIosEditMode({ rerender: false });
    mockState.activeFolderId = notebook.folderId || "general";
    mockState.activeNotebookId = notebook.id;
    mockState.notebookIndex = Math.max(0, mockState.notebooks.findIndex(item => item.id === notebook.id));
    renderIosHeader();
    renderIosRows();
    showComposerStatus("Notebook switched", notebook.title, "complete");
    queueIosStep(820, () => hideComposerStatus());
    try {
      await fetch(`/api/notebooks/${encodeURIComponent(notebook.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true })
      });
    } catch {
      // The local UI state already switched.
    }
    if (closePanel) closeIosPanel();
  }

  function selectIosFolder(folderId) {
    const folder = mockState.folders.find(item => item.id === folderId);
    if (!folder) return;
    clearIosEditMode({ rerender: false });
    mockState.activeFolderId = folder.id;
    const [firstNotebook] = visibleIosNotebooks();
    if (firstNotebook) {
      mockState.activeNotebookId = firstNotebook.id;
      mockState.notebookIndex = Math.max(0, mockState.notebooks.findIndex(item => item.id === firstNotebook.id));
    }
    renderIosHeader();
    renderIosRows();
    showComposerStatus("Folder switched", folder.title, "complete");
    queueIosStep(760, () => hideComposerStatus());
  }

  function toggleCaptureMenu() {
    if (!iosEls.captureMenu) return;
    iosEls.captureMenu.hidden = !iosEls.captureMenu.hidden;
    closeIosPanel();
  }

  function closeCaptureMenu() {
    if (iosEls.captureMenu) iosEls.captureMenu.hidden = true;
  }

  function chooseCaptureSource(source) {
    clearIosEditMode({ rerender: true });
    setIosMode("scan");
    showComposerStatus(
      source === "camera" ? "Camera selected" : "Photo library selected",
      "Add receipt notes, then write to notebook",
      "thinking"
    );
    queueIosStep(760, () => hideComposerStatus());
    closeCaptureMenu();
    const picker = source === "camera" ? iosEls.cameraInput : iosEls.libraryInput;
    picker?.click();
    iosEls.input.focus();
  }

  function handleIosImageInput(input, sourceLabel) {
    const file = input.files?.[0];
    mockState.imageData = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      mockState.imageData = String(reader.result || "");
      setIosModePreservingInput("scan", iosEls.input.value.trim() || "receipt photo attached");
      showComposerStatus(sourceLabel, "Photo attached. Add notes or press Write.", "complete");
      queueIosStep(900, () => hideComposerStatus());
    };
    reader.readAsDataURL(file);
  }

  function runComposerMicInput() {
    const raw = iosEls.input.value.trim() || samples.talk;
    clearIosTimers();
    closeCaptureMenu();
    clearIosEditMode({ rerender: true });
    setIosModePreservingInput("talk", raw);
    iosEls.composerMicButton?.classList.add("listening");
    if (iosEls.composerMicButton) iosEls.composerMicButton.disabled = true;
    showComposerStatus("Listening...", "Voice becomes editable text before AI writes it", "listening");
    queueIosStep(680, () => {
      iosEls.input.value = raw;
      showComposerStatus(`"${raw}"`, "Transcript ready. Review, then Write.", "complete");
      iosEls.composerMicButton?.classList.remove("listening");
      if (iosEls.composerMicButton) iosEls.composerMicButton.disabled = false;
      iosEls.input.focus();
      queueIosStep(980, () => hideComposerStatus());
    });
  }

  function clearIosTimers() {
    mockState.timers.forEach(timer => window.clearTimeout(timer));
    mockState.timers = [];
  }

  function queueIosStep(delay, callback) {
    const timer = window.setTimeout(callback, delay);
    mockState.timers.push(timer);
  }

  async function runIosCapture(rawInput) {
    const raw = String(rawInput || iosEls.input.value || samples[mockState.mode]).trim();
    if (!raw) return;
    const editingLineId = mockState.editingLineId;
    const actionLabel = editingLineId ? "Updating" : "Writing";
    clearIosTimers();
    showComposerStatus(
      mockState.mode === "scan" ? "Scanning receipt..." : editingLineId ? "Revising selected line..." : "Composing notebook line...",
      `${actionLabel} with AI Composer`,
      "listening"
    );
    iosEls.commitButton.disabled = true;
    if (iosEls.composerMicButton) iosEls.composerMicButton.disabled = true;
    iosEls.composerMicButton?.classList.add("listening");
    if (iosEls.addButton) iosEls.addButton.disabled = true;

    await waitForIos(520);
    showComposerStatus(mockState.mode === "scan" ? raw : `"${raw}"`, "Detecting intent, amount, and note type...", "thinking");

    try {
      const composed = await composeIosWithApi(raw, { replaceLineId: editingLineId });
      mockState.recentId = composed.id;
      showComposerStatus(
        editingLineId ? "Updated selected line" : "Notebook line written",
        iosComposerResult(composed),
        "complete"
      );
      clearIosEditMode({ rerender: false });
      renderIosRows();
      iosEls.input.value = nextIosSample();
    } catch (error) {
      const notebook = activeIosNotebook();
      const composed = composeIosLine(raw);
      replaceOrAppendIosLine(notebook, editingLineId, composed);
      mockState.recentId = composed.id;
      showComposerStatus(
        editingLineId ? "Updated with local fallback" : "Local fallback wrote note",
        `${iosComposerResult(composed)} · ${error.message}`,
        "complete"
      );
      clearIosEditMode({ rerender: false });
      renderIosRows();
    } finally {
      iosEls.commitButton.disabled = false;
      if (iosEls.composerMicButton) iosEls.composerMicButton.disabled = false;
      iosEls.composerMicButton?.classList.remove("listening");
      if (iosEls.addButton) iosEls.addButton.disabled = false;
      queueIosStep(980, () => hideComposerStatus());
    }
  }

  function replaceOrAppendIosLine(notebook, lineId, composed) {
    const lines = notebook.lines || [];
    const index = lineId ? lines.findIndex(item => item.id === lineId) : -1;
    if (index >= 0) {
      lines.splice(index, 1, composed);
      notebook.lines = lines;
      return;
    }
    lines.push(composed);
    notebook.lines = lines;
  }

  async function applyIntentOverride(button) {
    const lineId = mockState.intentLineId || mockState.editingLineId;
    const notebook = activeIosNotebook();
    const line = (notebook.lines || []).find(item => item.id === lineId);
    if (!line) return;

    const textOnly = button.dataset.action === "text-only";
    const intent = button.dataset.intent || "";
    const query = button.dataset.query || "";
    const inputText = iosEls.input.value.trim();

    if (textOnly && !inputText) {
      showComposerStatus("Text edit needs content", "Type the corrected line first.", "thinking");
      return;
    }

    iosEls.intentButtons.forEach(item => { item.disabled = true; });
    showComposerStatus(
      textOnly ? "Saving text only" : "Changing intent",
      textOnly ? "No AI Composer will run." : "Using a deterministic override.",
      "thinking"
    );

    try {
      const response = await fetch(
        textOnly
          ? `/api/notebooks/${encodeURIComponent(notebook.id)}/lines/${encodeURIComponent(line.id)}/text`
          : `/api/notebooks/${encodeURIComponent(notebook.id)}/lines/${encodeURIComponent(line.id)}/intent`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(textOnly ? { text: inputText } : { intent, query })
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Correction failed");
      if (data.notebook) setActiveIosNotebook(data.notebook);
      mockState.recentId = data.line?.id || line.id;
      showComposerStatus(
        textOnly ? "Text saved" : "Intent corrected",
        iosComposerResult(data.line || line),
        "complete"
      );
    } catch (error) {
      const corrected = textOnly
        ? textOnlyIosLine(line, inputText)
        : reclassifyIosLine(line, intent, query);
      replaceOrAppendIosLine(notebook, line.id, corrected);
      mockState.recentId = corrected.id;
      showComposerStatus(
        textOnly ? "Text saved locally" : "Intent corrected locally",
        `${iosComposerResult(corrected)} · ${error.message}`,
        "complete"
      );
    } finally {
      iosEls.intentButtons.forEach(item => { item.disabled = false; });
      clearIosEditMode({ rerender: false });
      iosEls.input.value = nextIosSample();
      renderIosRows();
      renderIosNotebookList();
      queueIosStep(980, () => hideComposerStatus());
    }
  }

  function textOnlyIosLine(line, text) {
    return {
      ...line,
      text,
      canonicalText: text,
      rawText: text,
      meta: "text edited"
    };
  }

  function reclassifyIosLine(line, intent, query) {
    const raw = line.rawText || line.text || line.canonicalText || "";
    if (intent === "note") {
      return {
        ...line,
        kind: "note",
        category: "note",
        amount: 0,
        query: "",
        resultText: "",
        meta: "corrected intent"
      };
    }
    if (intent === "calculation") {
      const safeQuery = ["remaining", "totalCost", "totalIncome"].includes(query) ? query : "totalCost";
      return {
        ...line,
        kind: "calculation",
        category: "calculation",
        query: safeQuery,
        amount: calculateIosQuery(safeQuery, line.id),
        resultText: "",
        meta: "corrected intent"
      };
    }
    const target = intent === "income" ? "income" : "expense";
    const parsed = parseCanonicalAmount(raw, target) || parseLooseIosAmount(raw);
    const absoluteAmount = Math.abs(Number(parsed?.amount || line.amount || 0));
    return {
      ...line,
      canonicalText: parsed?.canonicalText || line.canonicalText || line.text,
      kind: target,
      category: target === "income" ? "income" : parsed?.category || line.category || "other",
      amount: target === "income" ? absoluteAmount : -absoluteAmount,
      query: "",
      resultText: "",
      meta: "corrected intent"
    };
  }

  function calculateIosQuery(query, excludeLineId = "") {
    const lines = (activeIosNotebook().lines || []).filter(item => item.id !== excludeLineId);
    const income = lines
      .filter(item => item.kind === "income")
      .reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0);
    const expenses = lines
      .filter(item => item.kind === "expense")
      .reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0);
    if (query === "totalIncome") return Number(income.toFixed(2));
    if (query === "remaining") return Number((income - expenses).toFixed(2));
    return Number((-expenses).toFixed(2));
  }

  async function deleteIosLine(lineId = mockState.editingLineId) {
    const notebook = activeIosNotebook();
    const line = (notebook.lines || []).find(item => item.id === lineId);
    if (!line) return;

    clearIosTimers();
    closeCaptureMenu();
    mockState.openSwipeLineId = "";
    showComposerStatus("Deleting line", line.canonicalText || line.text, "thinking");
    iosEls.commitButton.disabled = true;
    if (iosEls.deleteLineButton) iosEls.deleteLineButton.disabled = true;

    try {
      const response = await fetch(
        `/api/notebooks/${encodeURIComponent(notebook.id)}/lines/${encodeURIComponent(line.id)}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");
      if (data.notebook) setActiveIosNotebook(data.notebook);
      showComposerStatus("Line deleted", line.canonicalText || line.text, "complete");
    } catch (error) {
      notebook.lines = (notebook.lines || []).filter(item => item.id !== line.id);
      showComposerStatus("Deleted locally", `${line.canonicalText || line.text} · ${error.message}`, "complete");
    } finally {
      if (mockState.editingLineId === line.id) {
        clearIosEditMode({ rerender: false });
        iosEls.input.value = nextIosSample();
      }
      mockState.recentId = "";
      renderIosRows();
      renderIosNotebookList();
      iosEls.commitButton.disabled = false;
      if (iosEls.deleteLineButton) iosEls.deleteLineButton.disabled = false;
      queueIosStep(980, () => hideComposerStatus());
    }
  }

  function waitForIos(delay) {
    return new Promise(resolve => {
      queueIosStep(delay, resolve);
    });
  }

  async function composeIosWithApi(raw, { replaceLineId = "" } = {}) {
    let notebook = activeIosNotebook();
    if (!notebook.id && !replaceLineId) {
      await createIosNotebook();
      notebook = activeIosNotebook();
    }
    if (!notebook.id) throw new Error("Create a note before writing.");
    const endpoint = replaceLineId
      ? `/api/notebooks/${encodeURIComponent(notebook.id)}/lines/${encodeURIComponent(replaceLineId)}/compose`
      : `/api/notebooks/${encodeURIComponent(notebook.id)}/compose`;
    const response = await fetch(endpoint, {
      method: replaceLineId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadForIos(raw))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "AI compose failed");
    mockState.provider = data.provider || mockState.provider;
    if (data.notebook) setActiveIosNotebook(data.notebook);
    const composed = Array.isArray(data.lines) ? data.lines[data.lines.length - 1] : null;
    if (!composed) throw new Error("AI compose returned no note");
    return composed;
  }

  function payloadForIos(raw) {
    if (mockState.mode === "talk") return { source: "voice", transcript: raw };
    if (mockState.mode === "scan") return { source: "photo", receiptText: raw, imageData: mockState.imageData };
    return { source: "text", text: raw };
  }

  function composeIosLine(raw) {
    if (/^(?:calculate\s+)?(?:remaining|balance|left|money left)$/i.test(raw.trim())) {
      const amount = calculateIosRemaining();
      return iosLine(crypto.randomUUID(), "calculate remaining", "calculation", amount, "AI calculation note");
    }
    const parsed = parseSemanticMoneyExpression(raw) || parseCanonicalAmount(raw);
    if (parsed) {
      return iosLine(
        crypto.randomUUID(),
        parsed.canonicalText,
        parsed.kind,
        parsed.amount,
        iosMetaForMode(mockState.mode, parsed.kind)
      );
    }
    const fallback = parseLooseIosAmount(raw);
    if (fallback) return fallback;

    return iosLine(
      crypto.randomUUID(),
      cleanNotebookText(raw, 0) || "untitled note",
      "note",
      0,
      iosMetaForMode(mockState.mode, "note")
    );
  }

  function parseLooseIosAmount(raw) {
    const match = String(raw || "").replace(/,/g, "").match(/([+\-−]?\s*[$¥€£]?\s*\d+(?:\.\d{1,2})?)\s*([kK])?/);
    if (!match) return null;
    const amountToken = match[1].replace(/\s/g, "").replace(/[~$¥€£]/g, "").replace("−", "-");
    const multiplier = match[2] ? 1000 : 1;
    const absoluteAmount = Math.abs(Number(amountToken || 0) * multiplier);
    const label = cleanNotebookText(String(raw).replace(match[0], " "), absoluteAmount) || "money note";
    const kind = inferKind(label, amountToken, "");
    const signed = kind === "income" ? absoluteAmount : -absoluteAmount;
    return iosLine(
      crypto.randomUUID(),
      `${label} = ${formatMoney(absoluteAmount, { cents: !Number.isInteger(absoluteAmount) })}`,
      kind,
      signed,
      iosMetaForMode(mockState.mode, kind)
    );
  }

  function calculateIosRemaining() {
    return Number((activeIosNotebook().lines || [])
      .filter(item => item.kind === "income" || item.kind === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
      .toFixed(2));
  }

  function iosComposerResult(item) {
    const text = item.canonicalText || item.text;
    if (item.kind === "note") return `${text} -> note`;
    if (item.kind === "calculation") return `${text} -> ${formatMoney(item.amount, { cents: true })}`;
    return text;
  }

  function iosMetaForMode(mode, kind) {
    if (kind === "income") return "income";
    if (kind === "calculation") return "AI calculation note";
    if (kind === "note") return "remark";
    if (mode === "talk") return "captured from voice";
    if (mode === "scan") return "scanned receipt";
    return "typed note";
  }

  function nextIosSample() {
    if (mockState.mode === "talk") return "uber to meeting 12.30";
    if (mockState.mode === "scan") return "coffee receipt total $6.80";
    return "calculate remaining";
  }

  function cycleIosNotebook() {
    openIosPanel("notebooks");
  }

  function toggleIosPrivacy() {
    openIosPanel("settings");
  }

  async function loadIosState() {
    try {
      const response = await fetch("/api/state");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "State load failed");
      if (Array.isArray(data.notebooks) && data.notebooks.length) {
        mockState.notebooks = data.notebooks;
        if (Array.isArray(data.folders) && data.folders.length) {
          mockState.folders = data.folders;
        }
        mockState.activeFolderId = data.activeFolderId || data.notebooks[0].folderId || mockState.folders[0]?.id || "general";
        mockState.activeNotebookId = data.activeNotebookId || data.notebooks[0].id;
        mockState.notebookIndex = Math.max(0, mockState.notebooks.findIndex(item => item.id === mockState.activeNotebookId));
      }
      mockState.provider = data.provider || mockState.provider;
      renderIosHeader();
      renderIosRows();
      iosEls.cleanLine.textContent = mockState.provider === "local"
        ? "Local model ready; OpenAI mode can be enabled by env"
        : `${mockState.provider} ready`;
    } catch (error) {
      iosEls.cleanLine.textContent = "Offline fallback ready";
    }
  }

  async function createIosNotebook() {
    clearIosEditMode({ rerender: false });
    if (iosEls.createNotebookButton) iosEls.createNotebookButton.disabled = true;
    if (iosEls.drawerCreateNotebookButton) iosEls.drawerCreateNotebookButton.disabled = true;
    try {
      const folderId = activeIosFolder().id;
      const noteCount = mockState.notebooks.filter(notebook => (notebook.folderId || "general") === folderId).length;
      const response = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId, title: `Note ${noteCount + 1}` })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Notebook create failed");
      mockState.activeFolderId = data.activeFolderId || folderId;
      if (data.notebook) setActiveIosNotebook(data.notebook);
      renderIosRows();
      iosEls.rawLine.textContent = "Notebook created";
      iosEls.cleanLine.textContent = data.notebook?.title || "New notebook";
    } catch (error) {
      iosEls.cleanLine.textContent = error.message;
    } finally {
      if (iosEls.createNotebookButton) iosEls.createNotebookButton.disabled = false;
      if (iosEls.drawerCreateNotebookButton) iosEls.drawerCreateNotebookButton.disabled = false;
    }
  }

  async function createIosFolder() {
    clearIosEditMode({ rerender: false });
    if (iosEls.drawerCreateFolderButton) iosEls.drawerCreateFolderButton.disabled = true;
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Folder ${mockState.folders.length + 1}` })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Folder create failed");
      if (Array.isArray(data.folders) && data.folders.length) {
        mockState.folders = data.folders;
      } else if (data.folder) {
        mockState.folders.push(data.folder);
      }
      mockState.activeFolderId = data.activeFolderId || data.folder?.id || mockState.activeFolderId;
      renderIosHeader();
      renderIosRows();
      showComposerStatus("Folder created", data.folder?.title || activeIosFolder().title, "complete");
      queueIosStep(860, () => hideComposerStatus());
    } catch (error) {
      iosEls.cleanLine.textContent = error.message;
    } finally {
      if (iosEls.drawerCreateFolderButton) iosEls.drawerCreateFolderButton.disabled = false;
    }
  }

  async function resetIosDemo() {
    clearIosEditMode({ rerender: false });
    if (iosEls.resetButton) iosEls.resetButton.disabled = true;
    if (iosEls.drawerResetButton) iosEls.drawerResetButton.disabled = true;
    try {
      const response = await fetch("/api/reset", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Reset failed");
      if (Array.isArray(data.notebooks) && data.notebooks.length) {
        mockState.notebooks = data.notebooks;
        if (Array.isArray(data.folders) && data.folders.length) {
          mockState.folders = data.folders;
        }
        mockState.activeFolderId = data.activeFolderId || data.notebooks[0].folderId || mockState.folders[0]?.id || "general";
        mockState.activeNotebookId = data.activeNotebookId || data.notebooks[0].id;
        mockState.notebookIndex = Math.max(0, mockState.notebooks.findIndex(item => item.id === mockState.activeNotebookId));
      }
      mockState.recentId = "";
      mockState.provider = data.provider || mockState.provider;
      renderIosHeader();
      renderIosRows();
      iosEls.rawLine.textContent = "Demo reset";
      iosEls.cleanLine.textContent = "Notebook state restored";
    } catch (error) {
      iosEls.cleanLine.textContent = error.message;
    } finally {
      if (iosEls.resetButton) iosEls.resetButton.disabled = false;
      if (iosEls.drawerResetButton) iosEls.drawerResetButton.disabled = false;
    }
  }

  function runIosScenario(button) {
    const raw = button.dataset.scenario || "";
    const mode = button.dataset.iosMode || "type";
    clearIosEditMode({ rerender: true });
    setIosModePreservingInput(mode, raw);
    runIosCapture(raw);
  }

  iosEls.captureTabs.forEach(tab => tab.addEventListener("click", () => setIosMode(tab.dataset.iosMode)));
  iosEls.tabbarItems.forEach(item => item.addEventListener("click", () => openIosPanel(item.dataset.iosView === "settings" ? "settings" : "notebooks")));
  iosEls.composerMicButton?.addEventListener("click", runComposerMicInput);
  iosEls.addButton?.addEventListener("click", toggleCaptureMenu);
  iosEls.captureMenuButtons.forEach(button => {
    button.addEventListener("click", () => chooseCaptureSource(button.dataset.captureSource));
  });
  iosEls.cameraInput?.addEventListener("change", () => handleIosImageInput(iosEls.cameraInput, "Camera photo attached"));
  iosEls.libraryInput?.addEventListener("change", () => handleIosImageInput(iosEls.libraryInput, "Library photo attached"));
  iosEls.commitButton.addEventListener("click", () => runIosCapture());
  iosEls.deleteLineButton?.addEventListener("click", () => deleteIosLine());
  iosEls.intentCloseButton?.addEventListener("click", () => hideIntentOverride());
  iosEls.intentButtons.forEach(button => button.addEventListener("click", () => applyIntentOverride(button)));
  iosEls.createNotebookButton?.addEventListener("click", createIosNotebook);
  iosEls.drawerCreateNotebookButton?.addEventListener("click", createIosNotebook);
  iosEls.drawerCreateFolderButton?.addEventListener("click", createIosFolder);
  iosEls.resetButton?.addEventListener("click", resetIosDemo);
  iosEls.drawerResetButton?.addEventListener("click", resetIosDemo);
  iosEls.scenarioButtons.forEach(button => button.addEventListener("click", () => runIosScenario(button)));
  iosEls.panelBackdrop?.addEventListener("click", closeIosPanel);
  iosEls.panelSettingsButton?.addEventListener("click", () => {
    const nextView = iosEls.panel?.dataset.panel === "settings" ? "notebooks" : "settings";
    setIosPanelView(nextView);
  });
  iosEls.panelTutorialButton?.addEventListener("click", () => {
    const nextView = iosEls.panel?.dataset.panel === "tutorial" ? "notebooks" : "tutorial";
    setIosPanelView(nextView);
  });
  iosEls.input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      runIosCapture();
      return;
    }
    if (event.key === "Escape" && mockState.editingLineId) {
      event.preventDefault();
      clearIosEditMode();
      iosEls.input.value = nextIosSample();
      hideComposerStatus();
    }
  });
  iosEls.input.addEventListener("focus", closeCaptureMenu);
  iosEls.notebookButton?.addEventListener("click", cycleIosNotebook);
  iosEls.privacyButton?.addEventListener("click", toggleIosPrivacy);

  setIosMode(mockState.mode);
  renderIosHeader();
  renderIosRows();
  loadIosState();
}

els.modeTabs.forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
els.submitCommand.addEventListener("click", submitCommand);
els.commandInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitCommand();
  }
});
els.notebookTitle.addEventListener("change", () => {
  activeNotebook().title = els.notebookTitle.value.trim() || "Untitled";
  persistAll();
  render();
});
els.newNotebook.addEventListener("click", createNotebook);
els.sampleButton.addEventListener("click", setSample);
els.exportMarkdown.addEventListener("click", exportMarkdown);
els.exportJson.addEventListener("click", exportJson);
els.exportCsv.addEventListener("click", exportCsv);
els.clearLedger.addEventListener("click", clearLedger);

setupVoice();
setupPhoto();
setMode("text");
render();
setupIosMock();
