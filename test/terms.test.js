import test from "node:test";
import assert from "node:assert/strict";
import { TERMS, definitionOf, hasTerm, termKey } from "../src/data/terms.js";

const REQUIRED = ["HRV", "ALARA", "ARED", "T2", "CEVIS", "N-telopeptide", "GCS", "SANS", "ICR"];

test("every required abbreviation has a definition", () => {
  for (const term of REQUIRED) {
    assert.ok(definitionOf(term), `missing definition for ${term}`);
  }
});

test("definitions are one sentence with no threshold or unit", () => {
  for (const [term, text] of Object.entries(TERMS)) {
    assert.match(text, /[A-Za-z]/, `${term} is empty`);
    assert.equal((text.match(/\./g) || []).length, 1, `${term} must be one sentence`);
    assert.ok(text.trim().endsWith("."), `${term} must end with a full stop`);
    assert.doesNotMatch(text, /%|\d+\s*(ms|mSv|mg|mmol|bpm|days?|hours?)/i, `${term} must not state a threshold`);
  }
});

test("lookup ignores case and surrounding spaces", () => {
  assert.equal(termKey("  hrv "), "HRV");
  assert.equal(definitionOf("sans"), TERMS.SANS);
  assert.equal(hasTerm("N-Telopeptide"), true);
  assert.equal(definitionOf("not a term"), null);
});
