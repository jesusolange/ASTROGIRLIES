/* ==============================================
   ASTROMED — MISSIONS (daily tasks, points, streaks, equipment guide,
   reminders, VO2max every 14 days)
   The task list follows the structure of a standard ISS crew day
   (planning conference, work block, 2.5 h scheduled exercise, meals,
   evening conference, 8.5 h sleep window; ESA "The astronaut daily schedule").
   Educational prototype: not medical advice.
   Load AFTER astromed-profile.js and astromed-nutrition.js
============================================== */

(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const KEY = "astromed-missions";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rd = (k, fb) => window.AstroMedStore.store.get(k, fb);
  const wr = (k, v) => window.AstroMedStore.store.set(k, v);
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const dayOfTime = (t) => (t ? isoDay(new Date(t)) : null);
  const DAYMS = 864e5;
  const today = () => isoDay(new Date());
  const addDays = (iso, n) => { const d = parseIso(iso); d.setDate(d.getDate() + n); return isoDay(d); };

  const load = () => {
    const s = rd(KEY, null) || {};
    return { done: s.done || {}, auto: s.auto || {}, vo2: s.vo2 || [], reminders: s.reminders || null, fired: s.fired || {}, tab: s.tab || "today" };
  };
  const save = (s) => wr(KEY, s);

  /* ---------- tasks ---------- */
  // auto: detected from the app's own data. manual: the astronaut ticks it.
  const TASKS = [
    { id: "env", pts: 10, auto: true, t: "Check your environment", d: "Save your cabin readings." },
    { id: "checkup", pts: 15, auto: true, t: "Do your Daily Checkup", d: "Save at least one body measurement." },
    { id: "exercise", pts: 20, auto: true, t: "Scheduled exercise", d: "Log one exercise session. ISS crews train about 2.5 h a day." },
    { id: "meals", pts: 15, auto: true, t: "Log breakfast, lunch and dinner", d: "Add all three meals in Nutrition." },
    { id: "mental", pts: 10, auto: true, t: "Mental health check-in", d: "Pick how you feel today." },
    { id: "plan", pts: 5, auto: false, t: "Morning planning conference", d: "Read today's plan with the ground team." },
    { id: "house", pts: 5, auto: false, t: "Housekeeping", d: "Clean your area. Check air vents." },
    { id: "equip", pts: 5, auto: false, t: "Equipment check", d: "Dosimeter on, devices charged." },
    { id: "sleep", pts: 10, auto: false, t: "Keep your sleep window", d: "Go to bed on time. ISS crews sleep 8.5 h." },
    { id: "eve", pts: 5, auto: false, t: "Evening wrap-up", d: "Send your summary. Note anything for your doctor." }
  ];
  const MAXPTS = TASKS.reduce((a, t) => a + t.pts, 0);

  /* ---------- auto detection for a given day ---------- */
  function detect(day) {
    const out = {};
    const env = rd("astromed-env", {});
    const elog = rd("astromed-env-log", []);
    out.env = dayOfTime(env.time) === day || (Array.isArray(elog) && elog.some((e) => dayOfTime(e.time) === day));
    const recs = rd("astrotwin-gui-v2-records", []);
    out.checkup = Array.isArray(recs) && recs.some((r) => r && r.part !== "env" && dayOfTime(r.time) === day);
    const ex = rd("astrotwin-exercise-sessions", []);
    out.exercise = Array.isArray(ex) && ex.some((e) => dayOfTime(e.date) === day);
    const nu = rd("astromed-nutrition", { entries: [] }).entries || [];
    const meals = new Set(nu.filter((e) => dayOfTime(e.time) === day).map((e) => e.meal));
    out.meals = ["Breakfast", "Lunch", "Dinner"].every((m) => meals.has(m));
    const m = rd("astromed-mental", {});
    out.mental = [m.mood, m.depression, m.stress].some((x) => x && dayOfTime(x.date) === day);
    return out;
  }

  // Remember auto results so history survives (some sources only keep the latest entry)
  function snapshot(s, day) {
    const d = detect(day);
    const prev = s.auto[day] || [];
    const set = new Set(prev);
    Object.entries(d).forEach(([k, v]) => { if (v) set.add(k); });
    s.auto[day] = [...set];
  }
  function doneSet(s, day) {
    snapshot(s, day);
    return new Set([...(s.auto[day] || []), ...(s.done[day] || [])]);
  }
  function dayPoints(s, day) {
    const ds = doneSet(s, day);
    return TASKS.reduce((a, t) => a + (ds.has(t.id) ? t.pts : 0), 0);
  }

  function stats(s) {
    const t = today();
    const first = Object.keys({ ...s.auto, ...s.done }).sort()[0] || t;
    let total = 0;
    for (let d = first; d <= t; d = addDays(d, 1)) total += dayPoints(s, d);
    total += s.vo2.length * 30;
    // streak: consecutive days with >= 60% of points; today may still be in progress
    let streak = 0, d = t;
    if (dayPoints(s, d) < MAXPTS * 0.6) d = addDays(d, -1);
    while (dayPoints(s, d) >= MAXPTS * 0.6 && d >= addDays(t, -400)) { streak++; d = addDays(d, -1); }
    const avg = (from, n) => { let a = 0; for (let i = 0; i < n; i++) a += dayPoints(s, addDays(from, -i)); return (a / n / MAXPTS) * 100; };
    const thisWk = avg(t, 7), prevWk = avg(addDays(t, -7), 7);
    return { total, streak, thisWk, prevWk, level: Math.floor(total / 250) + 1 };
  }
  const TITLES = ["Cadet", "Crew Member", "Flight Specialist", "Mission Specialist", "Senior Astronaut", "Commander"];
  const titleOf = (lvl) => TITLES[Math.min(TITLES.length - 1, lvl - 1)];

  function badges(s, st) {
    const ds = doneSet(s, today());
    const recs = rd("astrotwin-gui-v2-records", []);
    const parts = new Set((Array.isArray(recs) ? recs : []).filter((r) => dayOfTime(r.time) === today()).map((r) => r.part));
    return [
      { on: st.streak >= 3, n: "3-day streak", i: "🔥" },
      { on: st.streak >= 7, n: "7-day streak", i: "🚀" },
      { on: st.streak >= 14, n: "14-day streak", i: "🛰️" },
      { on: ds.size === TASKS.length, n: "Perfect day", i: "⭐" },
      { on: parts.size >= 6, n: "Full-body checkup", i: "🫀" },
      { on: s.vo2.length >= 1, n: "First VO₂max", i: "🏃" },
      { on: s.vo2.length >= 3, n: "Fitness tracker", i: "📈" }
    ];
  }

  /* ---------- VO2max ---------- */
  const VO2_EVERY = 14;
  function vo2Due(s) {
    if (!s.vo2.length) return { days: 0, last: null };
    const last = s.vo2.slice().sort((a, b) => new Date(b.time) - new Date(a.time))[0];
    const next = addDays(dayOfTime(last.time), VO2_EVERY);
    return { days: Math.round((parseIso(next) - parseIso(today())) / DAYMS), last, next };
  }
  function vo2Chart(list) {
    const pts = list.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
    if (pts.length < 2) return "<p class=\"mi-note\">Add at least two tests to see your trend.</p>";
    const W = 640, H = 200, pad = 36;
    const vals = pts.map((p) => p.value);
    const lo = Math.floor(Math.min(...vals) - 2), hi = Math.ceil(Math.max(...vals) + 2);
    const x = (i) => pad + (i / (pts.length - 1)) * (W - pad * 2);
    const y = (v) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2);
    return `<svg class="pg-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="VO2max trend">
      ${[lo, (lo + hi) / 2, hi].map((v) => `<line x1="${pad}" x2="${W - pad}" y1="${y(v)}" y2="${y(v)}" stroke="#e1eaf6"/><text x="${pad - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#4a6283">${Math.round(v)}</text>`).join("")}
      <polyline fill="none" stroke="#2f7be0" stroke-width="3" points="${pts.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")}"/>
      ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.value)}" r="5" fill="#2f7be0"/><text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="10" fill="#4a6283">${new Date(p.time).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</text>`).join("")}
    </svg>`;
  }

  /* ---------- equipment guide ---------- */
  const EQUIP = {
    pulse: { name: "Pulse oximeter", icon: "🩸", use: "Pulse and SpO₂", steps: ["Sit and rest for 5 minutes. Warm your hand if it is cold.", "Remove nail polish and clip the sensor on your index finger, display facing up.", "Rest the hand at heart level and keep still. Do not talk.", "Wait 15–30 seconds until the number stops changing.", "Write down pulse and SpO₂ in the Daily Checkup."], note: "Cold fingers and movement give false low readings." },
    bp: { name: "Blood pressure cuff", icon: "💪", use: "Systolic and diastolic pressure", steps: ["Sit with your back supported and feet flat if gravity allows. Rest 5 minutes.", "Place the cuff on the bare upper arm, bottom edge about 2 cm above the elbow.", "Support the arm at heart level. Do not talk or move.", "Press start. The cuff inflates, then slowly releases.", "Take a second reading after 1 minute. Record both."], note: "Avoid caffeine and exercise for 30 minutes before." },
    gluco: { name: "Glucometer", icon: "🩹", use: "Blood glucose (mg/dL)", steps: ["Wash and dry your hands.", "Insert a fresh test strip. The meter turns on.", "Use the lancing device on the side of a fingertip.", "Touch the drop of blood to the strip edge.", "Read the result after the countdown and record it. Dispose of the lancet safely."], note: "Note whether the reading is fasting or after a meal." },
    thermo: { name: "Thermometer", icon: "🌡️", use: "Body temperature", steps: ["Wait 15 minutes after eating, drinking or exercise.", "Clean the tip and switch the thermometer on.", "Place the tip under the tongue, lips closed.", "Hold until it beeps.", "Record the value in the Daily Checkup."], note: "A reading above 37.8 °C needs follow-up in the Overview." },
    dosi: { name: "Radiation dosimeter", icon: "☢️", use: "Personal radiation dose", steps: ["Wear it on the body, in the same place every day.", "Check the display or light shows it is running.", "Read the dose at the same time each day.", "Record it in the Environment page.", "Report any sudden jump to the ground team."], note: "Your own baseline matters more than a single number." }
  };
  let eqSel = "pulse", eqStep = 0, eqTimer = null;

  function equipHtml() {
    const e = EQUIP[eqSel];
    return `<div class="am-panel"><h3>How to use your devices</h3>
      <div class="mi-eqtabs">${Object.entries(EQUIP).map(([k, v]) => `<button type="button" class="mi-eqtab ${k === eqSel ? "on" : ""}" data-eq="${k}">${v.icon} ${esc(v.name)}</button>`).join("")}</div>
      <div class="mi-eq">
        <div class="mi-scene mi-s-${eqSel} step${eqStep}" aria-hidden="true">${scene(eqSel)}</div>
        <div class="mi-steps">
          <p class="mi-note"><b>${esc(e.name)}</b> · ${esc(e.use)}</p>
          <ol>${e.steps.map((t, i) => `<li class="${i === eqStep ? "on" : i < eqStep ? "past" : ""}" data-step="${i}">${esc(t)}</li>`).join("")}</ol>
          <div class="am-actions"><button type="button" class="am-btn" id="eqPlay">${eqTimer ? "Pause" : "Play steps"}</button>
            <button type="button" class="am-btn am-btn-soft" id="eqNext" style="margin-top:0">Next step</button></div>
          <p class="mi-note">${esc(e.note)} Follow your device manual.</p>
        </div>
      </div></div>`;
  }
  function scene(k) {
    const hand = `<g class="hand"><rect x="60" y="120" width="120" height="46" rx="22" fill="#f1c8a5"/><rect x="150" y="124" width="60" height="16" rx="8" fill="#f1c8a5"/></g>`;
    const S = {
      pulse: `<svg viewBox="0 0 280 200">${hand}<g class="clip"><rect x="148" y="100" width="64" height="40" rx="10" fill="#335f9e"/><rect x="156" y="108" width="30" height="14" rx="3" fill="#0f2a4d"/><text x="171" y="119" font-size="10" fill="#7bf0b4" text-anchor="middle" class="num">98</text><circle cx="200" cy="130" r="4" fill="#ff5d5d" class="beat"/></g><path d="M20 60h50l10-24 14 48 12-30h40" fill="none" stroke="#e0504a" stroke-width="3" class="ecg"/></svg>`,
      bp: `<svg viewBox="0 0 280 200"><g class="arm"><rect x="40" y="90" width="180" height="46" rx="23" fill="#f1c8a5"/></g><rect class="cuff" x="100" y="80" width="62" height="66" rx="10" fill="#335f9e"/><rect x="210" y="40" width="54" height="34" rx="6" fill="#0f2a4d"/><text x="237" y="62" font-size="14" fill="#7bf0b4" text-anchor="middle" class="num">120</text><path d="M162 112h40v-20" stroke="#335f9e" stroke-width="4" fill="none"/></svg>`,
      gluco: `<svg viewBox="0 0 280 200"><rect x="90" y="40" width="100" height="130" rx="14" fill="#335f9e"/><rect x="104" y="54" width="72" height="34" rx="5" fill="#0f2a4d"/><text x="140" y="78" font-size="18" fill="#7bf0b4" text-anchor="middle" class="num">92</text><rect x="126" y="150" width="28" height="42" rx="3" fill="#d9e6f5"/><path class="drop" d="M140 118c-10 14-10 22 0 22s10-8 0-22z" fill="#e0504a"/></svg>`,
      thermo: `<svg viewBox="0 0 280 200"><rect x="40" y="90" width="190" height="20" rx="10" fill="#d9e6f5" stroke="#335f9e" stroke-width="3"/><rect class="merc" x="46" y="95" width="10" height="10" rx="5" fill="#e0504a"/><circle cx="236" cy="100" r="14" fill="#e0504a"/><text x="140" y="150" font-size="18" fill="#7bf0b4" text-anchor="middle" class="num">36.8 °C</text></svg>`,
      dosi: `<svg viewBox="0 0 280 200"><rect x="95" y="50" width="90" height="100" rx="14" fill="#335f9e"/><circle cx="140" cy="100" r="26" fill="#0f2a4d"/><path d="M140 100l0-20M140 100l17 10M140 100l-17 10" stroke="#ffd34d" stroke-width="5" stroke-linecap="round" class="spin" style="transform-origin:140px 100px"/><circle cx="170" cy="62" r="5" fill="#7bf0b4" class="blink"/></svg>`
    };
    return S[k];
  }

  /* ---------- reminders ---------- */
  const DEFAULT_REM = [
    { id: "r1", time: "08:00", text: "Morning planning conference and Daily Checkup", on: true },
    { id: "r2", time: "12:30", text: "Log lunch and drink water", on: true },
    { id: "r3", time: "17:00", text: "Scheduled exercise session", on: true },
    { id: "r4", time: "21:30", text: "Evening wrap-up and prepare for the sleep window", on: true }
  ];
  const rems = (s) => s.reminders || DEFAULT_REM;
  function checkReminders() {
    const s = load(), now = new Date(), hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, day = today();
    let changed = false;
    rems(s).forEach((r) => {
      if (!r.on || r.time !== hm || s.fired[`${day}|${r.id}`]) return;
      s.fired[`${day}|${r.id}`] = 1; changed = true;
      notify(`Reminder · ${r.time}`, r.text);
    });
    const v = vo2Due(s);
    if (v.days <= 0 && hm === "09:00" && !s.fired[`${day}|vo2`]) { s.fired[`${day}|vo2`] = 1; changed = true; notify("VO₂max test due", "Your 14-day fitness test is due today."); }
    if (changed) { Object.keys(s.fired).forEach((k) => { if (k.slice(0, 10) < addDays(day, -3)) delete s.fired[k]; }); save(s); }
  }
  function notify(title, body) {
    try { if (window.Notification && Notification.permission === "granted") new Notification(title, { body }); } catch (e) { /* ignore */ }
    document.querySelector(".mi-toast")?.remove();
    const t = document.createElement("div");
    t.className = "mi-toast"; t.setAttribute("role", "status");
    t.innerHTML = `<b>${esc(title)}</b><span>${esc(body)}</span><button type="button" aria-label="Dismiss">×</button>`;
    t.querySelector("button").addEventListener("click", () => t.remove());
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 20000);
  }

  /* ---------- render ---------- */
  function render() {
    const page = $("#missionsPage");
    if (!page) return;
    const s = load();
    const st = stats(s);
    save(s);
    const P = window.AstroMedProfile;
    const nm = P && P.name();
    const day = today();
    const ds = doneSet(s, day);
    const pts = dayPoints(s, day);
    const delta = st.thisWk - st.prevWk;
    const lvlBase = (st.level - 1) * 250;
    const tabs = [["today", "Today"], ["equip", "Devices"], ["fit", "VO₂max"], ["rem", "Reminders"]];

    let body = "";
    if (s.tab === "today") {
      body = `<div class="am-panel"><h3>Today's missions <small class="mi-small">${pts} / ${MAXPTS} points</small></h3>
        <div class="mi-prog"><i style="width:${(pts / MAXPTS) * 100}%"></i></div>
        <div class="mi-tasks">${TASKS.map((t) => {
          const isDone = ds.has(t.id), autoDone = (s.auto[day] || []).includes(t.id);
          return `<label class="mi-task ${isDone ? "done" : ""}">
            <input type="checkbox" data-task="${t.id}" ${isDone ? "checked" : ""} ${t.auto ? "disabled" : ""}>
            <span class="mi-chk" aria-hidden="true">${isDone ? "✓" : ""}</span>
            <span class="mi-tx"><b>${esc(t.t)}</b><small>${esc(t.d)}</small></span>
            <span class="mi-pts">${t.auto ? (autoDone ? "auto ✓" : "auto") : ""} +${t.pts}</span></label>`;
        }).join("")}</div>
        <p class="mi-note">"auto" tasks tick themselves when you save data in the app.</p></div>
        <div class="am-panel"><h3>Last 14 days</h3>
          <div class="mi-bars">${Array.from({ length: 14 }, (_, i) => addDays(day, i - 13)).map((d) => { const p = dayPoints(s, d) / MAXPTS * 100; const md = P && P.get() && P.get().startDate ? P.missionDay(parseIso(d)) : null; return `<div class="mi-bcol" title="${d}: ${Math.round(p)}%"><i style="height:${Math.max(2, p)}%" class="${p >= 60 ? "ok" : ""}"></i><small>${md != null && md >= 1 ? md : "–"}</small></div>`; }).join("")}</div>
          <p class="mi-note">Bars = your daily points. Number = mission day. Green = good day (60% or more).</p></div>
        <div class="am-panel"><h3>Badges</h3><div class="mi-badges">${badges(s, st).map((b) => `<div class="mi-badge ${b.on ? "on" : ""}"><span>${b.i}</span><small>${esc(b.n)}</small></div>`).join("")}</div></div>`;
    } else if (s.tab === "equip") {
      body = equipHtml();
    } else if (s.tab === "fit") {
      const v = vo2Due(s);
      const sorted = s.vo2.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
      const first = sorted[0], last = sorted[sorted.length - 1];
      body = `<div class="am-panel"><h3>VO₂max every 14 days</h3>
        <p class="mi-note">VO₂max shows how fit your heart and lungs are. Test every 2 weeks to see if training works.</p>
        <div class="mi-kpis"><div><small>Next test</small><b>${!s.vo2.length ? "Do your first test" : v.days <= 0 ? "Due today" : `In ${v.days} day${v.days === 1 ? "" : "s"}`}</b></div>
          <div><small>Latest</small><b>${last ? `${last.value.toFixed(1)} mL/kg/min` : "–"}</b></div>
          <div><small>Change since first</small><b>${first && last && first !== last ? `${last.value - first.value >= 0 ? "+" : ""}${(last.value - first.value).toFixed(1)}` : "–"}</b></div></div>
        <form id="voForm" class="mi-form">
          <label class="pg-field"><span>Method</span><select name="method"><option value="direct">Direct value (mL/kg/min)</option><option value="cooper">Cooper 12-minute run: distance (m)</option></select></label>
          <label class="pg-field"><span id="voLab">VO₂max (mL/kg/min)</span><input name="val" type="number" step="any" min="1" required></label>
          <div class="am-actions"><button class="am-btn" type="submit">Save test (+30 points)</button></div>
          <p class="mi-note" style="grid-column:1/-1">Cooper test: run as far as you can in 12 minutes. Estimate = (metres − 504.9) ÷ 44.73. A bike test (cycle ergometer) gives a direct value.</p>
        </form></div>
        <div class="am-panel"><h3>Your trend</h3>${vo2Chart(s.vo2)}
          ${sorted.length ? `<div class="nu-list" style="margin-top:12px">${sorted.slice().reverse().map((x) => `<div class="nu-item"><div><span><b>${x.value.toFixed(1)} mL/kg/min</b> · ${esc(x.method === "cooper" ? "Cooper estimate" : "Direct")}</span><small>${new Date(x.time).toLocaleDateString("en-GB", { dateStyle: "medium" })}${window.AstroMedProfile && window.AstroMedProfile.dayOf(x.time) >= 1 ? ` · Mission day ${window.AstroMedProfile.dayOf(x.time)}` : ""}</small></div><button type="button" class="nu-del" data-vodel="${x.id}" aria-label="Delete test">×</button></div>`).join("")}</div>` : ""}</div>`;
    } else {
      const R = rems(s);
      const perm = window.Notification ? Notification.permission : "unsupported";
      body = `<div class="am-panel"><h3>Reminders</h3>
        <p class="mi-note">Reminders pop up on screen at the set time while the app is open${perm === "granted" ? " and as system notifications" : ""}. Your VO₂max reminder is automatic.</p>
        <div class="nu-list">${R.map((r) => `<div class="nu-item"><label class="mi-switch"><input type="checkbox" data-remon="${r.id}" ${r.on ? "checked" : ""}><span>${esc(r.time)}</span></label><div><span>${esc(r.text)}</span></div><button type="button" class="nu-del" data-remdel="${r.id}" aria-label="Delete reminder">×</button></div>`).join("") || "<p class=\"mi-note\">No reminders.</p>"}</div>
        <form id="remForm" class="mi-form" style="margin-top:14px">
          <label class="pg-field"><span>Time</span><input name="time" type="time" required value="09:00"></label>
          <label class="pg-field" style="grid-column:span 2"><span>Reminder</span><input name="text" type="text" maxlength="80" required placeholder="e.g. Take vitamin D"></label>
          <div class="am-actions"><button class="am-btn" type="submit">Add reminder</button>
            ${perm === "default" ? `<button class="am-btn am-btn-soft" type="button" id="remPerm" style="margin-top:0">Allow notifications</button>` : ""}</div>
        </form></div>`;
    }

    page.innerHTML = `
      <div class="am-heading"><h2>Missions</h2>
        <p>Daily tasks like a real ISS crew day. Earn points and build a streak.</p></div>
      <div class="am-panel mi-hero">
        <div class="mi-who"><span class="mi-av">👩🏻‍🚀</span><div><b>${esc(nm || "Astronaut")}</b><small>${P ? esc(P.dayLabel()) : ""}</small></div></div>
        <div class="mi-lv"><small>Level ${st.level} · ${esc(titleOf(st.level))}</small><div class="mi-prog"><i style="width:${((st.total - lvlBase) / 250) * 100}%"></i></div><small>${st.total} points · ${250 - (st.total - lvlBase)} to next level</small></div>
        <div class="mi-hk"><div><small>Streak</small><b>${st.streak} 🔥</b></div>
          <div><small>This week</small><b>${Math.round(st.thisWk)}%</b></div>
          <div><small>vs last week</small><b class="${delta >= 0 ? "up" : "down"}">${st.prevWk > 0 || st.thisWk > 0 ? `${delta >= 0 ? "+" : ""}${Math.round(delta)} pts` : "–"}</b></div></div>
      </div>
      <div class="mi-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" class="mi-tab ${s.tab === k ? "on" : ""}" data-tab="${k}">${l}</button>`).join("")}</div>
      ${body}`;
    bind(page);
  }

  function bind(page) {
    page.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { stopEq(); const s = load(); s.tab = b.dataset.tab; save(s); render(); }));
    page.querySelectorAll("[data-task]").forEach((c) => c.addEventListener("change", () => {
      const s = load(), d = today(), set = new Set(s.done[d] || []);
      c.checked ? set.add(c.dataset.task) : set.delete(c.dataset.task);
      s.done[d] = [...set]; save(s); render();
    }));
    page.querySelectorAll("[data-eq]").forEach((b) => b.addEventListener("click", () => { stopEq(); eqSel = b.dataset.eq; eqStep = 0; render(); }));
    $("#eqNext", page)?.addEventListener("click", () => { eqStep = (eqStep + 1) % EQUIP[eqSel].steps.length; render(); });
    $("#eqPlay", page)?.addEventListener("click", () => {
      if (eqTimer) { stopEq(); render(); return; }
      eqStep = 0;
      eqTimer = setInterval(() => {
        eqStep = (eqStep + 1) % EQUIP[eqSel].steps.length;
        if ($("#missionsPage")?.hidden) { stopEq(); return; }
        render();
      }, 3000);
      render();
    });
    const vf = $("#voForm", page);
    if (vf) {
      const upd = () => { $("#voLab", page).textContent = vf.elements.method.value === "cooper" ? "Distance in 12 minutes (m)" : "VO₂max (mL/kg/min)"; };
      vf.elements.method.addEventListener("change", upd);
      vf.addEventListener("submit", (e) => {
        e.preventDefault();
        let v = Number(vf.elements.val.value);
        const method = vf.elements.method.value;
        if (method === "cooper") v = (v - 504.9) / 44.73;
        if (!(v > 5 && v < 90)) { vf.elements.val.setCustomValidity("This value gives an unrealistic VO₂max. Check it."); vf.elements.val.reportValidity(); setTimeout(() => vf.elements.val.setCustomValidity(""), 100); return; }
        const s = load(); s.vo2.push({ id: Date.now().toString(36), time: new Date().toISOString(), value: Math.round(v * 10) / 10, method }); save(s); render();
      });
    }
    page.querySelectorAll("[data-vodel]").forEach((b) => b.addEventListener("click", () => { const s = load(); s.vo2 = s.vo2.filter((x) => x.id !== b.dataset.vodel); save(s); render(); }));
    $("#remForm", page)?.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = load(), f = e.target;
      s.reminders = [...rems(s), { id: "r" + Date.now().toString(36), time: f.elements.time.value, text: f.elements.text.value.trim(), on: true }].sort((a, b) => a.time.localeCompare(b.time));
      save(s); render();
    });
    page.querySelectorAll("[data-remon]").forEach((c) => c.addEventListener("change", () => { const s = load(); s.reminders = rems(s).map((r) => r.id === c.dataset.remon ? { ...r, on: c.checked } : r); save(s); }));
    page.querySelectorAll("[data-remdel]").forEach((b) => b.addEventListener("click", () => { const s = load(); s.reminders = rems(s).filter((r) => r.id !== b.dataset.remdel); save(s); render(); }));
    $("#remPerm", page)?.addEventListener("click", () => { try { Notification.requestPermission().then(render); } catch (e) { /* ignore */ } });
  }
  function stopEq() { if (eqTimer) { clearInterval(eqTimer); eqTimer = null; } }

  setInterval(checkReminders, 30000);
  setTimeout(checkReminders, 2000);

  function findings() {
    const s = load(), v = vo2Due(s), out = [];
    if (!s.vo2.length) return out;
    if (v.days <= -3) out.push({ level: "review", title: "Fitness · VO₂max test overdue", saw: `Your last test was ${VO2_EVERY - v.days} days ago. The plan is one test every ${VO2_EVERY} days.`, todo: "Do a VO₂max test this week so we can see your fitness trend." });
    const l = s.vo2.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
    if (l.length >= 2) {
      const a = l[l.length - 2].value, b = l[l.length - 1].value, drop = (a - b) / a;
      if (drop >= 0.15) out.push({ level: "alert", title: "Fitness · VO₂max dropped", saw: `VO₂max went from ${a} to ${b} (${Math.round(drop * 100)}% lower).`, todo: "Tell your flight surgeon. Check your sleep, food and how often you do aerobic training." });
      else if (drop >= 0.08) out.push({ level: "review", title: "Fitness · VO₂max is lower", saw: `VO₂max went from ${a} to ${b} (${Math.round(drop * 100)}% lower).`, todo: "Add more aerobic sessions (CEVIS or T2) this week and test again in 14 days." });
      else out.push({ level: "ok", title: "Fitness · VO₂max", saw: `Latest ${b} (before: ${a}).`, todo: "Your aerobic fitness is stable. Keep training." });
    }
    return out;
  }
  function lastVo2() {
    const l = load().vo2.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
    return l.length ? { value: l[l.length - 1].value, time: l[l.length - 1].time, prev: l.length > 1 ? l[l.length - 2].value : null } : null;
  }

  window.AstroMedMissions = { render, stats: () => stats(load()), findings, lastVo2 };
})();
