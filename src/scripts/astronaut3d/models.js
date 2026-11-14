import { Box3, Group, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { applyOpacity, collectFadeMaterials } from "./body.js";
import { ASTRONAUT_PLACEMENT, MODEL_PLACEMENT } from "./layout.js";

function modelUrl(file) {
  return new URL(`assets/models/${file}`, document.baseURI).href;
}

function cloneMaterials(root) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.material = Array.isArray(node.material)
      ? node.material.map((material) => material.clone())
      : node.material.clone();
  });
}

function attachOrgan(body, id, config, scene, credits, onCredit) {
  scene.rotation.set(...(config.rot || [0, 0, 0]));
  const bounds = new Box3().setFromObject(scene);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const axisLength = config.axis === "y" ? size.y : config.axis === "z" ? size.z : size.x;
  const group = new Group();
  if (!config.keep) scene.position.sub(center);
  group.add(scene);
  group.scale.setScalar(config.keep ? 1 : config.size / (axisLength || 1));
  group.position.set(config.at[0], config.at[1], config.at[2]);

  const part = body.parts[id];
  const previous = part.meshes.slice();
  cloneMaterials(scene);
  scene.traverse((node) => {
    if (!node.isMesh) return;
    if (id === "bones") {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = 0.35;
        material.depthWrite = false;
      });
    }
    node.userData.part = id;
    part.meshes.push(node);
    body.pickTargets.push(node);
  });
  part.meshes = part.meshes.filter((mesh) => !previous.includes(mesh));
  previous.forEach((mesh) => {
    mesh.visible = false;
  });

  (config.inHeartGroup ? body.heartGroup : body.bodyGroup).add(group);
  if (id === "muscles") {
    body.muscleGroup = group;
    group.visible = false;
  }
  if (id === "bones") body.boneGroup = group;

  const materials = collectFadeMaterials(group);
  body.addBodyMaterials(materials);
  applyOpacity(materials, body.bodyOpacity);

  if (config.credit) {
    credits.add(config.credit);
    if (onCredit) onCredit([...credits]);
  }
}

function attachAstronaut(body, scene) {
  scene.rotation.set(0, 0, 0);
  const bounds = new Box3().setFromObject(scene);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const group = new Group();
  scene.position.set(-center.x, -bounds.min.y, -center.z);
  group.add(scene);
  group.scale.setScalar(ASTRONAUT_PLACEMENT.height / (size.y || 1));
  group.position.set(
    ASTRONAUT_PLACEMENT.at[0],
    ASTRONAUT_PLACEMENT.at[1],
    ASTRONAUT_PLACEMENT.at[2],
  );
  cloneMaterials(scene);

  body.suitGroup.children.slice().forEach((child) => {
    if (child !== body.screen) child.visible = false;
  });
  body.suitGroup.add(group);
  const materials = collectFadeMaterials(group);
  body.addSuitMaterials(materials);
  applyOpacity(materials, body.suitOpacity);
  body.astronautLoaded = true;
}

export function loadModels(body, { onCredit } = {}) {
  const loader = new GLTFLoader();
  const credits = new Set();

  Object.entries(MODEL_PLACEMENT).forEach(([id, config]) => {
    if (!body.parts[id]) return;
    loader.load(
      modelUrl(config.file),
      (gltf) => attachOrgan(body, id, config, gltf.scene, credits, onCredit),
      undefined,
      (error) => console.warn(`AstroMed 3D: could not load ${config.file}`, error),
    );
  });

  loader.load(
    modelUrl(ASTRONAUT_PLACEMENT.file),
    (gltf) => attachAstronaut(body, gltf.scene),
    undefined,
    (error) => console.warn(`AstroMed 3D: could not load ${ASTRONAUT_PLACEMENT.file}`, error),
  );

  return credits;
}
