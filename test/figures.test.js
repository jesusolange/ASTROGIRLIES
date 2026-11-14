"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { FIGURES, figureById } = require("../src/data/figures.js");

const ROOT = path.join(__dirname, "..", "public");
const ALLOWED = [
  "CC BY-SA 3.0",
  "CC BY 4.0",
  "CC0 1.0",
  "Public domain (work of the U.S. Navy)",
];
const REQUIRED = ["id", "file", "title", "alt", "author", "sourceUrl", "licence", "licenceUrl", "accessed", "change", "use"];

test("every figure has an id, a file and complete credit fields", () => {
  const ids = new Set();
  for (const figure of FIGURES) {
    for (const key of REQUIRED) assert.ok(figure[key], `${figure.id || "?"} is missing ${key}`);
    assert.ok(!ids.has(figure.id), `duplicate id ${figure.id}`);
    ids.add(figure.id);
    assert.match(figure.sourceUrl, /^https:\/\/commons\.wikimedia\.org\//);
    assert.match(figure.licenceUrl, /^https:\/\//);
    assert.ok(ALLOWED.includes(figure.licence), `licence not allowed: ${figure.licence}`);
  }
});

test("every figure file exists and stays under the size limit", () => {
  for (const figure of FIGURES) {
    const file = path.join(ROOT, figure.file.replace(/^\//, ""));
    assert.ok(fs.existsSync(file), `missing ${figure.file}`);
    if (/\.(png|jpe?g)$/i.test(figure.file)) {
      assert.ok(fs.statSync(file).size <= 400 * 1024, `${figure.file} is over 400 KB`);
    }
  }
});

test("figureById returns a figure or null", () => {
  assert.equal(figureById("heart").title, "Human heart");
  assert.equal(figureById("not-a-figure"), null);
});
