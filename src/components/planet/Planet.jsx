// The destination globe on the cover: a three.js sphere textured with NASA imagery.
// Without WebGL, or when the texture cannot load, the globe area stays empty in place.
import { useEffect, useRef } from "preact/hooks";
import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { detailsFor } from "../../scripts/planet.js";
import "./planet.css";

const FOV = 30;
const CAMERA_DISTANCE = 4.2;
const TURN_SECONDS = 90;

let webglSupport = null;

function hasWebGL() {
  if (webglSupport != null) return webglSupport;
  try {
    const probe = document.createElement("canvas");
    webglSupport = Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch (error) {
    webglSupport = false;
  }
  return webglSupport;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export default function Planet({ body = "mars", class: extra = "" }) {
  const canvasRef = useRef(null);
  const details = detailsFor(body);
  const canvasClass = `am-planet-canvas ${extra}`.trim();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasWebGL()) return undefined;

    let renderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (error) {
      return undefined;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 20);
    camera.position.set(0, 0, CAMERA_DISTANCE);
    scene.add(new AmbientLight(0xffffff, 0.06));
    const sun = new DirectionalLight(0xffffff, 2.6);
    sun.position.set(-3.5, 2.2, 5);
    scene.add(sun);

    const geometry = new SphereGeometry(1, 96, 64);
    const material = new MeshStandardMaterial({ roughness: 1, metalness: 0 });
    const globe = new Mesh(geometry, material);
    globe.rotation.y = -Math.PI / 2;
    scene.add(globe);

    let texture = null;
    let frame = 0;
    let last = 0;
    let stopped = false;

    function resize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.aspect = aspect;
      camera.position.z = CAMERA_DISTANCE / Math.min(1, aspect);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }

    function tick(now) {
      if (stopped) return;
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      globe.rotation.y += (Math.PI * 2 * delta) / TURN_SECONDS;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    }

    const loader = new TextureLoader();
    loader.load(
      details.texture,
      (loaded) => {
        if (stopped) {
          loaded.dispose();
          return;
        }
        loaded.colorSpace = SRGBColorSpace;
        loaded.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        texture = loaded;
        material.map = loaded;
        material.needsUpdate = true;
        resize();
        if (!prefersReducedMotion()) frame = requestAnimationFrame(tick);
      },
      undefined,
      undefined,
    );

    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(canvas);
    resize();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
      if (texture) texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (typeof renderer.forceContextLoss === "function") renderer.forceContextLoss();
    };
  }, [details.texture]);

  return <canvas key={details.texture} class={canvasClass} ref={canvasRef} aria-hidden="true" />;
}
