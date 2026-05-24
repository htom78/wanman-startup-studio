const STORAGE_KEYS = {
  ledger: "monospend-live-ledger",
  income: "monospend-live-income",
  savingsRate: "monospend-live-savings-rate"
};

const DEFAULT_INCOME = {
  salary: 5200,
  freelance: 400
};

const DEMO_EXPENSES = [
  {
    id: "demo-lunch",
    date: "2026-04-08",
    amount: 15.5,
    currency: "USD",
    merchant: "Ramen House",
    category: "food",
    note: "lunch ramen",
    source: "demo",
    expression: "",
    ledgerLine: "2026-04-08 lunch ramen USD 15.50 #food @RamenHouse"
  },
  {
    id: "demo-uber",
    date: "2026-04-10",
    amount: 12.3,
    currency: "USD",
    merchant: "Uber",
    category: "transport",
    note: "uber to meeting",
    source: "demo",
    expression: "",
    ledgerLine: "2026-04-10 uber to meeting USD 12.30 #transport @Uber"
  },
  {
    id: "demo-coffee",
    date: "2026-04-12",
    amount: 11,
    currency: "USD",
    merchant: "Coffee Bar",
    category: "food",
    note: "coffee x2",
    source: "demo",
    expression: "5.50 x 2",
    ledgerLine: "2026-04-12 coffee x2 USD 11.00 #food @CoffeeBar"
  },
  {
    id: "demo-rent",
    date: "2026-04-01",
    amount: 1800,
    currency: "USD",
    merchant: "Rent",
    category: "housing",
    note: "rent",
    source: "demo",
    expression: "",
    ledgerLine: "2026-04-01 rent USD 1800.00 #housing @Rent"
  }
];

const CATEGORY_EMOJI = {
  food: "🍜",
  transport: "🚗",
  housing: "🏠",
  shopping: "🛍️",
  health: "💊",
  income: "💵",
  other: "•"
};

const state = {
  mode: "text",
  imageData: "",
  ledger: loadLedger(),
  income: loadIncome(),
  savingsRate: loadSavingsRate()
};

const els = {
  monthLabel: document.querySelector("#monthLabel"),
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

function loadLedger() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.ledger) || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeStoredEntry).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function normalizeStoredEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    id: entry.id || crypto.randomUUID(),
    savedAt: entry.savedAt || new Date().toISOString(),
    date: entry.date || "",
    amount: Number(entry.amount || 0),
    currency: entry.currency || "USD",
    merchant: entry.merchant || "",
    category: entry.category || "other",
    note: entry.note || titleFromLedgerLine(entry.ledgerLine) || "expense",
    source: entry.source || "text",
    expression: entry.expression || deriveExpression(entry.rawText || entry.note || ""),
    ledgerLine: entry.ledgerLine || ""
  };
}

function loadIncome() {
  try {
    return { ...DEFAULT_INCOME, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.income) || "{}") };
  } catch {
    return { ...DEFAULT_INCOME };
  }
}

function loadSavingsRate() {
  const saved = Number(localStorage.getItem(STORAGE_KEYS.savingsRate));
  return saved > 0 && saved < 1 ? saved : 0.3;
}

function persistLedger() {
  localStorage.setItem(STORAGE_KEYS.ledger, JSON.stringify(state.ledger));
}

function persistIncome() {
  localStorage.setItem(STORAGE_KEYS.income, JSON.stringify(state.income));
}

function persistSavingsRate() {
  localStorage.setItem(STORAGE_KEYS.savingsRate, String(state.savingsRate));
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

function displayEntries() {
  return [...state.ledger, ...DEMO_EXPENSES];
}

function render() {
  renderMonth();
  renderIncome();
  renderExpenses();
  renderCalculated();
  renderMetrics();
}

function renderMonth() {
  els.monthLabel.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date());
}

function renderIncome() {
  els.incomeRows.replaceChildren(
    formulaRow({
      name: "salary",
      amount: state.income.salary,
      amountClass: "income",
      signed: true
    }),
    formulaRow({
      name: "freelance",
      amount: state.income.freelance,
      amountClass: "income",
      signed: true
    })
  );
}

function renderExpenses() {
  const rows = displayEntries().map(entry => expenseRow(entry));
  els.expenseRows.replaceChildren(...rows);
}

function renderCalculated() {
  const totals = calculateTotals();
  els.calculatedRows.replaceChildren(
    formulaRow({
      name: "savings",
      description: `${Math.round(state.savingsRate * 100)}% of salary`,
      amount: totals.savings,
      amountClass: "warning"
    }),
    formulaRow({
      name: "free cash",
      description: "income - spent - savings",
      amount: totals.freeCash,
      nameClass: "good",
      amountClass: "good"
    })
  );
}

function renderMetrics() {
  const entries = displayEntries();
  const totals = calculateTotals();
  els.totalAmount.textContent = formatMoney(totals.spent, { cents: true });
  els.entryCount.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  els.topCategory.textContent = topCategory(entries);
}

function formulaRow({ name, description = "", amount, nameClass = "", amountClass = "", signed = false }) {
  const row = document.createElement("div");
  row.className = "ledger-row formula-row";

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
  value.className = `amount ${amountClass}`.trim();
  value.textContent = formatMoney(amount, { signed, cents: !Number.isInteger(amount) });

  row.append(main, value);
  return row;
}

function expenseRow(entry) {
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

  main.append(icon, title);

  if (entry.expression) {
    const expression = document.createElement("span");
    expression.className = "row-expression";
    expression.textContent = entry.expression;
    main.append(expression);
  }

  const amount = document.createElement("span");
  amount.className = "amount";
  amount.textContent = formatMoney(entry.amount, { cents: true });

  row.append(main, amount);
  return row;
}

function calculateTotals() {
  const income = Number(state.income.salary || 0) + Number(state.income.freelance || 0);
  const spent = displayEntries()
    .filter(entry => entry.category !== "income")
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const savings = Number((Number(state.income.salary || 0) * state.savingsRate).toFixed(2));
  const freeCash = Number((income - spent - savings).toFixed(2));
  return { income, spent, savings, freeCash };
}

function topCategory(entries) {
  const totals = new Map();
  entries
    .filter(entry => entry.category !== "income")
    .forEach(entry => {
      totals.set(entry.category, (totals.get(entry.category) || 0) + Number(entry.amount || 0));
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
  const prefix = signed && number >= 0 ? "+" : "";
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
      state.ledger.unshift(entry);
      persistLedger();
      setMessage(`Added: ${displayTitle(entry)} ${formatMoney(entry.amount, { cents: true })}`);
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
  const text = raw.replace(/,/g, "").trim();
  const incomeMatch = text.match(/^(salary|freelance)\s*(?:=|is|:)?\s*\+?\$?(\d+(?:\.\d{1,2})?)/i);
  if (incomeMatch) {
    const key = incomeMatch[1].toLowerCase();
    state.income[key] = Number(incomeMatch[2]);
    persistIncome();
    setMessage(`${key} updated to ${formatMoney(state.income[key], { signed: true })}.`);
    return true;
  }

  const savingsMatch = text.match(/^savings\s*(?:=|is|:)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i);
  if (savingsMatch) {
    state.savingsRate = Number(savingsMatch[1]) / 100;
    persistSavingsRate();
    setMessage(`Savings formula updated to ${Math.round(state.savingsRate * 100)}% of salary.`);
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
    amount: Number(extraction.amount || 0),
    currency: extraction.currency || "USD",
    merchant: extraction.merchant || "",
    category: extraction.category || "other",
    note,
    source: extraction.source || state.mode,
    expression: deriveExpression(rawText),
    rawText,
    ledgerLine: extraction.ledgerLine
  };
}

function applyIncomeEntry(entry, raw) {
  const lowered = raw.toLowerCase();
  const key = lowered.includes("salary") ? "salary" : "freelance";
  state.income[key] = key === "freelance" ? state.income.freelance + entry.amount : entry.amount;
  persistIncome();
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

function titleFromLedgerLine(line = "") {
  const match = String(line).match(/^\d{4}-\d{2}-\d{2}\s+(.+?)\s+[A-Z]{3,8}\s+\d/i);
  return match ? match[1] : "";
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
  const totals = calculateTotals();
  const lines = [
    "# MonoSpend Ledger",
    "",
    "## Income",
    `- salary = ${formatMoney(state.income.salary, { signed: true })}`,
    `- freelance = ${formatMoney(state.income.freelance, { signed: true })}`,
    "",
    "## Spending",
    ...displayEntries().map(entry => `- ${entry.ledgerLine}`),
    "",
    "## Calculated",
    `- savings = ${Math.round(state.savingsRate * 100)}% of salary = ${formatMoney(totals.savings, { cents: true })}`,
    `- free cash = income - spent - savings = ${formatMoney(totals.freeCash, { cents: true })}`,
    ""
  ];
  download("monospend-ledger.md", lines.join("\n"), "text/markdown");
}

function exportJson() {
  const payload = {
    income: state.income,
    savingsRate: state.savingsRate,
    entries: displayEntries(),
    calculated: calculateTotals()
  };
  download("monospend-ledger.json", JSON.stringify(payload, null, 2) + "\n", "application/json");
}

function exportCsv() {
  const header = ["date", "amount", "currency", "merchant", "category", "note", "ledgerLine"];
  const rows = displayEntries().map(entry => header.map(key => csvEscape(entry[key] || "")).join(","));
  download("monospend-ledger.csv", [header.join(","), ...rows].join("\n") + "\n", "text/csv");
}

function csvEscape(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function clearLedger() {
  if (!state.ledger.length) {
    setMessage("Demo rows stay visible; no saved entries to clear.");
    return;
  }
  if (!confirm("Clear saved local ledger entries? Demo rows will remain.")) return;
  state.ledger = [];
  persistLedger();
  render();
  setMessage("Saved entries cleared. Demo rows remain for the mock.");
}

els.modeTabs.forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
els.submitCommand.addEventListener("click", submitCommand);
els.commandInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitCommand();
  }
});
els.sampleButton.addEventListener("click", setSample);
els.exportMarkdown.addEventListener("click", exportMarkdown);
els.exportJson.addEventListener("click", exportJson);
els.exportCsv.addEventListener("click", exportCsv);
els.clearLedger.addEventListener("click", clearLedger);

setupVoice();
setupPhoto();
setMode("text");
render();
