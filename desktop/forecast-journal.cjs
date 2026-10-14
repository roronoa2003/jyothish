var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// desktop/journal-entry.mjs
var journal_entry_exports = {};
__export(journal_entry_exports, {
  ForecastJournal: () => ForecastJournal
});
module.exports = __toCommonJS(journal_entry_exports);
var import_promises = __toESM(require("node:fs/promises"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var import_node_crypto = __toESM(require("node:crypto"), 1);

// src/prediction-journal.js
function validateForecast(input) {
  if (!input || typeof input !== "object" || typeof input.profileId !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(input.profileId)) throw Error("A saved profile is required.");
  if (typeof input.event !== "string" || input.event.trim().length < 8 || input.event.length > 500) throw Error("Define a concrete event to check.");
  if (!["favors", "against", "unresolved"].includes(input.direction)) throw Error("Choose a forecast direction.");
  const windows = input.windows;
  if (!Array.isArray(windows) || !windows.length || windows.length > 3 || windows.some((w) => !Number.isFinite(w.start) || !Number.isFinite(w.end) || w.end <= w.start)) throw Error("Supply one to three valid date windows.");
  if (typeof input.answer !== "string" || input.answer.length > 15e3) throw Error("Invalid forecast answer.");
  return { ...input, event: input.event.trim(), windows: windows.map((w) => ({ start: w.start, end: w.end })), schema: 1 };
}
function appendObservation(record, observation, now = Date.now()) {
  if (!["occurred", "did_not_occur", "unclear"].includes(observation.result)) throw Error("Choose an observed result.");
  const close = Math.max(...record.windows.map((w) => w.end));
  if (observation.result === "did_not_occur" && now < close) throw Error("Wait until the forecast horizon has ended before recording a non-event.");
  if (observation.result === "occurred" && (!Number.isFinite(observation.occurredAt) || observation.occurredAt > now)) throw Error("Use an actual occurrence date, not a future event.");
  return { ...record, observations: [...record.observations || [], { result: observation.result, occurredAt: observation.result === "occurred" ? observation.occurredAt : null, recordedAt: now, note: String(observation.note || "").slice(0, 1e3) }] };
}

// desktop/journal-entry.mjs
var ForecastJournal = class {
  constructor(root) {
    this.file = import_node_path.default.join(root, "prediction-journal.json");
    this.queue = Promise.resolve();
  }
  async rows() {
    try {
      return JSON.parse(await import_promises.default.readFile(this.file, "utf8"));
    } catch (e) {
      if (e.code === "ENOENT") return [];
      throw e;
    }
  }
  hash(value) {
    return import_node_crypto.default.createHash("sha256").update(value).digest("hex");
  }
  async list() {
    return (await this.rows()).map((r) => ({ ...JSON.parse(r.payloadJSON), id: r.id, observations: r.observations || [], integrity: r.payloadHash === this.hash(r.payloadJSON) }));
  }
  mutate(fn) {
    const result = this.queue.then(async () => {
      const rows = await this.rows(), updated = await fn(rows);
      await import_promises.default.mkdir(import_node_path.default.dirname(this.file), { recursive: true, mode: 448 });
      await import_promises.default.writeFile(this.file + ".tmp", JSON.stringify(updated), { mode: 384 });
      await import_promises.default.rename(this.file + ".tmp", this.file);
      return this.list();
    });
    this.queue = result.catch(() => {
    });
    return result;
  }
  save(input) {
    const valid = validateForecast(input), snapshot = { ...valid, createdAt: Date.now() };
    const payloadJSON = JSON.stringify(snapshot), record = { id: import_node_crypto.default.randomUUID(), payloadJSON, payloadHash: this.hash(payloadJSON), observations: [] };
    return this.mutate((rows) => {
      if (rows.length >= 1e4) throw Error("Journal limit reached. Export an archive first.");
      return [...rows, record];
    });
  }
  observe(id, observation) {
    return this.mutate((rows) => {
      if (!rows.some((r) => r.id === id)) throw Error("Forecast not found.");
      return rows.map((r) => {
        if (r.id !== id) return r;
        if (r.payloadHash !== this.hash(r.payloadJSON)) throw Error("This forecast snapshot changed outside the app.");
        const updated = appendObservation({ ...JSON.parse(r.payloadJSON), observations: r.observations }, observation);
        return { ...r, observations: updated.observations };
      });
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ForecastJournal
});
