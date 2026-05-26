import fs from "node:fs/promises";
import path from "node:path";
import { defaultNotebookState, normalizeNotebookState } from "./notebook.mjs";

export function createNotebookStore(dataFile) {
  const filePath = dataFile;
  let writeQueue = Promise.resolve();

  async function readFromDisk() {
    try {
      const content = await fs.readFile(filePath, "utf8");
      return normalizeNotebookState(JSON.parse(content));
    } catch (error) {
      if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error;
      if (error instanceof SyntaxError) {
        await fs.rename(filePath, `${filePath}.corrupt-${Date.now()}`).catch(() => {});
      }
      const initial = defaultNotebookState();
      await write(initial);
      return initial;
    }
  }

  async function read() {
    return readFromDisk();
  }

  async function write(state) {
    const normalized = normalizeNotebookState(state);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
    return normalized;
  }

  async function update(mutator) {
    const operation = writeQueue.then(async () => {
      const state = await readFromDisk();
      const result = await mutator(state);
      const nextState = await write(state);
      return { state: nextState, result };
    });
    writeQueue = operation.catch(() => {});
    return operation;
  }

  return { read, write, update, filePath };
}
