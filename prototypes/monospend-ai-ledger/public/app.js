const state = {
  mode: "text",
  imageData: "",
  draft: null,
  ledger: loadLedger()
};

const els = {
  modeTabs: [...document.querySelectorAll(".mode-tab")],
  panes: [...document.querySelectorAll(".mode-pane")],
  textInput: document.querySelector("#textInput"),
  voiceInput: document.querySelector("#voiceInput"),
  receiptText: document.querySelector("#receiptText"),
  photoInput: document.querySelector("#photoInput"),
  receiptPreview: document.querySelector("#receiptPreview"),
  extractButton: document.querySelector("#extractButton"),
  sampleButton: document.querySelector("#sampleButton"),
  recordButton: document.querySelector("#recordButton"),
  voiceStatus: document.querySelector("#voiceStatus"),
  message: document.querySelector("#message"),
  providerBadge: document.querySelector("#providerBadge"),
  fields: {
    date: document.querySelector("#dateField"),
    amount: document.querySelector("#amountField"),
    currency: document.querySelector("#currencyField"),
    merchant: document.querySelector("#merchantField"),
    category: document.querySelector("#categoryField"),
    confidence: document.querySelector("#confidenceField")
  },
  ledgerLine: document.querySelector("#ledgerLine"),
  saveButton: document.querySelector("#saveButton"),
  clearDraftButton: document.querySelector("#clearDraftButton"),
  ledgerList: document.querySelector("#ledgerList"),
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
    return JSON.parse(localStorage.getItem("monospend-ledger") || "[]");
  } catch {
    return [];
  }
}

function persistLedger() {
  localStorage.setItem("monospend-ledger", JSON.stringify(state.ledger));
}

function setMessage(text, kind = "") {
  els.message.textContent = text;
  els.message.dataset.kind = kind;
}

function setMode(mode) {
  state.mode = mode;
  els.modeTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.mode === mode));
  els.panes.forEach(pane => pane.classList.toggle("active", pane.dataset.pane === mode));
}

function payloadForMode() {
  if (state.mode === "voice") {
    return { source: "voice", transcript: els.voiceInput.value.trim() };
  }
  if (state.mode === "photo") {
    return {
      source: "photo",
      receiptText: els.receiptText.value.trim(),
      imageData: state.imageData
    };
  }
  return { source: "text", text: els.textInput.value.trim() };
}

async function extract() {
  const payload = payloadForMode();
  els.extractButton.disabled = true;
  setMessage("Extracting...");

  try {
    const response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Extraction failed");

    state.draft = data.extraction;
    renderDraft(data.extraction);
    els.providerBadge.textContent = data.provider || "local";
    setMessage("Review the ledger line, then save.");
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    els.extractButton.disabled = false;
  }
}

function renderDraft(entry) {
  els.fields.date.value = entry.date;
  els.fields.amount.value = entry.amount;
  els.fields.currency.value = entry.currency;
  els.fields.merchant.value = entry.merchant;
  els.fields.category.value = entry.category;
  els.fields.confidence.value = entry.confidence.toFixed(2);
  els.ledgerLine.value = entry.ledgerLine;
}

function readDraftFromForm() {
  return {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    date: els.fields.date.value.trim(),
    amount: Number(els.fields.amount.value || 0),
    currency: els.fields.currency.value.trim().toUpperCase() || "USD",
    merchant: els.fields.merchant.value.trim(),
    category: els.fields.category.value,
    confidence: Number(els.fields.confidence.value || 0),
    ledgerLine: els.ledgerLine.value.trim(),
    source: state.mode
  };
}

function saveDraft() {
  const entry = readDraftFromForm();
  if (!entry.date || !entry.ledgerLine || entry.amount < 0) {
    setMessage("Check date, amount, and ledger line.", "error");
    return;
  }
  state.ledger.unshift(entry);
  persistLedger();
  clearDraft();
  renderLedger();
  setMessage("Saved to local ledger.");
}

function clearDraft() {
  state.draft = null;
  Object.values(els.fields).forEach(field => {
    field.value = "";
  });
  els.ledgerLine.value = "";
}

function renderLedger() {
  els.ledgerList.innerHTML = "";
  state.ledger.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = entry.ledgerLine;
    els.ledgerList.appendChild(li);
  });

  els.entryCount.textContent = `${state.ledger.length} ${state.ledger.length === 1 ? "entry" : "entries"}`;
  const totals = summarizeLedger();
  els.totalAmount.textContent = `${totals.currency} ${totals.total.toFixed(2)}`;
  els.topCategory.textContent = totals.topCategory;
}

function summarizeLedger() {
  const totalsByCategory = new Map();
  let total = 0;
  let currency = "USD";
  state.ledger.forEach(entry => {
    if (entry.category !== "income") total += Number(entry.amount || 0);
    currency = entry.currency || currency;
    totalsByCategory.set(entry.category, (totalsByCategory.get(entry.category) || 0) + Number(entry.amount || 0));
  });

  let topCategory = "none";
  let topValue = 0;
  for (const [category, value] of totalsByCategory) {
    if (value > topValue) {
      topCategory = category;
      topValue = value;
    }
  }
  return { total, currency, topCategory };
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
  const lines = ["# MonoSpend Ledger", "", ...state.ledger.map(entry => `- ${entry.ledgerLine}`), ""];
  download("monospend-ledger.md", lines.join("\n"), "text/markdown");
}

function exportJson() {
  download("monospend-ledger.jsonl", state.ledger.map(entry => JSON.stringify(entry)).join("\n") + "\n", "application/x-ndjson");
}

function exportCsv() {
  const header = ["date", "amount", "currency", "merchant", "category", "note", "ledgerLine"];
  const rows = state.ledger.map(entry => header.map(key => csvEscape(entry[key] || "")).join(","));
  download("monospend-ledger.csv", [header.join(","), ...rows].join("\n") + "\n", "text/csv");
}

function csvEscape(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function clearLedger() {
  if (!state.ledger.length) return;
  if (!confirm("Clear local ledger?")) return;
  state.ledger = [];
  persistLedger();
  renderLedger();
  setMessage("Local ledger cleared.");
}

function setSample() {
  const samples = {
    text: "coffee and sandwich at Blue Bottle $14.25 today",
    voice: "Uber from airport yesterday twenty three dollars and forty cents",
    photo: "Ramen House\n2026-05-25\nLunch ramen\nTotal $15.50"
  };
  if (state.mode === "voice") els.voiceInput.value = samples.voice;
  else if (state.mode === "photo") els.receiptText.value = samples.photo;
  else els.textInput.value = samples.text;
}

function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    els.recordButton.disabled = true;
    els.voiceStatus.textContent = "Speech recognition unavailable.";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.onstart = () => {
    els.voiceStatus.textContent = "Listening...";
    els.recordButton.disabled = true;
  };
  recognition.onresult = event => {
    els.voiceInput.value = event.results[0][0].transcript;
    els.voiceStatus.textContent = "Transcript ready.";
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
    const reader = new FileReader();
    reader.onload = () => {
      state.imageData = String(reader.result || "");
      els.receiptPreview.src = state.imageData;
      els.receiptPreview.classList.add("visible");
    };
    reader.readAsDataURL(file);
  });
}

els.modeTabs.forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
els.extractButton.addEventListener("click", extract);
els.sampleButton.addEventListener("click", setSample);
els.saveButton.addEventListener("click", saveDraft);
els.clearDraftButton.addEventListener("click", clearDraft);
els.exportMarkdown.addEventListener("click", exportMarkdown);
els.exportJson.addEventListener("click", exportJson);
els.exportCsv.addEventListener("click", exportCsv);
els.clearLedger.addEventListener("click", clearLedger);

setupVoice();
setupPhoto();
renderLedger();

