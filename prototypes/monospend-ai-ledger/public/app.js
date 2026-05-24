const STORAGE_KEYS = {
  notebooks: "monospend-live-notebooks-v3",
  activeNotebookId: "monospend-live-active-notebook"
};

const CATEGORY_EMOJI = {
  food: "🍜",
  transport: "🚗",
  housing: "🏠",
  shopping: "🛍️",
  health: "💊",
  income: "💵",
  other: "•"
};

const DEFAULT_NOTEBOOKS = [
  {
    id: "april-2026",
    title: "April 2026",
    income: { salary: 5200, freelance: 400 },
    savingsRate: 0.3,
    entries: [
      expense("demo-lunch", "2026-04-08", 15.5, "food", "lunch ramen", "Ramen House"),
      expense("demo-uber", "2026-04-10", 12.3, "transport", "uber to meeting", "Uber"),
      expense("demo-coffee", "2026-04-12", 11, "food", "coffee x2", "Coffee Bar", "5.50 x 2"),
      expense("demo-rent", "2026-04-01", 1800, "housing", "rent", "Rent")
    ]
  },
  {
    id: "runway-plan",
    title: "Runway Plan",
    income: { salary: 0, freelance: 2400 },
    savingsRate: 0.2,
    entries: [
      expense("demo-cloud", "2026-05-02", 84, "other", "cloud tools", "Vercel"),
      expense("demo-ads", "2026-05-06", 320, "shopping", "landing page ads", "Meta")
    ]
  },
  {
    id: "tokyo-trip",
    title: "Tokyo Trip",
    income: { salary: 0, freelance: 1200 },
    savingsRate: 0.1,
    entries: [
      expense("demo-hotel", "2026-05-11", 420, "housing", "hotel three nights", "Hotel"),
      expense("demo-train", "2026-05-12", 38.4, "transport", "airport train", "JR")
    ]
  }
];

function expense(id, date, amount, category, note, merchant = "", expression = "") {
  return {
    id,
    date,
    amount,
    currency: "USD",
    merchant,
    category,
    note,
    kind: "expense",
    source: "demo",
    expression,
    ledgerLine: `${date} ${note} USD ${Number(amount).toFixed(2)} #${category}${merchant ? ` @${merchant.replace(/\s+/g, "")}` : ""}`
  };
}

const state = {
  mode: "text",
  imageData: "",
  notebooks: loadNotebooks(),
  activeNotebookId: loadActiveNotebookId()
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
    income: {
      salary: Number(notebook.income?.salary || 0),
      freelance: Number(notebook.income?.freelance || 0)
    },
    savingsRate: Number(notebook.savingsRate || 0.3),
    entries: Array.isArray(notebook.entries) ? notebook.entries.map(normalizeEntry).filter(Boolean) : []
  };
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const kind = entry.kind || (entry.category === "income" ? "income" : "expense");
  return {
    id: entry.id || crypto.randomUUID(),
    savedAt: entry.savedAt || new Date().toISOString(),
    date: entry.date || "",
    amount: Math.abs(Number(entry.amount || 0)),
    currency: entry.currency || "USD",
    merchant: entry.merchant || "",
    category: entry.category || "other",
    note: entry.note || titleFromLedgerLine(entry.ledgerLine) || "expense",
    kind,
    source: entry.source || "text",
    expression: entry.expression || deriveExpression(entry.rawText || entry.note || ""),
    rawText: entry.rawText || "",
    ledgerLine: entry.ledgerLine || ""
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
    els.commandInput.placeholder = "say or type: uber to meeting 12.30";
    els.voiceStatus.style.display = "block";
  } else if (mode === "photo") {
    els.commandInput.placeholder = "receipt notes, e.g. lunch ramen total 15.50";
    els.voiceStatus.style.display = "none";
  } else {
    els.commandInput.placeholder = "dinner sushi 45.90";
    els.voiceStatus.style.display = "none";
  }
  els.commandInput.focus();
}

function render() {
  renderNotebooks();
  renderNotebookTitle();
  renderIncome();
  renderExpenses();
  renderCalculated();
  renderMetrics();
}

function renderNotebooks() {
  const buttons = state.notebooks.map(notebook => {
    const totals = calculateTotals(notebook);
    const button = document.createElement("button");
    button.className = "notebook-tab";
    button.classList.toggle("active", notebook.id === state.activeNotebookId);
    button.type = "button";
    button.dataset.id = notebook.id;
    button.innerHTML = `<span>${escapeHtml(notebook.title)}</span><strong>${formatMoney(totals.total, { cents: true })}</strong>`;
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

function renderIncome() {
  const notebook = activeNotebook();
  els.incomeRows.replaceChildren(
    formulaRow({
      name: "salary",
      amount: notebook.income.salary,
      amountClass: "positive",
      signed: true
    }),
    formulaRow({
      name: "freelance",
      amount: notebook.income.freelance,
      amountClass: "positive",
      signed: true
    })
  );
}

function renderExpenses() {
  const rows = activeNotebook().entries.map(entry => entryRow(entry));
  els.expenseRows.replaceChildren(...rows);
}

function renderCalculated() {
  const totals = calculateTotals();
  els.calculatedRows.replaceChildren(
    formulaRow({
      name: "savings",
      description: `${Math.round(activeNotebook().savingsRate * 100)}% of salary`,
      amount: -totals.savings,
      amountClass: "negative",
      signed: true
    }),
    formulaRow({
      name: "total",
      description: "income + expenses + savings",
      amount: totals.total,
      nameClass: "good",
      amountClass: totals.total >= 0 ? "good" : "negative",
      signed: false,
      total: true
    })
  );
}

function renderMetrics() {
  const notebook = activeNotebook();
  const totals = calculateTotals(notebook);
  els.totalAmount.textContent = formatMoney(totals.total, { cents: true });
  els.entryCount.textContent = `${notebook.entries.length} ${notebook.entries.length === 1 ? "entry" : "entries"}`;
  els.topCategory.textContent = topCategory(notebook.entries);
}

function formulaRow({ name, description = "", amount, nameClass = "", amountClass = "", signed = false, total = false }) {
  const row = document.createElement("div");
  row.className = `ledger-row formula-row${total ? " total-row" : ""}`;

  const main = document.createElement("div");
  main.className = "row-main";

  const label = document.createElement("span");
  label.className = `formula-name ${nameClass}`.trim();
  label.textContent = name;

  const equals = document.createElement("span");
  equals.className = "equals";
  equals.textContent = "=";

  main.append(label, equals);
  if (description) {
    const desc = document.createElement("span");
    desc.className = "formula-desc";
    desc.textContent = description;
    main.append(desc);
  }

  const value = document.createElement("span");
  value.className = `amount result-cell ${amountClass}`.trim();
  value.textContent = formatMoney(amount, { signed, cents: !Number.isInteger(amount) });

  row.append(main, value);
  return row;
}

function entryRow(entry) {
  const row = document.createElement("div");
  row.className = "ledger-row expense-row";
  row.title = entry.ledgerLine || "";

  const main = document.createElement("div");
  main.className = "row-main";

  const icon = document.createElement("span");
  icon.className = "row-icon";
  icon.textContent = CATEGORY_EMOJI[entry.category] || CATEGORY_EMOJI.other;

  const title = document.createElement("span");
  title.className = "row-title";
  title.textContent = displayTitle(entry);
  title.contentEditable = "true";
  title.spellcheck = false;
  title.addEventListener("blur", () => updateEntryNote(entry.id, title.textContent));

  main.append(icon, title);

  if (entry.expression) {
    const expression = document.createElement("span");
    expression.className = "row-expression";
    expression.textContent = entry.expression;
    main.append(expression);
  }

  const signedAmount = signedEntryAmount(entry);
  const amount = document.createElement("span");
  amount.className = `amount result-cell ${signedAmount >= 0 ? "positive" : "negative"}`;
  amount.textContent = formatMoney(signedAmount, { signed: true, cents: true });

  row.append(main, amount);
  return row;
}

function updateEntryNote(id, value) {
  const entry = activeNotebook().entries.find(item => item.id === id);
  if (!entry) return;
  const next = String(value || "").trim();
  if (!next || next === entry.note) return;
  entry.note = next;
  entry.ledgerLine = buildLedgerLine(entry);
  persistAll();
  renderMetrics();
}

function calculateTotals(notebook = activeNotebook()) {
  const income = Number(notebook.income.salary || 0) + Number(notebook.income.freelance || 0);
  const entriesTotal = notebook.entries.reduce((sum, entry) => sum + signedEntryAmount(entry), 0);
  const savings = Number((Number(notebook.income.salary || 0) * notebook.savingsRate).toFixed(2));
  const total = Number((income + entriesTotal - savings).toFixed(2));
  const spent = notebook.entries
    .filter(entry => signedEntryAmount(entry) < 0)
    .reduce((sum, entry) => sum + Math.abs(signedEntryAmount(entry)), 0);
  return { income, entriesTotal, spent, savings, total };
}

function signedEntryAmount(entry) {
  const amount = Math.abs(Number(entry.amount || 0));
  return entry.kind === "income" || entry.category === "income" ? amount : -amount;
}

function topCategory(entries) {
  const totals = new Map();
  entries
    .filter(entry => signedEntryAmount(entry) < 0)
    .forEach(entry => {
      totals.set(entry.category, (totals.get(entry.category) || 0) + Math.abs(Number(entry.amount || 0)));
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
    setMessage("Type a money note first.", "error");
    return;
  }

  if (applyLocalFormula(raw)) {
    els.commandInput.value = "";
    render();
    return;
  }

  els.submitCommand.disabled = true;
  setMessage("AI is reading the line...");

  try {
    const response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadForCommand(raw))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Extraction failed");

    const entry = entryFromExtraction(data.extraction, raw);
    els.providerBadge.textContent = data.provider || "local";

    if (entry.category === "income") {
      applyIncomeEntry(entry, raw);
    } else {
      activeNotebook().entries.unshift(entry);
      persistAll();
      setMessage(`Added: ${displayTitle(entry)} ${formatMoney(signedEntryAmount(entry), { signed: true, cents: true })}`);
    }

    els.commandInput.value = "";
    render();
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

function applyLocalFormula(raw) {
  const notebook = activeNotebook();
  const text = raw.replace(/,/g, "").trim();
  const incomeMatch = text.match(/^(salary|freelance)\s*(?:=|is|:)?\s*\+?\$?(\d+(?:\.\d{1,2})?)/i);
  if (incomeMatch) {
    const key = incomeMatch[1].toLowerCase();
    notebook.income[key] = Number(incomeMatch[2]);
    persistAll();
    setMessage(`${key} updated to ${formatMoney(notebook.income[key], { signed: true })}.`);
    return true;
  }

  const savingsMatch = text.match(/^savings\s*(?:=|is|:)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i);
  if (savingsMatch) {
    notebook.savingsRate = Number(savingsMatch[1]) / 100;
    persistAll();
    setMessage(`Savings formula updated to ${Math.round(notebook.savingsRate * 100)}% of salary.`);
    return true;
  }

  return false;
}

function entryFromExtraction(extraction, rawText) {
  const note = extraction.note || titleFromLedgerLine(extraction.ledgerLine) || extraction.category || "expense";
  return {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    date: extraction.date,
    amount: Math.abs(Number(extraction.amount || 0)),
    currency: extraction.currency || "USD",
    merchant: extraction.merchant || "",
    category: extraction.category || "other",
    note,
    kind: extraction.category === "income" ? "income" : "expense",
    source: extraction.source || state.mode,
    expression: deriveExpression(rawText),
    rawText,
    ledgerLine: extraction.ledgerLine
  };
}

function applyIncomeEntry(entry, raw) {
  const notebook = activeNotebook();
  const lowered = raw.toLowerCase();
  const key = lowered.includes("salary") ? "salary" : "freelance";
  notebook.income[key] = key === "freelance" ? notebook.income.freelance + entry.amount : entry.amount;
  persistAll();
  setMessage(`${key} updated from income line.`);
}

function deriveExpression(text) {
  const match = String(text).match(/(\d+(?:\.\d{1,2})?)\s*(?:x|\*)\s*(\d+(?:\.\d{1,2})?)/i);
  return match ? `${Number(match[1]).toFixed(2)} x ${Number(match[2])}` : "";
}

function displayTitle(entry) {
  return String(entry.note || entry.merchant || "expense")
    .replace(/\s+/g, " ")
    .replace(trailingAmountPattern(entry.amount), "")
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

function titleFromLedgerLine(line = "") {
  const match = String(line).match(/^\d{4}-\d{2}-\d{2}\s+(.+?)\s+[A-Z]{3,8}\s+\d/i);
  return match ? match[1] : "";
}

function buildLedgerLine(entry) {
  const merchant = entry.merchant ? ` @${entry.merchant.replace(/\s+/g, "")}` : "";
  return `${entry.date} ${entry.note} ${entry.currency || "USD"} ${Number(entry.amount || 0).toFixed(2)} #${entry.category}${merchant}`;
}

function setSample() {
  const samples = {
    text: "coffee 5.50 x 2",
    voice: "uber to meeting twelve dollars and thirty cents",
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
    income: { salary: 0, freelance: 0 },
    savingsRate: 0.3,
    entries: []
  };
  state.notebooks.push(notebook);
  state.activeNotebookId = notebook.id;
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
    els.voiceStatus.textContent = "Transcript ready. Press Enter to add it.";
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
      setMessage("Receipt attached. Add a note or run OpenAI mode for image reading.");
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
  const totals = calculateTotals(notebook);
  const lines = [
    `# ${notebook.title}`,
    "",
    "## Lines",
    `- salary = ${formatMoney(notebook.income.salary, { signed: true })}`,
    `- freelance = ${formatMoney(notebook.income.freelance, { signed: true })}`,
    ...notebook.entries.map(entry => `- ${displayTitle(entry)} = ${formatMoney(signedEntryAmount(entry), { signed: true, cents: true })}`),
    `- savings = ${formatMoney(-totals.savings, { signed: true, cents: true })}`,
    `- total = ${formatMoney(totals.total, { cents: true })}`,
    ""
  ];
  download(`${slugify(notebook.title)}.md`, lines.join("\n"), "text/markdown");
}

function exportJson() {
  const notebook = activeNotebook();
  const payload = {
    ...notebook,
    calculated: calculateTotals(notebook)
  };
  download(`${slugify(notebook.title)}.json`, JSON.stringify(payload, null, 2) + "\n", "application/json");
}

function exportCsv() {
  const notebook = activeNotebook();
  const header = ["note", "signedAmount", "date", "merchant", "category", "ledgerLine"];
  const rows = notebook.entries.map(entry => [
    entry.note,
    signedEntryAmount(entry),
    entry.date,
    entry.merchant,
    entry.category,
    entry.ledgerLine
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
  if (!notebook.entries.length) {
    setMessage("This notebook has no entries to clear.");
    return;
  }
  if (!confirm(`Clear entries in ${notebook.title}?`)) return;
  notebook.entries = [];
  persistAll();
  render();
  setMessage("Notebook entries cleared.");
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
