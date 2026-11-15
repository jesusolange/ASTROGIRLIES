import { Box3, Group, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ASTRONAUT, MODELS } from "./layout.js";
import { ownMaterials } from "./materials.js";

function modelUrl(file) {
  return new URL(`assets/models/${file}`, document.baseURI).href;
}

// Moves each mesh `gap` further from the model's centre line along x (the kidneys file has them touching).
function spreadMeshes(group, gap) {
  group.updateMatrixWorld(true);
  const center = new Box3().setFromObject(group).getCenter(new Vector3());
  const meshes = [];
  group.traverse((node) => {
    if (node.isMesh) meshes.push(node);
  });
  meshes.forEach((mesh) => {
    const own = new Box3().setFromObject(mesh).getCenter(new Vector3());
    const side = Math.sign(own.x - center.x);
    const from = mesh.parent.worldToLocal(own.clone());
    const to = mesh.parent.worldToLocal(own.clone().setX(own.x + side * gap));
    mesh.position.add(to.sub(from));
  });
}

// Rotates, scales so the longest side is `size`, and centres the model on `at`.
export function placeModel(scene, { at, size, rot, spread }) {
  scene.rotation.set(rot[0], rot[1], rot[2]);
  scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(scene);
  const extent = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  scene.position.sub(center);
  const group = new Group();
  group.add(scene);
  group.scale.setScalar(size / (Math.max(extent.x, extent.y, extent.z) || 1));
  group.position.set(at[0], at[1], at[2]);
  if (spread) spreadMeshes(group, spread);
  return group;
}

function placeAstronaut(scene) {
  scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(scene);
  const extent = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  scene.position.set(-center.x, -bounds.min.y, -center.z);
  const group = new Group();
  group.add(scene);
  group.scale.setScalar(ASTRONAUT.height / (extent.y || 1));
  return group;
}

// Loads every model; onPart(id, group) runs as each one arrives. Returns a cancel function.
export function loadModels({ onPart, onSuit }) {
  const loader = new GLTFLoader();
  let cancelled = false;
  const load = (file, done) => loader.load(
    modelUrl(file),
    (gltf) => {
      if (cancelled) return;
      ownMaterials(gltf.scene);
      gltf.scene.traverse((node) => {
        if (node.isMesh) node.frustumCulled = false;
      });
      done(gltf.scene);
    },
    undefined,
    (error) => console.warn(`3D astronaut: could not load ${file}`, error),
  );

  Object.entries(MODELS).forEach(([id, config]) => {
    load(config.file, (scene) => onPart(id, placeModel(scene, config)));
  });
  load(ASTRONAUT.file, (scene) => onSuit(placeAstronaut(scene)));

  return () => {
    cancelled = true;
  };
}
