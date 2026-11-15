import { useEffect, useRef, useState } from "preact/hooks";
import { VIEW, EYE_LABEL, calibration, nearLinesFor, nearRowsLabel } from "../../scripts/vision.js";
import Steps from "../ui/Steps.jsx";
import Optotype from "./Optotype.jsx";

const FALLBACK_WIDTH = 640;

function chosenText(value, offered) {
  if (value === -1) return "You selected: could not read the largest line shown.";
  if (value === null) return "Choose one line below.";
  const line = offered.find((entry) => entry.index === value);
  return `You selected: ${line ? line.snellen : `line ${value + 1}`}.`;
}

export default function NearCard({ form, eye }) {
  const current = calibration();
  const other = eye === "left" ? "right" : "left";
  const root = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const update = () => setWidth(element.clientWidth);
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!current) {
    return (
      <div class="vision vs-near" ref={root}>
        <p class="vs-note" ref={form.fieldRef("calibration")} tabIndex={-1}>
          This device is not calibrated yet. Open the calibration card first so the lines are the right size.
          {form.errorFor("calibration") ? ` ${form.errorFor("calibration")}` : ""}
        </p>
      </div>
    );
  }

  const { offered, skipped } = nearLinesFor(current.ppmm, width || FALLBACK_WIDTH);
  const value = form.values.near;

  return (
    <div class="vision vs-near" ref={root}>
      <Steps
        ariaLabel={`Near chart steps for the ${EYE_LABEL[eye].toLowerCase()}`}
        items={[
          `Cover your ${other} eye and hold the screen ${VIEW.nearDistanceCm} cm away.`,
          "Read the openings of the tumbling E, not the letters. Do not lean closer.",
          "Pick the smallest line you can read correctly in full, then save."
        ]}
      />

      <div
        class="vs-chart"
        ref={form.fieldRef("near")}
        tabIndex={-1}
        role="group"
        aria-label={`Near chart for the ${EYE_LABEL[eye].toLowerCase()}`}
      >
        {offered.map((line) => {
          const pixels = Math.max(1.5, line.mm * current.ppmm);
          const on = value === line.index;
          return (
            <button
              key={line.snellen}
              type="button"
              class={`vs-line${on ? " on" : ""}`}
              aria-pressed={on}
              onClick={() => form.set("near", line.index)}
              style={{ "--vs-opt": `${pixels}px`, "--vs-gap": `${pixels}px` }}
            >
              <span class="vs-line-opts">
                {[0, 1, 2, 3, 4].map((k) => <Optotype key={k} rotation={((line.index + k) % 4) * 90} />)}
              </span>
              <span class="vs-line-lab">{line.snellen}<small>{line.mm.toFixed(2)} mm</small></span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        class={`vs-line vs-cannot${value === -1 ? " on" : ""}`}
        aria-pressed={value === -1}
        onClick={() => form.set("near", -1)}
      >
        <span class="vs-line-lab">I could not read the largest line shown</span>
      </button>

      <p class="vs-chosen" aria-live="polite">{chosenText(value, offered)}</p>
      <p class="vs-hint">{offered.length ? `Lines tested on this screen: ${nearRowsLabel(offered)}.` : "No line fits this screen at the calibrated size."}</p>
      {skipped.length ? (
        <p class="vs-note">The largest lines need more width than this screen has at the calibrated size, so they are not offered.</p>
      ) : null}
      {form.errorFor("near") ? <p class="vs-note">{form.errorFor("near")}</p> : null}
    </div>
  );
}
