// Body units: the skeleton stands 3.7 units tall, feet at y = 0.1, facing +z.
// The astronaut faces the viewer, so the astronaut's left is +x.
export const BODY = { floor: 0.1, height: 3.7 };

export const PARTS = [
  { id: "brain", label: "Brain", frame: "model" },
  { id: "heart", label: "Heart", frame: "model" },
  { id: "lungs", label: "Lungs", frame: "model" },
  { id: "kidneys", label: "Kidneys", frame: "model" },
  { id: "bones", label: "Bones", frame: "model" },
  { id: "muscles", label: "Muscles", frame: "model" },
  { id: "body", label: "Whole body", frame: "body" },
  { id: "eyes", label: "Eyes", frame: "head" },
];

export const PART_IDS = PARTS.map((part) => part.id);

export const VIEWS = { front: 0, side: Math.PI / 2, back: Math.PI };

// Measured on skeleton.glb: the skull spans y 3.15 to 3.8 and is centred near x 0.055; the rib cage runs
// from the clavicles (y 3.05) to the lowest front ribs (y 2.45), from the spine (z -0.35) to the sternum (z 0.24);
// the spine is near x 0.02.
// at: centre in body units; size: length of the model's longest side after rotation;
// rot: rotation applied to the model before measuring; spread: extra gap pushing the model's meshes apart in x.
export const MODELS = {
  brain: { file: "brain.glb", at: [0.055, 3.6, -0.02], size: 0.4, rot: [0, 0, 0] },
  heart: { file: "heart.glb", at: [0.08, 2.76, 0.06], size: 0.25, rot: [0, 0, 0.6] },
  lungs: { file: "lungs.glb", at: [0.02, 2.86, -0.03], size: 0.6, rot: [0, 0, 0] },
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
