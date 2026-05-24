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
  validateExtraction
} from "./lib/extractor.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 4177);
const provider = process.env.MONOSPEND_AI_PROVIDER || "local";
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

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
  return [
    "Extract one personal expense or income event for MonoSpend.",
    "Return only fields that match the schema.",
    "If information is missing, use an empty string for merchant/note, amount 0 for missing amount, and today's date if date is unknown.",
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
      model,
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
      usedProvider = `openai:${model}`;
    } else {
      if (imageData && !text) {
        sendJson(res, 422, {
          error: "Local mode cannot read receipt images. Add receipt text or run with MONOSPEND_AI_PROVIDER=openai."
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
  if (req.method === "POST" && req.url === "/api/extract") {
    handleExtract(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(port, () => {
  console.log(`MonoSpend AI Ledger prototype: http://localhost:${port}`);
  console.log(`Extractor provider: ${provider === "openai" ? `openai:${model}` : "local"}`);
});
