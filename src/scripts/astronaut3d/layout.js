// Checklist order and placement for the anatomical models.
// at: position in body units (body is 4 units tall), size: longest axis after scaling,
// axis: which model dimension `size` refers to, rot: model rotation before scaling.
export const PART_ORDER = [
  { id: "brain", label: "Brain", focusHeight: 3.5, zoom: 1.7 },
  { id: "lungs", label: "Lungs", focusHeight: 2.64, zoom: 2.1 },
  { id: "heart", label: "Heart", focusHeight: 2.58, zoom: 1.7 },
  { id: "kidneys", label: "Kidneys", focusHeight: 2.3, zoom: 1.7 },
  { id: "hand", label: "Temp & glucose", focusHeight: 2.1, zoom: 1.8 },
  { id: "bones", label: "Bones", focusHeight: 1.9, zoom: 6.4 },
  { id: "muscles", label: "Muscles", focusHeight: 1.9, zoom: 6.4 },
];

export const MODEL_PLACEMENT = {
  brain: {
    file: "brain.glb",
    at: [0, 3.55, -0.02],
    size: 0.36,
    axis: "z",
    rot: [0, Math.PI, 0],
    credit: "Human Brain by AH",
  },
  heart: {
    file: "heart.glb",
    at: [0, 0, 0],
    size: 0.28,
    axis: "y",
    rot: [0, 0, 0],
    inHeartGroup: true,
    credit: "Human Heart by TinkerLane Studio",
  },
  lungs: {
    file: "lungs.glb",
    at: [0, 2.64, 0],
    size: 0.7,
    axis: "y",
    rot: [0, 0, 0],
  },
  kidneys: {
    file: "kidneys.glb",
    at: [0, 2.3, -0.18],
    size: 0.5,
    axis: "x",
    rot: [0, 0, 0],
  },
  bones: {
    file: "skeleton.glb",
    at: [0, 1.95, -0.02],
    size: 3.7,
    axis: "y",
    rot: [0, 0, 0],
    keep: true,
  },
  muscles: {
    file: "muscles.glb",
    at: [0, 1.95, -0.02],
    size: 3.7,
    axis: "y",
    rot: [0, 0, 0],
    keep: true,
  },
};

export const ASTRONAUT_PLACEMENT = {
  file: "astronaut.glb",
  height: 4,
  at: [0, 0, 0],
};

export const HEART_GROUP_POSITION = [0.1, 2.58, 0.24];
