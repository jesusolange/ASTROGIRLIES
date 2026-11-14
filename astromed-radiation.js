/* ==============================================
   ASTROMED — RADIATION (cumulative dose, career limit, projection, solar storms)
   Sources: NASA-STD-3001 Vol. 1 Rev B via OCHMO-TB-020 (career limit 600 mSv, ALARA,
   250 mSv short-term SPE limit); Simonsen et al., "Moon 2 Mars: Space Radiation Protection"
   (NTRS 20250006168); MSL RAD (JPL/NASA); Chang'e-4 LND.
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
  const rd = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.error(e); } };
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (iso, n) => { const d = parseIso(iso); d.setDate(d.getDate() + n); return isoDay(d); };
  const load = () => { const s = rd(KEY, null) || {}; return { prior: Number(s.prior) || 0, entries: s.entries || [] }; };
  const save = (s) => wr(KEY, s);

  // Reference dose rates (mSv/day) with sources
  const REF = [
    { place: "ISS (low Earth orbit)", v: "0.2 – 0.5", note: "About 40–90 mSv in a typical six-month stay", src: "Simonsen et al., NASA NTRS 20250006168" },
    { place: "Moon surface", v: "about 1.4", note: "60 µSv/h measured by Chang'e-4 (more than twice the ISS)", src: "Chang'e-4 LND, reported by Phys.org" },
    { place: "Mars cruise", v: "1.84", note: "Average measured by Curiosity's RAD on the way to Mars; about 3% from solar particles", src: "NASA/JPL, MSL RAD" },
    { place: "Mars surface", v: "0.64", note: "Measured by RAD on the surface (cruise is nearly three times higher)", src: "MSL RAD, reported by Space.com" }
  ];
  const PLACE_RATE = { iss: 0.35, moon: 1.4, mars: 0.64, rover: null, other: null }; // mSv/day, mid or measured values

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
    const lbl = { ok: "Far from the limit", review: "Getting closer: check your plan", alert: "Close to the limit: talk to your doctor" };
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
        ${c.projected != null ? `<p class="rd-st ${c.projLevel}">If you keep the same daily rate for the ${c.left} remaining mission days, your career total would be about <b>${c.projected.toFixed(0)} mSv</b> (${((c.projected / LIMIT) * 100).toFixed(0)}% of the limit).${c.projLevel === "alert" ? " That exceeds the 600 mSv limit: this plan needs ground review." : ""}</p>`
          : "<p class=\"mi-note\">Add your mission day (profile) and one dose to see a forecast.</p>"}
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
        <h3>Solar storm: what to do</h3>
        <div class="rd-cards">
          <div class="rd-c"><svg viewBox="0 0 160 120" aria-hidden="true"><circle cx="80" cy="56" r="26" fill="#ffc857" class="rd-pulse"/><g stroke="#ffc857" stroke-width="5" stroke-linecap="round" class="rd-rays"><path d="M80 14v-8M80 106v8M38 56h-8M130 56h-8M50 26l-6-6M116 92l6 6M110 26l6-6M44 92l-6 6"/></g><path d="M118 20l10 18h-20z" fill="#ff6b6b"/><text x="118" y="35" font-size="12" text-anchor="middle" fill="#fff" font-weight="700">!</text></svg><b>1 · Storm alert</b><span>Alarm or ground call</span></div>
          <div class="rd-c"><svg viewBox="0 0 160 120" aria-hidden="true"><rect x="86" y="46" width="58" height="52" rx="8" fill="#3b6cff" opacity=".8"/><rect x="104" y="64" width="22" height="34" rx="4" fill="#0a1a3f"/><g class="rd-walk"><circle cx="40" cy="62" r="9" fill="#fff"/><path d="M40 72v22M40 80l-12 12M40 80l12 10M40 94l-10 16M40 94l10 16" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/></g><path d="M60 100h20" stroke="#6fe3ff" stroke-width="4" stroke-linecap="round" stroke-dasharray="3 7" class="rd-dash"/></svg><b>2 · Go inside</b><span>Stop work outside</span></div>
          <div class="rd-c"><svg viewBox="0 0 160 120" aria-hidden="true"><rect x="22" y="14" width="116" height="92" rx="14" fill="none" stroke="#6fe3ff" stroke-width="5" class="rd-pulse"/><rect x="38" y="30" width="84" height="60" rx="9" fill="none" stroke="#3b6cff" stroke-width="4"/><circle cx="80" cy="56" r="9" fill="#fff"/><path d="M80 66v14M80 72l-9 8M80 72l9 8" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M110 40l10 10 16-18" stroke="#35d49a" stroke-width="5" fill="none" stroke-linecap="round" transform="translate(-24 6)"/></svg><b>3 · Safe room</b><span>Most shielded area</span></div>
          <div class="rd-c"><svg viewBox="0 0 160 120" aria-hidden="true"><path d="M80 100V56M62 100h36" stroke="#cfe3ff" stroke-width="5" stroke-linecap="round"/><circle cx="80" cy="50" r="7" fill="#ffc857"/><g fill="none" stroke="#6fe3ff" stroke-width="4" stroke-linecap="round"><path d="M64 36a22 22 0 0 1 0 28" class="rd-wave"/><path d="M96 36a22 22 0 0 0 0 28" class="rd-wave"/><path d="M54 28a34 34 0 0 1 0 44" class="rd-wave w2"/><path d="M106 28a34 34 0 0 0 0 44" class="rd-wave w2"/></g></svg><b>4 · Call ground</b><span>Tell how you feel</span></div>
        </div>
        <p class="mi-note">Stay in the safe room until the ground team says it is OK. Then log your dose. A storm can add a lot of dose in a few hours; NASA's limit for one storm is ${SPE_LIMIT} mSv. This is general guidance: follow your mission protocol.</p>
      </div>

      <div class="am-panel">
        <h3>Reference dose rates</h3>
        <div class="nu-tw"><table class="nu-table"><thead><tr><th>Place</th><th>mSv per day</th><th>Notes</th><th>Source</th></tr></thead>
          <tbody>${REF.map((r) => `<tr style="cursor:default"><td>${esc(r.place)}</td><td><b>${esc(r.v)}</b></td><td>${esc(r.note)}</td><td>${esc(r.src)}</td></tr>`).join("")}</tbody></table></div>
        <p class="mi-note" style="margin-top:12px">Whole mission estimates: a Mars round trip is estimated at 525 to about 1,625 mSv depending on length and the solar cycle (Simonsen et al.), which is why the 600 mSv career limit is a design challenge for Mars. Career limit and ALARA: NASA-STD-3001 Vol. 1 Rev B (V1 4029, V1 4030), summarized in the NASA OCHMO radiation technical brief. These reference values are typical measurements, not predictions for your mission.</p>
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
