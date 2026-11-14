/* ==============================================
   ASTROMED — RADIATION (cumulative dose, career limit, projection, solar storms)
   Sources: NASA-STD-3001 Vol. 1 Rev B via OCHMO-TB-020 (career limit 600 mSv, ALARA,
   250 mSv short-term SPE limit); Zeitlin et al. 2013 and Hassler et al. 2014 (Science,
   MSL/RAD cruise and surface); Zhang et al. 2020 (Science Advances, Chang'e-4 LND and
   DOSIS 3D on the ISS); NASA Human Research Program, Space Radiation.
   Status bands (50% / 80% of the limit) are illustrative design choices.
   Educational prototype: not medical advice.
   Load AFTER astromed-profile.js and astromed-sections.js
============================================== */

(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const KEY = "astromed-radiation";
  const LIMIT = 600; // mSv, career effective dose (NASA-STD-3001 V1 4030)
  const SPE_LIMIT = 250; // mSv, short-term (solar particle event) limit
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rd = (k, fb) => window.AstroMedStore.store.get(k, fb);
  const wr = (k, v) => window.AstroMedStore.store.set(k, v);
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (iso, n) => { const d = parseIso(iso); d.setDate(d.getDate() + n); return isoDay(d); };
  const load = () => { const s = rd(KEY, null) || {}; return { prior: Number(s.prior) || 0, entries: s.entries || [] }; };
  const save = (s) => wr(KEY, s);

  // Reference dose-equivalent rates (mSv/day) with the primary source for each measurement.
  const REF = [
    { place: "ISS (low Earth orbit)", v: "about 0.7", note: "731 µSv/day measured by DOSIS 3D on the ISS", src: "Zhang et al. 2020 (DOSIS 3D)", url: "https://doi.org/10.1126/sciadv.aaz1334", src2: "NASA HRP", url2: "https://www.nasa.gov/hrp/elements/radiation/" },
    { place: "Moon surface", v: "about 1.37", note: "1369 µSv/day (about 57 µSv/h) measured by Chang'e-4 LND; roughly twice the ISS", src: "Zhang et al. 2020, Science Advances", url: "https://doi.org/10.1126/sciadv.aaz1334" },
    { place: "Mars cruise", v: "1.84", note: "Average measured by RAD during the 253-day cruise to Mars", src: "Zeitlin et al. 2013, Science", url: "https://doi.org/10.1126/science.1235989" },
    { place: "Mars surface", v: "0.64", note: "Measured by RAD on the surface at Gale Crater; the cruise is nearly three times higher", src: "Hassler et al. 2014, Science", url: "https://doi.org/10.1126/science.1244797" }
  ];
  const PLACE_RATE = { iss: 0.73, moon: 1.37, mars: 0.64, rover: null, other: null }; // mSv/day, measured values

  /* ---------- calculations ---------- */
  function perDay(s) {
    const m = {};
    s.entries.forEach((e) => { m[e.day] = (m[e.day] || 0) + e.dose; });
    return m;
  }
  function calc(s) {
    const days = perDay(s);
    const keys = Object.keys(days).sort();
    const mission = keys.reduce((a, k) => a + days[k], 0);
    const career = s.prior + mission;
    const last7 = keys.slice(-7).map((k) => days[k]);
    const rate = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : null;
    const P = window.AstroMedProfile;
    const md = P && P.get() && P.get().startDate ? P.missionDay() : null;
    const left = md != null ? Math.max(0, P.total() - md) : null;
    const projected = rate != null && left != null ? career + rate * left : null;
    const pct = (career / LIMIT) * 100;
    const level = pct >= 80 ? "alert" : pct >= 50 ? "review" : "ok";
    const projLevel = projected == null ? null : projected >= LIMIT ? "alert" : projected >= LIMIT * 0.8 ? "review" : "ok";
    return { days, keys, mission, career, rate, left, projected, pct, level, projLevel };
  }

  function chart(s, c) {
    if (!c.keys.length) return "<p class=\"mi-note\">Add doses to see your chart.</p>";
    const W = 680, H = 230, pad = 44;
    const first = c.keys[0], lastDay = c.keys[c.keys.length - 1];
    const span = Math.max(1, Math.round((parseIso(lastDay) - parseIso(first)) / 864e5));
    let acc = s.prior; const pts = [];
    for (let i = 0; i <= span; i++) { const d = addDays(first, i); acc += c.days[d] || 0; pts.push([i, acc]); }
    const extra = c.rate != null && c.left ? Math.min(c.left, Math.max(14, span)) : 0;
    const total = span + extra;
    const maxY = Math.max(LIMIT * 1.05, acc + (c.rate || 0) * extra);
    const x = (i) => pad + (i / Math.max(1, total)) * (W - pad * 2);
    const y = (v) => H - pad - (v / maxY) * (H - pad * 2);
    const proj = extra ? `<polyline fill="none" stroke="#e0a526" stroke-width="3" stroke-dasharray="6 6" points="${x(span)},${y(acc)} ${x(total)},${y(acc + c.rate * extra)}"/>` : "";
    return `<svg class="pg-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cumulative radiation dose">
      <line x1="${pad}" x2="${W - pad}" y1="${y(LIMIT)}" y2="${y(LIMIT)}" stroke="#d64545" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="${W - pad}" y="${y(LIMIT) - 6}" text-anchor="end" font-size="11" fill="#d64545">Career limit 600 mSv</text>
      <line x1="${pad}" x2="${W - pad}" y1="${y(0)}" y2="${y(0)}" stroke="#c9d8ec"/>
      <text x="${pad - 6}" y="${y(0) + 4}" text-anchor="end" font-size="11" fill="#4a6283">0</text>
      <polyline fill="none" stroke="#2f7be0" stroke-width="3" points="${pts.map(([i, v]) => `${x(i)},${y(v)}`).join(" ")}"/>
      ${proj}
      <text x="${pad}" y="${H - 12}" font-size="10" fill="#4a6283">${new Date(first).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</text>
      ${extra ? `<text x="${W - pad}" y="${H - 12}" text-anchor="end" font-size="10" fill="#9a6a00">projection at your recent rate</text>` : ""}
    </svg>`;
  }

  /* ---------- render ---------- */
  function render() {
    const page = $("#radiationPage");
    if (!page) return;
    const s = load(), c = calc(s), P = window.AstroMedProfile;
    const lbl = { ok: "Far from the limit", review: "Getting closer: check your plan", alert: "Close to the limit: wake the crew medical officer" };
    const today = isoDay(new Date());
    const place = (rd("astromed-env", {}) || {}).place;
    const tr = PLACE_RATE[place];
    page.innerHTML = `
      <div class="am-heading"><h2>Radiation</h2>
        <p>Radiation adds up every day away from Earth. Keep your total under the NASA limit.</p></div>

      <div class="am-panel">
        <h3>Your total dose</h3>
        <div class="rd-gauge ${c.level}"><div class="rd-fill" style="width:${Math.min(100, c.pct)}%"></div><i style="left:50%"></i><i style="left:80%"></i></div>
        <div class="rd-scale"><span>0</span><span>300</span><span>480</span><span>600 mSv</span></div>
        <div class="mi-kpis" style="margin-top:14px">
          <div><small>Total (all missions)</small><b>${c.career.toFixed(1)} mSv</b></div>
          <div><small>Of NASA limit (600)</small><b>${c.pct.toFixed(1)}%</b></div>
          <div><small>This mission</small><b>${c.mission.toFixed(1)} mSv</b></div>
          <div><small>Daily average (last 7 days)</small><b>${c.rate != null ? c.rate.toFixed(2) + " mSv/day" : "–"}</b></div>
        </div>
        <p class="rd-st ${c.level}"><b>${esc(lbl[c.level])}.</b> Always keep your dose as low as you reasonably can (ALARA).</p>
      </div>

      <div class="am-panel">
        <h3>Where you are going</h3>
        <p class="mi-note">Your profile supplies the mission start date and the total mission length. Add each dose in "Add a dose" below. This page averages your dose over the last seven recorded days and multiplies that daily rate by the remaining mission days.</p>
        ${c.projected != null ? `<p class="rd-st ${c.projLevel}">If you keep the same daily rate for the ${c.left} remaining mission days, your career total would be about <b>${c.projected.toFixed(0)} mSv</b> (${((c.projected / LIMIT) * 100).toFixed(0)}% of the limit).${c.projLevel === "alert" ? " That exceeds the 600 mSv limit: this plan needs ground review." : ""}</p>`
          : "<p class=\"mi-note\">To see a forecast, enter your mission start date and total mission length in your profile, then add at least one dose below.</p>"}
        ${tr && c.left != null ? `<p class="mi-note">For comparison, a typical rate at your location would add about ${(tr * c.left).toFixed(0)} mSv over the remaining ${c.left} days (${tr} mSv/day).</p>` : ""}
        ${chart(s, c)}
      </div>

      <div class="am-panel">
        <h3>Add a dose</h3>
        <form id="rdForm" class="mi-form">
          <label class="pg-field"><span>Date</span><input name="day" type="date" required value="${today}" max="${today}"></label>
          <label class="pg-field"><span>Dose that day (mSv)</span><input name="dose" type="number" step="0.001" min="0" max="500" required placeholder="e.g. 0.45"></label>
          <label class="pg-field"><span>Source</span><select name="src"><option value="dosimeter">Personal dosimeter</option><option value="estimate">Estimate</option></select></label>
          <div class="am-actions"><button class="am-btn" type="submit">Add reading</button></div>
        </form>
        <div class="rd-tools">
          <label class="pg-field"><span>Dose from past missions (mSv)</span><input id="rdPrior" type="number" step="0.1" min="0" max="2000" value="${s.prior || ""}" placeholder="0"></label>
          <label class="pg-field"><span>Convert µSv/h to mSv/day</span><input id="rdConv" type="number" step="any" min="0" placeholder="µSv/h"><em id="rdConvOut" class="mi-note"></em></label>
        </div>
        ${s.entries.length ? `<div class="nu-list" style="margin-top:12px">${s.entries.slice().sort((a, b) => b.day.localeCompare(a.day)).slice(0, 30).map((e) => {
          const md = P && P.get() && P.get().startDate ? P.missionDay(parseIso(e.day)) : null;
          return `<div class="nu-item"><div><span><b>${e.dose} mSv</b> · ${e.src === "estimate" ? "Estimate" : "Dosimeter"}</span><small>${new Date(e.day).toLocaleDateString("en-GB", { dateStyle: "medium" })}${md != null && md >= 1 ? ` · Mission day ${md}` : ""}${e.note ? ` · ${esc(e.note)}` : ""}</small></div><button type="button" class="nu-del" data-rdel="${e.id}" aria-label="Delete reading">×</button></div>`;
        }).join("")}</div>` : ""}
      </div>

      <div class="am-panel rd-spe">
        <h3>Solar storm</h3>
        <p>A solar particle event can add a large dose in a few hours. Move to the most shielded part of the habitat, stay there until the ground team or your radiation plan says it is safe, then log the dose.</p>
        <p class="mi-note">NASA's short-term limit for one storm is ${SPE_LIMIT} mSv. This is general guidance: follow your mission protocol.</p>
        <div class="am-actions"><button type="button" class="am-btn" id="rdStorm">Open solar storm steps</button></div>
      </div>

      <div class="am-panel">
        <h3>Reference dose rates</h3>
        <div class="nu-tw"><table class="nu-table"><thead><tr><th>Place</th><th>mSv per day</th><th>Notes</th><th>Source</th></tr></thead>
          <tbody>${REF.map((r) => `<tr style="cursor:default"><td>${esc(r.place)}</td><td><b>${esc(r.v)}</b></td><td>${esc(r.note)}</td><td><a style="color:var(--am-accent);font-weight:700" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.src)}</a>${r.src2 ? `; <a style="color:var(--am-accent);font-weight:700" href="${esc(r.url2)}" target="_blank" rel="noopener noreferrer">${esc(r.src2)}</a>` : ""}</td></tr>`).join("")}</tbody></table></div>
        <p class="mi-note" style="margin-top:12px">The RAD measurements show how quickly dose adds up in transit and on the surface, which is why the 600 mSv career limit is a design challenge for Mars. Career limit and ALARA: NASA-STD-3001 Vol. 1 Rev B (V1 4029, V1 4030), summarized in the NASA OCHMO radiation technical brief. For the space radiation environment and its health risks, see the <a style="color:var(--am-accent);font-weight:700" href="https://www.nasa.gov/hrp/elements/radiation/" target="_blank" rel="noopener noreferrer">NASA Human Research Program</a>. These reference values are typical measurements, not predictions for your mission.</p>
      </div>`;
    bind(page);
  }

  function bind(page) {
    $("#rdForm", page)?.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target, s = load();
      s.entries.push({ id: Date.now().toString(36), day: f.elements.day.value, dose: Math.round(Number(f.elements.dose.value) * 1000) / 1000, src: f.elements.src.value });
      save(s); render();
      document.dispatchEvent(new CustomEvent("astromed-radiation-changed"));
    });
    page.querySelectorAll("[data-rdel]").forEach((b) => b.addEventListener("click", () => { const s = load(); s.entries = s.entries.filter((x) => x.id !== b.dataset.rdel); save(s); render(); }));
    $("#rdPrior", page)?.addEventListener("change", (e) => { const s = load(); s.prior = Math.max(0, Number(e.target.value) || 0); save(s); render(); });
    $("#rdConv", page)?.addEventListener("input", (e) => {
      const v = Number(e.target.value);
      $("#rdConvOut", page).textContent = e.target.value !== "" && v >= 0 ? `${v} µSv/h = ${((v * 24) / 1000).toFixed(3)} mSv/day` : "";
    });
    $("#rdStorm", page)?.addEventListener("click", () => {
      if (window.AstroMedEmergencies) window.AstroMedEmergencies.open("solar-storm");
      else window.AstroMedNav?.show("emergencies");
    });
  }

  // Used by other modules (Overview, report)
  function status() {
    const s = load(), c = calc(s);
    return { career: c.career, pct: c.pct, level: c.level, rate: c.rate, projected: c.projected, projLevel: c.projLevel, hasData: s.entries.length > 0 || s.prior > 0 };
  }

  function findings() {
    const st = status();
    if (!st.hasData) return [];
    const out = [];
    const T = {
      ok: "Keep logging your dose. Know where your storm shelter is.",
      review: "You have used a large part of your career limit. Talk with the ground team about ways to lower dose (shelter time, activity planning).",
      alert: "You are close to the career limit. Contact your flight surgeon and the radiation team today."
    };
    out.push({ level: st.level, title: "Radiation · career dose", saw: `${st.career.toFixed(1)} mSv used of ${LIMIT} mSv (${st.pct.toFixed(1)}%).`, todo: T[st.level] });
    if (st.projLevel && st.projLevel !== "ok") out.push({ level: st.projLevel, title: "Radiation · mission forecast", saw: `At your recent rate you would reach about ${Math.round(st.projected)} mSv by the end of the mission.`, todo: "Ask the ground team to review your plan. Lowering dose now has the most effect." });
    return out;
  }

  window.AstroMedRadiation = { render, status, findings, LIMIT };
})();
