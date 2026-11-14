
/**
 * AstroTwin — Interactive Astronaut Health Twin
 * ------------------------------------------------------------
 * Frontend application logic for an educational NASA Space Apps demo.
 *
 * Main features:
 *  1. Astronaut health system configuration
 *  2. Interactive spacesuit
 *  3. Anatomical organ visualization
 *  4. Health measurements and charts
 *  5. Local measurement storage
 *  6. Radiation exposure simulation
 *  7. CSV export and reports
 *
 * IMPORTANT:
 * All sample values are illustrative.
 * This software is not a validated medical device.
 */

(() => {
  "use strict";

  // ============================================================
  // 1. HEALTH SYSTEM CONFIGURATION
  // ============================================================

  const configs = {
    heart: {
      label: "Cardiovascular",
      title: "Cardiovascular System",
      sub: "Heart rate · Blood pressure · HRV",
      symbol: "♥",

      description:
        "Monitor heart activity and compare changes over time. " +
        "A reading by itself does not establish the cause of a physiological change.",

      fields: [
        { key: "hr", label: "Heart rate", unit: "bpm", value: 76, min: 0, max: 250, step: 1 },
        { key: "sys", label: "Systolic BP", unit: "mmHg", value: 118, min: 0, max: 300, step: 1 },
        { key: "dia", label: "Diastolic BP", unit: "mmHg", value: 76, min: 0, max: 220, step: 1 },
        { key: "hrv", label: "HRV", unit: "ms", value: 42, min: 0, max: 400, step: 1 }
      ],

      trendKey: "hr",
      trendLabel: "Heart rate",
      trend: [75, 82, 79, 77, 85, 80, 76]
    },

    lungs: {
      label: "Respiratory",
      title: "Respiratory System",
      sub: "Respiratory rate · Oxygen saturation",
      symbol: "♧",

      description:
        "Respiratory metrics may be useful in a health assessment but must be " +
        "interpreted with symptoms, context and validated instrumentation.",

      fields: [
        { key: "resp", label: "Respiratory rate", unit: "breaths/min", value: 16, min: 0, max: 80, step: 1 },
        { key: "spo2", label: "SpO₂", unit: "%", value: 98, min: 0, max: 100, step: 1 }
      ],

      trendKey: "resp",
      trendLabel: "Respiratory rate",
      trend: [17, 16, 16, 18, 17, 16, 16]
    },

    bones: {
      label: "Musculoskeletal",
      title: "Bone & Skeletal System",
      sub: "Bone density · Physical activity",
      symbol: "⌁",

      description:
        "Bone mineral density is generally determined using medical imaging. " +
        "Exercise minutes do not directly measure bone density.",

      fields: [
        { key: "bmd", label: "Reference BMD", unit: "g/cm²", value: 1.12, min: 0, max: 3, step: 0.01 },
        { key: "exercise", label: "Resistance exercise", unit: "min", value: 45, min: 0, max: 240, step: 1 }
      ],

      trendKey: "exercise",
      trendLabel: "Resistance exercise",
      trend: [46, 50, 42, 58, 45, 60, 45]
    },

kidneys: {
  label: "Renal & Urinary",
  title: "Renal & Urinary Health",
  sub: "Urine output · Fluid intake · Output rate",
  symbol: "💧",

  description:
    "Record urine volume with a measurement period and body weight. " +
    "The average urine output rate is a calculated observation, " +
    "not a diagnosis of kidney disease or dehydration.",

  fields: [
    {
      key: "urineOutput",
      label: "Urine output",
      unit: "mL",
      value: 1500,
      min: 0,
      max: 10000,
      step: 10
    },
    {
      key: "collectionHours",
      label: "Collection period",
      unit: "h",
      value: 24,
      min: 1,
      max: 24,
      step: 1
    },
    {
      key: "weightKg",
      label: "Body weight",
      unit: "kg",
      value: 65,
      min: 20,
      max: 250,
      step: 0.1
    },
    {
      key: "fluidIntake",
      label: "Fluid intake",
      unit: "mL",
      value: 2000,
      min: 0,
      max: 10000,
      step: 10
    }
  ],

  trendKey: "urineOutput",
  trendLabel: "Urine output",
  trend: [1450, 1530, 1480, 1550, 1500, 1470, 1500]
},



    brain: {
      label: "Neurological",
      title: "Sleep & Cognition",
      sub: "Sleep duration · Mood · Reaction test",
      symbol: "✺",

      description:
        "Sleep and task-performance trends may inform crew wellness monitoring, " +
        "but do not establish a mental-health diagnosis.",

      fields: [
        { key: "sleep", label: "Sleep duration", unit: "h", value: 7.2, min: 0, max: 24, step: 0.1 },
        { key: "reaction", label: "Reaction time", unit: "ms", value: 285, min: 0, max: 3000, step: 1 },
        { key: "mood", label: "Mood (self-report)", unit: "/10", value: 7, min: 1, max: 10, step: 1 }
      ],

      trendKey: "sleep",
      trendLabel: "Sleep",
      trend: [6.8, 7.5, 7.2, 6.9, 7.4, 7, 7.2]
    },

    hand: {
      label: "Pulse & Wearables",
      title: "Peripheral Pulse",
      sub: "Pulse · SpO₂ · Temperature · Blood glucose",
      symbol: "◉",

      description:
        "Potential data from hand or finger wearables, subject to sensor " +
        "availability and verification.",

      
fields: [
  {
    key: "pulse",
    label: "Pulse",
    unit: "bpm",
    value: 78,
    min: 0,
    max: 250,
    step: 1
  },
  {
    key: "spo2",
    label: "SpO₂",
    unit: "%",
    value: 98,
    min: 0,
    max: 100,
    step: 1
  },
  {
    key: "skin",
    label: "Skin temperature",
    unit: "°C",
    value: 33.1,
    min: 0,
    max: 50,
    step: 0.1
  },
  {
    key: "bodyTemp",
    label: "Oral body temperature",
    unit: "°C",
    value: 36.8,
    min: 32,
    max: 43,
    step: 0.1
  },
  {
    key: "glucose",
    label: "Blood glucose",
    unit: "mg/dL",
    value: 92,
    min: 20,
    max: 600,
    step: 1
  }
],

      trendKey: "pulse",
      trendLabel: "Pulse",
      trend: [75, 77, 82, 79, 84, 78, 78]
    },

    muscles: {
      label: "Muscle Health",
      title: "Muscular System",
      sub: "Exercise · Functional performance",
      symbol: "◇",

      description:
        "An activity log can support muscular-health monitoring; it is not " +
        "a direct measurement of muscle mass or strength.",

      fields: [
        { key: "activity", label: "Activity", unit: "min", value: 65, min: 0, max: 300, step: 1 },
        { key: "strength", label: "Training load", unit: "kg", value: 25, min: 0, max: 500, step: 0.5 }
      ],

      trendKey: "activity",
      trendLabel: "Activity minutes",
      trend: [55, 62, 70, 50, 80, 65, 65]
    }
  };

  // Application settings and state.

  const systemOrder = [
    "heart",
    "lungs",
    "kidneys",
    "bones",
    "brain",
    "hand",
    "muscles"
  ];

  const storageKey = "astrotwin-gui-v2-records";
  const maxRecords = 1000;

  const $ = (id) => document.getElementById(id);
  const fieldsFor = (id) => configs[id].fields;

  let selectedSystem = "heart";
  let isSuitOpen = false;
  let records = [];

  // ============================================================
  // 2. ANATOMICAL ORGAN VISUALIZATION
  // ============================================================

  const organImages = {
    heart: "heart.png",
    lungs: "lungs.png",
    kidneys: "kidneys.png",
    brain: "brain.png",
    bones: "skeleton.png",
    muscles: "muscles.png",
    hand: "pulse.png"
  };

  const astronautOrganAssets = {
    brain: {
      image: "brain.png",
      left: "51%",
      top: "13%",
      width: "34%",
      height: "12%"
    },

    heart: {
      image: "heart.png",
      left: "55%",
      top: "31%",
      width: "34%",
      height: "14%"
    },

    lungs: {
      image: "lungs.png",
      left: "51%",
      top: "32%",
      width: "62%",
      height: "19%"
    },
    kidneys: {
      image: "kidneys.png",
      left: "51%",
      top: "44%",
      width: "38%",
      height: "16%"
    },

    bones: {
      image: "skeleton.png",
      left: "51%",
      top: "49%",
      width: "72%",
      height: "55%"
    }
  };

  function showOrganImage(systemId) {
    const container = $("organImageBox");
    const image = $("organImage");

    if (!container || !image) return;

    const filename = organImages[systemId];

    if (!filename) {
      container.hidden = true;
      return;
    }

    image.src = `assets/${filename}`;
    image.alt = `Anatomical illustration of ${systemId}`;
    container.hidden = false;
  }

  function showAstronautOrgan(systemId) {
    const overlay = $("astronautOrganOverlay");
    const image = $("astronautOrganImage");

    if (!overlay || !image) return;

    const organ = astronautOrganAssets[systemId];

    if (!organ) {
      overlay.hidden = true;
      return;
    }

    image.src = `assets/${organ.image}`;
    image.alt = `Anatomical illustration of ${systemId}`;

    overlay.style.setProperty("--organ-left", organ.left);
    overlay.style.setProperty("--organ-top", organ.top);
    overlay.style.setProperty("--organ-width", organ.width);
    overlay.style.setProperty("--organ-height", organ.height);

    overlay.hidden = false;
  }

  // ============================================================
  // 3. LOCAL DATA STORAGE
  // ============================================================

  function loadRecords() {
    try {
      const saved = window.AstroMedStore.store.get(storageKey, []);

      if (Array.isArray(saved)) {
        records = saved
          .filter((record) =>
            record &&
            configs[record.part] &&
            typeof record.time === "string" &&
            record.values &&
            typeof record.values === "object"
          )
          .slice(0, maxRecords);
      }
    } catch (error) {
      console.warn("Local storage unavailable", error);
    }
  }

  function persistRecords() {
    try {
      if (!window.AstroMedStore.store.set(storageKey, records)) throw new Error("Could not save to browser storage");

      return true;
    } catch (error) {
      console.warn("Could not persist records", error);

      showToast(
        "Saved for this session; browser storage is unavailable"
      );

      return false;
    }
  }

  function currentValues(systemId) {
    const latest = records.find(
      (record) => record.part === systemId
    );

    const values = {};

    fieldsFor(systemId).forEach((field) => {
      const stored = latest?.values?.[field.key];

      values[field.key] =
        stored !== undefined &&
        stored !== null &&
        Number.isFinite(Number(stored))
          ? Number(stored)
          : field.value;
    });

    return values;
  }

  // ============================================================
  // 4. INTERACTIVE ASTRONAUT AND SPACESUIT
  // ============================================================

  function setSuit(isOpen) {
    isSuitOpen = isOpen;

    $("figureWrap").classList.toggle(
      "open",
      isSuitOpen
    );

    $("figureWrap").setAttribute(
      "aria-label",
      isSuitOpen
        ? "Astronaut body visible"
        : "Open astronaut spacesuit"
    );

    $("modeText").textContent = isSuitOpen
      ? "Body view · Select a system"
      : "Suit view · Click to open";

    $("suitButton").textContent = isSuitOpen
      ? "✕ Close spacesuit"
      : "✦ Open spacesuit";

    if (isSuitOpen) {
      showToast("Suit opened. Select a body region.");
    }
  }

  function buildSystemList() {
    const list = $("systemList");

    systemOrder.forEach((systemId) => {
      const config = configs[systemId];

      const button = document.createElement("button");
      const icon = document.createElement("span");
      const label = document.createElement("span");

      button.className = "system-btn";
      button.dataset.part = systemId;

      icon.className = "sys-symbol";
      icon.textContent = config.symbol;
      label.textContent = config.label;

      button.append(icon, label);

      button.addEventListener("click", () => {
        selectSystem(systemId, true);
      });

      list.appendChild(button);
    });
  }

  function selectSystem(systemId, ensureSuitOpen = false) {
    if (!configs[systemId]) return;

    selectedSystem = systemId;

    if (ensureSuitOpen && !isSuitOpen) {
      setSuit(true);
    }

    document.querySelectorAll(".system-btn").forEach((button) => {
      button.classList.toggle(
        "selected",
        button.dataset.part === systemId
      );
    });

    document.querySelectorAll(".hotspot").forEach((button) => {
      button.classList.toggle(
        "selected",
        button.dataset.part === systemId
      );
    });

    const config = configs[systemId];
    const values = currentValues(systemId);

    $("detailTitle").textContent = config.title;
    $("detailSubtitle").textContent = config.sub;
    $("detailIcon").textContent = config.symbol;
    $("insightText").textContent = config.description;

    showOrganImage(systemId);

    renderMetrics(systemId, values);
    renderInputFields(systemId, values);

    $("chartTitle").textContent =
      `${config.trendLabel} Trend`;

    renderChart(systemId, values);
  }

  function bindAstronautEvents() {
    const astronaut = $("figureWrap");

    astronaut.addEventListener("click", (event) => {
      if (event.target.closest(".hotspot")) return;

      if (!isSuitOpen) {
        setSuit(true);
      }
    });

    astronaut.addEventListener("keydown", (event) => {
      if (
        event.target === astronaut &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        setSuit(!isSuitOpen);
      }
    });

    $("suitButton").addEventListener("click", (event) => {
      event.stopPropagation();
      setSuit(!isSuitOpen);
    });

    document.querySelectorAll(".hotspot").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();

        selectSystem(
          button.dataset.part,
          false
        );
      });
    });
  }

  // ============================================================
  // 5. HEALTH METRICS
  // ============================================================

  function metricCells(systemId, values) {
    if (systemId === "heart") {
      return [
        {
          label: "Heart Rate",
          value: values.hr,
          unit: "bpm"
        },
        {
          label: "Blood Pressure",
          value: `${values.sys} / ${values.dia}`,
          unit: "mmHg"
        },
        {
          label: "HRV",
          value: values.hrv,
          unit: "ms"
        }
      ];
    }

    return configs[systemId].fields
      .slice(0, 3)
      .map((field) => ({
        label: field.label,
        value: values[field.key],
        unit: field.unit
      }));
  }

  function renderMetrics(systemId, values) {
    const panel = $("metricCards");

    panel.replaceChildren();

    metricCells(systemId, values).forEach((metric) => {
      const card = document.createElement("div");
      const label = document.createElement("label");
      const number = document.createElement("strong");
      const unit = document.createElement("small");
      const caption = document.createElement("em");

      card.className = "metric-item";

      label.textContent = metric.label;
      number.textContent = `${metric.value} `;
      unit.textContent = metric.unit;

      caption.textContent = "Latest reading";

      number.appendChild(unit);
      card.append(label, number, caption);

      panel.appendChild(card);
    });
  }

  // ============================================================
  // CORRECTED FUNCTION — DAILY CHECKUP MEASUREMENT INPUTS
  // ============================================================

  function renderInputFields(systemId, values) {
    const container = $("inputFields");

    container.replaceChildren();

    fieldsFor(systemId).forEach((field) => {
      const group = document.createElement("div");
      const label = document.createElement("label");
      const input = document.createElement("input");

      group.className = "input-group";

      label.textContent =
        `${field.label} (${field.unit})`;

      input.type = "number";
      input.step = field.step;
      input.min = field.min;
      input.max = field.max;
      input.name = field.key;
      input.value = values[field.key];

      input.setAttribute(
        "aria-label",
        `${field.label} in ${field.unit}`
      );

      group.append(label, input);
      container.appendChild(group);
    });
  }

  function saveMeasurement() {
    const inputs = Array.from(
      $("inputFields").querySelectorAll("input")
    );

    const values = {};

    for (const input of inputs) {
      const value = Number(input.value);

      const invalid =
        !input.value.trim() ||
        !Number.isFinite(value) ||
        value < Number(input.min) ||
        value > Number(input.max);

      if (invalid) {
        input.focus();

        showToast(
          `Please enter a valid ${input.getAttribute("aria-label")}`
        );

        return;
      }

      values[input.name] = value;
    }

    records.unshift({
      part: selectedSystem,
      values,
      time: new Date().toISOString(),
      source: "manual demo"
    });

    records = records.slice(0, maxRecords);

    persistRecords();

    selectSystem(selectedSystem);
    renderOverview();

    showToast(
      "Measurement saved locally on this device"
    );
  }

  function loadDemoValues() {
    const fields = configs[selectedSystem].fields;

    const inputs = Array.from(
      $("inputFields").querySelectorAll("input")
    );

    inputs.forEach((input, index) => {
      input.value = fields[index].value;
    });

    showToast(
      "Sample values loaded into input fields (not saved)"
    );
  }

  // ============================================================
  // 6. HEALTH TREND VISUALIZATION
  // ============================================================

  function renderChart(systemId, values) {
    const config = configs[systemId];

    let data = [...config.trend];

    const recorded = records
      .filter((record) => record.part === systemId)
      .slice(0, 7)
      .reverse()
      .map((record) =>
        Number(record.values[config.trendKey])
      )
      .filter(Number.isFinite);

    if (recorded.length >= 2) {
      data = recorded;
    } else if (recorded.length === 1) {
      data = [...data.slice(1), recorded[0]];
    } else {
      data[data.length - 1] =
        values[config.trendKey];
    }

    const minimum = Math.min(...data);
    const maximum = Math.max(...data);

    const padding = Math.max(
      (maximum - minimum) * 0.25,
      Math.abs(maximum) * 0.04,
      1
    );

    const low = minimum - padding;
    const high = maximum + padding;

    const points = data.map((value, index) => [
      43 + (index * 451) / (data.length - 1),
      135 - ((value - low) / (high - low)) * 103
    ]);

    const linePath = points
      .map(
        ([x, y], index) =>
          `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`
      )
      .join(" ");

    const areaPath =
      `${linePath} L ${points[points.length - 1][0]} 136 ` +
      `L ${points[0][0]} 136 Z`;

    const namespace = "http://www.w3.org/2000/svg";
    const svg = $("trendChart");

    svg.replaceChildren();

    function element(tag, attributes = {}, content) {
      const node = document.createElementNS(
        namespace,
        tag
      );

      Object.entries(attributes).forEach(([key, value]) => {
        node.setAttribute(key, value);
      });

      if (content !== undefined) {
        node.textContent = content;
      }

      svg.appendChild(node);
      return node;
    }

    const definitions = element("defs");

    const gradient = document.createElementNS(
      namespace,
      "linearGradient"
    );

    gradient.id = "blueGradient";

    gradient.setAttribute("x1", "0");
    gradient.setAttribute("y1", "0");
    gradient.setAttribute("x2", "0");
    gradient.setAttribute("y2", "1");

    [
      ["0%", "#3e91e633"],
      ["100%", "#3e91e605"]
    ].forEach(([offset, color]) => {
      const stop = document.createElementNS(
        namespace,
        "stop"
      );

      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", color);

      gradient.appendChild(stop);
    });

    definitions.appendChild(gradient);

    for (let index = 0; index < 4; index += 1) {
      const y = 32 + index * 34.6;

      element("line", {
        x1: 42,
        y1: y,
        x2: 498,
        y2: y,
        stroke: "#e5ecf4",
        "stroke-width": 1
      });

      element(
        "text",
        {
          x: 37,
          y: y + 3,
          "text-anchor": "end"
        },
        String(
          Math.round(
            high - ((high - low) * index) / 3
          )
        )
      );
    }

    element("path", {
      d: areaPath,
      fill: "url(#blueGradient)"
    });

    element("path", {
      d: linePath,
      fill: "none",
      stroke: "#2d7bce",
      "stroke-width": 2.5,
      "stroke-linejoin": "round",
      "stroke-linecap": "round"
    });

    points.forEach(([x, y], index) => {
      element("circle", {
        cx: x,
        cy: y,
        r: 4.2,
        fill: "#2866bf",
        stroke: "#fff",
        "stroke-width": 1.7
      });

      element(
        "text",
        {
          x,
          y: 153,
          "text-anchor": "middle"
        },
        `D${index + 1}`
      );
    });
  }

  // ============================================================
  // 7. HEALTH OVERVIEW AND SAVED RECORDS
  // ============================================================

  function renderOverview() {
    const tracked = new Set(
      records.map((record) => record.part)
    );

    $("coveragePercent").textContent =
      `${Math.round((tracked.size / 6) * 100)}%`;

    const list = $("coverageList");
    list.replaceChildren();

    systemOrder.slice(0, 5).forEach((systemId) => {
      const row = document.createElement("div");
      const title = document.createElement("span");
      const meter = document.createElement("span");
      const fill = document.createElement("i");

      row.className = "readiness-line";
      title.textContent = configs[systemId].label;
      meter.className = "meter";

      fill.style.width = tracked.has(systemId)
        ? "100%"
        : "16%";

      fill.style.background = tracked.has(systemId)
        ? "#2fa990"
        : "#cbd6e3";

      meter.appendChild(fill);
      row.append(title, meter);

      list.appendChild(row);
    });

    const recent = $("recentRecords");

    recent.replaceChildren();

    if (!records.length) {
      const empty = document.createElement("p");

      empty.className = "empty";

      empty.textContent =
        "No records yet. Select a body region and save a measurement.";

      recent.appendChild(empty);
    }

    records.slice(0, 4).forEach((record) => {
      const row = document.createElement("div");
      const left = document.createElement("div");
      const title = document.createElement("strong");
      const time = document.createElement("small");
      const value = document.createElement("span");

      const firstField =
        fieldsFor(record.part)[0];

      row.className = "record";

      title.textContent =
        configs[record.part].title;

      time.textContent =
        new Date(record.time).toLocaleString();

      value.textContent =
        `${record.values[firstField.key]} ${firstField.unit}`;

      left.append(title, time);
      row.append(left, value);

      recent.appendChild(row);
    });
  }

  // ============================================================
  // 8. NOTIFICATIONS AND MODAL DIALOGS
  // ============================================================

  function showToast(message) {
    const toast = document.createElement("div");

    toast.className = "toast";
    toast.textContent = message;

    $("toasts").appendChild(toast);

    setTimeout(() => toast.remove(), 3100);
  }

  function openModal(title, content) {
    $("modalTitle").textContent = title;
    $("modalBody").replaceChildren(content);

    $("modalBackdrop").classList.add("show");

    $("modalBackdrop").setAttribute(
      "aria-hidden",
      "false"
    );

    $("modalClose").focus();
  }

  function closeModal() {
    const modal = document.getElementById("modalBackdrop");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  // ============================================================
  // 9. RADIATION EXPOSURE SIMULATION
  // ============================================================

  function showRadiationSimulation() {
    const content = document.createElement("div");

    content.innerHTML = `
      <p>
        Explore a basic mathematical estimate of
        <b>accumulated radiation dose</b>.
        Numbers are illustrative only;
        this is not a health-risk prediction.
      </p>

      <div class="slider-row">
        <label>
          Mission duration:
          <b id="daysOutput">14</b> days
        </label>

        <input
          id="daysSlider"
          type="range"
          min="1"
          max="365"
          value="14"
        >
      </div>

      <div class="slider-row">
        <label>
          Assumed dose rate:
          <b id="rateOutput">0.30</b> mSv/day
        </label>

        <input
          id="rateSlider"
          type="range"
          min="0.01"
          max="2"
          step="0.01"
          value="0.30"
        >
      </div>

      <div class="sim-result">
        <small>Illustrative accumulated dose</small>

        <strong id="simOutput">
          4.20 mSv
        </strong>

        <small>
          Dose = constant dose rate × duration
        </small>
      </div>

      <p class="flag">
        This calculation does not estimate biological damage,
        disease risk or emergency thresholds.
        Space radiation type, shielding, organ dose
        and changing conditions matter.
      </p>
    `;

    openModal(
      "What-if · Radiation exposure",
      content
    );

    const days = content.querySelector("#daysSlider");
    const rate = content.querySelector("#rateSlider");

    function update() {
      content.querySelector("#daysOutput").textContent =
        days.value;

      content.querySelector("#rateOutput").textContent =
        Number(rate.value).toFixed(2);

      const accumulatedDose =
        Number(days.value) * Number(rate.value);

      content.querySelector("#simOutput").textContent =
        `${accumulatedDose.toFixed(2)} mSv`;
    }

    days.addEventListener("input", update);
    rate.addEventListener("input", update);
  }

  // ============================================================
  // 10. REPORTS AND CSV EXPORT
  // ============================================================

  function showReports() {
    const content = document.createElement("div");
    const explanation = document.createElement("p");
    const list = document.createElement("div");

    explanation.textContent =
      "Manually entered measurements saved in this browser. " +
      "No cloud upload or clinical interpretation.";

    list.className = "report-list";

    content.appendChild(explanation);

    if (!records.length) {
      const empty = document.createElement("p");

      empty.textContent = "No records saved yet.";

      list.appendChild(empty);
    }

    records.slice(0, 25).forEach((record) => {
      const row = document.createElement("p");

      const values = fieldsFor(record.part)
        .map(
          (field) =>
            `${field.label}: ${record.values[field.key]} ${field.unit}`
        )
        .join(" · ");

      row.textContent =
        `${new Date(record.time).toLocaleString()} — ` +
        `${configs[record.part].title} — ${values}`;

      list.appendChild(row);
    });

    content.appendChild(list);

    const exportButton =
      document.createElement("button");

    exportButton.className = "btn btn-primary";
    exportButton.style.marginTop = "16px";
    exportButton.textContent = "Export records as CSV";

    exportButton.addEventListener(
      "click",
      exportCsv
    );

    content.appendChild(exportButton);

    openModal(
      "Local measurement records",
      content
    );
  }

  function exportCsv() {
    if (!records.length) {
      showToast("Save a measurement first");
      return;
    }

    const headings = [
      "Timestamp",
      "Body system",
      "Measurement",
      "Value",
      "Unit",
      "Source"
    ];

    const rows = [
      headings,

      ...records.flatMap((record) =>
        fieldsFor(record.part)
          .filter(
            (field) =>
              record.values[field.key] !== undefined
          )
          .map((field) => [
            record.time,
            configs[record.part].title,
            field.label,
            record.values[field.key],
            field.unit,
            record.source || "manual"
          ])
      )
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(
      [csv],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "AstroTwin_Measurements.csv";

    document.body.appendChild(link);

    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);

    showToast("CSV export created");
  }

  // ============================================================
  // 11. APPLICATION SETTINGS
  // ============================================================

  function showSettings() {
    const content = document.createElement("div");

    content.innerHTML = `
      <p>
        This demo stores manually entered measurements
        only in your browser (localStorage).
        Data is never sent to a server.
      </p>

      <p>
        Clear all stored records to reset the prototype.
      </p>
    `;

    const clearButton =
      document.createElement("button");

    clearButton.className = "btn btn-soft";
    clearButton.textContent = "Clear saved records";

    clearButton.addEventListener("click", () => {
      if (
        !confirm(
          "Delete all locally saved AstroTwin records?"
        )
      ) {
        return;
      }

      records = [];

      persistRecords();
      selectSystem(selectedSystem);
      renderOverview();
      closeModal();

      showToast("Local records cleared");
    });

    content.appendChild(clearButton);

    const store = window.AstroMedStore && window.AstroMedStore.store;

    if (store) {
      const dataBox = document.createElement("div");
      dataBox.style.marginTop = "16px";
      dataBox.innerHTML = "<p>Back up your data to one file, or restore it on another device. Restoring replaces the data saved in this browser.</p>";

      const exportButton = document.createElement("button");
      exportButton.className = "btn btn-soft";
      exportButton.textContent = "Export my data";
      exportButton.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(store.exportAll(), null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "astromed-data-" + new Date().toISOString().slice(0, 10) + ".json";
        link.click();
        URL.revokeObjectURL(link.href);
        showToast("Data exported");
      });

      const importInput = document.createElement("input");
      importInput.type = "file";
      importInput.accept = "application/json,.json";
      importInput.hidden = true;
      importInput.addEventListener("change", async () => {
        const file = importInput.files[0];
        importInput.value = "";
        if (!file) return;
        try {
          if (!confirm("Replace all data saved in this browser with the file?")) return;
          const count = store.importAll(await file.text());
          showToast("Imported " + count + " items. Reloading...");
          setTimeout(() => location.reload(), 800);
        } catch (error) {
          alert(error.message);
        }
      });

      const importButton = document.createElement("button");
      importButton.className = "btn btn-soft";
      importButton.style.marginLeft = "8px";
      importButton.textContent = "Import data";
      importButton.addEventListener("click", () => importInput.click());

      dataBox.append(exportButton, importButton, importInput);
      content.appendChild(dataBox);
    }

    openModal(
      "Prototype settings",
      content
    );
  }

  // ============================================================
  // 12. NAVIGATION AND APPLICATION INITIALIZATION
  // ============================================================

  function bindNavigation() {
    document
      .querySelectorAll(".nav button[data-action]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          document
            .querySelectorAll(".nav button")
            .forEach((item) => {
              item.classList.remove("active");
            });

          button.classList.add("active");

          switch (button.dataset.action) {
            case "overview":
              document.getElementById("exercisePage").hidden = true;
              document.getElementById("checkupPage").hidden = false;

              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
              break;

            case "twin":
              document.getElementById("checkupPage").hidden = true;
              document.getElementById("exercisePage").hidden = false;

              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
              break;

            case "simulation":
              showRadiationSimulation();
              break;

            case "reports":
              showReports();
              break;

            case "settings":
              showSettings();
              break;
          }
        });
      });
  }

  function initialize() {
    // Restore locally saved measurements.
    loadRecords();

    // Astronaut controls and sidebar navigation.
    bindAstronautEvents();
    bindNavigation();

    // Health measurement buttons.
    $("saveData").addEventListener(
      "click",
      saveMeasurement
    );

    $("sampleData").addEventListener(
      "click",
      loadDemoValues
    );

    // Simulation and reports.
    $("runSim").addEventListener(
      "click",
      showRadiationSimulation
    );

    $("viewReport").addEventListener(
      "click",
      showReports
    );

    $("allRecords").addEventListener(
      "click",
      showReports
    );

    $("exportCsv").addEventListener(
      "click",
      exportCsv
    );

    // Modal close button.
    $("modalClose").addEventListener(
      "click",
      closeModal
    );

    $("modalBackdrop").addEventListener(
      "click",
      (event) => {
        if (event.target === $("modalBackdrop")) {
          closeModal();
        }
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          closeModal();
        }
      }
    );

    // Default system is cardiovascular.
    // The spacesuit starts closed.
    selectSystem("heart", false);

    // Load the saved measurement overview.
    renderOverview();
  }

  initialize();

})();

  