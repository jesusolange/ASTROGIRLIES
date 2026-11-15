import { effect } from "@preact/signals";
import { currentStep, select } from "../checkup-flow.js";
import { focus, mount, unmount } from "./index.js";

const TO_PART = { hand: "body" };
const TO_STEP = { body: "hand" };

// Mounts the 3D astronaut into the old checkup page while it is open and follows the checkup step.
// Returns the clean-up to run when the page closes.
export function attachCheckup3d(container) {
  if (!container) return () => {};
  const shown = mount(container, { onSelect: (part) => select(TO_STEP[part] || part) });
  if (!shown) return () => {};
  let first = true;
  const stop = effect(() => {
    const step = currentStep.value;
    if (first) {
      first = false;
      return;
    }
    focus(step ? TO_PART[step] || step : null);
  });
  return () => {
    stop();
    unmount();
  };
}
