/* ==============================================
   ASTROMED — NUTRITION (visual plate, barcode scan, "My foods", weekly chart)
   Targets follow NASA JSC-67378 (Nutritional Requirements for Exploration
   Missions up to 365 days) and NASA-STD-3001 Tech Brief OCHMO-TB-013.
   Educational prototype: not medical or dietetic advice.
   Load AFTER astromed-profile.js and astromed-sections.js
============================================== */

(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const KEY = "astromed-nutrition";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const blank = () => ({ entries: [], eva: {}, af: 1.11, lib: [] });
  const read = () => { const v = window.AstroMedStore.store.get(KEY, null); return v ? { ...blank(), ...v, lib: v.lib || [] } : blank(); };
  const write = (v) => window.AstroMedStore.store.set(KEY, v);
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const r0 = (n) => Math.round(n);
  const P = () => window.AstroMedProfile;
  const FIELDS = ["kcal", "carb", "prot", "fat", "fiber", "sodium", "veg", "fluid"];

  let viewDay = isoDay(new Date());
  let addMeal = null;      // meal currently being added
  let portions = 1;
  const newDraft = () => ({ amount: 100, unit: "g", name: "", code: "", editName: false });
  let note = "";           // message under the barcode field
  let draft = newDraft();          // values typed in the add form

  const MEALS = [["Breakfast", "🍳"], ["Lunch", "🥪"], ["Dinner", "🍽️"], ["Snack", "🍎"]];
  const ICON = { Breakfast: "🍳", Lunch: "🥪", Dinner: "🍽️", Snack: "🍎", Drink: "💧" };

  /* ---------- targets (NASA JSC-67378) ---------- */
  function bmiClass(b) {
    if (b < 18.5) return "Low";
    if (b < 25) return "Normal";
    if (b < 30) return "High";
    return "Very high";
  }
  function targets(prof, evaHours, af) {
    if (!prof || !prof.age || !prof.sex || !prof.weightKg || !prof.heightCm) return null;
    const kg = prof.weightKg, m = prof.heightCm / 100, age = prof.age;
    const eer = prof.sex === "m"
      ? 662 - 9.53 * age + af * (15.9 * kg + 539.6 * m)
      : 354 - 6.91 * age + af * (9.36 * kg + 726 * m);
    const kcal = eer + 200 * (evaHours || 0);
    return {
      bmi: kg / (m * m), kcal,
      protein: [1.2 * kg, 1.8 * kg],
      carbs: [kcal * 0.45 / 4, kcal * 0.65 / 4],
      fat: [kcal * 0.20 / 9, kcal * 0.35 / 9],
      fiber: prof.sex === "m" ? 38 : 25,
      sodiumMax: 2300,
      fluid: Math.max(32 * kg, prof.sex === "m" ? 2500 : 2100),
      veg: 400,
      evaKcal: 200 * (evaHours || 0)
    };
  }

  /* ---------- data ---------- */
  const dayEntries = (st, day) => st.entries.filter((e) => isoDay(new Date(e.time)) === day);
  function totalsOf(list) {
    const t = Object.fromEntries(FIELDS.map((k) => [k, 0]));
    list.forEach((e) => FIELDS.forEach((k) => { t[k] += Number(e[k]) || 0; }));
    return t;
  }

  /* ---------- visual helpers ---------- */
  function status(ratio, any) {
    if (!any) return { c: "#8aa4c8", t: "Nothing logged yet", e: "🍽️" };
    if (ratio < 0.5) return { c: "#6fb1ff", t: "Eat more", e: "😋" };
    if (ratio < 0.95) return { c: "#6fe3ff", t: "Getting there", e: "🙂" };
    if (ratio <= 1.05) return { c: "#35d49a", t: "On target", e: "🎉" };
    if (ratio <= 1.2) return { c: "#ffc857", t: "A bit over", e: "😅" };
    return { c: "#ff6b6b", t: "Too much", e: "⚠️" };
  }
  function ring(p, color, size, w) {
    const r = (size - w) / 2, C = 2 * Math.PI * r, v = Math.max(0, Math.min(1, p));
    return `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="${w}"/>
      <circle class="nu-arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"
        stroke-dasharray="${v * C} ${C}" transform="rotate(-90 ${size / 2} ${size / 2})" style="filter:drop-shadow(0 0 6px ${color})"/>`;
  }
  function plateSvg(T, tot) {
    const ratio = T ? tot.kcal / T.kcal : 0;
    const st = status(ratio, tot.kcal > 0);
    const pc = T ? Math.min(1, tot.carb / T.carbs[0]) : 0;
    const pp = T ? Math.min(1, tot.prot / T.protein[0]) : 0;
    const pv = T ? Math.min(1, tot.veg / T.veg) : 0;
    const op = (p) => (0.22 + 0.78 * p).toFixed(2);
    const R = 74, cx = 150, cy = 150;
    const sector = (a0, a1, col, p) => {
      const rad = (a) => (a - 90) * Math.PI / 180;
      const x0 = cx + R * Math.cos(rad(a0)), y0 = cy + R * Math.sin(rad(a0)), x1 = cx + R * Math.cos(rad(a1)), y1 = cy + R * Math.sin(rad(a1));
      return `<path d="M${cx} ${cy} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}Z" fill="${col}" opacity="${op(p)}"/>`;
    };
    const emoji = (x, y, t, p) => `<text x="${x}" y="${y}" font-size="30" text-anchor="middle" opacity="${op(p)}">${t}</text>`;
    return `<svg class="nu-plate" viewBox="0 0 300 300" role="img" aria-label="Calories ${r0(tot.kcal)} of ${T ? r0(T.kcal) : "?"}">
      ${ring(ratio, st.c, 300, 16)}
      <circle cx="150" cy="150" r="104" fill="#eaf1fb"/><circle cx="150" cy="150" r="92" fill="#f8fbff" stroke="#cfdcf0" stroke-width="2"/>
      ${sector(0, 120, "#ffc857", pc)}${sector(120, 240, "#ff7a8a", pp)}${sector(240, 360, "#35d49a", pv)}
      <circle cx="150" cy="150" r="74" fill="none" stroke="#fff" stroke-width="3"/>
      <path d="M150 150L150 76M150 150L214 187M150 150L86 187" stroke="#fff" stroke-width="3"/>
      ${emoji(188, 118, "🍞", pc)}${emoji(150, 214, "🍗", pp)}${emoji(112, 118, "🥦", pv)}
    </svg>`;
  }
  function miniRing(label, icon, val, goal, unit, cap) {
    const p = goal ? val / goal : 0;
    const bad = cap ? p > 1 : false;
    const col = cap ? (bad ? "#ff6b6b" : p > 0.85 ? "#ffc857" : "#35d49a") : p >= 1 ? "#35d49a" : p >= 0.5 ? "#6fe3ff" : "#6fb1ff";
    return `<div class="nu-mr"><svg viewBox="0 0 84 84" width="84" height="84">${ring(p, col, 84, 9)}<text x="42" y="50" font-size="24" text-anchor="middle">${icon}</text></svg>
      <b>${r0(val)}<small> ${unit}</small></b><span>${label}</span><em>${cap ? `max ${r0(goal)}` : `goal ${r0(goal)}`}</em></div>`;
  }

  /* ---------- barcode ---------- */
  async function offLookup(code) {
    if (!navigator.onLine || typeof fetch !== "function") return null;
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_en,nutriments,quantity,serving_size`, { signal: ctl.signal });
      clearTimeout(t);
      const j = await r.json();
      if (!j || j.status !== 1 || !j.product) return null;
      const p = j.product, n = p.nutriments || {};
      const num = (k) => (n[k] != null && n[k] !== "" ? Number(n[k]) : null);
      let kcal = num("energy-kcal_100g");
      if (kcal == null) { const kj = num("energy_100g"); kcal = kj != null ? kj / 4.184 : null; }
      if (kcal == null) return { name: p.product_name || p.product_name_en || "", none: true };
      const g = (k) => num(`${k}_100g`) || 0;
      let sodium = num("sodium_100g");
      if (sodium == null) { const salt = num("salt_100g"); sodium = salt != null ? salt / 2.5 : 0; }
      const liquid = /\d\s*(ml|cl|dl|l)\b/i.test(`${p.quantity || ""} ${p.serving_size || ""}`);
      return { name: p.product_name || p.product_name_en || "", unit: liquid ? "mL" : "g", basis: "100", kcal: Math.round(kcal * 10) / 10, carb: g("carbohydrates"), prot: g("proteins"), fat: g("fat"), fiber: g("fiber"), sodium: Math.round(sodium * 1000) };
    } catch { return null; }
  }
  async function lookup(code) {
    code = String(code || "").trim();
    if (!code) return;
    const st = read();
    const hit = st.lib.find((f) => f.code === code);
    if (hit) { fill(hit); note = "Found in My foods. Check the amount."; return; }
    note = "Looking online…"; paintNote();
    const o = await offLookup(code);
    if (o && !o.none) { fill(o); note = `Found online (${o.kcal} kcal per 100 ${o.unit}). Check the amount.`; }
    else if (o) { draft.name = o.name || draft.name; note = "Name found, but no calories. Type them from the label."; }
    else note = navigator.onLine ? "Not found. Type the name and calories once. I will remember this code." : "No internet. Type the name and calories once. I will remember this code.";
  }
  function fill(f) {
    draft = { ...draft, name: f.name || draft.name || "", unit: f.unit || draft.unit || "g" };
    FIELDS.forEach((k) => { if (f[k] != null) draft[k] = f[k]; });
  }
  function paintNote() { const n = $("#nuScanNote"); if (n) n.textContent = note; }

  async function scan() {
    const BD = window.BarcodeDetector;
    if (!BD || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      note = "This browser cannot scan with the camera. Type the code under the bars.";
      paintNote(); return;
    }
    const wrap = document.createElement("div");
    wrap.className = "nu-scan";
    wrap.innerHTML = `<div class="nu-scan-card"><video playsinline muted></video><div class="nu-scan-frame"></div><p>Point the camera at the barcode</p><button type="button" class="am-btn am-btn-soft" id="nuScanX">Cancel</button></div>`;
    document.body.appendChild(wrap);
    let stream, alive = true;
    const stop = () => { alive = false; stream && stream.getTracks().forEach((t) => t.stop()); wrap.remove(); };
    $("#nuScanX", wrap).addEventListener("click", stop);
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const v = $("video", wrap); v.srcObject = stream; await v.play();
      const det = new BD({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"] });
      const loop = async () => {
        if (!alive) return;
        try {
          const codes = await det.detect(v);
          if (codes.length) {
            const code = codes[0].rawValue; stop();
            draft.code = code; await lookup(code); renderAdd(); return;
          }
        } catch { /* keep trying */ }
        setTimeout(loop, 250);
      };
      loop();
    } catch { stop(); note = "Camera not available. Type the code under the bars."; paintNote(); }
  }

  /* ---------- render ---------- */
  function render() {
    const page = $("#nutritionPage");
    if (!page) return;
    const st = read();
    const prof = P() ? P().get() : null;
    const day = viewDay;
    const date = parseIso(day);
    const md = P() && prof && prof.startDate ? P().missionDay(date) : null;
    const eva = Number(st.eva[day]) || 0;
    const T = targets(prof, eva, st.af || 1.11);
    const list = dayEntries(st, day).sort((a, b) => new Date(a.time) - new Date(b.time));
    const tot = totalsOf(list);
    const isToday = day === isoDay(new Date());

    const head = `
      <div class="am-heading"><h2>Nutrition</h2><p>Tap a meal, add what you ate. The plate shows how your day is going.</p></div>
      <div class="am-panel nu-daybar">
        <button type="button" class="am-btn am-btn-soft" id="nuPrev" aria-label="Previous day">‹</button>
        <div class="nu-day"><b>${date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</b>
          <span>${md != null ? (md >= 1 ? `Mission day ${md}` : "Before mission start") : "Mission day not set"}${isToday ? " · today" : ""}</span></div>
        <button type="button" class="am-btn am-btn-soft" id="nuNext" aria-label="Next day" ${isToday ? "disabled" : ""}>›</button>
        <button type="button" class="am-btn am-btn-soft" id="nuProfile">👤 Me</button>
      </div>`;

    if (!T) {
      page.innerHTML = head + `<div class="am-panel"><h3>Tell me about you</h3>
        <p>I need your age, sex, weight and height to know how much energy you need. It stays on this device.</p>
        <button type="button" class="am-btn" id="nuProfile2">Add my details</button></div>`;
      bind(page);
      return;
    }

    const ratio = tot.kcal / T.kcal;
    const s = status(ratio, tot.kcal > 0);
    const left = Math.max(0, T.kcal - tot.kcal);
    const need = [];
    if (left > 100) need.push(`${r0(left)} kcal`);
    if (tot.prot < T.protein[0]) need.push(`${r0(T.protein[0] - tot.prot)} g protein`);
    if (tot.fluid < T.fluid) need.push(`${r0(T.fluid - tot.fluid)} mL water`);
    if (tot.veg < T.veg) need.push(`${r0(T.veg - tot.veg)} g vegetables`);
    const meals = ["Breakfast", "Lunch", "Dinner"];

    page.innerHTML = head + `
      <div class="am-panel nu-hero">
        <div class="nu-ringbox">
          ${plateSvg(T, tot)}
          <div class="nu-center"><b>${r0(tot.kcal)}</b><span>of ${r0(T.kcal)} kcal</span></div>
        </div>
        <div class="nu-side">
          <div class="nu-state" style="--c:${s.c}"><span>${s.e}</span><b>${s.t}</b>${left > 0 && tot.kcal > 0 ? `<em>${r0(left)} kcal left</em>` : ""}</div>
          <div class="nu-mrs">
            ${miniRing("Protein", "🍗", tot.prot, T.protein[0], "g")}
            ${miniRing("Carbs", "🍞", tot.carb, T.carbs[0], "g")}
            ${miniRing("Fat", "🥑", tot.fat, T.fat[0], "g")}
            ${miniRing("Water", "💧", tot.fluid, T.fluid, "mL")}
            ${miniRing("Veg", "🥦", tot.veg, T.veg, "g")}
            ${miniRing("Salt", "🧂", tot.sodium, T.sodiumMax, "mg", true)}
          </div>
          <div class="nu-meals">${meals.map((m) => { const ok = list.some((e) => e.meal === m); return `<span class="${ok ? "ok" : ""}">${ICON[m]} ${m} ${ok ? "✓" : ""}</span>`; }).join("")}</div>
          ${need.length ? `<p class="nu-need"><b>Still need:</b> ${need.join(" · ")}</p>` : `<p class="nu-need ok">✅ All goals reached for this day.</p>`}
        </div>
      </div>

      <div class="am-panel">
        <h3>Add food</h3>
        <div class="nu-quick">
          ${MEALS.map(([m, i]) => `<button type="button" class="nu-qb ${addMeal === m ? "on" : ""}" data-meal="${m}"><span>${i}</span>${m}</button>`).join("")}
          <button type="button" class="nu-qb water" id="nuWater"><span>💧</span>+250 mL</button>
        </div>
        <div id="nuAdd">${addHtml(st)}</div>
        ${st.lib.length ? `<div class="nu-lib"><h4>My foods <small>tap, then enter the amount</small></h4><div class="nu-chips">${st.lib.map((f, i) => `<button type="button" class="nu-chip" data-lib="${i}">${esc(f.name)} <small>${r0(f.kcal || 0)} kcal</small></button>`).join("")}</div></div>` : ""}
      </div>

      ${list.length ? `<div class="am-panel"><h3>${isToday ? "Today" : "This day"}</h3><div class="nu-list">${list.map((e) => `<div class="nu-item"><span class="nu-ic">${ICON[e.meal] || "🍽️"}</span><div><span><b>${esc(e.name || e.meal)}</b></span><small>${esc(e.meal)} · ${new Date(e.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}${e.unit ? ` · ${e.amount} ${unitLabel(e.unit, e.amount)}` : e.portions > 1 ? ` · ×${e.portions}` : ""}</small></div><span class="nu-kc">${e.kcal ? `${r0(e.kcal)} kcal` : e.fluid ? `${r0(e.fluid)} mL` : ""}</span><button type="button" class="nu-del" data-del="${e.id}" aria-label="Delete">×</button></div>`).join("")}</div></div>` : ""}

      <div class="am-panel"><h3>My week <small class="mi-small">calories vs goal</small></h3>${weekChart(st, prof)}</div>

      <div class="am-panel nu-opts-panel"><details><summary>⚙️ Settings and sources</summary>
        <div class="nu-opts">
          <label class="pg-field"><span>Exercise equipment</span>
            <select id="nuAf"><option value="1.11" ${st.af === 1.11 || !st.af ? "selected" : ""}>Little exercise</option><option value="1.25" ${st.af === 1.25 ? "selected" : ""}>ISS-type exercise equipment</option></select></label>
          <label class="pg-field"><span>Spacewalk (EVA) hours this day</span>
            <input type="number" id="nuEva" min="0" max="12" step="0.5" value="${eva || ""}" placeholder="0"></label>
        </div>
        <p class="nu-note">BMI ${T.bmi.toFixed(1)} (${bmiClass(T.bmi)}, WHO ranges). Protein goal ${r0(T.protein[0])}–${r0(T.protein[1])} g (1.2–1.8 g per kg). Fiber goal ${T.fiber} g. Salt (sodium) max ${T.sodiumMax} mg.${T.evaKcal ? ` Includes +${T.evaKcal} kcal for EVA.` : ""}</p>
        <label class="am-btn am-btn-soft nu-import">Load a food list (CSV or JSON)<input type="file" id="nuImport" accept=".csv,.json" hidden></label>
        <p class="nu-note">Columns: code, name, kcal, carb, prot, fat, fiber, sodium, veg, fluid (values per portion). The ground team can prepare this list in advance.</p>
        <ul class="nu-srcs">
          <li>Energy: NASA JSC-67378, Estimated Energy Requirement equations, activity 1.11 (1.25 with ISS-type equipment), +200 kcal per EVA hour. NASA reference average for ISS crew: 3,035 kcal/day (OCHMO-TB-013).</li>
          <li>Protein 1.2–1.8 g/kg · carbs 45–65% · fat 20–35% · fiber 38 g (men) / 25 g (women) · sodium max 2,300 mg · fluids 32 mL/kg (minimum 2,500 mL men / 2,100 mL women): NASA JSC-67378, Table 1.</li>
          <li>BMI ranges and the 400 g fruit and vegetables goal: World Health Organization.</li>
          <li>NASA does not publish a per-item nutrition table in the documents I found, so numbers come from the package label, a scan, or your food list.</li>
        </ul></details></div>`;
    bind(page);
  }

  const basisText = (u) => (u === "portion" ? "per portion" : `per 100 ${u}`);
  const factor = (d) => { const a = Math.max(0, Number(d.amount) || 0); return d.unit === "portion" ? a : a / 100; };
  const unitLabel = (u, a) => (u === "portion" ? (Number(a) === 1 ? "portion" : "portions") : u);
  function addHtml(st) {
    if (!addMeal) return "";
    const d = draft;
    const v = (k) => (d[k] != null && d[k] !== "" ? d[k] : "");
    const hasName = (d.name || "").trim() && !d.editName;
    const nameBox = hasName
      ? `<div class="nu-found"><span>${ICON[addMeal]}</span><b>${esc(d.name)}</b><button type="button" class="nu-edit" id="nuEditName" aria-label="Change name">✎</button></div>`
      : `<label class="pg-field nu-name"><span>Food name</span><input name="fname" type="text" maxlength="60" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="e.g. Milk" value="${esc(d.name || "")}"></label>`;
    return `<form id="nuForm" class="nu-form" autocomplete="off">
      <h4 class="nu-step">${ICON[addMeal]} ${addMeal}</h4>
      <div class="nu-row2">
        <label class="pg-field"><span>1. How much did you have?</span><input name="amount" type="number" min="0" max="10000" step="any" inputmode="decimal" value="${v("amount")}" required></label>
        <label class="pg-field"><span>Unit</span><select name="unit"><option value="g" ${d.unit === "g" ? "selected" : ""}>grams (g)</option><option value="mL" ${d.unit === "mL" ? "selected" : ""}>milliliters (mL)</option><option value="portion" ${d.unit === "portion" ? "selected" : ""}>portions</option></select></label>
      </div>
      <div class="nu-row2">
        <label class="pg-field nu-code"><span>2. Barcode (optional)</span><span class="nu-codebox"><input name="code" type="text" inputmode="numeric" autocomplete="off" maxlength="20" placeholder="scan or type" value="${esc(v("code"))}"><button type="button" class="am-btn" id="nuScan" aria-label="Scan barcode">📷</button></span></label>
        ${nameBox}
      </div>
      <p class="nu-note" id="nuScanNote">${esc(note)}</p>
      <div class="nu-row2">
        <label class="pg-field"><span>3. Calories on the label (kcal ${basisText(d.unit)}) *</span><input name="kcal" type="number" min="0" max="10000" step="any" inputmode="decimal" value="${v("kcal")}" required></label>
        <div class="nu-calc" id="nuCalc"></div>
      </div>
      <details class="nu-more"><summary>More numbers (optional)</summary>
        <div class="nu-grid">${[["carb", "Carbs g"], ["prot", "Protein g"], ["fat", "Fat g"], ["fiber", "Fiber g"], ["sodium", "Salt (sodium) mg"], ["veg", "Vegetables g"], ["fluid", "Fluid mL"]].map(([k, l]) => `<label class="pg-field"><span>${l}</span><input name="${k}" type="number" min="0" max="10000" step="any" inputmode="decimal" value="${v(k)}"></label>`).join("")}</div>
        <p class="nu-note">Use the same basis as calories: ${basisText(d.unit)}. For drinks in mL, fluid is counted for you.</p>
      </details>
      <div class="am-actions"><button class="am-btn" type="submit">✔ Add</button>
        <label class="nu-rem"><input type="checkbox" name="remember" checked> Remember this food</label>
        <button type="button" class="am-btn am-btn-soft" id="nuCancel">Cancel</button></div>
    </form>`;
  }
  function paintCalc() {
    const b = $("#nuCalc"); if (!b) return;
    const k = Number(draft.kcal) || 0, a = Number(draft.amount) || 0;
    b.innerHTML = `<span>You ate</span><b>${r0(k * factor(draft))} kcal</b><small>${a} ${unitLabel(draft.unit, a)} × ${k || 0} kcal ${basisText(draft.unit)}</small>`;
  }
  function renderAdd() {
    const box = $("#nuAdd"); if (!box) return;
    box.innerHTML = addHtml(read());
    bindAdd(); paintCalc();
    document.querySelectorAll(".nu-qb[data-meal]").forEach((b) => b.classList.toggle("on", b.dataset.meal === addMeal));
  }

  function weekChart(st, prof) {
    const W = 680, H = 230, pl = 44, pr = 12, pt = 16, pb = 40;
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    const rows = days.map((d) => {
      const k = isoDay(d), l = dayEntries(st, k), t = totalsOf(l), T = targets(prof, Number(st.eva[k]) || 0, st.af || 1.11);
      return { k, d, kcal: t.kcal, any: l.length > 0, T, meals: ["Breakfast", "Lunch", "Dinner"].filter((m) => l.some((e) => e.meal === m)).length };
    });
    const maxV = Math.max(1, ...rows.map((r) => Math.max(r.kcal, r.T ? r.T.kcal * 1.2 : 0)));
    const y = (v) => H - pb - (v / maxV) * (H - pb - pt);
    const bw = (W - pl - pr) / 7;
    const ref = rows.find((r) => r.T)?.T;
    return `<svg class="pg-svg nu-week" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calories for the last 7 days">
      ${ref ? `<rect x="${pl}" y="${y(ref.kcal * 1.05)}" width="${W - pl - pr}" height="${y(ref.kcal * 0.95) - y(ref.kcal * 1.05)}" fill="rgba(53,212,154,.18)"/><line x1="${pl}" x2="${W - pr}" y1="${y(ref.kcal)}" y2="${y(ref.kcal)}" stroke="#35d49a" stroke-dasharray="5 5"/><text x="${W - pr}" y="${y(ref.kcal * 1.05) - 4}" text-anchor="end" font-size="11" fill="#35d49a">goal range</text>` : ""}
      ${rows.map((r, i) => {
        const x = pl + i * bw + bw * 0.18, w = bw * 0.64;
        const s = status(r.T ? r.kcal / r.T.kcal : 0, r.any);
        const h = Math.max(r.any ? 3 : 0, H - pb - y(r.kcal));
        return `<g class="nu-wk" data-go="${r.k}" style="cursor:pointer"><rect x="${x}" y="${pt}" width="${w}" height="${H - pb - pt}" fill="transparent"/>
          <rect x="${x}" y="${H - pb - h}" width="${w}" height="${h}" rx="7" fill="${r.k === viewDay ? s.c : s.c}" opacity="${r.k === viewDay ? 1 : .72}" ${r.k === viewDay ? `stroke="#fff" stroke-width="2"` : ""}/>
          ${r.any ? `<text x="${x + w / 2}" y="${H - pb - h - 6}" text-anchor="middle" font-size="11" fill="#e9f2ff">${r0(r.kcal)}</text>` : `<text x="${x + w / 2}" y="${H - pb - 6}" text-anchor="middle" font-size="11" fill="#9fb8da">–</text>`}
          <text x="${x + w / 2}" y="${H - 22}" text-anchor="middle" font-size="11" fill="#9fb8da">${r.d.toLocaleDateString("en-GB", { weekday: "short" })}</text>
          <text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" font-size="12">${["○○○", "●○○", "●●○", "●●●"][r.meals]}</text></g>`;
      }).join("")}
    </svg><p class="nu-note">Bars show calories. Green is on target. Dots show breakfast, lunch and dinner logged. Tap a bar to open that day.</p>`;
  }

  /* ---------- events ---------- */
  function bindAdd() {
    const f = $("#nuForm"); if (!f) return;
    const keep = () => {
      const o = Object.fromEntries(new FormData(f));
      if (o.fname != null) { o.name = o.fname; delete o.fname; }
      draft = { ...draft, ...o };
    };
    f.addEventListener("input", () => { keep(); paintCalc(); });
    f.elements.unit.addEventListener("change", () => { keep(); if (draft.unit === "portion" && Number(draft.amount) > 20) draft.amount = 1; if (draft.unit !== "portion" && Number(draft.amount) <= 20) draft.amount = 100; renderAdd(); });
    $("#nuEditName")?.addEventListener("click", () => { keep(); draft.editName = true; renderAdd(); f.elements.fname?.focus(); });
    $("#nuScan")?.addEventListener("click", () => { keep(); scan(); });
    f.elements.code.addEventListener("change", async () => { keep(); await lookup(f.elements.code.value); renderAdd(); });
    $("#nuCancel")?.addEventListener("click", () => { addMeal = null; draft = newDraft(); note = ""; render(); });
    f.addEventListener("submit", (e) => {
      e.preventDefault(); keep();
      const s = read();
      const num = (x) => Math.max(0, Number(x) || 0);
      const base = { name: (draft.name || "").trim(), code: (draft.code || "").trim() };
      const unit = draft.unit || "g", amount = num(draft.amount), fac = factor(draft);
      const per = Object.fromEntries(FIELDS.map((k) => [k, num(draft[k])]));
      if (unit === "mL" && !per.fluid) per.fluid = 100;
      const entry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), time: stamp(), meal: addMeal, name: base.name || addMeal, portions: unit === "portion" ? amount : 1, amount, unit };
      FIELDS.forEach((k) => { entry[k] = Math.round(per[k] * fac * 10) / 10; });
      s.entries.push(entry);
      if (f.elements.remember.checked && base.name && per.kcal > 0 && !s.lib.some((x) => (base.code && x.code === base.code) || x.name.toLowerCase() === base.name.toLowerCase())) {
        s.lib.push({ code: base.code, name: base.name, unit, ...per });
      }
      write(s); addMeal = null; draft = newDraft(); note = ""; render();
    });
  }
  function stamp() { const d = parseIso(viewDay), n = new Date(); d.setHours(n.getHours(), n.getMinutes(), n.getSeconds()); return d.toISOString(); }

  function importFile(file) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        let rows;
        const txt = String(rd.result);
        if (file.name.toLowerCase().endsWith(".json")) rows = JSON.parse(txt);
        else {
          const lines = txt.split(/\r?\n/).filter((l) => l.trim());
          const head = lines.shift().split(",").map((h) => h.trim().toLowerCase());
          rows = lines.map((l) => { const c = l.split(","); return Object.fromEntries(head.map((h, i) => [h, (c[i] || "").trim()])); });
        }
        const s = read(); let n = 0;
        (Array.isArray(rows) ? rows : []).forEach((r) => {
          if (!r || !r.name) return;
          const item = { code: String(r.code || ""), name: String(r.name), unit: ["g", "mL", "portion"].includes(r.unit) ? r.unit : "portion" };
          FIELDS.forEach((k) => { item[k] = Number(r[k]) || 0; });
          const i = s.lib.findIndex((x) => (item.code && x.code === item.code) || x.name.toLowerCase() === item.name.toLowerCase());
          if (i >= 0) s.lib[i] = item; else s.lib.push(item);
          n++;
        });
        write(s); render();
        const nt = $(".nu-import"); if (nt) nt.insertAdjacentText("afterend", ` ${n} foods loaded.`);
      } catch { alert("I could not read that file."); }
    };
    rd.readAsText(file);
  }

  function bind(page) {
    const go = (n) => { const d = parseIso(viewDay); d.setDate(d.getDate() + n); viewDay = isoDay(d); render(); };
    $("#nuPrev", page)?.addEventListener("click", () => go(-1));
    $("#nuNext", page)?.addEventListener("click", () => go(1));
    $("#nuProfile", page)?.addEventListener("click", () => P().open());
    $("#nuProfile2", page)?.addEventListener("click", () => P().open());
    page.querySelectorAll("[data-go]").forEach((el) => el.addEventListener("click", () => { viewDay = el.dataset.go; render(); }));
    page.querySelectorAll("[data-meal]").forEach((b) => b.addEventListener("click", () => {
      addMeal = addMeal === b.dataset.meal ? null : b.dataset.meal; draft = newDraft(); note = ""; renderAdd();
      if (addMeal) $("#nuForm")?.elements.amount.focus();
    }));
    $("#nuWater", page)?.addEventListener("click", () => {
      const s = read();
      s.entries.push({ id: Date.now().toString(36), time: stamp(), meal: "Drink", name: "Water", portions: 1, kcal: 0, carb: 0, prot: 0, fat: 0, fiber: 0, sodium: 0, veg: 0, fluid: 250 });
      write(s); render();
    });
    page.querySelectorAll("[data-lib]").forEach((b) => b.addEventListener("click", () => {
      const f = read().lib[Number(b.dataset.lib)]; if (!f) return;
      addMeal = addMeal || (new Date().getHours() < 11 ? "Breakfast" : new Date().getHours() < 16 ? "Lunch" : new Date().getHours() < 21 ? "Dinner" : "Snack");
      draft = newDraft(); fill(f); draft.code = f.code || ""; draft.unit = f.unit || "portion"; draft.amount = draft.unit === "portion" ? 1 : 100;
      note = "How much did you have? Change the amount."; renderAdd(); $("#nuAdd")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }));
    page.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      const s = read(); s.entries = s.entries.filter((x) => x.id !== b.dataset.del); write(s); render();
    }));
    $("#nuAf", page)?.addEventListener("change", (e) => { const s = read(); s.af = Number(e.target.value); write(s); render(); });
    $("#nuEva", page)?.addEventListener("change", (e) => { const s = read(); s.eva[viewDay] = Math.max(0, Number(e.target.value) || 0); write(s); render(); });
    $("#nuImport", page)?.addEventListener("change", (e) => { if (e.target.files[0]) importFile(e.target.files[0]); });
    bindAdd();
  }

  document.addEventListener("astromed-profile-changed", () => { if (!$("#nutritionPage")?.hidden) render(); });

  // Average of the last 3 logged days vs goal (null if no data or no profile)
  function summary() {
    const st = read(), prof = P() && P().get();
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = isoDay(d), l = dayEntries(st, k);
      if (!l.length) continue;
      const T = targets(prof, Number(st.eva[k]) || 0, st.af || 1.11);
      if (!T) continue;
      const t = totalsOf(l);
      rows.push({ ratio: t.kcal / T.kcal, fluid: T.fluid ? t.fluid / T.fluid : null });
    }
    if (!rows.length) return null;
    const avg = (f) => rows.reduce((a, r) => a + (r[f] || 0), 0) / rows.length;
    return { ratio: avg("ratio"), fluid: avg("fluid"), days: rows.length };
  }
  function findings() {
    const s = summary(); if (!s) return [];
    const out = [];
    const pct = Math.round(s.ratio * 100);
    if (s.ratio < 0.6) out.push({ level: "alert", title: "Nutrition · very low calories", saw: `You ate about ${pct}% of your calorie goal (average of the last ${s.days} logged day${s.days > 1 ? "s" : ""}).`, todo: "Eat more today. Low food intake in space leads to weight and muscle loss. Tell your flight surgeon if you have no appetite." });
    else if (s.ratio < 0.8) out.push({ level: "review", title: "Nutrition · low calories", saw: `You ate about ${pct}% of your calorie goal (average of the last ${s.days} logged day${s.days > 1 ? "s" : ""}).`, todo: "Add a snack or a bigger meal. Eating enough protects bones, muscles and the immune system." });
    else if (s.ratio > 1.2) out.push({ level: "review", title: "Nutrition · calories above goal", saw: `You ate about ${pct}% of your calorie goal.`, todo: "Look at portion sizes and snacks. Keep exercising every day." });
    else out.push({ level: "ok", title: "Nutrition · calories", saw: `You ate about ${pct}% of your calorie goal.`, todo: "Good balance. Keep it up." });
    if (s.fluid != null && s.fluid > 0 && s.fluid < 0.6) out.push({ level: "review", title: "Nutrition · low fluids", saw: `You drank about ${Math.round(s.fluid * 100)}% of your fluid goal.`, todo: "Drink water through the day. Fluids shift in space and thirst can be weak." });
    return out;
  }

  window.AstroMedNutrition = { render, targets, read, summary, findings };
})();
