import "../../styles/astronaut3d.css";
import { PARTS, VIEWS } from "./layout.js";
import { createStage } from "./stage.js";

let stage = null;

// Draws the astronaut inside `element`. onSelect(part) runs when the astronaut clicks a part on the model.
// Returns false when WebGL is not available, so the caller can leave the space to the cards.
export function mount(element, { onSelect } = {}) {
  unmount();
  if (!element) return false;
  stage = createStage(element, { onSelect });
  return Boolean(stage);
}

export function unmount() {
  if (stage) stage.destroy();
  stage = null;
}

// Frames one of PARTS (opening the suit), or the whole body when part is null.
export function focus(part) {
  if (stage) stage.focus(part);
}

// Turns the view to "front", "side" or "back".
export function turn(view) {
  if (stage && view in VIEWS) stage.turn(VIEWS[view]);
}

export { PARTS };
