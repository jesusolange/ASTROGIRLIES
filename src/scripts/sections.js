/* ==============================================
   ASTROMED — MENTAL HEALTH · OVERVIEW · PROTOCOLS
   Educational prototype — not a medical device.
   Load AFTER script.js, exercise.js, health-indicators.js
============================================== */

function astromedSectionsInit() {

  console.log("AstroMed sections loaded ✓");

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const KEYS = {
    mental: "astromed-mental",
    records: "astrotwin-gui-v2-records",
    exercise: "astrotwin-exercise-sessions",
    reports: "astromed-reports"
  };

  const load = (k, fb) => window.AstroMedStore.store.get(k, fb);
  const store = (k, v) => window.AstroMedStore.store.set(k, v);
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = iso => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  const main = $(".content");
  const footer = $(".footer", main);
  if (!main || !footer) return;

  /* ==========================================
     QUESTIONNAIRE DATA
  ========================================== */

  const DEP_OPTS = ["Not at all", "On certain days", "More than half the time", "Almost every day"];

  const DEP_Q = [
    "Decreased interest in everyday activities and/or no fulfilment",
    "Despondency or helplessness",
    "Problems falling asleep, insufficient sleep or sleeping more",
    "Tiredness or a feeling of fatigue",
    "Loss of appetite or increased need to eat",
    "Negative thoughts about yourself: feeling like a failure or like you disappoint your family",
    "Hard time concentrating, for example when reading or watching TV",
    "Your speech has become slower and others have commented on it, or the opposite: you speak very fast",
    "Have you wished you were dead or had suicidal thoughts"
  ];

  const DEP_TIPS = {
    0: "Plan one small activity you enjoy every day (music, a hobby, photographing Earth, a call home).",
    1: "Share how you feel with a crewmate or ground support. Feeling helpless is common on long missions and it can be worked on.",
    2: "Keep a fixed sleep schedule, dim the lights and avoid screens and caffeine in the hour before sleep.",
    3: "Review your workload, sleep and nutrition together, and schedule real rest blocks.",
    4: "Keep regular meals, track what you eat and report unintended weight changes.",
    5: "Write down three things you did well today and talk with someone you trust about these thoughts.",
    6: "Work in short, focused blocks with breaks and avoid multitasking.",
    7: "Ask a crewmate if they notice the change too, and mention it at your next medical conference."
  };

  const STRESS_OPTS = ["None", "Slight", "Strong"];

  const CATS = {
    body: "Body signs",
    emotional: "Emotional signs",
    cognitive: "Cognitive signals",
    behavioural: "Behavioural signs"
  };

  const STRESS_Q = [
    ["Heart pounding", "body"], ["Tightness in the chest", "body"], ["Breathing problems", "body"],
    ["Problems falling asleep", "body"], ["Chronic fatigue", "body"], ["Digestion problems", "body"],
    ["Stomach pain", "body"], ["Loss of appetite", "body"], ["Muscle tightness", "body"],
    ["Back pain", "body"], ["Cold hands/feet", "body"], ["Strong sweating", "body"],

    ["Nervousness", "emotional"], ["Irritability or anger issues", "emotional"], ["Fear", "emotional"],
    ["Dissatisfaction", "emotional"], ["Loss of interest", "emotional"], ["Inner emptiness", "emotional"],
    ["Nightmares", "emotional"],

    ["Constantly circling thoughts", "cognitive"], ["Difficulty concentrating", "cognitive"],
    ["Feeling mentally blank/blackout", "cognitive"], ["Daydreaming", "cognitive"],
    ["Reduced performance/frequent mistakes", "cognitive"],

    ["Aggression towards others", "behavioural"],
    ["Drumming fingers, shuffling feet, trembling, grinding teeth", "behavioural"],
    ["Speaking rapidly or stuttering", "behavioural"],
    ["Interrupting others, inability to listen", "behavioural"],
    ["Eating irregularly", "behavioural"],
    ["Consuming alcohol (or medication) to calm down", "behavioural"],
    ["Neglecting personal relationships", "behavioural"],
    ["Smoking more than desired", "behavioural"],
    ["Getting less exercise or physical activity than desired", "behavioural"]
  ];

  const ALCOHOL_IDX = STRESS_Q.findIndex(q => q[0].startsWith("Consuming alcohol"));

  const STRESS_CAT_TIPS = {
    body: "Try slow breathing (4 seconds in, 6 out) and progressive muscle relaxation for 10 minutes. Exercise sessions also release tension.",
    emotional: "Name the emotion, talk it through with a crewmate or ground support, and protect some private, quiet time.",
    cognitive: "Write your circling thoughts down, then pick one task and finish it. Use short breaks to reset your focus.",
    behavioural: "Pick one habit to adjust this week. Keep contact with family and crew, and keep your exercise routine."
  };

  const MOODS = [
    ["😄", "Great", "great"], ["🙂", "Okay", "okay"], ["😰", "Stressed", "stressed"],
    ["😔", "Down", "down"], ["😶", "Not sure", "unsure"]
  ];

  /* ==========================================
     RESULT BANDS
  ========================================== */

  function depLevel(s) {
    if (s < 5) return ["Healthy", "ok"];
    if (s < 10) return ["No suspicion", "ok"];
    if (s < 15) return ["Mild depression symptoms", "review"];
    if (s < 20) return ["Moderate depression symptoms", "review"];
    return ["Severe depression symptoms", "alert"];
  }

  function stressBand(s) {
    if (s <= 10) return {
      level: "ok", label: "Stable",
      text: "You can be glad about your relatively good stability. Relaxation training will mainly have a preventive effect."
    };
    if (s <= 20) return {
      level: "review", label: "Stress reactions have started",
      text: "The chain reaction of physical and emotional stress responses is already happening. You should start soon to expand your stress-coping skills."
    };
    return {
      level: "alert", label: "High stress load",
      text: "You are already deep in the vicious circle of tension, emotional strain and health problems. You should definitely do something about your stress, and for more calm, rest and performance."
    };
  }

  /* ==========================================
     INJECT PAGES
  ========================================== */

  const depForm = DEP_Q.map((q, i) => `
    <div class="am-q">
      <p>${esc(q)}</p>
      <div class="am-opts am-opts-4">
        ${DEP_OPTS.map((o, v) => `
          <label><input type="radio" name="d${i}" value="${v}" required><span>${o}</span></label>`).join("")}
      </div>
    </div>`).join("");

  const stressForm = Object.keys(CATS).map(cat => `
    <h4 class="am-cat">${CATS[cat]}</h4>
    ${STRESS_Q.map((q, i) => q[1] !== cat ? "" : `
      <div class="am-q am-q-row">
        <p>${esc(q[0])}</p>
        <div class="am-opts am-opts-3">
          ${STRESS_OPTS.map((o, v) => `
            <label><input type="radio" name="s${i}" value="${v}" ${v === 0 ? "checked" : ""}><span>${o}</span></label>`).join("")}
        </div>
      </div>`).join("")}`).join("");

  footer.insertAdjacentHTML("beforebegin", `
    <section id="mentalPage" class="am-page" hidden>
      <div class="am-heading">
        <h2>Mental Health</h2>
        <p>Isolation and confinement are one of the five NASA human-spaceflight hazards. A quick check-in helps you spot changes early.</p>
      </div>

      <div class="am-panel">
        <h3>How are you feeling?</h3>
        <div class="am-moods">
          ${MOODS.map(m => `<button type="button" class="am-mood" data-mood="${m[2]}"><span>${m[0]}</span>${m[1]}</button>`).join("")}
        </div>
        <p id="moodReply" class="am-reply" role="status" aria-live="polite"></p>
      </div>

      <div class="am-tabs" role="tablist">
        <button type="button" class="am-tab active" data-tab="dep" role="tab">Isolation &amp; depression</button>
        <button type="button" class="am-tab" data-tab="stress" role="tab">Stress &amp; burn-out</button>
      </div>

      <div id="tabDep" class="am-panel">
        <h3>How often have you experienced any of the following symptoms?</h3>
        <form id="depForm">${depForm}
          <button class="am-btn" type="submit">See my result</button>
        </form>
        <div id="depResult"></div>
      </div>

      <div id="tabStress" class="am-panel" hidden>
        <h3>How strongly do you notice these signs?</h3>
        <form id="stressForm">${stressForm}
          <button class="am-btn" type="submit">See my result</button>
        </form>
        <div id="stressResult"></div>
      </div>
    </section>

    <section id="environmentPage" class="am-page" hidden></section>
    <section id="nutritionPage" class="am-page" hidden></section>
    <section id="missionsPage" class="am-page" hidden></section>
    <section id="radiationPage" class="am-page" hidden></section>
    <section id="readinessPage" class="am-page" hidden></section>
    <section id="progressPage" class="am-page" hidden></section>
    <section id="doctorPage" class="am-page" hidden></section>
    <section id="protocolsPage" class="am-page" hidden></section>
  `);

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
  // Creates the page (<section id="<id>Page" class="am-page">) and its sidebar button; render(pageElement)
  // runs each time the section opens. `before` is the data-action of the sidebar button to insert in front of.
  // Pass nav: false for a page that is opened only through AstroMedNav.show(id).
  const REGISTERED = {};
  function register({ id, label, icon = "ic-report", render, before, nav = true }) {
    if (PAGES[id]) return;
    PAGES[id] = `${id}Page`;
    REGISTERED[id] = render || (() => {});
    const anchor = document.getElementById("protocolsPage");
    anchor.insertAdjacentHTML("afterend", `<section id="${id}Page" class="am-page" hidden></section>`);
    if (!nav) return;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = id;
    button.innerHTML = `<svg class="icon"><use href="#${icon}"/></svg>`;
    button.append(label);
    const navEl = $(".nav");
    navEl.insertBefore(button, (before && $(`.nav button[data-action="${before}"]`)) || $(".nav-foot", navEl));
  }
  window.AstroMedNav = { register, show, current: () => current };

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

  /* ==========================================
     MENTAL HEALTH LOGIC
  ========================================== */

  const moodReplies = {
    great: ["dep", "Great to hear! A short check-in now and then still helps you notice trends. Choose either test."],
    okay: ["dep", "Thanks for sharing. Take the depression and isolation check-in, or switch to the stress test."],
    stressed: ["stress", "That sounds heavy. I opened the stress and burn-out test for you."],
    down: ["dep", "I'm sorry you feel that way, and I'm glad you're checking in. I opened the isolation and depression test for you."],
    unsure: ["dep", "That's fine. Start with this test, and try the stress one afterwards. Together they give a clearer picture."]
  };

  function setTab(tab) {
    $$(".am-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
    $("#tabDep").hidden = tab !== "dep";
    $("#tabStress").hidden = tab !== "stress";
  }

  $$(".am-tab").forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));

  $$(".am-mood").forEach(b => b.addEventListener("click", () => {
    $$(".am-mood").forEach(x => x.classList.toggle("selected", x === b));
    const [tab, text] = moodReplies[b.dataset.mood];
    $("#moodReply").textContent = text;
    setTab(tab);
    const m = load(KEYS.mental, {});
    m.mood = { value: b.dataset.mood, date: new Date().toISOString() };
    store(KEYS.mental, m);
  }));

  $("#depForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    if (!f.reportValidity()) return;
    const answers = DEP_Q.map((_, i) => Number(f.elements["d" + i].value));
    const score = answers.reduce((a, b) => a + b, 0);
    const [label, level] = depLevel(score);

    const m = load(KEYS.mental, {});
    m.depression = { score, label, level, answers, date: new Date().toISOString() };
    store(KEYS.mental, m);

    $("#depResult").innerHTML = `
      <div class="am-result am-${level}">
        <strong>${score} / 27 · ${label}</strong>
        <p>Bands: healthy under 5, no suspicion under 10, mild 10–14, moderate 15–19, severe 20–27. This is a screening, not a diagnosis.</p>
        ${answers[8] > 0 ? `<p class="am-urgent"><b>You answered that you wished you were dead or had suicidal thoughts.</b>
          Please tell your flight surgeon or crew support right now, or a crewmate you trust. You deserve support and you are not alone.
          If you are in immediate danger, use your emergency procedures.</p>` : ""}
        <button type="button" class="am-btn am-btn-soft" data-go="doctor">See my Overview</button>
      </div>`;
    $("#depResult").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  $("#stressForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    const answers = STRESS_Q.map((_, i) => Number(f.elements["s" + i].value));
    const sub = {};
    Object.keys(CATS).forEach(c => sub[c] = { score: 0, max: 0 });
    STRESS_Q.forEach((q, i) => { sub[q[1]].score += answers[i]; sub[q[1]].max += 2; });
    const score = answers.reduce((a, b) => a + b, 0);
    const band = stressBand(score);

    const m = load(KEYS.mental, {});
    m.stress = { score, label: band.label, level: band.level, answers, sub, date: new Date().toISOString() };
    store(KEYS.mental, m);

    $("#stressResult").innerHTML = `
      <div class="am-result am-${band.level}">
        <strong>${score} / ${STRESS_Q.length * 2} · ${band.label}</strong>
        <p>${band.text}</p>
        <p class="am-small">${Object.keys(CATS).map(c => `${CATS[c]}: ${sub[c].score}/${sub[c].max}`).join(" · ")}</p>
        <button type="button" class="am-btn am-btn-soft" data-go="doctor">See my Overview</button>
      </div>`;
    $("#stressResult").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

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

  const RANK = { ok: 0, review: 1, alert: 2 };

  function analyze() {
    const m = load(KEYS.mental, {});
    const checkups = getCheckups();
    const sessions = load(KEYS.exercise, []);
    const out = { urgent: [], mental: [], checkup: [], exercise: [], hasData: false };

    /* ---- Depression ---- */
    if (m.depression) {
      out.hasData = true;
      const d = m.depression;
      const base = {
        ok: "Keep your routine: regular sleep, daily exercise and regular contact with family and friends.",
        review: "Plan a private conversation with ground behavioral-health support in the coming days, and keep routines for sleep, exercise and social contact.",
        alert: "Please contact your flight surgeon or behavioral-health support today. Severe symptoms deserve professional help."
      }[d.level];
      out.mental.push({
        level: d.level,
        title: "Isolation & depression check-in",
        saw: `Score ${d.score}/27: ${d.label}.`,
        todo: base
      });

      const tips = d.answers.slice(0, 8)
        .map((a, i) => a >= 2 ? DEP_TIPS[i] : null).filter(Boolean);
      if (tips.length) out.mental.push({
        level: "review",
        title: "Symptoms that appear often",
        saw: "You marked some symptoms for more than half of the days.",
        todo: tips.join(" ")
      });

      if (d.answers[8] > 0) out.urgent.push({
        level: "alert",
        title: "Thoughts of death or suicide",
        saw: "You answered that you wished you were dead or had suicidal thoughts.",
        todo: "Please contact your flight surgeon or crew support right now, or tell a crewmate. You are not alone and help is available. If you are in immediate danger, use your emergency procedures."
      });
    }

    /* ---- Stress ---- */
    if (m.stress) {
      out.hasData = true;
      const s = m.stress;
      const b = stressBand(s.score);
      out.mental.push({
        level: b.level,
        title: "Stress & burn-out check-in",
        saw: `Score ${s.score}/${STRESS_Q.length * 2}: ${b.label}. ${b.text}`,
        todo: {
          ok: "Use relaxation training as prevention. Even 10 minutes a day helps.",
          review: "Start building stress-coping skills now: relaxation training, short breaks and a talk with ground support.",
          alert: "Make stress relief a priority this week and ask for a conversation with behavioral-health support."
        }[b.level]
      });

      Object.keys(CATS).forEach(c => {
        const x = s.sub[c];
        if (x.score / x.max >= 0.4) out.mental.push({
          level: "review",
          title: CATS[c],
          saw: `${x.score}/${x.max} points, so this area carries much of your stress.`,
          todo: STRESS_CAT_TIPS[c]
        });
      });

      if (ALCOHOL_IDX >= 0 && s.answers[ALCOHOL_IDX] > 0) out.mental.push({
        level: "alert",
        title: "Using alcohol or medication to calm down",
        saw: "You marked using alcohol or medication to calm down.",
        todo: "Please do not self-medicate. Talk with your flight surgeon about safe ways to relax and sleep."
      });
    }

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
        <p>Need a human doctor? I can prepare your report in Protocols.</p>
        <button type="button" class="am-btn" data-go="protocols">Open Protocols</button>
      </div>`;
  }

  /* ==========================================
     PROTOCOLS — saved results + doctor report
  ========================================== */

  let lastReport = null;

  function renderProtocols() {
    const m = load(KEYS.mental, {});
    const checkups = getCheckups();
    const sessions = load(KEYS.exercise, []);
    const li = (name, value) => `<li><span>${name}</span><b>${value}</b></li>`;

    $("#protocolsPage").innerHTML = `
      <div class="am-heading">
        <h2>Protocols</h2>
        <p>Your saved results and the medical report for the ground team.</p>
      </div>

      <div class="am-panel">
        <h3>Saved results</h3>
        <ul class="am-saved">
          ${li("Mood check", m.mood ? `${esc(m.mood.value)} · ${fmt(m.mood.date)}` : "Not saved yet")}
          ${li("Isolation & depression", m.depression ? `${m.depression.score}/27 · ${esc(m.depression.label)}` : "Not saved yet")}
          ${li("Stress & burn-out", m.stress ? `${m.stress.score}/${STRESS_Q.length * 2} · ${esc(m.stress.label)}` : "Not saved yet")}
          ${li("Daily checkup systems", Object.keys(checkups).length ? Object.values(checkups).map((c) => esc(c.title)).join(", ") : "Not saved yet")}
          ${li("Exercise sessions", sessions.length)}
        </ul>
      </div>

      <div class="am-panel am-consult">
        <h3>Would you like a consultation with a real doctor?</h3>
        <p>I will generate a PDF report so they can assist you more efficiently. You don’t need to worry about anything else.</p>
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
