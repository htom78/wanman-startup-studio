#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLedgerLine,
  extractionSchema,
  localExtractExpense,
  sanitizeExtraction,
  todayIso,
  validateExtraction
} from "./lib/extractor.mjs";
import {
  composeLocalNotebookLines,
  createFolder,
  createNotebook,
  defaultNotebookState,
  notebookComposeSchema,
  normalizeComposedLines,
  normalizeLine,
  normalizeSource,
  reclassifyLineIntent
} from "./lib/notebook.mjs";
import { createNotebookStore } from "./lib/notebook-store.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");

function parseEnvValue(value) {
  const trimmed = String(value || "").trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadLocalEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = parseEnvValue(rawValue);
  }
}

[
  path.join(__dirname, ".env.local"),
  path.join(__dirname, ".env"),
  path.join(projectRoot, ".env.local"),
  path.join(projectRoot, ".env")
].forEach(loadLocalEnvFile);

const publicDir = path.join(__dirname, "public");
const dataFile = process.env.MONOSPEND_DATA_FILE || path.join(__dirname, "data", "notebooks.json");
const port = Number(process.env.PORT || 4177);
const provider = process.env.MONOSPEND_AI_PROVIDER || "local";
const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
const openrouterModel = process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || "deepseek/deepseek-v4-pro";
const store = createNotebookStore(dataFile);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 6_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const rawPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const resolved = path.normalize(path.join(publicDir, rawPath));
  if (!resolved.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(resolved, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(resolved)] || "application/octet-stream" });
    res.end(req.method === "HEAD" ? undefined : content);
  });
}

function buildPrompt({ text, source, hasImage }) {
  const currentDate = todayIso();
  return [
    "Extract one personal expense or income event for MonoSpend.",
    "Return only fields that match the schema.",
    `Today's date is ${currentDate}. If date is unknown, use exactly ${currentDate}.`,
    "If information is missing, use an empty string for merchant/note and amount 0 for missing amount.",
    "Currency rules: 元, RMB, CNY, or 人民币 means CNY. yen or JPY means JPY. If no currency is stated, use USD.",
    "For expressions like 5.50 x 2 or 55 + 25% tip, compute the final amount.",
    "The saved record must be a readable notepad ledger line.",
    `Source: ${source}`,
    hasImage ? "The user included a receipt or spending image." : "",
    `User text or transcript: ${text || "(none)"}`
  ].filter(Boolean).join("\n");
}

function extractOutputText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function extractChatMessageText(response) {
  const content = response?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map(part => typeof part?.text === "string" ? part.text : "")
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function openrouterHeaders() {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
  };
  if (process.env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  headers["X-OpenRouter-Title"] = process.env.OPENROUTER_APP_TITLE || "MonoSpend AI Notebook";
  return headers;
}

async function openrouterJsonRequest({ prompt, schemaName, schema, imageData }) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is required for MONOSPEND_AI_PROVIDER=openrouter");
  }

  const content = imageData
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageData } }
      ]
    : prompt;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: openrouterHeaders(),
    body: JSON.stringify({
      model: openrouterModel,
      messages: [{ role: "user", content }],
      temperature: 0.1,
      max_tokens: 1200,
      provider: { require_parameters: true },
      response_format: {
        type: "json_schema",
        json_schema: {
          name: schemaName,
          strict: true,
          schema
        }
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${details.slice(0, 400)}`);
  }

  const json = await response.json();
  const outputText = extractChatMessageText(json);
  if (!outputText) throw new Error("OpenRouter response did not include message content");
  return JSON.parse(outputText);
}

async function openaiExtract({ text, source, imageData }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for MONOSPEND_AI_PROVIDER=openai");

  const content = [{ type: "input_text", text: buildPrompt({ text, source, hasImage: Boolean(imageData) }) }];
  if (imageData) content.push({ type: "input_image", image_url: imageData });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: openaiModel,
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: "monospend_expense_extraction",
          schema: extractionSchema,
          strict: true
        }
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI extraction failed (${response.status}): ${details.slice(0, 400)}`);
  }

  const json = await response.json();
  const outputText = extractOutputText(json);
  if (!outputText) throw new Error("OpenAI response did not include output text");
  const parsed = JSON.parse(outputText);
  const sanitized = sanitizeExtraction(parsed, { source });
  sanitized.ledgerLine = buildLedgerLine(sanitized);
  return sanitized;
}

async function openrouterExtract({ text, source, imageData }) {
  const parsed = await openrouterJsonRequest({
    prompt: buildPrompt({ text, source, hasImage: Boolean(imageData) }),
    schemaName: "monospend_expense_extraction",
    schema: extractionSchema,
    imageData
  });
  const sanitized = sanitizeExtraction(parsed, { source });
  sanitized.ledgerLine = buildLedgerLine(sanitized);
  return sanitized;
}

function providerLabel() {
  if (provider === "openai") return `openai:${openaiModel}`;
  if (provider === "openrouter") return `openrouter:${openrouterModel}`;
  return "local";
}

function compactNotebookForPrompt(notebook) {
  return (notebook.lines || []).map(item => ({
    text: item.canonicalText || item.text,
    kind: item.kind,
    amount: Number(item.amount || 0),
    query: item.query || ""
  }));
}

function buildComposePrompt({ raw, source, hasImage, notebook }) {
  return [
    "You are the AI composer for MonoSpend, an AI money notebook.",
    "The user's left-column input is the only source of truth.",
    "Return canonical notebook lines for the user's latest input.",
    "Rules:",
    "- If the input has no money amount and is not asking for a calculation, return one note line with kind note and amount 0.",
    "- If the input has a money amount, infer whether it is income or expense. Income amounts are positive; expense amounts are negative.",
    "- If the input contains standalone time, date, person, or scene context plus a money fact, split it into multiple lines: first a note line for the context, then the money line. Example: 昨天晚上我和王智一起出去玩了，吃了 100 块，两人 AA -> note: 昨天晚上和王智出去玩; expense: 和王智吃饭 AA = ¥50.",
    "- Do not make standalone notes for filler words. Only create a note when the context would help the notebook make sense later.",
    "- If the input asks to calculate remaining, total cost, total income, or to settle/check the account, return a calculation line. The server will recompute the amount from notebook state.",
    "- Chinese calculation intents: 帮我算一下 / 算一下 / 算一下账 / 算账 / 统计一下 / 汇总一下 / 总共花了多少 / 总花费 / 总支出 => query totalCost. 还剩多少 / 剩余 / 余额 => query remaining. 总收入 / 收入合计 => query totalIncome.",
    "- The right-column result is derived output, not user-entered text.",
    "- Keep canonicalText short and notebook-like, for example: lunch = $15.50 or calculate remaining.",
    "- Preserve the user's language in canonicalText when possible.",
    "- Currency hints: 元/RMB/CNY/人民币 means CNY; yen/JPY means JPY; if no currency is stated, default to USD.",
    `Source: ${source}`,
    hasImage ? "The user included a receipt or spending image." : "",
    `Current notebook title: ${notebook.title}`,
    `Current notebook lines JSON: ${JSON.stringify(compactNotebookForPrompt(notebook))}`,
    `Latest user input: ${raw || "(none)"}`
  ].filter(Boolean).join("\n");
}

async function openaiComposeNotebookLines({ raw, source, imageData, notebook }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for MONOSPEND_AI_PROVIDER=openai");

  const content = [{
    type: "input_text",
    text: buildComposePrompt({ raw, source, hasImage: Boolean(imageData), notebook })
  }];
  if (imageData) content.push({ type: "input_image", image_url: imageData });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: openaiModel,
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: "monospend_notebook_compose",
          schema: notebookComposeSchema,
          strict: true
        }
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI compose failed (${response.status}): ${details.slice(0, 400)}`);
  }

  const json = await response.json();
  const outputText = extractOutputText(json);
  if (!outputText) throw new Error("OpenAI response did not include output text");
  const parsed = JSON.parse(outputText);
  return normalizeComposedLines({ lines: parsed.lines, raw, notebook, source });
}

async function openrouterComposeNotebookLines({ raw, source, imageData, notebook }) {
  const parsed = await openrouterJsonRequest({
    prompt: buildComposePrompt({ raw, source, hasImage: Boolean(imageData), notebook }),
    schemaName: "monospend_notebook_compose",
    schema: notebookComposeSchema,
    imageData
  });
  return normalizeComposedLines({ lines: parsed.lines, raw, notebook, source });
}

async function composeNotebookLines({ raw, source, imageData, notebook }) {
  if (provider === "openai") {
    return {
      provider: providerLabel(),
      lines: await openaiComposeNotebookLines({ raw, source, imageData, notebook })
    };
  }

  if (provider === "openrouter") {
    return {
      provider: providerLabel(),
      lines: await openrouterComposeNotebookLines({ raw, source, imageData, notebook })
    };
  }

  if (imageData && !raw) {
    throw new Error("Local mode cannot read receipt images. Add receipt text or run with MONOSPEND_AI_PROVIDER=openai or openrouter.");
  }

  return {
    provider: providerLabel(),
    lines: composeLocalNotebookLines({ raw, notebook, source })
  };
}

function findNotebook(state, notebookId) {
  return state.notebooks.find(notebook => notebook.id === notebookId);
}

function uniqueFolderId(folder, folders) {
  const baseId = folder.id || "folder";
  let id = baseId;
  let suffix = 2;
  while (folders.some(item => item.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  return id;
}

async function handleState(req, res) {
  const state = await store.read();
  sendJson(res, 200, {
    provider: providerLabel(),
    model: provider === "openai" ? openaiModel : provider === "openrouter" ? openrouterModel : "local-heuristic",
    activeFolderId: state.activeFolderId,
    activeNotebookId: state.activeNotebookId,
    folders: state.folders,
    notebooks: state.notebooks
  });
}

async function handleCreateFolder(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const { state, result } = await store.update(currentState => {
    const folder = createFolder(payload.title || `Folder ${currentState.folders.length + 1}`);
    folder.id = uniqueFolderId(folder, currentState.folders);
    currentState.folders.push(folder);
    currentState.activeFolderId = folder.id;
    return { folder };
  });
  sendJson(res, 201, {
    folder: result.folder,
    activeFolderId: state.activeFolderId,
    folders: state.folders
  });
}

async function handleCreateNotebook(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const { state, result } = await store.update(currentState => {
    const requestedFolderId = typeof payload.folderId === "string" ? payload.folderId : "";
    const activeFolderId = currentState.folders.some(folder => folder.id === requestedFolderId)
      ? requestedFolderId
      : currentState.activeFolderId;
    const notebook = createNotebook(payload.title || `Notebook ${currentState.notebooks.length + 1}`, activeFolderId);
    currentState.notebooks.push(notebook);
    currentState.activeFolderId = notebook.folderId;
    currentState.activeNotebookId = notebook.id;
    return { notebook };
  });
  sendJson(res, 201, {
    notebook: result.notebook,
    activeFolderId: state.activeFolderId,
    activeNotebookId: state.activeNotebookId
  });
}

async function handleReset(req, res) {
  const { state } = await store.update(currentState => {
    const resetState = defaultNotebookState();
    currentState.activeFolderId = resetState.activeFolderId;
    currentState.activeNotebookId = resetState.activeNotebookId;
    currentState.folders = resetState.folders;
    currentState.notebooks = resetState.notebooks;
  });
  sendJson(res, 200, {
    provider: providerLabel(),
    activeFolderId: state.activeFolderId,
    activeNotebookId: state.activeNotebookId,
    folders: state.folders,
    notebooks: state.notebooks
  });
}

async function handleUpdateNotebook(req, res, notebookId) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const { state, result } = await store.update(currentState => {
    const notebook = findNotebook(currentState, notebookId);
    if (!notebook) return { error: "Notebook not found" };

    if (typeof payload.title === "string") {
      notebook.title = payload.title.trim() || "Untitled";
    }
    if (typeof payload.folderId === "string" && currentState.folders.some(folder => folder.id === payload.folderId)) {
      notebook.folderId = payload.folderId;
    }
    if (payload.active === true) {
      currentState.activeFolderId = notebook.folderId;
      currentState.activeNotebookId = notebook.id;
    }
    return { notebook };
  });
  if (result.error) {
    sendJson(res, 404, { error: "Notebook not found" });
    return;
  }

  sendJson(res, 200, {
    notebook: result.notebook,
    activeFolderId: state.activeFolderId,
    activeNotebookId: state.activeNotebookId
  });
}

async function handleClearNotebook(req, res, notebookId) {
  const { result } = await store.update(currentState => {
    const notebook = findNotebook(currentState, notebookId);
    if (!notebook) return { error: "Notebook not found" };
    notebook.lines = [];
    currentState.activeFolderId = notebook.folderId;
    currentState.activeNotebookId = notebook.id;
    return { notebook };
  });
  if (result.error) {
    sendJson(res, 404, { error: "Notebook not found" });
    return;
  }
  sendJson(res, 200, { notebook: result.notebook });
}

async function handleDeleteNotebookLine(req, res, notebookId, lineId) {
  const { result } = await store.update(currentState => {
    const notebook = findNotebook(currentState, notebookId);
    if (!notebook) return { status: 404, error: "Notebook not found" };

    const lineIndex = notebook.lines.findIndex(item => item.id === lineId);
    if (lineIndex < 0) return { status: 404, error: "Notebook line not found" };

    const [deletedLine] = notebook.lines.splice(lineIndex, 1);
    currentState.activeFolderId = notebook.folderId;
    currentState.activeNotebookId = notebook.id;
    return { notebook, deletedLine };
  });

  if (result.error) {
    sendJson(res, result.status || 500, { error: result.error });
    return;
  }

  sendJson(res, 200, { notebook: result.notebook, deletedLine: result.deletedLine });
}

async function handleReclassifyNotebookLine(req, res, notebookId, lineId) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const { result } = await store.update(currentState => {
    const notebook = findNotebook(currentState, notebookId);
    if (!notebook) return { status: 404, error: "Notebook not found" };

    const lineIndex = notebook.lines.findIndex(item => item.id === lineId);
    if (lineIndex < 0) return { status: 404, error: "Notebook line not found" };

    const line = reclassifyLineIntent({
      line: notebook.lines[lineIndex],
      notebook,
      intent: payload.intent,
      query: payload.query
    });
    if (!line) return { status: 422, error: "Unsupported intent" };

    notebook.lines.splice(lineIndex, 1, line);
    currentState.activeFolderId = notebook.folderId;
    currentState.activeNotebookId = notebook.id;
    return {
      notebook,
      line,
      correction: {
        from: lineId,
        intent: payload.intent,
        query: payload.query || "",
        source: "user_override"
      }
    };
  });

  if (result.error) {
    sendJson(res, result.status || 500, { error: result.error });
    return;
  }

  sendJson(res, 200, result);
}

async function handleUpdateNotebookLineText(req, res, notebookId, lineId) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const text = String(payload.text || "").trim();
  if (!text) {
    sendJson(res, 422, { error: "Line text is required" });
    return;
  }

  const { result } = await store.update(currentState => {
    const notebook = findNotebook(currentState, notebookId);
    if (!notebook) return { status: 404, error: "Notebook not found" };

    const lineIndex = notebook.lines.findIndex(item => item.id === lineId);
    if (lineIndex < 0) return { status: 404, error: "Notebook line not found" };

    const line = normalizeLine({
      ...notebook.lines[lineIndex],
      text,
      canonicalText: text,
      rawText: text,
      meta: "text edited"
    });
    notebook.lines.splice(lineIndex, 1, line);
    currentState.activeFolderId = notebook.folderId;
    currentState.activeNotebookId = notebook.id;
    return {
      notebook,
      line,
      correction: {
        lineId,
        source: "text_only_edit"
      }
    };
  });

  if (result.error) {
    sendJson(res, result.status || 500, { error: result.error });
    return;
  }

  sendJson(res, 200, result);
}

async function parseComposePayload(req) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const raw = [payload.text, payload.transcript, payload.receiptText].filter(Boolean).join("\n").trim();
  const imageData = typeof payload.imageData === "string" && payload.imageData.startsWith("data:image/")
    ? payload.imageData
    : "";
  const source = normalizeSource(payload.source || "text");

  return { raw, imageData, source };
}

async function handleCompose(req, res, notebookId) {
  const { raw, imageData, source } = await parseComposePayload(req);
  if (!raw && !imageData) {
    sendJson(res, 400, { error: "Add text, a transcript, receipt notes, or an image." });
    return;
  }

  const { result } = await store.update(async currentState => {
    const notebook = findNotebook(currentState, notebookId);
    if (!notebook) return { error: "Notebook not found" };

    const composeResult = await composeNotebookLines({ raw, source, imageData, notebook });
    notebook.lines.push(...composeResult.lines);
    currentState.activeFolderId = notebook.folderId;
    currentState.activeNotebookId = notebook.id;

    return {
      provider: composeResult.provider,
      notebook,
      lines: composeResult.lines,
      composer: {
        raw,
        canonical: composeResult.lines.map(item => item.canonicalText).join(" / ")
      }
    };
  });
  if (result.error) {
    sendJson(res, 404, { error: "Notebook not found" });
    return;
  }

  sendJson(res, 200, result);
}

async function handleRecomposeLine(req, res, notebookId, lineId) {
  const { raw, imageData, source } = await parseComposePayload(req);
  if (!raw && !imageData) {
    sendJson(res, 400, { error: "Add text, a transcript, receipt notes, or an image." });
    return;
  }

  const { result } = await store.update(async currentState => {
    const notebook = findNotebook(currentState, notebookId);
    if (!notebook) return { status: 404, error: "Notebook not found" };

    const lineIndex = notebook.lines.findIndex(item => item.id === lineId);
    if (lineIndex < 0) return { status: 404, error: "Notebook line not found" };

    const scopedNotebook = {
      ...notebook,
      lines: notebook.lines.filter(item => item.id !== lineId)
    };
    const composeResult = await composeNotebookLines({ raw, source, imageData, notebook: scopedNotebook });
    if (!composeResult.lines.length) return { status: 422, error: "AI compose returned no note" };

    notebook.lines.splice(lineIndex, 1, ...composeResult.lines);
    currentState.activeFolderId = notebook.folderId;
    currentState.activeNotebookId = notebook.id;

    return {
      provider: composeResult.provider,
      notebook,
      lines: composeResult.lines,
      replacedLineId: lineId,
      composer: {
        raw,
        canonical: composeResult.lines.map(item => item.canonicalText).join(" / ")
      }
    };
  });

  if (result.error) {
    sendJson(res, result.status || 500, { error: result.error });
    return;
  }

  sendJson(res, 200, result);
}

async function handleExtract(req, res) {
  try {
    const body = await readBody(req);
    const payload = JSON.parse(body || "{}");
    const source = payload.source || "text";
    const text = [payload.text, payload.transcript, payload.receiptText].filter(Boolean).join("\n").trim();
    const imageData = typeof payload.imageData === "string" && payload.imageData.startsWith("data:image/")
      ? payload.imageData
      : "";

    if (!text && !imageData) {
      sendJson(res, 400, { error: "Add text, a transcript, receipt notes, or an image." });
      return;
    }

    let extraction;
    let usedProvider = "local";
    if (provider === "openai") {
      extraction = await openaiExtract({ text, source, imageData });
      usedProvider = `openai:${openaiModel}`;
    } else if (provider === "openrouter") {
      extraction = await openrouterExtract({ text, source, imageData });
      usedProvider = providerLabel();
    } else {
      if (imageData && !text) {
        sendJson(res, 422, {
          error: "Local mode cannot read receipt images. Add receipt text or run with MONOSPEND_AI_PROVIDER=openai or openrouter."
        });
        return;
      }
      extraction = localExtractExpense({ text, source });
    }

    const validation = validateExtraction(extraction);
    if (!validation.ok) {
      sendJson(res, 422, { error: "Extraction failed validation", details: validation.errors, extraction });
      return;
    }

    sendJson(res, 200, { provider: usedProvider, extraction });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const notebookRoute = url.pathname.match(/^\/api\/notebooks\/([^/]+)$/);
  const composeRoute = url.pathname.match(/^\/api\/notebooks\/([^/]+)\/compose$/);
  const lineComposeRoute = url.pathname.match(/^\/api\/notebooks\/([^/]+)\/lines\/([^/]+)\/compose$/);
  const lineIntentRoute = url.pathname.match(/^\/api\/notebooks\/([^/]+)\/lines\/([^/]+)\/intent$/);
  const lineTextRoute = url.pathname.match(/^\/api\/notebooks\/([^/]+)\/lines\/([^/]+)\/text$/);
  const lineRoute = url.pathname.match(/^\/api\/notebooks\/([^/]+)\/lines\/([^/]+)$/);
  const clearRoute = url.pathname.match(/^\/api\/notebooks\/([^/]+)\/lines$/);

  try {
    if (req.method === "GET" && url.pathname === "/api/state") {
      handleState(req, res).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/notebooks") {
      handleCreateNotebook(req, res).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/folders") {
      handleCreateFolder(req, res).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/reset") {
      handleReset(req, res).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "PATCH" && notebookRoute) {
      handleUpdateNotebook(req, res, decodeURIComponent(notebookRoute[1])).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "DELETE" && clearRoute) {
      handleClearNotebook(req, res, decodeURIComponent(clearRoute[1])).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "DELETE" && lineRoute) {
      handleDeleteNotebookLine(
        req,
        res,
        decodeURIComponent(lineRoute[1]),
        decodeURIComponent(lineRoute[2])
      ).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "PATCH" && lineIntentRoute) {
      handleReclassifyNotebookLine(
        req,
        res,
        decodeURIComponent(lineIntentRoute[1]),
        decodeURIComponent(lineIntentRoute[2])
      ).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "PATCH" && lineTextRoute) {
      handleUpdateNotebookLineText(
        req,
        res,
        decodeURIComponent(lineTextRoute[1]),
        decodeURIComponent(lineTextRoute[2])
      ).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "POST" && composeRoute) {
      handleCompose(req, res, decodeURIComponent(composeRoute[1])).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "PATCH" && lineComposeRoute) {
      handleRecomposeLine(
        req,
        res,
        decodeURIComponent(lineComposeRoute[1]),
        decodeURIComponent(lineComposeRoute[2])
      ).catch(error => sendJson(res, 500, { error: error.message }));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/extract") {
      handleExtract(req, res);
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(req, res);
      return;
    }
  } catch (error) {
    sendJson(res, 500, { error: error.message });
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(port, () => {
  console.log(`MonoSpend AI Ledger prototype: http://localhost:${port}`);
  console.log(`Extractor provider: ${providerLabel()}`);
  console.log(`Notebook data: ${dataFile}`);
});
