"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { BODIES, TEXTURES, bodyFor, detailsFor, fallbackFor, labelFor, textureFor } = require("../src/scripts/planet.js");

const ROOT = path.join(__dirname, "..", "public");

test("each mission type maps to the body the cover drew before", () => {
  assert.equal(bodyFor({ drm: "leo" }), "earth");
  assert.equal(bodyFor({ drm: "lunarOrbit" }), "moon");
  assert.equal(bodyFor({ drm: "lunarSurface" }), "moon");
  assert.equal(bodyFor({ drm: "mars" }), "mars");
});

test("mission ids map without a mission object", () => {
  assert.equal(bodyFor("leo-short"), "earth");
  assert.equal(bodyFor("lunarOrbit-long"), "moon");
  assert.equal(bodyFor("lunarSurface-short"), "moon");
  assert.equal(bodyFor("mars-planetary"), "mars");
});

test("a missing or unknown mission falls back to Mars", () => {
  assert.equal(bodyFor(undefined), "mars");
  assert.equal(bodyFor(null), "mars");
  assert.equal(bodyFor(""), "mars");
  assert.equal(bodyFor({ drm: "venus" }), "mars");
});

test("a missing or unknown body falls back to Mars", () => {
  assert.equal(detailsFor("venus").id, "mars");
  assert.equal(textureFor("venus"), TEXTURES.mars.texture);
  assert.equal(fallbackFor("venus"), TEXTURES.mars.fallback);
  assert.equal(labelFor("venus"), "Mars");
});

test("every body has a texture, a fallback and a credit", () => {
  for (const body of BODIES) {
    const details = detailsFor(body);
    assert.ok(details.texture.endsWith(".jpg"));
    assert.ok(details.fallback.endsWith(".svg"));
    assert.ok(details.title && details.author && details.url && details.licence && details.change);
    assert.equal(textureFor(body), details.texture);
    assert.equal(fallbackFor(body), details.fallback);
    assert.equal(labelFor(body), details.label);
  }
});

test("the texture and fallback files exist and stay within the size budget", () => {
  let total = 0;
  for (const body of BODIES) {
    const details = detailsFor(body);
    for (const file of [details.texture, details.fallback]) {
      assert.ok(fs.existsSync(path.join(ROOT, file.replace(/^\//, ""))), `missing ${file}`);
    }
    total += fs.statSync(path.join(ROOT, details.texture.replace(/^\//, ""))).size;
  }
  assert.ok(total < 3 * 1024 * 1024, `textures total ${total} bytes`);
});
