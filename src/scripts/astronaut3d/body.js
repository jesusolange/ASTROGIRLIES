import {
  AdditiveBlending,
  CapsuleGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Sprite,
  SpriteMaterial,
} from "three";
import { capsuleBetween, box, sphere } from "./geometry.js";
import { HEART_GROUP_POSITION, PART_ORDER } from "./layout.js";
import { PALETTE, xray } from "./materials.js";
import { buildOrgans } from "./organs.js";
import { buildSuit } from "./suit.js";
import { softDotTexture } from "./textures.js";

export function collectFadeMaterials(root) {
  const materials = [];
  root.traverse((node) => {
    if (!node.material || node.isSprite) return;
    const list = Array.isArray(node.material) ? node.material : [node.material];
    list.forEach((material) => {
      if (materials.includes(material)) return;
      material.userData.baseOpacity = material.isShaderMaterial ? 1 : material.opacity;
      material.userData.baseTransparent = material.transparent;
      materials.push(material);
    });
  });
  return materials;
}

export function applyOpacity(materials, opacity) {
  materials.forEach((material) => {
    material.transparent = opacity < 1 || material.userData.baseTransparent;
    if (material.isShaderMaterial) {
      material.uniforms.opacity.value = opacity;
    } else {
      material.opacity = material.userData.baseOpacity * opacity;
    }
  });
}

export function createBody(root) {
  const suitGroup = new Group();
  const bodyGroup = new Group();
  const heartGroup = new Group();
  heartGroup.position.set(HEART_GROUP_POSITION[0], HEART_GROUP_POSITION[1], HEART_GROUP_POSITION[2]);
  root.add(suitGroup, bodyGroup);
  bodyGroup.add(heartGroup);
  suitGroup.visible = false;
  bodyGroup.visible = false;

  const parts = {};
  PART_ORDER.forEach((part) => {
    parts[part.id] = { ...part, meshes: [], halos: [], pop: 0 };
  });
  const pickTargets = [];

  const add = (id, mesh, parent) => {
    mesh.userData.part = id;
    parts[id].meshes.push(mesh);
    pickTargets.push(mesh);
    (parent || bodyGroup).add(mesh);
    return mesh;
  };

  const hitMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const hit = (id, radius, at) => {
    const node = sphere(radius, at, hitMaterial);
    node.userData.part = id;
    pickTargets.push(node);
    bodyGroup.add(node);
    return node;
  };

  const dot = softDotTexture();
  const halo = (id, at, size) => {
    const material = new SpriteMaterial({
      map: dot,
      color: PALETTE.active,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const sprite = new Sprite(material);
    sprite.position.set(at[0], at[1], at[2]);
    sprite.scale.set(size, size, 1);
    sprite.userData.base = size;
    sprite.renderOrder = 20;
    parts[id].halos.push(sprite);
    bodyGroup.add(sprite);
    return sprite;
  };

  const skin = xray(PALETTE.xray);
  const torso = new Mesh(new CapsuleGeometry(0.34, 0.72, 12, 32), skin);
  torso.position.set(0, 2.35, 0);
  torso.scale.set(1, 1, 0.65);
  bodyGroup.add(torso);
  bodyGroup.add(sphere(0.32, [0, 3.5, 0], skin, [0.9, 1.08, 1]));
  bodyGroup.add(capsuleBetween([0, 3.05, 0], [0, 3.25, 0], 0.1, skin));
  bodyGroup.add(sphere(0.36, [0, 1.7, 0], skin, [1, 0.7, 0.75]));

  [-1, 1].forEach((side) => {
    bodyGroup.add(sphere(0.15, [side * 0.5, 2.95, 0], skin));
    bodyGroup.add(capsuleBetween([side * 0.5, 2.95, 0], [side * 0.68, 2.3, 0.03], 0.095, skin));
    bodyGroup.add(capsuleBetween([side * 0.68, 2.3, 0.03], [side * 0.78, 1.78, 0.06], 0.08, skin));
    bodyGroup.add(capsuleBetween([side * 0.2, 1.6, 0], [side * 0.23, 0.95, 0.03], 0.16, skin));
    bodyGroup.add(capsuleBetween([side * 0.23, 0.95, 0.03], [side * 0.23, 0.15, 0], 0.12, skin));
    bodyGroup.add(box(0.26, 0.12, 0.5, [side * 0.23, 0.06, 0.1], skin));
    if (side === -1) bodyGroup.add(sphere(0.09, [-0.8, 1.68, 0.06], skin));
  });

  const { screen } = buildSuit(suitGroup);
  buildOrgans({ heartGroup, add, hit, halo });

  const body = {
    suitGroup,
    bodyGroup,
    heartGroup,
    screen,
    parts,
    pickTargets,
    suitMaterials: collectFadeMaterials(suitGroup),
    bodyMaterials: collectFadeMaterials(bodyGroup),
    muscleGroup: null,
    boneGroup: null,
    bodyOpacity: 0,
    suitOpacity: 1,
    addBodyMaterials(materials) {
      materials.forEach((material) => {
        if (!body.bodyMaterials.includes(material)) body.bodyMaterials.push(material);
      });
    },
    addSuitMaterials(materials) {
      materials.forEach((material) => {
        if (!body.suitMaterials.includes(material)) body.suitMaterials.push(material);
      });
    },
  };
  return body;
}
