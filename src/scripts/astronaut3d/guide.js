export function createGuide(container, { parts, onPick, onRestart, onOverview }) {
  const panel = document.createElement("aside");
  panel.className = "a3d-guide";
  panel.setAttribute("aria-live", "polite");
  panel.innerHTML = `
    <h3></h3>
    <p></p>
    <ol class="a3d-list">
      ${parts.map((part) => `
        <li data-part="${part.id}"><button type="button" disabled>
          <span class="a3d-dot"></span>${part.label}<span class="a3d-check"></span>
        </button></li>`).join("")}
    </ol>
    <div class="a3d-actions" hidden></div>`;
  container.appendChild(panel);

  const title = panel.querySelector("h3");
  const text = panel.querySelector("p");
  const actions = panel.querySelector(".a3d-actions");
  const rows = [...panel.querySelectorAll(".a3d-list li")];
  const labels = new Map(parts.map((part) => [part.id, part.label]));
  const helper = document.querySelector("#checkupPage .figure-helper");

  rows.forEach((row) => {
    row.querySelector("button").addEventListener("click", () => onPick(row.dataset.part));
  });

  function render({ mode, active, done, status }) {
    const complete = mode === "complete";
    if (helper) {
      helper.textContent = complete
        ? "Checkup complete \u00b7 summary on the right"
        : mode === "body"
          ? "Click a glowing organ \u00b7 drag to rotate"
          : "Click the astronaut to begin \u00b7 drag to rotate";
    }

    panel.classList.toggle("is-complete", complete);
    actions.hidden = !complete;
    actions.replaceChildren();

    if (mode === "intro") {
      title.textContent = "Daily checkup";
      text.textContent = "Let\u2019s do a checkup! Click the astronaut to begin.";
    } else if (mode === "spin") {
      title.textContent = "Scanning\u2026";
      text.textContent = "Opening the 3D body scan.";
    } else if (complete) {
      title.textContent = "Checkup complete";
      text.textContent = "All 7 body systems are saved. The summary is on the right.";
      const overview = document.createElement("button");
      overview.type = "button";
      overview.textContent = "Open Today";
      overview.addEventListener("click", onOverview);
      const restart = document.createElement("button");
      restart.type = "button";
      restart.className = "soft";
      restart.textContent = "Start another checkup";
      restart.addEventListener("click", onRestart);
      actions.append(overview, restart);
    } else if (status) {
      title.textContent = status;
      text.textContent = active ? `Next up: the ${labels.get(active).toLowerCase()}.` : "";
    } else {
      const label = labels.get(active).toLowerCase();
      const step = parts.findIndex((part) => part.id === active) + 1;
      title.textContent = `Step ${step} of ${parts.length}`;
      if (active !== parts.find((part) => !done.has(part.id)).id) {
        text.textContent = `You\u2019re logging the ${label}. Enter your data, then press Save measurements.`;
      } else {
        text.textContent = `Click the glowing ${label} and log your data.`;
      }
    }

    rows.forEach((row) => {
      const id = row.dataset.part;
      row.classList.toggle("is-done", done.has(id));
      row.classList.toggle("is-active", mode === "body" && id === active);
      row.querySelector("button").disabled = mode !== "body";
      row.querySelector(".a3d-check").textContent = done.has(id) ? "\u2713" : "";
    });
  }

  return { panel, render };
}
