/* ==============================================
   ASTROMED — ENVIRONMENT (where are you + cabin conditions)
   Educational prototype. Reference ranges are illustrative.
   Load AFTER astromed-sections.js
============================================= */

import { currentMission } from "./risks.js";
import { missionField, setMissionType } from "./riskmap.js";

(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const KEY = "astromed-env";
  const LOG = "astromed-env-log";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const read = (k, fb) => window.AstroMedStore.store.get(k, fb);
  const write = (k, v) => window.AstroMedStore.store.set(k, v);
  const fmt = (iso) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  /* ---------- places ---------- */
  const PLACES = {
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
      icon: '<svg class="env-place-icon" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="31" cy="35" r="6"/><ellipse cx="31" cy="35" rx="24" ry="9" transform="rotate(-28 31 35)"/><circle cx="54" cy="17" r="3"/><path d="M8 52l6-11 11-6"/></svg>',
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
        "Tell your flight surgeon about anything unusual in your environment."
      ]
    }
  };

  /* ---------- measured conditions ---------- */
  const FIELDS = [
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

  const R = (level, saw, todo) => ({ level, saw, todo });

  /* ---------- rules (illustrative reference ranges) ---------- */
  function evaluate(key, v, place, baseline) {
    switch (key) {
      case "temp":
        return v < 14 ? R("alert", "Cabin is very cold.", "Put on warm layers, check heating and tell your crew. Prolonged cold can lower your body temperature.")
          : v < 18 ? R("review", "Cabin is cool.", "Add a layer and check the thermostat. Re-measure in an hour.")
          : v <= 27 ? R("ok", "Cabin temperature is comfortable.", "Keep it up.")
          : v <= 32 ? R("review", "Cabin is warm.", "Drink water, reduce effort and check the cooling. Re-measure in an hour.")
          : R("alert", "Cabin is very hot.", "Stop strenuous work, hydrate and contact the crew or ground about cooling. Watch for dizziness or nausea.");
      case "pressure": {
        const reduced = place === "moon" || place === "mars" || place === "other";
        const lo = reduced ? 55 : 95, hi = 105;
        return v < lo - 15 ? R("alert", "Cabin pressure is much lower than expected.", "Check for a leak, put on your emergency gear if required and contact the crew and ground now.")
          : v < lo ? R("review", "Cabin pressure is below the expected range.", "Check the habitat panel and your oxygen level. Report it to the crew.")
          : v <= hi ? R("ok", reduced ? "Pressure is within the range for a reduced-pressure habitat." : "Cabin pressure is normal.", "Keep monitoring it each day.")
          : v <= 110 ? R("review", "Cabin pressure is slightly high.", "Check the habitat panel. Report it if it stays high.")
          : R("alert", "Cabin pressure is too high.", "Contact the crew and ground. Avoid sudden changes and report ear or chest discomfort.");
      }
      case "humidity":
        return v < 20 ? R("alert", "Air is extremely dry.", "Use eye drops if needed, drink water and ask for humidity to be raised.")
          : v < 30 ? R("review", "Air is dry.", "Drink water and watch for dry eyes, nose or throat.")
          : v <= 60 ? R("ok", "Humidity is comfortable.", "Keep it up.")
          : v <= 70 ? R("review", "Air is humid.", "Check for condensation and wipe damp surfaces to prevent mold.")
          : R("alert", "Air is very humid.", "Look for condensation or leaks, clean damp areas and report it to the crew.");
      case "co2":
        return v <= 3000 ? R("ok", "CO₂ is in a comfortable range.", "Keep air circulating and check it daily.")
          : v <= 5000 ? R("review", "CO₂ is elevated.", "Improve ventilation, avoid crowding in one module and watch for headaches or drowsiness. Report if it stays high.")
          : R("alert", "CO₂ is high.", "Move to a better-ventilated area, stop heavy exercise and alert your crew and ground now. Headache or confusion needs fast action.");
      case "noise":
        return v <= 60 ? R("ok", "Noise is acceptable.", "Keep it up.")
          : v <= 70 ? R("review", "Noise is loud for long periods.", "Use ear protection and move your sleep area away from the noise.")
          : R("alert", "Noise is very loud.", "Use hearing protection now, limit time in this area and report the noise source.");
      case "radiation": {
        const typ = PLACES[place]?.rad || baseline;
        if (!typ) return R("info", "Saved. Your first readings set your personal baseline.", "Keep logging the dose rate so changes can be detected.");
        const r = v / typ;
        return r <= 1.5 ? R("ok", PLACES[place]?.rad ? "Dose rate is near the typical level for this location." : "Dose rate is near your own baseline.", "Keep logging it daily.")
          : r <= 4 ? R("review", "Dose rate is above the usual level.", "Reduce time in low-shielding areas, spend more time in the best-shielded space and re-measure soon. Tell the ground team.")
          : R("alert", "Dose rate is far above the usual level. This may be a solar particle event.", "Go to your storm shelter or most shielded area now, follow your radiation protocol and contact the ground team.");
      }
      default:
        return R("info", "Saved.", "");
    }
  }

  /* ---------- state ---------- */
  const state = () => read(KEY, { place: "", custom: "", readings: null, time: null });
  const log = () => { const l = read(LOG, []); return Array.isArray(l) ? l : []; };
  let draft = null; // unsaved form values
  let lastFindings = [];
  let shownMission = null;

  function baselineRadiation(place) {
    const prev = log().filter((e) => e.place === place && Number.isFinite(e.readings?.radiation)).slice(0, 7).map((e) => e.readings.radiation);
    return prev.length >= 3 ? prev.reduce((a, b) => a + b, 0) / prev.length : null;
  }

  function label() {
    const s = state();
    if (!s.place) return "";
    return s.place === "other" ? (s.custom || "Other place") : PLACES[s.place].name;
  }

  function findings() {
    const s = state();
    if (!s.place || !s.readings) return [];
    const base = PLACES[s.place].rad ? null : baselineRadiationBefore(s);
    return FIELDS.filter((f) => Number.isFinite(s.readings[f.key])).map((f) => {
      const r = evaluate(f.key, s.readings[f.key], s.place, base);
      return { level: r.level, title: `Environment · ${f.label}: ${s.readings[f.key]} ${f.unit}`, saw: r.saw, todo: r.todo, key: f.key };
    }).filter((x) => x.level !== "info");
  }

  // baseline from entries older than the latest one
  function baselineRadiationBefore(s) {
    const prev = log().filter((e) => e.place === s.place && e.time !== s.time && Number.isFinite(e.readings?.radiation)).slice(0, 7).map((e) => e.readings.radiation);
    return prev.length >= 3 ? prev.reduce((a, b) => a + b, 0) / prev.length : null;
  }

  /* ---------- page ---------- */
  const ICON = { ok: "✓", review: "!", alert: "!" };

  /* ---------- message delay to Earth ---------- */
  // ISS / Moon: general knowledge (about 1.3 s Moon one way). Mars: NASA NTRS 20220013418 (about 3 to 22 min one way; solar conjunction blackout).
  const COMM = {
    iss: { t: "Almost live", one: "< 1 s", rt: "about 1 s", bar: 6, tip: "You can talk with the ground team in real time. Short pauses can happen when a relay satellite changes." },
    rover: { t: "Depends on the planet", one: "Local radio: instant", rt: "To Earth: same as the Moon or Mars", bar: 40, tip: "Talk to your crewmates is live. The delay to Earth is the one of the planet you drive on." },
    moon: { t: "A short pause", one: "about 1.3 s", rt: "about 2.6 s", bar: 22, tip: "Conversation works, with a small pause after each sentence. Say “over” when you finish." },
    mars: { t: "Long wait", one: "3 to 22 min", rt: "6 to 44 min", bar: 100, tip: "No live talk. Send complete messages (what, when, what you need), keep a list of questions, and decide routine things yourself. About every 2 years the Sun blocks the signal for around 2 weeks (solar conjunction)." },
    transit: { t: "Long wait", one: "3 to 22 min", rt: "6 to 44 min", bar: 100, tip: "No live talk during the cruise. Send complete messages (what, when, what you need), keep a list of questions, and decide routine things yourself." }
  };
  function commCard(id) {
    const c = COMM[id]; if (!c) return "";
    return `<div class="env-comm"><h4>📡 Message delay to Earth: <b>${esc(c.t)}</b></h4>
      <div class="env-comm-viz" aria-hidden="true"><span>🌍</span><div class="env-comm-line"><i style="animation-duration:${Math.max(1.2, c.bar / 14)}s"></i></div><span>${PLACES[id].icon}</span></div>
      <div class="env-comm-nums"><div><small>One way</small><b>${esc(c.one)}</b></div><div><small>Answer back</small><b>${esc(c.rt)}</b></div></div>
      <p>${esc(c.tip)}</p></div>`;
  }

  function render() {
    const page = $("#environmentPage");
    if (!page) return;
    const s = state();
    const place = s.place;
    const p = place ? PLACES[place] : null;
    const values = draft || s.readings || {};
    const mission = currentMission();
    shownMission = mission.id;

    page.innerHTML = `
      <div class="am-heading">
        <h2>Environment</h2>
        <p>Where are you right now? Your location and the air around you shape the risks the tool watches for, and they are used in Today and your protocols.</p>
      </div>

      <div class="am-panel env-mission">
        <h3>Mission</h3>
        <div class="rk-controls">
          ${missionField(mission.id)}
          <p class="rk-note">This mission sets the order of Mission risks and the risk warnings in the app.</p>
        </div>
      </div>

      <div class="am-panel">
        <h3>Where are you?</h3>
        <div class="env-places" role="group" aria-label="Location">
          ${Object.entries(PLACES).map(([id, pl]) => `<button type="button" class="env-place ${id === place ? "on" : ""}" data-place="${id}"><span>${pl.img ? `<img src="${pl.img}" alt="" loading="lazy">` : pl.icon}</span><b>${esc(pl.name)}</b><small>${esc(pl.tag)}</small></button>`).join("")}
        </div>
        ${place === "other" ? `<label class="pg-field env-custom"><span>Name of your location</span><input type="text" id="envCustom" maxlength="40" placeholder="e.g. Lunar orbit station" value="${esc(s.custom || "")}"></label>` : ""}
        ${p ? commCard(place) : ""}
        ${p ? `<div class="env-info"><div class="env-facts"><h4>Keep in mind in ${esc(label())}</h4><ul>${p.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul><button type="button" class="rk-linkbtn" data-riskmap>Mission risks for this location</button></div><div class="env-space" aria-hidden="true">${p.img ? `<img src="${p.img}" alt="">` : `<span class="env-space-emoji">${p.icon}</span>`}</div></div>` : `<p class="am-small">Pick a location to continue.</p>`}
      </div>

      ${p ? `<div class="am-panel">
        <h3>Conditions around you</h3>
        <form id="envForm">
          <div class="env-fields">
            ${FIELDS.map((f) => `<label class="env-field" data-key="${f.key}">
              <span class="env-lab">${esc(f.label)} <small>${esc(f.unit)}</small></span>
              <input type="number" name="${f.key}" step="${f.step}" min="${f.min}" max="${f.max}" value="${values[f.key] ?? ""}" inputmode="decimal">
              <em>${esc(f.how)}</em>
            </label>`).join("")}
          </div>
          <div class="am-actions">
            <button type="submit" class="am-btn">Save environment</button>
            <button type="button" class="am-btn am-btn-soft" id="envDemo">Demo values</button>
          </div>
        </form>
      </div>` : ""}

      <div id="envStatus">${statusHtml()}</div>
      ${logHtml()}`;

    page.querySelectorAll("[data-place]").forEach((b) => b.addEventListener("click", () => {
      const cur = state();
      write(KEY, { ...cur, place: b.dataset.place });
      draft = null;
      render();
    }));
    const custom = $("#envCustom");
    if (custom) custom.addEventListener("input", () => { write(KEY, { ...state(), custom: custom.value }); });
    const missionSelect = page.querySelector("[data-mission-select]");
    if (missionSelect) missionSelect.addEventListener("change", () => setMissionType(missionSelect.value));
    page.querySelector("[data-riskmap]")?.addEventListener("click", () => window.AstroMedNav.show("riskmap"));
    const form = $("#envForm");
    if (form) {
      form.addEventListener("submit", (e) => { e.preventDefault(); save(); });
      form.addEventListener("input", () => { draft = readForm(); });
      $("#envDemo").addEventListener("click", () => {
        draft = { ...PLACES[place].demo };
        FIELDS.forEach((f) => { const i = form.elements[f.key]; if (i) i.value = draft[f.key]; });
      });
    }
    page.querySelectorAll("[data-delenv]").forEach((b) => b.addEventListener("click", () => {
      write(LOG, log().filter((e) => e.time !== b.dataset.delenv));
      const cur = state();
      if (cur.time === b.dataset.delenv) write(KEY, { ...cur, readings: null, time: null });
      render();
    }));
  }

  function readForm() {
    const form = $("#envForm");
    const out = {};
    FIELDS.forEach((f) => {
      const v = form.elements[f.key].value;
      if (v !== "" && Number.isFinite(Number(v))) out[f.key] = Number(v);
    });
    return out;
  }

  function statusHtml() {
    const s = state();
    if (!s.place || !s.readings) return "";
    const base = PLACES[s.place].rad ? null : baselineRadiationBefore(s);
    const rows = FIELDS.filter((f) => Number.isFinite(s.readings[f.key])).map((f) => {
      const r = evaluate(f.key, s.readings[f.key], s.place, base);
      return `<div class="env-row ${r.level}">
        <i>${ICON[r.level] || "•"}</i>
        <div><b>${esc(f.label)}: ${esc(s.readings[f.key])} ${esc(f.unit)}</b>
        <p>${esc(r.saw)}${r.todo ? " " + esc(r.todo) : ""}</p>
        <small>${esc(f.why)}</small></div></div>`;
    }).join("");
    return `<div class="am-panel"><h3>Status in ${esc(label())}</h3><p class="am-small">Saved ${esc(fmt(s.time))}</p>${rows}</div>`;
  }

  function logHtml() {
    const l = log().slice(0, 6);
    if (!l.length) return "";
    return `<div class="am-panel"><h3>Recent environment logs</h3><ul class="am-saved">
      ${l.map((e) => {
        const name = e.place === "other" ? (e.custom || "Other place") : PLACES[e.place]?.name || e.place;
        const bits = FIELDS.filter((f) => Number.isFinite(e.readings?.[f.key])).slice(0, 3).map((f) => `${e.readings[f.key]} ${f.unit}`).join(" · ");
        return `<li><span>${esc(fmt(e.time))} · ${esc(name)}</span><b>${esc(bits)}</b><button type="button" class="am-btn am-btn-soft" data-delenv="${esc(e.time)}">Delete</button></li>`;
      }).join("")}
    </ul></div>`;
  }

  function save() {
    const s = state();
    const readings = readForm();
    if (!Object.keys(readings).length) { popup([{ level: "review", title: "Nothing to save", saw: "Enter at least one measurement first.", todo: "" }], true); return; }
    const time = new Date().toISOString();
    write(KEY, { ...s, readings, time });
    write(LOG, [{ time, place: s.place, custom: s.custom || "", readings }, ...log()].slice(0, 365));
    draft = null;
    render();
    lastFindings = findings().filter((f) => f.level !== "ok");
    if (lastFindings.length) popup(lastFindings, false);
    if (window.AstroMedProgress) window.AstroMedProgress.sync();
  }

  /* ---------- pop-up warnings ---------- */
  function popup(items, plain) {
    closePopup();
    const wrap = document.createElement("div");
    wrap.className = "env-pop";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "Environment warnings");
    const worst = items.some((i) => i.level === "alert") ? "alert" : "review";
    wrap.innerHTML = `<div class="env-pop-card ${worst}">
      <h3>${plain ? "Heads up" : worst === "alert" ? "Please read this first" : "A few things to watch"}</h3>
      <div class="env-pop-list">${items.map((i) => `<div class="env-pop-item ${i.level}"><i>!</i><div><b>${esc(i.title.replace("Environment · ", ""))}</b><p>${esc(i.saw)} ${esc(i.todo)}</p></div></div>`).join("")}</div>
      <button type="button" class="am-btn" id="envPopOk">I understand</button>
    </div>`;
    document.body.appendChild(wrap);
    $("#envPopOk", wrap).addEventListener("click", closePopup);
    wrap.addEventListener("click", (e) => { if (e.target === wrap) closePopup(); });
    $("#envPopOk", wrap).focus();
  }
  function closePopup() { document.querySelector(".env-pop")?.remove(); }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePopup(); });

  document.addEventListener("astromed-profile-changed", () => {
    const page = $("#environmentPage");
    if (page && !page.hidden && currentMission().id !== shownMission) render();
  });

  /* ---------- public API ---------- */
  window.AstroMedEnv = {
    render,
    comm: () => { const s = read(KEY, null); return s && COMM[s.place] ? { place: s.place, ...COMM[s.place] } : null; },
    label,
    findings,
    FIELDS,
    rule: (key, v) => {
      const s = state();
      if (!FIELDS.some((f) => f.key === key)) return null;
      const place = s.place || "iss";
      return evaluate(key, v, place, PLACES[place].rad ? null : baselineRadiation(place));
    }
  };
})();
