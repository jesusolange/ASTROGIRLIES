import "../../styles/astronaut3d.css";
import { PART_ORDER } from "./layout.js";
import { createStage } from "./stage.js";

const listeners = new Set();
let stage = null;

function emit(part) {
  listeners.forEach((listener) => {
    try {
      listener(part);
    } catch (error) {
      console.error(error);
    }
  });
}

const AstroMed3D = {
  select(part) {
    if (stage) stage.select(part);
  },
  markDone(part) {
    if (stage) stage.markDone(part);
  },
  reset() {
    if (stage) stage.reset();
  },
  onSelect(callback) {
    if (typeof callback !== "function") return () => {};
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  parts() {
    return PART_ORDER.map((part) => part.id);
  },
};

if (typeof window !== "undefined") window.AstroMed3D = AstroMed3D;

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#checkupPage .figure-scene");
  if (!container) return;
  stage = createStage(container, { onSelect: emit });
});

export { AstroMed3D };
