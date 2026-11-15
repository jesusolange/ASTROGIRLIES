"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Store = require("../src/scripts/storage.js");

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

test("set notifies listeners; export holds only app keys", () => {
  const s = Store.create(fake());
  let calls = 0;
  s.subscribe(() => calls++);
  s.set("astromed-a", 1);
  assert.equal(calls, 1);
  assert.deepEqual(Object.keys(s.exportAll().data), ["astromed-a"]);
});

test("every app key lives under the active person and reads back with the plain key", () => {
  const st = fake();
  const s = Store.create(st);
  s.setActive("p1");
  s.set("astromed-profile", { name: "A" });
  assert.equal(st.getItem("astromed-p:p1:astromed-profile"), '{"name":"A"}');
  assert.deepEqual(s.get("astromed-profile"), { name: "A" });
  assert.deepEqual(s.appKeys(), ["astromed-profile"]);
  s.setActive("p2");
  assert.equal(s.get("astromed-profile", null), null);
  assert.deepEqual(s.appKeys(), []);
});

test("one person's export imports into another person's records without touching the first", () => {
  const st = fake();
  const s = Store.create(st);
  s.setActive("a");
  s.set("astromed-a", 1);
  const file = JSON.stringify(s.exportAll());
  s.setActive("b");
  s.importAll(file);
  assert.equal(s.get("astromed-a"), 1);
  s.setActive("a");
  assert.equal(s.get("astromed-a"), 1);
  s.set("astromed-a", 2);
  s.setActive("c");
  assert.equal(s.get("astromed-a", null), null);
});

test("a file written before people existed becomes the first person's data", () => {
  const st = fake({
    "astromed-profile": '{"name":"Ada"}',
    "astrotwin-exercise-sessions": "[1]",
  });
  const s = Store.create(st);
  assert.equal(s.hasLegacyData(), true);
  assert.equal(s.migrateLegacy("p1"), 2);
  s.setActive("p1");
  assert.deepEqual(s.get("astromed-profile"), { name: "Ada" });
  assert.deepEqual(s.get("astrotwin-exercise-sessions"), [1]);
  assert.equal(s.hasLegacyData(), false);
  assert.equal(st.getItem("astromed-profile"), null);
  assert.deepEqual(Object.keys(s.exportAll().data).sort(), ["astromed-profile", "astrotwin-exercise-sessions"]);
});

test("migration leaves an empty device untouched and never moves the people list", () => {
  const st = fake({ "astromed-people": '[{"id":"p1","name":"Ada"}]' });
  const s = Store.create(st);
  assert.equal(s.hasLegacyData(), false);
  assert.equal(s.migrateLegacy("p2"), 0);
  assert.equal(st.getItem("astromed-people"), '[{"id":"p1","name":"Ada"}]');
});

test("peek at another person's record, and remove only that person", () => {
  const st = fake();
  const s = Store.create(st);
  s.setActive("a");
  s.set("astromed-x", "a");
  s.setActive("b");
  s.set("astromed-x", "b");
  assert.equal(s.getFor("a", "astromed-x"), "a");
  assert.equal(s.removePerson("a"), 1);
  assert.equal(s.getFor("a", "astromed-x", null), null);
  s.setActive("b");
  assert.equal(s.get("astromed-x"), "b");
  s.setActive("a");
  assert.equal(s.get("astromed-x", null), null);
});
