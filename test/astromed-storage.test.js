"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Store = require("../astromed-storage.js");

const fake = (init = {}) => {
  const m = new Map(Object.entries(init));
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _m: m,
  };
};

test("get returns fallback for missing or corrupt values", () => {
  const s = Store.create(fake({ "astromed-bad": "{oops" }));
  assert.equal(s.get("astromed-none", 5), 5);
  assert.deepEqual(s.get("astromed-bad", []), []);
});

test("set then get round-trips JSON", () => {
  const s = Store.create(fake());
  s.set("astromed-profile", { name: "A" });
  assert.deepEqual(s.get("astromed-profile"), { name: "A" });
});

test("export includes only app keys and a version header", () => {
  const s = Store.create(fake({
    "astromed-profile": '{"name":"A"}',
    "astrotwin-exercise-sessions": "[1]",
    "unrelated": "x",
  }));
  const out = s.exportAll();
  assert.equal(out.app, "astromed");
  assert.equal(out.version, Store.VERSION);
  assert.deepEqual(Object.keys(out.data).sort(), ["astromed-profile", "astrotwin-exercise-sessions"]);
  assert.deepEqual(out.data["astromed-profile"], { name: "A" });
});

test("import restores exported data into an empty store", () => {
  const a = Store.create(fake({ "astromed-profile": '{"name":"A"}' }));
  const b = Store.create(fake());
  const n = b.importAll(JSON.stringify(a.exportAll()));
  assert.equal(n, 1);
  assert.deepEqual(b.get("astromed-profile"), { name: "A" });
});

test("import replaces existing app keys but leaves unrelated keys", () => {
  const st = fake({ "astromed-old": "1", "unrelated": "x" });
  const s = Store.create(st);
  s.importAll(JSON.stringify({ app: "astromed", version: Store.VERSION, data: { "astromed-new": 2 } }));
  assert.equal(st.getItem("astromed-old"), null);
  assert.equal(st.getItem("unrelated"), "x");
  assert.equal(s.get("astromed-new"), 2);
});

test("import rejects bad input without touching data", () => {
  const st = fake({ "astromed-keep": "1" });
  const s = Store.create(st);
  assert.throws(() => s.importAll("not json"), /valid/i);
  assert.throws(() => s.importAll(JSON.stringify({ app: "other", version: 1, data: {} })), /AstroMed/);
  assert.throws(() => s.importAll(JSON.stringify({ app: "astromed", version: Store.VERSION + 1, data: {} })), /newer/i);
  assert.throws(() => s.importAll(JSON.stringify({ app: "astromed", version: 1, data: { evil: 1 } })), /key/i);
  assert.equal(st.getItem("astromed-keep"), "1");
});

test("migrations run for older versions", () => {
  const s = Store.create(fake(), { migrations: { 1: (d) => ({ ...d, "astromed-added": true }) } });
  const orig = Store.VERSION;
  s.importAll(JSON.stringify({ app: "astromed", version: 0, data: {} }));
  assert.equal(s.get("astromed-added"), true);
  assert.equal(Store.VERSION, orig);
});

test("memoryStorage works as a fallback backend", () => {
  const s = Store.create(Store.memoryStorage());
  s.set("astromed-x", { a: 1 });
  assert.deepEqual(s.get("astromed-x"), { a: 1 });
  assert.deepEqual(s.appKeys(), ["astromed-x"]);
});

test("a failed import write keeps the previous data", () => {
  const st = fake({ "astromed-keep": "1" });
  const realSet = st.setItem;
  st.setItem = (k, v) => { if (k === "astromed-new") throw new Error("quota"); realSet(k, v); };
  const s = Store.create(st);
  const origError = console.error; console.error = () => {};
  try {
    assert.throws(() => s.importAll(JSON.stringify({ app: "astromed", version: Store.VERSION, data: { "astromed-new": 1 } })), /previous data/);
  } finally { console.error = origError; }
  assert.equal(st.getItem("astromed-keep"), "1");
});
