import { Color, Vector3 } from "three";
import { applyOpacity, createBody } from "./body.js";
import { bindControls } from "./controls.js";
import { createGuide } from "./guide.js";
import { PART_ORDER } from "./layout.js";
import { loadModels } from "./models.js";
import { createPicking } from "./picking.js";
import { createScene } from "./scene.js";

const RECORDS_KEY = "astrotwin-gui-v2-records";
const RESTART_KEY = "astromed-3d-restart";
const START = Date.now();

const NONE = new Color(0);
const ACTIVE = new Color(0xff2d3f);
const DONE = new Color(0x2fe08a);

const smoothstep = (value) => {
  const t = Math.min(Math.max(value, 0), 1);
  return t * t * (3 - 2 * t);
};

function appStore() {
  return window.AstroMedStore && window.AstroMedStore.store;
}

function readRecords() {
  try {
    const records = appStore() ? appStore().get(RECORDS_KEY, []) : [];
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function readRestart() {
  try {
    return Number(appStore() ? appStore().get(RESTART_KEY, 0) : 0) || 0;
  } catch {
    return 0;
  }
}

function writeRestart() {
  try {
    if (appStore()) appStore().set(RESTART_KEY, Date.now());
  } catch {
    /* storage unavailable */
  }
}

export function createStage(container, { onSelect } = {}) {
  const view = createScene(container);
  if (!view) return null;

  const { renderer, scene, camera, canvas, root, floor } = view;
  const figureWrap = document.getElementById("figureWrap");
  const suitButton = document.getElementById("suitButton");
  const modeText = document.getElementById("modeText");
  if (figureWrap) figureWrap.style.display = "none";
  if (suitButton) suitButton.style.display = "none";
  if (modeText) modeText.textContent = "3D checkup \u00b7 follow the glowing parts";

  const body = createBody(root);
  body.suitGroup.visible = true;
  body.bodyGroup.visible = false;

  const state = {
    mode: "intro",
    done: new Set(),
    selected: null,
    status: "",
    statusTimer: 0,
    dragAngle: 0,
    spin: 0,
    spinStartY: 0,
    dragging: false,
    moved: false,
    pointerStartX: 0,
    lastX: 0,
  };

  const reducedMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spinDuration = reducedMotion ? 0.4 : 1.8;

  const cameraPosition = new Vector3(0, 2.1, 7.8);
  const cameraGoal = new Vector3(0, 2.1, 7.8);
  const lookAt = new Vector3(0, 1.95, 0);
  const lookGoal = new Vector3(0, 1.95, 0);

  const guide = createGuide(container, {
    parts: PART_ORDER,
    onPick: (id) => selectPart(id, true),
    onRestart: reset,
    onOverview: () => document.querySelector('.nav button[data-action="doctor"]')?.click(),
  });

  const picking = createPicking(
    canvas,
    camera,
    () => body.pickTargets,
    (part) => {
      if (part === "muscles" && body.muscleGroup) return body.muscleGroup.visible;
      if (part === "bones" && body.boneGroup) return body.boneGroup.visible;
      return true;
    },
  );

  loadModels(body, {
    onCredit: (credits) => {
      let node = document.querySelector(".a3d-credit");
      if (!node) {
        node = document.createElement("span");
        node.className = "a3d-credit";
        document.querySelector(".footer")?.appendChild(node);
      }
      node.textContent = `3D models: ${credits.join(", ")} (Sketchfab, CC BY)`;
    },
  });

  function firstUndone() {
    const part = PART_ORDER.find((item) => !state.done.has(item.id));
    return part ? part.id : null;
  }

  function currentPart() {
    return state.selected || firstUndone();
  }

  function flashStatus(message) {
    state.status = message;
    clearTimeout(state.statusTimer);
    state.statusTimer = setTimeout(() => {
      state.status = "";
      renderGuide();
    }, 1600);
  }

  function renderGuide() {
    const undone = firstUndone();
    guide.render({
      mode: state.mode,
      active: undone === null ? null : (state.selected || undone),
      done: state.done,
      status: state.status,
    });
  }

  function updateCameraGoal() {
    if (state.mode !== "body" || !state.selected) {
      lookGoal.set(0, 1.95, 0);
      cameraGoal.set(0, 2.1, 7.8);
      return;
    }
    const part = body.parts[state.selected];
    lookGoal.set(0, part.focusHeight, 0);
    cameraGoal.set(0, part.focusHeight + 0.15, part.zoom);
  }

  function setSuitOpacity(value) {
    body.suitOpacity = value;
    applyOpacity(body.suitMaterials, value);
  }

  function setBodyOpacity(value) {
    body.bodyOpacity = value;
    applyOpacity(body.bodyMaterials, value);
  }

  function selectPart(part, user = false) {
    if (!body.parts[part]) return;
    if (state.mode !== "body") {
      state.mode = "body";
      state.spin = 0;
      setSuitOpacity(0);
      setBodyOpacity(1);
      body.suitGroup.visible = false;
      body.bodyGroup.visible = true;
      root.rotation.y = 0;
      root.position.y = 0;
    }
    state.selected = part;
    document.querySelector(`.hotspot[data-part="${part}"]`)?.click();
    renderGuide();
    updateCameraGoal();
    if (user && onSelect) onSelect(part);
  }

  function markDone(part) {
    if (!body.parts[part]) return;
    state.done.add(part);
    body.parts[part].pop = 1;
    flashStatus(`${body.parts[part].label} saved \u2713`);
    renderGuide();
  }

  function reset() {
    writeRestart();
    clearTimeout(state.statusTimer);
    state.done = new Set();
    state.selected = null;
    state.status = "";
    state.mode = "intro";
    state.spin = 0;
    state.dragAngle = 0;
    setSuitOpacity(1);
    setBodyOpacity(0);
    body.suitGroup.visible = true;
    body.bodyGroup.visible = false;
    body.screen.visible = true;
    root.rotation.y = 0;
    root.position.y = 0;
    PART_ORDER.forEach((part) => {
      body.parts[part.id].pop = 0;
    });
    renderGuide();
    updateCameraGoal();
  }

  function refreshDone() {
    const restart = Math.max(readRestart(), START);
    const today = new Date().toDateString();
    const done = new Set();
    readRecords().forEach((record) => {
      if (!record || !body.parts[record.part]) return;
      const when = new Date(record.time);
      if (when.getTime() > restart && when.toDateString() === today) done.add(record.part);
    });
    const added = [...done].find((id) => !state.done.has(id)) || null;
    state.done = done;
    if (added && state.selected === added) state.selected = null;
    return added;
  }

  function startSpin() {
    if (state.mode !== "intro") return;
    state.mode = "spin";
    state.spin = 0;
    state.spinStartY = root.rotation.y;
    body.bodyGroup.visible = true;
    refreshDone();
    renderGuide();
  }

  function finishSpin() {
    state.mode = "body";
    setSuitOpacity(0);
    setBodyOpacity(1);
    body.suitGroup.visible = false;
    body.bodyGroup.visible = true;
    root.rotation.y = 0;
    root.position.y = 0;
    state.dragAngle = 0;
    renderGuide();
    updateCameraGoal();
  }

  function updateGlow(time, delta) {
    const active = currentPart();
    const wave = 0.5 + 0.5 * Math.sin(time * 4.5);
    Object.values(body.parts).forEach((part) => {
      let color = NONE;
      let intensity = 0;
      let haloOpacity = 0;
      if (state.mode === "body") {
        if (state.done.has(part.id)) {
          color = DONE;
          intensity = 0.55;
          haloOpacity = 0.5;
        } else if (part.id === active) {
          color = ACTIVE;
          intensity = 0.35 + 0.65 * wave;
          haloOpacity = 0.5 + 0.45 * wave;
        }
      }
      part.pop = Math.max(0, part.pop - delta * 1.4);
      part.meshes.forEach((mesh) => {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          if (!material || !material.emissive) return;
          material.emissive.copy(color);
          const weight = part.id === "bones" ? 0.3 : part.id === "muscles" ? 0.18 : 1;
          material.emissiveIntensity = intensity * weight;
        });
      });
      part.halos.forEach((sprite) => {
        sprite.material.color.copy(color === NONE ? ACTIVE : color);
        sprite.material.opacity = haloOpacity;
        const scale = 1 + 0.5 * part.pop + (part.id === active ? 0.08 * wave : 0);
        sprite.scale.set(sprite.userData.base * scale, sprite.userData.base * scale, 1);
      });
    });
  }

  function updateVisibility() {
    const active = currentPart();
    const musclesVisible = state.mode === "body" && active === "muscles";
    if (body.muscleGroup) body.muscleGroup.visible = musclesVisible;
    if (body.boneGroup) body.boneGroup.visible = !musclesVisible;
    ["brain", "lungs", "heart", "kidneys", "hand"].forEach((id) => {
      body.parts[id].meshes.forEach((mesh) => {
        mesh.visible = !musclesVisible;
      });
      body.parts[id].halos.forEach((sprite) => {
        sprite.visible = !musclesVisible;
      });
    });
  }

  let previous = performance.now();
  let elapsed = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    const delta = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    elapsed += delta;

    if (state.mode === "intro" && !reducedMotion) {
      root.position.y = Math.sin(elapsed * 1.2) * 0.05;
      root.rotation.y = Math.sin(elapsed * 0.5) * 0.18;
      body.screen.scale.setScalar(1 + 0.015 * Math.sin(elapsed * 3));
    } else if (state.mode === "spin") {
      state.spin += delta;
      const progress = Math.min(state.spin / spinDuration, 1);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      root.rotation.y = state.spinStartY + eased * (Math.PI * 2 - state.spinStartY);
      root.position.y *= 0.9;
      setSuitOpacity(1 - smoothstep((progress - 0.4) / 0.3));
      setBodyOpacity(smoothstep((progress - 0.45) / 0.35));
      if (progress >= 1) finishSpin();
    } else {
      root.rotation.y = state.dragAngle + (state.dragging || reducedMotion ? 0 : Math.sin(elapsed * 0.6) * 0.1);
    }

    if (state.mode === "body") {
      const pulse = Math.pow(Math.max(0, Math.sin(elapsed * 6)), 6);
      body.heartGroup.scale.setScalar(1 + 0.07 * pulse);
    }

    updateVisibility();
    updateGlow(elapsed, delta);
    floor.material.opacity = 0.4 + 0.15 * Math.sin(elapsed * 2);

    const ease = 1 - Math.exp(-delta * 3);
    cameraPosition.lerp(cameraGoal, ease);
    lookAt.lerp(lookGoal, ease);
    camera.position.copy(cameraPosition);
    camera.lookAt(lookAt);
    renderer.render(scene, camera);
  }

  bindControls(canvas, { state, picking, startSpin, selectPart });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#saveData")) return;
    setTimeout(() => {
      const added = refreshDone();
      if (added) flashStatus(`${body.parts[added].label} saved \u2713`);
      renderGuide();
    }, 60);
  });

  refreshDone();
  renderGuide();
  updateCameraGoal();
  cameraPosition.copy(cameraGoal);
  lookAt.copy(lookGoal);
  requestAnimationFrame(frame);

  return {
    select: (part) => selectPart(part, false),
    markDone,
    reset,
    parts: () => PART_ORDER.map((part) => part.id),
  };
}
