/* Body checks: the findings contract for the records saved by the body cards.
   The cards themselves are Preact components under src/components/body/. */

import { findingsFromRecords, readRecords } from "./checkup-flow.js";

function ruleFor(key, value) {
  const data = typeof window !== "undefined" ? window.AstroMedData : null;
  return data && typeof data.rule === "function" ? data.rule(key, value) : null;
}

export function findings() {
  return findingsFromRecords(readRecords(), ruleFor);
}
