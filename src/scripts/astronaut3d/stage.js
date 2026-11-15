import { Box3, Vector3 } from "three";
import { bindControls } from "./controls.js";
import { BODY, HEAD, VIEWS, frameDistance, orbitPosition, partInfo } from "./layout.js";
import { setGlow, setOpacity, setTint, tokenColor } from "./materials.js";
import { loadModels } from "./models.js";
import { createPicking } from "./picking.js";
import { FOV, createScene } from "./scene.js";

const GLOW = { bones: 0.12, muscles: 0.12 };
const ORGAN_GLOW = 0.15;
const FILL = { model: 0.4, body: 0.85, head: 0.55 };
const BONES_FADED = 0.3;
const LIFT = 0.12;

const box = (center, size) => new Box3().setFromCenterAndSize(new Vector3(...center), new Vector3(...size));
const WHOLE_BODY = box([0, BODY.floor + BODY.height / 2, 0], [1.2, BODY.height, 0.7]);

export function createStage(element, { onSelect } = {}) {
  const view = createScene(element);
  if (!view) return null;
  const { renderer, scene, camera, canvas, root } = view;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const parts = {};
  let suit = null;

  const state = { open: false, suitFade: 1, selected: null, azimuth: VIEWS.front };
  const goal = { target: new Vector3(), distance: 10 };
  const now = { target: new Vector3(), distance: 10, azimuth: VIEWS.front };

  function boundsFor(id) {
    const info = partInfo(id);
    if (!info || info.frame === "body") return parts.bones ? new Box3().setFromObject(parts.bones) : WHOLE_BODY;
    if (info.frame === "head") return box(HEAD.center, HEAD.size);
    return parts[id] ? new Box3().setFromObject(parts[id]) : WHOLE_BODY;
  }

  function updateGoal() {
    const bounds = boundsFor(state.selected);
    const fill = FILL[partInfo(state.selected)?.frame || "body"];
    bounds.getCenter(goal.target);
    goal.distance = frameDistance(bounds.getSize(new Vector3()).toArray(), FOV, camera.aspect || 1, fill);
  }

  function applyLook() {
    const accent = tokenColor(element, "--am-accent", "#4aa0ff");
    const faded = tokenColor(element, "--am-text-muted", "#8a94a8");
    Object.entries(parts).forEach(([id, group]) => {
      const muscles = state.selected === "muscles";
      if (id === "muscles") group.visible = state.open && muscles;
      else group.visible = state.open && !muscles;
      if (id === "bones") {
        const bones = state.selected === "bones";
        setOpacity(group, bones ? 1 : BONES_FADED);
        setTint(group, bones ? null : faded);
      }
      const glow = state.selected === id ? GLOW[id] || ORGAN_GLOW : 0;
      setGlow(group, accent, glow);
    });
  }

  function openSuit() {
    if (state.open) return;
    state.open = true;
    if (reducedMotion) state.suitFade = 0;
    applyLook();
  }

  function focus(id) {
    const part = id && partInfo(id) ? id : null;
    state.selected = part;
    if (part) openSuit();
    applyLook();
    updateGoal();
    if (reducedMotion) snap();
  }

  function snap() {
    now.target.copy(goal.target);
    now.distance = goal.distance;
    now.azimuth = state.azimuth;
  }

  function turn(azimuth) {
    state.azimuth = azimuth;
    if (reducedMotion) now.azimuth = azimuth;
  }

  const stopLoading = loadModels({
    onPart(id, group) {
      group.userData.part = id;
      parts[id] = group;
      root.add(group);
      applyLook();
      updateGoal();
      if (reducedMotion || id === "bones") snap();
    },
    onSuit(group) {
      suit = group;
      root.add(group);
      setOpacity(group, state.suitFade);
      group.visible = state.suitFade > 0;
    },
  });

  const picking = createPicking(canvas, camera, () => [
    ...(state.open ? Object.values(parts) : []),
    ...(suit && !state.open ? [suit] : []),
  ]);

  const unbind = bindControls(canvas, {
    picking,
    turnBy: (amount) => {
      state.azimuth += amount;
      now.azimuth = state.azimuth;
    },
    onClick: (part) => {
      if (!state.open) {
        openSuit();
        return;
      }
      if (!part || !partInfo(part)) return;
      focus(part);
      if (onSelect) onSelect(part);
    },
    onEnter: openSuit,
  });

  let previous = performance.now();
  let frameId = 0;
  let aspect = camera.aspect;

  function frame(time) {
    frameId = requestAnimationFrame(frame);
    const delta = Math.min((time - previous) / 1000, 0.05);
    previous = time;
    if (camera.aspect !== aspect) {
      aspect = camera.aspect;
      updateGoal();
      if (reducedMotion) snap();
    }

    if (suit) {
      const fadeGoal = state.open ? 0 : 1;
      state.suitFade = reducedMotion ? fadeGoal : state.suitFade + Math.sign(fadeGoal - state.suitFade)
        * Math.min(Math.abs(fadeGoal - state.suitFade), delta * 2.5);
      setOpacity(suit, state.suitFade);
      suit.visible = state.suitFade > 0;
    }

    if (!reducedMotion) {
      const ease = 1 - Math.exp(-delta * 4);
      now.target.lerp(goal.target, ease);
      now.distance += (goal.distance - now.distance) * ease;
      now.azimuth += (state.azimuth - now.azimuth) * ease;
    }
    const position = orbitPosition(now.target.toArray(), now.distance, now.azimuth, LIFT);
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(now.target);
    renderer.render(scene, camera);
  }

  updateGoal();
  snap();
  frameId = requestAnimationFrame(frame);

  return {
    focus,
    turn,
    open: openSuit,
    destroy() {
      cancelAnimationFrame(frameId);
      stopLoading();
      unbind();
      view.dispose();
    },
  };
}
