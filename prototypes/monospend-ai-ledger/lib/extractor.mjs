const CATEGORY_KEYWORDS = {
  food: ["coffee", "lunch", "dinner", "ramen", "restaurant", "sandwich", "grocery", "groceries", "meal", "cafe", "tea"],
  transport: ["uber", "lyft", "taxi", "train", "bus", "subway", "airport", "fuel", "gas", "parking"],
  housing: ["rent", "mortgage", "utilities", "electric", "water", "internet"],
  shopping: ["amazon", "target", "store", "shirt", "clothes", "shoes", "book"],
  health: ["pharmacy", "doctor", "clinic", "medicine", "gym"],
  income: ["salary", "paycheck", "income", "paid", "invoice"],
  other: []
};

const CURRENCY_SYMBOLS = {
  "$": "USD",
  "¥": "JPY",
  "€": "EUR",
  "£": "GBP"
};

const REQUIRED_FIELDS = ["date", "amount", "currency", "merchant", "category", "note", "source", "confidence", "ledgerLine"];

export const extractionSchema = {
  type: "object",
  additionalProperties: false,
  required: REQUIRED_FIELDS,
  properties: {
    date: { type: "string" },
    amount: { type: "number" },
    currency: { type: "string" },
    merchant: { type: "string" },
    category: {
      type: "string",
      enum: ["food", "transport", "housing", "shopping", "health", "income", "other"]
    },
    note: { type: "string" },
    source: {
      type: "string",
      enum: ["text", "voice", "photo"]
    },
    confidence: { type: "number" },
    ledgerLine: { type: "string" }
  }
};

export function todayIso(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeSource(source) {
  return ["text", "voice", "photo"].includes(source) ? source : "text";
}

export function detectCurrency(text) {
  for (const [symbol, code] of Object.entries(CURRENCY_SYMBOLS)) {
    if (text.includes(symbol)) return code;
  }
  if (/\b(jpy|yen)\b/i.test(text)) return "JPY";
  if (/\b(eur|euro)\b/i.test(text)) return "EUR";
  if (/\b(gbp|pound)\b/i.test(text)) return "GBP";
  return "USD";
}

export function detectCategory(text) {
  const lowered = text.toLowerCase();
  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some(word => lowered.includes(word))) return category;
  }
  return "other";
}

export function parseAmount(text) {
  const multiplication = text.match(/(?:[$¥€£]\s*)?(\d+(?:\.\d{1,2})?)\s*(?:x|\*)\s*(\d+(?:\.\d{1,2})?)/i);
  if (multiplication) {
    return Number((Number(multiplication[1]) * Number(multiplication[2])).toFixed(2));
  }

  const symbolAmount = text.match(/[$¥€£]\s*(\d+(?:\.\d{1,2})?)/);
  if (symbolAmount) return Number(symbolAmount[1]);

  const amountCurrency = text.match(/\b(\d+(?:\.\d{1,2})?)\s*(?:usd|dollars?|jpy|yen|eur|euro|gbp|pounds?)\b/i);
  if (amountCurrency) return Number(amountCurrency[1]);

  const numbers = [...text.matchAll(/\b\d+(?:\.\d{1,2})?\b/g)].map(match => Number(match[0]));
  if (!numbers.length) return 0;
  return numbers[numbers.length - 1];
}

export function parseDate(text, now = new Date()) {
  const iso = text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso) {
    const [, year, month, day] = iso;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (/\byesterday\b/i.test(text)) {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    return todayIso(date);
  }

  return todayIso(now);
}

export function inferMerchant(text) {
  const atMatch = text.match(/\b(?:at|@)\s+([a-z0-9&.' -]{2,32})/i);
  if (atMatch) return cleanMerchant(atMatch[1]);

  const known = [
    "starbucks",
    "uber",
    "amazon",
    "target",
    "costco",
    "whole foods",
    "ramen house",
    "mcdonald",
    "apple"
  ];
  const lowered = text.toLowerCase();
  const found = known.find(item => lowered.includes(item));
  return found ? titleCase(found) : "";
}

export function cleanMerchant(value) {
  return titleCase(value.replace(/\b(for|with|on|yesterday|today)\b.*$/i, "").trim());
}

export function titleCase(value) {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function cleanNote(text) {
  return text
    .replace(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/g, "")
    .replace(/\byesterday\b|\btoday\b/gi, "")
    .replace(/[$¥€£]\s*\d+(?:\.\d{1,2})?/g, "")
    .replace(/\b\d+(?:\.\d{1,2})?\s*(?:usd|dollars?|jpy|yen|eur|euro|gbp|pounds?)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function buildLedgerLine(entry) {
  const amount = Number(entry.amount || 0).toFixed(2);
  const merchant = entry.merchant ? ` @${entry.merchant.replace(/\s+/g, "")}` : "";
  const note = entry.note || entry.category || "expense";
  return `${entry.date} ${note} ${entry.currency} ${amount} #${entry.category}${merchant}`;
}

export function validateExtraction(value) {
  const errors = [];
  if (!value || typeof value !== "object") return { ok: false, errors: ["Extraction must be an object"] };

  for (const field of REQUIRED_FIELDS) {
    if (!(field in value)) errors.push(`Missing ${field}`);
  }

  if (typeof value.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)) errors.push("date must be YYYY-MM-DD");
  if (typeof value.amount !== "number" || Number.isNaN(value.amount) || value.amount < 0) errors.push("amount must be a non-negative number");
  if (typeof value.currency !== "string" || value.currency.length < 3) errors.push("currency must be a code");
  if (!extractionSchema.properties.category.enum.includes(value.category)) errors.push("category is invalid");
  if (!extractionSchema.properties.source.enum.includes(value.source)) errors.push("source is invalid");
  if (typeof value.confidence !== "number" || value.confidence < 0 || value.confidence > 1) errors.push("confidence must be between 0 and 1");
  if (typeof value.ledgerLine !== "string" || value.ledgerLine.length < 12) errors.push("ledgerLine is too short");

  return { ok: errors.length === 0, errors };
}

export function localExtractExpense({ text = "", source = "text", now = new Date() }) {
  const normalizedSource = normalizeSource(source);
  const input = String(text || "").trim();
  const amount = parseAmount(input);
  const currency = detectCurrency(input);
  const category = amount > 0 ? detectCategory(input) : "other";
  const date = parseDate(input, now);
  const merchant = inferMerchant(input);
  const note = cleanNote(input) || (merchant ? merchant.toLowerCase() : "expense");
  const confidence = amount > 0 ? 0.72 : 0.28;
  const draft = {
    date,
    amount,
    currency,
    merchant,
    category,
    note,
    source: normalizedSource,
    confidence,
    ledgerLine: ""
  };
  draft.ledgerLine = buildLedgerLine(draft);
  return draft;
}

export function sanitizeExtraction(value, fallback = {}) {
  const entry = {
    date: typeof value?.date === "string" ? value.date : todayIso(),
    amount: Number(value?.amount || 0),
    currency: typeof value?.currency === "string" ? value.currency.toUpperCase().slice(0, 8) : "USD",
    merchant: typeof value?.merchant === "string" ? value.merchant.trim().slice(0, 80) : "",
    category: extractionSchema.properties.category.enum.includes(value?.category) ? value.category : "other",
    note: typeof value?.note === "string" ? value.note.trim().slice(0, 120) : "expense",
    source: normalizeSource(value?.source || fallback.source),
    confidence: Math.max(0, Math.min(1, Number(value?.confidence || 0.5))),
    ledgerLine: typeof value?.ledgerLine === "string" ? value.ledgerLine.trim().slice(0, 240) : ""
  };
  entry.ledgerLine = entry.ledgerLine || buildLedgerLine(entry);
  return entry;
}
