
/* =============================================
   ASTROTWIN — INTERACTIVE EXERCISE CARDS
   ARED · T2 · CEVIS
============================================= */

document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(
      "#exercisePage .exercise-option"
    );
  
    const status = document.getElementById(
      "exerciseSaveStatus"
    );
  
    const storageKey = "astrotwin-exercise-sessions";
  
    /* =============================================
       EXERCISE CONFIGURATION
    ============================================= */
  
    const exercises = {
  
      ared: {
        title: "ARED",
        subtitle: "Resistance Training",
  
        fields: [
          ["Movement", "movement", "select", true],
          ["Duration (min)", "minutes", "number", true, 1, 300],
          ["Sets", "sets", "number", false, 1, 100],
          ["Repetitions", "reps", "number", false, 1, 200],
          ["Resistance (kg)", "load", "number", false, 0, 500],
          ["Effort (0–10)", "effort", "number", false, 0, 10]
        ]
      },
  
      t2: {
        title: "T2",
        subtitle: "Treadmill Running",
  
        fields: [
          ["Duration (min)", "minutes", "number", true, 1, 300],
          ["Distance (km)", "distance", "number", false, 0, 100],
          ["Speed (km/h)", "speed", "number", false, 0, 40],
          ["Heart Rate (bpm)", "heartRate", "number", false, 1, 250],
          ["Effort (0–10)", "effort", "number", false, 0, 10],
          ["Soreness (0–10)", "soreness", "number", false, 0, 10]
        ]
      },
  
      cevis: {
        title: "CEVIS",
        subtitle: "Cycling Training",
  
        fields: [
          ["Duration (min)", "minutes", "number", true, 1, 300],
          ["Cadence (RPM)", "cadence", "number", false, 0, 250],
          ["Power (W)", "power", "number", false, 0, 1500],
          ["Heart Rate (bpm)", "heartRate", "number", false, 1, 250],
          ["Effort (0–10)", "effort", "number", false, 0, 10]
        ]
      }
    };
  
    /* =============================================
       ACTIVE CARD
    ============================================= */
  
    let active = null;
  
    /* =============================================
       RESTORE ORIGINAL IMAGE CARD
    ============================================= */
  
    function restoreCard() {
  
      if (!active) return;
  
      active.editor.replaceWith(active.card);
  
      active = null;
    }
  
    /* =============================================
       CREATE INPUT FIELD
    ============================================= */
  
    function createField(field) {
  
      const [
        labelText,
        key,
        type,
        required,
        min,
        max
      ] = field;
  
      const label = document.createElement("label");
      label.textContent = labelText;
  
      let input;
  
      /* ARED MOVEMENT DROPDOWN */
  
      if (type === "select") {
  
        input = document.createElement("select");
  
        const movements = [
          "Squat",
          "Deadlift",
          "Heel Raise",
          "Bench Press",
          "Shoulder Press",
          "Bent-over Row"
        ];
  
        const placeholder = document.createElement("option");
  
        placeholder.value = "";
        placeholder.textContent = "Select a movement";
        placeholder.disabled = true;
        placeholder.selected = true;
  
        input.appendChild(placeholder);
  
        movements.forEach(movement => {
  
          const option = document.createElement("option");
  
          option.value = movement;
          option.textContent = movement;
  
          input.appendChild(option);
  
        });
  
      } else {
  
        /* NORMAL INPUT FIELDS */
  
        input = document.createElement("input");
  
        input.type = type;
  
        if (min !== undefined) {
          input.min = min;
        }
  
        if (max !== undefined) {
          input.max = max;
        }
  
        if (type === "number") {
          input.step = "any";
        }
  
        if (type === "text") {
          input.maxLength = 80;
        }
      }
  
      input.name = key;
      input.required = Boolean(required);
  
      label.appendChild(input);
  
      return label;
    }
  
    /* =============================================
       OPEN FORM INSIDE SELECTED CARD
    ============================================= */
  
    function openCard(card) {
  
      /* Close a previously opened form */
  
      restoreCard();
  
      const type = card.dataset.exercise;
      const exercise = exercises[type];
  
      if (!exercise) return;
  
      if (status) {
        status.textContent = "";
      }
  
      /* Create editor card */
  
      const editor = document.createElement("article");
      editor.className = "exercise-inline-editor";
  
      /* Editor header */
  
      const header = document.createElement("div");
      header.className = "exercise-inline-header";
  
      const heading = document.createElement("div");
  
      const title = document.createElement("h3");
      title.textContent = exercise.title;
  
      const subtitle = document.createElement("p");
      subtitle.textContent = exercise.subtitle;
  
      heading.append(title, subtitle);
  
      /* Close button */
  
      const close = document.createElement("button");
  
      close.type = "button";
      close.className = "exercise-inline-close";
      close.textContent = "×";
  
      close.setAttribute(
        "aria-label",
        "Close training form"
      );
  
      close.addEventListener("click", restoreCard);
  
      header.append(heading, close);
  
      /* Create form */
  
      const form = document.createElement("form");
      form.className = "exercise-inline-form";
  
      const fields = document.createElement("div");
      fields.className = "exercise-inline-fields";
  
      exercise.fields.forEach(field => {
  
        const fieldElement = createField(field);
  
        fields.appendChild(fieldElement);
  
      });
  
      /* Save button */
  
      const save = document.createElement("button");
  
      save.type = "submit";
      save.className = "exercise-inline-save";
      save.textContent = "Save Session";
  
      /* =========================================
         IMPORTANT: ASSEMBLE THE FORM
      ========================================= */
  
      form.append(fields, save);
  
      editor.append(header, form);
  
      /* =========================================
         REPLACE THE IMAGE WITH THE FORM
      ========================================= */
  
      card.replaceWith(editor);
  
      active = {
        card,
        editor
      };
  
      /* =========================================
         SAVE TRAINING SESSION
      ========================================= */
  
      form.addEventListener("submit", event => {
  
        event.preventDefault();
  
        if (!form.reportValidity()) {
          return;
        }
  
        const values = {};
  
        /* Read inputs AND dropdowns */
  
        form.querySelectorAll("input, select")
          .forEach(input => {
  
            const rawValue = input.value.trim();
  
            if (rawValue === "") {
              values[input.name] = null;
  
            } else if (input.type === "number") {
              values[input.name] = Number(rawValue);
  
            } else {
              values[input.name] = rawValue;
            }
  
          });
  
        /* Create a session record */
  
        const session = {
          type: type,
          title: exercise.title,
          values: values,
          date: new Date().toISOString()
        };
  
        /* Save in localStorage */
  
        try {
  
          const saved = window.AstroMedStore.store.get(storageKey, []);
  
          const sessions = Array.isArray(saved)
            ? saved
            : [];
  
          sessions.unshift(session);
  
          if (!window.AstroMedStore.store.set(storageKey, sessions.slice(0, 500))) throw new Error("Could not save to browser storage");
  
        } catch (error) {
  
          console.error(
            "Error saving training session:",
            error
          );
  
          alert(
            "Unable to save the training session."
          );
  
          return;
        }
  
        /* =========================================
           RESTORE ORIGINAL IMAGE AFTER SAVING
        ========================================= */
  
        restoreCard();
  
        /* Show confirmation */
  
        if (status) {
  
          status.textContent =
            `${exercise.title} session saved successfully ✓`;
  
        }
  
      });
  
    }
  
    /* =============================================
       CLICK EVENTS FOR ARED, T2 AND CEVIS
    ============================================= */
  
    cards.forEach(card => {
  
      card.addEventListener("click", () => {
  
        openCard(card);
  
      });
  
    });
  
  });
  