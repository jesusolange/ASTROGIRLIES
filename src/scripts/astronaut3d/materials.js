import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
} from "three";

export const PALETTE = {
  suit: 0xf4f6fa,
  visor: 0x9aa6ba,
  dark: 0x1d232e,
  belt: 0x2b5fb0,
  skin: 0xff6a3d,
  gold: 0xd9a441,
  glow: 0x66e0ff,
  active: 0xff2d3f,
  done: 0x2fe08a,
  xray: 0x4aa8ff,
  floor: 0x4aa0ff,
  brain: 0xc9728a,
  brainStem: 0xe6a3b4,
  lungs: 0xe8a0a8,
  lungsDeep: 0xf6e2e2,
  heart: 0xc9162f,
  artery: 0xd72b3f,
  vein: 0x3b6fd0,
  heartDark: 0xa8112a,
  valve: 0xf0b24a,
  kidney: 0x8f2a3e,
  adrenal: 0xe8c14a,
  ureter: 0xf1d36b,
  skinLight: 0xe8b79a,
  muscle: 0xb5524a,
  bone: 0xf0e8d2,
};

export function physical(color, options = {}) {
  return new MeshPhysicalMaterial({ color, roughness: 0.5, metalness: 0.05, ...options });
}

export function standard(color, options = {}) {
  return new MeshStandardMaterial({ color, roughness: 0.5, metalness: 0, ...options });
}

export function basic(options = {}) {
  return new MeshBasicMaterial(options);
}

export function xray(color) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
    uniforms: { opacity: { value: 1 }, c: { value: new Color(color) } },
    vertexShader: `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 c;
      uniform float opacity;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(vN, vV)), 2.2);
        gl_FragColor = vec4(c * (0.12 + 1.5 * f), (0.07 + 0.75 * f) * opacity);
      }`,
  });
}
