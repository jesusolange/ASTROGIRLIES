/* Daily checkup support: load today's progress into the shared flow and keep the
   public findings object. The record form, gauges and summary are Preact components
   under src/components/checkup/. */

import { RECORDS_KEY, findingsFromRecords, hydrate } from "./checkup-flow.js";

function readRecords() {
  try {
    const store = window.AstroMedStore && window.AstroMedStore.store;
    const saved = store ? store.get(RECORDS_KEY, []) : [];
    return Array.isArray(saved) ? saved.filter((record) => record && record.part && record.values) : [];
  } catch (error) {
    console.warn("Local storage unavailable", error);
    return [];
  }
}

function findings() {
  return findingsFromRecords(readRecords(), (key, value) => (
    window.AstroMedData && window.AstroMedData.rule ? window.AstroMedData.rule(key, value) : null
  ));
}

document.addEventListener("DOMContentLoaded", () => {
  hydrate(readRecords());
  window.AstroMedCheckup = { findings };
});
