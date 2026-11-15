import { Color, FrontSide } from "three";

export function eachMaterial(root, visit) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    const list = Array.isArray(node.material) ? node.material : [node.material];
    list.forEach((material) => material && visit(material, node));
  });
}

// Every loaded model gets its own materials so glow and fading never leak between parts.
export function ownMaterials(root) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.material = Array.isArray(node.material)
      ? node.material.map((material) => material.clone())
      : node.material.clone();
  });
  eachMaterial(root, (material) => {
    material.userData.baseOpacity = material.opacity;
    material.userData.baseTransparent = material.transparent;
    material.userData.baseDepthWrite = material.depthWrite;
    material.userData.baseSide = material.side;
    if (material.color) material.userData.baseColor = material.color.clone();
    if (material.emissive) {
      material.userData.baseEmissive = material.emissive.clone();
      material.userData.baseEmissiveIntensity = material.emissiveIntensity;
    }
  });
}

export function setOpacity(root, opacity) {
  eachMaterial(root, (material) => {
    const see = opacity < 1;
    material.transparent = see || material.userData.baseTransparent;
    material.depthWrite = see ? false : material.userData.baseDepthWrite;
    material.side = see ? FrontSide : material.userData.baseSide;
    material.opacity = material.userData.baseOpacity * opacity;
  });
}

// Paints the model in one colour, or restores its own colours when color is null.
export function setTint(root, color) {
  eachMaterial(root, (material) => {
    if (!material.color) return;
    material.color.copy(color || material.userData.baseColor);
  });
}

export function setGlow(root, color, intensity) {
  eachMaterial(root, (material) => {
    if (!material.emissive) return;
    if (intensity > 0) {
      material.emissive.copy(color);
      material.emissiveIntensity = intensity;
    } else {
      material.emissive.copy(material.userData.baseEmissive || new Color(0));
      material.emissiveIntensity = material.userData.baseEmissiveIntensity ?? 1;
    }
  });
}

// Reads a colour token from the element the stage is mounted in, so the accent follows the theme.
export function tokenColor(element, name, fallback) {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  const color = new Color();
  try {
    color.setStyle(value || fallback);
  } catch {
    color.setStyle(fallback);
  }
  return color;
}
