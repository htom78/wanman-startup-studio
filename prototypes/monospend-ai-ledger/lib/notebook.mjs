const MONEY_CATEGORIES = ["food", "transport", "housing", "shopping", "health", "income", "other"];
const NOTEBOOK_CATEGORIES = [...MONEY_CATEGORIES, "calculation", "note"];
const NOTEBOOK_KINDS = ["income", "expense", "calculation", "note"];
const DEFAULT_FOLDER_ID = "general";

export const DEFAULT_FOLDERS = [
  { id: DEFAULT_FOLDER_ID, title: "General" },
  { id: "work", title: "Work" },
  { id: "travel", title: "Travel" }
];

export const DEFAULT_NOTEBOOKS = [
  {
    id: "april-2026",
    folderId: DEFAULT_FOLDER_ID,
    title: "April 2026",
    lines: [
      moneyLine("demo-salary", "salary = $5,200", "income", 5200, "income", "demo"),
      moneyLine("demo-freelance", "freelance = $400", "income", 400, "income", "demo"),
      moneyLine("demo-rent", "monthly rent = $2,500", "expense", -2500, "housing", "demo", "fixed cost"),
      moneyLine("demo-lunch", "lunch = $55.00 + 25% tip", "expense", -68.75, "food", "demo", "captured from voice"),
      calculationLine("demo-remaining", "calculate remaining", "remaining", 3031.25, "demo")
    ]
  },
  {
    id: "runway-plan",
    folderId: "work",
    title: "Runway Plan",
    lines: [
      moneyLine("runway-budget", "starting budget = $2,400", "income", 2400, "income", "demo"),
      moneyLine("runway-cloud", "cloud tools = $84", "expense", -84, "shopping", "demo"),
      moneyLine("runway-ads", "landing page ads = $320", "expense", -320, "shopping", "demo"),
      calculationLine("runway-total", "calculate remaining runway", "remaining", 1996, "demo")
    ]
  },
  {
    id: "tokyo-trip",
    folderId: "travel",
    title: "Tokyo Trip",
    lines: [
      moneyLine("trip-budget", "trip budget = $1,200", "income", 1200, "income", "demo"),
      moneyLine("trip-hotel", "hotel three nights = $420", "expense", -420, "housing", "demo"),
      moneyLine("trip-train", "airport train = $38.40", "expense", -38.4, "transport", "demo"),
      calculationLine("trip-left", "calculate trip money left", "remaining", 741.6, "demo")
    ]
  }
];

export const notebookComposeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["lines"],
  properties: {
    lines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "text",
          "canonicalText",
          "kind",
          "category",
          "amount",
          "query",
          "confidence",
          "resultText",
          "reason"
        ],
        properties: {
          text: { type: "string" },
          canonicalText: { type: "string" },
          kind: { type: "string", enum: NOTEBOOK_KINDS },
          category: { type: "string", enum: NOTEBOOK_CATEGORIES },
          amount: { type: "number" },
          query: { type: "string", enum: ["", "remaining", "totalCost", "totalIncome"] },
          confidence: { type: "number" },
          resultText: { type: "string" },
          reason: { type: "string" }
        }
      }
    }
  }
};

export function cloneDefaultNotebooks() {
  return JSON.parse(JSON.stringify(DEFAULT_NOTEBOOKS));
}

export function cloneDefaultFolders() {
  return JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
}

export function defaultNotebookState() {
  return {
    activeFolderId: DEFAULT_FOLDER_ID,
    activeNotebookId: DEFAULT_NOTEBOOKS[0].id,
    folders: cloneDefaultFolders(),
    notebooks: cloneDefaultNotebooks()
  };
}

export function normalizeNotebookState(value) {
  const fallback = defaultNotebookState();
  const folders = Array.isArray(value?.folders)
    ? value.folders.map(normalizeFolder).filter(Boolean)
    : cloneDefaultFolders();
  if (!folders.length) {
    folders.push(...cloneDefaultFolders());
  }
  if (!folders.some(folder => folder.id === DEFAULT_FOLDER_ID)) {
    folders.unshift({ id: DEFAULT_FOLDER_ID, title: "General" });
  }

  const notebooks = Array.isArray(value?.notebooks)
    ? value.notebooks.map(item => normalizeNotebook(item, folders)).filter(Boolean)
    : [];
  if (!notebooks.length) return fallback;

  const activeNotebookId = notebooks.some(notebook => notebook.id === value?.activeNotebookId)
    ? value.activeNotebookId
    : notebooks[0].id;
  const activeNotebook = notebooks.find(notebook => notebook.id === activeNotebookId) || notebooks[0];
  const activeFolderId = folders.some(folder => folder.id === value?.activeFolderId)
    ? value.activeFolderId
    : activeNotebook.folderId || folders[0].id;

  return { activeFolderId, activeNotebookId, folders, notebooks };
}

export function normalizeFolder(value) {
  if (!value || typeof value !== "object") return null;
  const title = String(value.title || "Untitled").trim() || "Untitled";
  return {
    id: String(value.id || slugId(title) || cryptoRandomId()),
    title
  };
}

export function normalizeNotebook(value, folders = DEFAULT_FOLDERS) {
  if (!value || typeof value !== "object") return null;
  const folderId = folders.some(folder => folder.id === value.folderId)
    ? String(value.folderId)
    : DEFAULT_FOLDER_ID;
  return {
    id: String(value.id || cryptoRandomId()),
    folderId,
    title: String(value.title || "Untitled").trim() || "Untitled",
    lines: Array.isArray(value.lines) ? value.lines.map(normalizeLine).filter(Boolean) : []
  };
}

export function normalizeLine(value) {
  if (!value || typeof value !== "object") return null;
  const kind = NOTEBOOK_KINDS.includes(value.kind) ? value.kind : inferKind(value.canonicalText || value.text || "", "", "");
  const amount = normalizeAmount(value.amount, kind);
  const category = NOTEBOOK_CATEGORIES.includes(value.category)
    ? value.category
    : kind === "calculation" ? "calculation" : kind === "note" ? "note" : inferCategory(value.canonicalText || value.text || "", kind);

  return {
    id: String(value.id || cryptoRandomId()),
    text: String(value.text || value.canonicalText || "untitled note").trim() || "untitled note",
    canonicalText: String(value.canonicalText || value.text || "untitled note").trim() || "untitled note",
    kind,
    category,
    amount,
    query: ["remaining", "totalCost", "totalIncome"].includes(value.query) ? value.query : "",
    confidence: clamp(Number(value.confidence || 0.72), 0, 1),
    source: normalizeSource(value.source || "text"),
    rawText: String(value.rawText || ""),
    resultText: String(value.resultText || ""),
    meta: String(value.meta || "")
  };
}

export function createFolder(title = "New folder") {
  const safeTitle = String(title || "").trim() || "New folder";
  return {
    id: slugId(safeTitle) || cryptoRandomId(),
    title: safeTitle
  };
}

export function createNotebook(title = "New notebook", folderId = DEFAULT_FOLDER_ID) {
  const safeTitle = String(title || "").trim() || "New notebook";
  return {
    id: cryptoRandomId(),
    folderId: String(folderId || DEFAULT_FOLDER_ID),
    title: safeTitle,
    lines: []
  };
}

export function composeLocalNotebookLines({ raw, notebook, source = "text" }) {
  const text = String(raw || "").trim();
  if (!text) return [];

  const parts = splitNotebookInput(text);
  const lines = [];
  for (const part of parts) {
    const composed = composeOneLocalLine({
      raw: part,
      notebook,
      pendingLines: lines,
      source
    });
    if (composed) lines.push(composed);
  }
  return lines.length ? lines : [
    noteLine(cryptoRandomId(), cleanNotebookText(text, 0) || text, source, text)
  ];
}

export function composeOneLocalLine({ raw, notebook, pendingLines = [], source = "text" }) {
  const text = String(raw || "").trim();
  if (!text) return null;

  const calculation = semanticCalculationLine(text, notebook, pendingLines, source);
  if (calculation) return calculation;

  const money = parseSemanticMoneyExpression(text, source)
    || parseCanonicalAmount(text, "", source)
    || parseLooseAmount(text, source);
  if (money) return money;

  return noteLine(cryptoRandomId(), cleanNotebookText(text, 0) || text, source, text);
}

export function normalizeComposedLines({ lines, raw, notebook, source = "text" }) {
  const rawCalculationQuery = inferCalculationQuery(raw);
  const normalized = Array.isArray(lines)
    ? lines.map(item => normalizeLine({ ...item, rawText: raw, source })).filter(Boolean)
    : [];

  if (!normalized.length) return composeLocalNotebookLines({ raw, notebook, source });

  if (rawCalculationQuery && normalized.every(item => item.kind === "note")) {
    return [calculatedNote(raw, rawCalculationQuery, notebook, [], source, 0.92)];
  }

  const accepted = [];
  for (const item of normalized) {
    if (item.kind === "calculation") {
      const query = item.query || inferCalculationQuery(item.canonicalText || item.text);
      if (query) {
        accepted.push(calculatedNote(item.canonicalText || item.text, query, notebook, accepted, source, item.confidence));
      } else {
        accepted.push(noteLine(cryptoRandomId(), item.canonicalText || item.text, source, raw, item.confidence));
      }
      continue;
    }

    if (item.kind === "note") {
      accepted.push({
        ...item,
        id: item.id || cryptoRandomId(),
        amount: 0,
        category: "note",
        query: "",
        resultText: ""
      });
      continue;
    }

    const absoluteAmount = Math.abs(Number(item.amount || 0));
    const signed = item.kind === "income" ? absoluteAmount : -absoluteAmount;
    const category = item.kind === "income"
      ? "income"
      : NOTEBOOK_CATEGORIES.includes(item.category) && item.category !== "income"
        ? item.category
        : inferCategory(item.canonicalText || item.text, item.kind);
    accepted.push({
      ...item,
      id: item.id || cryptoRandomId(),
      amount: signed,
      category,
      query: "",
      resultText: ""
    });
  }

  return accepted.length ? accepted : composeLocalNotebookLines({ raw, notebook, source });
}

export function lineFromExtraction(extraction, rawText, source = "text") {
  const kind = extraction.category === "income" ? "income" : "expense";
  const signed = kind === "income" ? Math.abs(Number(extraction.amount || 0)) : -Math.abs(Number(extraction.amount || 0));
  const note = cleanNotebookText(extraction.note || extraction.merchant || rawText, extraction.amount);
  const canonicalText = `${note} = ${formatMoney(Math.abs(signed), { cents: true })}`;
  return {
    id: cryptoRandomId(),
    text: rawText,
    canonicalText,
    kind,
    category: extraction.category || "other",
    amount: signed,
    query: "",
    confidence: extraction.confidence || 0.72,
    source: normalizeSource(extraction.source || source),
    rawText,
    resultText: "",
    meta: ""
  };
}

export function calculateNotebook(notebook) {
  const inputLines = (notebook?.lines || []).filter(item => item.kind === "income" || item.kind === "expense");
  const income = inputLines.filter(item => Number(item.amount || 0) > 0).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const expenses = inputLines.filter(item => Number(item.amount || 0) < 0).reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0);
  const remaining = Number((income - expenses).toFixed(2));
  return {
    income: Number(income.toFixed(2)),
    expenses: Number(expenses.toFixed(2)),
    remaining
  };
}

export function formatMoney(value, { signed = false, cents = false } = {}) {
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

export function normalizeSource(source) {
  return ["text", "voice", "photo", "talk", "scan", "type"].includes(source) ? source : "text";
}

export function reclassifyLineIntent({ line, notebook, intent, query = "" }) {
  const current = normalizeLine(line);
  if (!current) return null;

  const target = ["note", "income", "expense", "calculation"].includes(intent) ? intent : "";
  if (!target) return null;

  const source = normalizeSource(current.source || "text");
  const rawText = current.rawText || current.text || current.canonicalText;
  const baseText = current.canonicalText || current.text || rawText;

  if (target === "note") {
    return normalizeLine({
      ...current,
      kind: "note",
      category: "note",
      amount: 0,
      query: "",
      resultText: "",
      meta: "corrected intent"
    });
  }

  if (target === "calculation") {
    const safeQuery = ["remaining", "totalCost", "totalIncome"].includes(query) ? query : "totalCost";
    const scopedNotebook = {
      ...(notebook || {}),
      lines: (notebook?.lines || []).filter(item => item.id !== current.id)
    };
    return normalizeLine({
      ...calculatedNote(baseText, safeQuery, scopedNotebook, [], source, 1),
      id: current.id,
      text: current.text,
      rawText,
      canonicalText: canonicalCalculationText(baseText, safeQuery),
      meta: "corrected intent"
    });
  }

  const parsed = parseCanonicalAmount(baseText, target, source) || parseLooseAmount(rawText, source);
  const absoluteAmount = Math.abs(Number(parsed?.amount || current.amount || 0));
  const canonicalText = parsed?.canonicalText || current.canonicalText || current.text;
  return normalizeLine({
    ...current,
    text: current.text,
    canonicalText,
    kind: target,
    category: target === "income" ? "income" : parsed?.category && parsed.category !== "income" ? parsed.category : inferCategory(canonicalText, target),
    amount: target === "income" ? absoluteAmount : -absoluteAmount,
    query: "",
    confidence: 1,
    source,
    rawText,
    resultText: "",
    meta: "corrected intent"
  });
}

function splitNotebookInput(raw) {
  const text = String(raw || "").trim();
  const firstPass = text
    .split(/\s+(?:and then|then)\s+|[;]\s*/i)
    .map(part => part.trim())
    .filter(Boolean);

  const parts = firstPass.flatMap(part => {
    const candidates = part.split(/\s*,?\s+and\s+/i).map(candidate => candidate.trim()).filter(Boolean);
    const meaningful = candidates.filter(candidate => /\d/.test(candidate) || inferCalculationQuery(candidate));
    return candidates.length > 1 && meaningful.length > 1 ? candidates : [part];
  });

  return parts.length ? parts : [text];
}

function moneyLine(id, text, kind, amount, category, source, meta = "") {
  return normalizeLine({
    id,
    text,
    canonicalText: text,
    kind,
    category,
    amount,
    confidence: 0.92,
    source,
    meta
  });
}

function noteLine(id, text, source, rawText = text, confidence = 0.82) {
  return normalizeLine({
    id,
    text,
    canonicalText: text,
    kind: "note",
    category: "note",
    amount: 0,
    confidence,
    source,
    rawText,
    resultText: ""
  });
}

function calculationLine(id, text, query, amount, source = "text", confidence = 1) {
  return normalizeLine({
    id,
    text,
    canonicalText: text,
    kind: "calculation",
    category: "calculation",
    query,
    amount,
    confidence,
    source,
    resultText: formatMoney(amount, { cents: true })
  });
}

function semanticCalculationLine(raw, notebook, pendingLines = [], source = "text") {
  const query = inferCalculationQuery(raw);
  return query ? calculatedNote(raw, query, notebook, pendingLines, source) : null;
}

function inferCalculationQuery(raw) {
  const normalized = String(raw || "").trim().toLowerCase();
  if (/^(?:calculate\s+)?(?:total cost|total spend|total expenses|spending total)(?:\s+.*)?$/.test(normalized)) return "totalCost";
  if (/^(?:calculate\s+)?(?:total income|income total)(?:\s+.*)?$/.test(normalized)) return "totalIncome";
  if (/^(?:calculate\s+)?(?:remaining|free cash|balance|left|money left|cash left)(?:\s+.*)?$/.test(normalized)) return "remaining";
  if (/(?:还剩|剩余|余额|结余|剩下|剩多少钱|还剩多少)/.test(normalized)) return "remaining";
  if (/(?:总收入|收入合计|收入总计|一共收入|总共收入)/.test(normalized)) return "totalIncome";
  if (/(?:帮我算一下|帮我算算|帮我算一算|帮忙算一下|算一下|算一算|计算一下|算一下账|算账|结账|统计一下|帮我统计一下|汇总一下|总花费|总支出|总共花|一共花|花了多少|支出合计|消费合计)/.test(normalized)) return "totalCost";
  return "";
}

function calculatedNote(raw, query, notebook, pendingLines = [], source = "text", confidence = 1) {
  const scopedNotebook = {
    ...(notebook || {}),
    lines: [...(notebook?.lines || []), ...pendingLines]
  };
  const totals = calculateNotebook(scopedNotebook);
  const amount = query === "totalCost" ? -totals.expenses : query === "totalIncome" ? totals.income : totals.remaining;
  return calculationLine(cryptoRandomId(), canonicalCalculationText(raw, query), query, amount, source, confidence);
}

function canonicalCalculationText(raw, query) {
  const text = String(raw || "").trim().toLowerCase();
  if (/[\u3400-\u9fff]/.test(text)) return text;
  if (text) return text.startsWith("calculate") ? text : `calculate ${text}`;
  if (query === "totalCost") return "calculate total cost";
  if (query === "totalIncome") return "calculate total income";
  return "calculate remaining";
}

function parseSemanticMoneyExpression(raw, source) {
  return parseTipExpression(raw, source) || parseSplitExpression(raw, source);
}

function parseCanonicalAmount(raw, fallbackKind = "", source = "text") {
  const text = String(raw || "").replace(/,/g, "").trim();
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
  const inferredKind = inferKind(label, amountText, fallbackKind);
  const kind = explicitSign && amountText.startsWith("+") ? "income" : inferredKind;
  const signed = kind === "income" ? absoluteAmount : -absoluteAmount;
  const canonicalText = `${label} = ${normalizeExpressionText(text.replace(match[1], ""), absoluteAmount)}`;

  return normalizeLine({
    id: cryptoRandomId(),
    text: raw,
    canonicalText,
    kind,
    category: inferCategory(label, kind),
    amount: signed,
    confidence: 0.88,
    source,
    rawText: raw
  });
}

function parseTipExpression(raw, source = "text") {
  const text = String(raw || "").replace(/,/g, "").trim();
  const match = text.match(/^(.+?)\s+(?:was|is|=|:)?\s*([+\-−]?\s*[$¥€£]?\s*\d+(?:\.\d{1,2})?)\s*\+\s*(\d+(?:\.\d+)?)%\s*(tip|tax)?$/i);
  if (!match) return null;
  const label = cleanNotebookText(match[1], 0);
  const base = parseMoneyToken(match[2]);
  const percentage = Number(match[3] || 0);
  const absoluteAmount = Number((Math.abs(base) * (1 + percentage / 100)).toFixed(2));
  const kind = inferKind(label, match[2], "");
  const signed = kind === "income" ? absoluteAmount : -absoluteAmount;
  const suffix = match[4] || "tip";
  return normalizeLine({
    id: cryptoRandomId(),
    text: raw,
    canonicalText: `${label} = ${formatMoney(Math.abs(base), { cents: true })} + ${percentage}% ${suffix}`,
    kind,
    category: inferCategory(label, kind),
    amount: signed,
    confidence: 0.9,
    source,
    rawText: raw
  });
}

function parseSplitExpression(raw, source = "text") {
  const text = String(raw || "").replace(/,/g, "").trim();
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
  return normalizeLine({
    id: cryptoRandomId(),
    text: raw,
    canonicalText: `${label} = ${formatMoney(base, { cents: false })} / ${divisor} ${unit}`,
    kind,
    category: inferCategory(label, kind),
    amount: signed,
    confidence: 0.88,
    source,
    rawText: raw
  });
}

function parseLooseAmount(raw, source = "text") {
  const text = String(raw || "").replace(/,/g, "");
  const match = text.match(/([+\-−]?\s*[$¥€£]?\s*\d+(?:\.\d{1,2})?)\s*([kK])?/);
  if (!match) return null;
  const amountToken = match[1].replace(/\s/g, "").replace(/[~$¥€£]/g, "").replace("−", "-");
  const multiplier = match[2] ? 1000 : 1;
  const absoluteAmount = Math.abs(Number(amountToken || 0) * multiplier);
  if (!absoluteAmount) return null;
  const label = cleanNotebookText(text.replace(match[0], " "), absoluteAmount) || "money note";
  const kind = inferKind(label, amountToken, "");
  const signed = kind === "income" ? absoluteAmount : -absoluteAmount;
  return normalizeLine({
    id: cryptoRandomId(),
    text: raw,
    canonicalText: `${label} = ${formatMoney(absoluteAmount, { cents: !Number.isInteger(absoluteAmount) })}`,
    kind,
    category: inferCategory(label, kind),
    amount: signed,
    confidence: 0.76,
    source,
    rawText: raw
  });
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
  if (/(?:x|×|\*)\s*\d/i.test(text) || /\bper\b/i.test(text)) return text.replace(/\s*x\s*/i, " x ");
  return formatMoney(absoluteAmount, { cents: !Number.isInteger(absoluteAmount) });
}

function inferKind(label, amountText, fallbackKind) {
  if (fallbackKind === "income") return "income";
  if (String(amountText || "").startsWith("+")) return "income";
  if (String(amountText || "").startsWith("-")) return "expense";
  if (/\b(salary|freelance|income|paycheck|revenue|budget|paid|invoice)\b/i.test(label)) return "income";
  return "expense";
}

function inferCategory(label, kind) {
  if (kind === "income") return "income";
  if (kind === "calculation") return "calculation";
  if (kind === "note") return "note";
  if (/\b(food|lunch|dinner|coffee|ramen|restaurant|grocery|groceries|meal|cafe|tea|sushi)\b/i.test(label)) return "food";
  if (/\b(uber|lyft|taxi|train|bus|flight|airport|fuel|gas|parking)\b/i.test(label)) return "transport";
  if (/\b(rent|hotel|mortgage|utilities|phone|internet)\b/i.test(label)) return "housing";
  if (/\b(ad|ads|amazon|shopping|tools|software|store|shirt|clothes|shoes|book)\b/i.test(label)) return "shopping";
  if (/\b(doctor|medicine|pharmacy|gym|clinic)\b/i.test(label)) return "health";
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

function normalizeAmount(value, kind) {
  const amount = Number(value || 0);
  if (kind === "income") return Math.abs(amount);
  if (kind === "expense") return -Math.abs(amount);
  if (kind === "note") return 0;
  return Number(amount.toFixed(2));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function cryptoRandomId() {
  return globalThis.crypto?.randomUUID?.() || `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
