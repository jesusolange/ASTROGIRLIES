/* ==============================================
   ASTROMED — OVERVIEW · PROTOCOLS
   Educational prototype — not a medical device.
   Load AFTER script.js, exercise.js, health-indicators.js
============================================== */

import { analyzeMental, protocolRows } from "./mental.js";
import { initMental } from "./mental-page.js";

function astromedSectionsInit() {

  console.log("AstroMed sections loaded ✓");

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const KEYS = {
    mental: "astromed-mental",
    records: "astrotwin-gui-v2-records",
    exercise: "astrotwin-exercise-sessions"
  };

  const load = (k, fb) => window.AstroMedStore.store.get(k, fb);
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = iso => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  const main = $(".content");
  const footer = $(".footer", main);
  if (!main || !footer) return;

  /* ==========================================
     INJECT PAGES
  ========================================== */

  const pages = ["mental", "environment", "nutrition", "missions", "radiation", "readiness", "progress", "doctor", "protocols"];
  footer.insertAdjacentHTML("beforebegin", pages.map(id => `<section id="${id}Page" class="am-page" hidden></section>`).join(""));

  initMental();

  /* ==========================================
     NAVIGATION
  ========================================== */

  const PAGES = {
    environment: "environmentPage",
    overview: "checkupPage",
    twin: "exercisePage",
    nutrition: "nutritionPage",
    radiation: "radiationPage",
    readiness: "readinessPage",
    missions: "missionsPage",
    mental: "mentalPage",
    doctor: "doctorPage",
    progress: "progressPage",
    protocols: "protocolsPage"
  };

  let current = "overview";
  function show(action) {
    current = action;
    Object.values(PAGES).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = id !== PAGES[action];
    });
    $$(".nav button").forEach(b =>
      b.classList.toggle("active", b.dataset.action === action));
    if (action === "doctor") renderDoctor();
    if (action === "protocols") renderProtocols();
    if (action === "environment" && window.AstroMedEnv) window.AstroMedEnv.render();
    if (action === "nutrition" && window.AstroMedNutrition) window.AstroMedNutrition.render();
    if (action === "missions" && window.AstroMedMissions) window.AstroMedMissions.render();
    if (action === "radiation" && window.AstroMedRadiation) window.AstroMedRadiation.render();
    if (action === "readiness" && window.AstroMedReadiness) window.AstroMedReadiness.render();
    if (action === "progress" && window.AstroMedProgress) window.AstroMedProgress.render();
    if (REGISTERED[action]) REGISTERED[action](document.getElementById(PAGES[action]));
    window.scrollTo({ top: 0 });
  }

  // Sections added by their own module: AstroMedNav.register({ id, label, icon, render, before }).
  // Uses the page element <section id="<id>Page" class="am-page"> from the section's .astro component when it
  // exists, otherwise creates it; same for the sidebar button. render(pageElement) runs each time the section opens. `before` is the data-action of the sidebar button to insert in front of.
  // Pass nav: false for a page that is opened only through AstroMedNav.show(id).
  const REGISTERED = {};
  function register({ id, label, icon = "ic-report", render, before, nav = true }) {
    if (PAGES[id]) return;
    PAGES[id] = `${id}Page`;
    REGISTERED[id] = render || (() => {});
    if (!document.getElementById(`${id}Page`)) {
      const anchor = document.getElementById("protocolsPage");
      anchor.insertAdjacentHTML("afterend", `<section id="${id}Page" class="am-page" hidden></section>`);
    }
    if (!nav || $(`.nav button[data-action="${id}"]`)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = id;
    button.innerHTML = `<svg class="icon"><use href="#${icon}"/></svg>`;
    button.append(label);
    const navEl = $(".nav");
    navEl.insertBefore(button, (before && $(`.nav button[data-action="${before}"]`)) || $(".nav-foot", navEl));
  }
  window.AstroMedNav = { register, show, has: (id) => Boolean(PAGES[id]), current: () => current };

  document.addEventListener("click", e => {
    const b = e.target.closest(".ov-ready");
    if (b) show("readiness");
  });

  // New sections: take over the click before script.js sees it.
  document.addEventListener("click", e => {
    const b = e.target.closest(".nav button[data-action]");
    if (!b || !(["environment", "mental", "doctor", "protocols", "progress", "nutrition", "missions", "radiation", "readiness"].includes(b.dataset.action) || REGISTERED[b.dataset.action])) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    show(b.dataset.action);
  }, true);

  // Existing sections: let script.js run, then make sure mine are hidden.
  document.addEventListener("click", e => {
    const b = e.target.closest(".nav button[data-action]");
    if (!b || !["overview", "twin"].includes(b.dataset.action)) return;
    show(b.dataset.action);
  });

  // Settings is handled by script.js (toast/modal): keep the current page highlighted.
  document.addEventListener("click", e => {
    const b = e.target.closest(".nav button[data-action]");
    if (!b || !["simulation", "reports", "settings"].includes(b.dataset.action)) return;
    setTimeout(() => $$(".nav button").forEach(x => x.classList.toggle("active", x.dataset.action === current)), 0);
  });

  /* ==========================================
     DAILY CHECKUP DATA (read from script.js records)
  ========================================== */

  const SYSTEM_META = {
    heart: { title: "Cardiovascular System", f: { hr: ["Heart rate", "bpm"], sys: ["Systolic BP", "mmHg"], dia: ["Diastolic BP", "mmHg"], hrv: ["HRV", "ms"] } },
    lungs: { title: "Respiratory System", f: { resp: ["Respiratory rate", "breaths/min"], spo2: ["SpO₂", "%"] } },
    bones: { title: "Bone & Skeletal System", f: { bmd: ["Reference BMD", "g/cm²"], exercise: ["Resistance exercise", "min"] } },
    kidneys: { title: "Renal & Urinary Health", f: { urineOutput: ["Urine output", "mL"], collectionHours: ["Collection period", "h"], weightKg: ["Body weight", "kg"], fluidIntake: ["Fluid intake", "mL"] } },
    brain: { title: "Sleep & Cognition", f: { sleep: ["Sleep duration", "h"], reaction: ["Reaction time", "ms"], mood: ["Mood (self-report)", "/10"] } },
    hand: { title: "Peripheral Pulse", f: { pulse: ["Pulse", "bpm"], spo2: ["SpO₂", "%"], skin: ["Skin temperature", "°C"], bodyTemp: ["Oral body temperature", "°C"], glucose: ["Blood glucose", "mg/dL"] } },
    env: { title: "Environment", f: { temp: ["Cabin temperature", "°C"], pressure: ["Cabin pressure", "kPa"], humidity: ["Humidity", "%"], co2: ["Carbon dioxide (CO₂)", "ppm"], noise: ["Noise level", "dB"], radiation: ["Radiation dose rate", "µSv/h"] } },
    muscles: { title: "Muscular System", f: { activity: ["Activity", "min"], strength: ["Training load", "kg"] } }
  };

  // Latest saved record per body system: { part: { title, date, values: { key: {label, unit, value} } } }
  function getCheckups() {
    const recs = load(KEYS.records, []);
    const out = {};
    (Array.isArray(recs) ? recs : []).forEach(r => {
      if (!r || !r.part || out[r.part]) return;      // newest first
      const meta = SYSTEM_META[r.part] || { title: r.part, f: {} };
      const values = {};
      Object.entries(r.values || {}).forEach(([k, v]) => {
        if (!Number.isFinite(Number(v))) return;
        const [label, unit] = meta.f[k] || [k, ""];
        values[k] = { label, unit, value: Number(v) };
      });
      if (Object.keys(values).length) out[r.part] = { title: meta.title, date: r.time, values };
    });
    return out;
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-go]");
    if (b) show(b.dataset.go);
  });

  /* ==========================================
     ANALYSIS — shared by Overview and the report
     Each item: { level, title, saw, todo }
  ========================================== */

  const R = (level, saw, todo) => ({ level, saw, todo });

  const METRIC_RULES = {
    hr: v => v < 60 ? R("review", "Heart rate below 60 bpm.", "Rest, hydrate and note any dizziness or fatigue. If you are not a trained athlete or feel unwell, tell your flight surgeon.")
      : v > 100 ? R("review", "Heart rate above 100 bpm.", "Rest 5–10 minutes, breathe slowly and measure again. If it stays high or you have chest discomfort, contact your flight surgeon.")
      : R("ok", "Heart rate within the demo reference.", "Keep your routine and measure at a similar time each day."),
    sys: v => v < 90 ? R("review", "Systolic pressure is low.", "Hydrate, stand up slowly and report dizziness or fainting.")
      : v < 120 ? R("ok", "Systolic pressure within the demo reference.", "Keep up exercise and hydration.")
      : v <= 180 ? R("review", "Systolic pressure above the reference.", "Re-measure after 5 minutes of rest, limit salt and report repeated high readings.")
      : R("alert", "Systolic pressure very high.", "Contact your flight surgeon now, especially with headache, vision changes or chest pain."),
    dia: v => v < 60 ? R("review", "Diastolic pressure is low.", "Hydrate and report dizziness.")
      : v < 80 ? R("ok", "Diastolic pressure within the demo reference.", "Keep up exercise and hydration.")
      : v <= 120 ? R("review", "Diastolic pressure above the reference.", "Re-measure after rest and report repeated high readings.")
      : R("alert", "Diastolic pressure very high.", "Contact your flight surgeon now."),
    resp: v => v < 12 || v >= 19 ? R("review", "Breathing rate outside the demo reference.", "Measure again at rest, check cabin air and CO₂ alerts, and report shortness of breath.")
      : R("ok", "Breathing rate within the demo reference.", "Keep it up."),
    spo2: v => v < 92 ? R("alert", "Oxygen saturation is low.", "Check your sensor, then contact your flight surgeon immediately if it stays low.")
      : v < 95 ? R("review", "Oxygen saturation slightly low.", "Re-measure at rest with warm hands and check cabin air quality.")
      : R("ok", "Oxygen saturation within the demo reference.", "Keep it up."),
    sleep: v => v < 6 ? R("review", "You slept less than 6 hours.", "Protect your sleep window, dim lights and limit screens and caffeine before bed.")
      : v > 9 ? R("review", "You slept more than 9 hours.", "Long sleep can signal fatigue or low mood. Watch the trend and mention it if it continues.")
      : R("ok", "Sleep duration looks healthy.", "Keep a steady schedule."),
    mood: v => v <= 4 ? R("review", "Your self-reported mood is low.", "Take the Mental Health check-in and talk to someone you trust.")
      : R("ok", "Self-reported mood is fine.", "Keep tracking it."),
    fluidIntake: v => v < 1500 ? R("review", "Fluid intake is low.", "Drink regularly during the day and follow your hydration plan.")
      : R("ok", "Fluid intake looks fine.", "Keep following your hydration plan."),
    activity: v => v < 30 ? R("review", "Activity time is low.", "Crew members train about 2 hours a day to protect bones and muscles. Log a session in Exercise & Recovery.")
      : R("ok", "Activity time looks fine.", "Keep following your plan."),
    exercise: v => v < 30 ? R("review", "Exercise time is low.", "Crew members train about 2 hours a day to protect bones and muscles. Log a session in Exercise & Recovery.")
      : R("ok", "Exercise time looks fine.", "Keep following your plan.")
  };
  METRIC_RULES.glucose = v => v < 54 ? R("alert", "Blood glucose is very low.", "Eat or drink 15 g of fast carbohydrate now, re-measure in 15 minutes and contact your flight surgeon.")
    : v < 70 ? R("review", "Blood glucose is low.", "Take 15 g of fast carbohydrate, re-measure in 15 minutes and note what you ate and when you trained.")
    : v <= 99 ? R("ok", "Blood glucose within the demo reference.", "Keep regular meals and hydration.")
    : v <= 125 ? R("review", "Blood glucose above the fasting reference.", "Measure again fasting (8 hours without food). Review meals and training, and report it if it repeats.")
    : v <= 250 ? R("review", "Blood glucose is high.", "Re-measure, drink water and avoid sugary food. Report repeated high readings to your flight surgeon.")
    : R("alert", "Blood glucose is very high.", "Contact your flight surgeon now.");
  METRIC_RULES.pulse = METRIC_RULES.hr;
  METRIC_RULES.bodyTemp = v => v < 36 ? R("review", "Body temperature is low.", "Warm up, check your suit or cabin temperature and measure again.")
    : v <= 37.8 ? R("ok", "Body temperature within the demo reference.", "Keep your routine.")
    : v <= 38.5 ? R("review", "Mild fever range.", "Rest, hydrate and re-measure in 1 hour. Report it if it persists or you have other symptoms.")
    : R("alert", "High temperature.", "Contact your flight surgeon now.");

  const GENERIC = R("info", "Value saved.", "Compare it with your personal baseline and trend over the next days.");

  function analyze() {
    const checkups = getCheckups();
    const sessions = load(KEYS.exercise, []);
    const out = { urgent: [], mental: [], checkup: [], exercise: [], hasData: false };

    /* ---- Mental health ---- */
    const mental = analyzeMental();
    if (mental.hasData) out.hasData = true;
    out.mental.push(...mental.mental);
    out.urgent.push(...mental.urgent);

    /* ---- Daily checkup ---- */
    Object.values(checkups).forEach(c => {
      out.hasData = true;
      Object.entries(c.values).forEach(([name, o]) => {
        const r = (METRIC_RULES[name] || (() => GENERIC))(o.value);
        if (r.level === "info") return;   // no reference range: shown in the report tables only
        out.checkup.push({
          level: r.level,
          title: `${c.title} · ${o.label}: ${o.value}`,
          saw: r.saw,
          todo: r.todo
        });
      });
    });

    /* ---- Environment ---- */
    if (window.AstroMedEnv) {
      window.AstroMedEnv.findings().forEach(f => {
        out.hasData = true;
        out.checkup.push({ level: f.level, title: f.title, saw: f.saw, todo: f.todo });
      });
    }

    /* ---- Radiation, immune, readiness, nutrition, fitness ---- */
    const extra = (obj, fn, cat) => { try { ((obj && obj[fn] && obj[fn]()) || []).forEach(f => { out.hasData = true; out[cat].push({ level: f.level, title: f.title, saw: f.saw, todo: f.todo }); }); } catch (e) { console.error(fn, e); } };
    extra(window.AstroMedReadiness, "findings", "checkup");
    extra(window.AstroMedRadiation, "findings", "checkup");
    extra(window.AstroMedReadiness, "immuneFindings", "checkup");
    extra(window.AstroMedNutrition, "findings", "exercise");
    extra(window.AstroMedMissions, "findings", "exercise");

    /* ---- Exercise ---- */
    if (sessions.length) {
      out.hasData = true;
      const week = sessions.filter(s => Date.now() - new Date(s.date) < 7 * 864e5);
      const types = new Set(week.map(s => s.type));
      const missing = ["ared", "t2", "cevis"].filter(t => !types.has(t)).map(t => t.toUpperCase());
      out.exercise.push(week.length < 3
        ? { level: "review", title: "Training this week", saw: `${week.length} session(s) logged in the last 7 days.`,
            todo: "Try to train most days. Exercise protects bones and muscles and also helps mood and sleep." }
        : { level: "ok", title: "Training this week", saw: `${week.length} sessions logged in the last 7 days.`,
            todo: "Great consistency. Keep following your plan." });
      if (week.length && missing.length) out.exercise.push({
        level: "review", title: "Training variety",
        saw: `No ${missing.join(", ")} session in the last 7 days.`,
        todo: "Combine resistance (ARED) for bones and muscles with running (T2) or cycling (CEVIS) for the heart."
      });
    } else {
      out.exercise.push({
        level: "review", title: "Training",
        saw: "No exercise sessions logged yet.",
        todo: "Log your next session in Exercise & Recovery so I can follow your recovery."
      });
    }

    return out;
  }

  /* ==========================================
     OVERVIEW — "the little doctor"
  ========================================== */

  window.AstroMedData = { getCheckups, SYSTEM_META, rule: (k, v) => (window.AstroMedEnv && window.AstroMedEnv.rule(k, v)) || (METRIC_RULES[k] || (() => GENERIC))(v), analyze, KEYS, load };

  const firstSentence = (t) => String(t).split(/(?<=\.)\s/)[0];
  const ICON = { ok: "✓", review: "!", alert: "!" };

  function cardHtml(x, open) {
    return `
      <details class="ov-card ${x.level}" ${open ? "open" : ""}>
        <summary>
          <span class="ov-ico">${ICON[x.level]}</span>
          <span class="ov-title">${esc(x.title)}</span>
          <span class="ov-act">${esc(firstSentence(x.todo))}</span>
        </summary>
        <div class="ov-body">
          <p><b>What I noticed:</b> ${esc(x.saw)}</p>
          <p><b>What we should do:</b> ${esc(x.todo)}</p>
        </div>
      </details>`;
  }

  function renderDoctor() {
    const a = analyze();
    const rest = [...a.mental, ...a.checkup, ...a.exercise];
    const all = [...a.urgent, ...rest];
    const count = { ok: 0, review: 0, alert: 0 };
    all.forEach((x) => count[x.level]++);

    const attention = rest.filter((x) => x.level !== "ok")
      .sort((p, q) => (q.level === "alert") - (p.level === "alert"));
    const good = rest.filter((x) => x.level === "ok");
    const focus = [...a.urgent, ...attention].slice(0, 3);

    $("#doctorPage").innerHTML = `
      <div class="am-heading">
        <h2>Overview</h2>
        <p>Because I care about you, this is what we should consider. Educational guidance, not a diagnosis.</p>
      </div>

      ${(() => { try { const R = window.AstroMedReadiness && window.AstroMedReadiness.compute(); if (!R || R.total == null) return ""; const c = R.total >= 80 ? "#35d49a" : R.total >= 60 ? "#6fe3ff" : R.total >= 40 ? "#ffc857" : "#ff6b6b"; return `<button type="button" class="ov-ready" data-action="readiness" style="border-color:${c}"><b style="color:${c}">${Math.round(R.total)}</b><span>Readiness score today<small>Tap to see what makes it</small></span></button>`; } catch (e) { return ""; } })()}
      <div class="ov-summary">
        <div class="ov-count ok"><b>${count.ok}</b><span>On track</span></div>
        <div class="ov-count review"><b>${count.review}</b><span>Watch</span></div>
        <div class="ov-count alert"><b>${count.alert}</b><span>Priority</span></div>
      </div>

      ${a.urgent.length ? `<div class="am-urgent-box"><h3>Please read this first</h3>${a.urgent.map((x) => cardHtml(x, true)).join("")}</div>` : ""}

      ${focus.length ? `<div class="ov-focus"><h3>Today’s focus</h3><ol>
        ${focus.map((x) => `<li class="${x.level}"><i></i><span><b>${esc(x.title)}:</b> ${esc(firstSentence(x.todo))}</span></li>`).join("")}
      </ol></div>` : ""}

      ${!all.length ? `<div class="am-panel"><p>I have no results yet. Complete the daily checkup and the mental-health check-in.</p>
        <button type="button" class="am-btn" data-go="overview">Start daily checkup</button></div>` : ""}

      ${attention.length ? `<h3 class="am-group">Needs attention</h3>
        <div class="ov-grid">${attention.map((x) => cardHtml(x, x.level === "alert")).join("")}</div>` : ""}

      ${good.length ? `<h3 class="am-group">On track</h3>
        <div class="ov-chips">${good.map((x) => `<span class="ov-chip">✓ ${esc(x.title)}</span>`).join("")}</div>` : ""}

      <div class="am-panel">
        <p>Your saved results and the medical report are in Protocols.</p>
        <button type="button" class="am-btn" data-go="protocols">Open Protocols</button>
      </div>`;
  }

  /* ==========================================
     PROTOCOLS — saved results + medical report
  ========================================== */

  let lastReport = null;

  function renderProtocols() {
    const checkups = getCheckups();
    const sessions = load(KEYS.exercise, []);
    const rows = protocolRows();
    const li = (name, value) => `<li><span>${name}</span><b>${value}</b></li>`;

    $("#protocolsPage").innerHTML = `
      <div class="am-heading">
        <h2>Protocols</h2>
        <p>Your saved results and the medical report for the ground team.</p>
      </div>

      <div class="am-panel">
        <h3>Saved results</h3>
        <ul class="am-saved">
          ${rows.map((r) => li(r.name, r.value ? esc(r.value) : "Not saved yet")).join("")}
          ${li("Daily checkup systems", Object.keys(checkups).length ? Object.values(checkups).map((c) => esc(c.title)).join(", ") : "Not saved yet")}
          ${li("Exercise sessions", sessions.length)}
        </ul>
      </div>

      <div class="am-panel am-consult">
        <h3>Prepare a medical report for the ground team</h3>
        <p>I will generate a PDF report from your saved results. It stays on this device until you download it and share it with the ground medical team.</p>
        <button type="button" class="am-btn" id="genReport">${lastReport ? "Update my report" : "Yes, generate my report"}</button>
      </div>

      <div id="reportArea"></div>`;

    $("#genReport").addEventListener("click", showReport);
    if (lastReport) showReport(null);   // already requested: refresh with the latest data
  }

  function showReport(ev) {
    const userClicked = !!(ev && ev.type === "click");
    const area = $("#reportArea");
    if (!window.AstroMedPDF) {
      area.innerHTML = `<div class="am-panel"><p>The report module is not loaded. Add astromed-pro.js to index.html.</p></div>`;
      return;
    }
    if (lastReport) URL.revokeObjectURL(lastReport.url);
    lastReport = window.AstroMedPDF.build();
    area.innerHTML = `
      <div class="am-panel">
        <h3>Your report is ready</h3>
        <p>Generated ${fmt(new Date().toISOString())} from your latest data. Share it with the ground medical team.</p>
        <div class="am-actions">
          <a class="am-btn" href="${lastReport.url}" download="${lastReport.filename}">Download PDF</a>
        </div>
        <iframe class="am-report" title="Medical report preview" src="${lastReport.url}"></iframe>
      </div>`;
    $(".am-report", area).style.height = "820px";
    if (userClicked) area.scrollIntoView({ behavior: "smooth", block: "start" });
  }

}

document.addEventListener("DOMContentLoaded", astromedSectionsInit);
