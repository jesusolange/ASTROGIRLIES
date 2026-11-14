/* ==============================================
   ASTROMED — EMERGENCY GUIDE (by symptom, "red flags")
   Content written from the team doctor's notes (see "src" on each card).
   Items marked CHECK must be confirmed by the doctor before real use.
   Load AFTER astromed-environment.js and astromed-radiation.js
============================================== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let open = null;
  const SRC = "Team doctor's notes";

  /* ---------- helpers ---------- */
  const svgWrap = (vb, body, label) => `<svg class="emg-svg" viewBox="${vb}" role="img" aria-label="${esc(label)}">${body}</svg>`;
  const flow = (nodes) => `<div class="emg-flow">${nodes.map((n, i) => `${i ? '<span class="emg-arrow">➜</span>' : ""}<div class="emg-node ${n.c || ""}"><b>${n.i || ""}</b><span>${esc(n.t)}</span></div>`).join("")}</div>`;
  const list = (a, tag) => `<${tag}>${a.map((x) => `<li>${esc(x)}</li>`).join("")}</${tag}>`;
  const panel = (h, html) => `<div class="am-panel emg-panel">${h ? `<h4>${h}</h4>` : ""}${html}</div>`;
  const check = (t) => `<div class="emg-check">⚠ ${esc(t)}</div>`;
  // one step of a decision path
  const stage = (n, title, o) => `<div class="am-panel emg-panel emg-stage">
    <div class="emg-sh"><i>${n}</i><h4>${esc(title)}</h4></div>
    ${o.ask ? `<p class="emg-ask">${esc(o.ask)}</p>` : ""}
    ${o.diagram || ""}
    <div class="emg-two">
      <div class="emg-look"><h5>🔎 Look for</h5>${list(o.look, "ul")}</div>
      <div class="emg-do"><h5>✔ If yes, do this</h5>${list(o.todo, "ol")}</div>
    </div>
    ${o.note ? `<p class="emg-note">${esc(o.note)}</p>` : ""}
    ${o.no ? `<div class="emg-else">✖ If not: ${esc(o.no)}</div>` : ""}
    ${o.check ? check(o.check) : ""}</div>`;

  /* ---------- diagrams ---------- */
  function chestSvg() {
    const ys = [80, 108, 136, 164, 192];
    const rib = (y, m) => `<path d="M150,${y} Q${m ? 204 : 96},${y + 8} ${m ? 258 : 42},${y + 30}" fill="none" stroke="#cfe3ff" stroke-width="5" stroke-linecap="round" opacity="${m ? 0.35 : 0.9}"/>`;
    const nums = [2, 3, 4, 5].map((n, i) => `<text x="214" y="${ys[i] + 30}" fill="#9fb8da" font-size="11">ICR ${n}</text>`).join("");
    return svgWrap("0 0 300 322", `
      <path d="M92,24 Q150,6 208,24 Q262,40 268,110 Q272,200 252,262 Q150,286 48,262 Q28,200 32,110 Q38,40 92,24Z" fill="rgba(111,227,255,.07)" stroke="#6fe3ff" stroke-width="2"/>
      <path d="M150,40 V250" stroke="#cfe3ff" stroke-width="9" stroke-linecap="round" opacity=".6"/>
      <path d="M150,52 Q100,50 56,62" fill="none" stroke="#cfe3ff" stroke-width="5" stroke-linecap="round"/><path d="M150,52 Q200,50 244,62" fill="none" stroke="#cfe3ff" stroke-width="5" stroke-linecap="round" opacity=".5"/>
      ${ys.map((y) => rib(y, 0) + rib(y, 1)).join("")}
      <line x1="96" y1="60" x2="96" y2="250" stroke="#ffc857" stroke-width="2" stroke-dasharray="6 5"/>
      <line x1="58" y1="70" x2="58" y2="250" stroke="#6fe3ff" stroke-width="2" stroke-dasharray="6 5"/>
      ${nums}
      <circle cx="96" cy="119" r="13" fill="#ff6b6b" opacity=".35"><animate attributeName="r" values="11;17;11" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="96" cy="119" r="7" fill="#ff6b6b" stroke="#fff" stroke-width="2"/>
      <circle cx="58" cy="188" r="13" fill="#35d49a" opacity=".35"><animate attributeName="r" values="11;17;11" dur="1.6s" begin=".5s" repeatCount="indefinite"/></circle><circle cx="58" cy="188" r="7" fill="#35d49a" stroke="#fff" stroke-width="2"/>
      <text x="100" y="292" fill="#ffc857" font-size="11">mid-clavicular line</text>
      <text x="92" y="306" fill="#6fe3ff" font-size="11" text-anchor="end">axillary line</text>
      <text x="4" y="316" fill="#9fb8da" font-size="10">Front view · patient's right side is on the left of the picture</text>`, "Chest with the needle point and chest drain point");
  }
  const IMG = (n, alt) => `<img class="emg-img" src="assets/emergency/${n}.jpg" alt="${esc(alt)}" loading="lazy">`;
  const chestLegend = `<div class="emg-legend"><span><i style="background:#ff6b6b"></i>1. Needle: ICR 2–3, mid-clavicular line</span><span><i style="background:#35d49a"></i>2. Chest drain: ICR 4–5, mid or anterior axillary line</span></div>`;

  function drainSvg() {
    return svgWrap("0 0 330 214", `<g transform="translate(0,24)">
      <path d="M160,12 Q290,10 296,100 Q298,170 160,176 Q22,170 24,100 Q30,10 160,12Z" fill="rgba(111,227,255,.06)" stroke="#6fe3ff" stroke-width="2"/>
      <path d="M90,60 Q110,40 150,52 Q170,90 150,130 Q120,150 92,128 Q76,96 90,60Z" fill="rgba(255,255,255,.13)" stroke="#cfe3ff" stroke-width="1.5"/>
      <text x="96" y="100" fill="#cfe3ff" font-size="10">lung</text>
      <rect x="30" y="140" width="260" height="30" rx="10" fill="#4aa3ff" opacity=".35"/><text x="120" y="160" fill="#cfe3ff" font-size="11">fluid sinks to the bottom</text>
      <circle cx="230" cy="34" r="6" fill="none" stroke="#fff" opacity=".8"><animate attributeName="cy" values="60;30" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="252" cy="44" r="4" fill="none" stroke="#fff" opacity=".8"><animate attributeName="cy" values="70;36" dur="2.4s" repeatCount="indefinite"/></circle>
      <text x="150" y="26" fill="#ffc857" font-size="11">air rises ↑</text>
      <path d="M312,100 H250 Q236,100 236,84 V40" fill="none" stroke="#ffc857" stroke-width="5" stroke-linecap="round"/><circle cx="236" cy="38" r="5" fill="#ffc857"/>
      <path d="M312,120 H262 Q248,120 248,134 V150" fill="none" stroke="#35d49a" stroke-width="5" stroke-linecap="round"/><circle cx="248" cy="152" r="5" fill="#35d49a"/>
      </g><text x="8" y="14" fill="#ffc857" font-size="12">Air → tip at the top (apex)</text>
      <text x="8" y="208" fill="#35d49a" font-size="12">Fluid → tip low (caudal)</text>`, "Chest drain tip: top for air, low for fluid");
  }

  // belly: rib cage, McBurney, Lanz, Blumberg and (optional) Murphy
  function bellySvg(murphy) {
    const ribs = [0, 1, 2].map((i) => `<path d="M150,${22 + i * 16} Q96,${26 + i * 16} 62,${52 + i * 16}" fill="none" stroke="#cfe3ff" stroke-width="4" opacity=".4" stroke-linecap="round"/><path d="M150,${22 + i * 16} Q204,${26 + i * 16} 238,${52 + i * 16}" fill="none" stroke="#cfe3ff" stroke-width="4" opacity=".4" stroke-linecap="round"/>`).join("");
    return svgWrap("0 0 300 270", `
      <defs><marker id="arB" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#35d49a"/></marker></defs>
      <path d="M60,14 Q150,0 240,14 Q282,70 266,150 Q250,224 150,240 Q50,224 34,150 Q18,70 60,14Z" fill="rgba(111,227,255,.07)" stroke="#6fe3ff" stroke-width="2"/>
      ${ribs}
      <circle cx="150" cy="120" r="6" fill="none" stroke="#cfe3ff" stroke-width="2"/><text x="160" y="116" fill="#9fb8da" font-size="11">navel</text>
      <circle cx="64" cy="178" r="6" fill="#cfe3ff"/><circle cx="236" cy="178" r="6" fill="#cfe3ff"/>
      <text x="84" y="196" fill="#9fb8da" font-size="10" text-anchor="middle">right ASIS</text><text x="216" y="196" fill="#9fb8da" font-size="10" text-anchor="middle">left ASIS</text>
      <line x1="64" y1="178" x2="150" y2="120" stroke="#ffc857" stroke-width="2" stroke-dasharray="5 4"/>
      <line x1="64" y1="178" x2="236" y2="178" stroke="#6fe3ff" stroke-width="2" stroke-dasharray="5 4"/>
      <circle cx="93" cy="159" r="14" fill="#ff6b6b" opacity=".35"><animate attributeName="r" values="11;17;11" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="93" cy="159" r="7" fill="#ff6b6b" stroke="#fff" stroke-width="2"/>
      <text x="52" y="138" fill="#ffc857" font-size="11" font-weight="700">McBurney</text>
      <circle cx="121" cy="178" r="6" fill="#4aa3ff" stroke="#fff" stroke-width="2"/><text x="121" y="214" text-anchor="middle" fill="#6fe3ff" font-size="11" font-weight="700">Lanz</text>
      <circle cx="200" cy="170" r="8" fill="none" stroke="#35d49a" stroke-width="3"/><path d="M200,160 q16,-26 38,-34" fill="none" stroke="#35d49a" stroke-width="2.5" marker-end="url(#arB)"/>
      <text x="186" y="214" fill="#35d49a" font-size="11" font-weight="700" text-anchor="middle">Blumberg</text>
      ${murphy ? `<circle cx="104" cy="82" r="14" fill="#c77dff" opacity=".35"><animate attributeName="r" values="11;17;11" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="104" cy="82" r="7" fill="#c77dff" stroke="#fff" stroke-width="2"/><text x="104" y="64" fill="#e0b3ff" font-size="11" font-weight="700" text-anchor="middle">Murphy</text>` : ""}
      <text x="4" y="264" fill="#9fb8da" font-size="10">Patient's right side is on the left of the picture</text>`, "Abdomen with the pressure points");
  }

  // simplified dermatome map (front / back)
  function bodyMap(back) {
    const id = back ? "bk" : "fr";
    const shapes = `<rect x="90" y="50" width="20" height="18" rx="6"/><rect x="62" y="64" width="76" height="142" rx="18"/><rect x="34" y="68" width="24" height="150" rx="11"/><rect x="142" y="68" width="24" height="150" rx="11"/><rect x="66" y="200" width="32" height="196" rx="13"/><rect x="102" y="200" width="32" height="196" rx="13"/>`;
    const bands = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<line x1="62" x2="138" y1="${90 + i * 11}" y2="${90 + i * 11}" stroke="#fff" opacity=".55" stroke-width="1"/>`).join("");
    return `<svg viewBox="0 0 200 420" class="emg-svg emg-body" role="img" aria-label="Body map ${back ? "back" : "front"}"><defs><clipPath id="cp${id}">${shapes}</clipPath></defs>
      <circle cx="100" cy="30" r="22" fill="rgba(255,255,255,.14)" stroke="#6fe3ff" stroke-width="1.5"/>
      <g clip-path="url(#cp${id})">
        <rect x="0" y="40" width="200" height="40" fill="#b5d334"/><rect x="20" y="66" width="40" height="160" fill="#b5d334"/><rect x="140" y="66" width="40" height="160" fill="#b5d334"/>
        <rect x="62" y="80" width="76" height="110" fill="#f1a5d4"/>${bands}
        <rect x="60" y="190" width="80" height="192" fill="#2bb6d9"/>
        <rect x="60" y="380" width="80" height="20" fill="#ffcc33"/>
        ${back ? `<ellipse cx="100" cy="214" rx="34" ry="24" fill="#ffcc33"/><rect x="92" y="230" width="16" height="150" fill="#ffcc33" opacity=".9"/>` : `<ellipse cx="100" cy="210" rx="9" ry="9" fill="#ffcc33"/>`}
      </g>
      <g fill="none" stroke="#6fe3ff" stroke-width="1.5">${shapes.replace(/<rect /g, "<rect fill='none' ")}</g>
      <text x="100" y="414" text-anchor="middle" fill="#9fb8da" font-size="12">${back ? "Back" : "Front"}</text></svg>`;
  }
  const bodyLegend = `<div class="emg-legend"><span><i style="background:#b5d334"></i>C neck, shoulders, arms</span><span><i style="background:#f1a5d4"></i>T chest and belly</span><span><i style="background:#2bb6d9"></i>L legs</span><span><i style="background:#ffcc33"></i>S groin, buttocks, feet</span></div>`;

  /* ---------- tables ---------- */
  function gcsTable() {
    const COLS = [
      ["Eyes", "👁️", { 4: ["g", "Open by themselves"], 3: ["y", "Open to voice"], 2: ["r", "Open to pain"], 1: ["d", "None"] }],
      ["Speech", "💬", { 5: ["g", "Oriented"], 4: ["y", "Disoriented"], 3: ["y", "Inappropriate words"], 2: ["r", "Unclear sounds"], 1: ["d", "None"] }],
      ["Movement", "🖐️", { 6: ["g", "Obeys commands"], 5: ["y", "Pushes the pain away"], 4: ["y", "Pulls away from pain"], 3: ["r", "Abnormal bending"], 2: ["r", "Abnormal stretching"], 1: ["d", "None"] }]
    ];
    const rows = [6, 5, 4, 3, 2, 1];
    return `<div class="emg-gcsT" id="emgGcs"><div class="emg-gh"></div>${COLS.map((c) => `<div class="emg-gh">${c[1]} ${c[0]}</div>`).join("")}
      ${rows.map((n) => `<div class="emg-gn">${n}</div>${COLS.map((c, ci) => { const o = c[2][n]; return o ? `<button type="button" class="emg-gc ${o[0]}" data-col="${ci}" data-v="${n}">${o[1]}</button>` : `<div class="emg-gc x"></div>`; }).join("")}`).join("")}
    </div><div class="emg-gres" id="emgG">Tap one box in each column. Score: 3 to 15.</div>`;
  }
  function gcsBind(root) {
    const pick = [0, 0, 0], out = $("#emgG", root);
    root.querySelectorAll(".emg-gc[data-v]").forEach((b) => b.addEventListener("click", () => {
      pick[b.dataset.col] = Number(b.dataset.v);
      root.querySelectorAll(`.emg-gc[data-col="${b.dataset.col}"]`).forEach((x) => x.classList.toggle("sel", x === b));
      if (pick.some((v) => !v)) { out.className = "emg-gres"; out.textContent = `Picked ${pick.filter(Boolean).length} of 3 columns.`; return; }
      const t = pick[0] + pick[1] + pick[2];
      const lv = t >= 13 ? ["emg-ok", "Mild or normal. Keep watching."] : t >= 9 ? ["emg-mid", "Moderate drop in awareness. Call the flight surgeon now."] : ["emg-bad", "Severe drop in awareness (8 or less). Life-threatening. Call the flight surgeon now."];
      out.className = "emg-gres " + lv[0];
      out.innerHTML = `<b>${t}</b> / 15 <span>${lv[1]}</span>`;
    }));
  }

  const bloodTable = () => {
    const H = ["Grade 1", "Grade 2 (mild)", "Grade 3 (moderate)", "Grade 4 (severe)"];
    const R = [
      ["Blood lost (% of blood)", "up to 15%", "15–30%", "30–40%", "over 40%"],
      ["Heart rate", "↔", "↔ / ↑", "↑", "↑↑"],
      ["Blood pressure", "↔", "↔", "↓", "↓"],
      ["Pulse pressure (amplitude)", "↔", "↓", "↓", "↓"],
      ["Breathing rate", "↔", "↔", "↔ / ↑", "↑"],
      ["Urine (mL/h)", "↔", "↔", "↓", "↓↓"],
      ["GCS", "↔", "↔", "↓", "↓"],
      ["Base deficit (mmol/L)", "0 to −2", "−2 to −6", "−6 to −10", "−10 or lower"],
      ["Blood products", "Watch", "Possible", "Yes", "Massive transfusion protocol"]
    ];
    return `<div class="emg-scroll"><table class="emg-tbl emg-blood"><thead><tr><th></th>${H.map((h, i) => `<th class="g${i}">${h}</th>`).join("")}</tr></thead><tbody>${R.map((r) => `<tr><th>${r[0]}</th>${r.slice(1).map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="emg-note">↔ no change · ↑ higher · ↓ lower</p>`;
  };
  const infectionTable = () => `<div class="emg-scroll"><table class="emg-tbl"><thead><tr><th></th><th>🦠 Viral</th><th>🧫 Bacterial</th></tr></thead><tbody>
    <tr><th>Fever</th><td>Yes</td><td>Yes</td></tr>
    <tr><th>CRP</th><td>Slightly high. Norm &lt; 0.5 mg/L. With infection up to 20 mg/L (EBV can reach 50 mg/L)</td><td class="hot">Strongly high, often &gt; 100 mg/L</td></tr>
    <tr><th>Procalcitonin<br><small>norm &lt; 0.05 ng/mL</small></th><td>Slightly high</td><td class="hot">Often high, more specific for bacteria than CRP. Above 0.25 ng/mL: antibiotic</td></tr>
    <tr><th>Neutrophils</th><td>Possible in the early stage too</td><td class="hot">Neutrophilia and left shift</td></tr>
    <tr><th>White cells (leukocytes)</th><td>Normal or low (leukopenia)</td><td class="hot">High (leukocytosis), often &gt; 10,000/µL</td></tr></tbody></table></div>`;

  /* range bar */
  const rangeBar = (label, min, max, lo, hi, unit) => { const p = (v) => ((v - min) / (max - min)) * 100; return `<div class="emg-rb"><div class="emg-rl"><b>${label}</b><span>normal ${lo}–${hi} ${unit}</span></div><div class="emg-rt"><i style="left:${p(lo)}%;width:${p(hi) - p(lo)}%"></i></div><div class="emg-ra"><span>${min}</span><span>${max}</span></div></div>`; };
  const NORMAL = { pulse: [60, 100], resp: [12, 18], spo2: [95, 100] };
  function vitalsForm() {
    return `<div class="emg-vf" id="emgVf"><label><span>Pulse (per min)</span><input type="number" data-k="pulse" inputmode="decimal"></label>
      <label><span>Top blood pressure (mmHg)</span><input type="number" data-k="sys" inputmode="decimal"></label>
      <label><span>Breathing (per min)</span><input type="number" data-k="resp" inputmode="decimal"></label>
      <label><span>Oxygen (SpO₂ %)</span><input type="number" data-k="spo2" inputmode="decimal"></label>
      <label><span>Temperature (°C)</span><input type="number" step="0.1" data-k="temp" inputmode="decimal"></label></div><div class="emg-chips" id="emgVr"></div>`;
  }
  function vitalsBind(root) {
    const out = $("#emgVr", root), v = {};
    const chip = (t, c) => `<span class="emg-chip ${c}">${t}</span>`;
    root.querySelectorAll("[data-k]").forEach((i) => i.addEventListener("input", () => {
      v[i.dataset.k] = i.value === "" ? null : Number(i.value);
      const c = [];
      const rg = (k, n, u) => { if (v[k] == null) return; const [a, b] = NORMAL[k]; c.push(chip(`${n}: ${v[k]} ${u} · ${v[k] < a ? "low" : v[k] > b ? "high" : "normal"}`, v[k] < a || v[k] > b ? "bad" : "ok")); };
      rg("pulse", "Pulse", "/min"); rg("resp", "Breathing", "/min"); rg("spo2", "SpO₂", "%");
      if (v.temp != null) c.push(chip(`Temperature: ${v.temp} °C · ${v.temp >= 38.5 ? "fever" : "no fever"}`, v.temp >= 38.5 ? "bad" : "ok"));
      if (v.pulse && v.sys) { const si = v.pulse / v.sys; c.push(chip(`Shock index: ${si.toFixed(2)} (pulse ÷ top pressure)`, "info")); }
      out.innerHTML = c.join("") || "";
    }));
  }

  /* bone: N-telopeptide ranges */
  const NTX = { m: [21, 83, "Men"], fpre: [17, 94, "Women before menopause"], fpost: [36, 124, "Women after menopause"] };
  const ntxChart = () => { const mx = 130; return `<div class="emg-ntx">${Object.values(NTX).map(([a, b, n]) => `<div class="emg-rb"><div class="emg-rl"><b>${n}</b><span>${a}–${b} nmol/mmol creatinine</span></div><div class="emg-rt"><i style="left:${(a / mx) * 100}%;width:${((b - a) / mx) * 100}%"></i></div></div>`).join("")}<div class="emg-ra"><span>0</span><span>${mx}</span></div></div>
    <div class="emg-vf"><label><span>Your N-telopeptide (urine)</span><input type="number" id="emgNtx" inputmode="decimal"></label></div><div class="emg-chips" id="emgNtxR"></div>`; };
  function ntxBind(root) {
    const i = $("#emgNtx", root), o = $("#emgNtxR", root); if (!i) return;
    i.addEventListener("input", () => {
      if (i.value === "") { o.innerHTML = ""; return; }
      const p = (window.AstroMedProfile && window.AstroMedProfile.get()) || {};
      const r = p.sex === "m" ? NTX.m : p.sex === "f" ? (p.meno === "post" ? NTX.fpost : NTX.fpre) : NTX.fpre;
      const v = Number(i.value), s = v > r[1] ? ["high", "bad"] : v < r[0] ? ["low", "mid"] : ["in range", "ok"];
      o.innerHTML = `<span class="emg-chip ${s[1]}">${v}: ${s[0]} for ${r[2].toLowerCase()} (${r[0]}–${r[1]})</span>${p.sex ? "" : '<small class="emg-note"> Set your sex in the profile for the right range.</small>'}`;
    });
  }
  const boneGauge = () => `<div class="emg-gauge"><div class="emg-gr"><i style="left:0;width:90%;background:linear-gradient(90deg,#ff6b6b,#ffc857 80%,#35d49a)"></i><u style="left:90%"><em>90%</em><small>femoral neck min.</small></u><u style="left:95%"><em>95%</em><small>hip &amp; spine min.</small></u></div><p>Bone density (DXA) compared with your value before the mission (100%). NASA: keep at or above 95% (hip, spine) and 90% (femoral neck). Typical loss is about 1–1.5% per month without countermeasures.</p></div>`;
  const anemiaBars = () => `<div class="emg-bars"><div><small>Normal on Earth</small><div class="emg-bt"><i style="width:66%;background:#35d49a"></i></div><b>≈ 2 million red cells / second destroyed</b></div><div><small>In microgravity</small><div class="emg-bt"><i style="width:100%;background:#ff6b6b"></i></div><b>≈ 3 million red cells / second destroyed</b></div></div>`;

  /* ---------- cards ---------- */
  const CARDS = [
    {
      id: "vitals", g: "first", i: "🩺", t: "Vital signs", c: "info", tag: "Check first",
      sign: "Normal values and a quick check.",
      body: () => panel("Normal vital signs", `${rangeBar("Pulse", 30, 160, 60, 100, "per min")}${rangeBar("Breathing", 5, 35, 12, 18, "per min")}${rangeBar("Oxygen (SpO₂)", 80, 100, 95, 100, "%")}
          <div class="emg-chips"><span class="emg-chip ok">Blood pressure: 120/80 mmHg</span><span class="emg-chip bad">Fever: 38.5 °C or more</span></div>
          <p class="emg-note">Always compare with the astronaut's own usual values.</p>`) +
        panel("Try it: type the values", vitalsForm()) +
        panel("Blood loss and shock", `<p class="emg-note">The shock index is pulse ÷ top blood pressure. A higher number is worse. Compare it with the astronaut's own usual value.</p>${bloodTable()}`),
      bind: vitalsBind, src: SRC
    },
    {
      id: "gcs", g: "first", i: "😵", t: "Not awake or confused", c: "bad", tag: "Check first",
      sign: "Check how awake the person is.",
      body: () => panel("Glasgow Coma Scale", `<p class="emg-note">Lower score = worse. Maximum 15. 9–12: moderate drop in awareness. 8 or less: severe drop.</p>${gcsTable()}`),
      bind: gcsBind, src: SRC + " · Glasgow Coma Scale"
    },
    {
      id: "breath", g: "feel", i: "🫁", t: "Short of breath or chest tight", c: "bad", tag: "Red flag",
      sign: "Did it start suddenly (by itself)?",
      body: () => stage(1, "Check for a collapsed lung (pneumothorax)", {
        look: ["Lung ultrasound: air between the ribs and no lung tissue under the probe", "Or: no breathing sound in part of the lung when you listen (auscultation)"],
        todo: ["Needle first: a large needle in the 2nd–3rd intercostal space (ICR) on the mid-clavicular line, OR in the 4th–5th ICR on the mid or anterior axillary line.", "Then a chest drain. Local anaesthesia, small cut (mini-thoracotomy).", "Prepare the channel: open it bluntly with scissors or forceps at the TOP edge of the lower rib of that space.", "Tunnel upwards, open the parietal pleura, feel the pleural space with a finger.", "Grab the drain with forceps (no guide rod) and push it in about 20 cm, guided by the finger if possible.", "Tip of the drain: AIR rises, so put it at the top (apex). FLUID flows down, so put it low (caudal)."],
        diagram: `<div class="emg-dg">${IMG("chest", "Chest with the needle point and the chest drain point")}${IMG("drain", "Chest drain: tip at the top for air, low for fluid")}</div>${chestLegend}`, no: "Go to step 2."
      }) + stage(2, "No lung problem? Think about a heart attack", {
        look: ["ST elevation on the ECG", "Cold sweat", "Pain that spreads (to the back, stomach or arm)", "Nausea and tiredness"],
        todo: ["Aspirin (ASA)", "Heparin", "Metoprolol", "Short-acting opioids"],
        no: "If none of this is present, shortness of breath is unlikely to be an emergency."
      }), src: SRC + " (Amboss: chest drain)"
    },
    {
      id: "belly", g: "feel", i: "🤢", t: "Belly pain", c: "bad", tag: "Red flag",
      sign: "Where does it hurt?",
      body: () => stage(1, "Sharp pain, lower right belly?", {
        ask: "Also ask: nausea, diarrhoea, fever?",
        diagram: `<div class="emg-dg one">${IMG("belly-rovsing", "Abdomen with McBurney, Lanz and Blumberg points")}</div>`,
        look: ["McBurney: press on the outer third of the line from the right hip bone (ASIS) to the navel. Pain = positive.", "Lanz: press on the right third of the line between the two hip bones (ASIS). Pain = positive.", "Blumberg: press the LOWER LEFT belly for one minute, then let go fast. Pain on the other side = positive. It can also mean peritonitis.", "Ultrasound: thick wall of the appendix, or fluid around it"],
        todo: ["Antibiotics: Cefuroxime + Metronidazole", "If the appendix has burst and caused peritonitis: Piperacillin/Tazobactam", "Pain medicine: Metamizole"],
        note: "The same problem can be a diverticulitis. The treatment is the same.", no: "If all signs are negative, go to step 2."
      }) + stage(2, "Pain under the right ribs? Murphy's sign", {
        diagram: `<div class="emg-dg one">${IMG("belly-murphy", "Abdomen with the Murphy point")}</div>`,
        look: ["Murphy's sign: press deep under the right ribs while the person breathes in. Sharp pain and they stop breathing in = positive.", "Ultrasound: thick wall of the gallbladder and a stone in the duct (cholecystitis)"],
        todo: ["No food (fasting)", "Antispasmodic, for example Butylscopolamine", "Pain medicine, for example Metamizole"]
      }), src: SRC
    },
    {
      id: "back", g: "feel", i: "🔙", t: "Strong back pain", c: "bad", tag: "Red flag",
      sign: "Very strong, pulsing pain that moves down.",
      body: () => stage(1, "Look for a kidney stone", {
        look: ["Extreme pain that pulses and moves down", "Ultrasound: a stone in the ureter"],
        todo: ["Waiting without an operation only works for stones smaller than 7 mm.", "Pain: Metamizole or Diclofenac", "Relax the ureter muscle: an alpha blocker such as Tamsulosin (off-label), or Nifedipine (off-label)", "Drink a lot of water", "Keep moving"],
        diagram: `<div class="emg-flow col"><div class="emg-node info"><b>🔎</b><span>How big is the stone?</span></div><div class="emg-split"><div><div class="emg-tag ok">Smaller than 7 mm</div><div class="emg-mini"><span>💊 Pain relief</span><span>🔓 Relax ureter</span><span>💧 Drink water</span><span>🚶 Move</span></div></div><div><div class="emg-tag bad">7 mm or bigger</div><div class="emg-mini one"><span>📡 Not for waiting. Call the flight surgeon.</span></div></div></div></div>`
      }), src: SRC
    },
    {
      id: "calf", g: "feel", i: "🦵", t: "Calf pain", c: "bad", tag: "Red flag",
      sign: "Painful, red or warm calf.",
      body: () => stage(1, "Look for a clot in a leg vein (DVT)", {
        look: ["Redness of the calf", "Pain when the calf is pressed", "Warm skin (overheating)", "Ultrasound: the vein cannot be pressed flat"],
        todo: ["Do not massage the leg.", "Blood thinner: Apixaban or Rivaroxaban. Alternative: Heparin."],
        diagram: flow([{ i: "🦵", t: "Clot in leg vein", c: "bad" }, { i: "🫀", t: "Travels with the blood" }, { i: "🫁", t: "Lung: embolism", c: "bad" }, { i: "❤️", t: "Heart attack", c: "bad" }, { i: "🧠", t: "Stroke", c: "bad" }]),
        no: "Then it is likely a sore muscle.",
        check: "CHECK with the doctor: the notes say 3 weeks of blood thinner. Guidelines usually say at least 3 months."
      }), src: SRC
    },
    {
      id: "fever", g: "feel", i: "🌡️", t: "Fever or infection", c: "mid", tag: "Red flag",
      sign: "Fever is 38.5 °C or more.",
      body: () => panel("Viral or bacterial?", `<p class="emg-note">Blood tests help to tell them apart. The red boxes point to bacteria.</p>${infectionTable()}`) +
        panel("Virus waking up (Zoster or Simplex)", `<div class="emg-dg">${IMG("dermatome", "Body map: front and back, skin areas by nerve level")}<div>${list(["Zoster: small blisters, usually on one side and inside one dermatome (one body band).", "Simplex: usually on the lips or in the genital area."], "ul")}</div></div><p class="emg-note">Simplified map. A dermatome is the skin area of one nerve root.</p>`) +
        panel("What to do", `<ol class="emg-steps"><li>Aciclovir for oral and genital herpes: adults and children 12 years and older, 200 mg every 4 hours, 5 times a day, for 7 days.</li><li>To stop it coming back: usual dose 200 mg (one tablet) 4 times a day. Space the doses about 6 hours apart.</li><li>Tick your symptoms in Readiness → Immune system watch.</li></ol>${check("CHECK with the doctor: these doses are for oral and genital herpes. Zoster (shingles) usually needs a different dose.")}`),
      src: SRC + " · Crucian et al. 2018 (virus reactivation in spaceflight)"
    },
    {
      id: "storm", g: "space", i: "☀️", t: "Solar storm", c: "bad", tag: "Space event",
      sign: "Alarm or ground call: go to the safe room.",
      body: () => panel("Solar storm: what to do", (window.AstroMedRadiation && window.AstroMedRadiation.stormHtml ? window.AstroMedRadiation.stormHtml() : "<p>Open Radiation to see the storm guide.</p>")),
      src: "NASA-STD-3001 V1 4031 (storm limit 250 mSv) · mission protocol"
    },
    {
      id: "bone", g: "slow", i: "🦴", t: "Bone density loss", c: "mid", tag: "Slow risk",
      sign: "Bones weaken without gravity.",
      body: () => panel("Bone density", boneGauge()) +
        panel("N-telopeptide in urine (ELISA)", `<p class="emg-note">Reference ranges, in nmol per mmol creatinine. A value above the range means more bone breakdown.</p>${ntxChart()}`) +
        panel("What to do", `<ol class="emg-steps"><li>Take vitamin D.</li><li>If vitamin D does not help, take a bisphosphonate (ask your flight surgeon).</li><li>Keep up resistive exercise (ARED).</li></ol>`),
      bind: ntxBind, src: SRC + " · NASA-STD-3001 V1 4027 · MR089S"
    },
    {
      id: "anemia", g: "slow", i: "🩸", t: "Space anaemia", c: "mid", tag: "Slow risk",
      sign: "Fewer red blood cells in space.",
      body: () => panel("Why it happens", anemiaBars() + flow([{ i: "☢️", t: "Radiation" }, { i: "🪐", t: "Microgravity" }, { i: "🩸", t: "More red cells destroyed", c: "bad" }, { i: "😮‍💨", t: "Anaemia", c: "bad" }])) +
        panel("What was seen", list(["Lower red cell mass, reticulocytes, haemoglobin and erythropoietin (EPO).", "EPO falls as central venous pressure rises.", "Haptoglobin was not lower: the cells break down outside the blood vessels.", "Little movement and bone load can push marrow stem cells to make bone or fat instead of blood.", "Microgravity also changes the structure and function of red cells."], "ul")) +
        check("CHECK: the doctor asked for changes to this card. Waiting for her details."),
      src: SRC + " · PMC10976580. Blood count and reticulocytes are in the yearly exam (MR089S)."
    }
  ];

  /* ---------- page ---------- */
  function comm() { try { return window.AstroMedEnv && window.AstroMedEnv.comm(); } catch { return null; } }
  function detail(c) {
    return `<button type="button" class="am-btn am-btn-soft emg-back" id="emgBack">← All emergencies</button>
      <div class="emg-head ${c.c}"><span>${c.i}</span><div><h3>${c.t}</h3><p>${esc(c.sign)}</p></div></div>
      ${c.body()}
      <p class="am-small">Source: ${esc(c.src)}. This guide helps when the ground team is far away. It does not replace medical training.</p>`;
  }
  function tile(c) { return `<button type="button" class="emg-tile ${c.c}" data-emg="${c.id}"><span class="emg-ic">${c.i}</span><b>${c.t}</b><small>${esc(c.sign)}</small><em>${c.tag}</em></button>`; }
  function go(id) { if (CARDS.some((c) => c.id === id)) { open = id; render(); window.scrollTo({ top: 0 }); } }
  function render() {
    const page = $("#emergencyPage"); if (!page) return;
    if (open) {
      const c = CARDS.find((x) => x.id === open);
      page.innerHTML = detail(c);
      $("#emgBack", page).addEventListener("click", () => { open = null; render(); window.scrollTo({ top: 0 }); });
      if (c.bind) c.bind(page);
      return;
    }
    const m = comm();
    const grp = (h, g) => `<h3 class="emg-h">${h}</h3><div class="emg-grid">${CARDS.filter((c) => c.g === g).map(tile).join("")}</div>`;
    page.innerHTML = `
      <div class="am-heading"><h2>Emergency</h2><p>Start with what you see or feel. The steps lead you to what to do.</p></div>
      <div class="emg-banner"><b>🚨 Life in danger?</b><span>Call the flight surgeon now.${m ? ` Message delay to Earth here: <u>${esc(m.one)}</u> one way. ${m.place === "mars" ? "You will have to act on your own first." : ""}` : " Set your location in Environment to see the message delay."}</span></div>
      ${grp("Check first", "first")}${grp("What do you feel?", "feel")}${grp("Space events", "space")}${grp("Slow risks in space", "slow")}
      <p class="am-small">Written from the team doctor's notes. Items marked CHECK still need the doctor's confirmation.</p>`;
    page.querySelectorAll("[data-emg]").forEach((b) => b.addEventListener("click", () => go(b.dataset.emg)));
  }

  window.AstroMedEmergency = { render, go };
})();
