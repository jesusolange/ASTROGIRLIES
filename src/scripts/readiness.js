/* ==============================================
   ASTROMED — READINESS SCORE + IMMUNE WATCH
   Combines all modules into one 0-100 score.
   Weights and bands are design choices of this prototype (not NASA values).
   Load AFTER the other astromed-* modules, BEFORE astromed-pro.js
============================================== */
(function () {
  "use strict";
  const KEY = "astromed-immune";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rd = (k, fb) => window.AstroMedStore.store.get(k, fb);
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const LV = { ok: 100, review: 55, alert: 15 };
  const ageDays = (iso) => (Date.now() - new Date(iso).getTime()) / 864e5;

  /* ---------- immune watch ---------- */
  const SYMPTOMS = [
    ["fever", "Fever or chills"], ["throat", "Sore throat"], ["cough", "Cough or runny nose"],
    ["rash", "Skin rash or itching"], ["sores", "Cold sores or mouth sores"], ["tired", "Very tired, more than usual"], ["heal", "Cuts or sores heal slowly"]
  ];
  const imm = () => { const v = rd(KEY, {}); return { log: v.log || {} }; };
  const saveImm = (v) => window.AstroMedStore.store.set(KEY, v);

  function riskFactors() {
    const r = [];
    const m = rd("astromed-mental", {});
    if (m.stress && ageDays(m.stress.date) < 14 && m.stress.level !== "ok") r.push("High stress");
    const recs = rd("astrotwin-gui-v2-records", []);
    const br = (Array.isArray(recs) ? recs : []).find((x) => x && x.part === "brain" && x.values && Number.isFinite(Number(x.values.sleep)) && ageDays(x.time) < 4);
    if (br && Number(br.values.sleep) < 6) r.push("Little sleep");
    const R = window.AstroMedRadiation && window.AstroMedRadiation.status();
    if (R && R.hasData && R.level !== "ok") r.push("High radiation dose");
    const N = window.AstroMedNutrition && window.AstroMedNutrition.summary();
    if (N && N.ratio < 0.8) r.push("Eating too little");
    const ex = rd("astrotwin-exercise-sessions", []).filter((s) => ageDays(s.date) < 7).length;
    if (ex < 2) r.push("Little exercise");
    return r;
  }
  function immuneStatus() {
    const today = isoDay(new Date()), log = imm().log;
    const sym = log[today] || [];
    const risks = riskFactors();
    let level = "ok";
    if (sym.includes("fever") || sym.length >= 3) level = "alert";
    else if (sym.length >= 1 || risks.length >= 3) level = "review";
    return { sym, risks, level, saved: today in log };
  }
  function immuneFindings() {
    const s = immuneStatus(); if (s.level === "ok" && !s.saved) return [];
    const T = {
      ok: "No signs today. Keep sleeping, eating and training well to support your defenses.",
      review: "Rest more, drink water and watch for changes. If symptoms last more than 2 days, tell your flight surgeon.",
      alert: "Please contact your flight surgeon today. Fever or several symptoms need a medical check."
    };
    const saw = s.sym.length ? `Today you marked: ${s.sym.map((id) => SYMPTOMS.find((x) => x[0] === id)[1].toLowerCase()).join(", ")}.` : `Risk factors now: ${s.risks.join(", ")}.`;
    return [{ level: s.level, title: "Immune system watch", saw: s.sym.length || s.risks.length ? saw : "No symptoms today.", todo: T[s.level] }];
  }

  /* ---------- readiness ---------- */
  const PARTS = [
    { id: "checkup", w: 25, n: "Body checkup", i: "🫀", tip: "Do your daily checkup. Tap each body part." },
    { id: "mental", w: 20, n: "Mind & stress", i: "🧠", tip: "Do a short mental check-in. It takes 2 minutes." },
    { id: "exercise", w: 15, n: "Exercise", i: "🏋️", tip: "Train today. Aim for about 4 sessions a week." },
    { id: "nutrition", w: 15, n: "Food", i: "🍽️", tip: "Log your meals and reach your calorie goal." },
    { id: "radiation", w: 10, n: "Radiation", i: "☢️", tip: "Log your dose to see how much of your limit is used." },
    { id: "env", w: 5, n: "Environment", i: "🛰️", tip: "Save the air readings of your location." },
    { id: "immune", w: 10, n: "Immune system", i: "🛡️", tip: "Answer the symptom list below." }
  ];

  function score(id) {
    try {
      if (id === "checkup") {
        const cs = window.AstroMedData ? Object.values(window.AstroMedData.getCheckups()) : [];
        const lv = [];
        cs.filter((c) => ageDays(c.date) < 3).forEach((c) => Object.entries(c.values).forEach(([k, o]) => {
          const r = window.AstroMedData.rule(k, o.value); if (r && LV[r.level] != null) lv.push(LV[r.level]);
        }));
        return lv.length ? { s: lv.reduce((a, b) => a + b, 0) / lv.length, note: `${lv.length} readings in the last 3 days` } : null;
      }
      if (id === "mental") {
        const m = rd("astromed-mental", {}), lv = [];
        ["depression", "stress"].forEach((k) => { if (m[k] && ageDays(m[k].date) < 14 && LV[m[k].level] != null) lv.push(LV[m[k].level]); });
        return lv.length ? { s: lv.reduce((a, b) => a + b, 0) / lv.length, note: "check-ins of the last 14 days" } : null;
      }
      if (id === "exercise") {
        const ss = rd("astrotwin-exercise-sessions", []);
        if (!ss.length) return null;
        const n = ss.filter((x) => ageDays(x.date) < 7).length;
        return { s: Math.min(100, (n / 4) * 100), note: `${n} sessions in 7 days` };
      }
      if (id === "nutrition") {
        const N = window.AstroMedNutrition && window.AstroMedNutrition.summary(); if (!N) return null;
        const dev = Math.max(0, Math.abs(N.ratio - 1) - 0.1);
        return { s: Math.max(0, 100 - (dev / 0.4) * 100), note: `${Math.round(N.ratio * 100)}% of calorie goal` };
      }
      if (id === "radiation") {
        const R = window.AstroMedRadiation && window.AstroMedRadiation.status(); if (!R || !R.hasData) return null;
        return { s: LV[R.level], note: `${R.pct.toFixed(1)}% of career limit` };
      }
      if (id === "env") {
        const e = rd("astromed-env", null); if (!e || !e.readings) return null;
        const f = window.AstroMedEnv.findings();
        const s = 100 - f.filter((x) => x.level === "alert").length * 25 - f.filter((x) => x.level === "review").length * 10;
        return { s: Math.max(0, s), note: f.length ? `${f.length} reading(s) to review` : "all readings fine" };
      }
      if (id === "immune") {
        const st = immuneStatus(); if (!st.saved && st.risks.length === 0) return null;
        return { s: LV[st.level], note: st.sym.length ? `${st.sym.length} symptom(s) today` : `${st.risks.length} risk factor(s)` };
      }
    } catch (e) { console.error("readiness", id, e); }
    return null;
  }

  function compute() {
    const parts = PARTS.map((p) => ({ ...p, r: score(p.id) }));
    const have = parts.filter((p) => p.r);
    const wsum = have.reduce((a, p) => a + p.w, 0);
    const total = wsum ? have.reduce((a, p) => a + p.r.s * p.w, 0) / wsum : null;
    return { parts, total, coverage: wsum };
  }
  const band = (v) => v >= 80 ? { t: "Ready", c: "#35d49a", e: "🚀", d: "You are in good shape for today's work." }
    : v >= 60 ? { t: "Almost ready", c: "#6fe3ff", e: "🙂", d: "Fine for normal work. Fix the lowest items below." }
    : v >= 40 ? { t: "Take it easy", c: "#ffc857", e: "😮‍💨", d: "Keep tasks light and work on the items below." }
    : { t: "Rest and call ground", c: "#ff6b6b", e: "🛑", d: "Rest today and talk with your flight surgeon." };

  function findings() {
    const c = compute(); if (c.total == null) return [];
    const b = band(c.total);
    const level = c.total >= 80 ? "ok" : c.total >= 50 ? "review" : "alert";
    const low = c.parts.filter((p) => p.r && p.r.s < 60).map((p) => p.n.toLowerCase());
    return [{ level, title: `Readiness score: ${Math.round(c.total)}/100 (${b.t})`, saw: `Based on ${c.parts.filter((p) => p.r).length} of ${PARTS.length} areas${low.length ? `. Lowest: ${low.join(", ")}` : ""}.`, todo: b.d }];
  }

  /* ---------- page ---------- */
  function ring(v, col) {
    const R = 78, C = 2 * Math.PI * R, o = C * (1 - v / 100);
    return `<svg viewBox="0 0 200 200" width="220" height="220" role="img" aria-label="Readiness ${Math.round(v)} of 100">
      <circle cx="100" cy="100" r="${R}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="16"/>
      <circle cx="100" cy="100" r="${R}" fill="none" stroke="${col}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${o}" transform="rotate(-90 100 100)" style="filter:drop-shadow(0 0 8px ${col});transition:stroke-dashoffset 1s"/>
      <text x="100" y="108" text-anchor="middle" font-size="52" font-weight="800" fill="#e9f2ff">${Math.round(v)}</text>
      <text x="100" y="132" text-anchor="middle" font-size="14" fill="#9fb8da">of 100</text></svg>`;
  }
  function render() {
    const page = $("#readinessPage"); if (!page) return;
    const c = compute(), im = immuneStatus();
    const b = c.total != null ? band(c.total) : null;
    const colOf = (s) => (s >= 80 ? "#35d49a" : s >= 60 ? "#6fe3ff" : s >= 40 ? "#ffc857" : "#ff6b6b");
    const todo = c.parts.slice().sort((a, b2) => (a.r ? a.r.s : 50) - (b2.r ? b2.r.s : 50)).filter((p) => !p.r || p.r.s < 80).slice(0, 3);
    page.innerHTML = `
      <div class="am-heading"><h2>Readiness</h2><p>One number for how ready you are today. It joins your checkup, mind, exercise, food, radiation, air and immune watch.</p></div>
      <div class="am-panel rdy-top">
        <div class="rdy-ring">${c.total != null ? ring(c.total, b.c) : `<div class="rdy-empty">?</div>`}</div>
        <div class="rdy-txt">${c.total != null ? `<h3 style="color:${b.c}">${b.e} ${b.t}</h3><p>${b.d}</p><small>Uses ${c.parts.filter((p) => p.r).length} of ${PARTS.length} areas (${c.coverage}% of the score). Areas with no data are left out, not counted as zero.</small>` : `<h3>No data yet</h3><p>Do a checkup or log a meal and your score will appear here.</p>`}</div>
      </div>
      ${todo.length ? `<div class="am-panel"><h3>Do this to raise your score</h3><div class="rdy-todo">${todo.map((p) => `<div><span>${p.i}</span><b>${p.n}</b><p>${esc(p.tip)}</p></div>`).join("")}</div></div>` : ""}
      <div class="am-panel"><h3>What makes the score</h3><div class="rdy-bars">${c.parts.map((p) => `<div class="rdy-bar"><span class="rdy-i">${p.i}</span><div><div class="rdy-l"><b>${p.n}</b><small>${p.r ? esc(p.r.note) : "no data yet"} · weight ${p.w}%</small></div><div class="rdy-t"><i style="width:${p.r ? Math.round(p.r.s) : 0}%;background:${p.r ? colOf(p.r.s) : "transparent"}"></i></div></div><em>${p.r ? Math.round(p.r.s) : "–"}</em></div>`).join("")}</div>
        <p class="am-small">Weights and colors are a design choice of this prototype to help you see the big picture. They are not a medical or NASA score.</p></div>
      <div class="am-panel"><h3>🛡️ Immune system watch</h3>
        <p class="am-small">Space travel changes the immune system and can wake up dormant viruses (Crucian et al., 2018, Frontiers in Immunology). Tick what you feel today.</p>
        <div class="rdy-sym">${SYMPTOMS.map(([id, l]) => `<label class="rdy-chip ${im.sym.includes(id) ? "on" : ""}"><input type="checkbox" data-sym="${id}" ${im.sym.includes(id) ? "checked" : ""}> ${l}</label>`).join("")}</div>
        <div class="rdy-imm rdy-${im.level}"><b>${{ ok: "No warning signs", review: "Keep watching", alert: "Call your flight surgeon" }[im.level]}</b>
          <span>${im.risks.length ? `Risk factors now: ${im.risks.join(", ")}.` : "No risk factors found from your other data."}</span></div>
        <div class="am-actions"><button class="am-btn" id="rdyImmSave">Save today</button></div>
      </div>`;
    $("#rdyImmSave", page).addEventListener("click", () => {
      const sym = [...page.querySelectorAll("[data-sym]:checked")].map((x) => x.dataset.sym);
      const v = imm(); v.log[isoDay(new Date())] = sym; saveImm(v); render();
    });
    page.querySelectorAll("[data-sym]").forEach((x) => x.addEventListener("change", () => x.parentElement.classList.toggle("on", x.checked)));
  }

  window.AstroMedReadiness = { render, compute, findings, immuneFindings };
})();
