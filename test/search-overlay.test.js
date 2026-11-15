import test from "node:test";
import assert from "node:assert/strict";
import { filterGroups, stepIndex, visibleItems } from "../src/components/ui/search.js";

const GROUPS = [
  {
    id: "vision",
    label: "Vision",
    items: [
      { id: "near", label: "Near vision" },
      { id: "grid", label: "Grid test" },
      { id: "symptoms", label: "Symptoms you noticed today" }
    ]
  },
  {
    id: "heart",
    label: "Heart",
    items: [
      { id: "pulse", label: "Heart rate" },
      { id: "bp", label: "Blood pressure" }
    ]
  }
];

test("a near-miss prefix still finds the group, so \"vit\" finds Vision", () => {
  const groups = filterGroups(GROUPS, "vit");
  assert.deepEqual(groups.map((group) => group.id), ["vision"]);
  assert.equal(groups[0].items.length, 3);
});

test("an empty query keeps every group and item", () => {
  const groups = filterGroups(GROUPS, "   ");
  assert.deepEqual(groups.map((group) => group.id), ["vision", "heart"]);
  assert.equal(groups[0].items.length, 3);
});

test("typing drops groups without a match and keeps the matching items only", () => {
  const groups = filterGroups(GROUPS, "vit");
  assert.deepEqual(groups.map((group) => group.id), ["vision"]);
  assert.deepEqual(groups[0].items.map((item) => item.id), ["near", "grid", "symptoms"]);
});

test("typing an item's text narrows the group to that item", () => {
  const groups = filterGroups(GROUPS, "press");
  assert.deepEqual(groups.map((group) => group.id), ["heart"]);
  assert.deepEqual(groups[0].items.map((item) => item.id), ["bp"]);
});

test("a group label match keeps all of that group's items", () => {
  const groups = filterGroups(GROUPS, "heart");
  assert.deepEqual(groups.map((group) => group.id), ["heart"]);
  assert.equal(groups[0].items.length, 2);
  assert.equal(groups[0].labelMatch, true);
});

test("a keyword match brings up its item and several words must all be present", () => {
  const groups = [{
    id: "urgent",
    label: "Act now",
    items: [{ id: "calf", label: "Calf pain", keywords: ["DVT swollen calf clot"] }]
  }];
  assert.deepEqual(filterGroups(groups, "dvt")[0].items.map((item) => item.id), ["calf"]);
  assert.deepEqual(filterGroups(groups, "swollen calf")[0].items.map((item) => item.id), ["calf"]);
  assert.deepEqual(filterGroups(groups, "swollen arm"), []);
});

test("no match gives an empty list", () => {
  assert.deepEqual(filterGroups(GROUPS, "zzz"), []);
});

test("visibleItems follows the expanded groups in order", () => {
  const visible = visibleItems(GROUPS, (group) => group.id === "heart");
  assert.deepEqual(visible.map((entry) => entry.item.id), ["pulse", "bp"]);
});

test("stepIndex wraps in both directions", () => {
  assert.equal(stepIndex(0, -1, 3), 2);
  assert.equal(stepIndex(2, 1, 3), 0);
  assert.equal(stepIndex(0, 1, 0), 0);
});
