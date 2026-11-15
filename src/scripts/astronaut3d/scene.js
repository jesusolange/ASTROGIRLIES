import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Group,
  HemisphereLight,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export const FOV = 30;

export function createScene(element) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
  } catch (error) {
    console.warn("3D astronaut: WebGL is not available.", error);
    return null;
  }
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const stage = document.createElement("div");
  stage.className = "a3d-stage";
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "3D body illustration. Drag or use the arrow keys to turn it. Press Enter to open the suit.",
  );
  stage.appendChild(canvas);
  element.appendChild(stage);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.05, 60);

  let environment = null;
  try {
    const pmrem = new PMREMGenerator(renderer);
    environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    pmrem.dispose();
  } catch (error) {
    console.warn("3D astronaut: no reflections.", error);
  }

  scene.add(new HemisphereLight(0xffffff, 0x445066, 0.8));
  const key = new DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 5, 5);
  scene.add(key);
  const back = new DirectionalLight(0xffffff, 0.7);
  back.position.set(-3, 4, -5);
  scene.add(back);

  const root = new Group();
  scene.add(root);

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  if (observer) observer.observe(stage);
  resize();

  function dispose() {
    if (observer) observer.disconnect();
    scene.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      const list = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
      list.forEach((material) => {
        Object.values(material).forEach((value) => value && value.isTexture && value.dispose());
        material.dispose();
      });
    });
    if (environment) environment.dispose();
    renderer.dispose();
    stage.remove();
  }

  return { renderer, scene, camera, canvas, root, resize, dispose };
}
