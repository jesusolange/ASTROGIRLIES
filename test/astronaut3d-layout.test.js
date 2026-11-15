import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { BufferAttribute, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  HEAD, LANDMARKS, MODELS, PART_IDS, VIEWS, frameDistance, orbitPosition, partInfo,
} from "../src/scripts/astronaut3d/layout.js";
import { placeModel } from "../src/scripts/astronaut3d/models.js";
import { bendForward } from "../src/scripts/astronaut3d/shape.js";

async function placedPoints(id) {
  const file = readFileSync(`public/assets/models/${MODELS[id].file}`);
  const data = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  const gltf = await new Promise((ok, fail) => new GLTFLoader().parse(data, "", ok, fail));
  const group = placeModel(gltf.scene, MODELS[id]);
  group.updateMatrixWorld(true);
  const points = [];
  group.traverse((node) => {
    if (!node.isMesh) return;
    const positions = node.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const point = new Vector3().fromBufferAttribute(positions, i);
      if (node.isSkinnedMesh) node.applyBoneTransform(i, point);
      points.push(point.applyMatrix4(node.matrixWorld));
    }
  });
  return points;
}

test("the trachea runs up the neck in front of the spine and the lungs fill the rib cage", async () => {
  const points = await placedPoints("lungs");
  const top = Math.max(...points.map((p) => p.y));
  const bottom = Math.min(...points.map((p) => p.y));
  assert.ok(top <= LANDMARKS.jawAngle && top > LANDMARKS.jawAngle - 0.05, "trachea ends just below the jaw angle");
  assert.ok(Math.abs(bottom - LANDMARKS.lowerRibs) < 0.05, "lung bases at the lower ribs");
  const neck = points.filter((p) => p.y > LANDMARKS.firstRib + 0.06);
  assert.ok(neck.length > 0);
  assert.ok(neck.every((p) => p.z > LANDMARKS.cervicalSpineFront), "trachea in front of the cervical spine");
  assert.ok(neck.every((p) => Math.abs(p.x - MODELS.lungs.at[0]) < 0.05), "trachea on the midline");
  const apex = points.filter((p) => Math.abs(p.x - MODELS.lungs.at[0]) > 0.1);
  const apexTop = Math.max(...apex.map((p) => p.y));
  assert.ok(apexTop > LANDMARKS.firstRib && apexTop < LANDMARKS.firstRib + 0.08, "apices just above the first rib");
  const xs = points.map((p) => p.x);
  assert.ok(Math.min(...xs) >= LANDMARKS.ribsInner[0] - 0.005 && Math.max(...xs) <= LANDMARKS.ribsInner[1] + 0.005);
});

test("bending moves only the tube, fading in along its length", () => {
  const positions = new BufferAttribute(new Float32Array([0, 1, 0, 0, 0.5, 0, 0.5, 1, 0]), 3);
  bendForward(positions, { x: 0, radius: 0.1, fade: 0.1, from: 0.4, to: 0.6, forward: 0.2 });
  assert.ok(Math.abs(positions.getZ(0) - 0.2) < 1e-6);
  assert.ok(Math.abs(positions.getZ(1) - 0.1) < 1e-6);
  assert.equal(positions.getZ(2), 0);
});

test("the public parts are the eight the checkup asks for", () => {
  assert.deepEqual(
    [...PART_IDS].sort(),
    ["body", "bones", "brain", "eyes", "heart", "kidneys", "lungs", "muscles"],
  );
  assert.equal(partInfo("body").frame, "body");
  assert.equal(partInfo("eyes").frame, "head");
  assert.equal(partInfo("hand"), null);
});

test("organs sit in anatomical order from head to abdomen", () => {
  const y = (id) => MODELS[id].at[1];
  assert.ok(y("brain") > y("lungs"));
  assert.ok(y("lungs") > y("heart"));
  assert.ok(y("heart") > y("kidneys"));
  assert.ok(MODELS.heart.at[0] > MODELS.lungs.at[0], "heart is left of the midline (+x)");
  assert.ok(MODELS.kidneys.at[2] < MODELS.heart.at[2], "kidneys are behind the heart");
  assert.ok(Math.abs(HEAD.center[1] - y("brain")) < 0.3, "the eyes frame is on the head");
});

test("a larger part is framed from further away", () => {
  const small = frameDistance([0.25, 0.25, 0.25], 30, 1, 0.4);
  const large = frameDistance([1.2, 3.7, 0.7], 30, 1, 0.85);
  assert.ok(large > small);
  assert.ok(small > 0.25);
});

test("a narrow view moves the camera back for wide parts", () => {
  const wide = [1, 0.2, 0.2];
  assert.ok(frameDistance(wide, 30, 0.5) > frameDistance(wide, 30, 2));
});

test("orbit positions face the body from the front, side and back", () => {
  const front = orbitPosition([0, 2, 0], 4, VIEWS.front);
  const side = orbitPosition([0, 2, 0], 4, VIEWS.side);
  const back = orbitPosition([0, 2, 0], 4, VIEWS.back);
  assert.ok(front[2] > 3.99 && Math.abs(front[0]) < 1e-9);
  assert.ok(side[0] > 3.99 && Math.abs(side[2]) < 1e-9);
  assert.ok(back[2] < -3.99);
  assert.equal(front[1], 2);
});
