
/* ==============================================
   ASTROTWIN — NUMBERED HEALTH INDICATORS
   Educational prototype — not medical triage
============================================== */

document.addEventListener("DOMContentLoaded", () => {

  const fieldsBox = document.getElementById("inputFields");
  const barsBox = document.getElementById("healthStatusBars");

  if (!fieldsBox || !barsBox) return;

  /* ==========================================
     MEASUREMENT SCALES

     Colored bands are illustrative.
     Personal measurements use neutral scales.
  ========================================== */

  const scales = {

    // HEART

    hr: {
      min: 30,
      max: 160,
      unit: "bpm",
      ticks: [30, 40, 60, 80, 100, 120, 160],
      zones: [
        { to: 60, level: "review" },
        { to: 101, level: "normal" },
        { to: Infinity, level: "review" }
      ]
    },

    sys: {
      min: 70,
      max: 200,
      unit: "mmHg",
      ticks: [70, 90, 120, 140, 180, 200],
      zones: [
        { to: 90, level: "review" },
        { to: 120, level: "normal" },
        { to: 181, level: "review" },
        { to: Infinity, level: "alert" }
      ]
    },

    dia: {
      min: 40,
      max: 140,
      unit: "mmHg",
      ticks: [40, 60, 80, 90, 120, 140],
      zones: [
        { to: 60, level: "review" },
        { to: 80, level: "normal" },
        { to: 121, level: "review" },
        { to: Infinity, level: "alert" }
      ]
    },

    hrv: {
      min: 0,
      max: 160,
      unit: "ms",
      ticks: [0, 40, 80, 120, 160],
      note: "Compare with personal baseline"
    },

    // LUNGS

    resp: {
      min: 8,
      max: 32,
      unit: "/min",
      ticks: [8, 10, 12, 18, 24, 30, 32],
      zones: [
        { to: 12, level: "review" },
        { to: 19, level: "normal" },
        { to: Infinity, level: "review" }
      ]
    },

    spo2: {
      min: 85,
      max: 100,
      unit: "%",
      ticks: [85, 90, 92, 95, 98, 100],
      zones: [
        { to: 92, level: "alert" },
        { to: 95, level: "review" },
        { to: Infinity, level: "normal" }
      ]
    },

    // BONES

    bmd: {
      min: 0,
      max: 2,
      unit: "g/cm²",
      ticks: [0, 0.5, 1, 1.5, 2],
      note: "DXA result: compare by site and baseline"
    },

    exercise: {
      min: 0,
      max: 180,
      unit: "min",
      ticks: [0, 30, 60, 90, 120, 180],
      note: "Compare with exercise plan"
    },

    // BRAIN AND SLEEP

    sleep: {
      min: 4,
      max: 12,
      unit: "h",
      ticks: [4, 5, 6, 7, 8, 9, 10, 12],
      note: "Compare with sleep history"
    },

    reaction: {
      min: 100,
      max: 700,
      unit: "ms",
      ticks: [100, 200, 300, 400, 500, 700],
      note: "Same test and personal baseline required"
    },

    mood: {
      min: 1,
      max: 10,
      unit: "/10",
      ticks: [1, 3, 5, 7, 10],
      note: "Self-report: monitor trend"
    },

    // HAND / WEARABLES

    pulse: {
      min: 30,
      max: 160,
      unit: "bpm",
      ticks: [30, 40, 60, 80, 100, 120, 160],
      zones: [
        { to: 60, level: "review" },
        { to: 101, level: "normal" },
        { to: Infinity, level: "review" }
      ]
    },

    bodyTemp: {
      min: 34,
      max: 41,
      unit: "°C",
      ticks: [34, 36, 37, 38, 39, 41],
      zones: [
        { to: 36, level: "review" },
        { to: 37.9, level: "normal" },
        { to: 38.6, level: "review" },
        { to: Infinity, level: "alert" }
      ],
      note: "Oral temperature, demo reference"
    },

    glucose: {
      min: 40,
      max: 300,
      unit: "mg/dL",
      ticks: [40, 54, 70, 100, 126, 180, 300],
      zones: [
        { to: 54, level: "alert" },
        { to: 70, level: "review" },
        { to: 100, level: "normal" },
        { to: 126, level: "review" },
        { to: 250, level: "review" },
        { to: Infinity, level: "alert" }
      ],
      note: "Fasting reference (8 h). Demo values, not a diagnosis"
    },

    skin: {
      min: 25,
      max: 40,
      unit: "°C",
      ticks: [25, 28, 31, 34, 37, 40],
      note: "Skin temperature is not core temperature"
    },

/* =========================================
   RENAL & URINARY HEALTH
   Numerical scales — personal monitoring
========================================= */

// Urine volume recorded during collection

urineOutput: {
  min: 0,
  max: 3000,
  unit: "mL",
  ticks: [0, 500, 1000, 1500, 2000, 2500, 3000],
  note: "Compare with collection period and baseline"
},

// Duration of urine collection

collectionHours: {
  min: 0,
  max: 24,
  unit: "h",
  ticks: [0, 6, 12, 18, 24],
  note: "Collection duration"
},

// Body weight used in renal calculations

weightKg: {
  min: 20,
  max: 200,
  unit: "kg",
  ticks: [20, 50, 80, 110, 140, 170, 200],
  note: "Recorded body weight"
},

// Fluid intake during the same period

fluidIntake: {
  min: 0,
  max: 4000,
  unit: "mL",
  ticks: [0, 1000, 2000, 3000, 4000],
  note: "Compare with hydration plan and baseline"
},



    // MUSCLES

    activity: {
      min: 0,
      max: 180,
      unit: "min",
      ticks: [0, 30, 60, 90, 120, 180],
      note: "Compare with activity plan"
    },

    strength: {
      min: 0,
      max: 150,
      unit: "kg",
      ticks: [0, 25, 50, 75, 100, 150],
      note: "Training load is not a strength diagnosis"
    }
  };

  /* ==========================================
     COLORS
  ========================================== */

  const colors = {
    normal: "#24a879",
    review: "#e9b44e",
    alert: "#df5656"
  };

  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  function position(value, scale) {
    return clamp(
      100 * (value - scale.min) /
      (scale.max - scale.min)
    );
  }

  /* ==========================================
     EVALUATE VALUE
  ========================================== */

  function levelFor(scale, value) {

    if (!scale.zones) return "neutral";

    const zone = scale.zones.find(
      zone => value < zone.to
    );

    return zone ? zone.level : "review";
  }

  /* ==========================================
     CREATE GRADIENT
  ========================================== */

  function gradientFor(scale) {

    if (!scale.zones) {
      return "linear-gradient(to right, #dce5ef, #8ea5c0)";
    }

    const zones = scale.zones;

    const stops = [
      `${colors[zones[0].level]} 0%`
    ];

    for (let i = 0; i < zones.length - 1; i++) {

      const point = position(zones[i].to, scale);

      stops.push(
        `${colors[zones[i].level]} ${Math.max(0, point - 1)}%`
      );

      stops.push(
        `${colors[zones[i + 1].level]} ${Math.min(100, point + 1)}%`
      );
    }

    stops.push(
      `${colors[zones[zones.length - 1].level]} 100%`
    );

    return `linear-gradient(to right, ${stops.join(", ")})`;
  }

  /* ==========================================
     TEXT HELPER
  ========================================== */

  function makeText(tag, className, content) {

    const element = document.createElement(tag);

    element.className = className;
    element.textContent = content;

    return element;
  }

  /* ==========================================
     RENDER INDICATORS
  ========================================== */

  function render() {

    barsBox.replaceChildren();

    const inputs = fieldsBox.querySelectorAll(
      'input[type="number"]'
    );

    inputs.forEach(input => {

      const scale = scales[input.name];

      const raw = input.value.trim();

      const parsed =
        raw === "" ? null : Number(raw);

      const valid =
        parsed !== null &&
        Number.isFinite(parsed) &&
        (input.min === "" || parsed >= Number(input.min)) &&
        (input.max === "" || parsed <= Number(input.max));

      const value = valid ? parsed : null;

      const level =
        value !== null && scale
          ? levelFor(scale, value)
          : "neutral";

      /* Main indicator */

      const item = document.createElement("div");

      item.className =
        `health-status-item health-indicator-${level}`;

      /* Metric name and result */

      const heading = document.createElement("div");
      heading.className = "health-status-row";

      const name =
        input.closest(".input-group")
          ?.querySelector("label")
          ?.textContent
          ?.trim() || input.name;

      let status;

      if (!valid) {
        status = raw === "" ? "No data" : "Check entry";

      } else if (!scale) {
        status = "No scale configured";

      } else if (!scale.zones) {
        status = scale.note;

      } else if (level === "normal") {
        status = "Within demo reference";

      } else if (level === "review") {
        status = "Review";

      } else {
        status = "Priority review";
      }

      heading.append(
        makeText("span", "health-status-name", name),
        makeText(
          "span",
          "health-status-value",
          `${raw || "—"} · ${status}`
        )
      );

      item.appendChild(heading);

      /* Numbered gradient scale */

      if (scale) {

        const axis = document.createElement("div");
        axis.className = "health-numbered-scale";

        const gradient = document.createElement("div");
        gradient.className = "health-numbered-gradient";

        gradient.style.background = gradientFor(scale);

        axis.appendChild(gradient);

        /* Current value marker */

        if (value !== null) {

          const marker = document.createElement("div");

          marker.className = "health-numbered-marker";

          marker.style.left =
            `${position(value, scale)}%`;

          marker.title =
            `${value} ${scale.unit}`;

          axis.appendChild(marker);
        }

        /* Numbers below the bar */

        scale.ticks.forEach((tick, index) => {

          const label = makeText(
            "span",
            "health-numbered-tick",
            String(tick)
          );

          label.style.left =
            `${position(tick, scale)}%`;

          if (index === 0) {
            label.style.transform = "none";
          }

          if (index === scale.ticks.length - 1) {
            label.style.transform = "translateX(-100%)";
          }

          axis.appendChild(label);
        });

        item.appendChild(axis);

        /* Out-of-range note */

        if (
          value !== null &&
          (value < scale.min || value > scale.max)
        ) {

          item.appendChild(
            makeText(
              "p",
              "health-scale-note",
              "Value outside displayed scale; marker shown at the nearest edge."
            )
          );
        }
      }

      barsBox.appendChild(item);
    });

    /* Prototype disclaimer */

    barsBox.appendChild(
      makeText(
        "p",
        "health-status-note",
        "Prototype reference bands only. Not a diagnosis or medical emergency decision. Interpret with symptoms, device limitations, and individual baseline."
      )
    );
  }

  /* ==========================================
     LIVE UPDATES
  ========================================== */

  fieldsBox.addEventListener("input", render);
  fieldsBox.addEventListener("change", render);

  document.getElementById("sampleData")
    ?.addEventListener("click", render);

  new MutationObserver(render).observe(
    fieldsBox,
    { childList: true }
  );

  render();

});

  