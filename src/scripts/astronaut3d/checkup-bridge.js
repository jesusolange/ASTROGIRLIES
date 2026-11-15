import { effect } from "@preact/signals";
import { currentStep, select } from "../checkup-flow.js";
import { focus, mount } from "./index.js";

const TO_PART = { hand: "body" };
const TO_STEP = { body: "hand" };

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#checkupPage .figure-scene");
  if (!container) return;
  const shown = mount(container, { onSelect: (part) => select(TO_STEP[part] || part) });
  if (!shown) return;
  const flat = document.getElementById("figureWrap");
  if (flat) flat.style.display = "none";
  let first = true;
  effect(() => {
    const step = currentStep.value;
    if (first) {
      first = false;
      return;
    }
    focus(step ? TO_PART[step] || step : null);
  });
});
