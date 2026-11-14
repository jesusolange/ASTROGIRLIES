import { Float32BufferAttribute, Mesh, SphereGeometry, Vector3 } from "three";
import { capsuleBetween, latheStrand, sphere, torus, tube } from "./geometry.js";
import { PALETTE, physical } from "./materials.js";
import { noiseTexture } from "./textures.js";

export function buildOrgans({ heartGroup, add, hit, halo }) {
  buildBrain(add, hit, halo);
  buildLungs(add, hit, halo);
  buildHeart(heartGroup, add, hit, halo);
  buildKidneys(add, hit, halo);
  buildPulseMarker(add, hit, halo);
  buildMuscles(add, hit, halo);
  buildSkeleton(add, hit, halo);
}

function buildBrain(add, hit, halo) {
  const geometry = new SphereGeometry(0.22, 96, 64);
  const position = geometry.attributes.position;
  const colors = [];
  const point = new Vector3();
  for (let index = 0; index < position.count; index += 1) {
    point.fromBufferAttribute(position, index);
    const gx = point.x * 30;
    const gy = point.y * 30;
    const gz = point.z * 30;
    const fold = Math.abs(Math.sin(gx + Math.sin(gy * 0.7 + gz * 0.5) * 1.6))
      * Math.abs(Math.sin(gy * 1.1 + Math.sin(gz * 0.8) * 1.4));
    let scale = 1 + 0.075 * fold;
    if (Math.abs(point.x) < 0.012 && point.y > -0.02) {
      scale -= 0.07 * (1 - Math.abs(point.x) / 0.012);
    }
    point.multiplyScalar(scale);
    position.setXYZ(index, point.x, point.y, point.z);
    colors.push(0.55 + 0.43 * fold, 0.22 + 0.46 * fold, 0.3 + 0.46 * fold);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  const material = physical(0xffffff, {
    vertexColors: true,
    roughness: 0.5,
    clearcoat: 0.55,
    clearcoatRoughness: 0.3,
    sheen: 0.5,
  });
  const brain = new Mesh(geometry, material);
  brain.position.set(0, 3.53, 0);
  brain.scale.set(1.1, 0.85, 1.2);
  add("brain", brain);
  add("brain", sphere(0.09, [0, 3.42, -0.2], physical(PALETTE.brain, { roughness: 0.5 }), [1.5, 0.7, 0.8]));
  add("brain", capsuleBetween([0, 3.44, -0.12], [0, 3.2, -0.08], 0.035, physical(PALETTE.brainStem)));
  hit("brain", 0.36, [0, 3.53, 0]);
  halo("brain", [0, 3.53, 0.2], 0.95);
}

function buildLungs(add, hit, halo) {
  const tissue = physical(PALETTE.lungs, {
    roughness: 0.5,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    clearcoat: 0.3,
    sheen: 0.6,
  });
  const deep = physical(PALETTE.lungsDeep, { roughness: 0.5 });

  add("lungs", capsuleBetween([0, 3.08, 0], [0, 2.8, 0], 0.035, deep));

  const branch = (origin, direction, step, radius, depth, phase) => {
    const target = origin.clone().add(direction.clone().multiplyScalar(step));
    add("lungs", tube([origin.toArray(), target.toArray()], radius, deep, 4));
    if (depth <= 0) return;
    [-1, 1].forEach((side, index) => {
      const next = direction.clone();
      next.applyAxisAngle(new Vector3(0, 0, 1), side * 0.55 + phase * 0.1);
      next.applyAxisAngle(new Vector3(0, 1, 0), (index ? 0.5 : -0.5) * (1 + phase * 0.2));
      next.y -= 0.12;
      next.normalize();
      branch(target, next, step * 0.72, radius * 0.72, depth - 1, phase + side);
    });
  };

  [-1, 1].forEach((side) => {
    const geometry = new SphereGeometry(1, 48, 36);
    const position = geometry.attributes.position;
    const point = new Vector3();
    for (let index = 0; index < position.count; index += 1) {
      point.fromBufferAttribute(position, index);
      point.x *= 0.2;
      point.y *= 0.46;
      point.z *= 0.19;
      if (point.x * side < 0) point.x *= 0.6;
      if (point.y < -0.2) point.y *= 0.9;
      point.multiplyScalar(1 + 0.03 * Math.sin(point.y * 30 + point.x * 20));
      position.setXYZ(index, point.x, point.y, point.z);
    }
    const lung = new Mesh(geometry, tissue);
    lung.position.set(side * 0.25, 2.62, 0);
    lung.rotation.z = -side * 0.08;
    add("lungs", lung);
    branch(new Vector3(0, 2.8, 0), new Vector3(side * 0.5, -0.8, 0).normalize(), 0.2, 0.022, 3, 0);
    hit("lungs", 0.24, [side * 0.3, 2.7, 0.02]);
  });
  halo("lungs", [0, 2.65, 0.3], 1.35);
}

function buildHeart(heartGroup, add, hit, halo) {
  const muscle = physical(PALETTE.heart, { roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.25 });
  const artery = physical(PALETTE.artery, { roughness: 0.4, clearcoat: 0.5 });
  const vein = physical(PALETTE.vein, { roughness: 0.4, clearcoat: 0.5 });

  const core = sphere(1, [0, 0, 0], muscle, [0.15, 0.19, 0.14]);
  core.rotation.z = -0.5;
  add("heart", core, heartGroup);
  add("heart", sphere(0.075, [-0.09, 0.1, 0.02], physical(PALETTE.heartDark, { roughness: 0.4 })), heartGroup);
  add("heart", tube([[0, 0.14, 0], [0, 0.26, 0], [-0.07, 0.31, -0.03], [-0.13, 0.25, -0.06], [-0.13, 0.1, -0.09]], 0.035, artery, 24), heartGroup);
  add("heart", tube([[0.05, 0.14, 0.06], [0.07, 0.26, 0.07], [0, 0.31, 0.06]], 0.03, vein, 12), heartGroup);
  add("heart", tube([[-0.1, 0.12, 0], [-0.1, 0.32, 0.02]], 0.03, vein, 8), heartGroup);
  add("heart", tube([[0, 0.15, 0.11], [0.05, 0.04, 0.13], [0.06, -0.08, 0.1]], 0.009, physical(PALETTE.valve), 12), heartGroup);
  add("heart", tube([[-0.03, 2.7, -0.1], [-0.03, 2.2, -0.11], [-0.02, 1.75, -0.1]], 0.03, artery, 24));
  add("heart", tube([[0.05, 2.65, -0.09], [0.06, 2.2, -0.09], [0.05, 1.75, -0.09]], 0.032, vein, 24));
  hit("heart", 0.18, [0.1, 2.58, 0.3]);
  halo("heart", [0.1, 2.58, 0.46], 0.75);
}

function buildKidneys(add, hit, halo) {
  const cortex = physical(PALETTE.kidney, { roughness: 0.4, clearcoat: 0.6 });
  const adrenal = physical(PALETTE.adrenal);
  const ureter = physical(PALETTE.ureter, { roughness: 0.4 });
  const renal = physical(PALETTE.artery, { roughness: 0.4 });

  [-1, 1].forEach((side) => {
    const geometry = new SphereGeometry(1, 40, 30);
    const position = geometry.attributes.position;
    const point = new Vector3();
    for (let index = 0; index < position.count; index += 1) {
      point.fromBufferAttribute(position, index);
      point.x *= 0.08;
      point.y *= 0.15;
      point.z *= 0.07;
      if (point.x * side < 0 && Math.abs(point.y) < 0.07) point.x *= 0.45;
      position.setXYZ(index, point.x, point.y, point.z);
    }
    const kidney = new Mesh(geometry, cortex);
    kidney.position.set(side * 0.2, 2.3, -0.18);
    add("kidneys", kidney);
    add("kidneys", sphere(0.035, [side * 0.19, 2.47, -0.18], adrenal, [1, 0.6, 1]));
    add("kidneys", tube([[side * 0.17, 2.25, -0.17], [side * 0.12, 2.08, -0.1], [side * 0.08, 1.92, -0.04]], 0.011, ureter, 12));
    add("kidneys", tube([[-0.03, 2.35, -0.16], [side * 0.1, 2.33, -0.17], [side * 0.16, 2.3, -0.18]], 0.012, renal, 8));
    hit("kidneys", 0.15, [side * 0.2, 2.3, -0.14]);
  });
  halo("kidneys", [0, 2.3, 0.1], 1.05);
}

function buildPulseMarker(add, hit, halo) {
  const wrist = [0.53, 2.1, -0.06];
  add("hand", sphere(0.055, wrist, physical(0xffffff, { roughness: 0.25, clearcoat: 0.9, clearcoatRoughness: 0.15 })));
  add("hand", torus(0.07, 0.014, wrist, physical(PALETTE.glow, {
    emissive: PALETTE.glow,
    emissiveIntensity: 1.2,
    roughness: 0.3,
  })));
  hit("hand", 0.16, [0.53, 2.1, -0.02]);
  halo("hand", [0.53, 2.1, 0.12], 0.6);
}

function buildMuscles(add, hit, halo) {
  const bump = noiseTexture();
  const material = physical(PALETTE.muscle, {
    roughness: 0.5,
    bumpMap: bump,
    bumpScale: 1.2,
    clearcoat: 0.3,
  });
  [-1, 1].forEach((side) => {
    add("muscles", latheStrand([side * 0.2, 1.62, 0.02], [side * 0.23, 1, 0.04], 0.15, material));
    add("muscles", latheStrand([side * 0.23, 0.92, 0], [side * 0.23, 0.25, 0], 0.1, material));
    add("muscles", latheStrand([side * 0.52, 2.9, 0.02], [side * 0.68, 2.35, 0.04], 0.09, material));
    add("muscles", latheStrand([side * 0.68, 2.3, 0.03], [side * 0.78, 1.82, 0.06], 0.07, material));
    add("muscles", sphere(1, [side * 0.17, 2.75, 0.15], material, [0.17, 0.1, 0.06]));
    add("muscles", sphere(0.13, [side * 0.5, 2.93, 0], material, [1, 1.1, 1]));
    hit("muscles", 0.25, [side * 0.22, 1.3, 0.03]);
  });
  halo("muscles", [0, 1.3, 0.3], 1.35);
}

function buildSkeleton(add, hit, halo) {
  const bone = physical(PALETTE.bone, { roughness: 0.45, clearcoat: 0.25, sheen: 0.4 });
  const boneSoft = physical(PALETTE.bone, {
    roughness: 0.4,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });

  add("bones", sphere(0.27, [0, 3.54, -0.01], boneSoft, [0.9, 1.05, 1.05]));
  add("bones", tube([
    [-0.14, 3.36, 0.08], [-0.1, 3.28, 0.19], [0, 3.25, 0.22], [0.1, 3.28, 0.19], [0.14, 3.36, 0.08],
  ], 0.022, bone, 20));

  for (let step = 0; step < 18; step += 1) {
    const t = step / 17;
    const y = 3 - 1.25 * t;
    const z = -0.1 - 0.04 * Math.sin(t * Math.PI * 1.5);
    const radius = 0.04 + 0.025 * t;
    add("bones", sphere(radius, [0, y, z], bone, [1, 0.5, 1]));
    add("bones", capsuleBetween([0, y, z - 0.02], [0, y - 0.04, z - 0.09], 0.012, bone));
  }

  for (let rib = 0; rib < 10; rib += 1) {
    const y = 2.95 - rib * 0.11;
    const width = 0.24 + 0.1 * Math.sin(((rib + 1) / 11) * Math.PI);
    [-1, 1].forEach((side) => {
      add("bones", tube([
        [side * 0.04, y, -0.11],
        [side * width, y - 0.01, -0.07],
        [side * (width + 0.03), y - 0.04, 0.07],
        [side * (width - 0.07), y - 0.1, 0.2],
        [side * 0.04, y - 0.13, 0.22],
      ], 0.012, bone, 24));
    });
  }

  add("bones", sphere(0.06, [0, 2.72, 0.22], bone, [1, 7, 0.4]));

  [-1, 1].forEach((side) => {
    const pelvis = sphere(0.15, [side * 0.2, 1.78, 0], bone, [0.9, 0.65, 0.35]);
    pelvis.rotation.z = side * 0.4;
    add("bones", pelvis);
    add("bones", capsuleBetween([0, 3, 0.1], [side * 0.5, 2.95, 0.02], 0.025, bone));
    add("bones", capsuleBetween([side * 0.2, 1.62, 0], [side * 0.24, 0.97, 0.04], 0.028, bone));
    add("bones", sphere(0.05, [side * 0.19, 1.64, 0], bone));
    add("bones", sphere(0.055, [side * 0.24, 0.95, 0.05], bone));
    add("bones", capsuleBetween([side * 0.24, 0.93, 0.04], [side * 0.23, 0.2, 0], 0.025, bone));
    add("bones", capsuleBetween([side * 0.27, 0.93, 0.03], [side * 0.27, 0.22, 0], 0.013, bone));
    add("bones", capsuleBetween([side * 0.5, 2.93, 0], [side * 0.68, 2.32, 0.03], 0.022, bone));
    add("bones", capsuleBetween([side * 0.68, 2.3, 0.03], [side * 0.78, 1.8, 0.06], 0.016, bone));
    hit("bones", 0.2, [side * 0.24, 0.95, 0.05]);
  });

  add("bones", sphere(0.07, [0, 1.75, -0.1], bone, [1, 1.3, 0.6]));
  const pelvicRing = torus(0.22, 0.03, [0, 1.62, 0], bone);
  pelvicRing.scale.set(1, 1, 0.6);
  add("bones", pelvicRing);
  halo("bones", [0.24, 0.95, 0.25], 0.75);
  halo("bones", [-0.24, 0.95, 0.25], 0.75);
}
