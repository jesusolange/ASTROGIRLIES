import assert from "node:assert/strict";
import { test } from "node:test";
import { HEAD, MODELS, PART_IDS, VIEWS, frameDistance, orbitPosition, partInfo } from "../src/scripts/astronaut3d/layout.js";

test("the public parts are the eight the checkup asks for", () => {
  assert.deepEqual(
    [...PART_IDS].sort(),
    ["body", "bones", "brain", "eyes", "heart", "kidneys", "lungs", "muscles"],
  );
  assert.equal(partInfo("body").frame, "body");
  assert.equal(partInfo("eyes").frame, "head");
  assert.equal(partInfo("hand"), null);
});

test("organs sit in anatomical order from head to abdomen", () => {
  const y = (id) => MODELS[id].at[1];
  assert.ok(y("brain") > y("lungs"));
  assert.ok(y("lungs") > y("heart"));
  assert.ok(y("heart") > y("kidneys"));
  assert.ok(MODELS.heart.at[0] > MODELS.lungs.at[0], "heart is left of the midline (+x)");
  assert.ok(MODELS.kidneys.at[2] < MODELS.heart.at[2], "kidneys are behind the heart");
  assert.ok(Math.abs(HEAD.center[1] - y("brain")) < 0.3, "the eyes frame is on the head");
});

test("a larger part is framed from further away", () => {
  const small = frameDistance([0.25, 0.25, 0.25], 30, 1, 0.4);
  const large = frameDistance([1.2, 3.7, 0.7], 30, 1, 0.85);
  assert.ok(large > small);
  assert.ok(small > 0.25);
});

test("a narrow view moves the camera back for wide parts", () => {
  const wide = [1, 0.2, 0.2];
  assert.ok(frameDistance(wide, 30, 0.5) > frameDistance(wide, 30, 2));
});

test("orbit positions face the body from the front, side and back", () => {
  const front = orbitPosition([0, 2, 0], 4, VIEWS.front);
  const side = orbitPosition([0, 2, 0], 4, VIEWS.side);
  const back = orbitPosition([0, 2, 0], 4, VIEWS.back);
  assert.ok(front[2] > 3.99 && Math.abs(front[0]) < 1e-9);
  assert.ok(side[0] > 3.99 && Math.abs(side[2]) < 1e-9);
  assert.ok(back[2] < -3.99);
  assert.equal(front[1], 2);
});
