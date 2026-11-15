/* Environment logic: places, conditions, illustrative reference ranges and the message delay to Earth.
   Reference ranges are our design choice for this prototype, not a medical standard. */

export const KEYS = { state: "astromed-env", log: "astromed-env-log" };

export const PLACES = {
  iss: {
    name: "ISS", icon: "🛰️", img: "assets/environment/iss.png", tag: "Low Earth orbit", rad: 20,
    demo: { temp: 22, pressure: 101.3, humidity: 45, co2: 2500, noise: 55, radiation: 20 },
    facts: [
      "Microgravity shifts fluids and unloads bones and muscles: keep up your daily exercise.",
      "About 16 sunrises a day can disturb your sleep rhythm. Protect your sleep window.",
      "Cabin air is recycled, so watch CO₂ and humidity.",
      "The ground team is reachable almost in real time."
    ]
  },
  rover: {
    name: "Rover", icon: "🚙", img: "assets/environment/rover.png", tag: "Pressurized rover", rad: null,
    demo: { temp: 21, pressure: 101, humidity: 40, co2: 3200, noise: 62, radiation: 30 },
    facts: [
      "Very small cabin: little personal space and a high risk of tension with crewmates.",
      "Vibration, noise and motion can add fatigue and affect sleep.",
      "Water and hygiene are limited: plan hydration and hand cleaning.",
      "Radiation exposure depends on the surface you are driving on. Compare with your own baseline."
    ]
  },
  moon: {
    name: "Moon", icon: "🌙", img: "assets/environment/moon.png", tag: "Surface base", rad: 60,
    demo: { temp: 21, pressure: 70, humidity: 40, co2: 2800, noise: 52, radiation: 60 },
    facts: [
      "About one sixth of Earth’s gravity: keep resistance training to protect bones and muscles.",
      "Fine lunar dust is abrasive and can irritate eyes and lungs. Clean suits before entering.",
      "No magnetic shield: radiation is higher than on the ISS. Know your storm shelter.",
      "Signals take about 1.3 seconds one way, so conversations with the ground are almost live."
    ]
  },
  mars: {
    name: "Mars", icon: "🔴", img: "assets/environment/mars.png", tag: "Surface base", rad: 27,
    demo: { temp: 21, pressure: 70, humidity: 40, co2: 2800, noise: 50, radiation: 27 },
    facts: [
      "About 38% of Earth’s gravity: strength and aerobic training stay essential.",
      "A one-way signal takes roughly 3 to 22 minutes, so you must decide many things on your own.",
      "Long isolation and dust storms can weigh on mood: use your Mental Health check-ins.",
      "Radiation is lower on the surface than in transit, but still above Earth levels."
    ]
  },
  transit: {
    name: "In transit", tag: "Deep space cruise", rad: 76.7,
    icon: null,
    // 1.84 mSv/day is the MSL RAD cruise measurement used in radiation.js; shown here in µSv/h.
    demo: { temp: 22, pressure: 101.3, humidity: 45, co2: 2500, noise: 55, radiation: 76.7 },
    facts: [
      "Microgravity on the way to Mars unloads bones and muscles: keep your daily resistance and aerobic training.",
      "Radiation is higher than in low Earth orbit: NASA's Curiosity rover measured about 1.84 mSv per day on the cruise to Mars (NASA/JPL, MSL RAD), which is the same figure shown in Radiation.",
      "A one-way signal takes roughly 3 to 22 minutes, so you must decide many things on your own.",
      "Months in a small crewed volume make sleep, privacy and crew check-ins as important as equipment."
    ]
  },
  other: {
    name: "Other place", icon: "📍", tag: "Name your location", rad: null,
    demo: { temp: 21, pressure: 101, humidity: 45, co2: 2000, noise: 55, radiation: 10 },
    facts: [
      "Choose a name for your location and record the conditions around you.",
      "Alerts for radiation use your own previous readings here as a baseline.",
      "Note anything unusual in your environment and compare it with your own earlier readings. If Earth contact exists, also tell the flight surgeon."
    ]
  }
};

export const FIELDS = [
  { key: "temp", label: "Cabin temperature", unit: "°C", step: 0.1, min: -60, max: 80,
    how: "Read the cabin thermostat or a wall thermometer.",
    why: "Too hot or too cold hurts sleep, concentration and performance." },
  { key: "pressure", label: "Cabin pressure", unit: "kPa", step: 0.1, min: 10, max: 200,
    how: "Read the cabin pressure gauge on the habitat panel.",
    why: "Pressure sets how much oxygen you actually breathe." },
  { key: "humidity", label: "Humidity", unit: "%", step: 1, min: 0, max: 100,
    how: "Use the cabin hygrometer or the humidity sensor.",
    why: "Very dry air irritates eyes and airways; very damp air favours mold." },
  { key: "co2", label: "Carbon dioxide (CO₂)", unit: "ppm", step: 10, min: 0, max: 50000,
    how: "Read the cabin CO₂ monitor (ppm).",
    why: "High CO₂ causes headaches and drowsiness and lowers performance." },
  { key: "noise", label: "Noise level", unit: "dB", step: 1, min: 20, max: 140,
    how: "Use a sound-level meter near where you sleep or work.",
    why: "Constant noise costs sleep and can damage hearing." },
  { key: "radiation", label: "Radiation dose rate", unit: "µSv/h", step: 0.1, min: 0, max: 100000,
    how: "Read your personal dosimeter or the area monitor. If it shows mSv/day, multiply by 41.7 to get µSv/h.",
    why: "Radiation exposure adds up over the mission and can spike in solar storms." }
];

const result = (level, saw, todo) => ({ level, saw, todo });

export function evaluate(key, v, place, baseline) {
  switch (key) {
    case "temp":
      return v < 14 ? result("alert", "Cabin is very cold.", "Put on warm layers, check heating and tell your crew. Prolonged cold can lower your body temperature.")
        : v < 18 ? result("review", "Cabin is cool.", "Add a layer and check the thermostat. Re-measure in an hour.")
        : v <= 27 ? result("ok", "Cabin temperature is comfortable.", "Keep it up.")
        : v <= 32 ? result("review", "Cabin is warm.", "Drink water, reduce effort and check the cooling. Re-measure in an hour.")
        : result("alert", "Cabin is very hot.", "Stop strenuous work, hydrate and contact the crew or ground about cooling. Watch for dizziness or nausea.");
    case "pressure": {
      const reduced = place === "moon" || place === "mars" || place === "other";
      const lo = reduced ? 55 : 95, hi = 105;
      return v < lo - 15 ? result("alert", "Cabin pressure is much lower than expected.", "Check for a leak, put on your emergency gear if required and contact the crew and ground now.")
        : v < lo ? result("review", "Cabin pressure is below the expected range.", "Check the habitat panel and your oxygen level. Report it to the crew.")
        : v <= hi ? result("ok", reduced ? "Pressure is within the range for a reduced-pressure habitat." : "Cabin pressure is normal.", "Keep monitoring it each day.")
        : v <= 110 ? result("review", "Cabin pressure is slightly high.", "Check the habitat panel. Report it if it stays high.")
        : result("alert", "Cabin pressure is too high.", "Contact the crew and ground. Avoid sudden changes and report ear or chest discomfort.");
    }
    case "humidity":
      return v < 20 ? result("alert", "Air is extremely dry.", "Use eye drops if needed, drink water and ask for humidity to be raised.")
        : v < 30 ? result("review", "Air is dry.", "Drink water and watch for dry eyes, nose or throat.")
        : v <= 60 ? result("ok", "Humidity is comfortable.", "Keep it up.")
        : v <= 70 ? result("review", "Air is humid.", "Check for condensation and wipe damp surfaces to prevent mold.")
        : result("alert", "Air is very humid.", "Look for condensation or leaks, clean damp areas and report it to the crew.");
    case "co2":
      return v <= 3000 ? result("ok", "CO₂ is in a comfortable range.", "Keep air circulating and check it daily.")
        : v <= 5000 ? result("review", "CO₂ is elevated.", "Improve ventilation, avoid crowding in one module and watch for headaches or drowsiness. Report if it stays high.")
        : result("alert", "CO₂ is high.", "Move to a better-ventilated area, stop heavy exercise and alert your crew and ground now. Headache or confusion needs fast action.");
    case "noise":
      return v <= 60 ? result("ok", "Noise is acceptable.", "Keep it up.")
        : v <= 70 ? result("review", "Noise is loud for long periods.", "Use ear protection and move your sleep area away from the noise.")
        : result("alert", "Noise is very loud.", "Use hearing protection now, limit time in this area and report the noise source.");
    case "radiation": {
      const typical = PLACES[place]?.rad || baseline;
      if (!typical) return result("info", "Saved. Your first readings set your personal baseline.", "Keep logging the dose rate so changes can be detected.");
      const ratio = v / typical;
      return ratio <= 1.5 ? result("ok", PLACES[place]?.rad ? "Dose rate is near the typical level for this location." : "Dose rate is near your own baseline.", "Keep logging it daily.")
        : ratio <= 4 ? result("review", "Dose rate is above the usual level.", "Reduce time in low-shielding areas, spend more time in the best-shielded space and re-measure soon. If Earth contact exists, also tell the ground team.")
        : result("alert", "Dose rate is far above the usual level. This may be a solar particle event.", "Go to your storm shelter or most shielded area now and follow your radiation protocol. If Earth contact exists, also contact the ground team.");
    }
    default:
      return result("info", "Saved.", "");
  }
}

export function baselineFor(log, place, excludeTime = null) {
  const previous = (Array.isArray(log) ? log : [])
    .filter((entry) => entry && entry.place === place && entry.time !== excludeTime && Number.isFinite(entry.readings?.radiation))
    .slice(0, 7)
    .map((entry) => entry.readings.radiation);
  return previous.length >= 3 ? previous.reduce((a, b) => a + b, 0) / previous.length : null;
}

export function labelFrom(state) {
  if (!state || !state.place) return "";
  return state.place === "other" ? (state.custom || "Other place") : PLACES[state.place]?.name || "";
}

export function findingsFrom(state, log) {
  if (!state || !state.place || !state.readings) return [];
  const baseline = PLACES[state.place]?.rad ? null : baselineFor(log, state.place, state.time);
  return FIELDS.filter((field) => Number.isFinite(state.readings[field.key])).map((field) => {
    const r = evaluate(field.key, state.readings[field.key], state.place, baseline);
    return { level: r.level, title: `Environment · ${field.label}: ${state.readings[field.key]} ${field.unit}`, saw: r.saw, todo: r.todo, key: field.key };
  }).filter((entry) => entry.level !== "info");
}

export function commFor(place) {
  return place && COMM[place] ? { place, ...COMM[place] } : null;
}

// ISS / Moon: general knowledge (about 1.3 s Moon one way). Mars: NASA NTRS 20220013418 (about 3 to 22 min one way; solar conjunction blackout).
export const COMM = {
  iss: { t: "Almost live", one: "< 1 s", rt: "about 1 s", bar: 6, tip: "You can talk with the ground team in real time. Short pauses can happen when a relay satellite changes." },
  rover: { t: "Depends on the planet", one: "Local radio: instant", rt: "To Earth: same as the Moon or Mars", bar: 40, tip: "Talk to your crewmates is live. The delay to Earth is the one of the planet you drive on." },
  moon: { t: "A short pause", one: "about 1.3 s", rt: "about 2.6 s", bar: 22, tip: "Conversation works, with a small pause after each sentence. Say “over” when you finish." },
  mars: { t: "Long wait", one: "3 to 22 min", rt: "6 to 44 min", bar: 100, tip: "No live talk. Send complete messages (what, when, what you need), keep a list of questions, and decide routine things yourself. About every 2 years the Sun blocks the signal for around 2 weeks (solar conjunction)." },
  transit: { t: "Long wait", one: "3 to 22 min", rt: "6 to 44 min", bar: 100, tip: "No live talk during the cruise. Send complete messages (what, when, what you need), keep a list of questions, and decide routine things yourself." }
};

export function formatTime(iso) {
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

const read = (key, fallback) => (typeof window !== "undefined" && window.AstroMedStore ? window.AstroMedStore.store.get(key, fallback) : fallback);
const write = (key, value) => { if (typeof window !== "undefined" && window.AstroMedStore) window.AstroMedStore.store.set(key, value); };

function stateRecord() {
  return read(KEYS.state, { place: "", custom: "", readings: null, time: null }) || { place: "", custom: "", readings: null, time: null };
}
function logRecord() {
  const log = read(KEYS.log, []);
  return Array.isArray(log) ? log : [];
}

export function render() {}

export function label() {
  return labelFrom(stateRecord());
}

export function findings() {
  return findingsFrom(stateRecord(), logRecord());
}

export function comm() {
  const state = read(KEYS.state, null);
  return state && COMM[state.place] ? { place: state.place, ...COMM[state.place] } : null;
}

export function rule(key, value) {
  if (!FIELDS.some((field) => field.key === key)) return null;
  const state = stateRecord();
  const place = state.place || "iss";
  return evaluate(key, value, place, PLACES[place].rad ? null : baselineFor(logRecord(), place));
}

export function saveReading(state, readings, now = new Date().toISOString()) {
  write(KEYS.state, { ...state, readings, time: now });
  write(KEYS.log, [{ time: now, place: state.place, custom: state.custom || "", readings }, ...logRecord()].slice(0, 365));
}

export function deleteReading(time) {
  write(KEYS.log, logRecord().filter((entry) => entry.time !== time));
  const state = stateRecord();
  if (state.time === time) write(KEYS.state, { ...state, readings: null, time: null });
}

if (typeof window !== "undefined") {
  window.AstroMedEnv = { render, rule, comm, findings, label, FIELDS };
}
