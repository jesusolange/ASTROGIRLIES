// Body units: the skeleton stands 3.7 units tall, feet at y = 0.1, facing +z.
// The astronaut faces the viewer, so the astronaut's left is +x.
export const BODY = { floor: 0.1, height: 3.7 };

export const PARTS = [
  { id: "brain", label: "Brain", frame: "model" },
  { id: "heart", label: "Heart", frame: "model" },
  { id: "lungs", label: "Lungs", frame: "model" },
  { id: "kidneys", label: "Kidneys", frame: "model" },
  { id: "bones", label: "Bones", frame: "body" },
  { id: "muscles", label: "Muscles", frame: "body" },
  { id: "body", label: "Whole body", frame: "body" },
  { id: "eyes", label: "Eyes", frame: "head" },
];

export const PART_IDS = PARTS.map((part) => part.id);

export const VIEWS = { front: 0, side: Math.PI / 2, back: Math.PI };

// Measured on skeleton.glb: the skull spans y 3.15 to 3.8 and is centred near x 0.055; the rib cage runs
// from the clavicles (y 3.05) to the lowest front ribs (y 2.45), from the spine (z -0.35) to the sternum (z 0.24);
// the spine is near x 0.02.
// Neck and chest landmarks measured on skeleton.glb, used to place the lungs and trachea.
export const LANDMARKS = {
  jawAngle: 3.22,
  firstRib: 3.06,
  sternalAngle: 2.95,
  lowerRibs: 2.55,
  cervicalSpineFront: -0.022,
  thoracicSpineFront: -0.028,
  ribsInner: [-0.22, 0.29],
};
// Measured on lungs.glb, in its own units: trachea top y 0.508 at z 0.03, carina y 0.285 at z -0.02,
// lung apices y 0.415, bases y 0.027; the trachea runs at x -0.016 and sits too far back against the lungs.
// at: centre in body units; size: length of the model's longest side after rotation;
// rot: rotation applied to the model before measuring; spread: extra gap pushing the model's meshes apart in x;
// stretch: extra scale per axis; bend: moves the trachea forward in the file's own units (see shape.js).
export const MODELS = {
  brain: { file: "brain.glb", at: [0.055, 3.6, -0.02], size: 0.4, rot: [0, 0, 0] },
  heart: { file: "heart.glb", at: [0.08, 2.76, 0.06], size: 0.25, rot: [0, 0, 0.6] },
  lungs: {
    file: "lungs.glb",
    at: [0.035, 2.882, -0.035],
    size: 0.645,
    rot: [0, 0, 0],
    stretch: [0.8, 1, 0.82],
    bend: { x: -0.016, radius: 0.022, fade: 0.012, from: 0.22, to: 0.28, forward: 0.055 },
  },
  kidneys: { file: "kidneys.glb", at: [0.02, 2.36, -0.13], size: 0.42, rot: [0, 0, 0], spread: 0.06 },
  bones: { file: "skeleton.glb", at: [0, 1.95, 0], size: 3.7, rot: [0, 0, 0] },
  muscles: { file: "muscles.glb", at: [0, 1.95, 0], size: 3.7, rot: [0, 0, 0] },
};

export const ASTRONAUT = { file: "astronaut.glb", height: 4 };

// The head box used to frame the eyes: centred on the eyes, a little wider than the face.
export const HEAD = { center: [0.055, 3.47, 0.15], size: [0.5, 0.5, 0.5] };

export function partInfo(id) {
  return PARTS.find((part) => part.id === id) || null;
}

// Distance at which a box of the given size fills `fill` of the view, for a vertical field of view in degrees.
export function frameDistance(size, fovDegrees, aspect, fill = 0.7) {
  const half = (fovDegrees * Math.PI) / 360;
  const tall = Math.max(size[1], 0.01) / 2;
  const wide = Math.max(size[0], size[2], 0.01) / 2;
  const byHeight = tall / Math.tan(half);
  const byWidth = wide / (Math.tan(half) * Math.max(aspect, 0.1));
  const depth = Math.max(size[0], size[2]) / 2;
  return Math.max(byHeight, byWidth) / fill + depth;
}

// Camera position on a horizontal orbit around `target` at `azimuth` radians (0 = in front, facing the body).
export function orbitPosition(target, distance, azimuth, lift = 0) {
  return [
    target[0] + Math.sin(azimuth) * distance,
    target[1] + lift * distance,
    target[2] + Math.cos(azimuth) * distance,
  ];
}
