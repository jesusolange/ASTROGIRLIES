#!/usr/bin/env node
// Computes WCAG contrast for the token pairs used for text and UI boundaries.
// Reads src/styles/tokens.css, so it always checks the shipped values.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");

function block(selector) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}");
  const m = clean.match(re);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split(";")) {
    const [name, value] = line.split(":");
    if (name && value) out[name.trim()] = value.trim();
  }
  return out;
}

const dark = block(":root");
const light = { ...dark, ...block(':root[data-theme="light"]') };

function parse(raw) {
  const s = raw.trim();
  if (s === "white") return [255, 255, 255, 1];
  const hex = s.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (h.length === 4) h = h.split("").map((c) => c + c).join("");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    ];
  }
  const rgb = s.match(/^rgba?\(([^)]*)\)$/i);
  if (rgb) {
    const p = rgb[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  throw new Error("Unsupported colour: " + raw);
}

function over(fg, bg) {
  const a = fg[3];
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
}

function lum([r, g, b]) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a, b) {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function pair(tokens, fgName, bgName) {
  const bg = parse(tokens[bgName]);
  const base = bg[3] < 1 ? over(bg, parse(tokens["--am-bg"])) : bg;
  const fg = parse(tokens[fgName]);
  const solid = fg[3] < 1 ? over(fg, base) : fg;
  return ratio(solid, base);
}

const textOn = ["--am-bg", "--am-bg-raised", "--am-surface", "--am-surface-2"];
const textPairs = [];
for (const bg of textOn) {
  textPairs.push(["--am-text", bg]);
  textPairs.push(["--am-text-muted", bg]);
  textPairs.push(["--am-heading", bg]);
  textPairs.push(["--am-accent", bg]);
}
for (const bg of ["--am-surface", "--am-surface-2"]) {
  textPairs.push(["--am-ok", bg]);
  textPairs.push(["--am-warn", bg]);
  textPairs.push(["--am-danger", bg]);
}
textPairs.push(
  ["--am-btn-primary-text", "--am-btn-primary-bg"],
  ["--am-btn-soft-text", "--am-btn-soft-bg"],
  ["--am-field-text", "--am-field-bg"],
  ["--am-field-placeholder", "--am-field-bg"],
  ["--am-warn-soft", "--am-warn-bg"],
  ["--am-danger-soft", "--am-danger-bg"],
  ["--am-ok-soft", "--am-ok-bg"],
  ["--am-stage-text", "--am-stage-base"],
  ["--am-stage-text-muted", "--am-stage-base"]
);

const boundaryPairs = [
  ["--am-border-strong", "--am-surface"],
  ["--am-border-strong", "--am-bg"],
  ["--am-field-border", "--am-field-bg"],
  ["--am-selected-border", "--am-surface"],
  ["--am-focus", "--am-bg"],
];

let failures = 0;
function run(name, tokens, pairs, minimum) {
  console.log("\n" + name + " theme (text minimum 4.5, UI minimum 3)");
  for (const [fg, bg] of pairs) {
    const value = pair(tokens, fg, bg);
    const pass = value >= minimum;
    if (!pass) failures++;
    console.log(
      `  ${pass ? "PASS" : "FAIL"} ${value.toFixed(2)}:1  ${fg} on ${bg}`
    );
  }
}

run("Dark", dark, textPairs, 4.5);
run("Dark", dark, boundaryPairs, 3);
run("Light", light, textPairs, 4.5);
run("Light", light, boundaryPairs, 3);

console.log("\n" + (failures ? failures + " pair(s) below the WCAG minimum." : "All token pairs pass."));
process.exit(failures ? 1 : 0);
