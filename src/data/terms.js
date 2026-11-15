// Plain one-sentence expansions for abbreviations used in the interface.
// A definition explains the term only; it carries no threshold and no advice.
export const TERMS = {
  "HRV": "Heart rate variability: the variation in the time between heartbeats.",
  "ALARA": "As low as reasonably achievable: keep a radiation dose as low as practical.",
  "ARED": "Advanced Resistive Exercise Device: the resistance machine used for strength training in orbit.",
  "T2": "The second treadmill in orbit, used with a harness that holds the runner down.",
  "CEVIS": "Cycle Ergometer with Vibration Isolation and Stabilization: the exercise bike used in orbit.",
  "N-telopeptide": "A fragment of bone collagen measured in urine as a marker of bone breakdown.",
  "Flight surgeon": "The mission's doctor on Earth who supports the crew.",
  "GCS": "Glasgow Coma Scale: a score of eye, verbal and motor responses that describes level of consciousness.",
  "SANS": "Spaceflight Associated Neuro-ocular Syndrome: eye and vision changes linked to spaceflight.",
  "ICR": "Intercostal space: the gap between two ribs, used to place a chest needle or drain.",
  "EVA": "Extravehicular activity: a spacewalk outside the spacecraft.",
  "DVT": "Deep vein thrombosis: a blood clot in a deep vein, usually in the leg.",
  "BMD": "Bone mineral density: the amount of mineral in a bone, a measure of bone strength.",
  "VO\u2082max": "Maximum oxygen uptake: the highest rate at which your body can use oxygen during exercise.",
  "ISS": "International Space Station: the crewed laboratory in low Earth orbit.",
  "LEO": "Low Earth orbit: an orbit a few hundred kilometres above the surface.",
  "SPE": "Solar particle event: a burst of energetic particles from the Sun.",
  "NASA": "National Aeronautics and Space Administration: the United States space agency.",
  "OCHMO": "Office of the Chief Health and Medical Officer: the NASA office that publishes the health standards.",
  "CSV": "Comma-separated values: a plain text file with one row per line and commas between columns.",
  "JSON": "JavaScript Object Notation: a plain text format for structured data.",
  "PDF": "Portable Document Format: a file that keeps its layout when opened or printed."
};

const index = new Map(Object.keys(TERMS).map((term) => [term.toLowerCase(), term]));

export function termKey(name) {
  return index.get(String(name || "").trim().toLowerCase()) || null;
}

export function definitionOf(name) {
  const key = termKey(name);
  return key ? TERMS[key] : null;
}

export function hasTerm(name) {
  return termKey(name) !== null;
}
