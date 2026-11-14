import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  RingGeometry,
  Scene,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { PALETTE } from "./materials.js";

export function createScene(container) {
  const stage = document.createElement("div");
  stage.className = "a3d-stage";

  let renderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
  } catch (error) {
    console.warn("AstroMed 3D: WebGL unavailable, keeping the 2D astronaut.", error);
    return null;
  }

  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "button");
  canvas.setAttribute("aria-label", "3D astronaut. Press Enter to begin the daily checkup.");
  stage.appendChild(canvas);
  container.appendChild(stage);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 50);

  try {
    const pmrem = new PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  } catch (error) {
    console.warn("AstroMed 3D: no reflections", error);
  }

  scene.add(new HemisphereLight(0xdfeaff, 0x1c2b4d, 0.5));
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 5);
  scene.add(key);
  const rim = new PointLight(PALETTE.floor, 90, 0, 2);
  rim.position.set(-4, 3, -3);
  scene.add(rim);

  const root = new Group();
  scene.add(root);

  const floor = new Mesh(
    new RingGeometry(0.95, 1.08, 64),
    new MeshBasicMaterial({
      color: PALETTE.floor,
      transparent: true,
      opacity: 0.55,
      side: DoubleSide,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;
  scene.add(floor);

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  window.addEventListener("resize", resize);
  resize();

  return { renderer, scene, camera, stage, canvas, root, floor, resize };
}
