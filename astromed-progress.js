/* ==============================================
   ASTROMED — PROGRESS (dynamic charts over time)
   Keeps its own history so entries can be added or deleted
   without touching the daily-checkup records of script.js.
   Load AFTER astromed-sections.js
============================================== */

(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const KEY = "astromed-history";
  const COLORS = { ok: "#24a879", review: "#edb43f", alert: "#e35252", info: "#7c8da4" };

  /* Normal (green) band drawn behind each chart. Illustrative reference ranges. */
  const BANDS = {
    "heart.hr": [60, 100], "heart.sys": [90, 120], "heart.dia": [60, 80],
    "lungs.resp": [12, 18], "lungs.spo2": [95, 100],
    "brain.sleep": [6, 9], "brain.mood": [5, 10],
    "hand.pulse": [60, 100], "hand.spo2": [95, 100], "hand.bodyTemp": [36, 37.8], "hand.glucose": [70, 99],
    "env.temp": [18, 27], "env.pressure": [95, 105], "env.humidity": [30, 60], "env.co2": [0, 3000], "env.noise": [30, 60],
    "muscles.activity": [30, 180], "bones.exercise": [30, 180], "kidneys.fluidIntake": [1500, 4000]
  };

  /* Typical value, daily noise, drift per day — only for the demo-data button. */
  const DEMO = {
    hr: [76, 4, 0.15], sys: [118, 5, 0.2], dia: [76, 3, 0.1], hrv: [42, 5, -0.2],
    resp: [16, 1, 0], spo2: [97.5, 0.8, -0.03],
    exercise: [45, 10, 0.4], bmd: [1.12, 0.004, -0.001],
    urineOutput: [1500, 180, 0], collectionHours: [24, 0, 0], weightKg: [65, 0.3, -0.02], fluidIntake: [2000, 250, -10],
    sleep: [7.2, 0.5, -0.04], reaction: [285, 18, 1.5], mood: [7, 0.8, -0.05],
    pulse: [72, 4, 0.1], skin: [33.1, 0.4, 0], bodyTemp: [36.8, 0.15, 0.01], glucose: [90, 7, 0.4],
    activity: [65, 12, 0.3], strength: [25, 2, 0.15],
    temp: [22, 0.6, 0], pressure: [101.3, 0.4, 0], humidity: [45, 4, 0], co2: [2400, 250, 40], noise: [55, 3, 0.2], radiation: [20, 2, 0.1]
  };

  const load = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      return v && Array.isArray(v.entries) ? v : { entries: [], seen: [] };
    } catch { return { entries: [], seen: [] }; }
  };
  const save = (h) => { try { localStorage.setItem(KEY, JSON.stringify(h)); } catch (e) { console.error(e); } };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAY = 864e5;

  let h = load();
  let sel = "";
  let days = 7;
  let confirming = "";

  const data = () => window.AstroMedData;
  const meta = () => data().SYSTEM_META;
  const label = (id) => { const [p, k] = id.split("."); return (meta()[p]?.f[k] || [k, ""])[0]; };
  const unit = (id) => { const [p, k] = id.split("."); return (meta()[p]?.f[k] || [k, ""])[1]; };
  const levelOf = (id, v) => (data().rule(id.split(".")[1], v) || {}).level || "info";
  const fmtNum = (v) => (Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 100) / 100);
  const of = (id) => h.entries.filter((e) => `${e.part}.${e.key}` === id).sort((a, b) => new Date(a.time) - new Date(b.time));
  const allIds = () => Object.entries(meta()).flatMap(([p, m]) => Object.keys(m.f).map((k) => `${p}.${k}`));

  /* Import new daily-checkup records saved by script.js (never re-adds deleted ones). */
  function sync() {
    const recs = data().load(data().KEYS.records, []);
    let changed = false;
    (Array.isArray(recs) ? recs : []).forEach((r) => {
      if (!r || !r.part) return;
      const sig = `${r.part}|${r.time}`;
      if (h.seen.includes(sig)) return;
      h.seen.push(sig);
      Object.entries(r.values || {}).forEach(([k, v]) => {
        if (Number.isFinite(Number(v))) h.entries.push({ id: uid(), part: r.part, key: k, value: Number(v), time: r.time, src: "checkup" });
      });
      changed = true;
    });
    // environment log (Environment page)
    const elog = data().load("astromed-env-log", []);
    (Array.isArray(elog) ? elog : []).forEach((e) => {
      const sig = `env|${e.time}`;
      if (!e || h.seen.includes(sig)) return;
      h.seen.push(sig);
      Object.entries(e.readings || {}).forEach(([k, v]) => {
        if (Number.isFinite(Number(v))) h.entries.push({ id: uid(), part: "env", key: k, value: Number(v), time: e.time, src: "checkup" });
      });
      changed = true;
    });
    if (h.seen.length > 4000) h.seen = h.seen.slice(-3000);
    if (changed) save(h);
  }

  function avg(arr) { return arr.length ? arr.reduce((s, e) => s + e.value, 0) / arr.length : null; }

  function windowStats(id) {
    const now = Date.now();
    const list = of(id);
    const cur = list.filter((e) => now - new Date(e.time) < 7 * DAY);
    const prev = list.filter((e) => now - new Date(e.time) >= 7 * DAY && now - new Date(e.time) < 14 * DAY);
    return { n: cur.length, cur: avg(cur), prev: avg(prev) };
  }

  /* ---------- chart ---------- */
  function chart(id) {
    const now = Date.now();
    const from = now - days * DAY;
    const pts = of(id).filter((e) => new Date(e.time) >= from);
    const W = 720, H = 300, L = 46, R = 16, T = 16, B = 34;
    const band = BANDS[id];
    const vals = pts.map((e) => e.value);
    let lo = Math.min(...(vals.length ? vals : [0]), ...(band ? [band[0]] : []));
    let hi = Math.max(...(vals.length ? vals : [1]), ...(band ? [band[1]] : []));
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
    const x = (t) => L + ((t - from) / (now - from)) * (W - L - R);
    const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);

    let s = `<svg viewBox="0 0 ${W} ${H}" class="pg-svg" role="img" aria-label="${esc(label(id))} over the last ${days} days">`;
    if (band) s += `<rect x="${L}" y="${y(band[1])}" width="${W - L - R}" height="${Math.max(2, y(band[0]) - y(band[1]))}" fill="#24a879" opacity=".14"/><text x="${W - R - 4}" y="${y(band[1]) + 12}" text-anchor="end" class="pg-note">reference range</text>`;
    for (let i = 0; i <= 4; i++) {
      const v = lo + ((hi - lo) * i) / 4;
      s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#e6ecf4"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="pg-tick">${Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 10) / 10}</text>`;
    }
    const step = days <= 7 ? 1 : days <= 14 ? 2 : 5;
    for (let d = 0; d <= days; d += step) {
      const t = now - (days - d) * DAY;
      const lab = new Date(t).toLocaleDateString("en-GB", days <= 7 ? { weekday: "short" } : { day: "2-digit", month: "short" });
      s += `<text x="${x(t)}" y="${H - 10}" text-anchor="middle" class="pg-tick">${lab}</text>`;
    }
    if (pts.length) {
      const mean = avg(pts);
      s += `<line x1="${L}" x2="${W - R}" y1="${y(mean)}" y2="${y(mean)}" stroke="#2866bf" stroke-dasharray="5 5" opacity=".6"/><text x="${L + 4}" y="${y(mean) - 5}" class="pg-note" fill="#2866bf">your average ${fmtNum(mean)}</text>`;
      s += `<polyline fill="none" stroke="#2866bf" stroke-width="2.5" stroke-linejoin="round" points="${pts.map((e) => `${x(new Date(e.time))},${y(e.value)}`).join(" ")}"/>`;
      pts.forEach((e) => {
        s += `<circle cx="${x(new Date(e.time))}" cy="${y(e.value)}" r="5.5" fill="${COLORS[levelOf(id, e.value)]}" stroke="#fff" stroke-width="2"><title>${fmtNum(e.value)} ${esc(unit(id))} · ${new Date(e.time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</title></circle>`;
      });
    } else {
      s += `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="pg-empty">No readings in the last ${days} days</text>`;
    }
    return s + "</svg>";
  }

  /* ---------- page ---------- */
  function arrow(cur, prev) {
    if (cur == null || prev == null || prev === 0) return { txt: "—", cls: "flat" };
    const d = ((cur - prev) / Math.abs(prev)) * 100;
    if (Math.abs(d) < 1) return { txt: "→ 0%", cls: "flat" };
    return { txt: `${d > 0 ? "↑" : "↓"} ${Math.abs(d).toFixed(1)}%`, cls: d > 0 ? "up" : "down" };
  }

  /* Other modules at a glance: readiness, VO2max, radiation, food */
  function extraPanel() {
    const cards = [];
    try {
      const R = window.AstroMedReadiness && window.AstroMedReadiness.compute();
      if (R && R.total != null) cards.push(["🚀", "Readiness", `${Math.round(R.total)}<small>/100</small>`, R.total >= 80 ? "ok" : R.total >= 60 ? "info" : "review"]);
      const V = window.AstroMedMissions && window.AstroMedMissions.lastVo2();
      if (V) { const d = V.prev != null ? V.value - V.prev : null; cards.push(["🏃", "VO₂max", `${V.value}<small> mL/kg/min</small>`, d == null ? "info" : d < 0 ? "review" : "ok", d == null ? "first test" : `${d >= 0 ? "+" : ""}${Math.round(d * 10) / 10} since last test`]); }
      const D = window.AstroMedRadiation && window.AstroMedRadiation.status();
      if (D && D.hasData) cards.push(["☢️", "Radiation used", `${D.pct.toFixed(1)}<small>% of limit</small>`, D.level, `${D.career.toFixed(1)} mSv total`]);
      const N = window.AstroMedNutrition && window.AstroMedNutrition.summary();
      if (N) cards.push(["🍽️", "Calories", `${Math.round(N.ratio * 100)}<small>% of goal</small>`, N.ratio < 0.8 || N.ratio > 1.2 ? "review" : "ok", "last logged days"]);
    } catch (e) { console.error(e); }
    if (!cards.length) return "";
    const col = { ok: "#35d49a", info: "#6fe3ff", review: "#ffc857", alert: "#ff6b6b" };
    return `<div class="am-panel"><h3>Fitness, radiation and readiness</h3><div class="pg-grid">${cards.map(([i, l, v, lv, sub]) => `<div class="pg-card"><i style="background:${col[lv] || col.info}"></i><span>${i} ${l}</span><b>${v}</b>${sub ? `<small>${sub}</small>` : ""}</div>`).join("")}</div></div>`;
  }

  function render() {
    sync();
    const page = $("#progressPage");
    if (!page) return;
    const ids = allIds();
    if (!sel || !ids.includes(sel)) sel = ids.find((i) => of(i).length) || "heart.hr";
    const withData = ids.filter((i) => of(i).length);
    const st = windowStats(sel);
    const a = arrow(st.cur, st.prev);
    const list = of(sel).slice(-8).reverse();

    page.innerHTML = `
      <div class="am-heading">
        <h2>Progress</h2>
        <p>Watch how your indicators change day by day. Every Daily Checkup you save appears here automatically.</p>
      </div>

      <div class="am-panel">
        <div class="pg-controls">
          <label class="pg-field"><span>Indicator</span>
            <select id="pgSel">
              ${Object.entries(meta()).map(([p, m]) => `<optgroup label="${esc(m.title)}">${Object.keys(m.f).map((k) => `<option value="${p}.${k}" ${`${p}.${k}` === sel ? "selected" : ""}>${esc(m.f[k][0])} (${of(`${p}.${k}`).length})</option>`).join("")}</optgroup>`).join("")}
            </select>
          </label>
          <div class="pg-seg" role="group" aria-label="Time range">
            ${[7, 14, 30].map((d) => `<button type="button" data-days="${d}" class="${d === days ? "on" : ""}">${d === 7 ? "Week" : d + " days"}</button>`).join("")}
          </div>
        </div>
        <h3 class="pg-title">${esc(label(sel))} <small>${esc(unit(sel))}</small></h3>
        ${chart(sel)}
        <div class="pg-stats">
          <div><small>This week</small><b>${st.cur == null ? "—" : fmtNum(st.cur)}</b></div>
          <div><small>Last week</small><b>${st.prev == null ? "—" : fmtNum(st.prev)}</b></div>
          <div><small>Change</small><b class="pg-${a.cls}">${a.txt}</b></div>
          <div><small>Readings (7 days)</small><b>${st.n}</b></div>
        </div>
      </div>

      <div class="am-panel">
        <h3>Add a reading</h3>
        <form id="pgAdd" class="pg-add">
          <label class="pg-field"><span>${esc(label(sel))} (${esc(unit(sel))})</span><input type="number" step="any" id="pgVal" required></label>
          <label class="pg-field"><span>Date and time</span><input type="datetime-local" id="pgWhen"></label>
          <button type="submit" class="am-btn">Save reading</button>
        </form>
        <ul class="am-saved pg-list">
          ${list.length ? list.map((e) => `<li><span>${new Date(e.time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}${e.src === "demo" ? " · demo" : ""}</span><b>${fmtNum(e.value)} ${esc(unit(sel))}</b><button type="button" class="am-btn am-btn-soft" data-del="${e.id}">Delete</button></li>`).join("") : `<li><span>No readings yet for this indicator.</span></li>`}
        </ul>
      </div>

      ${extraPanel()}
      <div class="am-panel">
        <h3>All indicators — this week vs last week</h3>
        ${withData.length ? `<div class="pg-grid">${withData.map((i) => {
          const s = windowStats(i); const r = arrow(s.cur, s.prev);
          const lvl = s.cur == null ? "info" : levelOf(i, s.cur);
          return `<button type="button" class="pg-card" data-pick="${i}"><i style="background:${COLORS[lvl]}"></i><span>${esc(label(i))}</span><b>${s.cur == null ? "—" : fmtNum(s.cur)} <small>${esc(unit(i))}</small></b><em class="pg-${r.cls}">${r.txt}</em></button>`;
        }).join("")}</div>` : `<p>No data yet. Save a Daily Checkup, add a reading above, or load demo data to preview the charts.</p>`}
        <div class="am-actions">
          <button type="button" class="am-btn am-btn-soft" id="pgDemo">Load 14 days of demo data</button>
          <button type="button" class="am-btn am-btn-soft" id="pgDelDemo">Delete demo data</button>
          <button type="button" class="am-btn am-btn-soft" id="pgDelAll">${confirming === "all" ? "Click again to confirm" : "Delete all history"}</button>
        </div>
        <p class="am-small">Deleting here only removes entries from these charts. Demo data is simulated and clearly marked.</p>
      </div>`;

    $("#pgSel").addEventListener("change", (e) => { sel = e.target.value; render(); });
    page.querySelectorAll("[data-days]").forEach((b) => b.addEventListener("click", () => { days = Number(b.dataset.days); render(); }));
    page.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => { sel = b.dataset.pick; render(); window.scrollTo({ top: 0, behavior: "smooth" }); }));
    page.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => { h.entries = h.entries.filter((e) => e.id !== b.dataset.del); save(h); render(); }));
    $("#pgAdd").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = Number($("#pgVal").value);
      if (!Number.isFinite(v)) return;
      const [p, k] = sel.split(".");
      const w = $("#pgWhen").value ? new Date($("#pgWhen").value) : new Date();
      h.entries.push({ id: uid(), part: p, key: k, value: v, time: w.toISOString(), src: "manual" });
      save(h); render();
    });
    $("#pgDemo").addEventListener("click", () => { demo(); render(); });
    $("#pgDelDemo").addEventListener("click", () => { h.entries = h.entries.filter((e) => e.src !== "demo"); save(h); render(); });
    $("#pgDelAll").addEventListener("click", () => {
      if (confirming !== "all") { confirming = "all"; render(); return; }
      confirming = ""; h.entries = []; save(h); render();
    });
  }

  /* Simulated mission data: 14 days with gentle, realistic drift. Clearly tagged "demo". */
  function demo() {
    h.entries = h.entries.filter((e) => e.src !== "demo");
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
    const now = Date.now();
    Object.entries(meta()).forEach(([p, m]) => {
      Object.keys(m.f).forEach((k) => {
        const d = DEMO[k]; if (!d) return;
        for (let i = 13; i >= 0; i--) {
          const t = new Date(now - i * DAY); t.setHours(8, 15, 0, 0);
          const v = d[0] + d[2] * (13 - i) + rnd() * 2 * d[1];
          h.entries.push({ id: uid(), part: p, key: k, value: Math.round(v * 100) / 100, time: t.toISOString(), src: "demo" });
        }
      });
    });
    save(h);
  }

  window.AstroMedProgress = { render, sync };

  // keep the history in step with the Daily Checkup
  document.addEventListener("click", (e) => {
    if (e.target.closest("#saveData")) setTimeout(sync, 120);
  });
  const boot = () => { if (window.AstroMedData) sync(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
